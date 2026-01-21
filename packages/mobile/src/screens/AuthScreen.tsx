/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform } from 'react-native'
import styled from 'styled-components/native'
import { useAuth } from '../context/AuthContext'
import { Button, Input, Logo } from '../components'
import { colors } from '../theme'

const Container = styled.View`
  flex: 1;
  background-color: ${colors.background.accent};
  justify-content: center;
  width: 100%;
`

const ScrollContainer = styled.ScrollView`
  flex: 1;
`

const ContentContainer = styled.View`
  justify-content: center;
  align-items: center;
  min-height: 100%;
  width: 100%;
  padding: 20px;
`

const Title = styled.Text`
  font-size: 32px;
  font-weight: bold;
  color: ${colors.text.primary};
  text-align: center;
  margin-bottom: 10px;
`

const Subtitle = styled.Text`
  font-size: 18px;
  color: ${colors.text.secondary};
  text-align: center;
  margin-bottom: 30px;
`

const FormContainer = styled.View`
  width: 100%;
  align-items: center;
`

const SwitchText = styled.Text`
  color: ${colors.text.secondary};
  text-align: center;
  margin-top: 20px;
  font-size: 16px;
`

const SwitchButton = styled.TouchableOpacity`
  margin-top: 5px;
`

const SwitchButtonText = styled.Text`
  color: ${colors.primary[600]};
  text-align: center;
  font-size: 16px;
  font-weight: 600;
`

const LoadingText = styled.Text`
  color: ${colors.text.secondary};
  text-align: center;
  font-size: 16px;
  margin-top: 10px;
`

export const AuthScreen: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')

  const { signIn, signUp, loading } = useAuth()

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    let isValid = true

    // Reset errors
    setEmailError('')
    setPasswordError('')
    setConfirmPasswordError('')

    // Validate email
    if (!email) {
      setEmailError('Email is required')
      isValid = false
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email')
      isValid = false
    }

    // Validate password
    if (!password) {
      setPasswordError('Password is required')
      isValid = false
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      isValid = false
    }

    // Validate confirm password for sign up
    if (isSignUp) {
      if (!confirmPassword) {
        setConfirmPasswordError('Please confirm your password')
        isValid = false
      } else if (password !== confirmPassword) {
        setConfirmPasswordError('Passwords do not match')
        isValid = false
      }
    }

    return isValid
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      let result
      if (isSignUp) {
        result = await signUp(email, password)
        if (!result.error) {
          Alert.alert(
            'Success!',
            'Account created successfully. Please check your email to verify your account.',
            [{ text: 'OK' }]
          )
        }
      } else {
        result = await signIn(email, password)
      }

      if (result.error) {
        Alert.alert('Error', result.error)
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred')
    }
  }

  const handleSwitchMode = () => {
    setIsSignUp(!isSignUp)
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setEmailError('')
    setPasswordError('')
    setConfirmPasswordError('')
  }

  return (
    <Container>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollContainer contentContainerStyle={{ flexGrow: 1 }}>
          <ContentContainer>
            <Logo size={100} showText={false} />
            <Title>Flash Snap</Title>
            <Subtitle>{isSignUp ? 'Create your account' : 'Welcome back!'}</Subtitle>

            <FormContainer>
              <Input
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={emailError}
              />

              <Input
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                error={passwordError}
              />

              {isSignUp && (
                <Input
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  error={confirmPasswordError}
                />
              )}

              <Button
                title={isSignUp ? 'Sign Up' : 'Sign In'}
                onPress={handleSubmit}
                disabled={loading}
                variant="primary"
              />

              {loading && <LoadingText>Please wait...</LoadingText>}

              <SwitchText>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </SwitchText>
              <SwitchButton onPress={handleSwitchMode}>
                <SwitchButtonText>{isSignUp ? 'Sign In' : 'Sign Up'}</SwitchButtonText>
              </SwitchButton>
            </FormContainer>
          </ContentContainer>
        </ScrollContainer>
      </KeyboardAvoidingView>
    </Container>
  )
}
