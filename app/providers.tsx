// app/providers.tsx
'use client'

import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"
import { Toaster } from "react-hot-toast"
import { HeroUIProvider } from "@heroui/react"
import { useRouter } from "next/navigation"

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const router = useRouter()

  return (
    <HeroUIProvider navigate={router.push}>
      <SessionProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </SessionProvider>
    </HeroUIProvider>
  )
}