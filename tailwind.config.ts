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
        /** Aligns with accent gold */
        gold: "#C9A46C",
        surface: "#111111",
        canvas: "#060606",
        /**
         * SAKE brand — warm neutrals (#F6F0E7 / #FBF7F2), blau-grau #465F6B, Gold-Akzente.
         */
        brand: {
          page: "#F6F0E7",
          canvas: "#FBF7F2",
          card: "#FFFDFC",
          muted: "#E8D7BC",
          line: "#D8E1E5",
          "line-strong": "#CED8DC",
          ink: "#1F2326",
          "ink-secondary": "#666B70",
          body: "#666B70",
          subtle: "#757A7F",
          faint: "#8A9095",
          accent: "#C9A46C",
          "accent-hover": "#B8925C",
          primary: "#465F6B",
          "primary-dark": "#3A4E57",
          "primary-tint": "#E6EAED",
          "surface-hover": "#F3F6F7",
          "badge-ink": "#6B5438",
          price: "#3A4E57",
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
