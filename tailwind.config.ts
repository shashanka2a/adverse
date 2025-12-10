import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        "film-black": "#050505",
        "celluloid-cream": "#F2E8D5",
        "red-carpet": "#D91E36",
        "silver-screen": "#E0E0E0",
        charcoal: "#1A1A1A"
      },
      fontFamily: {
        display: ["var(--font-playfair)"],
        mono: ["var(--font-courier)"],
        oswald: ["var(--font-oswald)"]
      },
      keyframes: {
        scrollY: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-100%)" }
        }
      },
      animation: {
        scrollY: "scrollY 20s linear infinite"
      },
      cursor: {
        none: "none"
      }
    }
  },
  plugins: []
};

export default config;

