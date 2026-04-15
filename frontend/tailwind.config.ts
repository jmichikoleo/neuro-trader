import type { Config } from "tailwindcss";

// Hacker-pink palette: neon magenta on near-black, mono everywhere.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0010",   // near-black with purple tint
          panel: "#14021c",
          card: "#1c0527",
        },
        accent: {
          DEFAULT: "#ff2d95",   // neon hacker pink
          dark: "#d11776",
          glow: "#ff5ab0",
        },
        up: "#ff2d95",          // pink = gain (keep theme on-brand)
        down: "#7a2e5f",        // muted magenta = loss
        muted: "#8a6d8a",
        border: "#3d0f3a",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        sans: ["JetBrains Mono", "Fira Code", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(255, 45, 149, 0.35), 0 0 40px rgba(255, 45, 149, 0.15)",
        "glow-sm": "0 0 10px rgba(255, 45, 149, 0.4)",
      },
    },
  },
  plugins: [],
};
export default config;
