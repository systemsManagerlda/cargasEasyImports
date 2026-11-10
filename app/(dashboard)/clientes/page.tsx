/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/clientes/page.tsx
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
import { clienteApi, Cliente } from '@/lib/api/clientes';
import { 
  Users, 
  Search, 
  X, 
  RefreshCw, 
  Plus,
  SlidersHorizontal,
  Phone,
  Mail,
  MapPin,
  Building,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  UserCircle,
  UserPlus
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'true', label: 'Ativo' },
  { value: 'false', label: 'Inativo' },
];

const provinciaOptions = [
  { value: '', label: 'Todas as províncias' },
  { value: 'Maputo', label: 'Maputo' },
  { value: 'Maputo Província', label: 'Maputo Província' },
  { value: 'Gaza', label: 'Gaza' },
  { value: 'Inhambane', label: 'Inhambane' },
  { value: 'Sofala', label: 'Sofala' },
  { value: 'Manica', label: 'Manica' },
  { value: 'Tete', label: 'Tete' },
  { value: 'Zambézia', label: 'Zambézia' },
  { value: 'Nampula', label: 'Nampula' },
  { value: 'Cabo Delgado', label: 'Cabo Delgado' },
  { value: 'Niassa', label: 'Niassa' },
];

export default function ClientesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [provinciaFilter, setProvinciaFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Ref para controlar se é o primeiro carregamento
  const isFirstRender = useRef(true);

  // Função para carregar clientes
  const carregarClientes = async () => {
    setLoading(true);
    setError(null);

    try {
      const params: any = {
        curPage: currentPage,
        pageSize: pageSize,
      };

      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.ativo = statusFilter === 'true';
      if (provinciaFilter) params.provincia = provinciaFilter;

      console.log('📦 Carregando clientes com params:', params);

      const response = await clienteApi.getList(params);

      console.log('📦 Resposta da API:', response);

      if (response.returnCode === 200) {
        setClientes(response.data.list || []);
        setTotal(response.data.totalCount || 0);
        setTotalPages(response.data.totalPage || 1);
      } else {
        setError(response.returnMsg || 'Erro ao carregar clientes');
        setClientes([]);
        setTotal(0);
        setTotalPages(1);
      }
    } catch (err: any) {
      console.error('❌ Erro ao carregar clientes:', err);
      setError(err.message || 'Erro ao carregar clientes');
      setClientes([]);
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
      carregarClientes();
    }
  }, []);

  // Recarregar quando página ou filtros mudarem (exceto no primeiro load)
  useEffect(() => {
    if (!isFirstRender.current) {
      carregarClientes();
    }
  }, [currentPage, pageSize, searchTerm, statusFilter, provinciaFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setProvinciaFilter('');
    setShowFilters(false);
    setCurrentPage(1);
  };

  const aplicarFiltros = () => {
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    carregarClientes();
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const changePageSize = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Mostrar loading
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Spinner size="xl" />
            <p className="mt-4 text-gray-500">Carregando clientes...</p>
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
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Clientes</h1>
              <p className="text-sm text-gray-500 hidden sm:block">
                Gerencie todos os clientes do sistema
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-500 hidden sm:flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              <span>{total} clientes</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Filtros
              {(statusFilter || provinciaFilter) && (
                <span className="ml-1 px-1.5 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                  {(statusFilter ? 1 : 0) + (provinciaFilter ? 1 : 0)}
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
            
            <Link href="/register?perfil=cliente&from=clientes">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                className="bg-gray-800 hover:bg-gray-900 text-white"
              >
                Novo Cliente
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4 sm:hidden">
          Gerencie todos os clientes do sistema
        </p>

        {/* Painel de Filtros */}
        {(showFilters || statusFilter || provinciaFilter) && (
          <Card className="mb-6 border border-gray-100 shadow-sm">
            <CardBody className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <form onSubmit={handleSearch} className="relative">
                    <Input
                      placeholder="Pesquisar clientes..."
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
                    label="Status"
                    options={statusOptions}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 min-w-[140px]"
                    containerClassName="flex-1 md:flex-none"
                  />
                  
                  <Select
                    label="Província"
                    options={provinciaOptions}
                    value={provinciaFilter}
                    onChange={(e) => setProvinciaFilter(e.target.value)}
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

        {/* VERIFICAR SE NÃO HÁ CLIENTES */}
        {clientes.length === 0 ? (
          <Card className="border border-gray-100 shadow-sm">
            <CardBody className="py-16 px-4 text-center">
              <div className="flex flex-col items-center max-w-md mx-auto">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                  <Users className="w-16 h-16 text-gray-400" />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Nenhum cliente encontrado
                </h3>
                
                <p className="text-sm text-gray-500 mb-6">
                  {searchTerm || statusFilter || provinciaFilter 
                    ? 'Não há clientes que correspondam aos filtros aplicados. Tente ajustar os filtros ou limpar a pesquisa.'
                    : 'Não há clientes registrados no sistema. Clique no botão abaixo para adicionar o primeiro cliente.'
                  }
                </p>
                
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {(searchTerm || statusFilter || provinciaFilter) && (
                    <Button
                      variant="outline"
                      size="md"
                      onClick={handleClearFilters}
                      className="border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      Limpar filtros
                    </Button>
                  )}
                  
                  <Link href="/register?perfil=cliente&from=clientes">
                    <Button
                      variant="primary"
                      size="md"
                      leftIcon={<UserPlus className="w-4 h-4" />}
                      className="bg-gray-800 hover:bg-gray-900 text-white"
                    >
                      Novo Cliente
                    </Button>
                  </Link>
                  
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
              {clientes.map((cliente) => (
                <ClienteCardMobile key={cliente.clienteId} cliente={cliente} />
              ))}
            </div>

            {/* Tabela Desktop */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-100 shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <ClienteRow key={cliente.clienteId} cliente={cliente} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100 mt-4">
              <div className="text-sm text-gray-500">
                Mostrando <span className="font-medium text-gray-700">{clientes.length}</span> de{' '}
                <span className="font-medium text-gray-700">{total}</span> clientes
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
    </ProtectedRoute>
  );
}

// ================================================================
// COMPONENTES
// ================================================================

const ClienteRow: React.FC<{ cliente: Cliente }> = ({ cliente }) => {
  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
      <td className="py-3 px-4">
        <span className="font-mono text-sm text-gray-600">{cliente.clienteId}</span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm font-medium text-gray-800">{cliente.nome}</span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-gray-600">{cliente.email}</span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-gray-600">{cliente.telefone}</span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-gray-600">{cliente.cidade || '-'}</span>
      </td>
      <td className="py-3 px-4">
        <span className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full',
          cliente.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        )}>
          {cliente.ativo ? (
            <><CheckCircle className="w-3 h-3" /> Ativo</>
          ) : (
            <><XCircle className="w-3 h-3" /> Inativo</>
          )}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

const ClienteCardMobile: React.FC<{ cliente: Cliente }> = ({ cliente }) => {
  return (
    <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <CardBody className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <UserCircle className="w-8 h-8 text-gray-400" />
            <div>
              <h3 className="text-sm font-medium text-gray-800">{cliente.nome}</h3>
              <p className="text-xs text-gray-500">{cliente.clienteId}</p>
            </div>
          </div>
          <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full',
            cliente.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          )}>
            {cliente.ativo ? 'Ativo' : 'Inativo'}
          </span>
        </div>
        
        <div className="space-y-1 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Mail className="w-3 h-3" />
            <span>{cliente.email}</span>
          </div>
          <div className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            <span>{cliente.telefone}</span>
          </div>
          <div className="flex items-center gap-1">
            <Building className="w-3 h-3" />
            <span>NIF: {cliente.nif}</span>
          </div>
          {cliente.cidade && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{cliente.cidade}, {cliente.provincia || ''}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-end mt-3 pt-3 border-t border-gray-100 gap-1">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};