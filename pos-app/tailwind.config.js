/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        slideUp: 'slideUp 0.3s ease-out',
      },
      colors: {
        primary: {
          50: '#f3e8fa',
          100: '#e4c8f5',
          200: '#d1a3ee',
          300: '#b97de6',
          400: '#a35bde',
          500: '#6A0DAD',
          600: '#5c0b96',
          700: '#4d097e',
          800: '#3e0766',
          900: '#2f054e',
          950: '#1a0330',
        },
      },
    },
  },
  plugins: [],
};
