'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true, refreshProfile: async () => {} })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [configError, setConfigError] = useState(false)
  const supabase = useMemo(() => {
    try { return createClient() } catch { setConfigError(true); return null }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!supabase) return
    const { data: { user: u } } = await supabase.auth.getUser()
    if (!u) return
    const { data } = await (supabase as any).from('profiles').select('*').eq('id', u.id).maybeSingle()
    setProfile(data)
  }, [supabase])

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    const init = async () => {
      let { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        const { data } = await supabase.auth.signInAnonymously()
        session = data.session
      }
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data } = await (supabase as any).from('profiles').select('*').eq('id', session.user.id).maybeSingle()
        setProfile(data)
      }
      setLoading(false)
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  if (configError) return (
    <AuthContext.Provider value={{ user: null, profile: null, loading: false, refreshProfile: async () => {} }}>
      <div style={{padding:'2rem',textAlign:'center',color:'red',fontFamily:'monospace'}}>
        <b>Configuration Error</b><br/>NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are not set.<br/>Add them in Netlify → Site configuration → Environment variables.
      </div>
    </AuthContext.Provider>
  )

  return <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)