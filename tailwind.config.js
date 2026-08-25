/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F7F5F0',
        surface: '#FFFFFF',
        sunken: '#EFECE5',
        line: '#E3DED4',
        ink: '#1B2733',
        muted: '#68737D',
        primary: {
          DEFAULT: '#11457E',
          dark: '#0D3560',
          soft: '#EBF1F8',
        },
        success: { DEFAULT: '#1B7A43', soft: '#EAF4EE' },
        warning: { DEFAULT: '#9A6700', soft: '#FBF3E4' },
        danger: { DEFAULT: '#C0342C', soft: '#FAEDEB' },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', '"DM Sans"', 'sans-serif'],
        serif: ['Georgia', '"Times New Roman"', 'serif'],
      },
      boxShadow: {
        overlay: '0 12px 32px rgba(27, 39, 51, 0.14)',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '50%': { transform: 'translateX(4px)' },
          '75%': { transform: 'translateX(-2px)' },
        },
      },
      animation: {
        shake: 'shake 0.3s ease-in-out',
      },
    },
  },
  plugins: [],
}
