export type Profile = {
  user_id: string
  email: string
  first_name: string | null
  last_name: string | null
  username: string | null
  date_of_birth: string | null
  phone: string | null
  bio: string | null
  location: string | null
  timezone: string | null
  avatar_url: string | null
  cover_url: string | null
  gallery: string[] | null
  created_at?: string
}
