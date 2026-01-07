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

export const upsertMyProfile = async (profile: Partial<Profile> & { user_id: string; email: string }): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'user_id' })
    .select('*')
    .single()

  if (error) throw error
  return data
}

export const updateMyProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select('*')
    .single()

  if (error) {
    const errorMessage = error.message || 'Unknown error'
    
    if (errorMessage.includes('duplicate key') || errorMessage.includes('unique')) {
      throw new Error('Username already exists. Please choose another one.')
    }
    
    if (errorMessage.includes('violates foreign key')) {
      throw new Error('Invalid user reference.')
    }
    
    if (errorMessage.includes('column') || errorMessage.includes('does not exist') || errorMessage.includes('unknown column')) {
      throw new Error('Database schema needs to be updated. Open Supabase Dashboard → SQL Editor and run the migration from migrations/add_profile_fields.sql file.')
    }
    
    throw new Error(errorMessage)
  }
  
  return data
}
