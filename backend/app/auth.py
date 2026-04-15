import time
import jwt
from fastapi import Header, HTTPException
from . import config


def create_token(email: str) -> str:
    payload = {"sub": email, "iat": int(time.time()), "exp": int(time.time()) + 60 * 60 * 24}
    return jwt.encode(payload, config.JWT_SECRET, algorithm=config.JWT_ALG)


def verify_token(authorization: str = Header(default="")) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, config.JWT_SECRET, algorithms=[config.JWT_ALG])
        return payload["sub"]
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
