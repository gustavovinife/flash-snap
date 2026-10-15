import { Ionicons } from '@expo/vector-icons'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  type TextInput,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, EmptyState, Logo, Surface, Text, TextField } from '@/components'
import { useLayout } from '@/hooks/useLayout'
import { useAuth } from '@/context/AuthContext'
import { radius, spacing, useTheme } from '@/theme'

type Mode = 'signIn' | 'signUp'

const FEATURES: { icon: keyof typeof Ionicons.glyphMap; key: string }[] = [
  { icon: 'repeat', key: 'featureReview' },
  { icon: 'sparkles', key: 'featureAI' },
  { icon: 'phone-portrait-outline', key: 'featureDevices' }
]

export default function SignInScreen(): React.JSX.Element {
  const { t } = useTranslation()
  const colors = useTheme()
  const { signIn, signUp } = useAuth()
  const { isDesktop } = useLayout()

  const [mode, setMode] = useState<Mode>('signIn')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false)
  const passwordRef = useRef<TextInput>(null)

  const isSignUp = mode === 'signUp'

  const submit = async (): Promise<void> => {
    if (!email.trim() || !password) {
      setError(t('auth.missingFields'))
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      if (isSignUp) {
        const result = await signUp(email, password, name)
        if (result.error) setError(result.error)
        else if (result.needsConfirmation) setAwaitingConfirmation(true)
      } else {
        const result = await signIn(email, password)
        if (result.error) setError(result.error)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const switchMode = (): void => {
    setMode(isSignUp ? 'signIn' : 'signUp')
    setError(null)
  }

  const card = (
    <Surface style={[styles.card, isDesktop && styles.cardDesktop]}>
      {awaitingConfirmation ? (
        <EmptyState icon="mail-unread-outline" title={t('auth.checkEmailTitle')} body={t('auth.checkEmailBody')}>
          <Button
            title={t('auth.signIn')}
            onPress={() => {
              setAwaitingConfirmation(false)
              setMode('signIn')
            }}
          />
        </EmptyState>
      ) : (
        <View style={styles.form}>
          <Text variant="title">{isSignUp ? t('auth.signUp') : t('auth.signIn')}</Text>

          {isSignUp && (
            <TextField
              label={t('auth.name')}
              value={name}
              onChangeText={setName}
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
            />
          )}
          <TextField
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <TextField
            ref={passwordRef}
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            textContentType={isSignUp ? 'newPassword' : 'password'}
            returnKeyType="go"
            onSubmitEditing={submit}
          />

          {error && (
            <View style={[styles.error, { backgroundColor: colors.dangerSoft }]}>
              <Text variant="small" tone="danger">
                {error}
              </Text>
            </View>
          )}

          <Button
            title={isSignUp ? t('auth.signUp') : t('auth.signIn')}
            onPress={submit}
            loading={submitting}
          />

          <Pressable onPress={switchMode} style={styles.switch} hitSlop={8}>
            <Text variant="small" tone="muted" center>
              {isSignUp ? t('auth.haveAccount') : t('auth.noAccount')}{' '}
              <Text variant="small" tone="primary" weight="700">
                {isSignUp ? t('auth.signIn') : t('auth.signUp')}
              </Text>
            </Text>
          </Pressable>
        </View>
      )}
    </Surface>
  )

  if (isDesktop) {
    return (
      <View style={[styles.split, { backgroundColor: colors.background }]}>
        <View style={[styles.brandPanel, { backgroundColor: colors.primary }]}>
          <View style={styles.brandContent}>
            <Logo size={72} />
            <Text variant="display" tone="inverse">
              Flash Snap
            </Text>
            <Text variant="title" tone="inverse" style={styles.brandTagline}>
              {t('auth.tagline')}
            </Text>
            <View style={styles.features}>
              {FEATURES.map(({ icon, key }) => (
                <View key={key} style={styles.feature}>
                  <View style={styles.featureIcon}>
                    <Ionicons name={icon} size={18} color={colors.primary} />
                  </View>
                  <Text tone="inverse">{t(`auth.${key}`)}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <ScrollView style={styles.flex} contentContainerStyle={styles.formColumn} keyboardShouldPersistTaps="handled">
          {card}
        </ScrollView>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={[styles.hero, { backgroundColor: colors.primary }]}>
            <SafeAreaView edges={['top']} style={styles.heroContent}>
              <View style={styles.logo}>
                <Logo size={72} />
              </View>
              <Text variant="headline" tone="inverse">
                Flash Snap
              </Text>
              <Text tone="inverse" center style={styles.tagline}>
                {t('auth.tagline')}
              </Text>
            </SafeAreaView>
          </View>

          <View style={styles.cardWrap}>{card}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  hero: {
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    paddingBottom: spacing.xl
  },
  heroContent: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl
  },
  logo: { marginBottom: spacing.sm },
  tagline: { opacity: 0.9, maxWidth: 300 },
  scroll: { flexGrow: 1, paddingBottom: spacing.xl },
  cardWrap: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  card: { padding: spacing.xl, width: '100%', maxWidth: 520, alignSelf: 'center' },
  form: { gap: spacing.lg },
  error: { borderRadius: radius.sm, padding: spacing.md },
  switch: { paddingVertical: spacing.sm },
  split: { flex: 1, flexDirection: 'row' },
  brandPanel: { flex: 1, justifyContent: 'center', padding: spacing.xxl * 2 },
  brandContent: { maxWidth: 460, gap: spacing.lg },
  brandTagline: { opacity: 0.9, fontWeight: '500' },
  features: { gap: spacing.md, marginTop: spacing.lg },
  feature: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  formColumn: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xxl },
  cardDesktop: { width: '100%', maxWidth: 440, marginTop: 0, marginHorizontal: 0 }
})
