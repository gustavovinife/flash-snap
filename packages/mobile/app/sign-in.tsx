import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  type TextInput,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, EmptyState, Surface, Text, TextField } from '@/components'
import { useAuth } from '@/context/AuthContext'
import { radius, spacing, useTheme } from '@/theme'

type Mode = 'signIn' | 'signUp'

export default function SignInScreen(): React.JSX.Element {
  const { t } = useTranslation()
  const colors = useTheme()
  const { signIn, signUp, signInWithGoogle } = useAuth()

  const [mode, setMode] = useState<Mode>('signIn')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
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

  const continueWithGoogle = async (): Promise<void> => {
    setError(null)
    setGoogleLoading(true)
    try {
      const result = await signInWithGoogle()
      if (result.error) setError(result.error)
    } finally {
      setGoogleLoading(false)
    }
  }

  const switchMode = (): void => {
    setMode(isSignUp ? 'signIn' : 'signUp')
    setError(null)
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
              <Image source={require('../assets/flashsnapicon.png')} style={styles.logo} />
              <Text variant="headline" tone="inverse">
                Flash Snap
              </Text>
              <Text tone="inverse" center style={styles.tagline}>
                {t('auth.tagline')}
              </Text>
            </SafeAreaView>
          </View>

          <Surface style={styles.card}>
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

                <View style={styles.divider}>
                  <View style={[styles.line, { backgroundColor: colors.border }]} />
                  <Text variant="small" tone="subtle">
                    {t('auth.or')}
                  </Text>
                  <View style={[styles.line, { backgroundColor: colors.border }]} />
                </View>

                <Button
                  title={t('auth.continueWithGoogle')}
                  icon="logo-google"
                  variant="secondary"
                  onPress={continueWithGoogle}
                  loading={googleLoading}
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
  logo: { width: 72, height: 72, borderRadius: radius.lg, marginBottom: spacing.sm },
  tagline: { opacity: 0.9, maxWidth: 300 },
  scroll: { flexGrow: 1, paddingBottom: spacing.xl },
  card: { marginTop: spacing.lg, marginHorizontal: spacing.lg, padding: spacing.xl },
  form: { gap: spacing.lg },
  error: { borderRadius: radius.sm, padding: spacing.md },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  switch: { paddingVertical: spacing.sm }
})
