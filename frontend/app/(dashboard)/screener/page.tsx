"use client";
import { useEffect, useState } from "react";
import TickerTable from "@/components/TickerTable";
import StockDetailModal from "@/components/StockDetailModal";
import { apiFetch } from "@/lib/api";

export default function ScreenerPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    apiFetch("/api/screener")
      .then((d) => setRows(d.rows))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-accent neon tracking-tight">&gt; screener</h1>
          <p className="text-muted text-xs uppercase tracking-[0.2em] mt-1">
            top_ihsg_constituents · click_a_row for chart + details
          </p>
        </div>
      </div>
      {loading && <div className="text-accent/70 text-sm font-mono">[ loading_quotes... ]</div>}
      {err && <div className="text-down text-sm font-mono">[ error: {err} ]</div>}
      {!loading && !err && <TickerTable rows={rows} onPick={(s) => setPicked(s)} />}

      <StockDetailModal symbol={picked} onClose={() => setPicked(null)} />
    </div>
  );
}
