/** @type {import('tailwindcss').Config} */
import TailwindScrollbar from "tailwind-scrollbar";
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {}
  },
  plugins: [TailwindScrollbar({ nocompatible: true })]
};
