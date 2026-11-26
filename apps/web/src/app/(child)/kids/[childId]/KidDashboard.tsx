'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

/* ─── أصوات ─── */
function playPop() {
  try {
    const ctx = new AudioContext()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.type = 'sine'
    o.frequency.setValueAtTime(520, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.06)
    g.gain.setValueAtTime(0.25, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
    o.start(); o.stop(ctx.currentTime + 0.12)
    setTimeout(() => ctx.close(), 300)
  } catch {}
}

function playStar() {
  try {
    const ctx = new AudioContext()
    ;[0, 0.07, 0.14].forEach((t, i) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.connect(g); g.connect(ctx.destination)
      o.frequency.value = [660, 880, 1100][i]
      g.gain.setValueAtTime(0.2, ctx.currentTime + t)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.15)
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.15)
    })
    setTimeout(() => ctx.close(), 600)
  } catch {}
}

/* ─── أنواع البيانات ─── */
interface Activity {
  href: string; label: string
  color: string; shadow: string; icon: string
}

interface StoryCard {
  id: string; slug: string; title_ar: string; cover_emoji: string; level: number
}

interface Badge {
  badge: { name_ar: string; emoji: string } | null
  earned_at: string
}

interface World {
  slug: string; name_ar: string; emoji: string
  color: string; total: number; done: number
}

interface Task {
  id: string; note: string | null
  story: { slug: string; title_ar: string; cover_emoji: string } | null
  lesson: { slug: string; title_ar: string; subject: { slug: string; emoji: string } | null } | null
}

interface Lesson {
  id: string; slug: string; title_ar: string
  subject: { slug: string; name_ar: string; emoji: string; color: string } | null
}

interface WeekRow {
  key: 'stories' | 'lessons' | 'games'
  icon: string; label: string; href: string
  done: number; goal: number
}

export interface DashboardProps {
  child: { id: string; name: string; avatar_emoji: string; age_group: string }
  points: number
  band: '3-5' | '6-8' | '9-12'
  q: string
  activities: Activity[]
  tasks: Task[]
  picked: StoryCard[]
  badges: Badge[]
  worlds: World[]
  continueLesson: Lesson | null
  challenge: Lesson | null
  inProgressId: string | null
  weekRows: WeekRow[]
  weekComplete: boolean
}

/* ─── Clay Card ─── */
function ClayBtn({ href, color, shadow, icon, label, big = false }: {
  href: string; color: string; shadow: string; icon: string; label: string; big?: boolean
}) {
  return (
    <Link
      href={href}
      onClick={playPop}
      className={`flex flex-col items-center justify-center gap-2 rounded-3xl text-white font-black
        active:translate-y-1.5 active:shadow-none transition-all duration-100 cursor-pointer select-none
        ${big ? 'p-6' : 'p-4'}`}
      style={{ background: color, boxShadow: `0 6px 0 ${shadow}` }}
    >
      <span className={big ? 'text-5xl' : 'text-4xl'}>{icon}</span>
      <span className={big ? 'text-xl' : 'text-base'}>{label}</span>
    </Link>
  )
}

/* ─── Progress Ring (SVG بسيط) ─── */
function Ring({ pct, color, size = 56 }: { pct: number; color: string; size?: number }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={6}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
        style={{transition:'stroke-dashoffset 0.8s ease'}}/>
    </svg>
  )
}

/* ─── الـ Dashboard ─── */
export default function KidDashboard(p: DashboardProps) {
  const young = p.band === '3-5'
  const avatarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // نغمة ترحيب بسيطة عند التحميل
    const t = setTimeout(playStar, 600)
    return () => clearTimeout(t)
  }, [])

  /* ─── Header ─── */
  const Header = (
    <header className="relative overflow-hidden rounded-b-[2.5rem] pb-5 pt-4 px-4"
      style={{background:'linear-gradient(135deg,#7c3aed 0%,#a855f7 50%,#ec4899 100%)'}}>
      {/* نجوم زخرفية */}
      {['top-2 right-8','top-6 left-10','top-1 left-24'].map((pos,i)=>(
        <span key={i} className={`absolute text-white/20 text-2xl animate-pulse ${pos}`}
          style={{animationDelay:`${i*0.4}s`}}>✦</span>
      ))}
      <div className="flex items-center justify-between gap-3">
        {/* avatar متأرجح */}
        <div ref={avatarRef}
          className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-4xl shrink-0 shadow-lg"
          style={{animation:'float 3s ease-in-out infinite'}}>
          {p.child.avatar_emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white/70 text-xs font-bold">أهلاً يا</p>
          <p className="text-white text-2xl font-black leading-tight truncate">{p.child.name} 👋</p>
          <p className="text-white/60 text-xs mt-0.5">{young ? 'هيّا نلعب ونتعلّم!' : 'ماذا تريد اليوم؟'}</p>
        </div>
        {/* نقاط */}
        <button onClick={playStar}
          className="shrink-0 flex flex-col items-center bg-white/20 rounded-2xl px-3 py-2 cursor-pointer hover:bg-white/30 transition-colors">
          <span className="text-2xl">⭐</span>
          <span className="text-white font-black text-lg leading-none">{p.points}</span>
          <span className="text-white/60 text-[10px]">نقطة</span>
        </button>
      </div>
    </header>
  )

  /* ─── الأنشطة ─── */
  const ActivitiesGrid = (
    <section>
      <h2 className="text-lg font-black text-gray-800 mb-3">أنشطتي</h2>
      <div className={`grid gap-3 ${young ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {(young ? p.activities.slice(0,4) : p.activities).map(a=>(
          <ClayBtn key={a.label} href={a.href} color={a.color} shadow={a.shadow}
            icon={a.icon} label={a.label} big={young} />
        ))}
      </div>
    </section>
  )

  /* ─── مهام الوالدين ─── */
  const Tasks = (p.tasks.length > 0) && (
    <section className="space-y-2">
      {p.tasks.map(t=>{
        const story = t.story
        const lesson = t.lesson
        const href = story
          ? `/stories/${story.slug}${p.q}`
          : `/worlds/${lesson?.subject?.slug}/lessons/${lesson?.slug}${p.q}`
        return (
          <Link key={t.id} href={href} onClick={playPop}
            className="flex items-center gap-4 rounded-3xl text-white p-4"
            style={{background:'linear-gradient(135deg,#ec4899,#f43f5e)',boxShadow:'0 5px 0 #be123c'}}>
            <span className="text-4xl">{story?.cover_emoji ?? lesson?.subject?.emoji}</span>
            <span className="flex-1 min-w-0">
              <span className="block text-xs font-bold text-white/80">مهمة من أهلك 💌</span>
              <span className="block font-black text-lg truncate">{story?.title_ar ?? lesson?.title_ar}</span>
              {t.note && <span className="block text-sm text-white/80 truncate">«{t.note}»</span>}
            </span>
            <span className="bg-white text-rose-600 font-black text-sm px-4 py-2 rounded-xl shrink-0">ابدأ</span>
          </Link>
        )
      })}
    </section>
  )

  /* ─── أكمل من حيث توقفت ─── */
  const ContinueCard = p.continueLesson && (
    <Link href={`/worlds/${p.continueLesson.subject?.slug}/lessons/${p.continueLesson.slug}${p.q}`}
      onClick={playPop}
      className="flex items-center gap-4 rounded-3xl bg-white p-4 cursor-pointer"
      style={{boxShadow:'0 5px 0 #bfdbfe',border:'2px solid #bfdbfe'}}>
      <span className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
        style={{background:`${p.continueLesson.subject?.color}22`}}>
        {p.continueLesson.subject?.emoji}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-xs font-bold text-sky-500">
          {p.inProgressId === p.continueLesson.id ? 'أكمل من حيث توقفت' : 'درسك التالي'}
        </span>
        <span className="block font-black text-gray-900 truncate">{p.continueLesson.title_ar}</span>
      </span>
      <span className="text-white font-black text-sm px-4 py-2 rounded-xl shrink-0"
        style={{background:'#3b82f6',boxShadow:'0 3px 0 #1d4ed8'}}>ابدأ</span>
    </Link>
  )

  /* ─── تحدّي الأسبوع ─── */
  const WeeklyChallenge = (
    <section className="rounded-3xl bg-white p-5"
      style={{boxShadow:p.weekComplete?'0 5px 0 #bbf7d0':'0 5px 0 #fde68a',
              border:p.weekComplete?'2px solid #bbf7d0':'2px solid #fde68a'}}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-black text-gray-900">
          {p.weekComplete ? '🏆 أنجزت التحدّي!' : '⭐ تحدّي الأسبوع'}
        </h2>
        <span className="text-[10px] text-gray-400">يتجدّد كل سبت</span>
      </div>
      <div className="flex justify-around">
        {p.weekRows.map(r=>{
          const pct = Math.min(r.done / r.goal, 1)
          return (
            <Link key={r.key} href={r.href} onClick={playPop} className="flex flex-col items-center gap-1">
              <div className="relative">
                <Ring pct={pct} color={pct>=1?'#22c55e':'#f59e0b'} size={60}/>
                <span className="absolute inset-0 flex items-center justify-center text-xl">{r.icon}</span>
              </div>
              <span className="text-xs font-bold text-gray-700">{r.done}/{r.goal}</span>
              <span className="text-[10px] text-gray-500">{r.label}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )

  /* ─── قصص لك ─── */
  const StoriesRow = p.picked.length > 0 && (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-black text-gray-800">قصص لك</h2>
        <Link href={`/library${p.q}`} className="text-sky-500 text-sm font-bold">المكتبة ←</Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-hide">
        {p.picked.map(s=>(
          <Link key={s.id} href={`/stories/${s.slug}${p.q}`} onClick={playPop}
            className="snap-start shrink-0 w-32 rounded-2xl bg-white overflow-hidden cursor-pointer"
            style={{boxShadow:'0 4px 0 #e2e8f0'}}>
            <div className="h-20 flex items-center justify-center text-5xl"
              style={{background:'linear-gradient(135deg,#fef9c3,#fef3c7)'}}>
              {s.cover_emoji}
            </div>
            <div className="p-2">
              <p className="font-bold text-xs text-gray-800 line-clamp-2 leading-snug">{s.title_ar}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )

  /* ─── عوالم التعلّم ─── */
  const WorldsGrid = p.worlds.length > 0 && (
    <section>
      <h2 className="text-lg font-black text-gray-800 mb-3">عوالم التعلّم</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {p.worlds.map(w=>{
          const pct = w.total > 0 ? w.done / w.total : 0
          return (
            <Link key={w.slug} href={`/worlds/${w.slug}${p.q}`} onClick={playPop}
              className="rounded-2xl p-4 text-white"
              style={{background:`linear-gradient(135deg,${w.color},${w.color}cc)`,
                      boxShadow:`0 5px 0 ${w.color}88`}}>
              <div className="flex items-center gap-2 font-black text-base mb-3">
                <span className="text-3xl">{w.emoji}</span>
                {w.name_ar}
              </div>
              <div className="h-2.5 rounded-full bg-white/30 overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{width:`${pct*100}%`,transition:'width 0.6s ease'}}/>
              </div>
              <span className="text-xs text-white/80 mt-1 block">{w.done} من {w.total} دروس</span>
            </Link>
          )
        })}
      </div>
    </section>
  )

  /* ─── إنجازات ─── */
  const Achievements = p.badges.length > 0 && (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-black text-gray-800">إنجازاتي</h2>
        <Link href={`/badges${p.q}`} className="text-sky-500 text-sm font-bold">كلها ←</Link>
      </div>
      <div className="flex gap-2 flex-wrap">
        {p.badges.map((b,i)=>{
          const badge = b.badge
          return badge ? (
            <span key={i} className="flex items-center gap-2 bg-white rounded-2xl px-3 py-2"
              style={{boxShadow:'0 3px 0 #fde68a',border:'1.5px solid #fde68a'}}>
              <span className="text-2xl">{badge.emoji}</span>
              <span className="font-bold text-xs text-gray-800">{badge.name_ar}</span>
            </span>
          ) : null
        })}
      </div>
    </section>
  )

  /* ─── تحدّي اليوم ─── */
  const ChallengeCard = p.challenge && (
    <Link href={`/worlds/${p.challenge.subject?.slug}/lessons/${p.challenge.slug}${p.q}`}
      onClick={playPop}
      className="flex items-center gap-4 rounded-3xl text-white p-5"
      style={{background:'linear-gradient(135deg,#f59e0b,#f97316)',boxShadow:'0 5px 0 #c2410c'}}>
      <span className="text-4xl">🎯</span>
      <span className="flex-1">
        <span className="block text-xs text-white/80 font-bold">تحدّي اليوم</span>
        <span className="block font-black text-lg">{p.challenge.title_ar}</span>
      </span>
    </Link>
  )

  return (
    <>
      {/* CSS للحركات */}
      <style>{`
        @keyframes float {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-6px)}
        }
        .scrollbar-hide::-webkit-scrollbar{display:none}
        .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>

      <div className="min-h-screen" dir="rtl"
        style={{background:'linear-gradient(160deg,#f5f0ff 0%,#fdf4ff 40%,#f0f9ff 100%)'}}>
        {Header}

        <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {Tasks}

          {p.band === '3-5' && (<>
            {ActivitiesGrid}
            {StoriesRow}
            {WeeklyChallenge}
            {ContinueCard}
            {Achievements}
          </>)}

          {p.band === '6-8' && (<>
            {ContinueCard}
            {ActivitiesGrid}
            {WeeklyChallenge}
            {StoriesRow}
            {WorldsGrid}
            {Achievements}
          </>)}

          {p.band === '9-12' && (<>
            {ContinueCard}
            {ChallengeCard}
            {WeeklyChallenge}
            {WorldsGrid}
            {ActivitiesGrid}
            {StoriesRow}
            {Achievements}
          </>)}

          {/* رجوع للوالد */}
          <div className="text-center pb-4">
            <Link href="/parent" className="text-gray-400 text-xs font-bold hover:text-gray-600 transition-colors">
              👨‍👩‍👧 عودة لصفحة الوالد
            </Link>
          </div>
        </main>
      </div>
    </>
  )
}
