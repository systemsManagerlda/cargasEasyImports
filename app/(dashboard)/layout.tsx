'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../../lib/hooks/useAuth'
import { Sidebar } from '../../components/layout/Sidebar'
import { Header } from '../../components/layout/Header'
import { Spinner } from '../../components/ui/Spinner'
import { Menu } from 'lucide-react'
import { Button } from '../../components/ui/Button'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const redirectingRef = useRef(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (redirectingRef.current) return
    if (!loading && !isAuthenticated && pathname?.startsWith('/dashboard')) {
      redirectingRef.current = true
      router.replace('/login')
    }
  }, [isAuthenticated, loading, router, pathname])

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setIsMobileMenuOpen(false) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Spinner size="xl" label="Carregando" /></div>
  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <Sidebar isMobileOpen={isMobileMenuOpen} onMobileClose={() => setIsMobileMenuOpen(false)} />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
          <div className="h-16 px-4 lg:px-8 flex items-center gap-4">
            <Button variant="ghost" size="sm" className="lg:hidden !min-w-10 !px-2" onClick={() => setIsMobileMenuOpen(v => !v)} leftIcon={<Menu className="w-5 h-5" />}>
              <span className="sr-only">Abrir menu</span>
            </Button>
            <Header />
          </div>
        </header>
        <main className="min-h-[calc(100vh-4rem)] px-4 py-5 lg:px-8 lg:py-7">{children}</main>
      </div>
    </div>
  )
}
