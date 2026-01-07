import { useEffect, useState } from 'react'
import type { AuthUser } from './auth.types'
import { signOut as signOutApi } from './auth.api'
import { supabase } from '../../lib/supabase'

type AuthState = {
  user: AuthUser | null
  isLoading: boolean
  signOut: () => Promise<void>
}

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const setFromSession = async (): Promise<void> => {
      const { data } = await supabase.auth.getSession()
      const u = data.session?.user ?? null
      setUser(u ? { id: u.id, email: u.email ?? null } : null)
      setIsLoading(false)
    }

    void setFromSession()

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const u = session?.user ?? null
        setUser(u ? { id: u.id, email: u.email ?? null } : null)
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setIsLoading(false)
      } else {
        // For other events, update user state based on session
        const u = session?.user ?? null
        setUser(u ? { id: u.id, email: u.email ?? null } : null)
        setIsLoading(false)
      }
    })

    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  const signOut = async (): Promise<void> => {
    try {
      await signOutApi()
    } catch (err) {
      // If signOut fails with 403 or session error, force clear user state
      const error = err as { status?: number; code?: number | string; response?: { status?: number }; message?: string }
      const errorStatus = error?.status || error?.code || error?.response?.status
      const errorMessage = (error?.message || '').toLowerCase()
      
      if (
        errorStatus === 403 ||
        errorStatus === '403' ||
        errorMessage.includes('forbidden') ||
        (errorMessage.includes('session') && errorMessage.includes('missing'))
      ) {
        // Force clear user state if session is invalid
        setUser(null)
        setIsLoading(false)
        return
      }
      
      throw err
    }
    
    // Double-check: if session is gone after signOut, clear user state
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      setUser(null)
      setIsLoading(false)
    }
  }

  return { user, isLoading, signOut }
}
