import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'

interface AuthResult {
  error: string | null
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  // Keep the display username in sync with whoever is currently logged in.
  useEffect(() => {
    if (!user) {
      setUsername(null)
      return
    }

    let cancelled = false
    supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (!cancelled) setUsername(data?.username ?? null)
      })

    return () => {
      cancelled = true
    }
  }, [user])

  async function signUp(email: string, password: string, chosenUsername: string): Promise<AuthResult> {
    if (!isSupabaseConfigured) return { error: 'Leaderboard is not configured yet.' }
    if (chosenUsername.trim().length < 3) {
      return { error: 'Username must be at least 3 characters.' }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: chosenUsername.trim() } },
    })

    if (error) return { error: error.message }
    return { error: null }
  }

  async function signIn(email: string, password: string): Promise<AuthResult> {
    if (!isSupabaseConfigured) return { error: 'Leaderboard is not configured yet.' }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  }

  async function signOut(): Promise<void> {
    if (!isSupabaseConfigured) return
    await supabase.auth.signOut()
  }

  return { user, username, loading, signUp, signIn, signOut, isConfigured: isSupabaseConfigured }
}