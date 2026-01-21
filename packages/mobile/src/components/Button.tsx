/* eslint-disable prettier/prettier */
import React from 'react';
import styled from 'styled-components/native';
import { colors } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  fullWidth?: boolean;
}

const StyledButton = styled.TouchableOpacity<{ variant: 'primary' | 'secondary'; disabled?: boolean; fullWidth?: boolean }>`
  background-color: ${({ variant, disabled }: { variant: 'primary' | 'secondary'; disabled?: boolean }) => {
    if (disabled) return colors.neutral[300];
    return variant === 'primary' ? colors.primary[600] : colors.neutral[100];
  }};
  padding: 15px 30px;
  border-radius: 8px;
  align-items: center;
  justify-content: center;
  margin: 5px 0;
  width: ${({ fullWidth }: { fullWidth?: boolean }) => fullWidth ? '100%' : 'auto'};
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 4px;
  elevation: 3;
`;

const ButtonText = styled.Text<{ variant: 'primary' | 'secondary'; disabled?: boolean }>`
  color: ${({ variant, disabled }: { variant: 'primary' | 'secondary'; disabled?: boolean }) => {
    if (disabled) return colors.neutral[500];
    return variant === 'primary' ? colors.text.inverse : colors.text.primary;
  }};
  font-size: 16px;
  font-weight: 600;
`;

export const Button: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false,
  fullWidth = true
}) => {
  return (
    <StyledButton 
      variant={variant} 
      disabled={disabled}
      fullWidth={fullWidth}
      onPress={disabled ? undefined : onPress}
      activeOpacity={disabled ? 1 : 0.7}
    >
      <ButtonText variant={variant} disabled={disabled}>
        {title}
      </ButtonText>
    </StyledButton>
  );
};