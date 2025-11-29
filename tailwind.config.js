
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'zen-base': 'var(--zen-base)', 
        'zen-stone': 'var(--zen-stone)',
        'zen-brown': 'var(--zen-text)', 
        'zen-primary': 'var(--zen-primary)', 
        'zen-secondary': 'var(--zen-secondary)',
        'zen-accent': 'var(--zen-accent)', 
        'zen-bg': 'var(--zen-bg)',
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'sans-serif'],
        serif: ['"Noto Serif SC"', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(var(--zen-shadow-rgb), 0.1)',
        'glass': '0 8px 32px 0 rgba(255, 255, 255, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'fade-in-up': 'fadeInUp 1s ease-out',
        'fade-in-down': 'fadeInDown 1s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
