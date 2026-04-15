"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken, clearOpenAIKey } from "@/lib/api";

const nav = [
  { href: "/screener", label: "screener", icon: "▤" },
  { href: "/analyze", label: "analyze", icon: "◈" },
  { href: "/settings", label: "settings", icon: "⚙" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <aside className="w-60 bg-bg-panel border-r border-accent/30 flex flex-col">
      <div className="px-5 py-5 border-b border-accent/30 flex items-center gap-3">
        <div className="w-8 h-8 rounded border-2 border-accent flex items-center justify-center shadow-glow-sm">
          <span className="text-accent font-bold">//</span>
        </div>
        <span className="font-bold text-accent neon tracking-tight">neuro-trader</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {nav.map((n) => {
          const active = pathname?.startsWith(n.href);
          return (
            <Link
              key={n.label}
              href={n.href}
              className={`flex items-center gap-3 px-3 py-2 rounded text-sm uppercase tracking-wider transition ${
                active
                  ? "bg-accent/15 text-accent border border-accent/50 shadow-glow-sm"
                  : "text-muted hover:text-accent hover:bg-accent/5 border border-transparent"
              }`}
            >
              <span className="text-accent">{n.icon}</span>
              <span>&gt; {n.label}</span>
            </Link>
          );
        })}
      </nav>
      <button
        onClick={() => { clearToken(); clearOpenAIKey(); router.push("/login"); }}
        className="m-3 px-3 py-2 rounded text-xs text-muted hover:text-accent hover:bg-accent/5 text-left uppercase tracking-wider border border-transparent hover:border-accent/30"
      >
        [ logout ]
      </button>
    </aside>
  );
}
