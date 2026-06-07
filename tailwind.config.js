/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kani': {
          'green': '#39ff14',
          'dark': '#07090e',
          'gray': '#888',
          'darkgray': '#444',
          'black': '#111',
          '5': 'rgba(57, 255, 20, 0.05)',
          '10': 'rgba(57, 255, 20, 0.1)',
          '15': 'rgba(57, 255, 20, 0.15)',
          '20': 'rgba(57, 255, 20, 0.2)',
          '30': 'rgba(57, 255, 20, 0.3)',
          '40': 'rgba(57, 255, 20, 0.4)',
          '50': 'rgba(57, 255, 20, 0.5)',
          '80': 'rgba(57, 255, 20, 0.8)',
        },
        'gold': {
          '5': 'rgba(255, 209, 102, 0.05)',
          '30': 'rgba(255, 209, 102, 0.3)',
        }
      },
      boxShadow: {
        'kani-glow-sm': '0 0 10px rgba(57,255,20,0.3)',
        'kani-glow-md': '0 0 15px rgba(57,255,20,0.35)',
        'kani-glow-lg': '0 0 25px rgba(57,255,20,0.3)',
        'kani-glow-xl': '0 0 35px rgba(57,255,20,0.5)',
      },
      spacing: {
        'game-viewport': '800px',
      },
      minHeight: {
        '400': '400px',
      },
      height: {
        'game-viewport': '450px',
      },
      backgroundColor: {
        'black-40': 'rgba(0, 0, 0, 0.4)',
        'black-45': 'rgba(0, 0, 0, 0.45)',
        'black-60': 'rgba(0, 0, 0, 0.6)',
        'black-80': 'rgba(0, 0, 0, 0.8)',
        'black-85': 'rgba(0, 0, 0, 0.85)',
        'black-90': 'rgba(0, 0, 0, 0.9)',
        'zinc-900-20': 'rgba(24, 24, 27, 0.2)',
        'zinc-900-50': 'rgba(24, 24, 27, 0.5)',
        'zinc-900-60': 'rgba(24, 24, 27, 0.6)',
        'zinc-950-20': 'rgba(9, 9, 11, 0.2)',
        'zinc-950-40': 'rgba(9, 9, 11, 0.4)',
        'zinc-950-60': 'rgba(9, 9, 11, 0.6)',
        'red-950-15': 'rgba(69, 10, 10, 0.15)',
        'red-950-60': 'rgba(69, 10, 10, 0.6)',
        'yellow-500-5': 'rgba(234, 179, 8, 0.05)',
        'yellow-500-10': 'rgba(234, 179, 8, 0.1)',
        'yellow-500-20': 'rgba(234, 179, 8, 0.2)',
        'green-500-10': 'rgba(34, 197, 94, 0.1)',
        'green-700-20': 'rgba(21, 128, 61, 0.2)',
      },
      borderColor: {
        'zinc-950-40': 'rgba(9, 9, 11, 0.4)',
        'red-800-40': 'rgba(153, 27, 27, 0.4)',
        'red-550-20': 'rgba(220, 38, 38, 0.2)',
        'red-500-20': 'rgba(239, 68, 68, 0.2)',
        'red-500-40': 'rgba(239, 68, 68, 0.4)',
        'green-500-20': 'rgba(34, 197, 94, 0.2)',
        'green-800-40': 'rgba(22, 101, 52, 0.4)',
      },
      gradientColorStops: {
        'green-500-20': 'rgba(34, 197, 94, 0.2)',
      }
    },
  },
  plugins: [],
}
