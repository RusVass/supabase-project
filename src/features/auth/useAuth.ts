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
      }
      setIsLoading(false)
    })

    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  const signOut = async (): Promise<void> => {
    await signOutApi()
  }

  return { user, isLoading, signOut }
}
