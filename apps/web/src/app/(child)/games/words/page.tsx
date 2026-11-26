'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { saveGameSession } from '@/lib/games/save'

/* ─── الجمل ─── */
const SENTENCES = [
  { words: ['الشَّمْسُ', 'تُضِيءُ', 'السَّمَاءَ'],          img: '☀️' },
  { words: ['الْقِطَّةُ', 'تَشْرَبُ', 'الْحَلِيبَ'],         img: '🐱' },
  { words: ['الْوَلَدُ', 'يَلْعَبُ', 'بِالْكُرَةِ'],          img: '⚽' },
  { words: ['الْبَطَّةُ', 'تَسْبَحُ', 'فِي الْمَاءِ'],        img: '🦆' },
  { words: ['أَنَا', 'أُحِبُّ', 'الْفَاكِهَةَ'],              img: '🍎' },
  { words: ['السَّمَكَةُ', 'تَعِيشُ', 'فِي الْبَحْرِ'],       img: '🐟' },
  { words: ['النَّحْلَةُ', 'تَجْمَعُ', 'الْعَسَلَ'],          img: '🐝' },
  { words: ['الْأَرْنَبُ', 'يَقْفِزُ', 'عَلَى الْعُشْبِ'],    img: '🐰' },
  { words: ['الطِّفْلُ', 'يَقْرَأُ', 'قِصَّةً جَمِيلَةً'],   img: '📖' },
  { words: ['الْفِيلُ', 'يَشْرَبُ', 'مِنَ النَّهْرِ'],        img: '🐘' },
]

function shuffle<T>(arr: T[]) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function playSound(freq: number, dur: number) {
  try {
    const ctx = new AudioContext()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.frequency.value = freq
    g.gain.setValueAtTime(0.2, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
    o.start(); o.stop(ctx.currentTime + dur)
    setTimeout(() => ctx.close(), dur * 1000 + 200)
  } catch {}
}

export default function WordsGame({ searchParams }: { searchParams: { child?: string } }) {
  const childId = searchParams.child
  const TOTAL = 6
  const started = useRef(Date.now())

  const [rounds] = useState(() =>
    shuffle(SENTENCES).slice(0, TOTAL).map((s) => ({
      ...s,
      scrambled: shuffle(s.words.map((w, i) => ({ w, id: i }))),
    }))
  )

  const [idx, setIdx] = useState(0)
  const [built, setBuilt] = useState<{ w: string; id: number }[]>([])
  const [remaining, setRemaining] = useState<{ w: string; id: number }[]>([])
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong' | 'done'>('playing')
  const [score, setScore] = useState(0)
  const [wrongFlash, setWrongFlash] = useState(false)

  const round = rounds[idx]

  useEffect(() => {
    setBuilt([])
    setRemaining(rounds[idx]?.scrambled ?? [])
    setStatus('playing')
  }, [idx, rounds])

  useEffect(() => {
    if (status === 'done') {
      const pct = Math.round((score / TOTAL) * 100)
      saveGameSession({ childId, gameType: 'words', subject: 'languages', score: pct, startedAt: started.current })
    }
  }, [status]) // eslint-disable-line

  function pickWord(item: { w: string; id: number }) {
    if (status !== 'playing') return
    const newBuilt = [...built, item]
    setBuilt(newBuilt)
    setRemaining(remaining.filter((r) => r.id !== item.id))
    playSound(500, 0.08)

    if (newBuilt.length === round.words.length) {
      const correct = newBuilt.every((x, i) => x.id === i)
      if (correct) {
        setStatus('correct')
        setScore((s) => s + 1)
        playSound(880, 0.3)
        setTimeout(() => {
          if (idx < TOTAL - 1) setIdx((i) => i + 1)
          else setStatus('done')
        }, 1200)
      } else {
        setStatus('wrong')
        setWrongFlash(true)
        playSound(220, 0.3)
        setTimeout(() => {
          setWrongFlash(false)
          setBuilt([])
          setRemaining(round.scrambled)
          setStatus('playing')
        }, 900)
      }
    }
  }

  function removeWord(item: { w: string; id: number }) {
    if (status !== 'playing') return
    setBuilt(built.filter((b) => b.id !== item.id))
    setRemaining([...remaining, item])
    playSound(350, 0.06)
  }

  const back = childId ? `/games?child=${childId}` : '/games'
  const finalScore = Math.round((score / TOTAL) * 100)

  return (
    <div className="min-h-screen" dir="rtl"
      style={{background:'linear-gradient(160deg,#fffbeb 0%,#fef9c3 50%,#f0fdf4 100%)'}}>

      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between"
        style={{background:'rgba(255,255,255,0.85)',backdropFilter:'blur(10px)',boxShadow:'0 2px 10px rgba(245,158,11,0.15)'}}>
        <Link href={back} className="text-amber-600 font-black text-sm px-3 py-2 rounded-xl bg-amber-50">
          ← رجوع
        </Link>
        <h1 className="text-base font-black text-amber-800">🔤 رتّب الكلمات</h1>
        <span className="text-sm font-bold text-gray-500 bg-amber-50 px-3 py-1.5 rounded-xl">
          {Math.min(idx + 1, TOTAL)}/{TOTAL}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-amber-100">
        <div className="h-full bg-amber-400 transition-all duration-500"
          style={{width:`${((status === 'done' ? TOTAL : idx) / TOTAL) * 100}%`}} />
      </div>

      <div className="max-w-xl mx-auto px-4 py-6">
        {status === 'done' ? (
          /* ─── النهاية ─── */
          <div className="bg-white rounded-3xl p-8 text-center shadow-lg"
            style={{boxShadow:'0 8px 0 #fde68a',border:'2px solid #fde68a'}}>
            <div className="text-6xl mb-3">{finalScore >= 80 ? '🏆' : finalScore >= 50 ? '⭐' : '💪'}</div>
            <p className="text-2xl font-black text-gray-900 mb-1">
              {finalScore >= 80 ? 'رائع جداً!' : finalScore >= 50 ? 'أحسنت!' : 'حاول مرة أخرى'}
            </p>
            <p className="text-gray-500 mb-6">رتّبت {score} من {TOTAL} جمل بشكل صحيح</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { started.current = Date.now(); window.location.reload() }}
                className="text-white font-black px-6 py-3 rounded-2xl"
                style={{background:'#f59e0b',boxShadow:'0 4px 0 #b45309'}}>
                العب مرة أخرى
              </button>
              <Link href={back}
                className="font-black px-6 py-3 rounded-2xl border-2 text-amber-700"
                style={{borderColor:'#f59e0b'}}>
                لعبة أخرى
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* ─── الصورة والعنوان ─── */}
            <div className="text-center mb-5">
              <div className="text-7xl mb-2">{round.img}</div>
              <p className="text-gray-600 font-bold text-sm">رتّب الكلمات لتكوّن جملة</p>
            </div>

            {/* ─── منطقة البناء ─── */}
            <div className={`min-h-[64px] rounded-3xl p-4 mb-5 flex flex-wrap gap-2 items-center justify-center transition-all ${wrongFlash ? 'bg-red-100' : status === 'correct' ? 'bg-green-50' : 'bg-white'}`}
              style={{boxShadow: status === 'correct' ? '0 5px 0 #bbf7d0' : wrongFlash ? '0 5px 0 #fca5a5' : '0 5px 0 #fde68a', border:`2px solid ${status === 'correct' ? '#bbf7d0' : wrongFlash ? '#fca5a5' : '#fde68a'}`}}>
              {built.length === 0 ? (
                <span className="text-gray-300 text-sm font-bold">اضغط على الكلمات بالترتيب</span>
              ) : (
                built.map((item) => (
                  <button key={item.id} onClick={() => removeWord(item)}
                    className="text-white font-black px-4 py-2 rounded-2xl text-base active:scale-95 transition-all"
                    style={{background:'#f59e0b',boxShadow:'0 3px 0 #b45309'}}>
                    {item.w}
                  </button>
                ))
              )}
            </div>

            {/* ─── الكلمات المتبقية ─── */}
            <div className="flex flex-wrap gap-3 justify-center">
              {remaining.map((item) => (
                <button key={item.id} onClick={() => pickWord(item)}
                  className="bg-white text-gray-800 font-black px-4 py-3 rounded-2xl text-base active:scale-95 active:translate-y-0.5 transition-all"
                  style={{boxShadow:'0 5px 0 #e5e7eb',border:'2px solid #f3f4f6'}}>
                  {item.w}
                </button>
              ))}
            </div>

            {/* ─── تلميح ─── */}
            {status === 'correct' && (
              <p className="text-center text-green-600 font-black text-lg mt-5 animate-bounce">✅ أحسنت!</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
