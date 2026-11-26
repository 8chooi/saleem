import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          light: '#DBEAFE',
          dark: '#1D4ED8',
        },
        secondary: {
          DEFAULT: '#7C3AED',
          light: '#EDE9FE',
        },
        accent: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
        },
        child: {
          bg: '#F0F7FF',
        },
        // Brand — Sprint 1A
        brand: {
          purple:       '#5C4AE4',
          'purple-dark': '#3D2FB0',
          'purple-light': '#EEF2FF',
        },
        // World colors
        world: {
          letters: '#F97316',
          numbers: '#22C55E',
          science: '#0EA5E9',
          languages: '#A855F7',
          thinking: '#F43F5E',
          creativity: '#EAB308',
          knowledge: '#14B8A6',
        },
      },
      fontFamily: {
        arabic: ['Cairo', 'Noto Sans Arabic', 'sans-serif'],
        latin: ['Inter', 'system-ui', 'sans-serif'],
        sans: ['Cairo', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'clay-sm':     '0 4px 0 0 rgba(0,0,0,0.12)',
        'clay':        '0 6px 0 0 rgba(0,0,0,0.14)',
        'clay-lg':     '0 8px 0 0 rgba(0,0,0,0.16)',
        'clay-purple': '0 6px 0 0 #3D2FB0',
        'clay-gold':   '0 6px 0 0 #B45309',
        'clay-green':  '0 6px 0 0 #065F46',
        'clay-blue':   '0 6px 0 0 #1E40AF',
      },
      animation: {
        'fade-in':    'fadeIn 200ms ease',
        'slide-up':   'slideUp 200ms ease',
        'bounce-soft':'bounceSoft 600ms ease infinite',
        'float':      'float 3s ease-in-out infinite',
        'float-slow': 'float 5s ease-in-out infinite',
        'wiggle':     'wiggle 0.8s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',   opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%':      { transform: 'rotate(3deg)' },
        },
      },
      screens: {
        xs: '475px',
      },
    },
  },
  plugins: [],
}

export default config
