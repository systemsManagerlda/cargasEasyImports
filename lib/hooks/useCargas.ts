// lib/hooks/useCargas.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { cargaApi } from '../api/cargas';
import { Carga, CargaListResponse } from '../types/carga';
import toast from 'react-hot-toast';

interface UseCargasOptions {
  initialPage?: number;
  initialPageSize?: number;
  autoFetch?: boolean;
}

export function useCargas(options: UseCargasOptions = {}) {
  const { initialPage = 1, initialPageSize = 10, autoFetch = true } = options;

  const [cargas, setCargas] = useState<Carga[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const fetchCargas = useCallback(async (params?: any) => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = {
        curPage: currentPage,
        pageSize: pageSize,
        ...filters,
        ...params,
      };

      const response = await cargaApi.getList(searchParams);
      
      if (response.returnCode === 200) {
        // Garantir que list seja sempre um array
        const list = response.data?.list || [];
        setCargas(list);
        setTotal(response.data?.totalCount || 0);
        setTotalPages(response.data?.totalPage || 0);
      } else {
        setError(response.returnMsg || 'Erro ao carregar cargas');
        // Limpar cargas em caso de erro
        setCargas([]);
        setTotal(0);
        setTotalPages(0);
        toast.error(response.returnMsg || 'Erro ao carregar cargas');
      }
    } catch (err: any) {
      const message = err.response?.data?.returnMsg || err.message || 'Erro ao carregar cargas';
      setError(message);
      // Limpar cargas em caso de erro
      setCargas([]);
      setTotal(0);
      setTotalPages(0);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, filters]);

  useEffect(() => {
    if (!autoFetch) return;

    const carregar = async () => {
      await fetchCargas();
    };

    carregar();
  }, [autoFetch, currentPage, pageSize, filters]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const changePageSize = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const applyFilters = useCallback((newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
  }, []);

  const refetch = useCallback(() => {
    fetchCargas();
  }, [fetchCargas]);

  return {
    cargas,
    loading,
    error,
    total,
    totalPages,
    currentPage,
    pageSize,
    filters,
    fetchCargas,
    goToPage,
    changePageSize,
    applyFilters,
    clearFilters,
    refetch,
  };
}