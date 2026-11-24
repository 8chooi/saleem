import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const runtime = 'edge'

interface Badge {
  id: string
  slug: string
  name_ar: string
  description_ar: string
  emoji: string
  category: string
  points_required: number
}

interface ChildBadge {
  badge_id: string
  earned_at: string
}

export default async function BadgesPage({
  searchParams,
}: {
  searchParams: { child?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: children } = await supabase
    .from('child_profiles')
    .select('id, name')
    .eq('parent_id', user.id)
    .order('created_at')

  const selectedChildId = searchParams.child || children?.[0]?.id

  const [{ data: badges }, { data: childPoints }, { data: earnedBadges }] = await Promise.all([
    supabase.from('badges').select('*').eq('is_active', true).order('sort_order'),
    selectedChildId
      ? supabase.from('child_points').select('total_points').eq('child_id', selectedChildId).single()
      : { data: null },
    selectedChildId
      ? supabase.from('child_badges').select('badge_id, earned_at').eq('child_id', selectedChildId)
      : { data: [] },
  ])

  const earnedIds = new Set((earnedBadges || []).map((b: ChildBadge) => b.badge_id))
  const totalPoints = childPoints?.total_points || 0
  const earnedCount = earnedIds.size

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-indigo-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={selectedChildId ? `/worlds/letters?child=${selectedChildId}` : '/'} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            ← العوالم
          </Link>
          <h1 className="text-xl font-bold text-indigo-800">🏅 شاراتي</h1>
          <span className="text-sm text-gray-500">{earnedCount}/{badges?.length || 0}</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Child Selector */}
        {children && children.length > 1 && (
          <div className="mb-6 flex gap-2 flex-wrap">
            {children.map((child: { id: string; name: string }) => (
              <Link
                key={child.id}
                href={`/badges?child=${child.id}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedChildId === child.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                }`}
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}

        {/* Points Summary */}
        <div className="bg-gradient-to-l from-indigo-600 to-purple-600 text-white rounded-2xl p-6 mb-6 text-center">
          <div className="text-5xl font-bold mb-1">{totalPoints}</div>
          <div className="text-indigo-200 text-sm">نقطة مكتسبة</div>
          <div className="mt-3 flex gap-4 justify-center text-sm">
            <span>🏅 {earnedCount} شارة مكتسبة</span>
            <span>🎯 {(badges?.length || 0) - earnedCount} شارة متبقية</span>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {(badges || []).map((badge: Badge) => {
            const earned = earnedIds.has(badge.id)
            const canEarn = !earned && totalPoints >= badge.points_required
            return (
              <div
                key={badge.id}
                className={`rounded-2xl p-4 text-center transition-all ${
                  earned
                    ? 'bg-white border-2 border-indigo-300 shadow-md'
                    : 'bg-gray-50 border-2 border-gray-200 opacity-60'
                }`}
              >
                <div className={`text-5xl mb-2 ${!earned ? 'grayscale' : ''}`}>
                  {earned ? badge.emoji : '🔒'}
                </div>
                <h3 className={`font-bold text-sm mb-1 ${earned ? 'text-gray-800' : 'text-gray-500'}`}>
                  {badge.name_ar}
                </h3>
                <p className="text-xs text-gray-400">{badge.description_ar}</p>
                {!earned && badge.points_required > 0 && (
                  <p className="text-xs mt-2 text-indigo-500 font-medium">
                    {canEarn ? '✨ يمكنك كسبها!' : `🎯 ${badge.points_required} نقطة`}
                  </p>
                )}
                {earned && (
                  <p className="text-xs mt-2 text-green-500 font-medium">✓ مكتسبة</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
