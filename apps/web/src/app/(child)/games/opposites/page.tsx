'use client'

import { useCallback } from 'react'
import ChoiceGame, { type Round } from '@/components/games/ChoiceGame'
import { shuffle } from '@/lib/games/save'

const PAIRS: [string, string][] = [
  ['كَبِيرٌ', 'صَغِيرٌ'],
  ['طَوِيلٌ', 'قَصِيرٌ'],
  ['حَارٌّ', 'بَارِدٌ'],
  ['سَرِيعٌ', 'بَطِيءٌ'],
  ['فَوْقَ', 'تَحْتَ'],
  ['نَهَارٌ', 'لَيْلٌ'],
  ['سَعِيدٌ', 'حَزِينٌ'],
  ['مَفْتُوحٌ', 'مُغْلَقٌ'],
  ['قَرِيبٌ', 'بَعِيدٌ'],
  ['جَدِيدٌ', 'قَدِيمٌ'],
  ['ثَقِيلٌ', 'خَفِيفٌ'],
  ['كَثِيرٌ', 'قَلِيلٌ'],
]

export default function OppositesGame({ searchParams }: { searchParams: { child?: string } }) {
  const makeRounds = useCallback((): Round[] => {
    return shuffle(PAIRS).slice(0, 8).map((pair) => {
      const [word, opposite] = Math.random() < 0.5 ? pair : [pair[1], pair[0]]
      const others = shuffle(PAIRS.filter((p) => p !== pair).flat()).slice(0, 2)
      return {
        prompt: (
          <>
            <p className="text-lg font-bold text-gray-600 mb-2">مَا عَكْسُ كَلِمَةِ</p>
            <p className="text-5xl font-black text-violet-700">{word}</p>
          </>
        ),
        speak: `ما عكس كلمة ${word}؟`,
        options: shuffle([opposite, ...others]).map((w) => ({ key: w, label: <span className="text-2xl">{w}</span> })),
        answer: opposite,
      }
    })
  }, [])

  return (
    <ChoiceGame title="الْأَضْدَادُ" accent="#7c3aed" childId={searchParams.child} gameType="opposites" subject="languages" makeRounds={makeRounds} />
  )
}
