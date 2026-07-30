'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'react-hot-toast'
import { LayoutDashboard, Users, CheckSquare, Bell, Image, Megaphone, Trash2, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/ui/Spinner'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { RsvpView, RequestView, PhotoView, FeedPostView } from '@/types/database'

interface Stats { rsvps: number; attending: number; requests: number; photos: number; posts: number; totalAttendees: number }

export function AdminTab() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState<Stats>({ rsvps: 0, attending: 0, requests: 0, photos: 0, posts: 0, totalAttendees: 0 })
  const [rsvps, setRsvps] = useState<RsvpView[]>([])
  const [requests, setRequests] = useState<RequestView[]>([])
  const [photos, setPhotos] = useState<PhotoView[]>([])
  const [posts, setPosts] = useState<FeedPostView[]>([])
  const [announcement, setAnnouncement] = useState('')
  const [posting, setPosting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<'rsvps' | 'requests' | 'photos' | 'posts'>('rsvps')
  const supabase = useMemo(() => createClient(), [])

  const load = useCallback(async () => {
    const db = supabase as any
    const [r1, r2, r3, r4] = await Promise.all([
      db.from('rsvps_view').select('*').order('created_at', { ascending: false }),
      db.from('requests_view').select('*').order('created_at', { ascending: false }),
      db.from('photos_view').select('*').order('created_at', { ascending: false }),
      db.from('feed_posts_view').select('*').order('created_at', { ascending: false }).limit(50),
    ])
    const rsvpData: RsvpView[] = r1.data ?? []
    const reqData: RequestView[] = r2.data ?? []
    const photoData: PhotoView[] = r3.data ?? []
    const postData: FeedPostView[] = r4.data ?? []
    setRsvps(rsvpData)
    setRequests(reqData)
    setPhotos(photoData)
    setPosts(postData)
    setStats({
      rsvps: rsvpData.length,
      attending: rsvpData.filter(r => r.status === 'attending').length,
      requests: reqData.length,
      photos: photoData.length,
      posts: postData.length,
      totalAttendees: rsvpData.filter(r => r.status === 'attending').reduce((s, r) => s + (r.attendee_count ?? 1), 0),
    })
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    if (profile === null) return
    if (!profile.is_admin) { setLoading(false); return }
    load()
  }, [profile, load])

  const setRequestStatus = async (id: string, status: string) => {
    const { error } = await (supabase as any).from('requests').update({ status }).eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success(`Status → ${status}`); load() }
  }

  const deletePhoto = async (photo: PhotoView) => {
    await supabase.storage.from('event-photos').remove([photo.storage_path])
    await (supabase as any).from('photos').delete().eq('id', photo.id)
    toast.success('Photo removed.')
    load()
  }

  const togglePhotoApproval = async (photo: PhotoView) => {
    await (supabase as any).from('photos').update({ approved: !photo.approved }).eq('id', photo.id)
    load()
  }

  const sendAnnouncement = async () => {
    if (!announcement.trim()) return
    setPosting(true)
    const { error } = await (supabase as any).from('feed_posts').insert({
      user_id: user!.id,
      body: announcement.trim(),
      is_announcement: true,
    })
    setPosting(false)
    if (error) return toast.error(error.message)
    toast.success('Announcement published! 📢')
    setAnnouncement('')
    load()
  }

  const deletePost = async (id: string) => {
    await (supabase as any).from('feed_posts').delete().eq('id', id)
    load()
  }

  if (!profile?.is_admin) {
    return (
      <div className="card text-center py-16 animate-fade-in">
        <LayoutDashboard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="font-bold text-navy-500">Administrator Access Required</p>
        <p className="text-sm text-gray-400 mt-1">Only accounts marked as administrators in Supabase can access this section.</p>
      </div>
    )
  }

  const statCards = [
    { label: 'Total RSVPs', value: stats.rsvps, icon: CheckSquare, color: 'text-blue-600 bg-blue-50' },
    { label: 'Attending', value: stats.attending, icon: Users, color: 'text-green-600 bg-green-50' },
    { label: 'Total Guests', value: stats.totalAttendees, icon: Users, color: 'text-gold-600 bg-gold-50' },
    { label: 'Requests', value: stats.requests, icon: Bell, color: 'text-amber-600 bg-amber-50' },
    { label: 'Photos', value: stats.photos, icon: Image, color: 'text-purple-600 bg-purple-50' },
    { label: 'Feed Posts', value: stats.posts, icon: Megaphone, color: 'text-navy-600 bg-navy-50' },
  ]

  const sections = [
    { id: 'rsvps' as const, label: 'RSVPs', count: stats.rsvps },
    { id: 'requests' as const, label: 'Requests', count: stats.requests },
    { id: 'photos' as const, label: 'Photos', count: stats.photos },
    { id: 'posts' as const, label: 'Feed Posts', count: stats.posts },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="section-title flex items-center gap-2 mb-0"><LayoutDashboard className="w-5 h-5 text-gold-500" /> Host Dashboard</h2>
        <button onClick={load} className="btn-ghost flex items-center gap-1.5 text-sm"><RefreshCw className="w-4 h-4" /> Refresh</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 text-center">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-navy-500">{value}</p>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="font-black text-navy-500 mb-3 flex items-center gap-2"><Megaphone className="w-4 h-4 text-gold-500" /> Publish Announcement</h3>
        <textarea className="input min-h-[80px] resize-none" placeholder="Write an announcement to all guests..." value={announcement} onChange={e => setAnnouncement(e.target.value)} />
        <button onClick={sendAnnouncement} disabled={posting || !announcement.trim()} className="btn-gold mt-3 flex items-center gap-2">
          {posting ? <Spinner size="sm" /> : <Megaphone className="w-4 h-4" />} Publish
        </button>
      </div>

      <div className="card">
        <div className="flex gap-2 flex-wrap mb-4">
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeSection === s.id ? 'bg-navy-500 text-white' : 'bg-gray-100 text-navy-400 hover:bg-gray-200'}`}>
              {s.label} <span className="ml-1 opacity-70">({s.count})</span>
            </button>
          ))}
        </div>

        {loading ? <div className="flex justify-center py-10"><Spinner /></div> : (
          <>
            {activeSection === 'rsvps' && (
              <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin">
                {rsvps.length === 0 ? <p className="text-gray-400 text-sm text-center py-6">No RSVPs yet.</p> : rsvps.map(r => (
                  <div key={r.id} className="flex items-start justify-between gap-3 bg-gray-50 rounded-xl p-3">
                    <div>
                      <p className="font-bold text-sm text-navy-500">{r.display_name}</p>
                      <p className="text-xs text-gray-500">{r.phone} · {r.dietary} · {r.attendee_count} guest(s)</p>
                      {r.note && <p className="text-xs text-gray-400 mt-0.5 italic">{r.note}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'requests' && (
              <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin">
                {requests.length === 0 ? <p className="text-gray-400 text-sm text-center py-6">No requests yet.</p> : requests.map(r => (
                  <div key={r.id} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-bold text-sm text-navy-500">{r.type}</p>
                        <p className="text-xs text-gold-600 font-semibold">{r.display_name}</p>
                        {r.location && <p className="text-xs text-gray-500">📍 {r.location}</p>}
                        {r.details && <p className="text-xs text-gray-600 mt-0.5">{r.details}</p>}
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {['Received', 'Being Handled', 'Completed'].map(s => (
                        <button key={s} onClick={() => setRequestStatus(r.id, s)} className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all ${r.status === s ? 'bg-navy-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>{s}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'photos' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto scrollbar-thin">
                {photos.length === 0 ? <p className="text-gray-400 text-sm col-span-full text-center py-6">No photos yet.</p> : photos.map(p => (
                  <div key={p.id} className={`relative rounded-xl overflow-hidden border-2 ${p.approved ? 'border-green-300' : 'border-red-300'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.public_url} alt={p.caption ?? ''} className="w-full h-32 object-cover" />
                    <div className="p-2 bg-white">
                      <p className="text-xs font-semibold text-navy-500 truncate">{p.display_name}</p>
                      <div className="flex gap-1 mt-1">
                        <button onClick={() => togglePhotoApproval(p)} className={`text-xs px-2 py-0.5 rounded font-bold ${p.approved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {p.approved ? 'Approved' : 'Hidden'}
                        </button>
                        <button onClick={() => deletePhoto(p)} className="text-xs px-2 py-0.5 rounded font-bold bg-red-100 text-red-700">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeSection === 'posts' && (
              <div className="space-y-2 max-h-[500px] overflow-y-auto scrollbar-thin">
                {posts.length === 0 ? <p className="text-gray-400 text-sm text-center py-6">No posts yet.</p> : posts.map(p => (
                  <div key={p.id} className={`flex items-start justify-between gap-3 rounded-xl p-3 ${p.is_announcement ? 'bg-gold-50 border border-gold-200' : 'bg-gray-50'}`}>
                    <div>
                      <p className="font-bold text-xs text-gold-600">{p.is_announcement ? '📢 Announcement' : p.display_name}</p>
                      <p className="text-sm text-navy-500 mt-0.5">{p.body}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}</p>
                    </div>
                    <button onClick={() => deletePost(p.id)} className="text-gray-300 hover:text-red-500 transition-colors shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
