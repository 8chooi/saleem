import type { ReactNode } from 'react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'إدارة المحتوى | سَلِيم', robots: { index: false } }

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/admin')
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) notFound()

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4">
          <span className="font-black text-gray-900">إدارة المحتوى</span>
          <nav className="flex gap-3 text-sm font-bold">
            <Link href="/admin" className="text-blue-600">كل المحتوى</Link>
            <Link href="/admin/stories/new" className="text-blue-600">+ قصة</Link>
            <Link href="/admin/lessons/new" className="text-blue-600">+ درس</Link>
          </nav>
          <Link href="/parent" className="ms-auto text-sm text-gray-500">لوحة ولي الأمر ←</Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
