'use client'

import { useCallback } from 'react'
import ChoiceGame, { type Round } from '@/components/games/ChoiceGame'
import { AR_DIGITS, shuffle } from '@/lib/games/save'

const THINGS = ['🍎', '⭐', '🐟', '🌸', '🎈', '🐤', '🍌', '🚗']
const NUMBER_WORDS = ['', 'وَاحِد', 'اثْنَان', 'ثَلَاثَة', 'أَرْبَعَة', 'خَمْسَة', 'سِتَّة', 'سَبْعَة', 'ثَمَانِيَة', 'تِسْعَة', 'عَشَرَة']

export default function CountingGame({ searchParams }: { searchParams: { child?: string } }) {
  const makeRounds = useCallback((): Round[] => {
    return Array.from({ length: 8 }, (_, i) => {
      const n = 1 + Math.floor(Math.random() * 10)
      const thing = THINGS[i % THINGS.length]
      const wrong = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((x) => x !== n)).slice(0, 2)
      return {
        prompt: (
          <>
            <p className="text-lg font-bold text-gray-600 mb-3">كَمْ عَدَدُهَا؟</p>
            <div className="flex flex-wrap justify-center gap-2 text-4xl max-w-xs">
              {Array.from({ length: n }, (_, k) => <span key={k}>{thing}</span>)}
            </div>
          </>
        ),
        speak: 'كم عددها؟',
        options: shuffle([n, ...wrong]).map((x) => ({
          key: String(x),
          label: (
            <span className="flex flex-col items-center leading-tight">
              <span>{AR_DIGITS(x)}</span>
              <span className="text-xs font-bold text-gray-500">{NUMBER_WORDS[x]}</span>
            </span>
          ),
        })),
        answer: String(n),
      }
    })
  }, [])

  return (
    <ChoiceGame
      title="عُدَّ مَعِي"
      accent="#16a34a"
      childId={searchParams.child}
      gameType="counting"
      subject="numbers"
      makeRounds={makeRounds}
    />
  )
}
