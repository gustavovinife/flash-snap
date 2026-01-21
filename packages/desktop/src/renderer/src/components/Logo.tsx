import React from 'react'

interface LogoProps {
  size?: number
  className?: string
}

const Logo: React.FC<LogoProps> = ({ size = 32, className = '' }) => {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Circle */}
        <circle cx="50" cy="50" r="50" fill="#f5f3ff" />

        {/* Flash Part */}
        <path
          d="M60 20H40L30 55H45L35 80L70 45H50L60 20Z"
          fill="#7c3aed"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Snap/Camera Element */}
        <circle cx="70" cy="30" r="10" fill="#eab308" />
      </svg>
    </div>
  )
}

export default Logo
