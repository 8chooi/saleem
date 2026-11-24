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
      animation: {
        'fade-in': 'fadeIn 200ms ease',
        'slide-up': 'slideUp 200ms ease',
        'bounce-soft': 'bounceSoft 600ms ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
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
