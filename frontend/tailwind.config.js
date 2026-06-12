/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f2faf4',
          100: '#e0f4e6',
          200: '#bce8cb',
          300: '#8dd4a8',
          400: '#58bc80',
          500: '#34a15e',
          600: '#27854a',
          700: '#1f6b3b',
          800: '#1a5530',
          900: '#164428',
        },
        sage: {
          50:  '#f6f8f6',
          100: '#eaefea',
          200: '#d3ddd3',
          300: '#b0c2b0',
          400: '#88a388',
          500: '#658665',
          600: '#4e6b4e',
          700: '#3e553e',
          800: '#334433',
          900: '#2b382b',
        },
        cream: {
          50:  '#fdfcf8',
          100: '#faf7f0',
          200: '#f3ede0',
          300: '#e8dfcc',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['DM Serif Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft':    '0 2px 12px 0 rgba(0,0,0,0.06)',
        'soft-md': '0 4px 20px 0 rgba(0,0,0,0.08)',
        'soft-lg': '0 8px 32px 0 rgba(0,0,0,0.10)',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
};
