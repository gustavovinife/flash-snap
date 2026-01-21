import React from 'react'
import styled from 'styled-components/native'
import { colors } from '../theme'

interface InputProps {
  placeholder: string
  value: string
  onChangeText: (text: string) => void
  secureTextEntry?: boolean
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad'
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  error?: string
}

const InputContainer = styled.View`
  margin: 8px 0;
  width: 100%;
`

const StyledInput = styled.TextInput<{ hasError: boolean }>`
  background-color: ${colors.background.secondary};
  border: 1px solid ${({ hasError }: { hasError: boolean }) => hasError ? colors.error : colors.neutral[200]};
  border-radius: 8px;
  padding: 15px;
  font-size: 16px;
  color: ${colors.text.primary};
  width: 100%;
`

const ErrorText = styled.Text`
  color: ${colors.error};
  font-size: 14px;
  margin-top: 5px;
  margin-left: 5px;
`

export const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
}) => {
  return (
    <InputContainer>
      <StyledInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        hasError={!!error}
        placeholderTextColor={colors.text.secondary}
      />
      {error && <ErrorText>{error}</ErrorText>}
    </InputContainer>
  )
}