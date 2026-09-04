/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1c1b1a',
        paper: '#faf8f4',
        accent: '#2f6f6a',
        accentSoft: '#e4efee',
        grid: '#3a3835',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
