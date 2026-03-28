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
          page: "#f8f8f8",
          canvas: "#e8e2d8",
          card: "#ffffff",
          muted: "#e2dcd2",
          line: "#cfc6b8",
          "line-strong": "#b5aa9a",
          ink: "#161412",
          "ink-secondary": "#2e2b27",
          body: "#3f3b36",
          subtle: "#5c574f",
          faint: "#7a746a",
          accent: "#5c4839",
          "accent-hover": "#4d3b2f",
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
