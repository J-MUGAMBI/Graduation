/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useMemo } from 'react'
import { toast } from 'react-hot-toast'
import { UserCircle, GraduationCap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { useCountdown } from '@/hooks/useCountdown'
import { Spinner } from '@/components/ui/Spinner'

// ── Decoration helpers ────────────────────────────────────────
const FLOWERS = ['🌸', '🌺', '🌼', '🌻', '💐', '🌹', '🌷']
const CONFETTI_COLORS = ['bg-gold-400', 'bg-navy-400', 'bg-pink-400', 'bg-emerald-400', 'bg-purple-400', 'bg-red-400']

function FlowerRing() {
  const positions = [
    { top: '8%',  left: '4%',  anim: 'animate-blink-flower',   size: 'text-2xl', delay: '' },
    { top: '5%',  left: '18%', anim: 'animate-blink-flower-2', size: 'text-xl',  delay: '' },
    { top: '12%', left: '32%', anim: 'animate-blink-flower-3', size: 'text-3xl', delay: '' },
    { top: '5%',  left: '50%', anim: 'animate-blink-flower',   size: 'text-2xl', delay: '' },
    { top: '10%', left: '65%', anim: 'animate-blink-flower-2', size: 'text-xl',  delay: '' },
    { top: '6%',  left: '80%', anim: 'animate-blink-flower-3', size: 'text-3xl', delay: '' },
    { top: '5%',  left: '93%', anim: 'animate-blink-flower',   size: 'text-2xl', delay: '' },
    { top: '88%', left: '3%',  anim: 'animate-blink-flower-2', size: 'text-2xl', delay: '' },
    { top: '85%', left: '16%', anim: 'animate-blink-flower-3', size: 'text-xl',  delay: '' },
    { top: '90%', left: '30%', anim: 'animate-blink-flower',   size: 'text-3xl', delay: '' },
    { top: '86%', left: '50%', anim: 'animate-blink-flower-2', size: 'text-2xl', delay: '' },
    { top: '88%', left: '68%', anim: 'animate-blink-flower-3', size: 'text-xl',  delay: '' },
    { top: '84%', left: '82%', anim: 'animate-blink-flower',   size: 'text-3xl', delay: '' },
    { top: '87%', left: '95%', anim: 'animate-blink-flower-2', size: 'text-2xl', delay: '' },
    { top: '35%', left: '1%',  anim: 'animate-blink-flower-3', size: 'text-xl',  delay: '' },
    { top: '55%', left: '2%',  anim: 'animate-blink-flower',   size: 'text-2xl', delay: '' },
    { top: '35%', left: '97%', anim: 'animate-blink-flower-2', size: 'text-xl',  delay: '' },
    { top: '55%', left: '96%', anim: 'animate-blink-flower-3', size: 'text-2xl', delay: '' },
  ]
  return (
    <>
      {positions.map((p, i) => (
        <span key={i} className={`absolute ${p.anim} ${p.size} select-none pointer-events-none`}
          style={{ top: p.top, left: p.left }}>
          {FLOWERS[i % FLOWERS.length]}
        </span>
      ))}
    </>
  )
}

function ConfettiPieces() {
  const pieces = [
    { left: '10%', anim: 'animate-confetti-1' },
    { left: '22%', anim: 'animate-confetti-2' },
    { left: '38%', anim: 'animate-confetti-3' },
    { left: '52%', anim: 'animate-confetti-4' },
    { left: '65%', anim: 'animate-confetti-1' },
    { left: '78%', anim: 'animate-confetti-2' },
    { left: '88%', anim: 'animate-confetti-3' },
    { left: '30%', anim: 'animate-confetti-4' },
    { left: '70%', anim: 'animate-confetti-1' },
  ]
  return (
    <>
      {pieces.map((p, i) => (
        <div key={i} className={`absolute top-0 w-2 h-2 rounded-sm ${CONFETTI_COLORS[i % CONFETTI_COLORS.length]} ${p.anim} opacity-80`}
          style={{ left: p.left }} />
      ))}
    </>
  )
}

function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-600 via-navy-500 to-navy-700 p-8 sm:p-12 text-center shadow-2xl border-2 border-gold-400">
      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,154,66,0.18)_0%,transparent_70%)] pointer-events-none" />

      {/* Confetti */}
      <ConfettiPieces />

      {/* Flower ring */}
      <FlowerRing />

      {/* Stars */}
      <span className="absolute top-[20%] left-[8%]  text-gold-300 text-lg animate-star-pulse">✦</span>
      <span className="absolute top-[25%] right-[8%] text-gold-300 text-lg animate-star-pulse" style={{animationDelay:'0.7s'}}>✦</span>
      <span className="absolute top-[70%] left-[12%] text-gold-200 text-sm animate-star-pulse" style={{animationDelay:'1.1s'}}>✧</span>
      <span className="absolute top-[65%] right-[12%] text-gold-200 text-sm animate-star-pulse" style={{animationDelay:'0.4s'}}>✧</span>
      <span className="absolute top-[45%] left-[5%]  text-gold-400 text-xs animate-star-pulse" style={{animationDelay:'1.5s'}}>★</span>
      <span className="absolute top-[45%] right-[5%] text-gold-400 text-xs animate-star-pulse" style={{animationDelay:'0.9s'}}>★</span>

      {/* Main content */}
      <div className="relative z-10 space-y-4">
        {/* Floating cap */}
        <div className="animate-float text-6xl sm:text-7xl">🎓</div>

        {/* Congratulations ribbon */}
        <div className="animate-ribbon inline-block">
          <span className="bg-gold-500 text-navy-500 text-xs sm:text-sm font-black px-5 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
            🎉 Congratulations 🎉
          </span>
        </div>

        {/* Name */}
        <div>
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight animate-shimmer">
            Joseph Mugambi
          </h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="h-px w-12 bg-gold-400 opacity-60" />
            <span className="text-gold-300 text-xs sm:text-sm font-bold tracking-widest uppercase">Master of Science</span>
            <span className="h-px w-12 bg-gold-400 opacity-60" />
          </div>
        </div>

        {/* Degree */}
        <div className="bg-white/10 backdrop-blur-sm border border-gold-400/40 rounded-2xl px-6 py-3 inline-block">
          <p className="text-gold-200 text-sm sm:text-base font-bold">Data Science &amp; Analytics</p>
          <p className="text-white/60 text-xs mt-0.5">Saturday, 15 August 2026 · Nairobi Club</p>
        </div>

        {/* Floating flowers row */}
        <div className="flex justify-center gap-3 pt-1">
          {['🌸', '🌺', '💐', '🌹', '🌷', '🌼', '🌻'].map((f, i) => (
            <span key={i}
              className={i % 3 === 0 ? 'animate-float text-xl' : i % 3 === 1 ? 'animate-float-slow text-xl' : 'animate-float-delayed text-xl'}
              style={{ animationDelay: `${i * 0.2}s` }}>
              {f}
            </span>
          ))}
        </div>

        {/* Quote */}
        <p className="text-white/50 text-xs italic pt-1">
          &ldquo;The tassel was worth the hassle.&rdquo;
        </p>
      </div>
    </div>
  )
}

export function HomeTab() {
  const { user, profile, refreshProfile } = useAuth()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile?.display_name) setName(profile.display_name)
  }, [profile?.display_name])
  const { days, hours, minutes, seconds, past } = useCountdown()
  const supabase = useMemo(() => createClient(), [])

  const hasTwoNames = (val: string) => val.trim().split(/\s+/).filter(Boolean).length >= 2

  const handleSave = async () => {
    if (!name.trim()) return
    if (!hasTwoNames(name)) return toast.error('Please enter your first and last name.')
    if (!user) return toast.error('Still connecting, please wait a moment and try again.')
    setSaving(true)
    const { error } = await (supabase as any).from('profiles').upsert({ id: user.id, display_name: name.trim() })
    setSaving(false)
    if (error) return toast.error(error.message)
    await refreshProfile()
    toast.success(`Welcome, ${name.trim()}! 🎓`)
  }

  const unit = (val: number, label: string) => (
    <div className="flex flex-col items-center bg-navy-500 text-white rounded-2xl px-2 py-2 sm:px-4 sm:py-3 flex-1 min-w-0">
      <span className="text-xl sm:text-3xl font-black tabular-nums">{String(val).padStart(2, '0')}</span>
      <span className="text-[10px] sm:text-xs text-gold-300 font-bold uppercase tracking-wider">{label}</span>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <HeroBanner />
      {!profile && (
        <div className="bg-gold-50 border border-gold-200 rounded-2xl p-4 flex items-start gap-3">
          <GraduationCap className="w-5 h-5 text-gold-600 mt-0.5 shrink-0" />
          <p className="text-sm text-gold-800 font-medium">
            Welcome! Enter your first and last name below to join the celebration and access all features.
          </p>
        </div>
      )}
      {profile && !hasTwoNames(profile.display_name) && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <GraduationCap className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            ⚠️ Please update your name to include both your first and last name below.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="section-title flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-gold-500" /> Guest Access
          </h2>
          {profile ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
                <div className="w-10 h-10 rounded-full bg-navy-500 text-white flex items-center justify-center font-black text-lg">
                  {profile.display_name[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-navy-500">{profile.display_name}</p>
                  <p className="text-xs text-green-600 font-semibold">{profile.is_admin ? '⭐ Administrator' : '✓ Signed in as guest'}</p>
                </div>
              </div>
              <div>
                <label className="label">Update your name</label>
                <input id="display-name" name="display_name" className="input" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} />
                <button onClick={handleSave} disabled={saving} className="btn-primary mt-3 w-full flex items-center justify-center gap-2">
                  {saving ? <Spinner size="sm" /> : null} Update Name
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="label">Your full name</label>
              <input id="display-name" name="display_name" className="input" placeholder="e.g. Jane Wanjiku" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} />
              <button onClick={handleSave} disabled={saving} className="btn-primary mt-3 w-full flex items-center justify-center gap-2">
                {saving ? <Spinner size="sm" /> : <GraduationCap className="w-4 h-4" />}
                Enter GradConnect
              </button>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="section-title">⏳ Countdown to Celebration</h2>
          {past ? (
            <p className="text-2xl font-black text-gold-500 text-center py-4">🎉 The celebration is here!</p>
          ) : (
            <div className="flex gap-1 sm:gap-2 mt-2 w-full">
              {unit(days, 'Days')}
              {unit(hours, 'Hours')}
              {unit(minutes, 'Mins')}
              {unit(seconds, 'Secs')}
            </div>
          )}
          <p className="text-xs text-gray-400 text-center mt-3">Saturday, 15 August 2026 · 2:00 PM · Nairobi Club</p>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">📋 Event Programme</h2>
        <ol className="space-y-3">
          {[
            ['2:00 PM', 'Guest arrival & welcome drinks'],
            ['2:30 PM', 'Refreshments and networking'],
            ['3:00 PM', 'Graduation toast and speeches'],
            ['3:45 PM', 'Photography session'],
            ['4:30 PM', 'Entertainment and celebration'],
            ['6:00 PM', 'Closing remarks'],
          ].map(([time, event], i) => (
            <li key={i} className="flex items-start gap-4">
              <span className="bg-gold-100 text-gold-700 text-xs font-black px-2.5 py-1 rounded-lg whitespace-nowrap">{time}</span>
              <span className="text-sm text-navy-500 font-medium pt-0.5">{event}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
