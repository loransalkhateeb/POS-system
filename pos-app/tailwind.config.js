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
        fadeInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        countUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        progressBar: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress)' },
        },
        pulse2: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        slideUp: 'slideUp 0.3s ease-out',
        fadeInUp: 'fadeInUp 0.5s ease-out forwards',
        fadeIn: 'fadeIn 0.4s ease-out forwards',
        scaleIn: 'scaleIn 0.4s ease-out forwards',
        shimmer: 'shimmer 2s infinite linear',
        countUp: 'countUp 0.6s ease-out forwards',
        progressBar: 'progressBar 1s ease-out forwards',
        pulse2: 'pulse2 2s ease-in-out infinite',
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
