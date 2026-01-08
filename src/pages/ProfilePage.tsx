import { useState, useEffect } from 'react'
import { useAuth } from '../features/auth/useAuth'
import { getMyProfile, upsertMyProfile, updateMyProfile, deleteMyProfile } from '../features/profiles/profiles.api'
import { uploadAvatar, uploadCover, uploadGalleryImage, deleteImage, deleteAllUserFiles } from '../features/profiles/storage.api'
import type { Profile } from '../features/profiles/profiles.types'
import { Button } from '../shared/ui/Button'
import { Input } from '../shared/ui/Input'
import { Textarea } from '../shared/ui/Textarea'
import { ImageUpload } from '../shared/ui/ImageUpload'
import { Avatar } from '../shared/ui/Avatar'
import { calculateAge, validatePhone } from '../lib/utils'

export const ProfilePage = () => {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [signOutError, setSignOutError] = useState('')
  
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [timezone, setTimezone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [gallery, setGallery] = useState<string[]>([])

  useEffect(() => {
    const loadProfile = async (): Promise<void> => {
      if (!user) return

      try {
        const userProfile = await getMyProfile(user.id)
        if (userProfile) {
          setProfile(userProfile)
          setFirstName(userProfile.first_name || '')
          setLastName(userProfile.last_name || '')
          setUsername(userProfile.username || '')
          setDateOfBirth(userProfile.date_of_birth ? userProfile.date_of_birth.split('T')[0] : '')
          setPhone(userProfile.phone || '')
          setBio(userProfile.bio || '')
          setLocation(userProfile.location || '')
          setTimezone(userProfile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone)
          setAvatarUrl(userProfile.avatar_url)
          setCoverUrl(userProfile.cover_url)
          setGallery(userProfile.gallery || [])
        } else if (user.email) {
          const defaultTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
          const newProfile: Profile = {
            user_id: user.id,
            email: user.email,
            first_name: null,
            last_name: null,
            username: null,
            date_of_birth: null,
            phone: null,
            bio: null,
            location: null,
            timezone: defaultTimezone,
            avatar_url: null,
            cover_url: null,
            gallery: null,
          }
          const createdProfile = await upsertMyProfile(newProfile)
          setProfile(createdProfile)
          setTimezone(defaultTimezone)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load profile'
        setError(errorMessage)
        console.error('Profile load error:', err)
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
      if (phone && !validatePhone(phone)) {
        setError('Phone number format is invalid')
        setIsLoading(false)
        return
      }

      if (dateOfBirth) {
        const birthDate = new Date(dateOfBirth)
        if (isNaN(birthDate.getTime())) {
          setError('Invalid date of birth')
          setIsLoading(false)
          return
        }
        const age = calculateAge(dateOfBirth)
        if (age === null || age < 0) {
          setError('Date of birth cannot be in the future')
          setIsLoading(false)
          return
        }
        if (age > 150) {
          setError('Please enter a valid date of birth')
          setIsLoading(false)
          return
        }
      }

      if (username.trim() && username.trim().length < 3) {
        setError('Username must be at least 3 characters long')
        setIsLoading(false)
        return
      }

      const updates: Partial<Profile> = {
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        username: username.trim() || null,
        date_of_birth: dateOfBirth || null,
        phone: phone.trim() || null,
        bio: bio.trim() || null,
        location: location.trim() || null,
        timezone: timezone.trim() || null,
        avatar_url: avatarUrl,
        cover_url: coverUrl,
        gallery: gallery.length > 0 ? gallery : null,
      }

      const updatedProfile = await updateMyProfile(user.id, updates)
      setProfile(updatedProfile)
      setIsEditing(false)
    } catch (err) {
      let errorMessage = 'Failed to save profile'
      
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = String(err.message)
      }
      
      setError(errorMessage)
      console.error('Profile save error:', err)
      
      if (errorMessage.includes('column') || errorMessage.includes('does not exist')) {
        setError('Database schema needs to be updated. Please run the migration SQL in Supabase dashboard.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = (): void => {
    if (profile) {
      setFirstName(profile.first_name || '')
      setLastName(profile.last_name || '')
      setUsername(profile.username || '')
      setDateOfBirth(profile.date_of_birth || '')
      setPhone(profile.phone || '')
      setBio(profile.bio || '')
      setLocation(profile.location || '')
      setTimezone(profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone)
      setAvatarUrl(profile.avatar_url)
      setCoverUrl(profile.cover_url)
      setGallery(profile.gallery || [])
    }
    setIsEditing(false)
    setError('')
  }

  const handleAvatarUpload = async (file: File): Promise<void> => {
    if (!user) return

    try {
      if (avatarUrl) {
        await deleteImage(avatarUrl).catch(() => {})
      }
      const url = await uploadAvatar(user.id, file)
      setAvatarUrl(url)
      await updateMyProfile(user.id, { avatar_url: url })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload avatar'
      if (errorMessage.includes('Bucket not found')) {
        setError('Storage bucket not found. Please create "profiles" bucket in Supabase Dashboard → Storage. See STORAGE_SETUP.md')
      } else {
        setError(errorMessage)
      }
      throw err
    }
  }

  const handleCoverUpload = async (file: File): Promise<void> => {
    if (!user) return

    try {
      if (coverUrl) {
        await deleteImage(coverUrl).catch(() => {})
      }
      const url = await uploadCover(user.id, file)
      setCoverUrl(url)
      await updateMyProfile(user.id, { cover_url: url })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload cover'
      if (errorMessage.includes('Bucket not found')) {
        setError('Storage bucket not found. Please create "profiles" bucket in Supabase Dashboard → Storage. See STORAGE_SETUP.md')
      } else {
        setError(errorMessage)
      }
      throw err
    }
  }

  const handleAvatarRemove = async (): Promise<void> => {
    if (!user) return

    try {
      if (avatarUrl) {
        await deleteImage(avatarUrl)
      }
      setAvatarUrl(null)
      await updateMyProfile(user.id, { avatar_url: null })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove avatar'
      setError(errorMessage)
      throw err
    }
  }

  const handleCoverRemove = async (): Promise<void> => {
    if (!user) return

    try {
      if (coverUrl) {
        await deleteImage(coverUrl)
      }
      setCoverUrl(null)
      await updateMyProfile(user.id, { cover_url: null })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove cover'
      setError(errorMessage)
      throw err
    }
  }

  const handleGalleryUpload = async (file: File): Promise<void> => {
    if (!user) return

    try {
      const url = await uploadGalleryImage(user.id, file)
      const newGallery = [...gallery, url]
      setGallery(newGallery)
      await updateMyProfile(user.id, { gallery: newGallery })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image'
      if (errorMessage.includes('Bucket not found')) {
        setError('Storage bucket not found. Please create "profiles" bucket in Supabase Dashboard → Storage. See STORAGE_SETUP.md')
      } else {
        setError(errorMessage)
      }
      throw err
    }
  }

  const handleRemoveGalleryImage = async (index: number): Promise<void> => {
    if (!user) return

    try {
      const imageUrl = gallery[index]
      await deleteImage(imageUrl)
      const newGallery = gallery.filter((_, i) => i !== index)
      setGallery(newGallery)
      await updateMyProfile(user.id, { gallery: newGallery.length > 0 ? newGallery : null })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove image')
    }
  }

  const handleSignOut = async (): Promise<void> => {
    setSignOutError('')
    try {
      await signOut()
      // If signOut succeeds or session was already missing/invalid, user state will be updated via onAuthStateChange
    } catch (err) {
      // Check if it's a 403 or session-related error - treat as successful sign out
      const error = err as { status?: number; code?: number | string; response?: { status?: number }; message?: string }
      const errorStatus = error?.status || error?.code || error?.response?.status
      const errorMessage = (err instanceof Error ? err.message : 'Failed to sign out').toLowerCase()
      
      if (
        errorStatus === 403 ||
        errorStatus === '403' ||
        errorMessage.includes('forbidden') ||
        (errorMessage.includes('session') && errorMessage.includes('missing'))
      ) {
        // Session already missing/invalid, user is effectively signed out
        // The onAuthStateChange handler will update the state
        return
      }
      
      setSignOutError(err instanceof Error ? err.message : 'Failed to sign out')
      console.error('Sign out error:', err)
    }
  }

  const handleDeleteProfile = async (): Promise<void> => {
    if (!user) return

    // Confirm deletion
    const confirmed = window.confirm(
      'Are you sure you want to delete your profile? This action cannot be undone. All your data, including photos, will be permanently deleted.'
    )

    if (!confirmed) return

    setIsLoading(true)
    setError('')

    try {
      // Delete all user files from storage
      await deleteAllUserFiles(user.id).catch((err) => {
        // Log but don't fail - files might already be deleted
        console.warn('Error deleting user files:', err)
      })

      // Delete profile from database
      await deleteMyProfile(user.id)

      // Sign out user (this will redirect to login page via App.tsx)
      await signOut()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete profile'
      setError(errorMessage)
      console.error('Delete profile error:', err)
      setIsLoading(false)
    }
  }

  const age = profile?.date_of_birth ? calculateAge(profile.date_of_birth) : null

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Please sign in</p>
      </div>
    )
  }

  if (isLoading && !profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-200 text-sm">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 md:py-10">
        <header className="mb-6 flex flex-col gap-4 md:mb-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Account
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-50 md:text-3xl">
              Profile & personal data
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Update your personal information, media and preferences.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              <p className="hidden text-xs text-slate-400 md:block">
                Signed in as <span className="font-medium text-slate-200">{user.email}</span>
              </p>
              <Button
                type="button"
                onClick={handleSignOut}
                disabled={isLoading}
                className="h-9 rounded-full border border-slate-700 bg-slate-800 px-4 text-sm font-semibold text-slate-100 hover:bg-slate-700 disabled:opacity-50"
              >
                Sign out
              </Button>
            </div>
            {signOutError && (
              <p className="text-xs text-red-400 max-w-xs text-right">{signOutError}</p>
            )}
          </div>
        </header>

        <main className="grid flex-1 gap-6 md:grid-cols-[320px,minmax(0,1fr)] lg:gap-8">
          {/* Left column: summary + media preview */}
          <section className="space-y-6">
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg shadow-slate-950/40">
              <div className="relative h-32 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
                {coverUrl && (
                  <img
                    src={coverUrl}
                    alt="Cover"
                    className="h-full w-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/10 to-transparent" />
              </div>
              <div className="px-5 pb-5 pt-4">
                <div className="-mt-12 flex items-end gap-4">
                  <Avatar src={avatarUrl} size="xl" />
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-slate-50">
                      {[firstName, lastName].filter(Boolean).join(' ') || 'Unnamed user'}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {username ? `@${username}` : 'Username not set'}
                    </p>
                  </div>
                </div>

                <dl className="mt-5 grid grid-cols-1 gap-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-xs uppercase tracking-wide text-slate-500">
                      Email
                    </dt>
                    <dd className="truncate text-right">{user.email}</dd>
                  </div>
                  {location && (
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-xs uppercase tracking-wide text-slate-500">
                        Location
                      </dt>
                      <dd className="truncate text-right">{location}</dd>
                    </div>
                  )}
                  {timezone && (
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-xs uppercase tracking-wide text-slate-500">
                        Timezone
                      </dt>
                      <dd className="truncate text-right">{timezone}</dd>
                    </div>
                  )}
                  {age !== null && (
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-xs uppercase tracking-wide text-slate-500">
                        Age
                      </dt>
                      <dd className="truncate text-right">{age}</dd>
                    </div>
                  )}
                </dl>

                {profile?.gallery && profile.gallery.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Gallery
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {profile.gallery.slice(0, 4).map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Gallery ${index + 1}`}
                          className="h-14 w-20 rounded-lg border border-slate-800 object-cover"
                        />
                      ))}
                    </div>
                    {profile.gallery.length > 4 && (
                      <p className="mt-1 text-xs text-slate-500">
                        +{profile.gallery.length - 4} more photo
                        {profile.gallery.length - 4 > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {!isEditing && error && (
              <div className="rounded-2xl border border-amber-500/40 bg-amber-950/40 p-4 text-xs text-amber-100">
                <p className="mb-1 font-semibold">Database update required</p>
                <p className="mb-1">
                  The database schema may be outdated. Run the latest migrations in Supabase if
                  this error persists.
                </p>
                <p className="text-amber-300">
                  See <code className="rounded bg-amber-900/60 px-1">MIGRATION_INSTRUCTIONS.md</code>{' '}
                  for details.
                </p>
              </div>
            )}
          </section>

          {/* Right column: details & editing */}
          <section className="flex flex-col">
            <div className="flex items-center justify-between gap-3 pb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                Profile details
              </h2>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <>
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="h-9 rounded-full bg-indigo-600 px-4 text-xs font-semibold text-white hover:bg-indigo-500"
                    >
                      Edit profile
                    </Button>
                    <Button
                      type="button"
                      onClick={handleDeleteProfile}
                      disabled={isLoading}
                      className="h-9 rounded-full border border-red-500/60 bg-red-600/20 px-4 text-xs font-semibold text-red-200 hover:bg-red-600/40 disabled:opacity-50"
                    >
                      {isLoading ? 'Deleting…' : 'Delete Profile'}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mt-4 flex-1 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/40 md:p-6">
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                        First name
                      </label>
                      <Input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        className="h-9 bg-slate-950/60 text-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                        Last name
                      </label>
                      <Input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                        className="h-9 bg-slate-950/60 text-slate-50"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                        Username
                      </label>
                      <Input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="username"
                        className="h-9 bg-slate-950/60 text-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                        Date of birth
                      </label>
                      <Input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="h-9 bg-slate-950/60 text-slate-50"
                        max={new Date().toISOString().split('T')[0]}
                      />
                      {dateOfBirth && age !== null && (
                        <p className="mt-1 text-xs text-slate-400">Age: {age} years</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                        Phone
                      </label>
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1234567890"
                        className="h-9 bg-slate-950/60 text-slate-50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                        Timezone
                      </label>
                      <Input
                        type="text"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        placeholder="Europe/Kyiv"
                        className="h-9 bg-slate-950/60 text-slate-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                      Location
                    </label>
                    <Input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, Country"
                      className="h-9 bg-slate-950/60 text-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1.5">
                      Bio
                    </label>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself"
                      rows={4}
                      className="bg-slate-950/60 text-sm text-slate-50"
                    />
                  </div>

                  <div className="border-t border-slate-800 pt-4">
                    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Media
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <ImageUpload
                        label="Avatar"
                        currentUrl={avatarUrl}
                        onUpload={handleAvatarUpload}
                        onRemove={handleAvatarRemove}
                        maxSizeMB={5}
                        aspectRatio="square"
                        className="text-slate-50 max-w-[140px]"
                      />
                      <ImageUpload
                        label="Cover image"
                        currentUrl={coverUrl}
                        onUpload={handleCoverUpload}
                        onRemove={handleCoverRemove}
                        maxSizeMB={10}
                        aspectRatio="wide"
                        className="text-slate-50 max-w-[220px]"
                      />
                    </div>
                    <div className="mt-4">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Gallery
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {gallery.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Gallery ${index + 1}`}
                              className="h-16 w-24 rounded-lg border border-slate-800 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImage(index)}
                              className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                            >
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        {gallery.length < 9 && (
                          <button
                            type="button"
                            className="flex h-16 w-24 items-center justify-center rounded-lg border-2 border-dashed border-slate-700 bg-slate-950/40 text-slate-400 hover:border-indigo-500 hover:text-indigo-400"
                            onClick={() => {
                              const input = document.createElement('input')
                              input.type = 'file'
                              input.accept = 'image/jpeg,image/png,image/webp'
                              input.onchange = async (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0]
                                if (file) {
                                  try {
                                    await handleGalleryUpload(file)
                                  } catch (err) {
                                    setError(err instanceof Error ? err.message : 'Failed to upload image')
                                  }
                                }
                              }
                              input.click()
                            }}
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">Add up to 9 images</p>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-lg border border-red-500/60 bg-red-950/40 p-3 text-xs text-red-100">
                      <p className="mb-1 font-semibold">Error</p>
                      <p>{error}</p>
                    </div>
                  )}

                  <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
                    <Button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="h-9 flex-1 rounded-full bg-emerald-500 px-4 text-xs font-semibold text-emerald-950 hover:bg-emerald-400 sm:flex-none"
                    >
                      {isLoading ? 'Saving…' : 'Save changes'}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancel}
                      className="h-9 flex-1 rounded-full bg-slate-800 px-4 text-xs font-semibold text-slate-100 hover:bg-slate-700 sm:flex-none"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}
