/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { MessageCircle, Send, ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/ui/Spinner'
import type { Profile, DirectMessageView } from '@/types/database'

export function DirectMessageTab() {
  const { user, profile } = useAuth()
  const [guests, setGuests] = useState<Profile[]>([])
  const [selectedGuest, setSelectedGuest] = useState<Profile | null>(null)
  const [messages, setMessages] = useState<DirectMessageView[]>([])
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = useMemo(() => createClient(), [])

  // Load guests (admin) or messages with host (guest)
  const loadGuests = useCallback(async () => {
    const { data } = await (supabase as any).from('profiles').select('*').eq('is_admin', false).order('display_name')
    setGuests(data ?? [])
    setLoading(false)
  }, [supabase])

  const loadMessages = useCallback(async (otherId: string) => {
    const { data, error } = await (supabase as any)
      .from('direct_messages')
      .select('*')
      .or(`sender_id.eq.${user!.id},recipient_id.eq.${user!.id}`)
      .order('created_at', { ascending: true })
    if (error) { console.error('loadMessages', error); return }
    const filtered = (data ?? []).filter((m: DirectMessageView) =>
      (m.sender_id === user!.id && m.recipient_id === otherId) ||
      (m.sender_id === otherId && m.recipient_id === user!.id)
    )
    setMessages(filtered)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [supabase, user])

  useEffect(() => {
    if (!user || !profile) return
    if (profile.is_admin) {
      loadGuests()
    } else {
      setLoading(false)
    }
  }, [user, profile, loadGuests])

  // When guest selects a conversation or admin picks a guest
  useEffect(() => {
    if (!user || !selectedGuest) return
    loadMessages(selectedGuest.id)

    const channel = supabase.channel('dm-' + selectedGuest.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, () => {
        loadMessages(selectedGuest.id)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [selectedGuest, user, supabase, loadMessages])

  // Guest: auto-select the host as conversation partner
  useEffect(() => {
    if (!user || !profile || profile.is_admin) return
    const findHost = async () => {
      const { data } = await (supabase as any).from('profiles').select('*').eq('is_admin', true).limit(1).maybeSingle()
      if (data) setSelectedGuest(data)
      setLoading(false)
    }
    findHost()
  }, [user, profile, supabase])

  const send = async () => {
    if (!body.trim() || !user || !selectedGuest) return
    setSending(true)
    const { error } = await (supabase as any).from('direct_messages').insert({
      sender_id: user.id,
      recipient_id: selectedGuest.id,
      body: body.trim(),
    })
    setSending(false)
    if (error) return toast.error(error.message)
    setBody('')
    loadMessages(selectedGuest.id)
  }

  if (!profile) return (
    <div className="card text-center py-16">
      <p className="text-gray-400">Enter your name on the Home tab first.</p>
    </div>
  )

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  // Guest view — chat directly with host
  if (!profile.is_admin) {
    if (!selectedGuest) return (
      <div className="card text-center py-16">
        <p className="text-gray-400">No host available yet.</p>
      </div>
    )
    return (
      <div className="card flex flex-col h-[600px]">
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
          <MessageCircle className="w-5 h-5 text-gold-500" />
          <span className="font-black text-navy-500">Private message with Host</span>
        </div>
        <ChatWindow messages={messages} userId={user!.id} bottomRef={bottomRef} />
        <ChatInput body={body} setBody={setBody} send={send} sending={sending} />
      </div>
    )
  }

  // Admin view — guest list + chat window
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="section-title flex items-center gap-2 mb-0">
        <MessageCircle className="w-5 h-5 text-gold-500" /> Private Messages
      </h2>

      {!selectedGuest ? (
        <div className="card">
          <p className="text-sm text-gray-400 mb-3 font-semibold">Select a guest to message privately:</p>
          {loading ? <Spinner /> : guests.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">No guests have joined yet.</p>
          ) : (
            <div className="space-y-1">
              {guests.map(g => (
                <button key={g.id} onClick={() => setSelectedGuest(g)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-cream transition-colors text-left">
                  <div className="w-9 h-9 rounded-full bg-navy-500 text-white flex items-center justify-center font-black text-sm shrink-0">
                    {g.display_name[0].toUpperCase()}
                  </div>
                  <span className="font-semibold text-navy-500">{g.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="card flex flex-col h-[600px]">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
            <button onClick={() => { setSelectedGuest(null); setMessages([]) }} className="text-gray-400 hover:text-navy-500 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-navy-500 text-white flex items-center justify-center font-black text-sm">
              {selectedGuest.display_name[0].toUpperCase()}
            </div>
            <span className="font-black text-navy-500">{selectedGuest.display_name}</span>
          </div>
          <ChatWindow messages={messages} userId={user!.id} bottomRef={bottomRef} />
          <ChatInput body={body} setBody={setBody} send={send} sending={sending} />
        </div>
      )}
    </div>
  )
}

function ChatWindow({ messages, userId, bottomRef }: { messages: DirectMessageView[]; userId: string; bottomRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div className="flex-1 overflow-y-auto space-y-2 px-1 mb-3">
      {messages.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-10">No messages yet. Say hello!</p>
      ) : messages.map(m => {
        const mine = m.sender_id === userId
        return (
          <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${mine ? 'bg-navy-500 text-white' : 'bg-gray-100 text-navy-500'}`}>
              <p className="text-sm">{m.body}</p>
              <p className={`text-[10px] mt-1 ${mine ? 'text-blue-200' : 'text-gray-400'}`}>
                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}

function ChatInput({ body, setBody, send, sending }: { body: string; setBody: (v: string) => void; send: () => void; sending: boolean }) {
  return (
    <div className="flex gap-2 pt-3 border-t border-gray-100">
      <input
        className="input flex-1"
        placeholder="Type a message..."
        value={body}
        onChange={e => setBody(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
      />
      <button onClick={send} disabled={sending || !body.trim()} className="btn-primary px-4 flex items-center gap-1.5">
        {sending ? <Spinner size="sm" /> : <Send className="w-4 h-4" />}
      </button>
    </div>
  )
}
