'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavLink {
  href: string
  label: string
}

const links: NavLink[] = [
  { href: '/#worlds', label: 'عوالم سَلِيم' },
  { href: '/#features', label: 'المميزات' },
  { href: '/#parents', label: 'للآباء' },
  { href: '/#teachers', label: 'للمعلمين' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-black text-xl text-primary">
          <span className="text-2xl">🌙</span>
          <span>سَلِيم</span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 px-3 py-1.5 text-sm rounded-lg min-h-[36px] bg-transparent text-primary hover:bg-primary-light"
          >
            تسجيل الدخول
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 px-3 py-1.5 text-sm rounded-lg min-h-[36px] bg-primary text-white hover:bg-primary-dark shadow-sm"
          >
            ابدأ مجاناً
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setOpen((v) => !v)}
          aria-label="القائمة"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block py-2.5 text-base font-semibold text-gray-700 hover:text-primary"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center font-semibold transition-all duration-150 px-5 py-2.5 text-base rounded-xl min-h-[44px] border-2 border-primary text-primary bg-transparent hover:bg-primary-light w-full"
              onClick={() => setOpen(false)}
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center font-semibold transition-all duration-150 px-5 py-2.5 text-base rounded-xl min-h-[44px] bg-primary text-white hover:bg-primary-dark shadow-sm w-full"
              onClick={() => setOpen(false)}
            >
              ابدأ مجاناً
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
