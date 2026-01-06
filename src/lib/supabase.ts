import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

function assertEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing env ${name}. Create .env.local file with ${name} variable. See .env.example for reference.`
    )
  }
  return value
}

export const supabase = createClient(
  assertEnv(supabaseUrl, 'VITE_SUPABASE_URL'),
  assertEnv(supabaseAnonKey, 'VITE_SUPABASE_ANON_KEY'),
)
