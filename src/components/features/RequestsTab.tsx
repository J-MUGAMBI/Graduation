'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'react-hot-toast'
import { Bell, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { RequestView } from '@/types/database'

const REQUEST_TYPES = ['Bottled water', 'Food service', 'Transport assistance', 'Photography assistance', 'Seating support', 'Other']

export function RequestsTab() {
  const { user, profile } = useAuth()
  const [requests, setRequests] = useState<RequestView[]>([])
  const [type, setType] = useState(REQUEST_TYPES[0])
  const [location, setLocation] = useState('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return }
    const query = profile?.is_admin
      ? supabase.from('requests_view').select('*').order('created_at', { ascending: false })
      : supabase.from('requests_view').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    const { data } = await query
    setRequests(data ?? [])
    setLoading(false)
  }, [user, profile, supabase])

  useEffect(() => {
    load()
    const channel = supabase.channel('requests-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, load)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return toast.error('Please enter your name on the Home tab first.')
    setSubmitting(true)
    const { error } = await supabase.from('requests').insert({ user_id: user!.id, type, location, details })
    setSubmitting(false)
    if (error) return toast.error(error.message)
    toast.success('Request submitted!')
    setLocation('')
    setDetails('')
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
      <div className="card">
        <h2 className="section-title flex items-center gap-2"><Bell className="w-5 h-5 text-gold-500" /> Make a Request</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Request type</label>
            <select className="input" value={type} onChange={e => setType(e.target.value)}>
              {REQUEST_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Table or location</label>
            <input className="input" placeholder="e.g. Table 6, Near the entrance" value={location} onChange={e => setLocation(e.target.value)} />
          </div>
          <div>
            <label className="label">Details</label>
            <textarea className="input min-h-[80px] resize-none" placeholder="Any additional details..." value={details} onChange={e => setDetails(e.target.value)} />
          </div>
          <button type="submit" disabled={submitting} className="btn-gold w-full flex items-center justify-center gap-2">
            {submitting ? <Spinner size="sm" /> : <Send className="w-4 h-4" />} Submit Request
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="section-title flex items-center gap-2">
          <Bell className="w-5 h-5 text-gold-500" /> {profile?.is_admin ? 'All Requests' : 'My Requests'}
        </h2>
        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : requests.length === 0 ? (
          <EmptyState icon={Bell} title="No requests yet" />
        ) : (
          <div className="space-y-3 max-h-[420px] overflow-y-auto scrollbar-thin pr-1">
            {requests.map(req => (
              <div key={req.id} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm text-navy-500">{req.type}</p>
                    {profile?.is_admin && <p className="text-xs text-gold-600 font-semibold">{req.display_name}</p>}
                  </div>
                  <StatusBadge status={req.status} />
                </div>
                {req.location && <p className="text-xs text-gray-500 mt-1">📍 {req.location}</p>}
                {req.details && <p className="text-sm text-gray-600 mt-1">{req.details}</p>}
                <p className="text-xs text-gray-400 mt-1.5">{formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
