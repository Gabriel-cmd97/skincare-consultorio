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
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          50: '#fcf8f7',
          100: '#f8efed',
          200: '#f1ded9',
          300: '#e5c3bb',
          400: '#d5a195',
          500: '#b87c6f', // Rosa palo / Nude principal
          600: '#9d6357',
          700: '#7f4e45',
          800: '#643e37',
          900: '#4d302a',
        }
      },
    },
  },
  plugins: [],
};
export default config;
