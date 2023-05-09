
import TailwindScrollbar from "tailwind-scrollbar";
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {}
  },
  plugins: [TailwindScrollbar({ nocompatible: true })]
};
