import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ParentDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const name = (user.user_metadata?.full_name as string) ?? 'الوالد'

  const { data: children } = await supabase
    .from('child_profiles')
    .select('id, name, avatar_emoji, age_group, birth_year')
    .eq('parent_id', user.id)
    .order('created_at', { ascending: true })

  if (!children || children.length === 0) redirect('/parent/children/add?welcome=1')

  /* جلب إحصائيات + آخر نشاط لكل طفل */
  const childrenData = await Promise.all(
    (children ?? []).map(async (child) => {
      const [
        { data: pts },
        { count: lessons },
        { data: lastRead },
        { data: lastGame },
        { data: lastLesson },
        { data: activityDays },
      ] = await Promise.all([
        supabase.from('child_points').select('total_points').eq('child_id', child.id).single(),
        supabase.from('learning_progress').select('*', { count: 'exact', head: true }).eq('child_id', child.id).eq('status', 'completed'),
        supabase.from('story_reads').select('read_at, story:stories(title_ar, cover_emoji)').eq('child_id', child.id).order('read_at', { ascending: false }).limit(1),
        supabase.from('game_sessions').select('played_at, game_type, score').eq('child_id', child.id).order('played_at', { ascending: false }).limit(1),
        supabase.from('learning_progress').select('completed_at, lesson:lessons(title_ar, subject:subjects(emoji))').eq('child_id', child.id).eq('status', 'completed').order('completed_at', { ascending: false }).limit(1),
        supabase.from('story_reads').select('read_at').eq('child_id', child.id).order('read_at', { ascending: false }).limit(60),
      ])

      // احسب الـ streak: كم يوم متتالي فيه نشاط
      const streak = (() => {
        const days = new Set((activityDays ?? []).map((r: { read_at: string }) =>
          new Date(r.read_at).toISOString().slice(0, 10)
        ))
        let count = 0
        const today = new Date()
        for (let i = 0; i < 60; i++) {
          const d = new Date(today)
          d.setDate(d.getDate() - i)
          if (days.has(d.toISOString().slice(0, 10))) count++
          else if (i > 0) break
        }
        return count
      })()

      const GAME_NAMES: Record<string, string> = {
        words: 'رتّب الكلمات', matching: 'المطابقة', letters: 'أين الحرف؟',
        counting: 'عُدّ معي', math: 'حساب سريع', opposites: 'الأضداد',
      }

      /* آخر نشاط */
      type Act = { at: string; icon: string; text: string }
      const acts: Act[] = [
        ...(lastRead ?? []).map((r) => {
          const s = r.story as unknown as { title_ar: string; cover_emoji: string } | null
          return { at: r.read_at as string, icon: s?.cover_emoji ?? '📖', text: `قرأ: ${s?.title_ar ?? ''}` }
        }),
        ...(lastGame ?? []).map((g) => ({
          at: g.played_at as string,
          icon: '🎮',
          text: `لعب ${GAME_NAMES[g.game_type as string] ?? g.game_type} بنتيجة ${g.score}%`,
        })),
        ...(lastLesson ?? []).map((p) => {
          const l = p.lesson as unknown as { title_ar: string; subject: { emoji: string } | null } | null
          return { at: p.completed_at as string, icon: l?.subject?.emoji ?? '🎓', text: `أكمل: ${l?.title_ar ?? ''}` }
        }),
      ].filter((a) => a.at).sort((a, b) => b.at.localeCompare(a.at))

      return {
        id: child.id,
        name: child.name,
        avatar_emoji: child.avatar_emoji,
        age: new Date().getFullYear() - (child.birth_year as number),
        points: pts?.total_points ?? 0,
        lessons: lessons ?? 0,
        lastActivity: acts[0] ?? null,
        streak,
      }
    })
  )

  const totalPoints = childrenData.reduce((s, c) => s + c.points, 0)
  const totalLessons = childrenData.reduce((s, c) => s + c.lessons, 0)

  return (
    <div className="space-y-6" dir="rtl">
      {/* ترحيب */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-black text-white shrink-0"
          style={{background:'linear-gradient(135deg,#7c3aed,#ec4899)'}}>
          {name.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900">أهلاً، {name.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 text-sm mt-0.5">تابع تقدّم أطفالك من هنا</p>
        </div>
      </div>

      {/* إحصاء الأسرة */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'عدد الأطفال', value: childrenData.length, icon: '👧', bg: '#ede9fe', text: '#6d28d9' },
          { label: 'مجموع النقاط', value: totalPoints, icon: '⭐', bg: '#fef9c3', text: '#854d0e' },
          { label: 'الدروس المكتملة', value: totalLessons, icon: '🎓', bg: '#d1fae5', text: '#065f46' },
          { label: 'أطفال نشيطون', value: childrenData.filter(c => c.lastActivity).length, icon: '🔥', bg: '#fee2e2', text: '#991b1b' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-4 text-center"
            style={{background:s.bg,border:`1.5px solid ${s.text}22`}}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-black" style={{color:s.text}}>{s.value}</div>
            <div className="text-xs font-bold mt-0.5" style={{color:s.text+'99'}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* اختر الطفل */}
      <section className="rounded-3xl p-6 text-white"
        style={{background:'linear-gradient(135deg,#7c3aed 0%,#a855f7 50%,#ec4899 100%)'}}>
        <h2 className="text-xl font-black mb-1">من سيتعلّم الآن؟</h2>
        <p className="text-white/70 text-sm mb-4">اضغط على اسم طفلك لفتح عالمه</p>
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-3">
          {children.map((child: { id: string; name: string; avatar_emoji?: string }) => (
            <Link key={child.id} href={`/kids/${child.id}`}
              className="flex flex-col items-center gap-2 rounded-3xl px-4 py-4 active:scale-95 transition-all min-w-0"
              style={{background:'rgba(255,255,255,0.15)'}}>
              <span className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-3xl shadow shrink-0">
                {child.avatar_emoji ?? '🧒'}
              </span>
              <span className="font-black text-sm text-center truncate w-full">{child.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* بطاقات الأطفال مع آخر نشاط */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-black text-gray-900">أطفالي</h2>
          <Link href="/parent/children/add"
            className="text-sm font-black text-purple-600 bg-purple-50 px-3 py-1.5 rounded-xl">
            + إضافة طفل
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {childrenData.map((child) => (
            <div key={child.id} className="bg-white rounded-3xl p-5"
              style={{boxShadow:'0 5px 0 #ede9fe',border:'1.5px solid #ede9fe'}}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-5xl">{child.avatar_emoji ?? '🧒'}</span>
                <div className="flex-1">
                  <h3 className="font-black text-lg text-gray-900">{child.name}</h3>
                  <p className="text-sm text-gray-500">العمر: {child.age} سنوات</p>
                </div>
                <div className="text-right flex flex-col gap-1">
                  <div className="font-black text-lg text-amber-500">⭐ {child.points}</div>
                  {child.streak > 0 && (
                    <div className="font-black text-sm text-orange-500">🔥 {child.streak} يوم</div>
                  )}
                </div>
              </div>

              {/* آخر نشاط */}
              {child.lastActivity ? (
                <div className="rounded-2xl p-3 mb-4 flex items-center gap-3"
                  style={{background:'#f5f3ff'}}>
                  <span className="text-2xl">{child.lastActivity.icon}</span>
                  <span className="flex-1 text-sm font-bold text-purple-800 truncate">{child.lastActivity.text}</span>
                  <span className="text-[11px] text-purple-400 shrink-0">
                    {new Date(child.lastActivity.at).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ) : (
                <div className="rounded-2xl p-3 mb-4 text-center bg-gray-50">
                  <p className="text-sm text-gray-400">لم يبدأ بعد</p>
                </div>
              )}

              <div className="flex gap-2">
                <Link href={`/kids/${child.id}`}
                  className="flex-1 text-center text-white font-black py-2 rounded-2xl text-sm"
                  style={{background:'#7c3aed',boxShadow:'0 3px 0 #5b21b6'}}>
                  تعلّم
                </Link>
                <Link href={`/parent/children/${child.id}/progress`}
                  className="flex-1 text-center font-black py-2 rounded-2xl text-sm text-purple-700"
                  style={{background:'#ede9fe',boxShadow:'0 3px 0 #ddd6fe'}}>
                  📊 تقدّمه
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* روابط سريعة */}
      <section>
        <h2 className="text-xl font-black text-gray-900 mb-3">روابط سريعة</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/library', icon: '🌍', label: 'المكتبة المفتوحة', bg: '#d1fae5', text: '#065f46' },
            { href: '/stories', icon: '📚', label: 'قصص سَلِيم', bg: '#ede9fe', text: '#6d28d9' },
            { href: '/games', icon: '🎮', label: 'الألعاب', bg: '#fef9c3', text: '#854d0e' },
            { href: '/parent/dashboard', icon: '📊', label: 'تقرير مفصّل', bg: '#fee2e2', text: '#991b1b' },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 p-4 rounded-2xl font-black text-sm transition-opacity hover:opacity-80"
              style={{background:item.bg,color:item.text}}>
              <span className="text-2xl">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
