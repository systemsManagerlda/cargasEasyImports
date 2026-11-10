/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/relatorios/page.tsx
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
  FileText, 
  Search, 
  X, 
  RefreshCw, 
  Download,
  Calendar,
  Filter,
  Trash2,
  FileSpreadsheet,
  FileCode,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// Tipos para Relatórios
interface Relatorio {
  relatorioId: string;
  tipo: string;
  titulo: string;
  descricao?: string;
  dataGeracao: string;
  geradoPor: {
    usuarioId: string;
    nome: string;
    perfil: string;
  };
  formato: 'pdf' | 'excel' | 'csv' | 'json';
  url: string;
  parametros?: any;
  tamanhoKB?: number;
}

// Dados mockados (substituir pela API)
const mockRelatorios: Relatorio[] = [
  {
    relatorioId: 'REL-001',
    tipo: 'transporte',
    titulo: 'Relatório de Transporte - Janeiro 2024',
    descricao: 'Relatório detalhado de todas as cargas transportadas em Janeiro',
    dataGeracao: '2024-02-01T10:00:00Z',
    geradoPor: {
      usuarioId: 'USR-001',
      nome: 'João Silva',
      perfil: 'administrador'
    },
    formato: 'pdf',
    url: '/relatorios/transporte-2024-01.pdf',
    tamanhoKB: 2450,
  },
  {
    relatorioId: 'REL-002',
    tipo: 'entrega',
    titulo: 'Relatório de Entregas - Janeiro 2024',
    descricao: 'Relatório de entregas realizadas e pendentes',
    dataGeracao: '2024-02-02T14:30:00Z',
    geradoPor: {
      usuarioId: 'USR-002',
      nome: 'Maria Santos',
      perfil: 'analista'
    },
    formato: 'excel',
    url: '/relatorios/entregas-2024-01.xlsx',
    tamanhoKB: 1890,
  },
  {
    relatorioId: 'REL-003',
    tipo: 'incidentes',
    titulo: 'Relatório de Incidentes - Janeiro 2024',
    descricao: 'Relatório de todos os incidentes reportados no período',
    dataGeracao: '2024-02-03T09:15:00Z',
    geradoPor: {
      usuarioId: 'USR-001',
      nome: 'João Silva',
      perfil: 'administrador'
    },
    formato: 'pdf',
    url: '/relatorios/incidentes-2024-01.pdf',
    tamanhoKB: 3200,
  },
  {
    relatorioId: 'REL-004',
    tipo: 'reclamacoes',
    titulo: 'Relatório de Reclamações - Dezembro 2023',
    descricao: 'Análise detalhada de reclamações de clientes',
    dataGeracao: '2024-01-05T11:00:00Z',
    geradoPor: {
      usuarioId: 'USR-003',
      nome: 'Carlos Andrade',
      perfil: 'suporte'
    },
    formato: 'csv',
    url: '/relatorios/reclamacoes-2023-12.csv',
    tamanhoKB: 560,
  },
  {
    relatorioId: 'REL-005',
    tipo: 'resumo',
    titulo: 'Resumo Geral - 2023',
    descricao: 'Resumo anual de todas as operações de transporte',
    dataGeracao: '2024-01-10T08:00:00Z',
    geradoPor: {
      usuarioId: 'USR-001',
      nome: 'João Silva',
      perfil: 'administrador'
    },
    formato: 'json',
    url: '/relatorios/resumo-2023.json',
    tamanhoKB: 120,
  },
];

// Opções para filtros
const tipoOptions = [
  { value: '', label: 'Todos os tipos' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'entrega', label: 'Entrega' },
  { value: 'incidentes', label: 'Incidentes' },
  { value: 'reclamacoes', label: 'Reclamações' },
  { value: 'resumo', label: 'Resumo' },
  { value: 'localizacao', label: 'Localização' },
  { value: 'atrasos', label: 'Atrasos' },
  { value: 'comprovativo', label: 'Comprovativo' },
];

const formatoOptions = [
  { value: '', label: 'Todos os formatos' },
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel' },
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
];

// Opções para gerar novo relatório
const gerarTipoOptions = [
  { value: 'transporte', label: 'Relatório de Transporte' },
  { value: 'entrega', label: 'Relatório de Entregas' },
  { value: 'incidentes', label: 'Relatório de Incidentes' },
  { value: 'reclamacoes', label: 'Relatório de Reclamações' },
  { value: 'resumo', label: 'Resumo Geral' },
  { value: 'localizacao', label: 'Relatório de Localização' },
  { value: 'atrasos', label: 'Relatório de Atrasos' },
];

const gerarFormatoOptions = [
  { value: 'pdf', label: 'PDF' },
  { value: 'excel', label: 'Excel' },
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
];

export default function RelatoriosPage() {
  const [loading, setLoading] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [formatoFilter, setFormatoFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showGerarModal, setShowGerarModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Estado para gerar novo relatório
  const [novoRelatorio, setNovoRelatorio] = useState({
    tipo: 'transporte',
    formato: 'pdf',
    dataInicio: '',
    dataFim: '',
    titulo: '',
    descricao: '',
  });

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    porTipo: {} as Record<string, number>,
    porFormato: {} as Record<string, number>,
    ultimoMes: 0,
  });

  // Ref para controlar se é o primeiro carregamento
  const isFirstRender = useRef(true);

  // Função para carregar relatórios
  const carregarRelatorios = async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Substituir pela chamada real da API
      // const response = await relatorioApi.getList(params);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      let filtered = [...mockRelatorios];
      
      if (searchTerm) {
        filtered = filtered.filter(r => 
          r.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.geradoPor.nome.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (tipoFilter) {
        filtered = filtered.filter(r => r.tipo === tipoFilter);
      }
      
      if (formatoFilter) {
        filtered = filtered.filter(r => r.formato === formatoFilter);
      }
      
      setRelatorios(filtered);
      setTotal(filtered.length);
      setTotalPages(Math.ceil(filtered.length / pageSize));
      
      // Calcular estatísticas
      const porTipo: Record<string, number> = {};
      const porFormato: Record<string, number> = {};
      let ultimoMes = 0;
      const dataAtual = new Date();
      const mesAtual = dataAtual.getMonth();
      const anoAtual = dataAtual.getFullYear();
      
      filtered.forEach(r => {
        porTipo[r.tipo] = (porTipo[r.tipo] || 0) + 1;
        porFormato[r.formato] = (porFormato[r.formato] || 0) + 1;
        
        const data = new Date(r.dataGeracao);
        if (data.getMonth() === mesAtual && data.getFullYear() === anoAtual) {
          ultimoMes++;
        }
      });
      
      setStats({
        total: filtered.length,
        porTipo,
        porFormato,
        ultimoMes,
      });
      
    } catch (err: any) {
      console.error('❌ Erro ao carregar relatórios:', err);
      setError(err.message || 'Erro ao carregar relatórios');
      setRelatorios([]);
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
      carregarRelatorios();
    }
  }, []);

  // Recarregar quando filtros mudarem (exceto no primeiro load)
  useEffect(() => {
    if (!isFirstRender.current) {
      carregarRelatorios();
    }
  }, [searchTerm, tipoFilter, formatoFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    carregarRelatorios();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setTipoFilter('');
    setFormatoFilter('');
    setShowFilters(false);
  };

  const aplicarFiltros = () => {
    carregarRelatorios();
  };

  const handleRefresh = () => {
    carregarRelatorios();
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const changePageSize = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    setTotalPages(Math.ceil(relatorios.length / size));
  };

  const handleGerarRelatorio = async (e: React.FormEvent) => {
    e.preventDefault();
    setGerando(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Substituir pela chamada real da API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const novo: Relatorio = {
        relatorioId: `REL-${String(mockRelatorios.length + 1).padStart(3, '0')}`,
        tipo: novoRelatorio.tipo,
        titulo: novoRelatorio.titulo || `Relatório de ${novoRelatorio.tipo} - ${new Date().toLocaleDateString('pt-MZ')}`,
        descricao: novoRelatorio.descricao || `Relatório gerado em ${new Date().toLocaleString('pt-MZ')}`,
        dataGeracao: new Date().toISOString(),
        geradoPor: {
          usuarioId: 'USR-001',
          nome: 'João Silva',
          perfil: 'administrador'
        },
        formato: novoRelatorio.formato as any,
        url: `/relatorios/${novoRelatorio.tipo}-${Date.now()}.${novoRelatorio.formato}`,
        tamanhoKB: Math.floor(Math.random() * 3000) + 100,
      };
      
      setRelatorios(prev => [novo, ...prev]);
      setTotal(prev => prev + 1);
      setSuccess(`Relatório "${novo.titulo}" gerado com sucesso!`);
      
      setShowGerarModal(false);
      setNovoRelatorio({
        tipo: 'transporte',
        formato: 'pdf',
        dataInicio: '',
        dataFim: '',
        titulo: '',
        descricao: '',
      });
      
      setTimeout(() => setSuccess(null), 5000);
      
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar relatório');
    } finally {
      setGerando(false);
    }
  };

  const handleDownload = (relatorio: Relatorio) => {
    // Simular download
    console.log('📥 Baixando relatório:', relatorio.titulo);
    alert(`Download do relatório "${relatorio.titulo}" iniciado!`);
  };

  const handleDelete = (relatorioId: string) => {
    if (confirm('Tem certeza que deseja excluir este relatório?')) {
      setRelatorios(prev => prev.filter(r => r.relatorioId !== relatorioId));
      setTotal(prev => prev - 1);
    }
  };

  const getFormatoIcon = (formato: string) => {
    switch (formato) {
      case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
      case 'excel': return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
      case 'csv': return <FileCode className="w-4 h-4 text-blue-500" />;
      case 'json': return <FileCode className="w-4 h-4 text-yellow-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getFormatoLabel = (formato: string) => {
    switch (formato) {
      case 'pdf': return 'PDF';
      case 'excel': return 'Excel';
      case 'csv': return 'CSV';
      case 'json': return 'JSON';
      default: return formato;
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      transporte: 'Transporte',
      entrega: 'Entrega',
      incidentes: 'Incidentes',
      reclamacoes: 'Reclamações',
      resumo: 'Resumo Geral',
      localizacao: 'Localização',
      atrasos: 'Atrasos',
      comprovativo: 'Comprovativo',
    };
    return labels[tipo] || tipo;
  };

  // Mostrar loading
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Spinner size="xl" />
            <p className="mt-4 text-gray-500">Carregando relatórios...</p>
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
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Relatórios</h1>
              <p className="text-sm text-gray-500 hidden sm:block">
                Gerencie e gere relatórios do sistema
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-500 hidden sm:flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-gray-400" />
              <span>{stats.total} relatórios</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<Filter className="w-4 h-4" />}
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Filtros
              {(tipoFilter || formatoFilter) && (
                <span className="ml-1 px-1.5 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                  {(tipoFilter ? 1 : 0) + (formatoFilter ? 1 : 0)}
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
            
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowGerarModal(true)}
              leftIcon={<Plus className="w-4 h-4" />}
              className="bg-gray-800 hover:bg-gray-900 text-white"
            >
              Gerar Relatório
            </Button>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4 sm:hidden">
          Gerencie e gere relatórios do sistema
        </p>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Total"
            value={stats.total}
            icon={<FileText className="w-4 h-4" />}
            color="gray"
          />
          <StatCard
            label="Este Mês"
            value={stats.ultimoMes}
            icon={<Calendar className="w-4 h-4" />}
            color="blue"
          />
          <StatCard
            label="PDF"
            value={stats.porFormato.pdf || 0}
            icon={<FileText className="w-4 h-4" />}
            color="red"
          />
          <StatCard
            label="Excel"
            value={stats.porFormato.excel || 0}
            icon={<FileSpreadsheet className="w-4 h-4" />}
            color="green"
          />
        </div>

        {/* Painel de Filtros */}
        {(showFilters || tipoFilter || formatoFilter) && (
          <Card className="mb-6 border border-gray-100 shadow-sm">
            <CardBody className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <form onSubmit={handleSearch} className="relative">
                    <Input
                      placeholder="Pesquisar relatórios..."
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
                    label="Formato"
                    options={formatoOptions}
                    value={formatoFilter}
                    onChange={(e) => setFormatoFilter(e.target.value)}
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

        {/* VERIFICAR SE NÃO HÁ RELATÓRIOS */}
        {relatorios.length === 0 ? (
          <Card className="border border-gray-100 shadow-sm">
            <CardBody className="py-16 px-4 text-center">
              <div className="flex flex-col items-center max-w-md mx-auto">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                  <FileText className="w-16 h-16 text-gray-400" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Nenhum relatório encontrado
                </h3>
                
                <p className="text-sm text-gray-500 mb-6">
                  {searchTerm || tipoFilter || formatoFilter 
                    ? 'Não há relatórios que correspondam aos filtros aplicados. Tente ajustar os filtros ou limpar a pesquisa.'
                    : 'Não há relatórios gerados. Clique em "Gerar Relatório" para criar o primeiro.'
                  }
                </p>
                
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {(searchTerm || tipoFilter || formatoFilter) && (
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
                    variant="primary"
                    size="md"
                    onClick={() => setShowGerarModal(true)}
                    leftIcon={<Plus className="w-4 h-4" />}
                    className="bg-gray-800 hover:bg-gray-900 text-white"
                  >
                    Gerar Relatório
                  </Button>
                  
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
              {relatorios.map((relatorio) => (
                <RelatorioCardMobile 
                  key={relatorio.relatorioId} 
                  relatorio={relatorio}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Tabela Desktop */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-100 shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Formato</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Gerado por</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Tamanho</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {relatorios.map((relatorio) => (
                    <RelatorioRow 
                      key={relatorio.relatorioId} 
                      relatorio={relatorio}
                      onDownload={handleDownload}
                      onDelete={handleDelete}
                      getFormatoIcon={getFormatoIcon}
                      getTipoLabel={getTipoLabel}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100 mt-4">
              <div className="text-sm text-gray-500">
                Mostrando <span className="font-medium text-gray-700">{relatorios.length}</span> de{' '}
                <span className="font-medium text-gray-700">{total}</span> relatórios
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

      {/* Modal de Gerar Relatório */}
      {showGerarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">Gerar Novo Relatório</h2>
              </div>
              <button
                onClick={() => setShowGerarModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo */}
            <form onSubmit={handleGerarRelatorio} className="p-4 space-y-4">
              <Select
                label="Tipo de Relatório *"
                options={gerarTipoOptions}
                value={novoRelatorio.tipo}
                onChange={(e) => setNovoRelatorio({ ...novoRelatorio, tipo: e.target.value })}
                required
                className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700"
              />

              <Select
                label="Formato *"
                options={gerarFormatoOptions}
                value={novoRelatorio.formato}
                onChange={(e) => setNovoRelatorio({ ...novoRelatorio, formato: e.target.value })}
                required
                className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Data Início"
                  type="date"
                  value={novoRelatorio.dataInicio}
                  onChange={(e) => setNovoRelatorio({ ...novoRelatorio, dataInicio: e.target.value })}
                  className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700"
                />
                <Input
                  label="Data Fim"
                  type="date"
                  value={novoRelatorio.dataFim}
                  onChange={(e) => setNovoRelatorio({ ...novoRelatorio, dataFim: e.target.value })}
                  className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700"
                />
              </div>

              <Input
                label="Título (opcional)"
                value={novoRelatorio.titulo}
                onChange={(e) => setNovoRelatorio({ ...novoRelatorio, titulo: e.target.value })}
                placeholder="Ex: Relatório de Transporte - Janeiro 2024"
                className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
              />

              <Input
                label="Descrição (opcional)"
                value={novoRelatorio.descricao}
                onChange={(e) => setNovoRelatorio({ ...novoRelatorio, descricao: e.target.value })}
                placeholder="Breve descrição do relatório"
                className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
              />

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={gerando}
                  fullWidth
                  className="bg-gray-800 hover:bg-gray-900 text-white"
                >
                  {gerando ? 'Gerando...' : 'Gerar Relatório'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => setShowGerarModal(false)}
                  className="border-gray-200 text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}

// ================================================================
// COMPONENTES
// ================================================================

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'gray';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    gray: 'bg-gray-50 text-gray-600',
  };

  return (
    <div className={cn('p-4 rounded-lg border border-gray-100', colors[color])}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {icon}
      </div>
      <span className="text-2xl font-bold mt-1 block">{value}</span>
    </div>
  );
};

const RelatorioRow: React.FC<{
  relatorio: Relatorio;
  onDownload: (relatorio: Relatorio) => void;
  onDelete: (id: string) => void;
  getFormatoIcon: (formato: string) => React.ReactNode;
  getTipoLabel: (tipo: string) => string;
}> = ({ relatorio, onDownload, onDelete, getFormatoIcon, getTipoLabel }) => {
  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4">
        <div>
          <span className="text-sm font-medium text-gray-800">{relatorio.titulo}</span>
          {relatorio.descricao && (
            <p className="text-xs text-gray-500 truncate max-w-[200px]">{relatorio.descricao}</p>
          )}
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-gray-600 capitalize">{getTipoLabel(relatorio.tipo)}</span>
      </td>
      <td className="py-3 px-4">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
          {getFormatoIcon(relatorio.formato)}
          {relatorio.formato.toUpperCase()}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-gray-600">{relatorio.geradoPor.nome}</span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-gray-500">
          {new Date(relatorio.dataGeracao).toLocaleDateString('pt-MZ')}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-gray-500">
          {relatorio.tamanhoKB ? `${(relatorio.tamanhoKB / 1024).toFixed(1)} MB` : '-'}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-400 hover:text-blue-600 hover:bg-blue-50 p-1.5"
            onClick={() => onDownload(relatorio)}
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5"
            onClick={() => onDelete(relatorio.relatorioId)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

const RelatorioCardMobile: React.FC<{
  relatorio: Relatorio;
  onDownload: (relatorio: Relatorio) => void;
  onDelete: (id: string) => void;
}> = ({ relatorio, onDownload, onDelete }) => {
  const getFormatoIcon = (formato: string) => {
    switch (formato) {
      case 'pdf': return <FileText className="w-4 h-4 text-red-500" />;
      case 'excel': return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
      case 'csv': return <FileCode className="w-4 h-4 text-blue-500" />;
      case 'json': return <FileCode className="w-4 h-4 text-yellow-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <CardBody className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-800">{relatorio.titulo}</h3>
            {relatorio.descricao && (
              <p className="text-xs text-gray-500">{relatorio.descricao}</p>
            )}
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
            {getFormatoIcon(relatorio.formato)}
            {relatorio.formato.toUpperCase()}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-1 text-xs text-gray-500 mt-2">
          <div>
            <span className="font-medium">Tipo:</span> {relatorio.tipo}
          </div>
          <div>
            <span className="font-medium">Gerado por:</span> {relatorio.geradoPor.nome}
          </div>
          <div>
            <span className="font-medium">Data:</span> {new Date(relatorio.dataGeracao).toLocaleDateString('pt-MZ')}
          </div>
          <div>
            <span className="font-medium">Tamanho:</span> {relatorio.tamanhoKB ? `${(relatorio.tamanhoKB / 1024).toFixed(1)} MB` : '-'}
          </div>
        </div>
        
        <div className="flex items-center justify-end mt-3 pt-3 border-t border-gray-100 gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-400 hover:text-blue-600 hover:bg-blue-50 p-1.5"
            onClick={() => onDownload(relatorio)}
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5"
            onClick={() => onDelete(relatorio.relatorioId)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};