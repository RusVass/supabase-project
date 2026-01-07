import React from 'react'
import ReactDOM from 'react-dom/client'
import '../index.css'
import { App } from './App'
import { supabase } from '../lib/supabase'

// Handle OAuth callback for mobile devices
const handleOAuthCallback = async () => {
  // Check if this is an OAuth callback by looking for tokens or error in URL
  const hash = window.location.hash.substring(1)
  const search = window.location.search.substring(1)
  
  const hasHashParams = hash.includes('access_token') || hash.includes('error')
  const hasQueryParams = search.includes('access_token') || search.includes('error')
  
  // Only process if this looks like an OAuth callback
  if (!hasHashParams && !hasQueryParams) {
    return
  }

  try {
    // Supabase automatically handles OAuth callbacks via getSession()
    // But we need to explicitly check for hash/query params on mobile
    const hashParams = hash ? new URLSearchParams(hash) : null
    const queryParams = search ? new URLSearchParams(search) : null
    
    const accessToken = hashParams?.get('access_token') || queryParams?.get('access_token')
    const refreshToken = hashParams?.get('refresh_token') || queryParams?.get('refresh_token')
    const error = hashParams?.get('error') || queryParams?.get('error')
    const errorDescription = hashParams?.get('error_description') || queryParams?.get('error_description')

    if (error) {
      console.error('OAuth error:', error, errorDescription)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
      return
    }

    if (accessToken && refreshToken) {
      // Set the session with the tokens from the URL
      const { error: sessionError, data } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (sessionError) {
        console.error('Error setting session:', sessionError)
      } else if (data.session) {
        // Successfully authenticated
        console.log('OAuth authentication successful')
      }
      
      // Clean up URL after processing (whether success or error)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  } catch (err) {
    console.error('Error handling OAuth callback:', err)
    // Clean up URL on error
    window.history.replaceState({}, document.title, window.location.pathname)
  }
}

// Handle OAuth callback on mount
handleOAuthCallback()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
