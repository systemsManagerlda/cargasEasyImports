// components/ui/Select.tsx
import React, { forwardRef } from 'react'
import { cn } from '../../lib/utils/cn'
import { ChevronDown } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Option[]
  placeholder?: string
  containerClassName?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      options,
      placeholder,
      className,
      containerClassName,
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'w-full px-3 py-2.5 border rounded-lg appearance-none',
              'focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent',
              'transition-all duration-200',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              'text-gray-700 bg-gray-50 border-gray-200',
              'focus:bg-white',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            disabled={disabled}
            value={value}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'