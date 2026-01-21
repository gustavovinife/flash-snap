import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { useTranslation } from 'react-i18next'
import Input from '../ui/common/Input/Input'
import Button from '../ui/common/Button/Button'

interface LoginFormProps {
  onToggleMode: () => void
}

const LoginForm = ({ onToggleMode }: LoginFormProps): React.ReactNode => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, signInWithGoogle } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  const validateForm = (): boolean => {
    if (!email || !password) {
      setError(t('auth.emailRequired'))
      return false
    }
    return true
  }

  const handleSignIn = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
      } else {
        // Redirect to home or intended page after successful login
        const from = location.state?.from?.pathname || '/'
        navigate(from, { replace: true })
      }
    } catch (err) {
      setError(t('auth.unexpectedError'))
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async (): Promise<void> => {
    setError(null)
    setIsLoading(true)
    console.log('Initiating Google sign-in from LoginForm')

    try {
      const { error } = await signInWithGoogle()
      if (error) {
        console.error('Google sign-in error:', error)
        setError(error.message)
      }
    } catch (err) {
      console.error('Unexpected error during Google sign-in:', err)
      setError(t('auth.unexpectedError'))
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {error && <div className="p-3 text-sm text-red-800 bg-red-100 rounded-md">{error}</div>}

      <form className="mt-6 space-y-6" onSubmit={handleSignIn}>
        <Input
          label={t('auth.email')}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          label={t('auth.password')}
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? t('auth.signingIn') : t('auth.signIn')}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button onClick={onToggleMode} className="text-sm text-indigo-600 hover:text-indigo-500">
          {t('auth.dontHaveAccount')}
        </button>
      </div>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-gray-500 bg-white">{t('auth.orContinueWith')}</span>
          </div>
        </div>

        <div className="mt-6">
          <Button
            type="button"
            variant="outline"
            size="md"
            fullWidth
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            leftIcon={
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.787-1.676-4.139-2.701-6.735-2.701-5.522 0-10.033 4.511-10.033 10.032s4.511 10.032 10.033 10.032c8.967 0 10.956-7.752 10.001-11.748l-9.001 0.017z"
                  fill="currentColor"
                />
              </svg>
            }
          >
            {t('auth.google')}
          </Button>
        </div>
      </div>
    </>
  )
}

export default LoginForm
