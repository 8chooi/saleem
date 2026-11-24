import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

import StoryReader from './StoryReader'

export default async function StoryPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { child?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: story } = await supabase
    .from('stories')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (!story) notFound()

  const selectedChildId = searchParams.child

  let isRead = false
  if (selectedChildId) {
    const { data } = await supabase
      .from('story_reads')
      .select('id')
      .eq('child_id', selectedChildId)
      .eq('story_id', story.id)
      .single()
    isRead = !!data
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-amber-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href={`/stories${selectedChildId ? `?child=${selectedChildId}` : ''}`}
            className="text-amber-600 hover:text-amber-800 text-sm font-medium"
          >
            ← المكتبة
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">⏱ {story.read_time_min} دقائق</span>
            {isRead && <span className="text-green-500 text-sm font-medium">✓ تمت القراءة</span>}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Story Header */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-4">{story.cover_emoji}</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{story.title_ar}</h1>
          <p className="text-gray-500">{story.summary_ar}</p>
          <div className="mt-3 inline-block bg-amber-100 text-amber-700 text-sm px-3 py-1 rounded-full">
            {story.age_group === '3-5' ? '٣–٥ سنوات' :
             story.age_group === '6-8' ? '٦–٨ سنوات' :
             story.age_group === '9-12' ? '٩–١٢ سنة' : 'جميع الأعمار'}
          </div>
        </div>

        {/* Story Content */}
        <StoryReader
          story={story}
          childId={selectedChildId}
          initiallyRead={isRead}
        />
      </div>
    </div>
  )
}
