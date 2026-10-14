import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import { useDecks } from './useDecks'
import { useSubscription } from './useSubscription'

// Runs the action when the user may create another deck, otherwise offers the upgrade
export function useDeckLimit(): (action: () => void) => void {
  const { t } = useTranslation()
  const { data: decks = [] } = useDecks()
  const { canCreateDeck, canUpgrade, openCheckout } = useSubscription()

  return (action) => {
    if (canCreateDeck(decks.length)) {
      action()
      return
    }

    Alert.alert(t('premium.limitTitle'), t('premium.limitBody'), [
      { text: t('premium.notNow'), style: 'cancel' },
      ...(canUpgrade
        ? [{ text: t('premium.upgrade'), onPress: () => void openCheckout().catch(() => {}) }]
        : [])
    ])
  }
}
