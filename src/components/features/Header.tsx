'use client'

import { GraduationCap, MapPin, Calendar, Clock } from 'lucide-react'

export function Header() {
  return (
    <header className="bg-gradient-to-br from-navy-500 via-navy-600 to-[#123d7a] text-white border-b-4 border-gold-500">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-5 h-5 text-gold-400" />
              <span className="text-gold-300 text-xs font-black tracking-widest uppercase">GradConnect</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black leading-tight mb-2">
              Joseph Mugambi&apos;s<br />
              <span className="text-gold-400">Graduation Celebration</span>
            </h1>
            <p className="text-blue-200 font-medium">Beyond Data. Beyond Limits. Towards Impact.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 min-w-[240px]">
            <p className="text-gold-300 text-xs font-black uppercase tracking-wider mb-3">Event Details</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-gold-400 shrink-0" />
                <span>Masters in Data Science &amp; Analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold-400 shrink-0" />
                <span>Saturday, 15 August 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-400 shrink-0" />
                <span>2:00 PM EAT</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0" />
                <span>Nairobi Club</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
