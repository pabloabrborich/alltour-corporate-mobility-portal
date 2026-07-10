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
        navy: "#0B1626",
        ink: "#1A1A18",
        steel: "#5A5850",
        mist: "#FAF8F5",
        line: "rgba(26, 26, 24, 0.10)",
        gold: "#C4A96A",
        ocean: "#2A5C5C",
        teal: "#2A5C5C",
        sage: "#7A9B7A",
        "teal-hover": "#3D7A7A",
        "portal-bg-soft": "#101D2E",
        "portal-surface": "#142234",
        "portal-raised": "#18283B",
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
        soft: "0 8px 24px rgba(7, 15, 26, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
