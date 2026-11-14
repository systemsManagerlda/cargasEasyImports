'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { cargaApi, CargaListParams } from '../api/cargas'
import { Carga } from '../types/carga'

const PAGE_SIZE = 100

/** Carrega apenas as cargas associadas ao motorista autenticado. */
export function useMotoristaCargas() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const motoristaId = user?.perfil === "motorista" ? user?._id : undefined
  const perfil = user?.perfil
  const [cargas, setCargas] = useState<Carga[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const loadCargas = useCallback(async (quiet = false) => {
    if (!motoristaId) {
      setCargas([])
      setError('A sua conta não tem um identificador de motorista associado. Contacte a Central.')
      setLoading(false)
      setRefreshing(false)
      return
    }

    if (quiet) setRefreshing(true)
    else setLoading(true)
    setError('')

    try {
      const params: CargaListParams = {
        curPage: 1,
        pageSize: PAGE_SIZE,
        orderBy: 'dataAtualizacao',
        orderDirection: -1,
      }
      const response = await cargaApi.getList(params)

      if (response.returnCode !== 200) {
        throw new Error(response.returnMsg || 'Não foi possível consultar as cargas atribuídas.')
      }

      setCargas(Array.isArray(response.data?.list) ? response.data.list : [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro de comunicação com o servidor.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [motoristaId])

  useEffect(() => {
    if (authLoading) return
    if (isAuthenticated && perfil === 'motorista') {
      void loadCargas()
    } else {
      setCargas([])
      setLoading(false)
    }
  }, [authLoading, isAuthenticated, perfil, loadCargas])

  return {
    user,
    cargas,
    loading: authLoading || loading,
    refreshing,
    error,
    refresh: () => loadCargas(true),
  }
}
