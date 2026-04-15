import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "neuro-trader",
  description: "Multi-agent IHSG research",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-white font-sans antialiased">{children}</body>
    </html>
  );
}
