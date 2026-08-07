/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'fade-in-up': 'fadeInUp 1s ease-out forwards',
        'slow-zoom': 'slowZoom 20s ease-out forwards',
        bounce: 'bounce 2s infinite',
        fadeIn: 'fadeIn 0.3s ease-in forwards',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'scroll-down': 'scrollDown 2s ease-in-out infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slowZoom: {
          '0%': { transform: 'scale(1.0)' },
          '100%': { transform: 'scale(1.1)' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.05)' },
        },
        scrollDown: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '25%': { opacity: '1' },
          '75%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '0', transform: 'translateY(0)' },
        },
      },
      borderWidth: {
        3: '3px',
      },
      screens: {
        xs: '475px',
      },
    },
  },
  plugins: [],
};
