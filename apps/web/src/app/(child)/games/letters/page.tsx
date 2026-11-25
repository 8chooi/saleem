'use client'

import { useCallback } from 'react'
import ChoiceGame, { type Round } from '@/components/games/ChoiceGame'
import { shuffle } from '@/lib/games/save'

const WORDS: { letter: string; name: string; word: string; pic: string }[] = [
  { letter: 'أ', name: 'أَلِف', word: 'أَرْنَب', pic: '🐰' },
  { letter: 'ب', name: 'بَاء', word: 'بَطَّة', pic: '🦆' },
  { letter: 'ت', name: 'تَاء', word: 'تُفَّاحَة', pic: '🍎' },
  { letter: 'ث', name: 'ثَاء', word: 'ثَعْلَب', pic: '🦊' },
  { letter: 'ج', name: 'جِيم', word: 'جَمَل', pic: '🐪' },
  { letter: 'ح', name: 'حَاء', word: 'حِصَان', pic: '🐴' },
  { letter: 'خ', name: 'خَاء', word: 'خَرُوف', pic: '🐑' },
  { letter: 'د', name: 'دَال', word: 'دُبّ', pic: '🐻' },
  { letter: 'ز', name: 'زَاي', word: 'زَرَافَة', pic: '🦒' },
  { letter: 'س', name: 'سِين', word: 'سَمَكَة', pic: '🐟' },
  { letter: 'ش', name: 'شِين', word: 'شَمْس', pic: '☀️' },
  { letter: 'ف', name: 'فَاء', word: 'فِيل', pic: '🐘' },
  { letter: 'ق', name: 'قَاف', word: 'قِطَّة', pic: '🐱' },
  { letter: 'ك', name: 'كَاف', word: 'كَلْب', pic: '🐶' },
  { letter: 'م', name: 'مِيم', word: 'مَوْز', pic: '🍌' },
  { letter: 'ن', name: 'نُون', word: 'نَحْلَة', pic: '🐝' },
]

export default function LettersGame({ searchParams }: { searchParams: { child?: string } }) {
  const makeRounds = useCallback((): Round[] => {
    return shuffle(WORDS).slice(0, 8).map((target) => {
      const others = shuffle(WORDS.filter((w) => w.letter !== target.letter)).slice(0, 2)
      return {
        prompt: (
          <>
            <p className="text-lg font-bold text-gray-600 mb-2">أَيُّ صُورَةٍ تَبْدَأُ بِحَرْفِ</p>
            <p className="text-7xl font-black text-sky-600">{target.letter}</p>
          </>
        ),
        speak: `أي صورة تبدأ بحرف ${target.name}؟`,
        options: shuffle([target, ...others]).map((w) => ({
          key: w.letter,
          label: (
            <span className="flex flex-col items-center leading-tight">
              <span className="text-4xl">{w.pic}</span>
              <span className="text-sm font-bold text-gray-600 mt-1">{w.word}</span>
            </span>
          ),
        })),
        answer: target.letter,
      }
    })
  }, [])

  return (
    <ChoiceGame
      title="أَيْنَ الْحَرْفُ؟"
      accent="#0284c7"
      childId={searchParams.child}
      gameType="letters"
      subject="letters"
      makeRounds={makeRounds}
    />
  )
}
