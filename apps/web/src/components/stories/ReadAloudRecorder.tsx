'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const MAX_SEC = 180

type State = 'idle' | 'recording' | 'saving' | 'saved' | 'error' | 'denied'

function pickMime() {
  for (const t of ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']) {
    if (MediaRecorder.isTypeSupported(t)) return t
  }
  return ''
}

export default function ReadAloudRecorder({ childId, storyId }: { childId: string; storyId: string }) {
  const [supported, setSupported] = useState(false)
  const [state, setState] = useState<State>('idle')
  const [seconds, setSeconds] = useState(0)
  const recorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const timer = useRef<ReturnType<typeof setInterval>>()
  const startedAt = useRef(0)

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'MediaRecorder' in window && !!navigator.mediaDevices?.getUserMedia)
    return () => {
      clearInterval(timer.current)
      recorder.current?.stream.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const upload = async (blob: Blob, mime: string) => {
    setState('saving')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setState('error')
    const ext = mime.includes('mp4') ? 'm4a' : mime.includes('ogg') ? 'ogg' : 'webm'
    const path = `${user.id}/${childId}/${storyId}-${Date.now()}.${ext}`
    const contentType = mime.split(';')[0]
    const { error: upErr } = await supabase.storage.from('recordings').upload(path, blob, { contentType })
    if (upErr) return setState('error')
    const duration = Math.min(MAX_SEC, Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)))
    const { error: dbErr } = await supabase.from('story_recordings').insert({ child_id: childId, story_id: storyId, path, duration_sec: duration })
    if (dbErr) {
      await supabase.storage.from('recordings').remove([path])
      return setState('error')
    }
    setState('saved')
  }

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mime = pickMime()
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 24000 } : undefined)
      chunks.current = []
      rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data)
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        clearInterval(timer.current)
        const type = rec.mimeType || mime || 'audio/webm'
        upload(new Blob(chunks.current, { type }), type)
      }
      recorder.current = rec
      startedAt.current = Date.now()
      setSeconds(0)
      rec.start()
      setState('recording')
      timer.current = setInterval(() => {
        const s = Math.round((Date.now() - startedAt.current) / 1000)
        setSeconds(s)
        if (s >= MAX_SEC) rec.state === 'recording' && rec.stop()
      }, 500)
    } catch {
      setState('denied')
    }
  }

  const stop = () => recorder.current?.state === 'recording' && recorder.current.stop()

  if (!supported) return null

  const mmss = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

  return (
    <div className="text-center my-3">
      {state === 'recording' ? (
        <button onClick={stop} className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-white animate-pulse" /> إيقاف التسجيل {mmss}
        </button>
      ) : state === 'saving' ? (
        <p className="text-gray-600 font-bold">جارٍ حفظ تسجيلك…</p>
      ) : (
        <button onClick={start} className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold py-3 px-6 rounded-xl">
          🎙️ {state === 'saved' ? 'سجّل مرة أخرى' : 'سجّل قراءتك'}
        </button>
      )}
      {state === 'saved' && <p className="text-sm text-green-600 mt-2">حُفظ تسجيلك، ويستطيع أهلك سماعه. أحسنت!</p>}
      {state === 'error' && <p className="text-sm text-red-600 mt-2">تعذّر حفظ التسجيل. حاول مرة أخرى.</p>}
      {state === 'denied' && <p className="text-sm text-gray-600 mt-2">اسمح للموقع باستخدام الميكروفون لتسجّل قراءتك.</p>}
      {state === 'recording' && <p className="text-xs text-gray-500 mt-2">اقرأ الصفحات بصوت واضح. أقصى مدة ٣ دقائق.</p>}
    </div>
  )
}
