import React from 'react'
import { useSession } from '../context/SessionContext'
import { useTranslation } from 'react-i18next'

const UserProfile: React.FC = (): React.ReactNode | null => {
  const { user } = useSession()
  const { t } = useTranslation()

  if (!user) return null

  // Get user initials for avatar
  const getInitials = (): string => {
    if (!user.email) return '?'

    // If user has a name, use the first letter of their name
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name
        .split(' ')
        .map((name: string) => name.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 2)
    }

    // Otherwise use the first letter of their email
    return user.email.charAt(0).toUpperCase()
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0">
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt={t('profile.avatar') || 'User avatar'}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
            {getInitials()}
          </div>
        )}
      </div>
      <div className="text-sm">
        <div className="font-medium text-gray-700">
          {user.user_metadata?.full_name || user.email}
        </div>
        {user.user_metadata?.full_name && (
          <div className="text-gray-500 text-xs truncate max-w-[150px]">{user.email}</div>
        )}
      </div>
    </div>
  )
}

export default UserProfile
