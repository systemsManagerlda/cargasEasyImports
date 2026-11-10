/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/perfil/page.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Save, 
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  UserCircle,
  Building,
  MapPin,
  Calendar,
  Edit,
  Camera,
  Key,
  Shield,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';

// Tipos para o perfil do usuário (unificado)
interface UserProfile {
  utilizadorId: string;
  nomeUtilizador: string;
  email: string;
  nomeCompleto: string;
  telefone?: string;
  perfil: string;
  estadoConta: string;
  dataCriacao?: string;
  dataAtualizacao?: string;
  clienteId?: string;
  transportadorId?: string;
  motoristaId?: string;
}

// Dados mockados (substituir pela API)
const mockUserProfile: UserProfile = {
  utilizadorId: 'USR-001',
  nomeUtilizador: 'joaosilva',
  email: 'joao.silva@empresa.co.mz',
  nomeCompleto: 'João Silva Santos',
  telefone: '+258 84 123 4567',
  perfil: 'administrador',
  estadoConta: 'ativo',
  dataCriacao: '2024-01-15T10:00:00Z',
  dataAtualizacao: '2024-02-20T14:30:00Z',
};

// Função para converter AppUser para UserProfile
const convertToUserProfile = (user: any): UserProfile => {
  return {
    utilizadorId: user?.utilizadorId || user?.id || '',
    nomeUtilizador: user?.nomeUtilizador || user?.name || '',
    email: user?.email || '',
    nomeCompleto: user?.nomeCompleto || user?.name || '',
    telefone: user?.telefone || '',
    perfil: user?.perfil || '',
    estadoConta: user?.estadoConta || 'ativo',
    dataCriacao: user?.dataCriacao || new Date().toISOString(),
    dataAtualizacao: user?.dataAtualizacao || new Date().toISOString(),
    clienteId: user?.clienteId,
    transportadorId: user?.transportadorId,
    motoristaId: user?.motoristaId,
  };
};

export default function PerfilPage() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'perfil' | 'senha'>('perfil');
  
  // Estado do formulário de perfil
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    telefone: '',
    email: '',
  });
  
  // Estado do formulário de senha
  const [senhaData, setSenhaData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  });
  
  // Estado para mostrar/esconder senhas
  const [showSenha, setShowSenha] = useState({
    atual: false,
    nova: false,
    confirmar: false,
  });

  // Estado para o perfil do usuário
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const isFirstRender = useRef(true);

  // Carregar dados do perfil
  const carregarPerfil = async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Substituir pela chamada real da API
      // const response = await userApi.getProfile();
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Usar dados do usuário autenticado ou mock
      let profileData: UserProfile;
      
      if (user) {
        profileData = convertToUserProfile(user);
      } else {
        profileData = mockUserProfile;
      }
      
      setUserProfile(profileData);
      
      setFormData({
        nomeCompleto: profileData.nomeCompleto || '',
        telefone: profileData.telefone || '',
        email: profileData.email || '',
      });
      
    } catch (err: any) {
      console.error('❌ Erro ao carregar perfil:', err);
      setError(err.message || 'Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      carregarPerfil();
    }
  }, [user]);

  // Atualizar perfil
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Substituir pela chamada real da API
      // const response = await userApi.updateProfile(formData);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Atualizar dados locais
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          nomeCompleto: formData.nomeCompleto,
          telefone: formData.telefone,
          email: formData.email,
        });
      }
      
      setSuccess('Perfil atualizado com sucesso!');
      setTimeout(() => setSuccess(null), 5000);
      
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  // Alterar senha
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    // Validações
    if (!senhaData.senhaAtual || !senhaData.novaSenha || !senhaData.confirmarSenha) {
      setError('Todos os campos de senha são obrigatórios');
      setSaving(false);
      return;
    }

    if (senhaData.novaSenha.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres');
      setSaving(false);
      return;
    }

    if (senhaData.novaSenha !== senhaData.confirmarSenha) {
      setError('As senhas não coincidem');
      setSaving(false);
      return;
    }

    try {
      // TODO: Substituir pela chamada real da API
      // const response = await userApi.changePassword(senhaData);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess('Senha alterada com sucesso!');
      setSenhaData({
        senhaAtual: '',
        novaSenha: '',
        confirmarSenha: '',
      });
      setTimeout(() => setSuccess(null), 5000);
      
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar senha');
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSenhaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSenhaData({
      ...senhaData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleSenhaVisibility = (field: 'atual' | 'nova' | 'confirmar') => {
    setShowSenha({
      ...showSenha,
      [field]: !showSenha[field],
    });
  };

  const hasProfileChanges = () => {
    if (!userProfile) return false;
    return (
      formData.nomeCompleto !== (userProfile.nomeCompleto || '') ||
      formData.telefone !== (userProfile.telefone || '') ||
      formData.email !== (userProfile.email || '')
    );
  };

  // Mostrar loading
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Spinner size="xl" />
            <p className="mt-4 text-gray-500">Carregando perfil...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const profile = userProfile || mockUserProfile;

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gray-100 rounded-full hidden sm:flex">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Meu Perfil</h1>
              <p className="text-sm text-gray-500 hidden sm:block">
                Gerencie suas informações pessoais
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={carregarPerfil}
              leftIcon={<RefreshCw className="w-4 h-4" />}
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Recarregar
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              leftIcon={<LogOut className="w-4 h-4 text-red-500" />}
              className="text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              Sair
            </Button>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4 sm:hidden">
          Gerencie suas informações pessoais
        </p>

        {/* Erro e Sucesso */}
        {error && (
          <Alert variant="danger" className="mb-4" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-4" dismissible onDismiss={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Layout do Perfil */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Informações do Usuário */}
          <div className="lg:col-span-1">
            <Card className="border border-gray-100 shadow-sm">
              <CardBody className="p-6 text-center">
                {/* Avatar */}
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                    <UserCircle className="w-16 h-16 text-gray-400" />
                  </div>
                  <button className="absolute bottom-0 right-0 p-1.5 bg-gray-800 rounded-full text-white hover:bg-gray-900 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 mt-4">
                  {profile.nomeCompleto}
                </h3>
                <p className="text-sm text-gray-500">@{profile.nomeUtilizador}</p>
                
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Perfil</span>
                    <span className="font-medium text-gray-700 capitalize">{profile.perfil}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full',
                      profile.estadoConta === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    )}>
                      {profile.estadoConta === 'ativo' ? (
                        <><CheckCircle className="w-3 h-3" /> Ativo</>
                      ) : (
                        <><XCircle className="w-3 h-3" /> Inativo</>
                      )}
                    </span>
                  </div>
                  {profile.dataCriacao && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Membro desde</span>
                      <span className="text-gray-700">
                        {new Date(profile.dataCriacao).toLocaleDateString('pt-MZ')}
                      </span>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Menu de navegação */}
            <Card className="border border-gray-100 shadow-sm mt-4">
              <CardBody className="p-2">
                <button
                  onClick={() => setActiveTab('perfil')}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm',
                    activeTab === 'perfil'
                      ? 'bg-gray-100 text-gray-800 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  )}
                >
                  <User className="w-4 h-4" />
                  <span>Informações Pessoais</span>
                </button>
                <button
                  onClick={() => setActiveTab('senha')}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm',
                    activeTab === 'senha'
                      ? 'bg-gray-100 text-gray-800 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  )}
                >
                  <Lock className="w-4 h-4" />
                  <span>Alterar Senha</span>
                </button>
              </CardBody>
            </Card>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-3">
            {/* Aba: Informações Pessoais */}
            {activeTab === 'perfil' && (
              <Card className="border border-gray-100 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">Informações Pessoais</h2>
                      <p className="text-sm text-gray-500">
                        Atualize suas informações pessoais
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardBody className="p-4 md:p-6">
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Nome Completo *"
                        name="nomeCompleto"
                        value={formData.nomeCompleto}
                        onChange={handleFormChange}
                        placeholder="Seu nome completo"
                        required
                        leftIcon={<User className="w-4 h-4 text-gray-400" />}
                        className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
                      />

                      <Input
                        label="Email *"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        placeholder="seu@email.com"
                        required
                        leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
                        className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Telefone"
                        type="tel"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleFormChange}
                        placeholder="+258 84 123 4567"
                        leftIcon={<Phone className="w-4 h-4 text-gray-400" />}
                        className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Nome de Utilizador
                        </label>
                        <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{profile.nomeUtilizador}</span>
                          <span className="text-xs text-gray-400 ml-auto">(não editável)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        loading={saving}
                        disabled={!hasProfileChanges()}
                        leftIcon={<Save className="w-4 h-4" />}
                        className={cn(
                          'bg-gray-800 hover:bg-gray-900 text-white',
                          !hasProfileChanges() && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                      </Button>
                      
                      {hasProfileChanges() && (
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          onClick={carregarPerfil}
                          className="border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </form>
                </CardBody>
              </Card>
            )}

            {/* Aba: Alterar Senha */}
            {activeTab === 'senha' && (
              <Card className="border border-gray-100 shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">Alterar Senha</h2>
                      <p className="text-sm text-gray-500">
                        Atualize sua senha de acesso
                      </p>
                    </div>
                    <Shield className="w-5 h-5 text-gray-400" />
                  </div>
                </CardHeader>

                <CardBody className="p-4 md:p-6">
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <Input
                      label="Senha Atual *"
                      type={showSenha.atual ? 'text' : 'password'}
                      name="senhaAtual"
                      value={senhaData.senhaAtual}
                      onChange={handleSenhaChange}
                      placeholder="Digite sua senha atual"
                      required
                      leftIcon={<Key className="w-4 h-4 text-gray-400" />}
                      className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => toggleSenhaVisibility('atual')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showSenha.atual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />

                    <Input
                      label="Nova Senha *"
                      type={showSenha.nova ? 'text' : 'password'}
                      name="novaSenha"
                      value={senhaData.novaSenha}
                      onChange={handleSenhaChange}
                      placeholder="Digite sua nova senha (mínimo 6 caracteres)"
                      required
                      leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
                      className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => toggleSenhaVisibility('nova')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showSenha.nova ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />

                    <Input
                      label="Confirmar Nova Senha *"
                      type={showSenha.confirmar ? 'text' : 'password'}
                      name="confirmarSenha"
                      value={senhaData.confirmarSenha}
                      onChange={handleSenhaChange}
                      placeholder="Confirme sua nova senha"
                      required
                      leftIcon={<Lock className="w-4 h-4 text-gray-400" />}
                      className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
                      rightIcon={
                        <button
                          type="button"
                          onClick={() => toggleSenhaVisibility('confirmar')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showSenha.confirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        loading={saving}
                        leftIcon={<Save className="w-4 h-4" />}
                        className="bg-gray-800 hover:bg-gray-900 text-white"
                      >
                        {saving ? 'Alterando...' : 'Alterar Senha'}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => {
                          setSenhaData({
                            senhaAtual: '',
                            novaSenha: '',
                            confirmarSenha: '',
                          });
                          setError(null);
                          setSuccess(null);
                        }}
                        className="border-gray-200 text-gray-600 hover:bg-gray-50"
                      >
                        Limpar Campos
                      </Button>
                    </div>
                  </form>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}