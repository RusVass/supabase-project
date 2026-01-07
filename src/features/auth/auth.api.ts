import { supabase } from '../../lib/supabase'

export const signUpWithEmail = async (email: string, password: string): Promise<void> => {
  const { error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
}

export const signInWithEmail = async (email: string, password: string): Promise<void> => {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export const signOut = async (): Promise<void> => {
  try {
    // Check if there's an active session first
    const { data: sessionData } = await supabase.auth.getSession()
    
    // If no session exists, consider it already signed out
    if (!sessionData.session) {
      return
    }
    
    const { error } = await supabase.auth.signOut()
    
    // If error is about missing session or forbidden (403), ignore it (user is already signed out)
    if (error) {
      const errorMessage = error.message?.toLowerCase() || ''
      const errorObj = error as { status?: number; code?: number | string }
      const errorStatus = errorObj?.status || errorObj?.code
      
      // Ignore errors related to missing/invalid sessions or 403 Forbidden
      if (
        errorMessage.includes('session') && errorMessage.includes('missing') ||
        errorMessage.includes('auth session') ||
        errorStatus === 403 ||
        errorStatus === '403' ||
        errorMessage.includes('forbidden')
      ) {
        // User is already signed out or session is invalid
        return
      }
      
      throw error
    }
  } catch (err) {
    // If it's a network error or 403, treat as successful sign out
    const error = err as { status?: number; code?: number | string; response?: { status?: number }; message?: string }
    const errorStatus = error?.status || error?.code || error?.response?.status
    const errorMessage = error?.message?.toLowerCase() || ''
    
    if (
      errorStatus === 403 ||
      errorStatus === '403' ||
      errorMessage.includes('forbidden') ||
      errorMessage.includes('session') && errorMessage.includes('missing')
    ) {
      // User is effectively signed out
      return
    }
    
    throw err
  }
}

export const signInWithGoogle = async (): Promise<void> => {
  // Supabase automatically uses PKCE flow for better mobile support
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}`,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account', // Show account picker on mobile devices
      },
    },
  })

  if (error) throw error
}
