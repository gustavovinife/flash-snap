import '@/i18n'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { LoadingView } from '@/components'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { useTheme } from '@/theme'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } }
})

function RootNavigator(): React.JSX.Element {
  const { session, loading } = useAuth()
  const colors = useTheme()

  if (loading) return <LoadingView />

  return (
    <>
      <StatusBar style={colors.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text, fontWeight: '700' },
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.background }
        }}
      >
        <Stack.Protected guard={!session}>
          <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        </Stack.Protected>

        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="deck/[id]/index" options={{ title: '' }} />
          <Stack.Screen name="deck/[id]/stats" />
          <Stack.Screen
            name="review/[id]"
            options={{ headerShown: false, presentation: 'fullScreenModal', gestureEnabled: false }}
          />
          <Stack.Screen name="deck-form" options={{ presentation: 'modal' }} />
          <Stack.Screen name="card-form" options={{ presentation: 'modal' }} />
          <Stack.Screen name="ai-generate" options={{ presentation: 'modal' }} />
        </Stack.Protected>

        <Stack.Screen name="auth-callback" options={{ headerShown: false }} />
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
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}
