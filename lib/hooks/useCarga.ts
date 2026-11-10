/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { cargaApi } from '@/lib/api/cargas'
import { Carga } from '@/lib/types/carga'

interface UseCargasOptions {
  initialPage?: number
  initialPageSize?: number
  autoFetch?: boolean
}

export function useCargas(options: UseCargasOptions = {}) {
  const {
    initialPage = 1,
    initialPageSize = 10,
    autoFetch = true,
  } = options

  const [cargas, setCargas] = useState<Carga[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const [filters, setFilters] = useState<Record<string, any>>({})

  const fetchCargas = useCallback(
    async (
      customFilters?: Record<string, any>,
      customPage?: number,
      customPageSize?: number
    ) => {
      setLoading(true)
      setError(null)

      try {
        const activeFilters = customFilters ?? filters
        const page = customPage ?? currentPage
        const size = customPageSize ?? pageSize

        const params = {
          curPage: page,
          pageSize: size,
          ...activeFilters,
        }

        console.log('GET CARGAS - PARAMETROS:', params)

        const response = await cargaApi.getList(params)

        console.log('GET CARGAS - RESPOSTA:', response)

        if (response.returnCode !== 200) {
          const message =
            response.returnMsg || 'Erro ao carregar cargas'

          setCargas([])
          setTotal(0)
          setTotalPages(0)
          setError(message)

          toast.error(message)
          return
        }

        const list = Array.isArray(response.data?.list)
          ? response.data.list
          : []

        setCargas(list)
        setTotal(Number(response.data?.totalCount || 0))
        setTotalPages(Number(response.data?.totalPage || 0))
      } catch (err: any) {
        console.error('ERRO AO CARREGAR CARGAS:', err)

        const message =
          err?.response?.data?.returnMsg ||
          err?.message ||
          'Erro ao carregar cargas'

        setCargas([])
        setTotal(0)
        setTotalPages(0)
        setError(message)

        toast.error(message)
      } finally {
        setLoading(false)
      }
    },
    [filters, currentPage, pageSize]
  )

  useEffect(() => {
    if (!autoFetch) return

    fetchCargas()
  }, [autoFetch, currentPage, pageSize, filters])

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const changePageSize = useCallback((size: number) => {
    setPageSize(size)
    setCurrentPage(1)
  }, [])

  const applyFilters = useCallback(
    (newFilters: Record<string, any>) => {
      const cleanedFilters = Object.fromEntries(
        Object.entries(newFilters).filter(
          ([, value]) =>
            value !== undefined &&
            value !== null &&
            value !== ''
        )
      )

      console.log(
        'APLICANDO FILTROS:',
        cleanedFilters
      )

      setFilters(cleanedFilters)
      setCurrentPage(1)
    },
    []
  )

  const clearFilters = useCallback(() => {
    setFilters({})
    setCurrentPage(1)
  }, [])

  const refetch = useCallback(() => {
    return fetchCargas()
  }, [fetchCargas])

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
  }
}