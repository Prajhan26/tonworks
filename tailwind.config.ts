import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b1020",
        paper: "#f6f1e8",
        ember: "#ff6b35",
        teal: "#2dd4bf",
      },
      boxShadow: {
        glow: "0 20px 80px rgba(45, 212, 191, 0.18)",
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at 20% 20%, rgba(255,107,53,0.18), transparent 0 18%), radial-gradient(circle at 80% 0%, rgba(45,212,191,0.16), transparent 0 24%), linear-gradient(180deg, rgba(11,16,32,1) 0%, rgba(13,18,38,1) 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
