/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1c1b1a',
        paper: '#faf8f4',
        surface: '#fffefb',
        accent: '#2f6f6a',
        accentSoft: '#e4efee',
        grid: '#3a3835',
      },
      boxShadow: {
        board: '0 20px 40px -16px rgba(28,27,26,0.22), 0 2px 6px rgba(28,27,26,0.06)',
        toolbar: '0 1px 3px rgba(28,27,26,0.08)',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      keyframes: {
        cellPop: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.28)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        cellPop: 'cellPop 0.4s ease-out',
      },
    },
  },
  plugins: [],
}