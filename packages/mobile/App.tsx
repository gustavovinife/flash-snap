import React from 'react'
import { StatusBar } from 'expo-status-bar'
import styled from 'styled-components/native'
import { AuthProvider, useAuth } from './src/context/AuthContext'
import { AuthScreen, HomeScreen } from './src/screens'
import { colors } from './src/theme'

const LoadingContainer = styled.View`
  flex: 1;
  background-color: ${colors.background.accent};
  align-items: center;
  justify-content: center;
`

const LoadingText = styled.Text`
  font-size: 18px;
  color: ${colors.text.secondary};
  margin-top: 20px;
`

const LoadingSpinner = styled.Text`
  font-size: 32px;
  color: ${colors.primary[600]};
`

const LoadingScreen: React.FC = () => (
  <LoadingContainer>
    <LoadingSpinner>⏳</LoadingSpinner>
    <LoadingText>Loading Flash Snap...</LoadingText>
  </LoadingContainer>
)

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  return user ? <HomeScreen /> : <AuthScreen />
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
      <StatusBar style="auto" />
    </AuthProvider>
  )
}

export default App