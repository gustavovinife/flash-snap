import { useState, useEffect } from 'react'
import { useSession } from '../context/SessionContext'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePostHog } from 'posthog-js/react'
import LoginForm from '../components/LoginForm'
import SignupForm from '../components/SignupForm'
import LanguageSwitcher from '../components/LanguageSwitcher'
import Logo from '../../../../resources/flashsnap.png'

const LoginPage = (): React.ReactNode => {
  const [isRegistering, setIsRegistering] = useState(false)
  const { session } = useSession()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const posthog = usePostHog()

  useEffect(() => {
    posthog.capture('page_viewed', { page: 'login' })
  }, [])

  const toggleMode = (): void => {
    setIsRegistering(!isRegistering)
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

        {isRegistering ? (
          <SignupForm onToggleMode={toggleMode} />
        ) : (
          <LoginForm onToggleMode={toggleMode} />
        )}
      </div>
    </div>
  )
}

export default LoginPage
