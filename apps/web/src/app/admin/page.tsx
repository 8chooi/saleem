import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ToggleActive from './ToggleActive'

export default async function AdminHome() {
  const supabase = createClient()
  const [{ data: stories }, { data: lessons }] = await Promise.all([
    supabase.from('stories').select('id, title_ar, level, is_active, pages, quiz').order('level').order('sort_order'),
    supabase
      .from('lessons')
      .select('id, title_ar, age_group, is_active, subject:subjects(name_ar, emoji), questions:quiz_questions(count)')
      .order('sort_order'),
  ])

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-black text-gray-900">القصص ({stories?.length ?? 0})</h1>
          <Link href="/admin/stories/new" className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl">+ قصة جديدة</Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm divide-y">
          {(stories ?? []).map((s) => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3">
              <span className="text-xs bg-gray-100 rounded-full px-2 py-0.5 shrink-0">م{s.level}</span>
              <span className="flex-1 font-semibold text-gray-800 truncate">{s.title_ar}</span>
              <span className="text-xs text-gray-400 shrink-0">{Array.isArray(s.pages) ? `${s.pages.length} صفحات` : 'بدون صفحات'}</span>
              {!(Array.isArray(s.quiz) && s.quiz.length) && <span className="text-xs text-red-600 font-bold shrink-0">بلا أسئلة فهم</span>}
              <ToggleActive table="stories" id={s.id} active={s.is_active} />
              <Link href={`/admin/stories/${s.id}`} className="text-sm text-blue-600 font-bold shrink-0">تعديل</Link>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-black text-gray-900">الدروس ({lessons?.length ?? 0})</h2>
          <Link href="/admin/lessons/new" className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl">+ درس جديد</Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm divide-y">
          {(lessons ?? []).map((l) => {
            const subject = l.subject as unknown as { name_ar: string; emoji: string } | null
            const qCount = (l.questions as unknown as { count: number }[] | null)?.[0]?.count ?? 0
            return (
              <div key={l.id} className="flex items-center gap-3 px-4 py-3">
                <span className="shrink-0">{subject?.emoji}</span>
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold text-gray-800 truncate">{l.title_ar}</span>
                  <span className="block text-xs text-gray-400">{subject?.name_ar} · {l.age_group} · {qCount} أسئلة</span>
                </span>
                {qCount === 0 && <span className="text-xs text-red-600 font-bold shrink-0">بلا أسئلة</span>}
                <ToggleActive table="lessons" id={l.id} active={l.is_active} />
                <Link href={`/admin/lessons/${l.id}`} className="text-sm text-blue-600 font-bold shrink-0">تعديل</Link>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
