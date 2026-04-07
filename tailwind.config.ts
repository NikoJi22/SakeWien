import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"]
      },
      colors: {
        gold: "#c4a574",
        surface: "#111111",
        canvas: "#060606",
        /** Warm light UI — menu, order, light headers (harmonious restaurant ordering) */
        brand: {
          page: "#FFD39B",
          canvas: "#ffe8c8",
          card: "#fff5e7",
          muted: "#ffe2bd",
          line: "#eac79f",
          "line-strong": "#ddae78",
          ink: "#161412",
          "ink-secondary": "#2e2b27",
          body: "#3f3b36",
          subtle: "#5c574f",
          faint: "#7a746a",
          accent: "#d99a55",
          "accent-hover": "#c9853f",
          price: "#3d3229",
          success: "#0d5c3f",
          "success-soft": "#e0efe8",
          "success-border": "#b8d4c4",
          danger: "#b42318"
        }
      },
      letterSpacing: {
        widePlus: "0.2em"
      }
    }
  },
  plugins: []
};

export default config;
