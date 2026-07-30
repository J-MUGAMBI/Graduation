'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'react-hot-toast'
import { Rss, Send, Megaphone, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import type { FeedPostView } from '@/types/database'

export function FeedTab() {
  const { user, profile } = useAuth()
  const [posts, setPosts] = useState<FeedPostView[]>([])
  const [body, setBody] = useState('')
  const [posting, setPosting] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const load = useCallback(async () => {
    const { data } = await supabase.from('feed_posts_view').select('*').order('created_at', { ascending: false }).limit(100)
    setPosts(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    load()
    const channel = supabase.channel('feed-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feed_posts' }, load)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, load])

  const handlePost = async () => {
    if (!profile) return toast.error('Please enter your name on the Home tab first.')
    if (!body.trim()) return
    if (body.trim().length > 1000) return toast.error('Message too long (max 1000 characters).')
    setPosting(true)
    const { error } = await supabase.from('feed_posts').insert({ user_id: user!.id, body: body.trim() })
    setPosting(false)
    if (error) return toast.error(error.message)
    setBody('')
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('feed_posts').delete().eq('id', id)
    if (error) toast.error(error.message)
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
      <div className="card">
        <h2 className="section-title flex items-center gap-2"><Send className="w-5 h-5 text-gold-500" /> Share a Message</h2>
        <textarea
          className="input min-h-[120px] resize-none"
          placeholder="Share a congratulatory message, memory, or update..."
          value={body}
          onChange={e => setBody(e.target.value)}
          maxLength={1000}
        />
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-400">{body.length}/1000</span>
        </div>
        <button onClick={handlePost} disabled={posting || !body.trim()} className="btn-primary w-full mt-3 flex items-center justify-center gap-2">
          {posting ? <Spinner size="sm" /> : <Send className="w-4 h-4" />} Post to Feed
        </button>
      </div>

      <div className="card">
        <h2 className="section-title flex items-center gap-2"><Rss className="w-5 h-5 text-gold-500" /> Live Feed</h2>
        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : posts.length === 0 ? (
          <EmptyState icon={Rss} title="No posts yet" description="Be the first to share a message!" />
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin pr-1">
            {posts.map(post => (
              <div key={post.id} className={`rounded-xl p-3 ${post.is_announcement ? 'bg-gold-50 border border-gold-200' : 'bg-gray-50 border border-gray-100'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {post.is_announcement && <Megaphone className="w-4 h-4 text-gold-600 shrink-0" />}
                    <span className="font-bold text-sm text-navy-500">
                      {post.is_announcement ? 'Host Announcement' : post.display_name}
                    </span>
                  </div>
                  {(user?.id === post.user_id || profile?.is_admin) && (
                    <button onClick={() => handleDelete(post.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{post.body}</p>
                <p className="text-xs text-gray-400 mt-1.5">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
