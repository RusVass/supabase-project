import { useAuth } from '../features/auth/useAuth'
import { LoginPage } from '../pages/LoginPage'
import { ProfilePage } from '../pages/ProfilePage'

export const App = (): React.ReactElement => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div style={{ padding: 24 }}>Loading...</div>
  }

  if (!user) {
    return <LoginPage />
  }

  return <ProfilePage />
}
