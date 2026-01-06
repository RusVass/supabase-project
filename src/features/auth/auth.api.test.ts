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
    },
  },
}))

describe('auth.api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signUpWithEmail', () => {
    it('викликає supabase.auth.signUp з правильними параметрами', async () => {
      const mockSignUp = vi.mocked(supabase.auth.signUp)
      mockSignUp.mockResolvedValue({ data: { user: null, session: null }, error: null })

      await signUpWithEmail('test@example.com', 'password123')

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('кидає помилку якщо signUp повертає error', async () => {
      const mockError = { message: 'Email already exists', status: 400 }
      const mockSignUp = vi.mocked(supabase.auth.signUp)
      mockSignUp.mockResolvedValue({ data: { user: null, session: null }, error: mockError })

      await expect(signUpWithEmail('test@example.com', 'password123')).rejects.toEqual(
        mockError
      )
    })
  })

  describe('signInWithEmail', () => {
    it('викликає supabase.auth.signInWithPassword з правильними параметрами', async () => {
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

    it('кидає помилку якщо signInWithPassword повертає error', async () => {
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
    it('викликає supabase.auth.signOut', async () => {
      const mockSignOut = vi.mocked(supabase.auth.signOut)
      mockSignOut.mockResolvedValue({ error: null })

      await signOut()

      expect(mockSignOut).toHaveBeenCalled()
    })

    it('кидає помилку якщо signOut повертає error', async () => {
      const mockError = { message: 'Sign out failed', status: 500 }
      const mockSignOut = vi.mocked(supabase.auth.signOut)
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

    it('викликає supabase.auth.signInWithOAuth з правильними параметрами', async () => {
      const mockSignInOAuth = vi.mocked(supabase.auth.signInWithOAuth)
      mockSignInOAuth.mockResolvedValue({ data: { provider: 'google', url: '' }, error: null })

      await signInWithGoogle()

      expect(mockSignInOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:5173',
        },
      })
    })

    it('кидає помилку якщо signInWithOAuth повертає error', async () => {
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

