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

function playTurn() {
  try {
    const ctx = new AudioContext()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.type = 'sine'
    o.frequency.setValueAtTime(400, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08)
    g.gain.setValueAtTime(0.15, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
    o.start(); o.stop(ctx.currentTime + 0.12)
    setTimeout(() => ctx.close(), 300)
  } catch {}
}

export default function LibraryReader({
  book,
  backHref,
}: {
  book: Book
  backHref: string
  childId?: string
}) {
  const pages = book.pages ?? []
  const hasPages = pages.length > 0
  const storyPages = hasPages ? pages.filter(p => p.type !== 'FrontCoverPage') : []
  const totalPages = storyPages.length

  const [current, setCurrent] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [swipe, setSwipe] = useState<'left' | 'right' | null>(null)
  const touchX = useRef<number | null>(null)

  function readAloud(text: string) {
    if (!text || !('speechSynthesis' in window)) return
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

  function goNext() {
    if (current < totalPages) {
      setSwipe('left')
      setTimeout(() => { setCurrent(c => c + 1); setSwipe(null) }, 150)
      playTurn()
    }
  }

  function goPrev() {
    if (current > 0) {
      setSwipe('right')
      setTimeout(() => { setCurrent(c => c - 1); setSwipe(null) }, 150)
      playTurn()
    }
  }

  function onTouchStart(e: React.TouchEvent) {
    touchX.current = e.touches[0].clientX
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchX.current === null) return
    const diff = touchX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext()
      else goPrev()
    }
    touchX.current = null
  }

  const isLandscape = book.orientation !== 'portrait'
  const page = current === 0 ? null : storyPages[current - 1]

  return (
    <div
      className="min-h-screen flex flex-col"
      dir="rtl"
      style={{background:'linear-gradient(160deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%)'}}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3"
        style={{background:'rgba(255,255,255,0.08)',backdropFilter:'blur(10px)'}}>
        <Link href={backHref}
          className="flex items-center gap-1 text-white/80 font-bold text-sm px-3 py-1.5 rounded-xl"
          style={{background:'rgba(255,255,255,0.12)'}}>
          ← رجوع
        </Link>
        <h1 className="text-white font-black text-base truncate flex-1 text-center px-2">{book.title}</h1>
        <span className="text-white/60 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-xl">
          {current === 0 ? 'الغلاف' : `${current} / ${totalPages}`}
        </span>
      </div>

      {/* Story area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 gap-4"
        style={{
          transform: swipe === 'left' ? 'translateX(-20px)' : swipe === 'right' ? 'translateX(20px)' : 'none',
          opacity: swipe ? 0 : 1,
          transition: 'transform 0.15s ease, opacity 0.15s ease'
        }}>

        {/* Cover */}
        {current === 0 && (
          <div className="w-full max-w-lg">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title}
                className="w-full rounded-3xl shadow-2xl"
                style={{boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}} />
            ) : (
              <div className="w-full aspect-[4/3] rounded-3xl bg-white/10 flex items-center justify-center">
                <span className="text-8xl">📖</span>
              </div>
            )}
            <div className="mt-4 rounded-2xl p-4 text-center"
              style={{background:'rgba(255,255,255,0.1)',backdropFilter:'blur(8px)'}}>
              <p className="text-white text-xl font-black mb-1">{book.title}</p>
              {book.credits.length > 0 && (
                <p className="text-white/40 text-[10px] mt-2">{creditLine(book.credits)} · CC BY 4.0 · Pratham Books</p>
              )}
            </div>
            {!hasPages && (
              <div className="mt-3 rounded-2xl p-4 text-center bg-white/5">
                <p className="text-white/50 text-sm">صفحات القصة قريباً</p>
              </div>
            )}
          </div>
        )}

        {/* Story pages */}
        {current > 0 && page && (
          <div className={`w-full ${isLandscape ? 'max-w-2xl' : 'max-w-sm'}`}>
            {page.img ? (
              <img src={page.img} alt={`صفحة ${current}`}
                className="w-full rounded-3xl shadow-2xl"
                style={{boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}}
                loading="lazy" />
            ) : (
              <div className="w-full aspect-[4/3] rounded-3xl bg-white/10 flex items-center justify-center">
                <span className="text-6xl">🖼</span>
              </div>
            )}
            {page.text && (
              <div className="mt-4 rounded-2xl p-5"
                style={{background:'rgba(255,255,255,0.12)',backdropFilter:'blur(8px)'}}>
                <p className="text-white text-xl font-bold text-center leading-relaxed">{page.text}</p>
                <button onClick={() => readAloud(page.text)}
                  className="block mx-auto mt-3 text-white/60 hover:text-white/90 transition-colors text-sm font-bold"
                  aria-label="استمع للنص">
                  🔊 استمع
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-3 py-3 flex items-center justify-between gap-2"
        style={{background:'rgba(255,255,255,0.08)',backdropFilter:'blur(10px)'}}>
        <button onClick={goPrev} disabled={current === 0}
          className="text-white font-black px-4 py-3 rounded-2xl disabled:opacity-30 active:scale-95 transition-all text-sm shrink-0"
          style={{background:'rgba(255,255,255,0.15)',boxShadow: current > 0 ? '0 4px 0 rgba(0,0,0,0.3)' : 'none'}}>
          ← سابق
        </button>

        {book.audio_url && (
          <>
            <audio ref={audioRef} src={book.audio_url} onEnded={() => setPlaying(false)} className="hidden" />
            <button onClick={toggleAudio}
              className="text-white font-black px-3 py-3 rounded-2xl active:scale-95 transition-all text-xs flex-1 max-w-[140px]"
              style={{background:'rgba(99,102,241,0.6)',boxShadow:'0 4px 0 rgba(0,0,0,0.3)'}}>
              {playing ? '⏸ إيقاف' : '▶ صوت'}
            </button>
          </>
        )}

        <button onClick={goNext} disabled={current >= totalPages || !hasPages}
          className="text-white font-black px-4 py-3 rounded-2xl disabled:opacity-30 active:scale-95 transition-all text-sm shrink-0"
          style={{background:'rgba(255,255,255,0.15)',boxShadow: current < totalPages && hasPages ? '0 4px 0 rgba(0,0,0,0.3)' : 'none'}}>
          تالي →
        </button>
      </div>

      {/* Dots */}
      {hasPages && totalPages <= 20 && (
        <div className="py-2 flex justify-center gap-1.5" style={{background:'rgba(0,0,0,0.3)'}}>
          <button onClick={() => setCurrent(0)}
            className={`rounded-full transition-all ${current === 0 ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/30'}`} />
          {storyPages.map((_, i) => (
            <button key={i} onClick={() => { setCurrent(i + 1); playTurn() }}
              className={`rounded-full transition-all ${current === i + 1 ? 'w-5 h-2 bg-indigo-400' : 'w-2 h-2 bg-white/30'}`} />
          ))}
        </div>
      )}
    </div>
  )
}
