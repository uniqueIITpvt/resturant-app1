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
        'scroll-down': 'scrollDown 2s infinite',
        'pulse-subtle': 'pulsate 3s infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        scrollDown: {
          '0%': { transform: 'translateY(0)', opacity: '0' },
          '50%': { transform: 'translateY(8px)', opacity: '1' },
          '100%': { transform: 'translateY(0)', opacity: '0' },
        },
        pulsate: {
          '0%': { opacity: '1' },
          '50%': { opacity: '0.7' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
