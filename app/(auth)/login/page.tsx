// app/(auth)/login/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../lib/hooks/useAuth'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Alert } from '../../../components/ui/Alert'
import { Card, CardBody } from '../../../components/ui/Card'
import { Package, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, loading: authLoading } = useAuth()
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState<boolean>(false)

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, authLoading, router])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Carregando...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await login(username, password)

    if (!result.success) {
      setError(result.error || 'Credenciais inválidas')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <div className="w-full max-w-md">
        <Card className="w-full shadow-lg border border-gray-100">
          <CardBody className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gray-100 rounded-full">
                  <Package className="w-12 h-12 text-gray-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Sistema de Rastreio
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Faça login para acessar o sistema
              </p>
            </div>

            {error && (
              <Alert variant="danger" className="mb-4" dismissible>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Usuário ou Email"
                type="text"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                placeholder="Digite seu nome de usuário ou email"
                required
                autoComplete="username"
                leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
                className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
              />

              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
                autoComplete="current-password"
                leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
                className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={loading}
                className="bg-gray-800 hover:bg-gray-900 text-white focus:ring-gray-500"
              >
                Entrar
              </Button>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4">
                <Link
                  href="/register"
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Criar nova conta
                </Link>
                <Link
                  href="/recuperar-senha"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                Sistema de Rastreio de Cargas v1.0
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}