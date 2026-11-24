import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

export default async function ParentDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const name = (user.user_metadata?.full_name as string) ?? 'الوالد'

  // Fetch children profiles
  const { data: children } = await supabase
    .from('child_profiles')
    .select('*')
    .order('created_at', { ascending: true })

  const worlds = [
    { slug: 'letters',    icon: '🌙', label: 'الحروف',   color: 'bg-orange-100 text-orange-600' },
    { slug: 'numbers',   icon: '🔢', label: 'الأعداد',  color: 'bg-green-100 text-green-600' },
    { slug: 'science',   icon: '🔭', label: 'العلوم',   color: 'bg-blue-100 text-blue-600' },
    { slug: 'languages', icon: '🌍', label: 'اللغات',   color: 'bg-purple-100 text-purple-600' },
    { slug: 'thinking',  icon: '🧩', label: 'التفكير',  color: 'bg-pink-100 text-pink-600' },
    { slug: 'creativity',icon: '🎨', label: 'الإبداع',  color: 'bg-yellow-100 text-yellow-600' },
    { slug: 'knowledge', icon: '🌟', label: 'المعرفة',  color: 'bg-indigo-100 text-indigo-600' },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center gap-4">
        <Avatar name={name} size="xl" />
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            أهلاً، {name.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">مرحباً بك في لوحة التحكم</p>
        </div>
      </div>

      {/* Children section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-gray-900">أطفالي</h2>
          <Link
            href="/parent/children/add"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:bg-primary-light px-3 py-1.5 rounded-lg transition-all"
          >
            + إضافة طفل
          </Link>
        </div>

        {!children || children.length === 0 ? (
          <Card className="text-center py-2">
            <EmptyState
              icon="👶"
              title="لا يوجد أطفال مسجّلون بعد"
              description="أضف ملف طفلك لتبدأ في متابعة تقدّمه التعليمي"
              action={
                <Link
                  href="/parent/children/add"
                  className="inline-flex items-center justify-center font-bold px-6 py-3 rounded-xl bg-primary text-white hover:bg-primary-dark transition-all"
                >
                  إضافة طفل الآن
                </Link>
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.map((child: { id: string; name: string; birth_year: number; avatar_emoji?: string; emoji?: string }) => (
              <div key={child.id} className="space-y-2">
                <Link href={`/worlds/letters?child=${child.id}`}>
                  <Card variant="interactive" className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center text-2xl">
                      {child.emoji ?? child.avatar_emoji ?? '🧒'}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{child.name}</p>
                      <p className="text-sm text-gray-500">مواليد {child.birth_year}</p>
                    </div>
                    <span className="text-xs text-primary font-semibold">تعلّم →</span>
                  </Card>
                </Link>
                <Link
                  href={`/parent/children/${child.id}/progress`}
                  className="block text-center text-xs text-gray-400 hover:text-primary"
                >
                  عرض تقدم {child.name} →
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Links */}
      <section>
        <h2 className="text-xl font-black text-gray-900 mb-4">الأدوات</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/parent/dashboard', icon: '📊', label: 'لوحة المتابعة', color: 'bg-blue-50 text-blue-700 border-blue-200' },
            { href: '/stories', icon: '📚', label: 'مكتبة القصص', color: 'bg-purple-50 text-purple-700 border-purple-200' },
            { href: '/games/matching', icon: '🎮', label: 'ألعاب تعليمية', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 p-4 rounded-xl border font-semibold text-sm hover:opacity-80 transition-opacity ${item.color}`}
            >
              <span className="text-2xl">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Worlds quick access */}
      <section>
        <h2 className="text-xl font-black text-gray-900 mb-4">عوالم سَلِيم</h2>
        <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
          {worlds.map((w) => (
            <Link
              key={w.slug}
              href={`/worlds/${w.slug}`}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-gray-100 transition-colors group"
            >
              <div className={`w-12 h-12 rounded-xl ${w.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                {w.icon}
              </div>
              <span className="text-xs font-semibold text-gray-600 text-center leading-tight">{w.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
