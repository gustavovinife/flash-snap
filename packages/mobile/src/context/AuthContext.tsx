import type { Session, User } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Platform } from 'react-native'
import { identifyUser, resetAnalytics, track } from '@/lib/analytics'
import { supabase } from '@/lib/supabase'

interface AuthResult {
  error: string | null
}

interface SignUpResult extends AuthResult {
  needsConfirmation: boolean
}

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string, fullName?: string) => Promise<SignUpResult>
  signInWithGoogle: () => Promise<AuthResult>
  signOut: () => Promise<void>
}

// Survives the redirect to Google and back on the web, so the sign-in can be attributed
const OAUTH_PENDING_KEY = 'flashSnap.oauthPending'

function trackGoogleSignIn(user: User): void {
  // A first sign-in happens within moments of the account being created
  const created = Date.parse(user.created_at)
  const lastSignIn = Date.parse(user.last_sign_in_at ?? user.created_at)
  track(Math.abs(lastSignIn - created) < 60_000 ? 'user_signed_up' : 'user_signed_in', { method: 'google' })
}

/** Reads the tokens Supabase appends to the redirect URL (in the fragment) */
function sessionFromRedirect(url: string): { access_token: string; refresh_token: string } | { error: string } {
  const params = new URLSearchParams(url.split('#')[1] ?? url.split('?')[1] ?? '')
  const error = params.get('error_description')
  if (error) return { error }
  const access_token = params.get('access_token')
  const refresh_token = params.get('refresh_token')
  return access_token && refresh_token ? { access_token, refresh_token } : { error: 'Google sign-in failed. Please try again.' }
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const userIdRef = useRef<string | null>(null)
  const pendingOAuth = useRef(false)

  useEffect(() => {
    const applySession = (next: Session | null): void => {
      const nextUserId = next?.user.id ?? null
      if (userIdRef.current !== nextUserId) {
        queryClient.clear()
        if (next) {
          identifyUser(next.user)
          const webPending = Platform.OS === 'web' && window.sessionStorage.getItem(OAUTH_PENDING_KEY)
          if (pendingOAuth.current || webPending) trackGoogleSignIn(next.user)
        } else if (userIdRef.current) resetAnalytics()
        pendingOAuth.current = false
        if (Platform.OS === 'web') window.sessionStorage.removeItem(OAUTH_PENDING_KEY)
        userIdRef.current = nextUserId
      }
      setSession(next)
      setLoading(false)
    }

    supabase.auth.getSession().then(({ data }) => applySession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, next) => applySession(next))

    return () => data.subscription.unsubscribe()
  }, [queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,

      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (!error) track('user_signed_in', { method: 'email' })
        return { error: error?.message ?? null }
      },

      signUp: async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: fullName ? { data: { full_name: fullName.trim() } } : undefined
        })
        const needsConfirmation = !error && !data.session
        if (!error) track('user_signed_up', { method: 'email', needs_confirmation: needsConfirmation })
        return { error: error?.message ?? null, needsConfirmation }
      },

      signInWithGoogle: async () => {
        if (Platform.OS === 'web') {
          window.sessionStorage.setItem(OAUTH_PENDING_KEY, 'google')
          // Back to the app's root (/app/ in production), where the session is read from the URL
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: new URL('.', window.location.href).href }
          })
          return { error: error?.message ?? null }
        }

        const redirectTo = Linking.createURL('auth-callback')
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo, skipBrowserRedirect: true }
        })
        if (error || !data.url) return { error: error?.message ?? 'Google sign-in is unavailable right now.' }

        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
        if (result.type !== 'success') return { error: null }
        const session = sessionFromRedirect(result.url)
        if ('error' in session) return { error: session.error }
        pendingOAuth.current = true
        const { error: sessionError } = await supabase.auth.setSession(session)
        return { error: sessionError?.message ?? null }
      },

      signOut: async () => {
        track('user_signed_out')
        await supabase.auth.signOut()
      }
    }),
    [session, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
