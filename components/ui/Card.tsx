import React from 'react'
import {
  Card as HeroCard,
  CardHeader,
  CardBody,
  CardFooter,
} from '@heroui/react'
import { cn } from '../../lib/utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'flat' | 'bordered' | 'shadow'
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'shadow',
}) => {
  const variantClasses = {
    flat: 'bg-transparent shadow-none',
    bordered: 'border border-default-200 shadow-none',
    shadow: 'shadow-md',
  }

  return (
    <HeroCard
      className={cn(
        'w-full',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </HeroCard>
  )
}

export { CardHeader, CardBody, CardFooter }

export const CardContent: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({
  children,
  className,
}) => {
  return (
    <CardBody className={cn(className)}>
      {children}
    </CardBody>
  )
}

export const CardTitle: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({
  children,
  className,
}) => {
  return (
    <h3
      className={cn(
        'text-lg font-semibold text-foreground',
        className
      )}
    >
      {children}
    </h3>
  )
}

export const CardDescription: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({
  children,
  className,
}) => {
  return (
    <p
      className={cn(
        'text-sm text-default-500',
        className
      )}
    >
      {children}
    </p>
  )
}