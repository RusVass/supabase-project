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
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const signInWithGoogle = async (): Promise<void> => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}`,
    },
  })

  if (error) throw error
}
