'use client'

import { useState } from 'react'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
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
  const { loading, profile } = useAuth()
  const [activeTab, setActiveTab] = useState('home')

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
      <NavBar active={activeTab} isAdmin={profile?.is_admin ?? false} onTabChange={setActiveTab} />
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
