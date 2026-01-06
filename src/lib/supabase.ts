import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

function assertEnv(value: string | undefined, name: string): string {
  if (!value || value.trim() === '') {
    const isProduction = import.meta.env.PROD
    const message = isProduction
      ? `Missing env ${name}. Please configure ${name} in your deployment platform (Vercel, Netlify, etc.).`
      : `Missing env ${name}. Create .env.local file with ${name} variable. See .env.example for reference.`
    throw new Error(message)
  }
  return value
}

export const supabase = createClient(
  assertEnv(supabaseUrl, 'VITE_SUPABASE_URL'),
  assertEnv(supabaseAnonKey, 'VITE_SUPABASE_ANON_KEY'),
)
