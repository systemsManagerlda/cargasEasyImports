/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ui/Modal.tsx
import React from 'react'
import { Modal as HeroModal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react"
import { cn } from '../../lib/utils/cn'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
  hideCloseButton?: boolean
  backdrop?: 'opaque' | 'blur' | 'transparent'
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className,
  hideCloseButton = false,
  backdrop = 'opaque',
}) => {
  const sizeMap = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
    full: 'full',
  }

  return (
    <HeroModal
      isOpen={isOpen}
      onClose={onClose}
      size={sizeMap[size] as any}
      backdrop={backdrop as any}
      hideCloseButton={hideCloseButton}
      className={cn(className)}
    >
      <ModalContent>
        {(onClose) => (
          <>
            {title && (
              <ModalHeader className="flex flex-col gap-1">
                {title}
              </ModalHeader>
            )}
            <ModalBody>
              {children}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </HeroModal>
  )
}

export { ModalContent, ModalHeader, ModalBody, ModalFooter }