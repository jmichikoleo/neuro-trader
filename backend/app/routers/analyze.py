from fastapi import APIRouter, Depends, Header
from pydantic import BaseModel
from ..auth import verify_token
from ..llm_ctx import current_key
from ..agents.pipeline import run_pipeline

router = APIRouter()


class AnalyzeRequest(BaseModel):
    symbol: str


@router.post("")
def analyze(
    req: AnalyzeRequest,
    _user: str = Depends(verify_token),
    x_openai_key: str = Header(default=""),
):
    # Set the contextvar HERE, inside the endpoint thread, so it stays alive
    # for the duration of run_pipeline. (Setting it inside a Depends() runs in a
    # separate sub-context that gets unwound before the endpoint executes.)
    token = current_key.set(x_openai_key or "")
    try:
        symbol = req.symbol.upper()
        if not symbol.endswith(".JK"):
            symbol = symbol + ".JK"
        return run_pipeline(symbol)
    finally:
        current_key.reset(token)
