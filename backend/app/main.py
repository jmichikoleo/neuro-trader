from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import auth as auth_router
from .routers import screener as screener_router
from .routers import analyze as analyze_router

app = FastAPI(title="neuro-trader API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*", "X-OpenAI-Key"],
)

app.include_router(auth_router.router, prefix="/api/auth", tags=["auth"])
app.include_router(screener_router.router, prefix="/api/screener", tags=["screener"])
app.include_router(analyze_router.router, prefix="/api/analyze", tags=["analyze"])


@app.get("/")
def root():
    return {"name": "neuro-trader", "status": "ok"}
