/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ui/Spinner.tsx
import React from 'react'
import { Spinner as HeroSpinner } from "@heroui/react"
import { cn } from '../../lib/utils/cn'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  color?: 'primary' | 'default' | 'secondary' | 'success' | 'warning' | 'danger'
  label?: string
}

const sizeMap = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'lg',
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className,
  color = 'primary',
  label,
}) => {
  return (
    <HeroSpinner
      size={sizeMap[size] as any}
      color={color as any}
      className={cn(className)}
      label={label}
    />
  )
}