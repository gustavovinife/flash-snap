import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import i18n from '@/i18n'

const SETTINGS_KEY = 'flashSnap.reminder'
const CHANNEL_ID = 'daily-review'

export interface ReminderSettings {
  enabled: boolean
  hour: number
  minute: number
}

const DEFAULT_SETTINGS: ReminderSettings = { enabled: false, hour: 9, minute: 0 }

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
})

export async function getReminderSettings(): Promise<ReminderSettings> {
  const saved = await AsyncStorage.getItem(SETTINGS_KEY)
  return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS
}

async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync()
  if (current.granted) return true
  if (!current.canAskAgain) return false
  return (await Notifications.requestPermissionsAsync()).granted
}

// Returns false when the user has denied notification permission
export async function saveReminderSettings(settings: ReminderSettings): Promise<boolean> {
  await Notifications.cancelAllScheduledNotificationsAsync()

  if (settings.enabled) {
    if (!(await ensurePermission())) {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...settings, enabled: false }))
      return false
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Daily review',
        importance: Notifications.AndroidImportance.DEFAULT
      })
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: i18n.t('notifications.title'),
        body: i18n.t('notifications.body')
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: settings.hour,
        minute: settings.minute,
        channelId: CHANNEL_ID
      }
    })
  }

  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  return true
}

// Notification text is fixed at scheduling time, so reschedule after a language change
export async function rescheduleReminder(): Promise<void> {
  const settings = await getReminderSettings()
  if (settings.enabled) await saveReminderSettings(settings)
}
