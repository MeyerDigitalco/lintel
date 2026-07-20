import type { Config } from "tailwindcss";

/**
 * Two palettes on purpose.
 *
 * The APP palette (ink/evergreen/paper/slate/hairline) dresses the logged-in
 * dashboard and is deliberately cool and quiet. Do not restyle it casually;
 * it is used in roughly a thousand places.
 *
 * The EDITORIAL palette (char/clay/bone/sepia/umber) dresses the public
 * marketing site. It exists because the cool-grey + Inter + blue-500 recipe is
 * what every AI site builder emits, so we and our competitors converged on the
 * identical look. Warm paper, a serif display face and an oxblood accent are
 * the three things that recipe never produces.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // App palette (dashboard).
        ink: "#0E141F",
        evergreen: "#16233A",
        paper: "#F6F8FB",
        surface: "#FFFFFF",
        slate: "#2B3340",
        hairline: "#E2E7EF",
        amber: "#E0A53D",
        red: "#D9534F",
        /**
         * Success / positive. Was `mint` but set to #3B82F6, which is Tailwind's
         * blue-500: every "green" RAG badge, paid invoice and valid certificate
         * was rendering blue. Now an actual green.
         */
        moss: "#3D6B4F",

        // Editorial palette (public marketing site).
        char: "#14130F",   // warm near-black, display text
        clay: "#8A3324",   // oxblood accent
        bone: "#FAF8F3",   // warm paper
        sepia: "#E3DDD0",  // warm hairline
        umber: "#4A4842",  // warm secondary text
      },
      fontFamily: {
        // Marketing display face. A serif is the single biggest departure from
        // the stock look, and it suits a product that produces legal documents.
        display: ["var(--font-display-serif)", "Newsreader", "Georgia", "serif"],
        heading: ["var(--font-inter-tight)", "Inter Tight", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lintel: "12px", // app
        edge: "4px",    // marketing: sharp reads editorial, 12px reads bootstrap
      },
      borderColor: {
        DEFAULT: "#E2E7EF",
      },
      fontSize: {
        display: ["3.25rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
      },
      boxShadow: {
        card: "0 1px 2px rgba(20, 24, 31, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
