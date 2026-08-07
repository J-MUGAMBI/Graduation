'use client'

import { useState, useEffect, useMemo } from 'react'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/features/Header'
import { NavBar } from '@/components/features/NavBar'
import { HomeTab } from '@/components/features/HomeTab'
import { RsvpTab } from '@/components/features/RsvpTab'
import { FeedTab } from '@/components/features/FeedTab'
import { ChatTab } from '@/components/features/ChatTab'
import { RequestsTab } from '@/components/features/RequestsTab'
import { GalleryTab } from '@/components/features/GalleryTab'
import { DirectMessageTab } from '@/components/features/DirectMessageTab'
import { AdminTab } from '@/components/features/AdminTab'
import { Spinner } from '@/components/ui/Spinner'

function AppContent() {
  const { loading, profile, user } = useAuth()
  const [activeTab, setActiveTab] = useState('home')
  const [unreadDm, setUnreadDm] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  // Track unread DMs — messages where recipient is current user, received after last visit
  useEffect(() => {
    if (!user || !profile || profile.is_admin) return
    const checkUnread = async () => {
      const lastSeen = localStorage.getItem('dm_last_seen_' + user.id) ?? '1970-01-01'
      const { data } = await (supabase as any)
        .from('direct_messages')
        .select('id')
        .eq('recipient_id', user.id)
        .gt('created_at', lastSeen)
        .limit(1)
      setUnreadDm((data?.length ?? 0) > 0)
    }
    checkUnread()
    const channel = supabase.channel('unread-dm')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, checkUnread)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [user, profile, supabase])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (tab === 'dm' && user) {
      localStorage.setItem('dm_last_seen_' + user.id, new Date().toISOString())
      setUnreadDm(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <p className="text-navy-500 font-bold">Loading GradConnect…</p>
        </div>
      </div>
    )
  }

  const tabs: Record<string, React.ReactNode> = {
    home: <HomeTab />,
    rsvp: <RsvpTab />,
    feed: <FeedTab />,
    chat: <ChatTab />,
    requests: <RequestsTab />,
    gallery: <GalleryTab />,
    dm: <DirectMessageTab />,
    admin: <AdminTab />,
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <NavBar active={activeTab} isAdmin={profile?.is_admin ?? false} unreadDm={unreadDm} onTabChange={handleTabChange} />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {tabs[activeTab]}
      </main>
      <footer className="bg-navy-500 text-white border-t-4 border-gold-500 py-6 text-center">
        <p className="font-bold text-gold-300">GradConnect</p>
        <p className="text-sm text-blue-200 mt-1">Joseph Mugambi · Master&apos;s in Data Science &amp; Analytics · 2026</p>
      </footer>
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
