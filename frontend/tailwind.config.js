/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a0f1e",
          900: "#111827",
          800: "#1f2937",
        },
      },
    },
  },
  plugins: [],
};