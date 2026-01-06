import { useState } from 'react'
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../features/auth/auth.api'
import { Button } from '../shared/ui/Button'
import { Input } from '../shared/ui/Input'

export const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogle = async (): Promise<void> => {
    setError('')
    setIsLoading(true)

    try {
      await signInWithGoogle()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google sign in failed')
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setError('Passwords do not match')
          return
        }
        await signUpWithEmail(email, password)
      } else {
        await signInWithEmail(email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isSignUp ? 'Sign Up' : 'Login'}
          </h1>
          <p className="text-gray-600">
            {isSignUp ? 'Create a new account' : 'Log in to your account'}
          </p>
        </div>

        <Button onClick={handleGoogle} disabled={isLoading} type="button" className="w-full h-12 font-semibold mb-4">
          Continue with Google
        </Button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-12"
          />

          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-12"
          />

          {isSignUp && (
            <Input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="h-12"
            />
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm text-center">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow-md transition-all duration-200 hover:shadow-lg disabled:hover:shadow-md"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </div>
            ) : isSignUp ? 'Create account' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
          >
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <span className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
              {isSignUp ? 'Sign in' : 'Sign up'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
