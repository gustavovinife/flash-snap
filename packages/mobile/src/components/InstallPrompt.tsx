import { Ionicons } from '@expo/vector-icons'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native'
import {
  getInstallMode,
  type InstallMode,
  onOpenInstallPrompt,
  promptNativeInstall,
  snoozeInstallPrompt,
  wasRecentlyDismissed
} from '@/lib/install'
import { radius, spacing, useTheme } from '@/theme'
import { Button } from './Button'
import { Logo } from './Logo'
import { Text } from './Text'

const SHOW_DELAY_MS = 2500

type IconName = keyof typeof Ionicons.glyphMap

function Step({ index, icon, text }: { index: number; icon: IconName; text: string }): React.JSX.Element {
  const colors = useTheme()
  return (
    <View style={[styles.step, { backgroundColor: colors.surfaceMuted }]}>
      <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
        <Text variant="caption" tone="inverse">
          {index}
        </Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
      <Ionicons name={icon} size={22} color={colors.primary} />
    </View>
  )
}

/** Web-only dialog that helps people add the app to their home screen. */
export function InstallPrompt(): React.JSX.Element | null {
  const { t } = useTranslation()
  const colors = useTheme()
  const [mode, setMode] = useState<InstallMode | null>(null)

  useEffect(() => {
    if (Platform.OS !== 'web') return

    onOpenInstallPrompt(() => setMode(getInstallMode()))
    const timer = setTimeout(() => {
      if (!wasRecentlyDismissed()) setMode(getInstallMode())
    }, SHOW_DELAY_MS)

    return () => {
      clearTimeout(timer)
      onOpenInstallPrompt(null)
    }
  }, [])

  if (!mode) return null

  const close = (): void => {
    snoozeInstallPrompt()
    setMode(null)
  }

  const install = async (): Promise<void> => {
    await promptNativeInstall()
    setMode(null)
  }

  return (
    <Modal transparent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.surface }]} onPress={() => {}}>
          <View style={styles.header}>
            <Logo size={64} />
            <Text variant="title" center>
              {t('install.title')}
            </Text>
            <Text tone="muted" center>
              {t('install.body')}
            </Text>
          </View>

          {mode === 'ios' && (
            <View style={styles.steps}>
              <Step index={1} icon="share-outline" text={t('install.iosStep1')} />
              <Step index={2} icon="add-circle-outline" text={t('install.iosStep2')} />
            </View>
          )}
          {mode === 'android-manual' && (
            <View style={styles.steps}>
              <Step index={1} icon="ellipsis-vertical" text={t('install.androidStep1')} />
              <Step index={2} icon="phone-portrait-outline" text={t('install.androidStep2')} />
            </View>
          )}

          <View style={styles.actions}>
            {mode === 'native-prompt' ? (
              <Button title={t('install.install')} icon="download-outline" onPress={install} />
            ) : (
              <Button title={t('install.gotIt')} onPress={close} />
            )}
            <Button title={t('install.notNow')} variant="ghost" onPress={close} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  sheet: {
    width: '100%',
    maxWidth: 480,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.lg
  },
  header: { alignItems: 'center', gap: spacing.sm },
  steps: { gap: spacing.sm },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepText: { flex: 1 },
  actions: { gap: spacing.xs }
})
