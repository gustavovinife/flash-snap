import { useState } from 'react'
import { useSession } from '../context/SessionContext'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LoginForm from '../components/LoginForm'
import SignupForm from '../components/SignupForm'
import LanguageSwitcher from '../components/LanguageSwitcher'
import Logo from '../../../../resources/flashsnap.png'

const LoginPage = (): React.ReactNode => {
  const [isRegistering, setIsRegistering] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const { session } = useSession()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const toggleMode = (): void => {
    setIsRegistering(!isRegistering)
    setMessage(null)
  }

  const handleSignupSuccess = (successMessage: string): void => {
    setMessage(successMessage)
  }

  if (session) {
    navigate('/')
    return <></>
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-between items-center">
          <img src={Logo} alt="Logo" width={120} />
          <LanguageSwitcher />
        </div>

        <div className="text-center">
          <p className="text-gray-600">
            {isRegistering ? t('auth.registerTitle') : t('auth.loginTitle')}
          </p>
        </div>

        {message && (
          <div className="p-3 text-sm text-green-800 bg-green-100 rounded-md">{message}</div>
        )}

        {isRegistering ? (
          <SignupForm onToggleMode={toggleMode} onSignupSuccess={handleSignupSuccess} />
        ) : (
          <LoginForm onToggleMode={toggleMode} />
        )}
      </div>
    </div>
  )
}

export default LoginPage
