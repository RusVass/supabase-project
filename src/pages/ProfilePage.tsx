import { useState, useEffect } from 'react'
import { useAuth } from '../features/auth/useAuth'
import { getMyProfile, updateMyProfileAge, upsertMyProfile } from '../features/profiles/profiles.api'
import type { Profile } from '../features/profiles/profiles.types'
import { Button } from '../shared/ui/Button'
import { Input } from '../shared/ui/Input'

export const ProfilePage = () => {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [age, setAge] = useState('')

  useEffect(() => {
    const loadProfile = async (): Promise<void> => {
      if (!user) return

      try {
        const userProfile = await getMyProfile(user.id)
        if (userProfile) {
          setProfile(userProfile)
          setAge(userProfile.age?.toString() || '')
        } else if (user.email) {
          const newProfile: Profile = {
            user_id: user.id,
            email: user.email,
            age: null,
          }
          const createdProfile = await upsertMyProfile(newProfile)
          setProfile(createdProfile)
          setAge('')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    void loadProfile()
  }, [user])

  const handleSave = async (): Promise<void> => {
    if (!user || !user.email) return

    setIsLoading(true)
    setError('')

    try {
      const ageNumber = age ? parseInt(age, 10) : null
      if (ageNumber !== null && (isNaN(ageNumber) || ageNumber < 0)) {
        setError('Age must be a positive number')
        setIsLoading(false)
        return
      }

      const updatedProfile = ageNumber !== null
        ? await updateMyProfileAge(user.id, ageNumber)
        : await upsertMyProfile({
            user_id: user.id,
            email: user.email,
            age: null,
          })

      setProfile(updatedProfile)
      setIsEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = (): void => {
    if (profile) {
      setAge(profile.age?.toString() || '')
    }
    setIsEditing(false)
    setError('')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Please sign in</p>
      </div>
    )
  }

  if (isLoading && !profile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-sm mx-auto py-4 px-3">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold text-white">User Profile</h1>
                <p className="text-blue-100 mt-1 text-sm">Manage your data</p>
              </div>
              <Button
                onClick={signOut}
                className="bg-white/10 text-white border border-white/20 hover:bg-white/20 text-sm px-3 py-1.5"
              >
                Sign out
              </Button>
            </div>
          </div>

          <div className="p-4">

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email address
              </label>
              <p className="text-gray-900 font-medium">{user.email}</p>
            </div>

            {isEditing ? (
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit profile</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Age
                      </label>
                      <Input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="Enter your age"
                        className="h-10"
                        min="0"
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-700 text-sm">{error}</p>
                      </div>
                    )}

                    <div className="flex gap-4 pt-4">
                      <Button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="flex-1 h-10 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                          </div>
                        ) : (
                          'Save'
                        )}
                      </Button>
                      <Button
                        onClick={handleCancel}
                        className="flex-1 h-10 bg-gray-200 text-gray-800 hover:bg-gray-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Age
                    </label>
                    <p className="text-gray-900 text-lg">{profile?.age ?? 'Not specified'}</p>
                  </div>
                </div>

                <div className="pt-5">
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="w-full h-10 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Edit profile
                  </Button>
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
