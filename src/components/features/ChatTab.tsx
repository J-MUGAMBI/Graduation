/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { toast } from 'react-hot-toast'
import { MessageCircle, Send, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import type { MessageView } from '@/types/database'

export function ChatTab() {
  const { user, profile } = useAuth()
  const [messages, setMessages] = useState<MessageView[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = useMemo(() => createClient(), [])

  const load = useCallback(async () => {
    const { data } = await supabase.from('messages_view').select('*').order('created_at', { ascending: true }).limit(200)
    setMessages(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    load()
    const channel = supabase.channel('chat-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, load)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, load])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!profile) return toast.error('Please enter your name on the Home tab first.')
    if (!text.trim()) return
    if (text.trim().length > 500) return toast.error('Message too long (max 500 characters).')
    setSending(true)
    const { error } = await (supabase as any).from('messages').insert({ user_id: user!.id, body: text.trim() })
    setSending(false)
    if (error) return toast.error(error.message)
    setText('')
  }

  const handleDelete = async (id: string) => {
    const { error } = await (supabase as any).from('messages').delete().eq('id', id)
    if (error) toast.error(error.message)
  }

  return (
    <div className="card animate-fade-in">
      <h2 className="section-title flex items-center gap-2"><MessageCircle className="w-5 h-5 text-gold-500" /> Guest Chat</h2>

      <div className="h-[420px] overflow-y-auto scrollbar-thin bg-gray-50 rounded-xl p-3 space-y-2 mb-3">
        {loading ? (
          <div className="flex justify-center items-center h-full"><Spinner /></div>
        ) : messages.length === 0 ? (
          <EmptyState icon={MessageCircle} title="No messages yet" description="Start the conversation!" />
        ) : (
          messages.map(msg => {
            const isOwn = msg.user_id === user?.id
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${isOwn ? 'bg-navy-500 text-white rounded-br-sm' : 'bg-white border border-gray-200 text-navy-500 rounded-bl-sm'}`}>
                  {!isOwn && <p className="text-xs font-bold text-gold-600 mb-0.5">{msg.display_name}</p>}
                  <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className={`text-xs ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {(isOwn || profile?.is_admin) && (
                      <button onClick={() => handleDelete(msg.id)} className={`${isOwn ? 'text-blue-300 hover:text-red-300' : 'text-gray-300 hover:text-red-500'} transition-colors`}>
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Type a message..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
          maxLength={500}
        />
        <button onClick={handleSend} disabled={sending || !text.trim()} className="btn-primary px-4 flex items-center gap-1">
          {sending ? <Spinner size="sm" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
