// components/ui/Input.tsx
import React, { forwardRef, useState } from 'react'
import { cn } from '../../lib/utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  containerClassName?: string
  floatingLabel?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      className,
      containerClassName,
      disabled,
      floatingLabel = false,
      placeholder,
      value,
      defaultValue,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const [hasValue, setHasValue] = useState(!!value || !!defaultValue)

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasValue(!!e.target.value)
      onBlur?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value)
      props.onChange?.(e)
    }

    // Se for floating label, usa o estilo com label flutuante
    if (floatingLabel) {
      return (
        <div className={cn('w-full', containerClassName)}>
          <div className="relative">
            <input
              ref={ref}
              className={cn(
                'w-full px-3 py-3.5 border rounded-lg',
                'focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent',
                'transition-all duration-200',
                'disabled:bg-gray-100 disabled:cursor-not-allowed',
                'placeholder:text-transparent',
                leftIcon && 'pl-10',
                rightIcon && 'pr-10',
                error && 'border-red-500 focus:ring-red-500',
                isFocused || hasValue ? 'pt-5 pb-1.5' : 'py-3.5',
                className
              )}
              placeholder={placeholder}
              disabled={disabled}
              value={value}
              defaultValue={defaultValue}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={handleChange}
              {...props}
            />
            
            {label && (
              <label
                className={cn(
                  'absolute left-3 transition-all duration-200 pointer-events-none',
                  'text-gray-500',
                  (isFocused || hasValue) 
                    ? 'text-xs top-1.5 text-gray-400' 
                    : 'text-sm top-1/2 -translate-y-1/2'
                )}
              >
                {label}
              </label>
            )}

            {leftIcon && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                {leftIcon}
              </div>
            )}
            
            {rightIcon && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {rightIcon}
              </div>
            )}
          </div>
          {error && (
            <p className="mt-1.5 text-sm text-red-500">{error}</p>
          )}
        </div>
      )
    }

    // Versão padrão (sem floating label)
    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full px-3 py-2.5 border border-gray-200 rounded-lg',
              'focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent',
              'transition-all duration-200',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              'placeholder:text-gray-400',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            placeholder={placeholder}
            disabled={disabled}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'