import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { pagesFromContent } from '@/lib/stories/pages'
import StoryEditor, { type StoryInput } from './StoryEditor'

export default async function EditStoryPage({ params }: { params: { id: string } }) {
  if (params.id === 'new') {
    const blank: StoryInput = {
      slug: `story-${Date.now().toString(36)}`, title_ar: '', summary_ar: '', cover_emoji: '📖',
      level: 1, age_group: '3-5', read_time_min: 3, is_active: false, pages: null,
    }
    return <StoryEditor initial={blank} />
  }

  const supabase = createClient()
  const { data: s } = await supabase
    .from('stories')
    .select('id, slug, title_ar, summary_ar, cover_emoji, level, age_group, read_time_min, is_active, pages, content_ar')
    .eq('id', params.id)
    .single()
  if (!s) notFound()

  return (
    <StoryEditor
      initial={{
        id: s.id, slug: s.slug, title_ar: s.title_ar, summary_ar: s.summary_ar ?? '', cover_emoji: s.cover_emoji,
        level: s.level ?? 1, age_group: s.age_group, read_time_min: s.read_time_min, is_active: s.is_active,
        pages: s.pages?.length ? s.pages : pagesFromContent(s.content_ar, s.cover_emoji),
      }}
    />
  )
}
