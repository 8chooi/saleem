'use client'

import { useCallback } from 'react'
import ChoiceGame, { type Round } from '@/components/games/ChoiceGame'
import { AR_DIGITS, shuffle } from '@/lib/games/save'

const rnd = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1))

export default function MathGame({ searchParams }: { searchParams: { child?: string } }) {
  const makeRounds = useCallback((): Round[] => {
    return Array.from({ length: 8 }, (_, i) => {
      const add = i % 2 === 0
      const a = rnd(add ? 1 : 5, add ? 10 : 18)
      const b = add ? rnd(1, 10) : rnd(1, a)
      const answer = add ? a + b : a - b
      const wrong = new Set<number>()
      while (wrong.size < 2) {
        const w = answer + rnd(-3, 3)
        if (w !== answer && w >= 0) wrong.add(w)
      }
      return {
        prompt: (
          <p className="text-6xl font-black text-gray-900" dir="rtl">
            {AR_DIGITS(a)} {add ? '+' : '−'} {AR_DIGITS(b)} = ؟
          </p>
        ),
        speak: `${a} ${add ? 'زائد' : 'ناقص'} ${b} يساوي؟`,
        options: shuffle([answer, ...Array.from(wrong)]).map((x) => ({ key: String(x), label: AR_DIGITS(x) })),
        answer: String(answer),
      }
    })
  }, [])

  return (
    <ChoiceGame title="حِسَابٌ سَرِيعٌ" accent="#ea580c" childId={searchParams.child} gameType="math" subject="numbers" makeRounds={makeRounds} />
  )
}
