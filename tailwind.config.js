/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#071a3d',
          50: '#e8edf5',
          100: '#c5d0e6',
          200: '#8fa5cc',
          300: '#5a7ab3',
          400: '#2d5499',
          500: '#071a3d',
          600: '#061633',
          700: '#041129',
          800: '#030c1f',
          900: '#020814',
        },
        gold: {
          DEFAULT: '#c59a42',
          50: '#fdf8ee',
          100: '#f9edcc',
          200: '#f2d999',
          300: '#e8c066',
          400: '#dba83d',
          500: '#c59a42',
          600: '#a67e32',
          700: '#876325',
          800: '#684c1b',
          900: '#4a3512',
        },
        cream: '#f8f3e8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-gold': 'pulseGold 2s infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(10px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        pulseGold: { '0%,100%': { boxShadow: '0 0 0 0 rgba(197,154,66,0.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(197,154,66,0)' } },
      },
    },
  },
  plugins: [],
}
