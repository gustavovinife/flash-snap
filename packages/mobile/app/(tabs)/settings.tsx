import DateTimePicker, { DateTimePickerAndroid, type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import Constants from 'expo-constants'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, ScrollView, StyleSheet, Switch, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ListRow, Pill, Surface, Text } from '@/components'
import { useAuth } from '@/context/AuthContext'
import { useLayout } from '@/hooks/useLayout'
import { useSubscription } from '@/hooks/useSubscription'
import { LANGUAGES, type LanguageCode, setLanguage } from '@/i18n'
import { confirm, showActions } from '@/lib/actions'
import { openInstallPrompt, useInstallMode } from '@/lib/install'
import { showDialog } from '@/lib/dialogs'
import { getReminderSettings, type ReminderSettings, rescheduleReminder, saveReminderSettings } from '@/lib/reminders'
import { track } from '@/lib/analytics'
import { areSoundEffectsEnabled, setSoundEffectsEnabled } from '@/lib/soundSettings'
import { centered, contentWidth, radius, spacing, useTheme } from '@/theme'

const supportsReminders = Platform.OS !== 'web'
// React Native Web colors the active thumb teal unless told otherwise
const webSwitchProps = Platform.OS === 'web' ? ({ activeThumbColor: '#ffffff' } as object) : {}

function Section({ title, children }: { title: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <View style={styles.section}>
      <Text variant="caption" tone="muted" style={styles.sectionTitle}>
        {title.toUpperCase()}
      </Text>
      <Surface padded={false} style={styles.sectionBody}>
        {children}
      </Surface>
    </View>
  )
}

function timeAsDate(settings: ReminderSettings): Date {
  const date = new Date()
  date.setHours(settings.hour, settings.minute, 0, 0)
  return date
}

export default function SettingsScreen(): React.JSX.Element {
  const { t, i18n } = useTranslation()
  const colors = useTheme()
  const insets = useSafeAreaInsets()
  const { user, signOut } = useAuth()
  const { isPremium, canUpgrade, subscription, openCheckout, openPortal } = useSubscription()
  const [reminder, setReminder] = useState<ReminderSettings | null>(null)
  const [soundEffects, setSoundEffects] = useState(areSoundEffectsEnabled)
  const installMode = useInstallMode()
  const { isDesktop } = useLayout()

  useEffect(() => {
    if (supportsReminders) getReminderSettings().then(setReminder)
  }, [])

  const updateReminder = async (next: ReminderSettings): Promise<void> => {
    setReminder(next)
    const allowed = await saveReminderSettings(next)
    track('reminder_updated', { enabled: next.enabled && allowed, hour: next.hour, permission_denied: next.enabled && !allowed })
    if (!allowed) {
      setReminder({ ...next, enabled: false })
      showDialog(t('settings.reminder'), t('settings.notificationsDenied'))
    }
  }

  const onTimeChange = (event: DateTimePickerEvent, date?: Date): void => {
    if (event.type !== 'set' || !date || !reminder) return
    void updateReminder({ ...reminder, hour: date.getHours(), minute: date.getMinutes() })
  }

  const chooseLanguage = (): void =>
    showActions(
      t('settings.language'),
      LANGUAGES.map((language) => ({
        label: language.label,
        onPress: async () => {
          await setLanguage(language.code as LanguageCode)
          await rescheduleReminder()
        }
      })),
      t('common.cancel')
    )

  const openStripe = (action: () => Promise<void>): void => {
    action().catch((error: Error) => showDialog(t('common.error'), error.message))
  }

  const fullName = typeof user?.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : ''
  const initial = (fullName || user?.email || '?').charAt(0).toUpperCase()
  const languageLabel = LANGUAGES.find((language) => language.code === i18n.language)?.label ?? i18n.language
  const reminderTime = reminder
    ? timeAsDate(reminder).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        centered(contentWidth.narrow),
        { paddingTop: isDesktop ? spacing.xxl : insets.top + spacing.lg }
      ]}
    >
      <Text variant="headline">{t('settings.title')}</Text>

      <Surface style={styles.profile}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text variant="title" tone="inverse">
            {initial}
          </Text>
        </View>
        <View style={styles.flex}>
          {fullName ? <Text variant="label">{fullName}</Text> : null}
          <Text variant="small" tone="muted" numberOfLines={1}>
            {user?.email}
          </Text>
        </View>
        <Pill label={isPremium ? t('settings.premium') : t('settings.free')} tone={isPremium ? 'success' : 'neutral'} />
      </Surface>

      {((!isPremium && canUpgrade) || subscription?.stripe_customer_id) && (
        <Section title={t('settings.plan')}>
          {!isPremium && canUpgrade && (
            <ListRow icon="diamond-outline" title={t('settings.upgrade')} onPress={() => openStripe(() => openCheckout('settings'))} />
          )}
          {!isPremium && canUpgrade && subscription?.stripe_customer_id && (
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
          )}
          {subscription?.stripe_customer_id && (
            <ListRow icon="card-outline" title={t('settings.manage')} onPress={() => openStripe(openPortal)} />
          )}
        </Section>
      )}

      {installMode && (
        <Section title={t('settings.app')}>
          <ListRow icon="phone-portrait-outline" title={t('settings.installApp')} onPress={openInstallPrompt} />
        </Section>
      )}

      <Section title={t('settings.review')}>
        <ListRow
          icon="volume-medium-outline"
          title={t('settings.soundEffects')}
          right={
            <Switch
              value={soundEffects}
              onValueChange={(enabled) => {
                setSoundEffects(enabled)
                void setSoundEffectsEnabled(enabled)
                track('sound_effects_toggled', { enabled })
              }}
              trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor="#ffffff"
                {...webSwitchProps}
            />
          }
        />
      </Section>

      <Section title={t('settings.language')}>
        <ListRow icon="language-outline" title={t('settings.language')} value={languageLabel} onPress={chooseLanguage} />
      </Section>

      {supportsReminders && reminder && (
        <Section title={t('settings.reminder')}>
          <ListRow
            icon="notifications-outline"
            title={t('settings.reminder')}
            right={
              <Switch
                value={reminder.enabled}
                onValueChange={(enabled) => void updateReminder({ ...reminder, enabled })}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor="#ffffff"
                {...webSwitchProps}
              />
            }
          />
          {reminder.enabled && (
            <>
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
              {Platform.OS === 'ios' ? (
                <ListRow
                  icon="time-outline"
                  title={t('settings.reminderTime')}
                  right={<DateTimePicker value={timeAsDate(reminder)} mode="time" display="compact" onChange={onTimeChange} />}
                />
              ) : (
                <ListRow
                  icon="time-outline"
                  title={t('settings.reminderTime')}
                  value={reminderTime}
                  onPress={() =>
                    DateTimePickerAndroid.open({ value: timeAsDate(reminder), mode: 'time', onChange: onTimeChange })
                  }
                />
              )}
            </>
          )}
          <Text variant="small" tone="muted" style={styles.footnote}>
            {t('settings.reminderBody')}
          </Text>
        </Section>
      )}

      <Section title={t('settings.account')}>
        <ListRow
          icon="log-out-outline"
          title={t('settings.signOut')}
          destructive
          onPress={() => confirm(t('settings.signOutTitle'), user?.email ?? '', t('settings.signOut'), t('common.cancel'), signOut)}
        />
      </Section>

      <Text variant="caption" tone="subtle" center>
        {t('settings.version', { version: Constants.expoConfig?.version ?? '1.0.0' })}
      </Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.xl },
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 48, height: 48, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  section: { gap: spacing.sm },
  sectionTitle: { paddingHorizontal: spacing.xs },
  sectionBody: { overflow: 'hidden' },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 60 },
  footnote: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md }
})
