'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
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

// تنظيف نص الصفحة من كود JavaScript المضمّن (من StoryWeaver)
function cleanPageText(raw: string): string {
  if (!raw) return ''
  return raw
    .replace(/ready\s*\(\s*function[\s\S]*$/i, '')
    .replace(/\$\s*\(\s*document\s*\)[\s\S]*$/i, '')
    .replace(/var\s+\w+\s*=\s*new\s+\w+[\s\S]*$/i, '')
    .replace(/<[^>]+>/g, '')           // strip any HTML tags
    .replace(/https?:\/\/\S+/g, '')    // strip URLs
    .replace(/\s{2,}/g, ' ')
    .trim()
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

// VTT cue: { start, end } in seconds
interface VttCue { start: number; end: number; index: number }

function parseVtt(text: string): VttCue[] {
  const cues: VttCue[] = []
  const blocks = text.split(/\n\n+/)
  let index = 0
  for (const block of blocks) {
    const lines = block.trim().split('\n')
    const timeLine = lines.find(l => l.includes('-->'))
    if (!timeLine) continue
    const [s, e] = timeLine.split('-->').map(t => {
      const p = t.trim().replace(',', '.').split(':')
      if (p.length === 3) return +p[0] * 3600 + +p[1] * 60 + +p[2]
      return +p[0] * 60 + +p[1]
    })
    if (!isNaN(s) && !isNaN(e)) cues.push({ start: s, end: e, index })
    index++
  }
  return cues
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
  const [audioError, setAudioError] = useState(false)
  const [swipe, setSwipe] = useState<'left' | 'right' | null>(null)
  const touchX = useRef<number | null>(null)
  const vttCues = useRef<VttCue[]>([])
  const syncActive = useRef(false)

  // TTS state
  const [ttsPlaying, setTtsPlaying] = useState(false)
  const [autoAdvance, setAutoAdvance] = useState(false)
  const [arabicVoice, setArabicVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [ttsSupported, setTtsSupported] = useState(true)
  const autoAdvanceRef = useRef(false)

  const page = useMemo(() => current === 0 ? null : storyPages[current - 1], [current, storyPages])
  const nextPage = useMemo(() => current > 0 && current < totalPages ? storyPages[current] : null, [current, storyPages, totalPages])
  const pageText = useMemo(() => page ? cleanPageText(page.text) : '', [page])

  // Load VTT for sync
  useEffect(() => {
    if (!book.vtt_url) return
    fetch(book.vtt_url)
      .then(r => r.text())
      .then(text => { vttCues.current = parseVtt(text) })
      .catch(() => {})
  }, [book.vtt_url])

  // Detect Arabic voice for TTS
  useEffect(() => {
    if (!('speechSynthesis' in window)) { setTtsSupported(false); return }
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices()
      const ar = voices.find(v => v.lang.toLowerCase().startsWith('ar') && v.localService)
        ?? voices.find(v => v.lang.toLowerCase().startsWith('ar'))
      setArabicVoice(ar ?? null)
      if (voices.length > 0 && !ar) setTtsSupported(false)
    }
    pickVoice()
    window.speechSynthesis.addEventListener('voiceschanged', pickVoice)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', pickVoice)
  }, [])

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
      window.speechSynthesis?.cancel()
      setTtsPlaying(false)
    }
  }, [])

  // VTT sync: advance page when audio time passes cue boundary
  const onTimeUpdate = useCallback(() => {
    if (!syncActive.current || !audioRef.current) return
    const t = audioRef.current.currentTime
    // find which page cue we're in (cue index 0 = page 1, etc.)
    const cue = vttCues.current.find(c => t >= c.start && t < c.end)
    if (cue) {
      const targetPage = cue.index + 1  // pages start at 1 (0 = cover)
      setCurrent(prev => {
        if (prev !== targetPage && targetPage <= totalPages) return targetPage
        return prev
      })
    }
  }, [totalPages])

  const ttsRead = useCallback((text: string, onDone?: () => void) => {
    if (!text || !arabicVoice || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.voice = arabicVoice
    u.lang = arabicVoice.lang
    u.rate = 0.85
    u.onstart = () => setTtsPlaying(true)
    u.onend = () => { setTtsPlaying(false); onDone?.() }
    u.onerror = () => setTtsPlaying(false)
    setTtsPlaying(true)
    window.speechSynthesis.speak(u)
  }, [arabicVoice])

  const stopTts = useCallback(() => {
    autoAdvanceRef.current = false
    setAutoAdvance(false)
    window.speechSynthesis?.cancel()
    setTtsPlaying(false)
  }, [])

  // Auto-advance: use a ref-based loop to avoid stale closure on recursive callback
  const autoPageRef = useRef(0)

  const readPageAndAdvance = useCallback((idx: number) => {
    if (!autoAdvanceRef.current) return
    const p = storyPages[idx]
    if (!p) { autoAdvanceRef.current = false; setAutoAdvance(false); return }
    autoPageRef.current = idx
    setCurrent(idx + 1)
    const text = cleanPageText(p.text)
    if (!text) {
      setTimeout(() => {
        if (autoAdvanceRef.current) readPageAndAdvance(idx + 1)
      }, 1500)
      return
    }
    if (!arabicVoice || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.voice = arabicVoice
    u.lang = arabicVoice.lang
    u.rate = 0.85
    u.onstart = () => setTtsPlaying(true)
    u.onend = () => {
      setTtsPlaying(false)
      if (!autoAdvanceRef.current) return
      const next = idx + 1
      if (next < storyPages.length) {
        setTimeout(() => { if (autoAdvanceRef.current) readPageAndAdvance(next) }, 700)
      } else {
        autoAdvanceRef.current = false
        setAutoAdvance(false)
      }
    }
    u.onerror = () => { setTtsPlaying(false) }
    setTtsPlaying(true)
    window.speechSynthesis.speak(u)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arabicVoice, storyPages])

  const toggleAutoAdvance = useCallback(() => {
    if (autoAdvance) {
      stopTts()
    } else {
      const idx = current > 0 ? current - 1 : 0
      autoAdvanceRef.current = true
      setAutoAdvance(true)
      readPageAndAdvance(idx)
    }
  }, [autoAdvance, current, readPageAndAdvance, stopTts])

  const toggleTts = useCallback(() => {
    if (ttsPlaying) {
      stopTts()
    } else if (pageText && arabicVoice) {
      ttsRead(pageText)
    }
  }, [ttsPlaying, pageText, arabicVoice, ttsRead, stopTts])

  function toggleAudio() {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      syncActive.current = false
      setPlaying(false)
    } else {
      setAudioError(false)
      const promise = audioRef.current.play()
      if (promise !== undefined) {
        promise
          .then(() => {
            setPlaying(true)
            if (vttCues.current.length > 0) syncActive.current = true
          })
          .catch(() => {
            setPlaying(false)
            setAudioError(true)
          })
      } else {
        setPlaying(true)
      }
    }
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

  // Seek audio to matching cue when user manually turns page
  function seekToPage(pageNum: number) {
    if (!audioRef.current || !playing || !syncActive.current) return
    const cue = vttCues.current.find(c => c.index === pageNum - 1)
    if (cue) audioRef.current.currentTime = cue.start
  }

  function goNextWithSeek() {
    if (current < totalPages) {
      setSwipe('left')
      setTimeout(() => {
        setCurrent(c => { seekToPage(c + 1); return c + 1 })
        setSwipe(null)
      }, 150)
      playTurn()
    }
  }

  function goPrevWithSeek() {
    if (current > 0) {
      setSwipe('right')
      setTimeout(() => {
        setCurrent(c => { seekToPage(c - 1); return c - 1 })
        setSwipe(null)
      }, 150)
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
      if (diff > 0) goNextWithSeek()
      else goPrevWithSeek()
    }
    touchX.current = null
  }

  const isLandscape = book.orientation !== 'portrait'

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
                loading="eager" />
            ) : (
              <div className="w-full aspect-[4/3] rounded-3xl bg-white/10 flex items-center justify-center">
                <span className="text-6xl">🖼</span>
              </div>
            )}
            {/* preload next page image */}
            {nextPage?.img && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={nextPage.img} alt="" aria-hidden className="hidden" loading="eager" />
            )}

            {pageText && (
              <div className="mt-4 rounded-2xl p-5"
                style={{background:'rgba(255,255,255,0.12)',backdropFilter:'blur(8px)'}}>
                <p className="text-white text-xl font-bold text-center leading-relaxed">{pageText}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Audio controls bar */}
      {current > 0 && (
        <div className="px-3 pt-3 pb-1 flex items-center gap-2 justify-center flex-wrap"
          style={{background:'rgba(255,255,255,0.05)'}}>
          {book.audio_url ? (
            <>
              <audio
                ref={audioRef}
                src={book.audio_url}
                onEnded={() => { setPlaying(false); syncActive.current = false }}
                onTimeUpdate={onTimeUpdate}
                onError={() => { setPlaying(false); setAudioError(true); syncActive.current = false }}
                className="hidden"
              />
              <button onClick={toggleAudio}
                className="flex items-center gap-2 text-white font-black px-5 py-2.5 rounded-2xl active:scale-95 transition-all text-sm"
                style={{
                  background: audioError ? 'rgba(239,68,68,0.5)' : playing ? 'rgba(16,185,129,0.6)' : 'rgba(99,102,241,0.7)',
                  boxShadow:'0 4px 0 rgba(0,0,0,0.3)'
                }}>
                {audioError ? '⚠ خطأ في الصوت' : playing ? '⏸ كتم' : '▶ تشغيل الصوت'}
              </button>
            </>
          ) : ttsSupported && arabicVoice && pageText ? (
            <>
              <button onClick={toggleTts}
                className="flex items-center gap-2 text-white font-black px-4 py-2.5 rounded-2xl active:scale-95 transition-all text-sm"
                style={{
                  background: ttsPlaying && !autoAdvance ? 'rgba(16,185,129,0.6)' : 'rgba(99,102,241,0.7)',
                  boxShadow:'0 4px 0 rgba(0,0,0,0.3)'
                }}>
                {ttsPlaying && !autoAdvance ? '⏸ كتم' : '🔊 اقرأ'}
              </button>
              <button onClick={toggleAutoAdvance}
                className="flex items-center gap-2 text-white font-black px-4 py-2.5 rounded-2xl active:scale-95 transition-all text-sm"
                style={{
                  background: autoAdvance ? 'rgba(245,158,11,0.7)' : 'rgba(255,255,255,0.12)',
                  boxShadow:'0 4px 0 rgba(0,0,0,0.3)'
                }}>
                {autoAdvance ? '⏹ إيقاف التلقائي' : '▶▶ قراءة تلقائية'}
              </button>
            </>
          ) : !ttsSupported || !arabicVoice ? (
            <span className="text-white/40 text-xs text-center px-2">
              🔇 جهازك لا يدعم قراءة اللغة العربية
            </span>
          ) : null}
        </div>
      )}

      {/* Controls */}
      <div className="px-3 py-3 flex items-center justify-between gap-2"
        style={{background:'rgba(255,255,255,0.08)',backdropFilter:'blur(10px)'}}>
        <button onClick={goPrevWithSeek} disabled={current === 0}
          className="text-white font-black px-4 py-3 rounded-2xl disabled:opacity-30 active:scale-95 transition-all text-sm shrink-0"
          style={{background:'rgba(255,255,255,0.15)',boxShadow: current > 0 ? '0 4px 0 rgba(0,0,0,0.3)' : 'none'}}>
          ← سابق
        </button>

        <button onClick={goNextWithSeek} disabled={current >= totalPages || !hasPages}
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
            <button key={i} onClick={() => { setCurrent(i + 1); playTurn(); seekToPage(i + 1) }}
              className={`rounded-full transition-all ${current === i + 1 ? 'w-5 h-2 bg-indigo-400' : 'w-2 h-2 bg-white/30'}`} />
          ))}
        </div>
      )}
    </div>
  )
}
