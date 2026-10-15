import '@/i18n'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { StyleSheet, View } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Logo } from '@/components'
import { InstallPrompt } from '@/components/InstallPrompt'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { usePageViews } from '@/hooks/usePageViews'
import { DialogHost } from '@/lib/dialogs'
import { useStackScreenOptions } from '@/navigation'
import { useTheme } from '@/theme'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } }
})

function RootNavigator(): React.JSX.Element {
  const { session, loading } = useAuth()
  const colors = useTheme()
  const screenOptions = useStackScreenOptions()
  usePageViews()

  // Same look as the native splash screen, so startup flows straight into the app
  if (loading) {
    return (
      <View style={[styles.splash, { backgroundColor: colors.primary }]}>
        <StatusBar style="light" />
        <Logo size={96} />
      </View>
    )
  }

  return (
    <>
      <StatusBar style={colors.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={screenOptions}>
        <Stack.Protected guard={!session}>
          <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="review/[id]"
            options={{ headerShown: false, presentation: 'fullScreenModal', gestureEnabled: false }}
          />
          <Stack.Screen name="deck-form" options={{ presentation: 'modal' }} />
          <Stack.Screen name="card-form" options={{ presentation: 'modal' }} />
          <Stack.Screen name="ai-generate" options={{ presentation: 'modal' }} />
        </Stack.Protected>

      </Stack>
    </>
  )
}

export default function RootLayout(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RootNavigator />
          <DialogHost />
          <InstallPrompt />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center' }
})
