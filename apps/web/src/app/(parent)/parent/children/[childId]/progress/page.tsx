import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import AssignTask from './AssignTask'

export const dynamic = 'force-dynamic'

interface Props {
  params: { childId: string }
}

export async function generateMetadata() {
  return { title: 'تقدم الطفل | سَلِيم' }
}

export default async function ChildProgressPage({ params }: Props) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: child } = await supabase
    .from('child_profiles')
    .select('id, name, emoji:avatar_emoji, age_group')
    .eq('id', params.childId)
    .eq('parent_id', user.id)
    .single()

  if (!child) notFound()

  // جلب النقاط
  const { data: pointsRow } = await supabase
    .from('child_points')
    .select('total_points')
    .eq('child_id', child.id)
    .single()

  // جلب التقدم مع بيانات الدروس والعوالم
  const { data: progress = [] } = await supabase
    .from('learning_progress')
    .select(`
      *,
      lesson:lessons (
        title_ar, points, duration_min,
        subject:subjects (name_ar, emoji, color, slug)
      )
    `)
    .eq('child_id', child.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  const [{ data: storyList }, { data: lessonList }, { data: assignRows }, { data: reads }, { data: games }] = await Promise.all([
    supabase.from('stories').select('id, title_ar').eq('is_active', true).order('level').order('sort_order'),
    supabase.from('lessons').select('id, title_ar, subject:subjects(name_ar)').eq('is_active', true).order('sort_order'),
    supabase
      .from('child_assignments')
      .select('id, note, completed_at, story:stories(title_ar), lesson:lessons(title_ar)')
      .eq('child_id', child.id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('story_reads').select('read_at, story:stories(title_ar)').eq('child_id', child.id).order('read_at', { ascending: false }).limit(10),
    supabase.from('game_sessions').select('played_at, game_type, score').eq('child_id', child.id).order('played_at', { ascending: false }).limit(10),
  ])

  const GAME_NAMES: Record<string, string> = {
    matching: 'لعبة المطابقة', letters: 'أين الحرف؟', counting: 'عُدّ معي', math: 'حساب سريع', opposites: 'الأضداد',
  }
  type Activity = { at: string; icon: string; text: string }
  const activity: Activity[] = [
    ...(progress ?? []).map((p: { completed_at: string; score: number; lesson?: { title_ar: string } }) => ({
      at: p.completed_at, icon: '🎓', text: `أكمل درس «${p.lesson?.title_ar ?? ''}» بنتيجة ${p.score}%`,
    })),
    ...(reads ?? []).map((r) => ({
      at: r.read_at as string, icon: '📖', text: `قرأ قصة «${(r.story as unknown as { title_ar: string } | null)?.title_ar ?? ''}»`,
    })),
    ...(games ?? []).map((g) => ({
      at: g.played_at as string, icon: '🎮', text: `لعب «${GAME_NAMES[g.game_type] ?? g.game_type}» بنتيجة ${g.score}%`,
    })),
  ]
    .filter((a) => a.at)
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 12)

  const assignments = (assignRows ?? []).map((a) => {
    const story = a.story as unknown as { title_ar: string } | null
    const lesson = a.lesson as unknown as { title_ar: string } | null
    return {
      id: a.id as string,
      title: story?.title_ar ?? lesson?.title_ar ?? '',
      kind: (story ? 'story' : 'lesson') as 'story' | 'lesson',
      note: a.note as string | null,
      completed_at: a.completed_at as string | null,
    }
  })

  const completedCount = (progress ?? []).length
  const totalPoints = pointsRow?.total_points ?? 0

  // تجميع حسب العالم
  const bySubject: Record<string, { name_ar: string; emoji: string; color: string; slug: string; count: number }> = {}
  for (const p of (progress ?? [])) {
    const subj = p.lesson?.subject
    if (!subj) continue
    if (!bySubject[subj.slug]) {
      bySubject[subj.slug] = { name_ar: subj.name_ar, emoji: subj.emoji, color: subj.color, slug: subj.slug, count: 0 }
    }
    bySubject[subj.slug].count++
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4">
        <div className="container mx-auto max-w-2xl">
          <Link href="/parent" className="text-blue-600 text-sm hover:underline">← لوحة التحكم</Link>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-4xl">{child.emoji}</span>
            <div>
              <h1 className="text-xl font-black text-gray-900">{child.name}</h1>
              <p className="text-sm text-gray-500">{child.age_group} سنة</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* بطاقات الإحصاء */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="text-3xl font-black text-blue-600">{totalPoints}</div>
            <div className="text-sm text-gray-500 mt-1">نقطة</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="text-3xl font-black text-green-600">{completedCount}</div>
            <div className="text-sm text-gray-500 mt-1">درس مكتمل</div>
          </div>
        </div>

        <AssignTask
          childId={child.id}
          stories={(storyList ?? []).map((s) => ({ id: s.id, title: s.title_ar }))}
          lessons={(lessonList ?? []).map((l) => ({
            id: l.id,
            title: `${(l.subject as unknown as { name_ar: string } | null)?.name_ar ?? ''}: ${l.title_ar}`,
          }))}
          assignments={assignments}
        />

        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <h2 className="font-bold text-gray-700 mb-3">آخر النشاطات</h2>
          {activity.length === 0 ? (
            <p className="text-sm text-gray-500">لا توجد نشاطات بعد.</p>
          ) : (
            <ul className="space-y-2">
              {activity.map((a, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span>{a.icon}</span>
                  <span className="flex-1 text-gray-800">{a.text}</span>
                  <span className="text-xs text-gray-400 shrink-0">{new Date(a.at).toLocaleDateString('ar-EG')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* التقدم حسب العالم */}
        {Object.keys(bySubject).length > 0 && (
          <div className="mb-6">
            <h2 className="font-bold text-gray-700 mb-3">التقدم حسب العالم</h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(bySubject).map((s) => (
                <Link
                  key={s.slug}
                  href={`/worlds/${s.slug}?child=${child.id}`}
                  className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow"
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <div>
                    <div className="font-bold text-gray-800 text-sm">{s.name_ar}</div>
                    <div className="text-xs text-gray-500">{s.count} درس</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* آخر الدروس */}
        <div>
          <h2 className="font-bold text-gray-700 mb-3">آخر الدروس المكتملة</h2>
          {(progress ?? []).length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center text-gray-400">
              <div className="text-4xl mb-2">📚</div>
              <p>لم يُكمل {child.name} أي درس بعد</p>
              <Link
                href={`/worlds/letters?child=${child.id}`}
                className="mt-3 inline-block text-blue-600 text-sm font-semibold hover:underline"
              >
                ابدأ بعالم الحروف →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {(progress ?? []).slice(0, 10).map((p: any) => (
                <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
                  <span className="text-2xl">{p.lesson?.subject?.emoji ?? '📖'}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{p.lesson?.title_ar ?? 'درس'}</div>
                    <div className="text-xs text-gray-400">
                      {p.completed_at ? new Date(p.completed_at).toLocaleDateString('ar-EG') : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{p.score}%</div>
                    <div className="text-xs text-gray-400">+{p.points_earned} نقطة</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
