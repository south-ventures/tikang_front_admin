/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // <--- Important
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3A6EA5',
        secondary: '#5B8FB9',
        accent: '#A8D5BA',
        softgreen: '#D4EDDA',
        cream: '#F9FDFB',
        dark: '#2F4858',
        muted: '#CBD5E0',
      },
    },
    animation: {
      'fade-in': 'fadeIn 0.3s ease-out',
      progress: 'progressBar 3s linear forwards',
    },
    keyframes: {
      progressBar: {
        '0%': { width: '0%' },
        '100%': { width: '100%' },
      },
      fadeIn: {
        '0%': { opacity: 0, transform: 'translateY(-10px)' },
        '100%': { opacity: 1, transform: 'translateY(0)' },
      },
    },
  },
  plugins: [],
};
