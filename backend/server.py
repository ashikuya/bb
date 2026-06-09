"""Kaelthas backend — pure MySQL (uses AzerothCore acore_auth + kaelthas_web)."""
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel, EmailStr, Field
from pathlib import Path
from typing import Optional, AsyncIterator
import os, uuid, re, logging, secrets, aiomysql

import srp6

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

app = FastAPI(title="Kaelthas Service")
api = APIRouter(prefix="/api")
log = logging.getLogger("kaelthas")
logging.basicConfig(level=logging.INFO)

SESSION_COOKIE = "kael_sid"
USERNAME_RE = re.compile(r"^[A-Za-z0-9_]{3,16}$")

MYSQL_HOST = os.environ.get("MYSQL_HOST", "127.0.0.1")
MYSQL_PORT = int(os.environ.get("MYSQL_PORT", "3306"))
MYSQL_USER = os.environ.get("MYSQL_USER", "webapp")
MYSQL_PASS = os.environ.get("MYSQL_PASS", "")
WEB_DB     = os.environ.get("WEB_DB",   "kaelthas_web")
AUTH_DB    = os.environ.get("AUTH_DB",  "acore_auth")
CHARS_DB   = os.environ.get("CHARS_DB", "acore_characters")

_pool: Optional[aiomysql.Pool] = None

async def get_pool() -> aiomysql.Pool:
    global _pool
    if _pool is None:
        _pool = await aiomysql.create_pool(
            host=MYSQL_HOST, port=MYSQL_PORT,
            user=MYSQL_USER, password=MYSQL_PASS,
            db=WEB_DB, minsize=1, maxsize=10,
            autocommit=True, charset="utf8mb4",
        )
    return _pool

async def query_one(sql: str, args: tuple = (), db: Optional[str] = None) -> Optional[dict]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.select_db(db or WEB_DB)
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute(sql, args)
            return await cur.fetchone()

async def query_all(sql: str, args: tuple = (), db: Optional[str] = None) -> list[dict]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.select_db(db or WEB_DB)
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute(sql, args)
            return list(await cur.fetchall())

async def exec_sql(sql: str, args: tuple = (), db: Optional[str] = None) -> int:
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.select_db(db or WEB_DB)
        async with conn.cursor() as cur:
            await cur.execute(sql, args)
            return cur.lastrowid

# ── Auth helpers ────────────────────────────────────────────────────────────
def serialize(acc: dict) -> dict:
    return {
        "id": acc["id"],
        "username": acc["username"].lower() if isinstance(acc["username"], str) else acc["username"],
        "email": acc.get("email") or "",
        "joinDate": str(acc.get("joindate")) if acc.get("joindate") else None,
        "lastLogin": str(acc.get("last_login")) if acc.get("last_login") else None,
        "online": bool(acc.get("online", 0)),
        "expansion": 2,
    }

async def get_session_account(request: Request) -> Optional[dict]:
    sid = request.cookies.get(SESSION_COOKIE)
    if not sid: return None
    sess = await query_one("SELECT account_id FROM sessions WHERE id=%s", (sid,))
    if not sess: return None
    return await query_one(
        "SELECT id, username, email, joindate, last_login, online "
        "FROM account WHERE id=%s", (sess["account_id"],), db=AUTH_DB,
    )

async def require_account(request: Request) -> dict:
    acc = await get_session_account(request)
    if not acc:
        raise HTTPException(401, detail={"error": "Not authenticated."})
    return acc

# ── Models ──────────────────────────────────────────────────────────────────
class RegisterIn(BaseModel):
    username: str
    email: EmailStr
    password: str

class LoginIn(BaseModel):
    username: str
    password: str

class PwChange(BaseModel):
    newPassword: str

class ThreadIn(BaseModel):
    title: str = Field(min_length=3, max_length=140)
    content: str = Field(min_length=1)

class PostIn(BaseModel):
    content: str = Field(min_length=1)

# ── Auth ────────────────────────────────────────────────────────────────────
@api.post("/register")
async def register(body: RegisterIn, response: Response):
    if not USERNAME_RE.match(body.username):
        raise HTTPException(400, detail={"error": "Username must be 3-16 letters or numbers."})
    if len(body.password) < 4 or len(body.password) > 16:
        raise HTTPException(400, detail={"error": "Password must be 4-16 characters."})

    uname = body.username.upper()
    existing = await query_one("SELECT id FROM account WHERE username=%s", (uname,), db=AUTH_DB)
    if existing:
        raise HTTPException(400, detail={"error": "Username already taken."})

    email_lc = body.email.lower()
    salt, verifier = srp6.build(uname, body.password)
    acc_id = await exec_sql(
        "INSERT INTO account (username, salt, verifier, email, reg_mail, expansion, joindate) "
        "VALUES (%s, %s, %s, %s, %s, 2, NOW())",
        (uname, salt, verifier, email_lc, email_lc), db=AUTH_DB,
    )

    sid = secrets.token_urlsafe(32)
    await exec_sql("INSERT INTO sessions (id, account_id) VALUES (%s, %s)", (sid, acc_id))
    response.set_cookie(SESSION_COOKIE, sid, httponly=True, samesite="lax", max_age=60*60*24*30)

    acc = await query_one(
        "SELECT id, username, email, joindate, last_login, online FROM account WHERE id=%s",
        (acc_id,), db=AUTH_DB,
    )
    return {"account": serialize(acc)}

@api.post("/login")
async def login(body: LoginIn, response: Response):
    uname = body.username.upper()
    acc = await query_one(
        "SELECT id, username, email, salt, verifier, joindate, last_login, online "
        "FROM account WHERE username=%s", (uname,), db=AUTH_DB,
    )
    if not acc or not srp6.verify_password(uname, body.password, acc["salt"], acc["verifier"]):
        raise HTTPException(401, detail={"error": "Invalid credentials."})

    await exec_sql("UPDATE account SET last_login=NOW() WHERE id=%s", (acc["id"],), db=AUTH_DB)

    sid = secrets.token_urlsafe(32)
    await exec_sql("INSERT INTO sessions (id, account_id) VALUES (%s, %s)", (sid, acc["id"]))
    response.set_cookie(SESSION_COOKIE, sid, httponly=True, samesite="lax", max_age=60*60*24*30)
    return {"account": serialize(acc)}

@api.post("/logout")
async def logout(request: Request, response: Response):
    sid = request.cookies.get(SESSION_COOKIE)
    if sid:
        await exec_sql("DELETE FROM sessions WHERE id=%s", (sid,))
    response.delete_cookie(SESSION_COOKIE)
    return {"ok": True}

@api.get("/me")
async def me(acc: dict = Depends(require_account)):
    return {"account": serialize(acc)}

@api.post("/account/password")
async def change_pw(body: PwChange, acc: dict = Depends(require_account)):
    if len(body.newPassword) < 4 or len(body.newPassword) > 16:
        raise HTTPException(400, detail={"error": "Password must be 4-16 characters."})
    salt, verifier = srp6.build(acc["username"], body.newPassword)
    await exec_sql(
        "UPDATE account SET salt=%s, verifier=%s WHERE id=%s",
        (salt, verifier, acc["id"]), db=AUTH_DB,
    )
    return {"ok": True}

# ── Characters (read live from acore_characters) ────────────────────────────
@api.get("/characters")
async def characters(acc: dict = Depends(require_account)):
    try:
        rows = await query_all(
            "SELECT guid, name, level, race, class, gender, money, online, totaltime "
            "FROM characters WHERE account=%s ORDER BY level DESC, name ASC LIMIT 50",
            (acc["id"],), db=CHARS_DB,
        )
        chars = [{
            "guid": r["guid"], "name": r["name"], "level": r["level"],
            "race": r["race"], "class": r["class"], "gender": r["gender"],
            "money": r["money"], "online": bool(r["online"]),
            "totalPlaytime": r["totaltime"],
        } for r in rows]
        return {"characters": chars}
    except Exception as e:
        log.warning("Characters fetch failed: %s", e)
        return {"characters": []}

# ── Status ──────────────────────────────────────────────────────────────────
@api.get("/status")
async def status():
    try:
        a = await query_one("SELECT COUNT(*) AS c FROM account", db=AUTH_DB) or {"c": 0}
        o = await query_one("SELECT COUNT(*) AS c FROM account WHERE online=1", db=AUTH_DB) or {"c": 0}
        c = await query_one("SELECT COUNT(*) AS c FROM characters", db=CHARS_DB) or {"c": 0}
        return {
            "realm": "Kaelthas",
            "expansion": "Wrath of the Lich King 3.3.5a",
            "database": "connected",
            "registeredAccounts": a["c"],
            "createdCharacters": c["c"],
            "playersOnline": o["c"],
        }
    except Exception as e:
        log.warning("Status query failed: %s", e)
        return {
            "realm": "Kaelthas",
            "expansion": "Wrath of the Lich King 3.3.5a",
            "database": "demo",
            "registeredAccounts": 9585,
            "createdCharacters": 20030,
            "playersOnline": 482,
        }

# ── Forum ───────────────────────────────────────────────────────────────────
async def _cat_stats(slug: str) -> dict:
    t = await query_one("SELECT COUNT(*) c FROM forum_threads WHERE category_slug=%s", (slug,))
    p = await query_one("SELECT COUNT(*) c FROM forum_posts WHERE category_slug=%s", (slug,))
    latest = await query_one(
        "SELECT title, updated_at FROM forum_threads WHERE category_slug=%s "
        "ORDER BY updated_at DESC LIMIT 1", (slug,),
    )
    return {
        "threadCount": (t or {}).get("c", 0),
        "postCount": (p or {}).get("c", 0),
        "latestThread": latest["title"] if latest else None,
        "latestAt": str(latest["updated_at"]) if latest else None,
    }

def _cat_to_api(c: dict, stats: dict) -> dict:
    return {
        "_id": c["slug"], "slug": c["slug"], "name": c["name"],
        "description": c["description"], "icon": c["icon"], "order": c["sort_order"],
        **stats,
    }

def _thread_to_api(t: dict) -> dict:
    return {
        "_id": t["id"], "categorySlug": t["category_slug"], "title": t["title"],
        "authorId": t["author_id"], "authorName": t["author_name"],
        "createdAt": str(t["created_at"]), "updatedAt": str(t["updated_at"]),
        "views": t["views"], "pinned": bool(t["pinned"]), "locked": bool(t["locked"]),
        "replyCount": t["reply_count"],
        "lastReplyAt": str(t["last_reply_at"]),
        "lastReplyAuthor": t["last_reply_by"],
    }

def _post_to_api(p: dict) -> dict:
    return {
        "_id": p["id"], "threadId": p["thread_id"],
        "authorId": p["author_id"], "authorName": p["author_name"],
        "authorRole": p["author_role"], "authorPostCount": 1,
        "content": p["content"], "createdAt": str(p["created_at"]),
        "updatedAt": str(p["created_at"]), "edited": bool(p["edited"]),
    }

@api.get("/forum/categories")
async def list_categories():
    cats = await query_all("SELECT * FROM forum_categories ORDER BY sort_order")
    out = []
    for c in cats:
        out.append(_cat_to_api(c, await _cat_stats(c["slug"])))
    return {"categories": out}

@api.get("/forum/categories/{slug}/threads")
async def list_threads(slug: str, page: int = 1):
    cat = await query_one("SELECT * FROM forum_categories WHERE slug=%s", (slug,))
    if not cat:
        raise HTTPException(404, detail={"error": "Category not found."})
    per = 20; page = max(page, 1)
    total = (await query_one(
        "SELECT COUNT(*) c FROM forum_threads WHERE category_slug=%s", (slug,)
    ))["c"]
    threads = await query_all(
        "SELECT * FROM forum_threads WHERE category_slug=%s "
        "ORDER BY pinned DESC, updated_at DESC LIMIT %s OFFSET %s",
        (slug, per, (page - 1) * per),
    )
    return {
        "category": _cat_to_api(cat, await _cat_stats(slug)),
        "threads": [_thread_to_api(t) for t in threads],
        "total": total, "pages": (total + per - 1) // per or 1,
    }

@api.post("/forum/categories/{slug}/threads")
async def create_thread(slug: str, body: ThreadIn, acc: dict = Depends(require_account)):
    cat = await query_one("SELECT slug FROM forum_categories WHERE slug=%s", (slug,))
    if not cat:
        raise HTTPException(404, detail={"error": "Category not found."})
    tid, pid = str(uuid.uuid4()), str(uuid.uuid4())
    uname = acc["username"].lower()
    await exec_sql(
        "INSERT INTO forum_threads (id, category_slug, title, author_id, author_name, "
        "reply_count, last_reply_by) VALUES (%s, %s, %s, %s, %s, 0, %s)",
        (tid, slug, body.title, acc["id"], uname, uname),
    )
    await exec_sql(
        "INSERT INTO forum_posts (id, thread_id, category_slug, author_id, author_name, content) "
        "VALUES (%s, %s, %s, %s, %s, %s)",
        (pid, tid, slug, acc["id"], uname, body.content),
    )
    t = await query_one("SELECT * FROM forum_threads WHERE id=%s", (tid,))
    p = await query_one("SELECT * FROM forum_posts WHERE id=%s", (pid,))
    return {"thread": _thread_to_api(t), "post": _post_to_api(p)}

@api.get("/forum/threads/{thread_id}")
async def get_thread(thread_id: str, page: int = 1):
    t = await query_one("SELECT * FROM forum_threads WHERE id=%s", (thread_id,))
    if not t:
        raise HTTPException(404, detail={"error": "Thread not found."})
    await exec_sql("UPDATE forum_threads SET views=views+1 WHERE id=%s", (thread_id,))
    per = 20; page = max(page, 1)
    total = (await query_one(
        "SELECT COUNT(*) c FROM forum_posts WHERE thread_id=%s", (thread_id,)
    ))["c"]
    posts = await query_all(
        "SELECT * FROM forum_posts WHERE thread_id=%s ORDER BY created_at ASC LIMIT %s OFFSET %s",
        (thread_id, per, (page - 1) * per),
    )
    return {
        "thread": _thread_to_api(t),
        "posts": [_post_to_api(p) for p in posts],
        "total": total, "pages": (total + per - 1) // per or 1,
    }

@api.post("/forum/threads/{thread_id}/posts")
async def reply(thread_id: str, body: PostIn, acc: dict = Depends(require_account)):
    t = await query_one("SELECT id, locked, category_slug FROM forum_threads WHERE id=%s", (thread_id,))
    if not t:
        raise HTTPException(404, detail={"error": "Thread not found."})
    if t["locked"]:
        raise HTTPException(403, detail={"error": "Thread is locked."})
    pid = str(uuid.uuid4())
    uname = acc["username"].lower()
    await exec_sql(
        "INSERT INTO forum_posts (id, thread_id, category_slug, author_id, author_name, content) "
        "VALUES (%s, %s, %s, %s, %s, %s)",
        (pid, thread_id, t["category_slug"], acc["id"], uname, body.content),
    )
    await exec_sql(
        "UPDATE forum_threads SET reply_count=reply_count+1, last_reply_at=NOW(), last_reply_by=%s "
        "WHERE id=%s", (uname, thread_id),
    )
    p = await query_one("SELECT * FROM forum_posts WHERE id=%s", (pid,))
    return {"post": _post_to_api(p)}

# ── Lifecycle ───────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    try:
        await get_pool()
        log.info("MySQL pool ready: %s@%s/%s", MYSQL_USER, MYSQL_HOST, WEB_DB)
    except Exception as e:
        log.warning("MySQL not reachable on startup: %s (will retry on first request)", e)

@app.on_event("shutdown")
async def shutdown():
    global _pool
    if _pool:
        _pool.close()
        await _pool.wait_closed()

app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("FRONTEND_ORIGIN", "*")],
    allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)
