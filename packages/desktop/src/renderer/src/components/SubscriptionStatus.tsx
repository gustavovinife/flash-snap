import React from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@renderer/ui/common'
import type { Subscription } from '@renderer/types'

interface SubscriptionStatusProps {
  subscription: Subscription | null
  isLoading?: boolean
  onUpgrade: () => void
  onManage: () => void
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  subscription,
  isLoading = false,
  onUpgrade,
  onManage
}) => {
  const { t } = useTranslation()

  // Format date for display
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Determine if user is on premium plan
  const isPremium = subscription?.status === 'active'
  const isCanceling = subscription?.cancel_at_period_end === true && isPremium

  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      {/* Status display */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">{t('subscription.currentPlan')}</h3>
          <div className="flex items-center mt-1">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                isPremium ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {isPremium ? 'Premium' : 'Free'}
            </span>
          </div>
        </div>
      </div>

      {/* Renewal date for active subscriptions */}
      {isPremium && subscription?.current_period_end && !isCanceling && (
        <p className="text-sm text-gray-600">
          {t('subscription.renewsOn', { date: formatDate(subscription.current_period_end) })}
        </p>
      )}

      {/* Cancellation notice */}
      {isCanceling && subscription?.current_period_end && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p className="text-sm text-yellow-800">
            {t('subscription.cancelNotice', { date: formatDate(subscription.current_period_end) })}
          </p>
        </div>
      )}

      {/* Past due notice */}
      {subscription?.status === 'past_due' && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-800">{t('subscription.pastDueNotice')}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="pt-2">
        {isPremium || subscription?.status === 'past_due' ? (
          <Button variant="outline" size="md" onClick={onManage}>
            {t('subscription.manageSubscription')}
          </Button>
        ) : (
          <Button variant="primary" size="md" onClick={onUpgrade}>
            {t('subscription.upgrade')}
          </Button>
        )}
      </div>
    </div>
  )
}

export default SubscriptionStatus
