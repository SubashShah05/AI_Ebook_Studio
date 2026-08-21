
/** @type {import('tailwindcss').Config} */
export default {
  // 1. ADD THIS LINE RIGHT HERE:
  darkMode: 'class', 
  
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'border-spin': 'border-spin 4s linear infinite',
      },
      keyframes: {
        'border-spin': {
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}