"""AzerothCore SRP6 helper.

Computes salt + verifier compatible with the `acore_auth.account` table so
accounts created via the website can log into the game server.

Formula (TrinityCore/AzerothCore variant):
    h1 = SHA1(UPPER(USERNAME) + ":" + UPPER(PASSWORD))
    h2 = SHA1(salt + h1)
    x  = int.from_bytes(h2, 'little')
    verifier = pow(g, x, N).to_bytes(32, 'little', signed=False)
"""
from __future__ import annotations
import hashlib
import os

# Safe prime N and generator g from AzerothCore's SRP6 constants
_N_HEX = "894B645E89E1535BBDAD5B8B290650530801B18EBFBF5E8FAB3C82872A3E9BB7"
N = int(_N_HEX, 16)
g = 7


def make_salt() -> bytes:
    return os.urandom(32)


def make_verifier(username: str, password: str, salt: bytes) -> bytes:
    user = username.upper().encode("utf-8")
    pwd = password.upper().encode("utf-8")
    h1 = hashlib.sha1(user + b":" + pwd).digest()
    h2 = hashlib.sha1(salt + h1).digest()
    x = int.from_bytes(h2, "little")
    v = pow(g, x, N)
    return v.to_bytes(32, "little", signed=False)


def verify_password(username: str, password: str, salt: bytes, verifier: bytes) -> bool:
    return make_verifier(username, password, salt) == verifier


def build(username: str, password: str) -> tuple[bytes, bytes]:
    """Returns (salt, verifier) ready to INSERT into acore_auth.account."""
    salt = make_salt()
    return salt, make_verifier(username, password, salt)
