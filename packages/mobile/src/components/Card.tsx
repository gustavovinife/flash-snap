import React from 'react'
import styled from 'styled-components/native'
import { colors } from '../theme'

interface CardProps {
  children: React.ReactNode
  padding?: number
  margin?: number
}

const StyledCard = styled.View<{ padding: number; margin: number }>`
  background-color: ${colors.background.secondary};
  padding: ${({ padding }: { padding: number }) => padding}px;
  margin: ${({ margin }: { margin: number }) => margin}px;
  border-radius: 12px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 8px;
  elevation: 4;
`

export const Card: React.FC<CardProps> = ({ children, padding = 20, margin = 10 }) => {
  return (
    <StyledCard padding={padding} margin={margin}>
      {children}
    </StyledCard>
  )
}
