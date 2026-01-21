/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react'
import styled from 'styled-components/native'

interface LogoProps {
  size?: number
  showText?: boolean
}

const LogoContainer = styled.View`
  align-items: center;
  justify-content: center;
`

const LogoImage = styled.Image<{ size: number }>`
  width: ${({ size }: { size: number }) => size}px;
  height: ${({ size }: { size: number }) => size}px;
  border-radius: ${({ size }: { size: number }) => size / 8}px;
`

const LogoText = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #7c3aed;
  margin-top: 8px;
  text-align: center;
`

const LogoSubtext = styled.Text`
  font-size: 14px;
  color: #64748b;
  margin-top: 2px;
  text-align: center;
`

export const Logo: React.FC<LogoProps> = ({ size = 80, showText = true }) => {
  return (
    <LogoContainer>
      <LogoImage
        source={require('../../assets/flashsnapicon.png')}
        size={size}
        resizeMode="contain"
      />
      {showText && (
        <>
          <LogoText>Flash Snap</LogoText>
          <LogoSubtext>Mobile</LogoSubtext>
        </>
      )}
    </LogoContainer>
  )
}
