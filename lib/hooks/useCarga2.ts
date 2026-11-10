/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { cargaApi } from '@/lib/api/cargas'
import { Carga } from '@/lib/types/carga'

export function useCarga(cargaId: string, autoFetch = true) {
  const [carga, setCarga] = useState<Carga | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCarga = useCallback(async () => {
    if (!cargaId) {
      setCarga(null)
      setError('ID da carga não informado')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await cargaApi.getDetail(cargaId)

      if (response.returnCode !== 200) {
        const message =
          response.returnMsg || 'Erro ao carregar detalhes da carga'

        setCarga(null)
        setError(message)
        toast.error(message)
        return
      }

      if (!response.data) {
        const message = 'Carga não encontrada'

        setCarga(null)
        setError(message)
        toast.error(message)
        return
      }

      setCarga(response.data)
    } catch (err: any) {
      console.error('ERRO AO CARREGAR DETALHES DA CARGA:', err)

      const message =
        err?.response?.data?.returnMsg ||
        err?.message ||
        'Erro ao carregar detalhes da carga'

      setCarga(null)
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [cargaId])

  useEffect(() => {
    if (autoFetch && cargaId) {
      void fetchCarga()
    }
  }, [autoFetch, cargaId, fetchCarga])

  return {
    carga,
    loading,
    error,
    fetchCarga,
    refetch: fetchCarga,
  }
}
