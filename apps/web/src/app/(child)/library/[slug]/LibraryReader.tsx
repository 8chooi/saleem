'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface Page {
  img: string | null
  text: string
  type: string
}

interface Book {
  sw_id: number
  slug: string
  title: string
  level: number | null
  credits: string[]
  coverUrl: string | null
  orientation: string
  audio_url: string | null
  vtt_url: string | null
  pages: Page[] | null
}

function creditLine(credits: string[]) {
  if (credits.length >= 3)
    return `تأليف: ${credits[0]} · رسم: ${credits[1]} · ترجمة: ${credits[2]}`
  return credits.join(' · ')
}

export default function LibraryReader({
  book,
  backHref,
  childId,
}: {
  book: Book
  backHref: string
  childId?: string
}) {
  const pages = book.pages ?? []
  const hasPages = pages.length > 0
  // Pages from API: first is FrontCoverPage, rest are StoryPage/BackCoverPage (already filtered)
  const storyPages = hasPages ? pages.filter(p => p.type !== 'FrontCoverPage') : []
  const totalPages = storyPages.length

  const [current, setCurrent] = useState(0) // 0 = cover
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [autoRead, setAutoRead] = useState(false)

  // TTS fallback
  function readAloud(text: string) {
    if (!text) return
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const v = window.speechSynthesis.getVoices().find(x => x.lang.toLowerCase().startsWith('ar'))
    if (!v) return
    const u = new SpeechSynthesisUtterance(text)
    u.voice = v; u.lang = v.lang; u.rate = 0.85
    window.speechSynthesis.speak(u)
  }

  function toggleAudio() {
    if (!audioRef.current) return
    if (playing) { audioRef.current.pause(); setPlaying(false) }
    else { audioRef.current.play(); setPlaying(true) }
  }

  const goNext = () => {
    if (current < totalPages) setCurrent(c => c + 1)
  }
  const goPrev = () => {
    if (current > 0) setCurrent(c => c - 1)
  }

  const isLandscape = book.orientation !== 'portrait'

  const page = current === 0 ? null : storyPages[current - 1]

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 text-white">
        <Link href={backHref} className="text-sm font-bold text-gray-300 hover:text-white">
          ← رجوع
        </Link>
        <h1 className="text-base font-black truncate max-w-[180px]">{book.title}</h1>
        <span className="text-xs text-gray-400">
          {current === 0 ? 'الغلاف' : `${current} / ${totalPages}`}
        </span>
      </div>

      {/* Story area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 gap-4">

        {/* Cover page */}
        {current === 0 && (
          <div className="w-full max-w-lg">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full rounded-2xl shadow-2xl"
              />
            ) : (
              <div className="w-full aspect-[4/3] rounded-2xl bg-gray-700 flex items-center justify-center">
                <span className="text-6xl">📖</span>
              </div>
            )}
            <div className="mt-4 bg-gray-800 rounded-xl p-4 text-center">
              <p className="text-white text-lg font-black mb-2">{book.title}</p>
              {book.credits.length > 0 && (
                <p className="text-gray-300 text-sm">{creditLine(book.credits)}</p>
              )}
              <p className="text-gray-500 text-xs mt-2">CC BY 4.0 · StoryWeaver / Pratham Books</p>
            </div>
            {!hasPages && (
              <div className="mt-4 bg-amber-900/40 rounded-xl p-4 text-center">
                <p className="text-amber-200 text-sm">صفحات القصة بتُحمَّل تدريجيًا</p>
                <a
                  href={`https://storyweaver.org.in/en/stories/${book.sw_id}-${book.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sky-400 text-sm underline"
                >
                  اقرأ على StoryWeaver
                </a>
              </div>
            )}
          </div>
        )}

        {/* Story pages */}
        {current > 0 && page && (
          <div className={`w-full ${isLandscape ? 'max-w-2xl' : 'max-w-sm'}`}>
            {page.img ? (
              <img
                src={page.img}
                alt={`صفحة ${current}`}
                className="w-full rounded-2xl shadow-2xl"
                loading="lazy"
              />
            ) : (
              <div className="w-full aspect-[4/3] rounded-2xl bg-gray-700 flex items-center justify-center">
                <span className="text-4xl">🖼</span>
              </div>
            )}
            {page.text && (
              <div className="mt-4 bg-gray-800 rounded-xl p-4">
                <p className="text-white text-xl font-bold text-center leading-relaxed">
                  {page.text}
                </p>
                <button
                  onClick={() => readAloud(page.text)}
                  className="block mx-auto mt-3 text-sm text-gray-400 hover:text-white"
                >
                  🔊 استمع
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between gap-4">
        <button
          onClick={goPrev}
          disabled={current === 0}
          className="bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-white font-bold px-5 py-2.5 rounded-xl"
        >
          ← السابق
        </button>

        {/* Audio controls (if audio available) */}
        {book.audio_url && (
          <>
            <audio
              ref={audioRef}
              src={book.audio_url}
              onEnded={() => setPlaying(false)}
              className="hidden"
            />
            <button
              onClick={toggleAudio}
              className="bg-sky-700 hover:bg-sky-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm"
            >
              {playing ? '⏸ إيقاف' : '▶ القصة بصوت'}
            </button>
          </>
        )}

        <button
          onClick={goNext}
          disabled={current >= totalPages || !hasPages}
          className="bg-gray-700 hover:bg-gray-600 disabled:opacity-30 text-white font-bold px-5 py-2.5 rounded-xl"
        >
          التالي →
        </button>
      </div>

      {/* Page dots */}
      {hasPages && totalPages <= 20 && (
        <div className="bg-gray-900 py-2 flex justify-center gap-1.5">
          <button
            onClick={() => setCurrent(0)}
            className={`w-2 h-2 rounded-full transition-colors ${current === 0 ? 'bg-sky-400' : 'bg-gray-600'}`}
          />
          {storyPages.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i + 1)}
              className={`w-2 h-2 rounded-full transition-colors ${current === i + 1 ? 'bg-sky-400' : 'bg-gray-600'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
