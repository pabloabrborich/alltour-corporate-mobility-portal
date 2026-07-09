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
        navy: "#071525",
        ink: "#0f172a",
        steel: "#334155",
        mist: "#f4f7fb",
        line: "#d9e2ec",
        gold: "#c8a24a",
        ocean: "#2563eb"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(7, 21, 37, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
