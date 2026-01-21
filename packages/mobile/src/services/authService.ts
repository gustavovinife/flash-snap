/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { supabase } from './supabaseService'
import { User, Session } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  created_at: string
}

export interface AuthResponse {
  user: AuthUser | null
  error: string | null
}

export interface AuthSession {
  user: AuthUser | null
  session: Session | null
}

class AuthService {
  async signUp(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { user: null, error: error.message }
      }

      if (data.user) {
        return {
          user: {
            id: data.user.id,
            email: data.user.email!,
            created_at: data.user.created_at,
          },
          error: null,
        }
      }

      return { user: null, error: 'Failed to create user' }
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred' }
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { user: null, error: error.message }
      }

      if (data.user) {
        return {
          user: {
            id: data.user.id,
            email: data.user.email!,
            created_at: data.user.created_at,
          },
          error: null,
        }
      }

      return { user: null, error: 'Failed to sign in' }
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred' }
    }
  }

  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      return { error: error?.message || null }
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser()
      
      if (user) {
        return {
          id: user.id,
          email: user.email!,
          created_at: user.created_at,
        }
      }

      return null
    } catch (error) {
      return null
    }
  }

  async getSession(): Promise<AuthSession> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        return {
          user: {
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at,
          },
          session,
        }
      }

      return { user: null, session: null }
    } catch (error) {
      return { user: null, session: null }
    }
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email!,
          created_at: session.user.created_at,
        })
      } else {
        callback(null)
      }
    })
  }
}

export const authService = new AuthService()
export default authService