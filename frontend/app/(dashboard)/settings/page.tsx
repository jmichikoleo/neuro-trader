"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  API_URL,
  getOpenAIKey,
  setOpenAIKey,
  clearOpenAIKey,
  clearToken,
} from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"checking" | "ok" | "down">("checking");

  useEffect(() => {
    setKey(getOpenAIKey());
    fetch(`${API_URL}/`)
      .then((r) => setBackendStatus(r.ok ? "ok" : "down"))
      .catch(() => setBackendStatus("down"));
  }, []);

  function save() {
    const v = key.trim();
    if (v) setOpenAIKey(v);
    else clearOpenAIKey();
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function logout() {
    clearToken();
    clearOpenAIKey();
    router.push("/login");
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-accent neon tracking-tight">&gt; settings</h1>
        <p className="text-muted text-xs uppercase tracking-[0.2em] mt-1">
          configuration · keys · session
        </p>
      </div>

      <Section title="openai_api_key">
        <p className="text-xs text-muted mb-3 leading-relaxed">
          stored locally in your browser only · sent as the X-OpenAI-Key header on /api/analyze ·
          never logged or persisted on the server
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-..."
            className="flex-1 bg-bg border border-accent/40 rounded px-3 py-2 text-sm text-accent placeholder:text-muted/50 focus:border-accent focus:outline-none font-mono"
          />
          <button
            onClick={save}
            className="bg-accent hover:bg-accent-dark text-bg font-bold uppercase tracking-widest text-xs px-4 rounded"
          >
            [ save ]
          </button>
          <button
            onClick={() => { setKey(""); clearOpenAIKey(); }}
            className="text-xs text-muted hover:text-accent uppercase tracking-widest border border-accent/30 rounded px-3"
          >
            clear
          </button>
        </div>
        {saved && (
          <div className="text-xs text-accent mt-2 font-mono">[ saved ✓ ]</div>
        )}
      </Section>

      <Section title="llm_model">
        <div className="text-sm font-mono text-white/80">
          gpt-4o-mini <span className="text-muted">(server-side default)</span>
        </div>
        <p className="text-xs text-muted mt-2">
          set <code className="text-accent">OPENAI_MODEL</code> in <code className="text-accent">backend/.env</code> to change this.
        </p>
      </Section>

      <Section title="backend_status">
        <div className="flex items-center gap-3">
          <span
            className={`w-2 h-2 rounded-full ${
              backendStatus === "ok"
                ? "bg-accent shadow-glow-sm animate-pulse"
                : backendStatus === "down"
                ? "bg-down"
                : "bg-muted"
            }`}
          />
          <span className="text-sm font-mono">
            {backendStatus === "ok" && "● online"}
            {backendStatus === "down" && "✕ unreachable — is uvicorn running on :8000?"}
            {backendStatus === "checking" && "… checking"}
          </span>
        </div>
        <div className="text-xs text-muted mt-2 font-mono">api_url: {API_URL}</div>
      </Section>

      <Section title="account">
        <div className="text-sm font-mono text-white/80 mb-3">demo@neurotrader.ai</div>
        <button
          onClick={logout}
          className="text-xs text-down hover:text-accent uppercase tracking-widest border border-down/40 hover:border-accent rounded px-4 py-2"
        >
          [ sign_out ]
        </button>
      </Section>

      <Section title="about">
        <p className="text-xs text-muted leading-relaxed font-mono">
          neuro-trader v0.1 · multi-agent IHSG research<br />
          inspired by tauricresearch/tradingagents · ui inspired by ihsgscreener.com<br />
          stack: fastapi + next.js + openai + yfinance
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 rounded border border-accent/30 bg-bg-card p-5">
      <div className="text-[10px] text-accent uppercase tracking-[0.3em] mb-3">&gt; {title}</div>
      {children}
    </div>
  );
}
