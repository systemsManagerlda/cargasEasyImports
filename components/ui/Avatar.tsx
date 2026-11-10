/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ui/Avatar.tsx
import React from 'react'
import { Avatar as HeroAvatar } from "@heroui/react"
import { cn } from '../../lib/utils/cn'

interface AvatarProps {
  name?: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'default'
  isBordered?: boolean
  className?: string
  isDisabled?: boolean
}

export const Avatar: React.FC<AvatarProps> = ({
  name = 'U',
  src,
  size = 'md',
  color = 'primary',
  isBordered = false,
  className,
  isDisabled = false,
}) => {
  const sizeMap = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
  }

  return (
    <HeroAvatar
      name={name}
      src={src}
      size={sizeMap[size] as any}
      color={color as any}
      isBordered={isBordered}
      className={cn(className)}
      isDisabled={isDisabled}
      showFallback
    />
  )
}