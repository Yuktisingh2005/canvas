import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        canvas: {
          bg: "#F5F5F4",
          accent: "#4F46E5",
        },
      },
    },
  },
  plugins: [],
};

export default config;