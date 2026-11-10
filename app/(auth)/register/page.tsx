// app/(auth)/register/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '../../../lib/hooks/useAuth'
import { authApi } from '../../../lib/api/auth'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Alert } from '../../../components/ui/Alert'
import { Card, CardBody } from '../../../components/ui/Card'
import { 
  Package, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  UserCircle,
  Truck
} from 'lucide-react'
import Link from 'next/link'

const perfilOptions = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'cliente', label: 'Cliente' },
  { value: 'transportador', label: 'Transportador' },
  { value: 'motorista', label: 'Motorista' },
  { value: 'analista', label: 'Analista' },
  { value: 'suporte', label: 'Suporte' },
]

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const perfilParam = searchParams.get('perfil')
  const fromParam = searchParams.get('from')
  
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Definir perfil inicial baseado no parâmetro
  const perfilInicial = perfilParam && perfilOptions.some(p => p.value === perfilParam) 
    ? perfilParam 
    : 'cliente'

  const [formData, setFormData] = useState({
    nomeUtilizador: '',
    email: '',
    palavraPasse: '',
    confirmarPalavraPasse: '',
    nomeCompleto: '',
    telefone: '',
    perfil: perfilInicial,
  })

  // Se já estiver autenticado e não for para criar usuário, redirecionar
  useEffect(() => {
    if (!authLoading && isAuthenticated && !perfilParam) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, authLoading, router, perfilParam])

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!formData.nomeUtilizador || !formData.email || !formData.palavraPasse || !formData.nomeCompleto || !formData.telefone) {
      setError('Todos os campos são obrigatórios')
      return
    }

    if (formData.palavraPasse !== formData.confirmarPalavraPasse) {
      setError('As senhas não coincidem')
      return
    }

    if (formData.palavraPasse.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const response = await authApi.register({
        nomeUtilizador: formData.nomeUtilizador,
        email: formData.email,
        palavraPasse: formData.palavraPasse,
        nomeCompleto: formData.nomeCompleto,
        telefone: formData.telefone,
        perfil: formData.perfil,
      })

      if (response.returnCode === 200 || response.returnCode === 201) {
        const mensagem = formData.perfil === 'transportador'
          ? 'Transportador criado com sucesso!'
          : formData.perfil === 'cliente'
          ? 'Cliente criado com sucesso!'
          : formData.perfil === 'motorista'
          ? 'Motorista criado com sucesso!'
          : 'Usuário criado com sucesso!'
        
        setSuccess(mensagem + ' Redirecionando...')
        setTimeout(() => {
          // Redirecionar para a página de origem
          if (fromParam === 'transportadores') {
            router.push('/transportadores')
          } else if (fromParam === 'clientes') {
            router.push('/clientes')
          } else if (fromParam === 'motoristas') {
            router.push('/motoristas')
          } else {
            router.push('/login')
          }
        }, 2000)
      } else {
        setError(response.returnMsg || 'Erro ao criar usuário')
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.returnMsg || err.message || 'Erro ao criar usuário')
    } finally {
      setLoading(false)
    }
  }

  // Título dinâmico baseado no perfil
  const getTitle = () => {
    if (formData.perfil === 'transportador') {
      return 'Novo Transportador'
    }
    if (formData.perfil === 'motorista') {
      return 'Novo Motorista'
    }
    if (formData.perfil === 'cliente') {
      return 'Novo Cliente'
    }
    return 'Criar Conta'
  }

  const getSubtitle = () => {
    if (formData.perfil === 'transportador') {
      return 'Registre um novo transportador no sistema'
    }
    if (formData.perfil === 'motorista') {
      return 'Registre um novo motorista no sistema'
    }
    if (formData.perfil === 'cliente') {
      return 'Registre um novo cliente no sistema'
    }
    return 'Registre-se para acessar o sistema'
  }

  const getIcon = () => {
    if (formData.perfil === 'transportador') {
      return <Truck className="w-12 h-12 text-gray-600" />
    }
    return <Package className="w-12 h-12 text-gray-600" />
  }

  const getButtonText = () => {
    if (formData.perfil === 'transportador') {
      return 'Criar Transportador'
    }
    if (formData.perfil === 'motorista') {
      return 'Criar Motorista'
    }
    if (formData.perfil === 'cliente') {
      return 'Criar Cliente'
    }
    return 'Criar Conta'
  }

  const getBackLink = () => {
    if (fromParam === 'transportadores') return '/transportadores'
    if (fromParam === 'clientes') return '/clientes'
    if (fromParam === 'motoristas') return '/motoristas'
    return '/login'
  }

  const getBackText = () => {
    if (fromParam === 'transportadores') return 'Voltar para Transportadores'
    if (fromParam === 'clientes') return 'Voltar para Clientes'
    if (fromParam === 'motoristas') return 'Voltar para Motoristas'
    return 'Voltar para o login'
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <div className="w-full max-w-md">
        <Card className="w-full shadow-lg border border-gray-100">
          <CardBody className="p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gray-100 rounded-full">
                  {getIcon()}
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">{getTitle()}</h2>
              <p className="text-gray-500 text-sm mt-1">
                {getSubtitle()}
              </p>
            </div>

            {error && (
              <Alert variant="danger" className="mb-4" dismissible>
                {error}
              </Alert>
            )}

            {success && (
              <Alert variant="success" className="mb-4" dismissible>
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nome de Utilizador *"
                type="text"
                name="nomeUtilizador"
                value={formData.nomeUtilizador}
                onChange={handleChange}
                placeholder="Digite seu nome de utilizador"
                required
                leftIcon={<User className="w-4 h-4 text-gray-400" />}
                className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
              />

              <Input
                label="Nome Completo *"
                type="text"
                name="nomeCompleto"
                value={formData.nomeCompleto}
                onChange={handleChange}
                placeholder="Digite seu nome completo"
                required
                leftIcon={<UserCircle className="w-4 h-4 text-gray-400" />}
                className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
              />

              <Input
                label="Email *"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Digite seu email"
                required
                leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
                className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
              />

              <Input
                label="Telefone *"
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="+258 84 123 4567"
                required
                leftIcon={<Phone className="w-4 h-4 text-gray-400" />}
                className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
              />

              <Select
                label="Perfil *"
                name="perfil"
                options={perfilOptions}
                value={formData.perfil}
                onChange={handleChange}
                required
                className="text-gray-800 bg-gray-50 border-gray-200 focus:bg-white"
              />

              <Input
                label="Senha *"
                type={showPassword ? 'text' : 'password'}
                name="palavraPasse"
                value={formData.palavraPasse}
                onChange={handleChange}
                placeholder="Digite sua senha (mínimo 6 caracteres)"
                required
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

              <Input
                label="Confirmar Senha *"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmarPalavraPasse"
                value={formData.confirmarPalavraPasse}
                onChange={handleChange}
                placeholder="Confirme sua senha"
                required
                leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
                className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                {getButtonText()}
              </Button>

              <div className="text-center mt-4">
                <Link
                  href={getBackLink()}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {getBackText()}
                </Link>
              </div>
            </form>

            <div className="mt-4 text-center">
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