/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { UserCircle, GraduationCap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCountdown } from '@/hooks/useCountdown'
import { Spinner } from '@/components/ui/Spinner'

export function HomeTab() {
  const { user, profile, refreshProfile, supabase } = useAuth()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile?.display_name) setName(profile.display_name)
  }, [profile?.display_name])
  const { days, hours, minutes, seconds, past } = useCountdown()

  const hasTwoNames = (val: string) => val.trim().split(/\s+/).filter(Boolean).length >= 2

  const handleSave = async () => {
    if (!name.trim()) return
    if (!hasTwoNames(name)) return toast.error('Please enter your first and last name.')
    setSaving(true)
    const { data: { session } } = await supabase!.auth.getSession()
    const uid = session?.user?.id
    if (!uid) {
      setSaving(false)
      return toast.error('Still connecting, please wait a moment and try again.')
    }
    const { error } = await (supabase as any).from('profiles').upsert({ id: uid, display_name: name.trim() })
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
              <input id="display-name" name="display_name" className="input" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} />
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
