# neuro-trader

Multi-agent trading research for Indonesian equities (IHSG), inspired by
[TauricResearch/TradingAgents](https://github.com/TauricResearch/TradingAgents), with a
web UI styled after [ihsgscreener.com](https://ihsgscreener.com).

## Stack
- **Backend**: FastAPI + yfinance + OpenAI (agents pipeline)
- **Frontend**: Next.js 14 (App Router) + Tailwind
- **LLM**: OpenAI (`gpt-4o-mini` by default — configurable)

## Agents
Sequential pipeline (port of TradingAgents, trimmed):

1. **Market Analyst** — technicals (RSI, MACD, SMA50/200)
2. **Fundamentals Analyst** — PE, PBV, ROE, debt/equity
3. **News Analyst** — headline sentiment
4. **Bull Researcher** vs **Bear Researcher** — one-round debate
5. **Trader** — synthesizes → `{action, confidence, rationale}`

## Run (one command)

First-time setup:
```bash
npm run setup        # creates backend venv, installs pip + npm deps
```

Then every time:
```bash
npm install          # once, to get concurrently at the root
npm run dev          # starts backend (:8000) AND frontend (:3000) together
```

- Frontend → http://localhost:3000
- Backend docs → http://localhost:8000/docs
- `Ctrl+C` stops both.

### Run them separately (optional)
```bash
npm run dev:backend  # uvicorn only
npm run dev:frontend # next dev only
```

## Demo credentials
```
email:    demo@neurotrader.ai
password: demo1234
```

## Notes
- Demo-grade auth (single hardcoded user, JWT stored in localStorage). Not for production.
- If `OPENAI_API_KEY` is unset, agents return offline stubs so the pipeline still runs.
- Tickers use `.JK` suffix (e.g. `BBCA.JK`, `TLKM.JK`).
