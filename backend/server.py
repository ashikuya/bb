"""Kaelthas account & forum service - FastAPI port of kaelthas-service."""
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from passlib.hash import bcrypt
from pathlib import Path
from datetime import datetime, timezone
from typing import Optional, List
import os, uuid, re, logging, secrets

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Kaelthas Service")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("kaelthas")

# ── Helpers ──────────────────────────────────────────────────────────────────
SESSION_COOKIE = "kael_sid"
USERNAME_RE = re.compile(r"^[A-Za-z0-9_]{3,16}$")

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def serialize_account(acc: dict) -> dict:
    return {
        "id": acc["id"],
        "username": acc["username"],
        "email": acc["email"],
        "joinDate": acc.get("joinDate"),
        "lastLogin": acc.get("lastLogin"),
        "online": False,
        "expansion": 2,
    }

async def get_session_account(request: Request) -> Optional[dict]:
    sid = request.cookies.get(SESSION_COOKIE)
    if not sid:
        return None
    session = await db.sessions.find_one({"_id": sid})
    if not session:
        return None
    acc = await db.accounts.find_one({"id": session["accountId"]})
    return acc

async def require_account(request: Request) -> dict:
    acc = await get_session_account(request)
    if not acc:
        raise HTTPException(status_code=401, detail={"error": "Not authenticated."})
    return acc

# ── Models ───────────────────────────────────────────────────────────────────
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

# ── Auth ─────────────────────────────────────────────────────────────────────
@api.post("/register")
async def register(body: RegisterIn, response: Response):
    if not USERNAME_RE.match(body.username):
        raise HTTPException(400, detail={"error": "Username must be 3-16 letters or numbers."})
    if len(body.password) < 4 or len(body.password) > 64:
        raise HTTPException(400, detail={"error": "Password must be 4-64 characters."})
    uname = body.username.lower()
    if await db.accounts.find_one({"username": uname}):
        raise HTTPException(400, detail={"error": "Username already taken."})
    if await db.accounts.find_one({"email": body.email.lower()}):
        raise HTTPException(400, detail={"error": "Email already registered."})

    counter = await db.counters.find_one_and_update(
        {"_id": "accountId"}, {"$inc": {"seq": 1}},
        upsert=True, return_document=True,
    )
    acc_id = counter["seq"]
    acc = {
        "id": acc_id,
        "username": uname,
        "email": body.email.lower(),
        "passwordHash": bcrypt.hash(body.password),
        "joinDate": now_iso(),
        "lastLogin": None,
    }
    await db.accounts.insert_one(acc)

    sid = secrets.token_urlsafe(32)
    await db.sessions.insert_one({"_id": sid, "accountId": acc_id, "createdAt": now_iso()})
    response.set_cookie(SESSION_COOKIE, sid, httponly=True, samesite="lax", max_age=60*60*24*30)
    return {"account": serialize_account(acc)}

@api.post("/login")
async def login(body: LoginIn, response: Response):
    uname = body.username.lower()
    acc = await db.accounts.find_one({"username": uname})
    if not acc or not bcrypt.verify(body.password, acc["passwordHash"]):
        raise HTTPException(401, detail={"error": "Invalid credentials."})
    await db.accounts.update_one({"id": acc["id"]}, {"$set": {"lastLogin": now_iso()}})
    sid = secrets.token_urlsafe(32)
    await db.sessions.insert_one({"_id": sid, "accountId": acc["id"], "createdAt": now_iso()})
    response.set_cookie(SESSION_COOKIE, sid, httponly=True, samesite="lax", max_age=60*60*24*30)
    acc["lastLogin"] = now_iso()
    return {"account": serialize_account(acc)}

@api.post("/logout")
async def logout(request: Request, response: Response):
    sid = request.cookies.get(SESSION_COOKIE)
    if sid:
        await db.sessions.delete_one({"_id": sid})
    response.delete_cookie(SESSION_COOKIE)
    return {"ok": True}

@api.get("/me")
async def me(acc: dict = Depends(require_account)):
    return {"account": serialize_account(acc)}

@api.post("/account/password")
async def change_pw(body: PwChange, acc: dict = Depends(require_account)):
    if len(body.newPassword) < 4:
        raise HTTPException(400, detail={"error": "Password too short."})
    await db.accounts.update_one(
        {"id": acc["id"]}, {"$set": {"passwordHash": bcrypt.hash(body.newPassword)}}
    )
    return {"ok": True}

# ── Characters (demo data; real version queries AzerothCore characters DB) ──
@api.get("/characters")
async def characters(acc: dict = Depends(require_account)):
    chars = await db.characters.find({"accountId": acc["id"]}).to_list(50)
    if not chars:
        # demo characters for new accounts
        demo = [
            {"guid": acc["id"] * 100 + 1, "accountId": acc["id"], "name": acc["username"].title(),
             "level": 80, "race": 10, "class": 9, "gender": 0, "money": 1234567,
             "online": False, "totalPlaytime": 360000},
            {"guid": acc["id"] * 100 + 2, "accountId": acc["id"], "name": f"{acc['username'].title()}alt",
             "level": 42, "race": 1, "class": 1, "gender": 1, "money": 89012,
             "online": False, "totalPlaytime": 75000},
        ]
        await db.characters.insert_many([dict(d) for d in demo])
        chars = demo
    return {"characters": [{k: v for k, v in c.items() if k != "_id"} for c in chars]}

# ── Status / Live Stats ─────────────────────────────────────────────────────
@api.get("/status")
async def status():
    accounts = await db.accounts.count_documents({})
    characters = await db.characters.count_documents({})
    # Try AzerothCore auth DB if configured
    online = 0
    try:
        ac_host = os.environ.get("AC_AUTH_HOST")
        if ac_host:
            import aiomysql
            conn = await aiomysql.connect(
                host=ac_host,
                port=int(os.environ.get("AC_AUTH_PORT", 3306)),
                user=os.environ.get("AC_DB_USER", "acore"),
                password=os.environ.get("AC_DB_PASS", ""),
                db=os.environ.get("AC_AUTH_DB", "acore_auth"),
            )
            async with conn.cursor() as cur:
                await cur.execute("SELECT COUNT(*) FROM account WHERE online=1")
                (online,) = await cur.fetchone()
                await cur.execute("SELECT COUNT(*) FROM account")
                (accounts,) = await cur.fetchone()
            conn.close()
    except Exception as e:
        log.warning("AzerothCore stats unavailable: %s", e)

    # fall back to demo numbers if zero
    return {
        "realm": "Kaelthas",
        "expansion": "Wrath of the Lich King 3.3.5a",
        "database": "connected" if accounts else "demo",
        "registeredAccounts": accounts or 9585,
        "createdCharacters": characters or 20030,
        "playersOnline": online or 482,
    }

# ── Forum ────────────────────────────────────────────────────────────────────
DEFAULT_CATEGORIES = [
    {"slug": "announcements", "name": "Announcements", "description": "Official news and patch notes.", "icon": "⚑", "order": 1},
    {"slug": "general",       "name": "General Discussion", "description": "Talk about anything Kaelthas-related.", "icon": "✦", "order": 2},
    {"slug": "guides",        "name": "Guides & Strategy", "description": "Class guides, raid strategies, professions.", "icon": "✎", "order": 3},
    {"slug": "guilds",        "name": "Guild Recruitment", "description": "Find a guild or recruit members.", "icon": "⚔", "order": 4},
    {"slug": "support",       "name": "Help & Support", "description": "Connection issues, bug reports, questions.", "icon": "?", "order": 5},
]

async def ensure_categories():
    if await db.forum_categories.count_documents({}) == 0:
        await db.forum_categories.insert_many([{**c, "_id": c["slug"]} for c in DEFAULT_CATEGORIES])

@app.on_event("startup")
async def startup():
    await ensure_categories()

async def _category_stats(slug: str) -> dict:
    threads = await db.forum_threads.count_documents({"categorySlug": slug})
    posts = await db.forum_posts.count_documents({"categorySlug": slug})
    latest = await db.forum_threads.find_one({"categorySlug": slug}, sort=[("updatedAt", -1)])
    return {
        "threadCount": threads, "postCount": posts,
        "latestThread": latest["title"] if latest else None,
        "latestAt": latest["updatedAt"] if latest else None,
    }

@api.get("/forum/categories")
async def list_categories():
    cats = await db.forum_categories.find().sort("order", 1).to_list(50)
    out = []
    for c in cats:
        stats = await _category_stats(c["slug"])
        out.append({**{k: v for k, v in c.items() if k != "_id"}, "_id": c["slug"], **stats})
    return {"categories": out}

@api.get("/forum/categories/{slug}/threads")
async def list_threads(slug: str, page: int = 1):
    cat = await db.forum_categories.find_one({"slug": slug})
    if not cat:
        raise HTTPException(404, detail={"error": "Category not found."})
    page = max(page, 1); per = 20
    total = await db.forum_threads.count_documents({"categorySlug": slug})
    threads = await db.forum_threads.find({"categorySlug": slug}) \
        .sort([("pinned", -1), ("updatedAt", -1)]).skip((page-1)*per).limit(per).to_list(per)
    stats = await _category_stats(slug)
    return {
        "category": {**{k: v for k, v in cat.items() if k != "_id"}, "_id": slug, **stats},
        "threads": [{k: v for k, v in t.items() if k != "_id_raw"} for t in threads],
        "total": total, "pages": (total + per - 1) // per or 1,
    }

@api.post("/forum/categories/{slug}/threads")
async def create_thread(slug: str, body: ThreadIn, acc: dict = Depends(require_account)):
    cat = await db.forum_categories.find_one({"slug": slug})
    if not cat:
        raise HTTPException(404, detail={"error": "Category not found."})
    tid = str(uuid.uuid4())
    now = now_iso()
    thread = {
        "_id": tid, "categorySlug": slug, "title": body.title,
        "authorId": acc["id"], "authorName": acc["username"],
        "createdAt": now, "updatedAt": now, "views": 0,
        "pinned": False, "locked": False, "replyCount": 0,
        "lastReplyAt": now, "lastReplyAuthor": acc["username"],
    }
    post = {
        "_id": str(uuid.uuid4()), "threadId": tid, "categorySlug": slug,
        "authorId": acc["id"], "authorName": acc["username"], "authorRole": "player",
        "authorPostCount": 1, "content": body.content,
        "createdAt": now, "updatedAt": now, "edited": False,
    }
    await db.forum_threads.insert_one(thread)
    await db.forum_posts.insert_one(post)
    return {"thread": thread, "post": post}

@api.get("/forum/threads/{thread_id}")
async def get_thread(thread_id: str, page: int = 1):
    t = await db.forum_threads.find_one({"_id": thread_id})
    if not t:
        raise HTTPException(404, detail={"error": "Thread not found."})
    await db.forum_threads.update_one({"_id": thread_id}, {"$inc": {"views": 1}})
    per = 20; page = max(page, 1)
    total = await db.forum_posts.count_documents({"threadId": thread_id})
    posts = await db.forum_posts.find({"threadId": thread_id}) \
        .sort("createdAt", 1).skip((page-1)*per).limit(per).to_list(per)
    return {
        "thread": t, "posts": posts,
        "total": total, "pages": (total + per - 1) // per or 1,
    }

@api.post("/forum/threads/{thread_id}/posts")
async def reply(thread_id: str, body: PostIn, acc: dict = Depends(require_account)):
    t = await db.forum_threads.find_one({"_id": thread_id})
    if not t:
        raise HTTPException(404, detail={"error": "Thread not found."})
    if t.get("locked"):
        raise HTTPException(403, detail={"error": "Thread is locked."})
    now = now_iso()
    post = {
        "_id": str(uuid.uuid4()), "threadId": thread_id, "categorySlug": t["categorySlug"],
        "authorId": acc["id"], "authorName": acc["username"], "authorRole": "player",
        "authorPostCount": 1, "content": body.content,
        "createdAt": now, "updatedAt": now, "edited": False,
    }
    await db.forum_posts.insert_one(post)
    await db.forum_threads.update_one(
        {"_id": thread_id},
        {"$inc": {"replyCount": 1},
         "$set": {"updatedAt": now, "lastReplyAt": now, "lastReplyAuthor": acc["username"]}},
    )
    return {"post": post}

# ── Wire up ─────────────────────────────────────────────────────────────────
app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ.get("FRONTEND_ORIGIN", "*")],
    allow_credentials=True,
    allow_methods=["*"], allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown():
    client.close()
