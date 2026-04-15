import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_ALG = "HS256"
DEMO_EMAIL = os.getenv("DEMO_EMAIL", "demo@neurotrader.ai")
DEMO_PASSWORD = os.getenv("DEMO_PASSWORD", "demo1234")
