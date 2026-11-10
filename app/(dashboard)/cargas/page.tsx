/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useCallback, useState } from 'react'
import Link from 'next/link'
import { Plus, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CargaSearch } from '@/components/cargas/CargaSearch'
import { CargaList } from '@/components/cargas/CargaList'
import { useCargas } from '@/lib/hooks/useCargas'
import { cargaApi } from '@/lib/api/cargas'

export default function CargasPage() {
  const {
    cargas,
    loading,
    error,
    total,
    totalPages,
    currentPage,
    pageSize,
    applyFilters,
    goToPage,
    changePageSize,
    refetch,
  } = useCargas({
    initialPage: 1,
    initialPageSize: 10,
    autoFetch: true,
  })

  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleSearch = useCallback(
    (filters: Record<string, any>) => {
      applyFilters(filters)
    },
    [applyFilters]
  )

  const handleDelete = useCallback(
    async (cargaId: string) => {
      const confirmar = window.confirm(
        'Tem certeza que deseja remover esta carga? Esta ação não pode ser desfeita.'
      )

      if (!confirmar) return

      try {
        setDeletingId(cargaId)

        const response = await cargaApi.delete(cargaId)

        if (response.returnCode === 200) {
          toast.success('Carga removida com sucesso')
          refetch()
        } else {
          toast.error(
            response.returnMsg || 'Não foi possível remover a carga'
          )
        }
      } catch (error: any) {
        toast.error(
          error?.response?.data?.returnMsg ||
            error?.message ||
            'Erro ao remover carga'
        )
      } finally {
        setDeletingId(null)
      }
    },
    [refetch]
  )

  return (
    <ProtectedRoute requiredPermissions={['verTodasCargas']}>
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* CABEÇALHO */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Cargas
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Consulte, pesquise e gerencie as cargas cadastradas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={refetch}
              disabled={loading}
              leftIcon={
                <RefreshCw
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                />
              }
            >
              Atualizar
            </Button>

            <Link href="/cargas/nova">
              <Button
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Nova carga
              </Button>
            </Link>
          </div>
        </div>

        {/* PESQUISA E FILTROS */}
        <Card className="border-0 shadow-sm mb-6">
          <CardBody className="p-4 md:p-5">
            <CargaSearch
              onSearch={handleSearch}
            />
          </CardBody>
        </Card>

        {/* LISTA */}
        <CargaList
          cargas={cargas}
          loading={loading}
          error={error}
          total={total}
          totalPages={totalPages}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={goToPage}
          onPageSizeChange={changePageSize}
          onSearch={handleSearch}
          onRefresh={refetch}
          onDelete={handleDelete}
          canCreate={true}
          canEdit={true}
          canDelete={true}
        />

        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="rounded-xl bg-white px-6 py-4 shadow-xl">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-sm font-medium text-slate-700">
                  Removendo carga...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}