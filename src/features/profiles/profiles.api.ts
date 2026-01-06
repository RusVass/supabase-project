import { supabase } from '../../lib/supabase'
import type { Profile } from './profiles.types'

export const getMyProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export const upsertMyProfile = async (profile: Profile): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'user_id' })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export const updateMyProfileAge = async (userId: string, age: number): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ age })
    .eq('user_id', userId)
    .select('*')
    .single()

  if (error) throw error
  return data
}
