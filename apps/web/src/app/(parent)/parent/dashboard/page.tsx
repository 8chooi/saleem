import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

interface ChildProgress {
  id: string
  name: string
  age: number
  avatar_emoji: string
  total_points: number
  completed_lessons: number
  read_stories: number
  badges_count: number
}

export default async function ParentDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: children } = await supabase
    .from('child_profiles')
    .select('id, name, age, avatar_emoji')
    .eq('parent_id', user.id)
    .order('created_at')

  const childrenData: ChildProgress[] = []

  for (const child of children || []) {
    const [
      { data: points },
      { count: completedLessons },
      { count: readStories },
      { count: badgesCount },
    ] = await Promise.all([
      supabase.from('child_points').select('total_points').eq('child_id', child.id).single(),
      supabase.from('learning_progress').select('*', { count: 'exact', head: true }).eq('child_id', child.id).eq('status', 'completed'),
      supabase.from('story_reads').select('*', { count: 'exact', head: true }).eq('child_id', child.id),
      supabase.from('child_badges').select('*', { count: 'exact', head: true }).eq('child_id', child.id),
    ])

    childrenData.push({
      ...child,
      total_points: points?.total_points || 0,
      completed_lessons: completedLessons || 0,
      read_stories: readStories || 0,
      badges_count: badgesCount || 0,
    })
  }

  const totalPoints = childrenData.reduce((s, c) => s + c.total_points, 0)
  const totalLessons = childrenData.reduce((s, c) => s + c.completed_lessons, 0)

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">لوحة التحكم 👨‍👩‍👧</h1>
            <p className="text-sm text-gray-500 mt-0.5">متابعة تقدم الأطفال</p>
          </div>
          <div className="flex gap-3">
            <Link href="/parent/children/add" className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700">
              + إضافة طفل
            </Link>
            <Link href="/parent" className="border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-lg hover:bg-gray-50">
              عودة
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Family Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'عدد الأطفال', value: childrenData.length, icon: '👧', color: 'blue' },
            { label: 'مجموع النقاط', value: totalPoints, icon: '⭐', color: 'yellow' },
            { label: 'الدروس المكتملة', value: totalLessons, icon: '📚', color: 'green' },
            { label: 'القصص المقروءة', value: childrenData.reduce((s, c) => s + c.read_stories, 0), icon: '📖', color: 'purple' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
              <div className="text-3xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Children Cards */}
        {childrenData.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">👶</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">لا يوجد أطفال بعد</h2>
            <p className="text-gray-500 mb-6">أضف طفلاً للبدء في متابعة تقدمه</p>
            <Link href="/parent/children/add" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700">
              + إضافة طفل
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {childrenData.map((child) => (
              <div key={child.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-5xl">{child.avatar_emoji || '🧒'}</div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">{child.name}</h2>
                    <p className="text-sm text-gray-500">العمر: {child.age} سنوات</p>
                  </div>
                  <div className="me-auto text-right">
                    <div className="text-xl font-bold text-yellow-600">{child.total_points}</div>
                    <div className="text-xs text-gray-400">نقطة</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
                  <div className="bg-green-50 rounded-lg py-2">
                    <div className="font-bold text-green-700 text-lg">{child.completed_lessons}</div>
                    <div className="text-green-600">درس</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg py-2">
                    <div className="font-bold text-purple-700 text-lg">{child.read_stories}</div>
                    <div className="text-purple-600">قصة</div>
                  </div>
                  <div className="bg-indigo-50 rounded-lg py-2">
                    <div className="font-bold text-indigo-700 text-lg">{child.badges_count}</div>
                    <div className="text-indigo-600">شارة</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/parent/children/${child.id}/progress`}
                    className="flex-1 text-center bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium py-2 rounded-lg text-sm"
                  >
                    📊 التقدم
                  </Link>
                  <Link
                    href={`/worlds/letters?child=${child.id}`}
                    className="flex-1 text-center bg-green-50 text-green-700 hover:bg-green-100 font-medium py-2 rounded-lg text-sm"
                  >
                    🎮 العب
                  </Link>
                  <Link
                    href={`/badges?child=${child.id}`}
                    className="flex-1 text-center bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium py-2 rounded-lg text-sm"
                  >
                    🏅 الشارات
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
