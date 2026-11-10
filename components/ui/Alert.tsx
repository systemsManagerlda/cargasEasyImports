/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ui/Alert.tsx
import React from 'react'
import { Alert as HeroAlert } from "@heroui/react"
import { cn } from '../../lib/utils/cn'

interface AlertProps {
  children: React.ReactNode
  variant?: 'info' | 'success' | 'warning' | 'danger'
  className?: string
  dismissible?: boolean
  onDismiss?: () => void
  title?: string
}

const colorMap = {
  info: 'primary',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  className,
  dismissible = false,
  onDismiss,
  title,
}) => {
  return (
    <HeroAlert
      color={colorMap[variant] as any}
      variant="faded"
      title={title}
      className={cn(className)}
      isClosable={dismissible}
      onClose={onDismiss}
    >
      {children}
    </HeroAlert>
  )
}