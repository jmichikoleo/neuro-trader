"use client";
import { useEffect, useState } from "react";
import { getOpenAIKey, setOpenAIKey, clearOpenAIKey } from "@/lib/api";

export default function ApiKeyBadge() {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  const [has, setHas] = useState(false);

  useEffect(() => {
    const k = getOpenAIKey();
    setKey(k);
    setHas(!!k);
  }, []);

  function save() {
    const v = key.trim();
    if (v) { setOpenAIKey(v); setHas(true); }
    else { clearOpenAIKey(); setHas(false); }
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`text-[10px] uppercase tracking-wider px-3 py-1.5 rounded border transition ${
          has
            ? "border-accent/60 text-accent bg-accent/10 shadow-glow-sm"
            : "border-accent/30 text-muted hover:text-accent hover:border-accent/60"
        }`}
      >
        {has ? "● openai_key: set" : "○ openai_key: none"}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-bg-card border border-accent/50 rounded p-4 shadow-glow z-50">
          <div className="text-[10px] text-accent/70 uppercase tracking-widest mb-2">
            &gt; enter your openai api key
          </div>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="sk-..."
            className="w-full bg-bg border border-accent/30 rounded px-3 py-2 text-sm text-accent placeholder:text-muted/50 focus:border-accent focus:outline-none mb-2"
          />
          <p className="text-[10px] text-muted mb-3 leading-relaxed">
            stored locally in your browser · sent only as X-OpenAI-Key on analyze requests · never logged
          </p>
          <div className="flex gap-2">
            <button
              onClick={save}
              className="flex-1 bg-accent hover:bg-accent-dark text-bg font-bold text-xs uppercase tracking-wider py-2 rounded"
            >
              [ save ]
            </button>
            <button
              onClick={() => { setKey(""); clearOpenAIKey(); setHas(false); setOpen(false); }}
              className="px-3 text-xs text-muted hover:text-accent uppercase tracking-wider border border-accent/30 rounded"
            >
              clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
