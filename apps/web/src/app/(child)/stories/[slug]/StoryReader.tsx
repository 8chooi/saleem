'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Story {
  id: string
  slug: string
  title_ar: string
  content_ar: string
  cover_emoji: string
  age_group: string
}

interface StoryReaderProps {
  story: Story
  childId?: string
  initiallyRead: boolean
}

export default function StoryReader({ story, childId, initiallyRead }: StoryReaderProps) {
  const [isRead, setIsRead] = useState(initiallyRead)
  const [marking, setMarking] = useState(false)

  const markAsRead = async () => {
    if (!childId || isRead || marking) return
    setMarking(true)
    const supabase = createClient()
    await supabase.from('story_reads').upsert({
      child_id: childId,
      story_id: story.id,
    })
    setIsRead(true)
    setMarking(false)
  }

  return (
    <div>
      {/* Story Content Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 mb-6">
        <div
          className="prose prose-lg prose-amber max-w-none text-gray-700 leading-relaxed text-right"
          style={{ fontFamily: 'Cairo, sans-serif', fontSize: '1.1rem', lineHeight: '2' }}
          dangerouslySetInnerHTML={{ __html: story.content_ar }}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {childId && !isRead && (
          <button
            onClick={markAsRead}
            disabled={marking}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-xl transition-colors disabled:opacity-50"
          >
            {marking ? 'جارٍ الحفظ...' : '✅ قرأت هذه القصة'}
          </button>
        )}
        {isRead && (
          <div className="text-center bg-green-50 border border-green-200 rounded-xl py-3 px-8">
            <span className="text-green-600 font-bold">✓ أحسنت! قرأت هذه القصة</span>
          </div>
        )}
        <Link
          href={`/stories${childId ? `?child=${childId}` : ''}`}
          className="border border-amber-300 text-amber-700 hover:bg-amber-50 font-medium py-3 px-8 rounded-xl transition-colors text-center"
        >
          📚 المزيد من القصص
        </Link>
      </div>
    </div>
  )
}
