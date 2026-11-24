export type SceneBg =
  | 'meadow' | 'night' | 'sea' | 'forest' | 'village' | 'desert' | 'mountain' | 'home' | 'sky' | 'garden'

export type SceneAnim = 'bounce' | 'float' | 'sway' | 'walk' | 'spin' | 'pulse' | 'none'

export interface SceneItem {
  e: string
  x: number
  y: number
  size?: number
  anim?: SceneAnim
}

export interface Scene {
  bg: SceneBg
  items: SceneItem[]
}

export interface StoryPage {
  text: string
  scene: Scene
}

export const LEVELS = [
  { value: 1, label: 'مبتدئ', color: 'bg-green-100 text-green-700' },
  { value: 2, label: 'متوسط', color: 'bg-sky-100 text-sky-700' },
  { value: 3, label: 'متقدم', color: 'bg-amber-100 text-amber-700' },
  { value: 4, label: 'متمكّن', color: 'bg-rose-100 text-rose-700' },
] as const

export function levelInfo(level: number | null | undefined) {
  return LEVELS.find((l) => l.value === level) ?? LEVELS[0]
}

// القصص القديمة مخزّنة كـ HTML في content_ar بدون صفحات
export function pagesFromContent(contentHtml: string, coverEmoji: string): StoryPage[] {
  const text = contentHtml
    .replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const sentences = text.match(/[^.!؟?]+[.!؟?]*["»]?/g)?.map((s) => s.trim()).filter(Boolean) ?? [text]

  const pages: StoryPage[] = []
  for (let i = 0; i < sentences.length; i += 2) {
    pages.push({
      text: sentences.slice(i, i + 2).join(' '),
      scene: {
        bg: (['meadow', 'sky', 'garden', 'village'] as SceneBg[])[pages.length % 4],
        items: [{ e: coverEmoji, x: 50, y: 62, size: 96, anim: pages.length % 2 ? 'float' : 'bounce' }],
      },
    })
  }
  return pages
}
