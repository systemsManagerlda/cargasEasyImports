/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ui/Badge.tsx
import React from 'react'
import { Badge as HeroBadge } from "@heroui/react"
import { cn } from '../../lib/utils/cn'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'gray'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const colorMap = {
  primary: 'primary',
  secondary: 'default',
  success: 'success',
  danger: 'danger',
  warning: 'warning',
  info: 'primary',
  gray: 'default',
}

const sizeMap = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  size = 'md',
  className,
}) => {
  return (
    <HeroBadge
      color={colorMap[variant] as any}
      size={sizeMap[size] as any}
      className={cn(className)}
    >
      {children}
    </HeroBadge>
  )
}