export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const TOKEN_KEY = "nt_token";
const OPENAI_KEY = "nt_openai_key";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string) { localStorage.setItem(TOKEN_KEY, t); }
export function clearToken() { localStorage.removeItem(TOKEN_KEY); }

export function getOpenAIKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(OPENAI_KEY) || "";
}
export function setOpenAIKey(k: string) { localStorage.setItem(OPENAI_KEY, k); }
export function clearOpenAIKey() { localStorage.removeItem(OPENAI_KEY); }

export async function apiFetch(path: string, opts: RequestInit = {}) {
  const token = getToken();
  const openaiKey = getOpenAIKey();
  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(openaiKey ? { "X-OpenAI-Key": openaiKey } : {}),
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}
