"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL, setToken, getOpenAIKey, setOpenAIKey } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@neurotrader.ai");
  const [password, setPassword] = useState("demo1234");
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setApiKey(getOpenAIKey()); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      let res: Response;
      try {
        res = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
      } catch (netErr) {
        throw new Error(`BACKEND_UNREACHABLE @ ${API_URL} — is uvicorn running on :8000?`);
      }
      if (!res.ok) throw new Error(res.status === 401 ? "ACCESS DENIED" : `HTTP_${res.status}`);
      const data = await res.json();
      setToken(data.token);
      setOpenAIKey(apiKey.trim());
      router.push("/screener");
    } catch (err: any) {
      setError(err.message || "LOGIN FAILED");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 relative overflow-hidden">
      {/* corner glow */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/15 rounded-full blur-[150px]" />

      <div className="w-full max-w-md relative">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded border-2 border-accent flex items-center justify-center mb-4 shadow-glow">
            <span className="text-accent font-bold text-2xl neon">//</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-accent neon">neuro-trader</h1>
          <p className="text-muted text-xs mt-2 uppercase tracking-[0.3em]">
            &gt; multi-agent_ihsg_terminal
          </p>
        </div>

        <div className="bg-bg-card/80 backdrop-blur border border-accent/40 rounded-md p-7 shadow-glow">
          <div className="flex items-center gap-2 mb-6 text-xs text-accent/70 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span>secure_channel · authenticate</span>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <Field label="user@email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                required
              />
            </Field>
            <Field label="password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
                required
              />
            </Field>
            <Field label="openai_api_key · optional">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className={inputCls}
              />
              <p className="text-[10px] text-muted mt-1.5 leading-relaxed">
                &gt; stored in your browser only · sent as X-OpenAI-Key header · never hits our db
              </p>
            </Field>

            {error && (
              <div className="text-accent text-sm border border-accent/50 bg-accent/10 px-3 py-2 rounded">
                ! {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent-dark text-bg font-bold uppercase tracking-[0.2em] text-sm py-3 rounded transition shadow-glow-sm disabled:opacity-40"
            >
              {loading ? "[ authenticating... ]" : "[ jack_in ]"}
            </button>
          </form>
          <p className="text-[10px] text-muted mt-6 text-center uppercase tracking-widest">
            v0.1 · demo_creds_prefilled
          </p>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full bg-bg border border-accent/30 rounded px-3 py-2.5 text-sm text-accent placeholder:text-muted/50 focus:border-accent focus:shadow-glow-sm focus:outline-none caret-accent";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] text-accent/70 mb-1.5 uppercase tracking-[0.2em]">
        &gt; {label}
      </label>
      {children}
    </div>
  );
}
