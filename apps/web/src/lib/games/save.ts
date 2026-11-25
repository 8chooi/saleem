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
  await supabase.from('game_sessions').insert({
    child_id: opts.childId,
    game_type: opts.gameType,
    subject_slug: opts.subject,
    score: opts.score,
    max_score: 100,
    duration_sec: Math.round((Date.now() - opts.startedAt) / 1000),
  })
  await supabase.rpc('increment_child_points', { p_child_id: opts.childId, p_points: Math.round(opts.score / 10) })
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
