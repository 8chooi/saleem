import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'سَلِيم | SALEEM',
    template: '%s | سَلِيم',
  },
  description: 'العقل السليم.. والفكر المتوازن — منصة تعليمية تفاعلية للأطفال',
  keywords: ['تعليم أطفال', 'قصص عربية', 'ألعاب تعليمية', 'تعلم عربي'],
  authors: [{ name: '8CH' }],
  creator: '8CH',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    title: 'سَلِيم | SALEEM',
    description: 'العقل السليم.. والفكر المتوازن',
    siteName: 'سَلِيم',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563EB',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {children}
      </body>
    </html>
  )
}
