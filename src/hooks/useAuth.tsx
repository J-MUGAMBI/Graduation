'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

const PROFILE_KEY = 'gc_profile_id'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  supabase: ReturnType<typeof createClient> | null
  refreshProfile: () => Promise<void>
  signInWithName: (name: string, pin: string) => Promise<'new' | 'returning' | 'wrong_pin' | 'error'>
}

const AuthContext = createContext<AuthContextType>({
  user: null, profile: null, loading: true, supabase: null,
  refreshProfile: async () => {},
  signInWithName: async () => 'error',
})

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
    // Prefer the pinned profile id from localStorage
    const pinnedId = localStorage.getItem(PROFILE_KEY)
    const { data: { user: u } } = await supabase.auth.getUser()
    const lookupId = pinnedId ?? u?.id
    if (!lookupId) return
    const { data } = await (supabase as any).from('profiles').select('*').eq('id', lookupId).maybeSingle()
    setProfile(data)
  }, [supabase])

  // Sign in by name + PIN: 'new' if created, 'returning' if verified, 'wrong_pin' if PIN mismatch
  const signInWithName = useCallback(async (name: string, pin: string): Promise<'new' | 'returning' | 'wrong_pin' | 'error'> => {
    if (!supabase) return 'error'
    const { data: { session } } = await supabase.auth.getSession()
    const uid = session?.user?.id
    if (!uid) return 'error'

    // Check if this name already exists
    const { data: existing } = await (supabase as any)
      .from('profiles').select('*').ilike('display_name', name.trim()).maybeSingle()

    if (existing) {
      // Returning user — verify PIN via security definer RPC
      const { data: verified } = await (supabase as any).rpc('verify_pin', { p_name: name.trim(), p_pin: pin })
      if (!verified || verified.length === 0) return 'wrong_pin'
      localStorage.setItem(PROFILE_KEY, existing.id)
      setProfile(existing)
      return 'returning'
    }

    // New user — create profile with PIN
    localStorage.setItem(PROFILE_KEY, uid)
    const { error } = await (supabase as any).from('profiles').upsert({ id: uid, display_name: name.trim(), pin })
    if (error) return 'error'
    await refreshProfile()
    return 'new'
  }, [supabase, refreshProfile])

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
        // Load pinned profile if exists, else load by session uid
        const pinnedId = localStorage.getItem(PROFILE_KEY)
        const lookupId = pinnedId ?? session.user.id
        const { data } = await (supabase as any).from('profiles').select('*').eq('id', lookupId).maybeSingle()
        setProfile(data)
      }
      setLoading(false)
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const pinnedId = localStorage.getItem(PROFILE_KEY)
        const lookupId = pinnedId ?? session.user.id
        const { data } = await (supabase as any).from('profiles').select('*').eq('id', lookupId).maybeSingle()
        setProfile(data)
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  if (configError) return (
    <AuthContext.Provider value={{ user: null, profile: null, loading: false, supabase: null, refreshProfile: async () => {}, signInWithName: async () => 'error' }}>
      <div style={{padding:'2rem',textAlign:'center',color:'red',fontFamily:'monospace'}}>
        <b>Configuration Error</b><br/>NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are not set.<br/>Add them in Netlify → Site configuration → Environment variables.
      </div>
    </AuthContext.Provider>
  )

  return <AuthContext.Provider value={{ user, profile, loading, supabase, refreshProfile, signInWithName }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)