/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import supabase from '../services/supabaseService'
import { Session, User, AuthError } from '@supabase/supabase-js'

// Import electron API from window
declare global {
  interface Window {
    electron: {
      ipcRenderer: any
      openExternal: (url: string) => void
      showApp: () => void
    }
    api: {
      onAuthCallback: (callback: (url: string) => void) => void
    }
  }
}

interface SignInResponse {
  error: AuthError | null
}

interface SignUpResponse {
  error: AuthError | null
  data: {
    user: User | null
  } | null
}

interface SessionContextProps {
  session: Session | null
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<SignInResponse>
  signUp: (email: string, password: string, fullName?: string) => Promise<SignUpResponse>
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
}

const SessionContext = createContext<SessionContextProps | undefined>(undefined)

export const SessionProvider = ({ children }: { children: ReactNode }): React.ReactNode => {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Setup auth callback handler
    if (window.api?.onAuthCallback) {
      window.api.onAuthCallback(async (url) => {
        try {
          // Extract hash or query params from the URL
          const hashOrQuery = url.includes('#') ? url.split('#')[1] : url.split('?')[1]

          if (!hashOrQuery) return

          // Handle the auth redirect
          const { data, error } = await supabase.auth.setSession({
            access_token: extractParam(hashOrQuery, 'access_token'),
            refresh_token: extractParam(hashOrQuery, 'refresh_token')
          })

          if (!error && data.session) {
            setSession(data.session)
            setUser(data.session.user)
          }
        } catch (err) {
          // Authentication error handling is silent to the user
          console.error('Authentication error:', err)
        }
      })
    }

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Helper function to extract params from hash or query string
  const extractParam = (str: string, param: string): string => {
    const match = new RegExp(`${param}=([^&]*)`).exec(str)
    return match ? match[1] : ''
  }

  const signIn = async (email: string, password: string): Promise<SignInResponse> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (
    email: string,
    password: string,
    fullName?: string
  ): Promise<SignUpResponse> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: fullName ? { full_name: fullName } : undefined
      }
    })
    return { data, error }
  }

  const signInWithGoogle = async (): Promise<{ error: AuthError | null }> => {
    try {
      // Get the authorization URL from Supabase but don't redirect automatically
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'flash-snap://auth-callback',
          skipBrowserRedirect: true // Don't redirect automatically
        }
      })

      if (error) return { error }

      if (data?.url) {
        // Open the URL in the system's default browser
        if (window.electron?.openExternal) {
          window.electron.openExternal(data.url)
          // Let the browser take focus, no need to show app immediately
        } else {
          // Fallback to normal window open if not in Electron
          window.open(data.url, '_blank')
        }
      } else {
        return { error: new Error('No URL returned from OAuth provider') as unknown as AuthError }
      }

      return { error: null }
    } catch (err) {
      return { error: err as AuthError }
    }
  }

  const signOut = async (): Promise<{ error: AuthError | null }> => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return (
    <SessionContext.Provider
      value={{
        session,
        user,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut
      }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = (): SessionContextProps => {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}
