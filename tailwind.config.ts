import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: "#111A17",
        ink: "#1A1A18",
        steel: "#5A5850",
        mist: "#FAF8F5",
        line: "rgba(26, 26, 24, 0.10)",
        gold: "#BFA76A",
        ocean: "#315C56",
        teal: "#315C56",
        sage: "#7F927C",
        "teal-hover": "#406A62",
        "portal-bg-soft": "#16231F",
        "portal-surface": "#1A2A24",
        "portal-raised": "#20332B",
        "warm-secondary": "#F0EDE8"
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "Arial", "Helvetica", "sans-serif"],
        display: ["var(--font-cormorant)", "Georgia", "serif"]
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem"
      },
      boxShadow: {
        soft: "0 8px 24px rgba(17, 26, 23, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
