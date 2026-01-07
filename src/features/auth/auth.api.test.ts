import { describe, it, expect, vi, beforeEach } from 'vitest'
import { signUpWithEmail, signInWithEmail, signOut, signInWithGoogle } from './auth.api'
import { supabase } from '../../lib/supabase'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      signInWithOAuth: vi.fn(),
      getSession: vi.fn(),
    },
  },
}))

describe('auth.api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signUpWithEmail', () => {
    it('calls supabase.auth.signUp with correct parameters', async () => {
      const mockSignUp = vi.mocked(supabase.auth.signUp)
      mockSignUp.mockResolvedValue({ data: { user: null, session: null }, error: null })

      await signUpWithEmail('test@example.com', 'password123')

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('throws error if signUp returns error', async () => {
      const mockError = { message: 'Email already exists', status: 400 }
      const mockSignUp = vi.mocked(supabase.auth.signUp)
      mockSignUp.mockResolvedValue({ data: { user: null, session: null }, error: mockError })

      await expect(signUpWithEmail('test@example.com', 'password123')).rejects.toEqual(
        mockError
      )
    })
  })

  describe('signInWithEmail', () => {
    it('calls supabase.auth.signInWithPassword with correct parameters', async () => {
      const mockSignIn = vi.mocked(supabase.auth.signInWithPassword)
      mockSignIn.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      })

      await signInWithEmail('test@example.com', 'password123')

      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('throws error if signInWithPassword returns error', async () => {
      const mockError = { message: 'Invalid credentials', status: 401 }
      const mockSignIn = vi.mocked(supabase.auth.signInWithPassword)
      mockSignIn.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      })

      await expect(signInWithEmail('test@example.com', 'wrong')).rejects.toEqual(mockError)
    })
  })

  describe('signOut', () => {
    it('calls supabase.auth.signOut when session exists', async () => {
      const mockGetSession = vi.mocked(supabase.auth.getSession)
      const mockSignOut = vi.mocked(supabase.auth.signOut)
      mockGetSession.mockResolvedValue({ data: { session: { user: {} } as unknown }, error: null })
      mockSignOut.mockResolvedValue({ error: null })

      await signOut()

      expect(mockGetSession).toHaveBeenCalled()
      expect(mockSignOut).toHaveBeenCalled()
    })

    it('does not call signOut when no session exists', async () => {
      const mockGetSession = vi.mocked(supabase.auth.getSession)
      const mockSignOut = vi.mocked(supabase.auth.signOut)
      mockGetSession.mockResolvedValue({ data: { session: null }, error: null })

      await signOut()

      expect(mockGetSession).toHaveBeenCalled()
      expect(mockSignOut).not.toHaveBeenCalled()
    })

    it('throws error if signOut returns error', async () => {
      const mockGetSession = vi.mocked(supabase.auth.getSession)
      const mockSignOut = vi.mocked(supabase.auth.signOut)
      mockGetSession.mockResolvedValue({ data: { session: { user: {} } as unknown }, error: null })
      const mockError = { message: 'Sign out failed', status: 500 }
      mockSignOut.mockResolvedValue({ error: mockError })

      await expect(signOut()).rejects.toEqual(mockError)
    })
  })

  describe('signInWithGoogle', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        value: { origin: 'http://localhost:5173' },
        writable: true,
      })
    })

    it('calls supabase.auth.signInWithOAuth with correct parameters', async () => {
      const mockSignInOAuth = vi.mocked(supabase.auth.signInWithOAuth)
      mockSignInOAuth.mockResolvedValue({ data: { provider: 'google', url: '' }, error: null })

      await signInWithGoogle()

      expect(mockSignInOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:5173',
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      })
    })

    it('throws error if signInWithOAuth returns error', async () => {
      const mockError = { message: 'OAuth failed', status: 400 }
      const mockSignInOAuth = vi.mocked(supabase.auth.signInWithOAuth)
      mockSignInOAuth.mockResolvedValue({
        data: { provider: 'google', url: '' },
        error: mockError,
      })

      await expect(signInWithGoogle()).rejects.toEqual(mockError)
    })
  })
})

