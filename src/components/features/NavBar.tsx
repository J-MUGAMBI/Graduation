'use client'

import { Home, CheckSquare, Rss, MessageCircle, Bell, Image, LayoutDashboard, Mail } from 'lucide-react'

const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'rsvp', label: 'RSVP', icon: CheckSquare },
  { id: 'feed', label: 'Live Feed', icon: Rss },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'requests', label: 'Requests', icon: Bell },
  { id: 'gallery', label: 'Gallery', icon: Image },
  { id: 'dm', label: 'Messages', icon: Mail },
  { id: 'admin', label: 'Host', icon: LayoutDashboard },
]

interface Props {
  active: string
  isAdmin: boolean
  unreadDm: boolean
  onTabChange: (tab: string) => void
}

export function NavBar({ active, isAdmin, unreadDm, onTabChange }: Props) {
  const visible = TABS.filter(t => t.id !== 'admin' || isAdmin)
  return (
    <nav className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-2">
        <div className="grid grid-cols-8 sm:flex sm:flex-wrap gap-0.5 py-2">
          {visible.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`relative flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-1 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-full text-[9px] sm:text-sm font-bold transition-all duration-150 ${
                active === id
                  ? 'bg-navy-500 text-white shadow-md'
                  : 'text-navy-400 hover:bg-cream hover:text-navy-500'
              }`}
            >
              <span className="relative">
                <Icon className="w-4 h-4" />
                {id === 'dm' && unreadDm && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
                )}
              </span>
              <span className="leading-tight text-center">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
