// components/layout/Header.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Bell, Search, X, User, Settings, LogOut, HelpCircle } from 'lucide-react'
import { useAuth } from '../../lib/hooks/useAuth'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils/cn'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  onSearch?: (query: string) => void
  onNotificationClick?: () => void
  onProfileClick?: () => void
  onSettingsClick?: () => void
  onHelpClick?: () => void
  onLogout?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  onNotificationClick,
  onProfileClick,
  onSettingsClick,
  onHelpClick,
  onLogout,
}) => {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Nova carga registrada', read: false, time: '5 min' },
    { id: 2, title: 'Alerta de atraso na carga #TRK-123', read: false, time: '15 min' },
    { id: 3, title: 'Entrega confirmada', read: true, time: '1 hora' },
  ])
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  // Fechar menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchQuery)
    }
    if (searchQuery.trim()) {
      router.push(`/cargas?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleSearchClear = () => {
    setSearchQuery('')
    if (onSearch) {
      onSearch('')
    }
  }

  const handleNotificationClick = (id: number) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    )
    if (onNotificationClick) {
      onNotificationClick()
    }
  }

  const handleLogout = async () => {
    setIsProfileMenuOpen(false)
    if (onLogout) {
      onLogout()
    } else {
      await logout()
    }
  }

  const handleProfileClick = () => {
    setIsProfileMenuOpen(false)
    if (onProfileClick) {
      onProfileClick()
    } else {
      router.push('/perfil')
    }
  }

  const handleSettingsClick = () => {
    setIsProfileMenuOpen(false)
    if (onSettingsClick) {
      onSettingsClick()
    } else {
      router.push('/configuracoes')
    }
  }

  const handleHelpClick = () => {
    setIsProfileMenuOpen(false)
    if (onHelpClick) {
      onHelpClick()
    } else {
      router.push('/ajuda')
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const displayName = user?.nomeCompleto || user?.nomeUtilizador || 'Usuário'
  const initials = getInitials(displayName)

  return (
    <header className="flex items-center justify-between w-full">
      {/* Busca - Centralizada */}
      <form 
        onSubmit={handleSearchSubmit}
        className={cn(
          'flex-1 max-w-2xl mx-auto transition-all duration-300',
          isSearchFocused ? 'scale-105' : 'scale-100'
        )}
      >
        <div className="relative">
          <Input
            placeholder="Pesquisar cargas, clientes, transportadores..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchQuery(e.target.value)
              if (onSearch && e.target.value === '') {
                onSearch('')
              }
            }}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={cn(
              'w-full pl-10 pr-10 py-2.5 text-gray-700 bg-gray-50 border-gray-200',
              'focus:bg-white focus:border-gray-300 focus:ring-2 focus:ring-gray-200',
              'transition-all duration-200 rounded-full',
              'placeholder:text-gray-400'
            )}
            leftIcon={
              <Search className="w-4 h-4 text-gray-400" />
            }
            rightIcon={
              searchQuery ? (
                <button
                  type="button"
                  onClick={handleSearchClear}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : null
            }
          />
          
          {/* Dicas de busca rápida */}
          {isSearchFocused && searchQuery.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
              <div className="px-4 py-1.5 text-xs text-gray-400 font-medium">BUSCAS RÁPIDAS</div>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('cargas')
                  if (onSearch) onSearch('cargas')
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
              >
                <Search className="w-3 h-3 text-gray-400" />
                Cargas em trânsito
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('cliente')
                  if (onSearch) onSearch('cliente')
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
              >
                <Search className="w-3 h-3 text-gray-400" />
                Clientes ativos
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('alertas')
                  if (onSearch) onSearch('alertas')
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2"
              >
                <Search className="w-3 h-3 text-gray-400" />
                Alertas críticos
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Ações da direita */}
      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
        {/* Notificações */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={cn(
              'relative p-2 rounded-full transition-all duration-200',
              'hover:bg-gray-100 active:bg-gray-200',
              'text-gray-400 hover:text-gray-600'
            )}
            aria-label="Notificações"
          >
            <Bell className="w-5 h-5" />
            {/* Badge de notificações - corrigido */}
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown de notificações */}
          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50 max-h-96 overflow-y-auto">
              <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                <span className="font-medium text-gray-800 text-sm">Notificações</span>
                <button 
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={() => {
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
                  }}
                >
                  Marcar todas como lidas
                </button>
              </div>
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                  Nenhuma notificação
                </div>
              ) : (
                notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif.id)}
                    className={cn(
                      'w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0',
                      !notif.read && 'bg-gray-50/50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                        !notif.read ? 'bg-gray-600' : 'bg-gray-300'
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm',
                          !notif.read ? 'font-medium text-gray-800' : 'text-gray-500'
                        )}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{notif.time}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
              <div className="px-4 py-2 border-t border-gray-100 text-center">
                <button 
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={() => {
                    setIsNotificationsOpen(false)
                    router.push('/notificacoes')
                  }}
                >
                  Ver todas as notificações
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Perfil */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className={cn(
              'flex items-center gap-2.5 p-1.5 rounded-full transition-all duration-200',
              'hover:bg-gray-100 active:bg-gray-200',
              'text-gray-400 hover:text-gray-600'
            )}
            aria-label="Perfil"
          >
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm">
              {initials}
            </div>
            <span className="hidden md:block text-sm text-gray-700 font-medium">
              {displayName}
            </span>
          </button>

          {/* Dropdown do perfil */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800">{displayName}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.perfil || 'Usuário'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
              
              <button
                onClick={handleProfileClick}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <User className="w-4 h-4 text-gray-400" />
                Meu Perfil
              </button>
              
              <button
                onClick={handleSettingsClick}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-400" />
                Configurações
              </button>
              
              <button
                onClick={handleHelpClick}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-gray-400" />
                Ajuda
              </button>
              
              <div className="border-t border-gray-100 my-1" />
              
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}