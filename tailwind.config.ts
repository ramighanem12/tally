import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ['Inter var', 'var(--font-inter)'],
        'new-grotesk': ['var(--font-new-grotesk)'],
        'font-merriweather': ['Merriweather', 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
