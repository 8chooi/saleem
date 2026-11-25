import { createClient } from '@/lib/supabase/client'

export async function saveGameSession(opts: {
  childId?: string
  gameType: string
  subject: string
  score: number
  startedAt: number
}) {
  if (!opts.childId) return
  const supabase = createClient()
  const earnsPoints = await shouldAwardPoints(opts.childId, opts.gameType, opts.score)
  await supabase.from('game_sessions').insert({
    child_id: opts.childId,
    game_type: opts.gameType,
    subject_slug: opts.subject,
    score: opts.score,
    max_score: 100,
    duration_sec: Math.round((Date.now() - opts.startedAt) / 1000),
  })
  if (earnsPoints) {
    await supabase.rpc('increment_child_points', { p_child_id: opts.childId, p_points: Math.round(opts.score / 10) })
  }
}

// النقاط تعكس الإتقان: 60% فأكثر، ومرة واحدة لكل لعبة في اليوم حتى لا تُجمع بالتكرار
export async function shouldAwardPoints(childId: string, gameType: string, score: number) {
  if (score < 60) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { count } = await createClient()
    .from('game_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('child_id', childId)
    .eq('game_type', gameType)
    .gte('score', 60)
    .gte('played_at', today.toISOString())
  return (count ?? 0) === 0
}

export const AR_DIGITS = (n: number) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)])

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
