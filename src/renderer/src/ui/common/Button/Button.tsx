import React, { ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'default',
      size = 'sm',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Base classes for all buttons
    const baseClasses =
      'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none'

    // Size classes - more compact
    const sizeClasses = {
      xs: 'text-xs px-2 py-1 h-6',
      sm: 'text-xs px-2.5 py-1 h-7',
      md: 'text-sm px-3 py-1.5 h-9',
      lg: 'text-sm px-4 py-2 h-10'
    }

    // Variant classes with direct color values
    const variantClasses = {
      default: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      primary: 'bg-[#7c3aed] text-white hover:bg-[#6d28d9] focus-visible:ring-[#8b5cf6]',
      secondary: 'bg-[#ca8a04] text-white hover:bg-[#ca8a04] focus-visible:ring-[#facc15]',
      outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
      link: 'bg-transparent underline-offset-4 hover:underline text-[#7c3aed] hover:text-[#6d28d9]',
      destructive: 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-400'
    }

    // Width classes
    const widthClasses = fullWidth ? 'w-full' : ''

    // Combine classes
    const buttonClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClasses} ${className}`

    return (
      <button ref={ref} disabled={disabled || isLoading} className={buttonClasses} {...props}>
        {isLoading && (
          <svg
            className="mr-1.5 h-3 w-3 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}

        {!isLoading && leftIcon && <span className="mr-1.5">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-1.5">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
