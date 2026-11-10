/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ui/Button.tsx
import React from 'react'
import { Button as HeroButton } from "@heroui/react"
import { cn } from '../../lib/utils/cn'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children?: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const variantMap = {
  primary: 'solid',
  secondary: 'bordered',
  danger: 'solid',
  success: 'solid',
  warning: 'solid',
  outline: 'bordered',
  ghost: 'light',
}

const colorMap = {
  primary: 'primary',
  secondary: 'default',
  danger: 'danger',
  success: 'success',
  warning: 'warning',
  outline: 'default',
  ghost: 'default',
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const sizeMap = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
  }

  return (
    <HeroButton
      variant={variantMap[variant] as any}
      color={colorMap[variant] as any}
      size={sizeMap[size] as any}
      className={cn(
        fullWidth && 'w-full',
        className
      )}
      isLoading={loading}
      isDisabled={disabled || loading}
      startContent={!loading && leftIcon}
      endContent={!loading && rightIcon}
      {...props}
    >
      {children}
    </HeroButton>
  )
}