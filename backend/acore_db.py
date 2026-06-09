"""AzerothCore MySQL integration.

When AC_AUTH_HOST is set in the .env, the backend talks directly to the
AzerothCore `acore_auth` and `acore_characters` databases so that:

  - /api/register writes to acore_auth.account (with real SRP6 salt+verifier)
  - /api/login verifies against acore_auth.account
  - /api/account/password updates salt+verifier in acore_auth.account
  - /api/characters reads acore_characters.characters
  - /api/status reads live counts from acore_auth

If AC_AUTH_HOST is unset, the backend falls back to MongoDB-only (demo mode).
"""
from __future__ import annotations
import os
from typing import Optional
import aiomysql

AC_HOST = os.environ.get("AC_AUTH_HOST")
AC_PORT = int(os.environ.get("AC_AUTH_PORT", "3306"))
AC_USER = os.environ.get("AC_DB_USER", "acore")
AC_PASS = os.environ.get("AC_DB_PASS", "acore")
AC_AUTH_DB = os.environ.get("AC_AUTH_DB", "acore_auth")
AC_CHARS_DB = os.environ.get("AC_CHARS_DB", "acore_characters")


def enabled() -> bool:
    return bool(AC_HOST)


async def _connect(db: str):
    return await aiomysql.connect(
        host=AC_HOST, port=AC_PORT, user=AC_USER, password=AC_PASS, db=db,
        autocommit=True, charset="utf8mb4",
    )


async def find_account(username: str) -> Optional[dict]:
    conn = await _connect(AC_AUTH_DB)
    try:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute(
                "SELECT id, username, email, salt, verifier, joindate, last_login, online "
                "FROM account WHERE username=%s LIMIT 1",
                (username.upper(),),
            )
            return await cur.fetchone()
    finally:
        conn.close()


async def find_account_by_id(account_id: int) -> Optional[dict]:
    conn = await _connect(AC_AUTH_DB)
    try:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute(
                "SELECT id, username, email, joindate, last_login, online "
                "FROM account WHERE id=%s LIMIT 1",
                (account_id,),
            )
            return await cur.fetchone()
    finally:
        conn.close()


async def create_account(username: str, email: str, salt: bytes, verifier: bytes) -> int:
    conn = await _connect(AC_AUTH_DB)
    try:
        async with conn.cursor() as cur:
            await cur.execute(
                "INSERT INTO account (username, salt, verifier, email, reg_mail, expansion, joindate) "
                "VALUES (%s, %s, %s, %s, %s, 2, NOW())",
                (username.upper(), salt, verifier, email, email),
            )
            return cur.lastrowid
    finally:
        conn.close()


async def update_password(account_id: int, salt: bytes, verifier: bytes) -> None:
    conn = await _connect(AC_AUTH_DB)
    try:
        async with conn.cursor() as cur:
            await cur.execute(
                "UPDATE account SET salt=%s, verifier=%s WHERE id=%s",
                (salt, verifier, account_id),
            )
    finally:
        conn.close()


async def touch_login(account_id: int) -> None:
    conn = await _connect(AC_AUTH_DB)
    try:
        async with conn.cursor() as cur:
            await cur.execute("UPDATE account SET last_login=NOW() WHERE id=%s", (account_id,))
    finally:
        conn.close()


async def stats() -> dict:
    conn = await _connect(AC_AUTH_DB)
    try:
        async with conn.cursor() as cur:
            await cur.execute("SELECT COUNT(*) FROM account")
            (accounts,) = await cur.fetchone()
            await cur.execute("SELECT COUNT(*) FROM account WHERE online=1")
            (online,) = await cur.fetchone()
    finally:
        conn.close()
    conn = await _connect(AC_CHARS_DB)
    try:
        async with conn.cursor() as cur:
            await cur.execute("SELECT COUNT(*) FROM characters")
            (characters,) = await cur.fetchone()
    finally:
        conn.close()
    return {"accounts": accounts, "online": online, "characters": characters}


async def list_characters(account_id: int) -> list[dict]:
    conn = await _connect(AC_CHARS_DB)
    try:
        async with conn.cursor(aiomysql.DictCursor) as cur:
            await cur.execute(
                "SELECT guid, name, level, race, class, gender, money, online, totaltime "
                "FROM characters WHERE account=%s ORDER BY level DESC, name ASC LIMIT 50",
                (account_id,),
            )
            rows = await cur.fetchall()
    finally:
        conn.close()
    return [
        {
            "guid": r["guid"], "name": r["name"], "level": r["level"],
            "race": r["race"], "class": r["class"], "gender": r["gender"],
            "money": r["money"], "online": bool(r["online"]),
            "totalPlaytime": r["totaltime"],
        } for r in rows
    ]
