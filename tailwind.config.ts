import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#EA580C", // Tangerine Flame / Terracotta
          "primary-hover": "#C2410C", // Burnt Sienna
          secondary: "#14281D", // Deep Obsidian Green
          accent: "#F59E0B", // Saffron Gold
          canvas: "#FDFBF7", // Warm Oat / Cream
          surface: "#FFFFFF", // Pure White
          muted: "#F3EFE6", // Soft Sand
          charcoal: "#18181B", // Rich Charcoal
          slate: "#64748B", // Warm Slate
          stone: "#E2E8F0", // Light Stone
        },
      },
      fontFamily: {
        display: ["Playfair Display", "Fraunces", "Georgia", "serif"],
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        pill: "9999px",
        card: "24px",
        section: "32px",
      },
      boxShadow: {
        float: "0 20px 40px -15px rgba(24, 24, 27, 0.08)",
        cta: "0 10px 25px -5px rgba(234, 88, 12, 0.35)",
        card: "0 10px 30px -5px rgba(24, 24, 27, 0.05)",
        "card-hover": "0 20px 35px -5px rgba(234, 88, 12, 0.12)",
      },
      aspectRatio: {
        "4/3": "4 / 3",
      },
    },
  },
  plugins: [],
};
export default config;
