from contextvars import ContextVar
from fastapi import Header

current_key: ContextVar[str] = ContextVar("current_key", default="")


def openai_key_from_header(x_openai_key: str = Header(default="")) -> str:
    """FastAPI dependency: reads X-OpenAI-Key header and stashes it in a contextvar
    so BaseAgent.chat() can pick it up without threading it through every call."""
    current_key.set(x_openai_key or "")
    return x_openai_key or ""
