import type { Session, User } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react'
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
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

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
        if (next) identifyUser(next.user)
        else if (userIdRef.current) resetAnalytics()
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
