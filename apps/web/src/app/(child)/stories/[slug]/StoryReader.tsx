'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import StoryScene from '@/components/stories/StoryScene'
import ReadAloudRecorder from '@/components/stories/ReadAloudRecorder'
import StoryQuiz, { type QuizItem } from '@/components/stories/StoryQuiz'
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
  quiz: QuizItem[] | null
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
  const [activeTab, setActiveTab] = useState<'story' | 'vocab' | 'exercises'>('story')
  const { voice, supported } = useArabicVoice()

  const watchingRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const audioRef = useRef<HTMLAudioElement | null>(null)

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


  const stopAll = useCallback(() => {
    watchingRef.current = false
    setWatching(false)
    clearTimeout(timerRef.current)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.onended = null
      audioRef.current.onerror = null
      audioRef.current = null
    }
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
        }
      }

      // إذا الصفحة عندها صوت MP3 جاهز، شغّله مباشرة
      if (p.audio) {
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current = null
        }
        if ('speechSynthesis' in window) window.speechSynthesis.cancel()
        setSpeaking(true)
        setWordIdx(-1)
        const audio = new Audio(p.audio)
        audioRef.current = audio
        audio.onended = onDone
        audio.onerror = () => {
          audioRef.current = null
          onDone()
        }
        audio.play().catch(() => {
          audioRef.current = null
          setSpeaking(false)
          onDone()
        })
        return
      }

      // Fallback: Web Speech API
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
    [pages, canSpeak, voice, level],
  )

  useEffect(() => () => {
    clearTimeout(timerRef.current)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }, [])

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

  // tabs only after story is read once
  const hasResources = (story.quiz ?? []).length > 0
  const tabs = [
    { id: 'story' as const, label: 'تصفّح', icon: '📖' },
    ...(hasResources ? [
      { id: 'vocab' as const, label: 'المفردات', icon: '📝' },
      { id: 'exercises' as const, label: 'تمارين', icon: '✏️' },
    ] : []),
  ]

  return (
    <div>
      {/* Tabs */}
      {hasResources && (
        <div className="flex gap-1 mb-4 bg-amber-50 rounded-2xl p-1 border border-amber-100">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === t.id ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-amber-600'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Story Tab ── */}
      {activeTab === 'story' && (
        <>
          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-gray-400">صفحة {pageIdx + 1} من {pages.length}</span>
              <span className="text-xs font-bold text-amber-600">{Math.round(((pageIdx + 1) / pages.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${((pageIdx + 1) / pages.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-amber-100 overflow-hidden mb-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={pageIdx}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.35 }}
              >
                {/* Split layout: scene + text side by side on desktop */}
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-1/2 p-3 sm:p-4">
                    <StoryScene scene={page.scene} />
                  </div>
                  <div className="sm:w-1/2 flex items-center p-4 sm:p-6">
                    <p
                      className={`font-bold text-gray-800 leading-relaxed ${TEXT_SIZE[level] ?? TEXT_SIZE[1]}`}
                      lang="ar"
                      style={{ direction: 'rtl' }}
                    >
                      {words.map((w, i) => (
                        <span key={i}>
                          <span className={`rounded-lg px-0.5 transition-colors ${i === wordIdx ? 'bg-amber-300 text-gray-900' : ''}`}>
                            {w.w}
                          </span>{' '}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-amber-50">
              <button
                onClick={() => goTo(pageIdx - 1)}
                disabled={pageIdx === 0}
                className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 text-2xl font-bold disabled:opacity-30"
                aria-label="الصفحة السابقة"
              >→</button>
              <div className="flex gap-1.5 flex-wrap justify-center" aria-label={`صفحة ${pageIdx + 1} من ${pages.length}`}>
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
              >←</button>
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

          {isLast && childId && !isRead && (
            <StoryQuiz quiz={story.quiz ?? []} storyId={story.id} childId={childId} onPassed={() => setIsRead(true)} />
          )}

          {isLast && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {isRead && (
                <div className="text-center bg-green-50 border border-green-200 rounded-xl py-3 px-8">
                  <span className="text-green-600 font-bold">✓ قرأت هذه القصة وفهمتها</span>
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
        </>
      )}

      {/* ── Vocab Tab ── */}
      {activeTab === 'vocab' && (
        <VocabTab quiz={story.quiz ?? []} />
      )}

      {/* ── Exercises Tab ── */}
      {activeTab === 'exercises' && (
        <ExercisesTab quiz={story.quiz ?? []} />
      )}
    </div>
  )
}

/* ─── تمارين المفردات ─── */
function VocabTab({ quiz }: { quiz: QuizItem[] }) {
  const words = useMemo(() => {
    const seen = new Set<string>()
    const all: string[] = []
    for (const item of quiz) {
      for (const opt of item.options) {
        if (!seen.has(opt)) { seen.add(opt); all.push(opt) }
      }
    }
    return all
  }, [quiz])

  const [revealed, setRevealed] = useState<Set<number>>(new Set())

  function say(text: string) {
    if (!('speechSynthesis' in window)) return
    const v = window.speechSynthesis.getVoices().find(x => x.lang.toLowerCase().startsWith('ar'))
    if (!v) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.voice = v; u.lang = v.lang; u.rate = 0.8
    window.speechSynthesis.speak(u)
  }

  if (!words.length) return (
    <div className="text-center py-16 text-gray-400">
      <p className="text-4xl mb-3">📝</p>
      <p>لا توجد مفردات متاحة لهذه القصة</p>
    </div>
  )

  return (
    <div>
      <p className="text-sm text-gray-500 font-bold mb-3 text-center">اضغط على الكلمة لسماعها</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {words.map((word, i) => (
          <button key={i} onClick={() => { say(word); setRevealed(r => { const n = new Set(r); n.add(i); return n }) }}
            className={`rounded-2xl p-4 text-center font-black text-lg transition-all active:scale-95 ${revealed.has(i) ? 'bg-amber-500 text-white shadow-md' : 'bg-amber-50 border-2 border-amber-200 text-amber-800'}`}>
            {word}
            <span className="block text-xs mt-1 opacity-70">{revealed.has(i) ? '🔊 تم' : 'اضغط'}</span>
          </button>
        ))}
      </div>
      <button onClick={() => setRevealed(new Set())}
        className="mt-5 mx-auto block text-sm font-bold text-gray-400 hover:text-gray-600">
        إعادة ضبط
      </button>
    </div>
  )
}

/* ─── تمارين تفاعلية ─── */
function ExercisesTab({ quiz }: { quiz: QuizItem[] }) {
  const [current, setCurrent] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  if (!quiz.length) return (
    <div className="text-center py-16 text-gray-400">
      <p className="text-4xl mb-3">✏️</p>
      <p>لا توجد تمارين لهذه القصة بعد</p>
    </div>
  )

  if (done) {
    const pct = Math.round((score / quiz.length) * 100)
    return (
      <div className="text-center bg-white rounded-3xl border border-amber-100 p-8">
        <div className="text-6xl mb-3">{pct >= 70 ? '🌟' : '💪'}</div>
        <p className="text-2xl font-black text-gray-900 mb-1">{pct >= 70 ? 'ممتاز!' : 'حاول مرة أخرى'}</p>
        <p className="text-gray-500 mb-5">{score} من {quiz.length} إجابة صحيحة</p>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-5">
          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <button onClick={() => { setCurrent(0); setChosen(null); setScore(0); setDone(false) }}
          className="bg-amber-500 text-white font-black px-8 py-3 rounded-2xl">
          إعادة التمارين
        </button>
      </div>
    )
  }

  const item = quiz[current]

  function pick(idx: number) {
    if (chosen !== null) return
    setChosen(idx)
    if (idx === item.correct) setScore(s => s + 1)
    setTimeout(() => {
      if (current < quiz.length - 1) { setCurrent(c => c + 1); setChosen(null) }
      else setDone(true)
    }, 1200)
  }

  return (
    <div>
      {/* progress */}
      <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
        <span>سؤال {current + 1} من {quiz.length}</span>
        <span>النقاط: {score}</span>
      </div>
      <div className="h-2 bg-amber-100 rounded-full overflow-hidden mb-5">
        <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${(current / quiz.length) * 100}%` }} />
      </div>

      <div className="bg-white rounded-3xl border border-amber-100 p-6 mb-4">
        <p className="text-xs font-bold text-amber-600 mb-3 text-center">أكمل الجملة بما يناسبها</p>
        <p className="text-xl font-black text-gray-900 text-center leading-relaxed mb-6" lang="ar">{item.q}</p>
        <div className="grid grid-cols-2 gap-3">
          {item.options.map((opt, i) => {
            let style = 'bg-amber-50 border-2 border-amber-200 text-amber-800'
            if (chosen !== null) {
              if (i === item.correct) style = 'bg-green-100 border-2 border-green-400 text-green-800'
              else if (i === chosen && i !== item.correct) style = 'bg-red-100 border-2 border-red-400 text-red-800'
              else style = 'bg-gray-50 border-2 border-gray-200 text-gray-400'
            }
            return (
              <button key={i} onClick={() => pick(i)} disabled={chosen !== null}
                className={`rounded-2xl p-4 text-center font-black text-lg transition-all active:scale-95 disabled:cursor-default ${style}`}>
                {opt}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
