from __future__ import annotations
from typing import Any, Dict
from openai import OpenAI
from .. import config
from ..llm_ctx import current_key


class BaseAgent:
    name: str = "BaseAgent"
    role: str = "analyst"
    system_prompt: str = "You are a helpful financial analyst."

    def _api_key(self) -> str:
        # Prefer user-supplied key from the request header; fall back to server env.
        return current_key.get() or config.OPENAI_API_KEY

    def chat(self, user_msg: str) -> str:
        key = self._api_key()
        if not key:
            return (
                f"[offline stub — {self.name}] No OpenAI API key supplied. "
                "Enter your key in the UI (top-right) or set OPENAI_API_KEY on the server.\n\n"
                + user_msg[:300]
            )
        try:
            client = OpenAI(api_key=key)
            resp = client.chat.completions.create(
                model=config.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": user_msg},
                ],
                temperature=0.4,
            )
            return resp.choices[0].message.content or ""
        except Exception as e:
            return f"[LLM error: {e}]"

    def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        raise NotImplementedError
