import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSession } from '../context/SessionContext'
import { useTranslation } from 'react-i18next'
import { usePostHog } from 'posthog-js/react'
import Input from '../ui/common/Input/Input'
import Button from '../ui/common/Button/Button'

interface SignupFormProps {
  onToggleMode: () => void
}

const SignupForm = ({ onToggleMode }: SignupFormProps): React.ReactNode => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useSession()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const posthog = usePostHog()

  const validateForm = (): boolean => {
    if (!email || !password || !confirmPassword || !fullName) {
      setError(t('auth.allFieldsRequired'))
      return false
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordsDoNotMatch'))
      return false
    }

    if (password.length < 6) {
      setError(t('auth.passwordMinLength'))
      return false
    }

    return true
  }

  const handleSignUp = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const { error, data } = await signUp(email, password, fullName)
      if (error) {
        setError(error.message)
      } else {
        // Check if email is already registered
        if (data?.user?.identities?.length === 0) {
          setError(t('auth.emailAlreadyRegistered'))
        } else {
          // Track successful signup
          posthog.capture('user_signed_up', {
            email: email,
            full_name: fullName
          })
          // Redirect to verify email page
          navigate('/verify-email')
        }
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

      <form className="mt-6 space-y-4" onSubmit={handleSignUp}>
        <Input
          label={t('auth.fullName')}
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="John Doe"
        />

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
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Input
          label={t('auth.confirmPassword')}
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? t('auth.creatingAccount') : t('auth.createAccount')}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button onClick={onToggleMode} className="text-sm text-indigo-600 hover:text-indigo-500">
          {t('auth.alreadyHaveAccount')}
        </button>
      </div>
    </>
  )
}

export default SignupForm
