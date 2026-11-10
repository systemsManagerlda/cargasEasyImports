/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/configuracoes/page.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { 
  Settings, 
  Bell, 
  Shield, 
  Server,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// Tipos para configurações
interface Configuracao {
  id: string;
  categoria: string;
  chave: string;
  valor: any;
  descricao: string;
  tipo: 'text' | 'number' | 'boolean' | 'select' | 'password' | 'color' | 'textarea';
  opcoes?: { value: string; label: string }[];
  obrigatorio?: boolean;
  sensivel?: boolean;
}

// Dados mockados das configurações
const mockConfiguracoes: Configuracao[] = [
  // Geral
  {
    id: 'cfg-001',
    categoria: 'geral',
    chave: 'nome_sistema',
    valor: 'Sistema de Rastreio de Cargas',
    descricao: 'Nome do sistema',
    tipo: 'text',
    obrigatorio: true,
  },
  {
    id: 'cfg-002',
    categoria: 'geral',
    chave: 'idioma',
    valor: 'pt',
    descricao: 'Idioma do sistema',
    tipo: 'select',
    opcoes: [
      { value: 'pt', label: 'Português' },
      { value: 'en', label: 'Inglês' },
      { value: 'es', label: 'Espanhol' },
    ],
  },
  {
    id: 'cfg-003',
    categoria: 'geral',
    chave: 'timezone',
    valor: 'Africa/Maputo',
    descricao: 'Fuso horário',
    tipo: 'select',
    opcoes: [
      { value: 'Africa/Maputo', label: 'Maputo (GMT+2)' },
      { value: 'Africa/Johannesburg', label: 'Joanesburgo (GMT+2)' },
      { value: 'Europe/Lisbon', label: 'Lisboa (GMT+1)' },
      { value: 'America/Sao_Paulo', label: 'São Paulo (GMT-3)' },
    ],
  },
  {
    id: 'cfg-004',
    categoria: 'geral',
    chave: 'tema',
    valor: 'auto',
    descricao: 'Tema do sistema',
    tipo: 'select',
    opcoes: [
      { value: 'claro', label: 'Claro' },
      { value: 'escuro', label: 'Escuro' },
      { value: 'auto', label: 'Automático' },
    ],
  },

  // Notificações
  {
    id: 'cfg-005',
    categoria: 'notificacoes',
    chave: 'email_notificacoes',
    valor: true,
    descricao: 'Receber notificações por email',
    tipo: 'boolean',
  },
  {
    id: 'cfg-006',
    categoria: 'notificacoes',
    chave: 'sms_notificacoes',
    valor: false,
    descricao: 'Receber notificações por SMS',
    tipo: 'boolean',
  },
  {
    id: 'cfg-007',
    categoria: 'notificacoes',
    chave: 'push_notificacoes',
    valor: true,
    descricao: 'Receber notificações push',
    tipo: 'boolean',
  },
  {
    id: 'cfg-008',
    categoria: 'notificacoes',
    chave: 'alertas_email',
    valor: 'admin@empresa.co.mz',
    descricao: 'Email para alertas críticos',
    tipo: 'text',
  },

  // Segurança
  {
    id: 'cfg-009',
    categoria: 'seguranca',
    chave: 'dois_fatores',
    valor: false,
    descricao: 'Autenticação de dois fatores (2FA)',
    tipo: 'boolean',
  },
  {
    id: 'cfg-010',
    categoria: 'seguranca',
    chave: 'tempo_sessao',
    valor: 480,
    descricao: 'Tempo de sessão (minutos)',
    tipo: 'number',
  },
  {
    id: 'cfg-011',
    categoria: 'seguranca',
    chave: 'tentativas_login',
    valor: 5,
    descricao: 'Tentativas máximas de login',
    tipo: 'number',
  },
  {
    id: 'cfg-012',
    categoria: 'seguranca',
    chave: 'bloqueio_tempo',
    valor: 30,
    descricao: 'Tempo de bloqueio após tentativas (minutos)',
    tipo: 'number',
  },

  // Sistema
  {
    id: 'cfg-013',
    categoria: 'sistema',
    chave: 'manutencao',
    valor: false,
    descricao: 'Modo de manutenção',
    tipo: 'boolean',
  },
  {
    id: 'cfg-014',
    categoria: 'sistema',
    chave: 'debug_mode',
    valor: false,
    descricao: 'Modo debug',
    tipo: 'boolean',
  },
  {
    id: 'cfg-015',
    categoria: 'sistema',
    chave: 'backup_automatico',
    valor: true,
    descricao: 'Backup automático',
    tipo: 'boolean',
  },
  {
    id: 'cfg-016',
    categoria: 'sistema',
    chave: 'frequencia_backup',
    valor: 'diario',
    descricao: 'Frequência de backup',
    tipo: 'select',
    opcoes: [
      { value: 'diario', label: 'Diário' },
      { value: 'semanal', label: 'Semanal' },
      { value: 'mensal', label: 'Mensal' },
    ],
  },

  // Financeiro
  {
    id: 'cfg-017',
    categoria: 'financeiro',
    chave: 'moeda_padrao',
    valor: 'MZN',
    descricao: 'Moeda padrão',
    tipo: 'select',
    opcoes: [
      { value: 'MZN', label: 'Metical (MZN)' },
      { value: 'USD', label: 'Dólar (USD)' },
      { value: 'EUR', label: 'Euro (EUR)' },
      { value: 'ZAR', label: 'Rand (ZAR)' },
    ],
  },
  {
    id: 'cfg-018',
    categoria: 'financeiro',
    chave: 'iva_padrao',
    valor: 16,
    descricao: 'IVA padrão (%)',
    tipo: 'number',
  },
];

// Categorias com ícones
const categorias = {
  geral: { label: 'Geral', icon: Settings, descricao: 'Configurações gerais do sistema' },
  notificacoes: { label: 'Notificações', icon: Bell, descricao: 'Configurações de notificações' },
  seguranca: { label: 'Segurança', icon: Shield, descricao: 'Configurações de segurança' },
  sistema: { label: 'Sistema', icon: Server, descricao: 'Configurações do sistema' },
  financeiro: { label: 'Financeiro', icon: DollarSign, descricao: 'Configurações financeiras' },
};

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [configuracoes, setConfiguracoes] = useState<Configuracao[]>([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('geral');
  const [showSenha, setShowSenha] = useState<Record<string, boolean>>({});
  const [alteracoes, setAlteracoes] = useState<Record<string, any>>({});

  // Ref para controlar se é o primeiro carregamento
  const isFirstRender = useRef(true);

  // Carregar configurações
  const carregarConfiguracoes = async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Substituir pela chamada real da API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setConfiguracoes(mockConfiguracoes);
      setAlteracoes({});
      
    } catch (err: any) {
      console.error('❌ Erro ao carregar configurações:', err);
      setError(err.message || 'Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados iniciais - apenas na montagem
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      carregarConfiguracoes();
    }
  }, []);

  // Salvar configurações
  const salvarConfiguracoes = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Substituir pela chamada real da API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Atualizar configurações locais
      setConfiguracoes(prev => 
        prev.map(cfg => {
          if (alteracoes[cfg.id] !== undefined) {
            return { ...cfg, valor: alteracoes[cfg.id] };
          }
          return cfg;
        })
      );
      
      setSuccess('Configurações salvas com sucesso!');
      setAlteracoes({});
      
      setTimeout(() => setSuccess(null), 5000);
      
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (id: string, valor: any) => {
    setAlteracoes(prev => ({ ...prev, [id]: valor }));
  };

  const handleCancel = () => {
    setAlteracoes({});
    carregarConfiguracoes();
  };

  const hasChanges = Object.keys(alteracoes).length > 0;

  const getConfiguracoesPorCategoria = (categoria: string) => {
    return configuracoes.filter(cfg => cfg.categoria === categoria);
  };

  const toggleSenha = (id: string) => {
    setShowSenha(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderInput = (config: Configuracao) => {
    const valor = alteracoes[config.id] !== undefined ? alteracoes[config.id] : config.valor;

    switch (config.tipo) {
      case 'boolean':
        return (
          <div className="flex items-center gap-3 mt-1">
            <button
              type="button"
              onClick={() => handleChange(config.id, !valor)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2',
                valor ? 'bg-gray-800' : 'bg-gray-300'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  valor ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
            <span className="text-sm text-gray-600">
              {valor ? 'Ativado' : 'Desativado'}
            </span>
          </div>
        );

      case 'select':
        return (
          <Select
            value={valor}
            onChange={(e) => handleChange(config.id, e.target.value)}
            options={config.opcoes || []}
            className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700"
          />
        );

      case 'password':
        return (
          <div className="relative">
            <Input
              type={showSenha[config.id] ? 'text' : 'password'}
              value={valor}
              onChange={(e) => handleChange(config.id, e.target.value)}
              className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 pr-10"
              rightIcon={
                <button
                  type="button"
                  onClick={() => toggleSenha(config.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showSenha[config.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
          </div>
        );

      case 'number':
        return (
          <Input
            type="number"
            value={valor}
            onChange={(e) => handleChange(config.id, Number(e.target.value))}
            className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={valor}
            onChange={(e) => handleChange(config.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all duration-200 min-h-[80px] resize-y"
          />
        );

      case 'color':
        return (
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={valor}
              onChange={(e) => handleChange(config.id, e.target.value)}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
            />
            <Input
              type="text"
              value={valor}
              onChange={(e) => handleChange(config.id, e.target.value)}
              className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 w-32"
            />
          </div>
        );

      default:
        return (
          <Input
            type="text"
            value={valor}
            onChange={(e) => handleChange(config.id, e.target.value)}
            className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700"
          />
        );
    }
  };

  // Mostrar loading
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Spinner size="xl" />
            <p className="mt-4 text-gray-500">Carregando configurações...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gray-100 rounded-full hidden sm:flex">
              <Settings className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Configurações</h1>
              <p className="text-sm text-gray-500 hidden sm:block">
                Gerencie as configurações do sistema
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={carregarConfiguracoes}
              leftIcon={<RefreshCw className="w-4 h-4" />}
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Recarregar
            </Button>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4 sm:hidden">
          Gerencie as configurações do sistema
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

        {/* Layout de Configurações */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar de categorias */}
          <div className="lg:w-64 flex-shrink-0">
            <Card className="border border-gray-100 shadow-sm sticky top-4">
              <CardBody className="p-2">
                <nav className="space-y-1">
                  {Object.entries(categorias).map(([key, value]) => {
                    const Icon = value.icon;
                    const count = getConfiguracoesPorCategoria(key).length;
                    return (
                      <button
                        key={key}
                        onClick={() => setCategoriaAtiva(key)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm',
                          categoriaAtiva === key
                            ? 'bg-gray-100 text-gray-800 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="flex-1 text-left">{value.label}</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </CardBody>
            </Card>
          </div>

          {/* Conteúdo */}
          <div className="flex-1">
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {categorias[categoriaAtiva as keyof typeof categorias]?.label || categoriaAtiva}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {categorias[categoriaAtiva as keyof typeof categorias]?.descricao || ''}
                    </p>
                  </div>
                  {hasChanges && (
                    <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                      {Object.keys(alteracoes).length} alterações pendentes
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardBody className="p-4 md:p-6">
                <div className="space-y-6">
                  {getConfiguracoesPorCategoria(categoriaAtiva).map((config) => {
                    const temAlteracao = alteracoes[config.id] !== undefined;
                    return (
                      <div key={config.id} className="space-y-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <label className="text-sm font-medium text-gray-700">
                              {config.descricao}
                              {config.obrigatorio && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                              {config.sensivel && (
                                <span className="ml-2 text-xs text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">
                                  Sensível
                                </span>
                              )}
                            </label>
                            {renderInput(config)}
                            <p className="text-xs text-gray-400 mt-1">
                              Chave: {config.chave}
                              {temAlteracao && (
                                <span className="ml-2 text-yellow-600">(alterado)</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Botões de ação */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={salvarConfiguracoes}
                      loading={saving}
                      disabled={!hasChanges}
                      leftIcon={<Save className="w-4 h-4" />}
                      className={cn(
                        'bg-gray-800 hover:bg-gray-900 text-white',
                        !hasChanges && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {saving ? 'Salvando...' : 'Salvar Configurações'}
                    </Button>
                    
                    {hasChanges && (
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={handleCancel}
                        className="border-gray-200 text-gray-600 hover:bg-gray-50"
                      >
                        Cancelar Alterações
                      </Button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}