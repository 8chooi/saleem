'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import StoryScene from '@/components/stories/StoryScene'
import ReadAloudRecorder from '@/components/stories/ReadAloudRecorder'
import { pagesFromContent, type StoryPage } from '@/lib/stories/pages'

interface Story {
  id: string
  slug: string
  title_ar: string
  content_ar: string
  cover_emoji: string
  age_group: string
  level: number | null
  pages: StoryPage[] | null
}

interface StoryReaderProps {
  story: Story
  childId?: string
  initiallyRead: boolean
}

const TEXT_SIZE: Record<number, string> = {
  1: 'text-3xl sm:text-4xl leading-[2.2]',
  2: 'text-2xl sm:text-3xl leading-[2.1]',
  3: 'text-xl sm:text-2xl leading-[2]',
  4: 'text-lg sm:text-xl leading-[2]',
}

function useArabicVoice() {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSupported(false)
      return
    }
    const pick = () => {
      const arabic = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('ar'))
      // الأصوات المحلية تُرسل أحداث الكلمات، فنفضّلها لتلوين الكلمة المقروءة
      setVoice(arabic.find((v) => v.localService) ?? arabic[0] ?? null)
    }
    pick()
    window.speechSynthesis.addEventListener('voiceschanged', pick)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', pick)
      window.speechSynthesis.cancel()
    }
  }, [])

  return { voice, supported }
}

export default function StoryReader({ story, childId, initiallyRead }: StoryReaderProps) {
  const pages = useMemo(
    () => (story.pages?.length ? story.pages : pagesFromContent(story.content_ar, story.cover_emoji)),
    [story.pages, story.content_ar, story.cover_emoji],
  )
  const level = story.level ?? 1

  const [pageIdx, setPageIdx] = useState(0)
  const [speaking, setSpeaking] = useState(false)
  const [watching, setWatching] = useState(false)
  const [wordIdx, setWordIdx] = useState(-1)
  const [isRead, setIsRead] = useState(initiallyRead)
  const [marking, setMarking] = useState(false)
  const { voice, supported } = useArabicVoice()

  const watchingRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const page = pages[pageIdx]
  const isLast = pageIdx === pages.length - 1
  const canSpeak = supported && !!voice

  const words = useMemo(() => {
    const out: { w: string; start: number }[] = []
    const re = /\S+/g
    let m: RegExpExecArray | null
    while ((m = re.exec(page.text))) out.push({ w: m[0], start: m.index })
    return out
  }, [page.text])

  const markAsRead = useCallback(async () => {
    if (!childId || marking) return
    setMarking(true)
    const supabase = createClient()
    await supabase.from('story_reads').upsert(
      { child_id: childId, story_id: story.id },
      { onConflict: 'child_id,story_id', ignoreDuplicates: true },
    )
    setIsRead(true)
    setMarking(false)
  }, [childId, marking, story.id])

  const stopAll = useCallback(() => {
    watchingRef.current = false
    setWatching(false)
    clearTimeout(timerRef.current)
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    setSpeaking(false)
    setWordIdx(-1)
  }, [])

  const playPage = useCallback(
    (idx: number) => {
      const p = pages[idx]
      const onDone = () => {
        setSpeaking(false)
        setWordIdx(-1)
        if (!watchingRef.current) return
        if (idx < pages.length - 1) {
          timerRef.current = setTimeout(() => {
            setPageIdx(idx + 1)
            playPage(idx + 1)
          }, 900)
        } else {
          watchingRef.current = false
          setWatching(false)
          if (!isRead) markAsRead()
        }
      }

      if (!canSpeak) {
        if (watchingRef.current) {
          const wordsCount = p.text.split(/\s+/).length
          timerRef.current = setTimeout(onDone, 2000 + wordsCount * 450)
        }
        return
      }

      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(p.text)
      u.voice = voice
      u.lang = voice!.lang
      u.rate = level <= 2 ? 0.8 : 0.9
      u.onboundary = (e) => {
        if (e.name && e.name !== 'word') return
        let i = 0
        const ws = p.text.match(/\S+/g) ?? []
        let pos = 0
        for (let k = 0; k < ws.length; k++) {
          const start = p.text.indexOf(ws[k], pos)
          if (start > e.charIndex) break
          i = k
          pos = start + ws[k].length
        }
        setWordIdx(i)
      }
      u.onend = onDone
      u.onerror = () => {
        setSpeaking(false)
        setWordIdx(-1)
      }
      setSpeaking(true)
      window.speechSynthesis.speak(u)
    },
    [pages, canSpeak, voice, level, isRead, markAsRead],
  )

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const goTo = (idx: number) => {
    stopAll()
    setPageIdx(Math.max(0, Math.min(pages.length - 1, idx)))
  }

  const toggleListen = () => {
    if (speaking) return stopAll()
    playPage(pageIdx)
  }

  const toggleWatch = () => {
    if (watching) return stopAll()
    stopAll()
    watchingRef.current = true
    setWatching(true)
    setPageIdx(0)
    playPage(0)
  }

  return (
    <div>
      <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-3 sm:p-4 mb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={pageIdx}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.35 }}
          >
            <StoryScene scene={page.scene} />
            <p
              className={`mt-5 mb-2 px-2 text-center font-bold text-gray-800 ${TEXT_SIZE[level] ?? TEXT_SIZE[1]}`}
              lang="ar"
            >
              {words.map((w, i) => (
                <span key={i}>
                  <span
                    className={`rounded-lg px-0.5 transition-colors ${
                      i === wordIdx ? 'bg-amber-300 text-gray-900' : ''
                    }`}
                  >
                    {w.w}
                  </span>{' '}
                </span>
              ))}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between gap-2 mt-3">
          <button
            onClick={() => goTo(pageIdx - 1)}
            disabled={pageIdx === 0}
            className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 text-2xl font-bold disabled:opacity-30"
            aria-label="الصفحة السابقة"
          >
            →
          </button>
          <div className="flex gap-1.5" aria-label={`صفحة ${pageIdx + 1} من ${pages.length}`}>
            {pages.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2.5 rounded-full transition-all ${i === pageIdx ? 'w-6 bg-amber-500' : 'w-2.5 bg-amber-200'}`}
                aria-label={`الصفحة ${i + 1}`}
              />
            ))}
          </div>
          <button
            onClick={() => goTo(pageIdx + 1)}
            disabled={isLast}
            className="w-12 h-12 rounded-full bg-amber-500 text-white text-2xl font-bold disabled:opacity-30"
            aria-label="الصفحة التالية"
          >
            ←
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-center mb-4">
        {canSpeak && (
          <button
            onClick={toggleListen}
            disabled={watching}
            className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-xl disabled:opacity-50"
          >
            {speaking && !watching ? '⏹ إيقاف' : '🔊 استمع'}
          </button>
        )}
        <button
          onClick={toggleWatch}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl"
        >
          {watching ? '⏹ إيقاف العرض' : '🎬 شاهد القصة'}
        </button>
      </div>

      {childId && <ReadAloudRecorder childId={childId} storyId={story.id} />}

      {!canSpeak && (
        <p className="text-center text-sm text-gray-500 mb-4">
          لا يتوفر صوت عربي على هذا الجهاز، فيعرض «شاهد القصة» الصفحات دون صوت.
        </p>
      )}

      {isLast && (
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
      )}
    </div>
  )
}
