'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { LogOut, Menu, X, Users, Home } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/ui/Avatar'

interface ParentNavProps {
  user: User
}

export function ParentNav({ user }: ParentNavProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const name = (user.user_metadata?.full_name as string) ?? user.email ?? 'الوالد'

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <nav className="container mx-auto px-4 h-16 max-w-5xl flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/parent" className="flex items-center gap-2 font-black text-lg text-primary">
          <span className="text-xl">🌙</span>
          <span>سَلِيم</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/parent" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-primary hover:bg-primary-light transition-all">
            <Home size={16} /> الرئيسية
          </Link>
          <Link href="/parent/dashboard" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-primary hover:bg-primary-light transition-all">
            <Users size={16} /> أطفالي
          </Link>
        </div>

        {/* User + logout */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Avatar name={name} size="sm" />
            <span className="text-sm font-semibold text-gray-700 max-w-[120px] truncate">{name}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
          >
            <LogOut size={16} />
            خروج
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          <Link href="/parent" className="flex items-center gap-2 py-2.5 text-sm font-semibold text-gray-700" onClick={() => setOpen(false)}>
            <Home size={16} /> الرئيسية
          </Link>
          <Link href="/parent/dashboard" className="flex items-center gap-2 py-2.5 text-sm font-semibold text-gray-700" onClick={() => setOpen(false)}>
            <Users size={16} /> أطفالي
          </Link>
          <button onClick={handleSignOut} className="flex items-center gap-2 py-2.5 text-sm font-semibold text-red-500 w-full">
            <LogOut size={16} /> تسجيل الخروج
          </button>
        </div>
      )}
    </header>
  )
}
