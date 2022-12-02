/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      scale: {
        '250': '2.50',
        '350': '3.50',
      }
    },
  },
  plugins: [require("daisyui")],
}
