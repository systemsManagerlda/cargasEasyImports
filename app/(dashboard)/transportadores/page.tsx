/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { ProtectedRoute } from '../../../components/common/ProtectedRoute';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Card, CardBody } from '../../../components/ui/Card';
import { Spinner } from '../../../components/ui/Spinner';
import { Alert } from '../../../components/ui/Alert';
import { Pagination } from '../../../components/ui/Pagination';

import {
  Truck,
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
  XCircle
} from 'lucide-react';

import Link from 'next/link';
import { cn } from '../../../lib/utils/cn';
import { apiClient } from '../../../lib/api/client';

// ================================================================
// TIPOS
// ================================================================

interface Transportador {
  transportadorId: string;
  nome: string;
  email?: string;
  telefone?: string;
  nif?: string;
  endereco?: string;
  licenca?: string;
  ativo: boolean;
  dataCriacao?: string;
}

interface TransportadorListData {
  list: Transportador[];
  totalCount: number;
  totalPage: number;
  curPage: number;
  pageSize: number;
}

interface TransportadorListResponse {
  returnCode: number;
  returnMsg?: string;
  data: TransportadorListData | Transportador[];
}

// ================================================================
// OPÇÕES
// ================================================================

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'ativo', label: 'Activo' },
  { value: 'inativo', label: 'Inactivo' }
];

// ================================================================
// PÁGINA PRINCIPAL
// ================================================================

export default function TransportadoresPage() {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [transportadores, setTransportadores] = useState<Transportador[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [showFilters, setShowFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // ==============================================================
  // BUSCAR TRANSPORTADORES NA BASE DE DADOS
  // ==============================================================

  const fetchTransportadores = useCallback(async () => {
  setLoading(true);
  setError(null);

  try {
    const params = {
      curPage: currentPage,
      pageSize,
      search: searchTerm.trim(),
      // A rota /getTransportadorList recebe o filtro como booleano.
      // Sem filtro, enviamos undefined para listar todos.
      ativo:
        statusFilter === 'ativo'
          ? true
          : statusFilter === 'inativo'
            ? false
            : undefined
    };

    console.log('GET TRANSPORTADORES - PARAMETROS:', params);

    const response = await apiClient.post<TransportadorListResponse>(
      '/getTransportadorList',
      params
    );

    // Suporta AxiosResponse ou resposta directa do interceptor
    const body: TransportadorListResponse =
      response?.data?.returnCode !== undefined
        ? response.data
        : response as unknown as TransportadorListResponse;

    console.log('GET TRANSPORTADORES - RESPOSTA:', body);

    if (body.returnCode !== 200) {
      throw new Error(
        body.returnMsg || 'Erro ao carregar transportadores.'
      );
    }

    const data = body.data;

    // Verificar se a API devolveu uma lista directamente
    if (Array.isArray(data)) {
      setTransportadores(data);
      setTotal(data.length);
      setTotalPages(Math.ceil(data.length / pageSize));
    } else {
      // Resposta paginada
      setTransportadores(
        Array.isArray(data?.list) ? data.list : []
      );

      setTotal(Number(data?.totalCount ?? 0));
      setTotalPages(Number(data?.totalPage ?? 0));
    }

  } catch (err: any) {
    console.error('ERRO AO CARREGAR TRANSPORTADORES:', err);

    const message =
      err?.response?.data?.returnMsg ||
      err?.message ||
      'Não foi possível carregar os transportadores.';

    setError(message);
    setTransportadores([]);
    setTotal(0);
    setTotalPages(0);

  } finally {
    setLoading(false);
  }
}, [
  currentPage,
  pageSize,
  searchTerm,
  statusFilter
]);

  // ==============================================================
  // CARREGAMENTO AUTOMÁTICO
  // ==============================================================

  useEffect(() => {
    fetchTransportadores();
  }, [fetchTransportadores]);

  // ==============================================================
  // PESQUISA
  // ==============================================================

  const handleSearch = (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault();

    setCurrentPage(1);

  };

  // ==============================================================
  // APLICAR FILTROS
  // ==============================================================

  const handleApplyFilters = () => {

    setCurrentPage(1);

    // A alteração do estado desencadeia a consulta à API.

  };

  // ==============================================================
  // LIMPAR FILTROS
  // ==============================================================

  const handleClearFilters = () => {

    setSearchTerm('');
    setStatusFilter('');
    setCurrentPage(1);
    setShowFilters(false);

  };

  // ==============================================================
  // ACTUALIZAR LISTAGEM
  // ==============================================================

  const handleRefresh = () => {

    fetchTransportadores();

  };

  // ==============================================================
  // PAGINAÇÃO
  // ==============================================================

  const goToPage = (page: number) => {

    setCurrentPage(page);

  };

  const changePageSize = (size: number) => {

    setPageSize(size);
    setCurrentPage(1);

  };

  // ==============================================================
  // INTERFACE
  // ==============================================================

  return (

    <ProtectedRoute>

      <div className="container mx-auto px-4 py-6 md:py-8">

        {/* CABEÇALHO */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

          <div className="flex items-center gap-3">

            <div className="p-2.5 bg-gray-100 rounded-full hidden sm:flex">

              <Truck className="w-5 h-5 text-gray-600" />

            </div>

            <div>

              <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                Transportadores
              </h1>

              <p className="text-sm text-gray-500 hidden sm:block">
                Gerencie todos os transportadores do sistema
              </p>

            </div>

          </div>

          <div className="flex flex-wrap items-center gap-2">

            <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-500 hidden sm:flex items-center gap-1">

              <Truck className="w-3.5 h-3.5 text-gray-400" />

              <span>
                {total} transportadores
              </span>

            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Filtros

              {statusFilter && (
                <span className="ml-1 px-1.5 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                  1
                </span>
              )}

            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              leftIcon={<RefreshCw className="w-4 h-4" />}
              className="border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Actualizar
            </Button>

            <Link href="/register?perfil=transportador&from=transportadores">

              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                className="bg-gray-800 hover:bg-gray-900 text-white"
              >
                Novo Transportador
              </Button>

            </Link>

          </div>

        </div>

        <p className="text-sm text-gray-500 mb-4 sm:hidden">
          Gerencie todos os transportadores do sistema
        </p>

        {/* ERROS */}

        {error && (

          <div className="mb-5">

            <Alert>
              {error}
            </Alert>

          </div>

        )}

        {/* PAINEL DE FILTROS */}

        {(showFilters || statusFilter) && (

          <Card className="mb-6 border border-gray-100 shadow-sm">

            <CardBody className="p-4">

              <div className="flex flex-col md:flex-row gap-4">

                <div className="flex-1">

                  <form
                    onSubmit={handleSearch}
                    className="relative"
                  >

                    <Input
                      placeholder="Pesquisar transportadores..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400 pr-10"
                      leftIcon={<Search className="w-4 h-4 text-gray-400" />}
                    />

                    {searchTerm && (

                      <button
                        type="button"
                        onClick={() => {
                          setSearchTerm('');
                          setCurrentPage(1);
                        }}
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
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 min-w-[150px]"
                    containerClassName="flex-1 md:flex-none"
                  />

                </div>

                <div className="flex items-end gap-2">

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleApplyFilters}
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

        {/* CARREGAMENTO */}

        {loading ? (

          <div className="flex items-center justify-center min-h-[300px]">

            <div className="text-center">

              <Spinner size="xl" />

              <p className="mt-4 text-gray-500">
                Carregando transportadores...
              </p>

            </div>

          </div>

        ) : (

          <>

            {/* LISTA MOBILE */}

            <div className="grid grid-cols-1 gap-3 md:hidden">

              {transportadores.map((transportador) => (

                <TransportadorCardMobile
                  key={transportador.transportadorId}
                  transportador={transportador}
                />

              ))}

            </div>

            {/* TABELA DESKTOP */}

            <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-100 shadow-sm">

              <table className="w-full">

                <thead>

                  <tr className="bg-gray-50 border-b border-gray-100">

                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>

                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>

                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>

                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telefone
                    </th>

                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Licença
                    </th>

                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>

                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {transportadores.map((transportador) => (

                    <TransportadorRow
                      key={transportador.transportadorId}
                      transportador={transportador}
                    />

                  ))}

                </tbody>

              </table>

            </div>

            {/* SEM RESULTADOS */}

            {transportadores.length === 0 && (

              <Card className="border border-gray-100 shadow-sm">

                <CardBody className="p-12 text-center">

                  <div className="flex flex-col items-center">

                    <div className="p-4 bg-gray-50 rounded-full mb-4">

                      <Truck className="w-12 h-12 text-gray-300" />

                    </div>

                    <h3 className="text-lg font-medium text-gray-800 mb-2">
                      Nenhum transportador encontrado
                    </h3>

                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                      Não foram encontrados transportadores na base de dados.
                    </p>

                  </div>

                </CardBody>

              </Card>

            )}

            {/* PAGINAÇÃO */}

            {transportadores.length > 0 && (

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-100 mt-4">

                <div className="text-sm text-gray-500">

                  Mostrando{' '}

                  <span className="font-medium text-gray-700">
                    {transportadores.length}
                  </span>

                  {' '}de{' '}

                  <span className="font-medium text-gray-700">
                    {total}
                  </span>

                  {' '}transportadores

                </div>

                <div className="flex flex-wrap items-center gap-4">

                  <div className="flex items-center gap-2">

                    <span className="text-sm text-gray-500">
                      Por página:
                    </span>

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

            )}

          </>

        )}

      </div>

    </ProtectedRoute>

  );

}

// ================================================================
// COMPONENTE: LINHA DA TABELA
// ================================================================

const TransportadorRow: React.FC<{
  transportador: Transportador
}> = ({ transportador }) => {

  return (

    <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors">

      <td className="py-3 px-4">

        <span className="font-mono text-sm text-gray-600">
          {transportador.transportadorId || '-'}
        </span>

      </td>

      <td className="py-3 px-4">

        <span className="text-sm font-medium text-gray-800">
          {transportador.nome || '-'}
        </span>

      </td>

      <td className="py-3 px-4">

        <span className="text-sm text-gray-600">
          {transportador.email || '-'}
        </span>

      </td>

      <td className="py-3 px-4">

        <span className="text-sm text-gray-600">
          {transportador.telefone || '-'}
        </span>

      </td>

      <td className="py-3 px-4">

        <span className="text-sm text-gray-600">
          {transportador.licenca || '-'}
        </span>

      </td>

      <td className="py-3 px-4">

        <span className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full',
          transportador.ativo
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        )}>

          {transportador.ativo ? (

            <>
              <CheckCircle className="w-3 h-3" />
              Activo
            </>

          ) : (

            <>
              <XCircle className="w-3 h-3" />
              Inactivo
            </>

          )}

        </span>

      </td>

      <td className="py-3 px-4">

        <div className="flex items-center gap-1">

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5"
          >
            <Eye className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5"
          >
            <Edit className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5"
          >
            <Trash2 className="w-4 h-4" />
          </Button>

        </div>

      </td>

    </tr>

  );

};

// ================================================================
// COMPONENTE: CARTÃO MOBILE
// ================================================================

const TransportadorCardMobile: React.FC<{
  transportador: Transportador
}> = ({ transportador }) => {

  return (

    <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">

      <CardBody className="p-4">

        <div className="flex items-start justify-between mb-2">

          <h3 className="text-sm font-medium text-gray-800">
            {transportador.nome || '-'}
          </h3>

          <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full',
            transportador.ativo
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          )}>

            {transportador.ativo ? 'Activo' : 'Inactivo'}

          </span>

        </div>

        <div className="space-y-1 text-xs text-gray-500">

          <div className="flex items-center gap-1">

            <Mail className="w-3 h-3" />

            <span>
              {transportador.email || '-'}
            </span>

          </div>

          <div className="flex items-center gap-1">

            <Phone className="w-3 h-3" />

            <span>
              {transportador.telefone || '-'}
            </span>

          </div>

          <div className="flex items-center gap-1">

            <Building className="w-3 h-3" />

            <span>
              {transportador.licenca || '-'}
            </span>

          </div>

          <div className="flex items-center gap-1">

            <MapPin className="w-3 h-3" />

            <span>
              {transportador.endereco || '-'}
            </span>

          </div>

        </div>

        <div className="flex items-center justify-end mt-3 pt-3 border-t border-gray-100 gap-1">

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5"
          >
            <Eye className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5"
          >
            <Edit className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5"
          >
            <Trash2 className="w-4 h-4" />
          </Button>

        </div>

      </CardBody>

    </Card>

  );

};
