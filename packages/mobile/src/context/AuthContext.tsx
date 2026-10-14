import type { Session, User } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

WebBrowser.maybeCompleteAuthSession()

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

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function paramsFromUrl(url: string): URLSearchParams {
  const [, fragment = ''] = url.split('#')
  const [, query = ''] = url.split('#')[0].split('?')
  return new URLSearchParams(fragment || query)
}

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const userIdRef = useRef<string | null>(null)

  useEffect(() => {
    const applySession = (next: Session | null): void => {
      const nextUserId = next?.user.id ?? null
      if (userIdRef.current !== nextUserId) {
        queryClient.clear()
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
        return { error: error?.message ?? null }
      },

      signUp: async (email, password, fullName) => {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: fullName ? { data: { full_name: fullName.trim() } } : undefined
        })
        return { error: error?.message ?? null, needsConfirmation: !error && !data.session }
      },

      signInWithGoogle: async () => {
        const redirectTo = Linking.createURL('auth-callback')
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo, skipBrowserRedirect: true }
        })
        if (error || !data.url) return { error: error?.message ?? 'No sign-in URL returned' }

        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
        if (result.type !== 'success') return { error: null }

        const params = paramsFromUrl(result.url)
        const code = params.get('code')
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          return { error: exchangeError?.message ?? null }
        }

        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        if (!accessToken || !refreshToken) {
          return { error: params.get('error_description') ?? 'Google sign-in failed' }
        }

        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })
        return { error: sessionError?.message ?? null }
      },

      signOut: async () => {
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
