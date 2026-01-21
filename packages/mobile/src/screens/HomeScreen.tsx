import React from 'react'
import { Alert } from 'react-native'
import styled from 'styled-components/native'
import { useAuth } from '../context/AuthContext'
import { Button, Card, Logo } from '../components'
import { colors } from '../theme'

const Container = styled.View`
  flex: 1;
  background-color: ${colors.background.accent};
  padding: 20px;
`

const ScrollContainer = styled.ScrollView`
  flex: 1;
`

const ContentContainer = styled.View`
  align-items: center;
  padding: 20px 0;
`

const Title = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: ${colors.text.primary};
  text-align: center;
  margin-bottom: 10px;
`

const WelcomeText = styled.Text`
  font-size: 18px;
  color: ${colors.text.secondary};
  text-align: center;
  margin-bottom: 30px;
`

const UserEmail = styled.Text`
  font-size: 16px;
  color: ${colors.primary[600]};
  text-align: center;
  font-weight: 600;
  margin-bottom: 20px;
`

const FeatureText = styled.Text`
  font-size: 16px;
  color: ${colors.text.primary};
  text-align: center;
  line-height: 24px;
  margin-bottom: 20px;
`

const ComingSoonText = styled.Text`
  font-size: 14px;
  color: ${colors.text.secondary};
  text-align: center;
  font-style: italic;
  margin-top: 10px;
`

export const HomeScreen: React.FC = () => {
  const { user, signOut, loading } = useAuth()

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOut()
            if (error) {
              Alert.alert('Error', error)
            }
          },
        },
      ]
    )
  }

  const handleComingSoon = (feature: string) => {
    Alert.alert(
      'Coming Soon!',
      `${feature} will be available in a future update. Stay tuned!`
    )
  }

  return (
    <Container>
      <ScrollContainer contentContainerStyle={{ flexGrow: 1 }}>
        <ContentContainer>
          <Logo size={80} showText={true} />
          <Title>Welcome to Flash Snap! 🎉</Title>
          <WelcomeText>Your mobile flashcard companion</WelcomeText>
          
          {user && (
            <UserEmail>Signed in as: {user.email}</UserEmail>
          )}

          <Card>
            <FeatureText>
              Flash Snap Mobile is your companion to the desktop app. 
              Create, study, and sync your flashcards across all devices!
            </FeatureText>
          </Card>

          <Card>
            <Title style={{ fontSize: 20, marginBottom: 15 }}>Features</Title>
            
            <Button
              title="📚 My Decks"
              onPress={() => handleComingSoon('Deck Management')}
              variant="primary"
            />
            
            <Button
              title="🎯 Study Session"
              onPress={() => handleComingSoon('Study Sessions')}
              variant="primary"
            />
            
            <Button
              title="📊 Progress"
              onPress={() => handleComingSoon('Progress Tracking')}
              variant="secondary"
            />
            
            <Button
              title="⚙️ Settings"
              onPress={() => handleComingSoon('Settings')}
              variant="secondary"
            />

            <ComingSoonText>
              These features are coming soon! The mobile app will sync with your desktop Flash Snap data.
            </ComingSoonText>
          </Card>

          <Card>
            <Button
              title="Sign Out"
              onPress={handleSignOut}
              variant="secondary"
              disabled={loading}
            />
          </Card>
        </ContentContainer>
      </ScrollContainer>
    </Container>
  )
}