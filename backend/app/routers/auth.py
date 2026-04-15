from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .. import config
from ..auth import create_token

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    token: str
    email: str


@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest):
    if req.email != config.DEMO_EMAIL or req.password != config.DEMO_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return LoginResponse(token=create_token(req.email), email=req.email)
