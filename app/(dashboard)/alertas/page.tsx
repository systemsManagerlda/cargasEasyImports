/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/alertas/page.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardBody } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { Pagination } from '@/components/ui/Pagination';
import { 
  AlertTriangle, 
  Search, 
  X, 
  RefreshCw, 
  Bell,
  BellOff,
  CheckCircle,
  Clock,
  AlertCircle,
  Info,
  SlidersHorizontal,
  Eye,
  Check,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

// Tipos para Alertas
interface Alerta {
  alertaId: string;
  tipo: string;
  gravidade: 'baixa' | 'media' | 'alta' | 'critica';
  mensagem: string;
  dataHora: string;
  cargaId?: string;
  cargaCodigo?: string;
  cargaDescricao?: string;
  resolvido: boolean;
  resolvidoEm?: string;
  resolvidoPor?: string;
  acaoTomada?: string;
}

// Dados mockados (substituir pela API)
const mockAlertas: Alerta[] = [
  {
    alertaId: 'ALT-001',
    tipo: 'atraso',
    gravidade: 'alta',
    mensagem: 'Carga TRK-123 está com atraso de 2 horas na rota Beira-Maputo',
    dataHora: '2024-01-15T14:30:00Z',
    cargaId: 'CAR-001',
    cargaCodigo: 'TRK-123',
    cargaDescricao: 'Transporte de mercadorias',
    resolvido: false,
  },
  {
    alertaId: 'ALT-002',
    tipo: 'incidente',
    gravidade: 'critica',
    mensagem: 'Incidente reportado na carga TRK-456 - Acidente na EN1',
    dataHora: '2024-01-15T12:00:00Z',
    cargaId: 'CAR-002',
    cargaCodigo: 'TRK-456',
    cargaDescricao: 'Carga de produtos perigosos',
    resolvido: false,
  },
  {
    alertaId: 'ALT-003',
    tipo: 'desvio_rota',
    gravidade: 'media',
    mensagem: 'Carga TRK-789 desviou da rota planejada em 15km',
    dataHora: '2024-01-14T10:00:00Z',
    cargaId: 'CAR-003',
    cargaCodigo: 'TRK-789',
    cargaDescricao: 'Materiais de construção',
    resolvido: true,
    resolvidoEm: '2024-01-14T16:00:00Z',
    resolvidoPor: 'Admin',
    acaoTomada: 'Rota corrigida',
  },
  {
    alertaId: 'ALT-004',
    tipo: 'paragem_prolongada',
    gravidade: 'baixa',
    mensagem: 'Carga TRK-321 parada há mais de 30 minutos no posto de controlo',
    dataHora: '2024-01-13T08:00:00Z',
    cargaId: 'CAR-004',
    cargaCodigo: 'TRK-321',
    cargaDescricao: 'Produtos alimentares',
    resolvido: false,
  },
  {
    alertaId: 'ALT-005',
    tipo: 'fronteira',
    gravidade: 'media',
    mensagem: 'Carga TRK-654 aguardando liberação na fronteira de Ressano Garcia',
    dataHora: '2024-01-12T09:00:00Z',
    cargaId: 'CAR-005',
    cargaCodigo: 'TRK-654',
    cargaDescricao: 'Mercadorias diversas',
    resolvido: true,
    resolvidoEm: '2024-01-12T15:00:00Z',
    resolvidoPor: 'Admin',
    acaoTomada: 'Documentação regularizada',
  },
];

// Opções para filtros
const tipoOptions = [
  { value: '', label: 'Todos os tipos' },
  { value: 'atraso', label: 'Atraso' },
  { value: 'incidente', label: 'Incidente' },
  { value: 'desvio_rota', label: 'Desvio de Rota' },
  { value: 'paragem_prolongada', label: 'Paragem Prolongada' },
  { value: 'fronteira', label: 'Fronteira' },
  { value: 'porto', label: 'Porto' },
  { value: 'manutencao', label: 'Manutenção' },
  { value: 'roubo', label: 'Roubo' },
  { value: 'danos_carga', label: 'Danos à Carga' },
];

const gravidadeOptions = [
  { value: '', label: 'Todas as gravidades' },
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'critica', label: 'Crítica' },
];

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'pendente', label: 'Pendentes' },
  { value: 'resolvido', label: 'Resolvidos' },
];

export default function AlertasPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [gravidadeFilter, setGravidadeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedAlerta, setSelectedAlerta] = useState<Alerta | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Ref para controlar se é o primeiro carregamento
  const isFirstRender = useRef(true);

  // Função para carregar alertas
  const carregarAlertas = async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Substituir pela chamada real da API
      // const response = await alertaApi.getList(params);
      
      // Simulação com dados mockados
      await new Promise(resolve => setTimeout(resolve, 800));
      
      let filtered = [...mockAlertas];
      
      if (searchTerm) {
        filtered = filtered.filter(a => 
          a.mensagem.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.cargaCodigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.cargaDescricao?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (tipoFilter) {
        filtered = filtered.filter(a => a.tipo === tipoFilter);
      }
      
      if (gravidadeFilter) {
        filtered = filtered.filter(a => a.gravidade === gravidadeFilter);
      }
      
      if (statusFilter === 'pendente') {
        filtered = filtered.filter(a => !a.resolvido);
      } else if (statusFilter === 'resolvido') {
        filtered = filtered.filter(a => a.resolvido);
      }
      
      setAlertas(filtered);
      setTotal(filtered.length);
      setTotalPages(Math.ceil(filtered.length / pageSize));
      
    } catch (err: any) {
      console.error('❌ Erro ao carregar alertas:', err);
      setError(err.message || 'Erro ao carregar alertas');
      setAlertas([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados iniciais - apenas na montagem
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      carregarAlertas();
    }
  }, []);

  // Recarregar quando filtros mudarem (exceto no primeiro load)
  useEffect(() => {
    if (!isFirstRender.current) {
      carregarAlertas();
    }
  }, [searchTerm, tipoFilter, gravidadeFilter, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    carregarAlertas();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setTipoFilter('');
    setGravidadeFilter('');
    setStatusFilter('');
    setShowFilters(false);
  };

  const aplicarFiltros = () => {
    carregarAlertas();
  };

  const handleRefresh = () => {
    carregarAlertas();
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const changePageSize = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    setTotalPages(Math.ceil(alertas.length / size));
  };

  const handleViewDetail = (alerta: Alerta) => {
    setSelectedAlerta(alerta);
    setShowDetail(true);
  };

  const handleResolve = (alertaId: string) => {
    setAlertas(prev => prev.map(a => 
      a.alertaId === alertaId 
        ? { ...a, resolvido: true, resolvidoEm: new Date().toISOString(), resolvidoPor: 'Admin' }
        : a
    ));
  };

  // Mostrar loading
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Spinner size="xl" />
            <p className="mt-4 text-gray-500">Carregando alertas...</p>
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
              <AlertTriangle className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Alertas</h1>
              <p className="text-sm text-gray-500 hidden sm:block">
                Gerencie todos os alertas do sistema
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-500 hidden sm:flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-gray-400" />
              <span>{alertas.filter(a => !a.resolvido).length} pendentes</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Filtros
              {(tipoFilter || gravidadeFilter || statusFilter) && (
                <span className="ml-1 px-1.5 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                  {(tipoFilter ? 1 : 0) + (gravidadeFilter ? 1 : 0) + (statusFilter ? 1 : 0)}
                </span>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              leftIcon={<RefreshCw className="w-4 h-4" />}
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
            />
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4 sm:hidden">
          Gerencie todos os alertas do sistema
        </p>

        {/* Painel de Filtros */}
        {(showFilters || tipoFilter || gravidadeFilter || statusFilter) && (
          <Card className="mb-6 border border-gray-100 shadow-sm">
            <CardBody className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <form onSubmit={handleSearch} className="relative">
                    <Input
                      placeholder="Pesquisar alertas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400 pr-10"
                      leftIcon={<Search className="w-4 h-4 text-gray-400" />}
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </form>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Select
                    label="Tipo"
                    options={tipoOptions}
                    value={tipoFilter}
                    onChange={(e) => setTipoFilter(e.target.value)}
                    className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 min-w-[140px]"
                    containerClassName="flex-1 md:flex-none"
                  />
                  
                  <Select
                    label="Gravidade"
                    options={gravidadeOptions}
                    value={gravidadeFilter}
                    onChange={(e) => setGravidadeFilter(e.target.value)}
                    className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 min-w-[140px]"
                    containerClassName="flex-1 md:flex-none"
                  />

                  <Select
                    label="Status"
                    options={statusOptions}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 min-w-[140px]"
                    containerClassName="flex-1 md:flex-none"
                  />
                </div>

                <div className="flex items-end gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={aplicarFiltros}
                    className="bg-gray-800 hover:bg-gray-900 text-white"
                  >
                    Aplicar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    Limpar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Erro */}
        {error && (
          <Alert variant="danger" className="mb-4" dismissible onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* VERIFICAR SE NÃO HÁ ALERTAS */}
        {alertas.length === 0 ? (
          <Card className="border border-gray-100 shadow-sm">
            <CardBody className="py-16 px-4 text-center">
              <div className="flex flex-col items-center max-w-md mx-auto">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                  <Bell className="w-16 h-16 text-gray-400" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Nenhum alerta encontrado
                </h3>
                
                <p className="text-sm text-gray-500 mb-6">
                  {searchTerm || tipoFilter || gravidadeFilter || statusFilter 
                    ? 'Não há alertas que correspondam aos filtros aplicados. Tente ajustar os filtros ou limpar a pesquisa.'
                    : 'Não há alertas registrados no sistema. Todos os transportes estão ocorrendo normalmente.'
                  }
                </p>
                
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {(searchTerm || tipoFilter || gravidadeFilter || statusFilter) && (
                    <Button
                      variant="outline"
                      size="md"
                      onClick={handleClearFilters}
                      className="border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      Limpar filtros
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={handleRefresh}
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Atualizar
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ) : (
          <>
            {/* Cards Mobile */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {alertas.map((alerta) => (
                <AlertaCardMobile 
                  key={alerta.alertaId} 
                  alerta={alerta} 
                  onViewDetail={handleViewDetail}
                  onResolve={handleResolve}
                />
              ))}
            </div>

            {/* Tabela Desktop */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-100 shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Mensagem</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Gravidade</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {alertas.map((alerta) => (
                    <AlertaRow 
                      key={alerta.alertaId} 
                      alerta={alerta} 
                      onViewDetail={handleViewDetail}
                      onResolve={handleResolve}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100 mt-4">
              <div className="text-sm text-gray-500">
                Mostrando <span className="font-medium text-gray-700">{alertas.length}</span> de{' '}
                <span className="font-medium text-gray-700">{total}</span> alertas
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Por página:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => changePageSize(Number(e.target.value))}
                    className="px-2 py-1 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    {[5, 10, 25, 50].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
                
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                    size="sm"
                    showFirstLast={true}
                    className="flex-wrap"
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de Detalhes */}
      {showDetail && selectedAlerta && (
        <AlertaDetailModal 
          alerta={selectedAlerta} 
          onClose={() => setShowDetail(false)}
          onResolve={handleResolve}
        />
      )}
    </ProtectedRoute>
  );
}

// ================================================================
// COMPONENTES
// ================================================================

const AlertaRow: React.FC<{ 
  alerta: Alerta; 
  onViewDetail: (alerta: Alerta) => void;
  onResolve: (id: string) => void;
}> = ({ alerta, onViewDetail, onResolve }) => {
  const gravidadeColors = {
    baixa: 'bg-blue-100 text-blue-700',
    media: 'bg-yellow-100 text-yellow-700',
    alta: 'bg-orange-100 text-orange-700',
    critica: 'bg-red-100 text-red-700',
  };

  const gravidadeIcons = {
    baixa: <Info className="w-3 h-3" />,
    media: <AlertCircle className="w-3 h-3" />,
    alta: <AlertTriangle className="w-3 h-3" />,
    critica: <AlertTriangle className="w-3 h-3" />,
  };

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4">
        <span className="font-mono text-sm text-gray-600">{alerta.alertaId}</span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-gray-700 capitalize">{alerta.tipo}</span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-gray-600 truncate max-w-[200px] block">
          {alerta.mensagem}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className={cn(
          'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full',
          gravidadeColors[alerta.gravidade]
        )}>
          {gravidadeIcons[alerta.gravidade]}
          {alerta.gravidade}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full',
          alerta.resolvido ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        )}>
          {alerta.resolvido ? (
            <><CheckCircle className="w-3 h-3" /> Resolvido</>
          ) : (
            <><Clock className="w-3 h-3" /> Pendente</>
          )}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-gray-500">
          {new Date(alerta.dataHora).toLocaleDateString('pt-MZ')}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5"
            onClick={() => onViewDetail(alerta)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {!alerta.resolvido && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-green-400 hover:text-green-600 hover:bg-green-50 p-1.5"
              onClick={() => onResolve(alerta.alertaId)}
            >
              <Check className="w-4 h-4" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
};

const AlertaCardMobile: React.FC<{ 
  alerta: Alerta; 
  onViewDetail: (alerta: Alerta) => void;
  onResolve: (id: string) => void;
}> = ({ alerta, onViewDetail, onResolve }) => {
  const gravidadeColors = {
    baixa: 'bg-blue-100 text-blue-700',
    media: 'bg-yellow-100 text-yellow-700',
    alta: 'bg-orange-100 text-orange-700',
    critica: 'bg-red-100 text-red-700',
  };

  const gravidadeIcons = {
    baixa: <Info className="w-3 h-3" />,
    media: <AlertCircle className="w-3 h-3" />,
    alta: <AlertTriangle className="w-3 h-3" />,
    critica: <AlertTriangle className="w-3 h-3" />,
  };

  return (
    <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <CardBody className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full',
              gravidadeColors[alerta.gravidade]
            )}>
              {gravidadeIcons[alerta.gravidade]}
              {alerta.gravidade}
            </span>
            <span className="text-xs text-gray-500 capitalize">{alerta.tipo}</span>
          </div>
          <span className={cn(
            'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full',
            alerta.resolvido ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          )}>
            {alerta.resolvido ? 'Resolvido' : 'Pendente'}
          </span>
        </div>
        
        <p className="text-sm text-gray-700 mb-2">{alerta.mensagem}</p>
        
        {alerta.cargaCodigo && (
          <div className="text-xs text-gray-500">
            Carga: <span className="font-medium">{alerta.cargaCodigo}</span>
            {alerta.cargaDescricao && ` - ${alerta.cargaDescricao}`}
          </div>
        )}
        
        <div className="text-xs text-gray-400 mt-1">
          {new Date(alerta.dataHora).toLocaleString('pt-MZ')}
        </div>
        
        <div className="flex items-center justify-end mt-3 pt-3 border-t border-gray-100 gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5"
            onClick={() => onViewDetail(alerta)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {!alerta.resolvido && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-green-400 hover:text-green-600 hover:bg-green-50 p-1.5"
              onClick={() => onResolve(alerta.alertaId)}
            >
              <Check className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

// ================================================================
// MODAL DE DETALHES DO ALERTA
// ================================================================

interface AlertaDetailModalProps {
  alerta: Alerta;
  onClose: () => void;
  onResolve: (id: string) => void;
}

const AlertaDetailModal: React.FC<AlertaDetailModalProps> = ({ alerta, onClose, onResolve }) => {
  const gravidadeColors = {
    baixa: 'bg-blue-100 text-blue-700 border-blue-200',
    media: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    alta: 'bg-orange-100 text-orange-700 border-orange-200',
    critica: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Detalhes do Alerta</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500">ID do Alerta</label>
              <p className="text-sm text-gray-800 font-mono">{alerta.alertaId}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Status</label>
              <p className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full',
                alerta.resolvido ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              )}>
                {alerta.resolvido ? 'Resolvido' : 'Pendente'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Tipo</label>
              <p className="text-sm text-gray-800 capitalize">{alerta.tipo}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Gravidade</label>
              <p className={cn(
                'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full',
                gravidadeColors[alerta.gravidade]
              )}>
                {alerta.gravidade}
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500">Mensagem</label>
            <p className="text-sm text-gray-800 p-3 bg-gray-50 rounded-lg">{alerta.mensagem}</p>
          </div>

          {alerta.cargaId && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500">Código da Carga</label>
                <p className="text-sm text-gray-800 font-mono">{alerta.cargaCodigo}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500">Descrição</label>
                <p className="text-sm text-gray-800">{alerta.cargaDescricao}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Data e Hora</label>
              <p className="text-sm text-gray-800">
                {new Date(alerta.dataHora).toLocaleString('pt-MZ')}
              </p>
            </div>
            {alerta.resolvido && (
              <div>
                <label className="text-xs font-medium text-gray-500">Resolvido em</label>
                <p className="text-sm text-gray-800">
                  {alerta.resolvidoEm ? new Date(alerta.resolvidoEm).toLocaleString('pt-MZ') : '-'}
                </p>
              </div>
            )}
          </div>

          {alerta.acaoTomada && (
            <div>
              <label className="text-xs font-medium text-gray-500">Ação Tomada</label>
              <p className="text-sm text-gray-800 p-3 bg-gray-50 rounded-lg">{alerta.acaoTomada}</p>
            </div>
          )}

          {alerta.resolvidoPor && (
            <div>
              <label className="text-xs font-medium text-gray-500">Resolvido por</label>
              <p className="text-sm text-gray-800">{alerta.resolvidoPor}</p>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
          {!alerta.resolvido && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onResolve(alerta.alertaId);
                onClose();
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="w-4 h-4 mr-1" />
              Marcar como Resolvido
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};