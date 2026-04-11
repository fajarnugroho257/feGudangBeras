/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        'opensans': ["Open Sans", 'sans-serif'],
        'poppins': ["Poppins", 'sans-serif'],
      },
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        'colorBlue': '#41C9E2',
        'colorBlueHover': '#1DDCFF',
        'colorGray': '#F5F5F5',
        'colorRed': '#C30222'
      },
    },
  },
  plugins: [],
}

