import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import KidDashboard from './KidDashboard'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return { title: 'عالمي | سَلِيم' }
}

type Band = '3-5' | '6-8' | '9-12'
const LEVEL_BY_AGE: Record<Band, number> = { '3-5': 1, '6-8': 2, '9-12': 3 }
const WEEKLY_GOALS: Record<Band, { stories: number; lessons: number; games: number }> = {
  '3-5': { stories: 2, lessons: 1, games: 2 },
  '6-8': { stories: 3, lessons: 2, games: 2 },
  '9-12': { stories: 3, lessons: 3, games: 2 },
}

function weekStart() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 1) % 7))
  return d.toISOString()
}

interface Lesson {
  id: string
  slug: string
  title_ar: string
  age_group: string
  sort_order: number
  subject: { slug: string; name_ar: string; emoji: string; color: string } | null
}

export default async function KidHomePage({ params }: { params: { childId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: child } = await supabase
    .from('child_profiles')
    .select('id, name, avatar_emoji, age_group')
    .eq('id', params.childId)
    .eq('parent_id', user.id)
    .single()
  if (!child) notFound()

  const band = (child.age_group as Band) ?? '6-8'
  const level = LEVEL_BY_AGE[band] ?? 1
  const since = weekStart()

  const [
    { data: points },
    { data: badges },
    { data: reads },
    { data: stories },
    { data: lessons },
    { data: progress },
    { data: tasks },
    { count: weekGames },
  ] = await Promise.all([
    supabase.from('child_points').select('total_points').eq('child_id', child.id).single(),
    supabase.from('child_badges').select('earned_at, badge:badges(name_ar, emoji)').eq('child_id', child.id).order('earned_at', { ascending: false }).limit(4),
    supabase.from('story_reads').select('story_id, read_at').eq('child_id', child.id),
    supabase.from('stories').select('id, slug, title_ar, cover_emoji, level').eq('is_active', true).lte('level', level + 1).order('level').order('sort_order'),
    supabase.from('lessons').select('id, slug, title_ar, age_group, sort_order, subject:subjects(slug, name_ar, emoji, color)').eq('is_active', true).order('sort_order'),
    supabase.from('learning_progress').select('lesson_id, status, started_at, completed_at').eq('child_id', child.id),
    supabase.from('child_assignments').select('id, note, story:stories(slug, title_ar, cover_emoji), lesson:lessons(slug, title_ar, subject:subjects(slug, emoji))').eq('child_id', child.id).is('completed_at', null).order('created_at', { ascending: false }).limit(3),
    supabase.from('game_sessions').select('*', { count: 'exact', head: true }).eq('child_id', child.id).gte('played_at', since).gte('score', 60),
  ])

  const q = `?child=${child.id}`
  const readIds = new Set((reads ?? []).map((r: { story_id: string }) => r.story_id))
  const picked = (stories ?? [])
    .filter((s: { id: string }) => !readIds.has(s.id))
    .sort((a: { level: number }, b: { level: number }) => Math.abs(a.level - level) - Math.abs(b.level - level))
    .slice(0, 6)

  const allLessons = (lessons ?? []) as unknown as Lesson[]
  const doneSet = new Set((progress ?? []).filter((p) => p.status === 'completed').map((p) => p.lesson_id))
  const inProgress = (progress ?? [])
    .filter((p) => p.status === 'in_progress')
    .sort((a, b) => String(b.started_at).localeCompare(String(a.started_at)))[0]
  const suitable = allLessons.filter((l) => l.age_group === band || l.age_group === 'all')
  const continueLesson =
    allLessons.find((l) => l.id === inProgress?.lesson_id) ??
    suitable.find((l) => !doneSet.has(l.id)) ??
    allLessons.find((l) => !doneSet.has(l.id))
  const challenge = suitable.find((l) => !doneSet.has(l.id) && l.id !== continueLesson?.id)

  const worldsMap = new Map<string, { slug: string; name_ar: string; emoji: string; color: string; total: number; done: number }>()
  for (const l of allLessons) {
    if (!l.subject) continue
    const w = worldsMap.get(l.subject.slug) ?? { ...l.subject, total: 0, done: 0 }
    w.total++
    if (doneSet.has(l.id)) w.done++
    worldsMap.set(l.subject.slug, w)
  }

  const goals = WEEKLY_GOALS[band] ?? WEEKLY_GOALS['6-8']
  const weekDone = {
    stories: (reads ?? []).filter((r: { read_at: string }) => r.read_at >= since).length,
    lessons: (progress ?? []).filter((p) => p.status === 'completed' && p.completed_at && p.completed_at >= since).length,
    games: weekGames ?? 0,
  }

  const lessonBaseHref = (l: Lesson) => `/worlds/${l.subject?.slug}/lessons/${l.slug}`

  const activities = [
    { href: `/stories${q}`, icon: '📖', label: 'اقرأ', color: '#22c55e', shadow: '#15803d' },
    { href: `/games${q}`, icon: '🎮', label: 'العب', color: '#8b5cf6', shadow: '#6d28d9' },
    { href: `/draw${q}`, icon: '🎨', label: 'ارسم', color: '#f43f5e', shadow: '#be123c' },
    { href: continueLesson ? `${lessonBaseHref(continueLesson)}${q}` : `/worlds/letters${q}`, icon: '🎓', label: 'تعلّم', color: '#3b82f6', shadow: '#1d4ed8' },
    { href: `/badges${q}`, icon: '🏅', label: 'شاراتي', color: '#f59e0b', shadow: '#b45309' },
  ]

  const weekRows = [
    { key: 'stories' as const, icon: '📖', label: 'قصص', href: `/stories${q}`, done: weekDone.stories, goal: goals.stories },
    { key: 'lessons' as const, icon: '🎓', label: 'دروس', href: continueLesson ? `${lessonBaseHref(continueLesson)}${q}` : `/worlds/letters${q}`, done: weekDone.lessons, goal: goals.lessons },
    { key: 'games' as const, icon: '🎮', label: 'ألعاب', href: `/games${q}`, done: weekDone.games, goal: goals.games },
  ]

  const weekComplete = weekRows.every((r) => r.done >= r.goal)

  return (
    <KidDashboard
      child={child}
      points={points?.total_points ?? 0}
      band={band}
      q={q}
      activities={activities}
      tasks={(tasks ?? []) as unknown as Parameters<typeof KidDashboard>[0]['tasks']}
      picked={(picked as unknown as Parameters<typeof KidDashboard>[0]['picked'])}
      badges={(badges ?? []) as unknown as Parameters<typeof KidDashboard>[0]['badges']}
      worlds={Array.from(worldsMap.values()).filter(w => w.total > 0)}
      continueLesson={continueLesson ?? null}
      challenge={challenge ?? null}
      inProgressId={inProgress?.lesson_id ?? null}
      weekRows={weekRows}
      weekComplete={weekComplete}
    />
  )
}
