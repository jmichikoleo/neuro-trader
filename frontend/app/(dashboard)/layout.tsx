"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import ApiKeyBadge from "@/components/ApiKeyBadge";
import { getToken } from "@/lib/api";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    if (!getToken()) router.replace("/login");
  }, [router]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-accent/30 bg-bg-panel/80 backdrop-blur flex items-center justify-between px-6">
          <div className="text-xs text-muted uppercase tracking-[0.3em]">
            &gt; ihsg · indonesia_stock_exchange
          </div>
          <div className="flex items-center gap-4">
            <ApiKeyBadge />
            <div className="text-[10px] text-muted uppercase tracking-widest">demo@neurotrader.ai</div>
            <div className="w-8 h-8 rounded border border-accent/60 flex items-center justify-center text-accent text-sm font-bold shadow-glow-sm">
              D
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
