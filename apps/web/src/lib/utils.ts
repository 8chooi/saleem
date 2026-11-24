import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number, locale = 'ar-EG'): string {
  return new Intl.NumberFormat(locale).format(n)
}

export function getAgeGroup(birthYear: number): '3-5' | '6-8' | '9-12' | null {
  const age = new Date().getFullYear() - birthYear
  if (age >= 3 && age <= 5) return '3-5'
  if (age >= 6 && age <= 8) return '6-8'
  if (age >= 9 && age <= 12) return '9-12'
  return null
}
