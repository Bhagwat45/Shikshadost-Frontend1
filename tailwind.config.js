/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        surface: {
          0:   'var(--surface-0)',
          1:   'var(--surface-1)',
          2:   'var(--surface-2)',
          3:   'var(--surface-3)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.75rem',
      },
      boxShadow: {
        'xs':    '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'glass': '0 8px 32px 0 rgb(0 0 0 / 0.12)',
        'glow':  '0 0 20px -4px var(--tw-shadow-color)',
        'card':  '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
        'card-hover': '0 4px 16px 0 rgb(0 0 0 / 0.10), 0 1px 3px 0 rgb(0 0 0 / 0.08)',
        'modal': '0 20px 60px -10px rgb(0 0 0 / 0.25)',
      },
      backgroundImage: {
        'gradient-radial':    'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh':      'radial-gradient(at 40% 20%, hsla(248,84%,74%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,85%,63%,0.08) 0px, transparent 50%)',
        'gradient-brand':     'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        'gradient-brand-soft':'linear-gradient(135deg, #eef2ff 0%, #ede9fe 100%)',
      },
      animation: {
        'fade-in':      'fadeIn 0.3s ease-out',
        'fade-up':      'fadeUp 0.4s ease-out',
        'slide-in-r':   'slideInRight 0.35s ease-out',
        'slide-in-l':   'slideInLeft 0.35s ease-out',
        'scale-in':     'scaleIn 0.2s ease-out',
        'shimmer':      'shimmer 1.6s infinite linear',
        'spin-slow':    'spin 3s linear infinite',
        'pulse-soft':   'pulseSoft 2s ease-in-out infinite',
        'typing':       'typing 1.4s ease-in-out infinite',
        'bounce-soft':  'bounceSoft 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:       { from: { opacity: '0' }, to: { opacity: '1' } },
        fadeUp:       { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { from: { opacity: '0', transform: 'translateX(20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        slideInLeft:  { from: { opacity: '0', transform: 'translateX(-20px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        scaleIn:      { from: { opacity: '0', transform: 'scale(0.95)' }, to: { opacity: '1', transform: 'scale(1)' } },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        typing: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.2' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
