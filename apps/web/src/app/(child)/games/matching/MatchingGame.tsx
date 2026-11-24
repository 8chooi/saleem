'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Card {
  id: string
  content: string
  type: 'letter' | 'word'
  pairId: string
  isFlipped: boolean
  isMatched: boolean
}

const LETTER_PAIRS: { letter: string; word: string; pairId: string }[] = [
  { letter: 'أ', word: '🍎 تفاح', pairId: 'alef' },
  { letter: 'ب', word: '🦁 أسد', pairId: 'ba' },
  { letter: 'ت', word: '🍅 طماطم', pairId: 'ta' },
  { letter: 'ج', word: '🧊 جليد', pairId: 'jeem' },
  { letter: 'د', word: '🐻 دب', pairId: 'dal' },
  { letter: 'س', word: '🐟 سمكة', pairId: 'seen' },
]

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildCards(): Card[] {
  const pairs = LETTER_PAIRS.slice(0, 6)
  const cards: Card[] = []
  pairs.forEach((p) => {
    cards.push({ id: `letter-${p.pairId}`, content: p.letter, type: 'letter', pairId: p.pairId, isFlipped: false, isMatched: false })
    cards.push({ id: `word-${p.pairId}`, content: p.word, type: 'word', pairId: p.pairId, isFlipped: false, isMatched: false })
  })
  return shuffleArray(cards)
}

interface MatchingGameProps {
  childId?: string
  subject: string
}

export default function MatchingGame({ childId, subject }: MatchingGameProps) {
  const [cards, setCards] = useState<Card[]>(() => buildCards())
  const [flipped, setFlipped] = useState<string[]>([])
  const [moves, setMoves] = useState(0)
  const [matches, setMatches] = useState(0)
  const [phase, setPhase] = useState<'playing' | 'won'>('playing')
  const [startTime] = useState(() => Date.now())
  const [saved, setSaved] = useState(false)

  const totalPairs = cards.length / 2

  const saveSession = useCallback(async () => {
    if (!childId || saved) return
    setSaved(true)
    const duration = Math.round((Date.now() - startTime) / 1000)
    const score = Math.max(0, 100 - (moves - totalPairs) * 5)
    const supabase = createClient()
    await supabase.from('game_sessions').insert({
      child_id: childId,
      game_type: 'matching',
      subject_slug: subject,
      score,
      max_score: 100,
      duration_sec: duration,
    })
    await supabase.rpc('increment_child_points', { p_child_id: childId, p_points: Math.round(score / 10) })
  }, [childId, saved, moves, startTime, subject, totalPairs])

  useEffect(() => {
    if (matches === totalPairs && phase === 'playing') {
      setPhase('won')
      saveSession()
    }
  }, [matches, totalPairs, phase, saveSession])

  useEffect(() => {
    if (flipped.length !== 2) return
    const [a, b] = flipped
    const cardA = cards.find(c => c.id === a)!
    const cardB = cards.find(c => c.id === b)!
    if (cardA.pairId === cardB.pairId) {
      setTimeout(() => {
        setCards(prev => prev.map(c => c.id === a || c.id === b ? { ...c, isMatched: true } : c))
        setMatches(m => m + 1)
        setFlipped([])
      }, 600)
    } else {
      setTimeout(() => {
        setCards(prev => prev.map(c => c.id === a || c.id === b ? { ...c, isFlipped: false } : c))
        setFlipped([])
      }, 1000)
    }
    setMoves(m => m + 1)
  }, [flipped, cards])

  const handleFlip = (id: string) => {
    if (flipped.length === 2) return
    const card = cards.find(c => c.id === id)
    if (!card || card.isFlipped || card.isMatched) return
    setCards(prev => prev.map(c => c.id === id ? { ...c, isFlipped: true } : c))
    setFlipped(prev => [...prev, id])
  }

  const reset = () => {
    setCards(buildCards())
    setFlipped([])
    setMoves(0)
    setMatches(0)
    setPhase('playing')
    setSaved(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href={childId ? `/worlds/letters?child=${childId}` : '/worlds/letters'} className="text-yellow-600 hover:text-yellow-800 text-sm">← العوالم</Link>
        <h1 className="text-xl font-bold text-gray-800">🎮 لعبة المطابقة</h1>
        <div className="text-sm text-gray-500">
          <span className="font-bold text-yellow-600">{matches}</span>/{totalPairs}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4 justify-center mb-6 text-sm">
        <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-yellow-100">
          <span className="text-gray-500">الحركات: </span>
          <span className="font-bold text-yellow-700">{moves}</span>
        </div>
        <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-yellow-100">
          <span className="text-gray-500">المطابقات: </span>
          <span className="font-bold text-green-600">{matches}/{totalPairs}</span>
        </div>
      </div>

      {/* Win Screen */}
      {phase === 'won' && (
        <div className="text-center bg-green-50 border border-green-200 rounded-2xl p-8 mb-6">
          <div className="text-6xl mb-3">🎉</div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">أحسنت!</h2>
          <p className="text-gray-600 mb-4">أكملت اللعبة في {moves} حركة</p>
          <div className="flex gap-3 justify-center">
            <button onClick={reset} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-xl">
              🔄 العب مرة أخرى
            </button>
            <Link href={childId ? `/stories?child=${childId}` : '/stories'} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-xl">
              📚 اقرأ قصة
            </Link>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-4 gap-3">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleFlip(card.id)}
            disabled={card.isMatched || card.isFlipped || flipped.length === 2}
            className={`aspect-square rounded-2xl text-2xl font-bold transition-all duration-300 shadow-sm
              ${card.isMatched
                ? 'bg-green-100 border-2 border-green-400 text-green-700 scale-95'
                : card.isFlipped
                ? 'bg-yellow-100 border-2 border-yellow-400 text-gray-800 scale-105'
                : 'bg-white border-2 border-gray-200 hover:border-yellow-400 hover:scale-105 cursor-pointer'
              }`}
          >
            {card.isFlipped || card.isMatched ? (
              <span className={card.type === 'letter' ? 'text-3xl' : 'text-xl'}>{card.content}</span>
            ) : (
              <span className="text-gray-300 text-3xl">?</span>
            )}
          </button>
        ))}
      </div>

      {/* Instructions */}
      <p className="text-center text-sm text-gray-400 mt-6">
        اضغط على البطاقات لكشفها وطابق كل حرف مع الكلمة المناسبة
      </p>
    </div>
  )
}
