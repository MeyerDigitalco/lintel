import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0E141F",
        evergreen: "#16233A",
        mint: "#3B82F6",
        paper: "#F6F8FB",
        surface: "#FFFFFF",
        slate: "#5A6573",
        hairline: "#E2E7EF",
        amber: "#E0A53D",
        red: "#D9534F",
      },
      fontFamily: {
        // Headings: Inter Tight (tight tracking, weight 500-600)
        heading: ["var(--font-inter-tight)", "Inter Tight", "system-ui", "sans-serif"],
        // Body: Inter, tabular-nums for figures
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lintel: "12px",
      },
      borderColor: {
        DEFAULT: "#E2E7EF",
      },
      fontSize: {
        // tightened display sizes
        display: ["3.25rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
      },
      boxShadow: {
        // flat surfaces; reserve a barely-there lift for floating cards only
        card: "0 1px 2px rgba(20, 24, 31, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
