/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['var(--font-body)',    'sans-serif'],
        display: ['var(--font-display)', 'sans-serif'],
        mono:    ['var(--font-mono)',    'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7fe',
          300: '#a5b8fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },
      animation: {
        'fade-in':      'fadeIn   0.4s ease            forwards',
        'slide-up':     'slideUp  0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'scale-in':     'scaleIn  0.35s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-right':  'slideRight 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'pulse-slow':   'pulse    3s   ease-in-out     infinite',
        'spin-slow':    'spin     12s  linear          infinite',
      },
      keyframes: {
        fadeIn:      { from: { opacity: '0' },                               to: { opacity: '1' } },
        slideUp:     { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:     { from: { opacity: '0', transform: 'scale(0.95)' },      to: { opacity: '1', transform: 'scale(1)' } },
        slideRight:  { from: { opacity: '0', transform: 'translateX(-10px)' },to: { opacity: '1', transform: 'translateX(0)' } },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-sm':  '0 0 20px rgba(99,102,241,0.2)',
        'glow-md':  '0 0 40px rgba(99,102,241,0.3)',
        'glow-lg':  '0 0 80px rgba(99,102,241,0.25)',
        'card':     '0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)',
        'card-hover': '0 8px 40px rgba(99,102,241,0.15), 0 2px 12px rgba(0,0,0,0.5)',
        'elevated': '0 20px 60px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}
