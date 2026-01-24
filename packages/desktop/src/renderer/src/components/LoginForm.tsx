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
  const { signIn } = useSession()
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
    </>
  )
}

export default LoginForm
