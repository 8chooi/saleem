'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { saveGameSession } from '@/lib/games/save'

export interface Round {
  prompt: React.ReactNode
  speak?: string
  options: { key: string; label: React.ReactNode }[]
  answer: string
}

interface Props {
  title: string
  accent: string
  childId?: string
  gameType: string
  subject: string
  makeRounds: () => Round[]
}

function say(text?: string) {
  if (!text || !('speechSynthesis' in window)) return
  const v = window.speechSynthesis.getVoices().find((x) => x.lang.toLowerCase().startsWith('ar'))
  if (!v) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.voice = v
  u.lang = v.lang
  u.rate = 0.85
  window.speechSynthesis.speak(u)
}

export default function ChoiceGame({ title, accent, childId, gameType, subject, makeRounds }: Props) {
  const [seed, setSeed] = useState(0)
  const [rounds, setRounds] = useState<Round[]>([])
  // الأسئلة عشوائية، فتُولَّد في المتصفح فقط لتجنّب اختلاف الخادم عن المتصفح
  useEffect(() => setRounds(makeRounds()), [makeRounds, seed])
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [correct, setCorrect] = useState(0)
  const [done, setDone] = useState(false)
  const started = useRef(Date.now())

  const round = rounds[idx]
  const score = rounds.length ? Math.round((correct / rounds.length) * 100) : 0

  useEffect(() => {
    if (!done) say(round?.speak)
  }, [idx, done, round])

  useEffect(() => {
    if (done) saveGameSession({ childId, gameType, subject, score, startedAt: started.current })
  }, [done]) // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (key: string) => {
    if (picked) return
    setPicked(key)
    const ok = key === round.answer
    if (ok) setCorrect((c) => c + 1)
    say(ok ? 'أحسنت' : undefined)
    setTimeout(() => {
      setPicked(null)
      if (idx === rounds.length - 1) setDone(true)
      else setIdx(idx + 1)
    }, 1100)
  }

  const restart = () => {
    started.current = Date.now()
    setSeed((s) => s + 1)
    setIdx(0)
    setCorrect(0)
    setDone(false)
  }

  const back = childId ? `/games?child=${childId}` : '/games'
  if (!round && !done) return <div className="min-h-screen bg-gray-50" dir="rtl" />

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50" dir="rtl">
      <div className="max-w-xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <Link href={back} className="text-sm font-bold text-gray-500">← الألعاب</Link>
          <h1 className="text-xl font-black" style={{ color: accent }}>{title}</h1>
          <span className="text-sm font-bold text-gray-500">{Math.min(idx + 1, rounds.length)}/{rounds.length}</span>
        </div>

        <div className="h-2 rounded-full bg-gray-200 mb-6 overflow-hidden">
          <div className="h-full transition-all" style={{ width: `${((done ? rounds.length : idx) / rounds.length) * 100}%`, background: accent }} />
        </div>

        {done ? (
          <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
            <div className="text-6xl mb-3">{score >= 80 ? '🏆' : score >= 50 ? '⭐' : '💪'}</div>
            <p className="text-2xl font-black text-gray-900 mb-1">
              {score >= 80 ? 'رائع!' : score >= 50 ? 'أحسنت!' : 'حاول مرة أخرى'}
            </p>
            <p className="text-gray-600 mb-6">أجبت صح على {correct} من {rounds.length}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={restart} className="text-white font-bold px-6 py-3 rounded-2xl" style={{ background: accent }}>
                العب مرة أخرى
              </button>
              <Link href={back} className="border-2 font-bold px-6 py-3 rounded-2xl" style={{ borderColor: accent, color: accent }}>
                لعبة أخرى
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm p-6">
            <div className="min-h-[9rem] flex flex-col items-center justify-center text-center mb-6">{round.prompt}</div>
            {round.speak && (
              <button onClick={() => say(round.speak)} className="block mx-auto mb-5 text-sm font-bold text-gray-500">
                🔊 أعد السؤال
              </button>
            )}
            <div className="grid grid-cols-3 gap-3">
              {round.options.map((o) => {
                const state = picked === null ? '' : o.key === round.answer ? 'ring-4 ring-green-400 bg-green-50' : picked === o.key ? 'ring-4 ring-red-300 bg-red-50' : 'opacity-50'
                return (
                  <button
                    key={o.key}
                    onClick={() => choose(o.key)}
                    className={`min-h-[5.5rem] rounded-2xl border-2 border-gray-100 bg-gray-50 text-3xl font-black text-gray-800 flex items-center justify-center p-2 transition-all active:scale-95 ${state}`}
                  >
                    {o.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
