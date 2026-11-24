import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ParentNav } from '@/components/parent/ParentNav'


export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <ParentNav user={user} />
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {children}
      </main>
    </div>
  )
}
