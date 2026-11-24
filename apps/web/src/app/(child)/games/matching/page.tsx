import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MatchingGame from './MatchingGame'

export default async function MatchingGamePage({
  searchParams,
}: {
  searchParams: { child?: string; subject?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: children } = await supabase
    .from('child_profiles')
    .select('id, name, age')
    .eq('parent_id', user.id)
    .order('created_at')

  const selectedChildId = searchParams.child || children?.[0]?.id
  const subject = searchParams.subject || 'letters'

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white" dir="rtl">
      <MatchingGame childId={selectedChildId} subject={subject} />
    </div>
  )
}
