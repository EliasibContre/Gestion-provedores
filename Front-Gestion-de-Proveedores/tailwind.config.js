/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        darkBlue: "#2F4156",
        midBlue: "#567C8D",
        lightBlue: "#C8D9E6",
        beige: "#F5EFEB",
        white: "#FFFFFF",
      },
    },
  },
  plugins: [],
}
