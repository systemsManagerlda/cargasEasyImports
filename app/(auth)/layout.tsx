// app/(auth)/layout.tsx
'use client'

import React, { useEffect, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useAuth } from '../../lib/hooks/useAuth'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const redirectingRef = useRef(false)

  useEffect(() => {
    if (redirectingRef.current) return
    
    if (!loading && isAuthenticated) {
      // Verificar se está na página de registro com parâmetro perfil
      if (pathname === '/register' && searchParams.has('perfil')) {
        // Permitir acesso ao registro mesmo estando autenticado
        // para criar novos transportadores, clientes, etc.
        return
      }
      
      // Redirecionar para dashboard apenas se não for registro com perfil
      if (pathname?.startsWith('/login') || pathname === '/register') {
        redirectingRef.current = true
        router.replace('/dashboard')
      }
    }
  }, [isAuthenticated, loading, router, pathname, searchParams])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se estiver autenticado e na página de login, não renderizar
  if (isAuthenticated && pathname?.startsWith('/login')) {
    return null
  }

  // Se estiver autenticado e na página de registro sem parâmetro perfil, não renderizar
  if (isAuthenticated && pathname === '/register' && !searchParams.has('perfil')) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-blue-50">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}