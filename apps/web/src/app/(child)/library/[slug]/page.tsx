import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LibraryReader from './LibraryReader'

export const dynamic = 'force-dynamic'

interface Book {
  sw_id: number
  slug: string
  title: string
  level: number | null
  credits: string[]
  cover_path: string | null
  orientation: string
  audio_url: string | null
  vtt_url: string | null
  pages: { img: string; text: string; type: string }[] | null
}

export default async function LibraryStoryPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { child?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: book } = await supabase
    .from('open_library')
    .select('sw_id, slug, title, level, credits, cover_path, orientation, audio_url, vtt_url, pages')
    .eq('slug', params.slug)
    .single()

  if (!book) notFound()

  const COVER = (path: string) => {
    const [id, file] = path.split('/')
    return `https://storage.googleapis.com/static.storyweaver.org.in/illustration_crops/${id}/size3/${file}`
  }

  return (
    <LibraryReader
      book={{
        ...(book as Book),
        coverUrl: book.cover_path ? COVER(book.cover_path) : null,
      }}
      backHref={searchParams.child ? `/library?child=${searchParams.child}` : '/library'}
      childId={searchParams.child}
    />
  )
}
