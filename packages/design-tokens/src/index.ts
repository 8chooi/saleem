// SALEEM Design Tokens — قابلة للتعديل بالكامل

export const colors = {
  primary: '#2563EB',
  primaryLight: '#DBEAFE',
  primaryDark: '#1D4ED8',
  secondary: '#7C3AED',
  secondaryLight: '#EDE9FE',
  accent: '#F59E0B',
  accentLight: '#FEF3C7',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  bg: '#FAFAFA',
  bgCard: '#FFFFFF',
  bgChild: '#F0F7FF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  borderFocus: '#2563EB',
} as const

// World colors — لكل عالم لونه
export const worldColors = {
  letters: { bg: '#FFF7ED', accent: '#F97316', icon: '🌙' },
  numbers: { bg: '#F0FDF4', accent: '#22C55E', icon: '🔢' },
  science: { bg: '#F0F9FF', accent: '#0EA5E9', icon: '🔭' },
  languages: { bg: '#FDF4FF', accent: '#A855F7', icon: '🌍' },
  thinking: { bg: '#FFF1F2', accent: '#F43F5E', icon: '🧩' },
  creativity: { bg: '#FEFCE8', accent: '#EAB308', icon: '🎨' },
  knowledge: { bg: '#F0FDFA', accent: '#14B8A6', icon: '🌟' },
} as const

export const fonts = {
  arabic: "'Cairo', 'Noto Sans Arabic', sans-serif",
  latin: "'Inter', system-ui, sans-serif",
} as const

export const fontSizes = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  // Child-specific
  childBase: '1.125rem',
  childHeading: '1.5rem',
  childLarge: '2rem',
} as const

export const spacing = {
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
} as const

export const borderRadius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
  full: '9999px',
} as const

export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px rgba(0,0,0,0.07)',
  lg: '0 10px 15px rgba(0,0,0,0.1)',
  card: '0 2px 8px rgba(0,0,0,0.08)',
  cardHover: '0 8px 24px rgba(0,0,0,0.12)',
} as const

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

export const transitions = {
  fast: '100ms ease',
  base: '150ms ease',
  slow: '300ms ease',
} as const
