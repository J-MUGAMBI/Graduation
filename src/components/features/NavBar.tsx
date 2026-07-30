'use client'

import { Home, CheckSquare, Rss, MessageCircle, Bell, Image, LayoutDashboard } from 'lucide-react'

const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'rsvp', label: 'RSVP', icon: CheckSquare },
  { id: 'feed', label: 'Live Feed', icon: Rss },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'requests', label: 'Requests', icon: Bell },
  { id: 'gallery', label: 'Gallery', icon: Image },
  { id: 'admin', label: 'Host', icon: LayoutDashboard },
]

interface Props {
  active: string
  isAdmin: boolean
  onTabChange: (tab: string) => void
}

export function NavBar({ active, isAdmin, onTabChange }: Props) {
  const visible = TABS.filter(t => t.id !== 'admin' || isAdmin)
  return (
    <nav className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-2">
        <div className="flex overflow-x-auto scrollbar-thin gap-1 py-2">
          {visible.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-150 ${
                active === id
                  ? 'bg-navy-500 text-white shadow-md'
                  : 'text-navy-400 hover:bg-cream hover:text-navy-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
