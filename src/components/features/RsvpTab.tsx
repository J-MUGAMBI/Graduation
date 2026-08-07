/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useMemo } from 'react'
import { toast } from 'react-hot-toast'
import { CheckSquare, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { Rsvp } from '@/types/database'

export function RsvpTab() {
  const { user, profile } = useAuth()
  const [existing, setExisting] = useState<Rsvp | null>(null)
  const [phone, setPhone] = useState('+254')
  const [status, setStatus] = useState('attending')
  const [dietary, setDietary] = useState('None')
  const [note, setNote] = useState('')
  const [attendeeCount, setAttendeeCount] = useState(1)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!user) { setLoading(false); return }
    ;(supabase as any).from('rsvps').select('*').eq('user_id', user.id).maybeSingle().then(({ data }: { data: Rsvp | null }) => {
      if (data) {
        setExisting(data)
        setPhone(data.phone ?? '+254')
        setStatus(data.status)
        setDietary(data.dietary ?? 'None')
        setNote(data.note ?? '')
        setAttendeeCount(data.attendee_count ?? 1)
      }
      setLoading(false)
    })
  }, [user, supabase])

  const isValidPhone = (val: string) => /^\+254\d{9}$/.test(val.replace(/\s/g, ''))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return toast.error('Please enter your name on the Home tab first.')
    if (!user) return
    if (!isValidPhone(phone)) return toast.error('Enter a valid phone number: +254 followed by 9 digits.')
    setSaving(true)
    const { error } = await (supabase as any).from('rsvps').upsert(
      { user_id: user.id, phone, status, dietary, note, attendee_count: attendeeCount },
      { onConflict: 'user_id' }
    )
    setSaving(false)
    if (error) return toast.error(error.message)
    toast.success('Your RSVP has been saved! 🎉')
    setExisting({ id: existing?.id ?? '', user_id: user.id, phone, status, dietary, note, attendee_count: attendeeCount, created_at: existing?.created_at ?? new Date().toISOString() })
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  const needsPhone = existing && (!existing.phone || !isValidPhone(existing.phone))

  return (
    <div className="space-y-6 animate-fade-in">
      {needsPhone && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <CheckSquare className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            ⚠️ Please update your RSVP with a valid phone number (+254 followed by 9 digits).
          </p>
        </div>
      )}
      {existing && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckSquare className="w-5 h-5 text-green-600 shrink-0" />
          <div>
            <p className="font-bold text-green-800">RSVP on file</p>
            <p className="text-sm text-green-700">Status: <StatusBadge status={existing.status} /> · {existing.attendee_count} attendee(s)</p>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="section-title flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-gold-500" /> Confirm Attendance
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Phone number <span className="text-red-500">*</span></label>
              <input
                className="input"
                type="tel"
                placeholder="+254 7XXXXXXXX"
                value={phone}
                onChange={e => {
                  let val = e.target.value
                  if (!val.startsWith('+254')) val = '+254'
                  setPhone(val)
                }}
              />
              <p className="text-xs text-gray-400 mt-1">Format: +254 followed by 9 digits</p>
            </div>
            <div>
              <label className="label">Attendance</label>
              <select className="input" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="attending">✅ Yes, I will attend</option>
                <option value="declined">❌ No, I cannot attend</option>
                <option value="maybe">🤔 Maybe</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-1"><Users className="w-4 h-4" /> Number of attendees</label>
              <input className="input" type="number" min={1} max={10} value={attendeeCount} onChange={e => setAttendeeCount(Number(e.target.value))} />
            </div>
            <div>
              <label className="label">Dietary preference</label>
              <select className="input" value={dietary} onChange={e => setDietary(e.target.value)}>
                {['None', 'Vegetarian', 'Vegan', 'Halal', 'Gluten-free', 'Other'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Special requests or notes</label>
            <textarea className="input min-h-[80px] resize-none" placeholder="Any special requirements..." value={note} onChange={e => setNote(e.target.value)} />
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
            {saving ? <Spinner size="sm" /> : <CheckSquare className="w-4 h-4" />}
            {existing ? 'Update RSVP' : 'Submit RSVP'}
          </button>
        </form>
      </div>
    </div>
  )
}
