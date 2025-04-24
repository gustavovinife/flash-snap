import { SelectHTMLAttributes, forwardRef } from 'react'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  fullWidth?: boolean
  options: SelectOption[]
}

type SelectOption = {
  label: string
  value: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, fullWidth = true, options, ...props }, ref) => {
    return (
      <div className={`${fullWidth ? 'w-full' : ''} space-y-1.5`}>
        {label && (
          <label htmlFor={props.id} className="block text-sm font-medium text-gray-400">
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            className={`py-2 px-2
              block rounded-md border-gray-200 shadow-sm text-sm
              focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] focus:outline-none
              disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed
              placeholder:text-gray-400
              ${fullWidth ? 'w-full' : ''}
              ${className}
            `}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label || option.value}
              </option>
            ))}
          </select>
        </div>
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
