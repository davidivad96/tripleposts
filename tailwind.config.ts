import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "selector",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px) translateX(-50%)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) translateX(-50%)",
          },
        },
        "fade-out": {
          "0%": {
            opacity: "1",
            transform: "translateY(0) translateX(-50%)",
          },
          "100%": {
            opacity: "0",
            transform: "translateY(-10px) translateX(-50%)",
          },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out forwards",
        "fade-out": "fade-out 0.5s ease-in forwards",
      },
    },
  },
  plugins: [],
};

export default config;
