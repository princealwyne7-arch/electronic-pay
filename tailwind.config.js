/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neonGreen: '#39FF14',
        neonRed: '#FF073A',
        neonBlue: '#00FFFF',
        neonPurple: '#9D00FF',
      },
      keyframes: {
        wave: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(10px)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: 0.5 },
          '50%': { opacity: 1 },
        },
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        wave: 'wave 2s ease-in-out infinite',
        pulseSlow: 'pulseSlow 2s ease-in-out infinite',
        spinSlow: 'spinSlow 4s linear infinite',
      },
    },
  },
  plugins: [scrollbar],
}
