/** @type {import('tailwindcss').Config} */
// NOTE: This project uses Tailwind CSS v4.
// The canonical design-system tokens are defined in src/index.css via @theme {}.
// This file is kept for tooling compatibility only.
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
