// components/cargas/CargaList.tsx

/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import React from 'react'
import Link from 'next/link'
import {
  Package,
  Eye,
  Edit,
  Trash2,
  MapPin,
  User,
  Calendar,
  Weight,
} from 'lucide-react'

import { Carga } from '../../lib/types/carga'
import { formatDate } from '../../lib/utils/format'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import { Alert } from '../ui/Alert'
import { Card, CardBody } from '../ui/Card'
import { Pagination } from '../ui/Pagination'
import { cn } from '../../lib/utils/cn'

interface CargaListProps {
  cargas: Carga[]
  loading: boolean
  error: string | null
  total: number
  totalPages: number
  currentPage: number
  pageSize: number

  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onSearch: (filters: any) => void
  onRefresh: () => void

  onDelete?: (cargaId: string) => void

  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
}

const statusColorMap: Record<
  string,
  {
    bg: string
    text: string
    dot: string
  }
> = {
  registada: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    dot: 'bg-slate-500',
  },

  em_preparacao: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },

  pronta_para_transporte: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    dot: 'bg-indigo-500',
  },

  em_transito: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    dot: 'bg-cyan-500',
  },

  em_posto_controlo: {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    dot: 'bg-violet-500',
  },

  em_fronteira: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    dot: 'bg-purple-500',
  },

  em_porto: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    dot: 'bg-sky-500',
  },

  em_armazem: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },

  em_distribuicao: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
  },

  entregue: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },

  suspensa: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    dot: 'bg-yellow-500',
  },

  cancelada: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
  },

  extraviada: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
  },

  danificada: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-500',
  },
}

const prioridadeColorMap: Record<
  string,
  string
> = {
  baixa: 'bg-slate-100 text-slate-600',
  media: 'bg-blue-50 text-blue-700',
  alta: 'bg-orange-50 text-orange-700',
  urgente: 'bg-red-50 text-red-700',
}

export const CargaList: React.FC<CargaListProps> = ({
  cargas,
  loading,
  error,
  total,
  totalPages,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onRefresh,
  onDelete,
  canCreate = false,
  canEdit = true,
  canDelete = true,
}) => {

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <Spinner size="xl" />

          <p className="mt-4 text-sm text-slate-500">
            Carregando cargas...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-0 shadow-sm">
        <CardBody className="p-6">

          <Alert variant="danger">
            {error}
          </Alert>

          <Button
            variant="outline"
            onClick={onRefresh}
            className="mt-4"
          >
            Tentar novamente
          </Button>

        </CardBody>
      </Card>
    )
  }

  if (!cargas || cargas.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardBody className="p-14 text-center">

          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center">
            <Package className="w-8 h-8 text-slate-400" />
          </div>

          <h3 className="mt-5 text-lg font-semibold text-slate-900">
            Nenhuma carga cadastrada
          </h3>

          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            Não existem cargas para apresentar.
            Quando uma carga for cadastrada, ela aparecerá aqui.
          </p>

          {canCreate && (
            <Link
              href="/cargas/nova"
              className="inline-block mt-6"
            >
              <Button>
                Nova carga
              </Button>
            </Link>
          )}

        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-4">

      {/* MOBILE */}

      <div className="grid grid-cols-1 gap-4 md:hidden">

        {cargas.map((carga, index) => (
          <CargaCardMobile
            key={`${carga.cargaId || carga.codigoRastreio || 'carga'}-${index}`}
            carga={carga}
            canEdit={canEdit}
            canDelete={canDelete}
            onDelete={onDelete}
          />
        ))}

      </div>


      {/* DESKTOP */}

      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>

              <tr className="bg-slate-50 border-b border-slate-200">

                <th className="text-left py-4 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Código
                </th>

                <th className="text-left py-4 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Descrição
                </th>

                <th className="text-left py-4 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Cliente
                </th>

                <th className="text-left py-4 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Origem
                </th>

                <th className="text-left py-4 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Destino
                </th>

                <th className="text-left py-4 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Prioridade
                </th>

                <th className="text-left py-4 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>

                <th className="text-right py-4 px-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Ações
                </th>

              </tr>

            </thead>

            <tbody>

              {cargas.map((carga, index) => (
                <CargaRow
                  key={`${carga.cargaId || carga.codigoRastreio || 'carga'}-${index}`}
                  carga={carga}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  onDelete={onDelete}
                />
              ))}

            </tbody>

          </table>

        </div>

      </div>


      {/* PAGINAÇÃO */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">

        <div className="text-sm text-slate-500">
          Mostrando{' '}
          <span className="font-semibold text-slate-700">
            {cargas.length}
          </span>{' '}
          de{' '}
          <span className="font-semibold text-slate-700">
            {total}
          </span>{' '}
          cargas
        </div>

        <div className="flex items-center gap-4">

          <div className="flex items-center gap-2">

            <span className="text-xs text-slate-500">
              Por página:
            </span>

            <select
              value={pageSize}
              onChange={(e) =>
                onPageSizeChange(
                  Number(e.target.value)
                )
              }
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
            >
              {[5, 10, 25, 50].map(
                (size) => (
                  <option
                    key={size}
                    value={size}
                  >
                    {size}
                  </option>
                )
              )}
            </select>

          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              size="sm"
              showFirstLast
            />
          )}

        </div>

      </div>

    </div>
  )
}


/* =========================================================
   LINHA DESKTOP
========================================================= */

function CargaRow({
  carga,
  canEdit,
  canDelete,
  onDelete,
}: {
  carga: Carga
  canEdit: boolean
  canDelete: boolean
  onDelete?: (cargaId: string) => void
}) {
  const statusStyle =
    statusColorMap[carga.status] ||
    statusColorMap.registada

  const prioridadeStyle =
    prioridadeColorMap[carga.prioridade] ||
    prioridadeColorMap.baixa

  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors">

      <td className="py-4 px-5">

        <Link
          href={`/cargas/${carga.cargaId}`}
          className="font-mono text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          {carga.codigoRastreio || '—'}
        </Link>

      </td>

      <td className="py-4 px-5">

        <span className="block max-w-[180px] truncate text-sm font-medium text-slate-800">
          {carga.descricao || '—'}
        </span>

      </td>

      <td className="py-4 px-5">

        <span className="text-sm text-slate-600">
          {carga.cliente?.nome || '—'}
        </span>

      </td>

      <td className="py-4 px-5">

        <span className="text-sm text-slate-600">
          {carga.origem?.cidade || '—'}
        </span>

      </td>

      <td className="py-4 px-5">

        <span className="text-sm text-slate-600">
          {carga.destino?.cidade || '—'}
        </span>

      </td>

      <td className="py-4 px-5">

        <span
          className={cn(
            'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
            prioridadeStyle
          )}
        >
          {carga.prioridade || '—'}
        </span>

      </td>

      <td className="py-4 px-5">

        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
            statusStyle.bg,
            statusStyle.text
          )}
        >

          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              statusStyle.dot
            )}
          />

          {formatStatus(carga.status)}

        </span>

      </td>

      <td className="py-4 px-5">

        <div className="flex justify-end items-center gap-1">

          {/* VER */}

          <Link href={`/cargas/${carga.cargaId}`}>

            <Button
              variant="ghost"
              size="sm"
              aria-label="Ver carga"
              className="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
            >
              <Eye className="w-4 h-4" />
            </Button>

          </Link>


          {/* EDITAR */}

          {canEdit && (
            <Link
              href={`/cargas/${carga.cargaId}/editar`}
            >
              <Button
                variant="ghost"
                size="sm"
                aria-label="Editar carga"
                className="text-slate-400 hover:text-amber-600 hover:bg-amber-50"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </Link>
          )}


          {/* REMOVER */}

          {canDelete && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              aria-label="Remover carga"
              onClick={() =>
                onDelete(carga.cargaId)
              }
              className="text-slate-400 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}

        </div>

      </td>

    </tr>
  )
}


/* =========================================================
   MOBILE
========================================================= */

function CargaCardMobile({
  carga,
  canEdit,
  canDelete,
  onDelete,
}: {
  carga: Carga
  canEdit: boolean
  canDelete: boolean
  onDelete?: (cargaId: string) => void
}) {
  const statusStyle =
    statusColorMap[carga.status] ||
    statusColorMap.registada

  const prioridadeStyle =
    prioridadeColorMap[carga.prioridade] ||
    prioridadeColorMap.baixa

  return (
    <Card className="border-0 shadow-sm">

      <CardBody className="p-4">

        <div className="flex items-start justify-between gap-3">

          <Link
            href={`/cargas/${carga.cargaId}`}
            className="font-mono text-xs font-semibold text-blue-600"
          >
            {carga.codigoRastreio || '—'}
          </Link>

          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-[11px] font-medium',
              prioridadeStyle
            )}
          >
            {carga.prioridade || '—'}
          </span>

        </div>

        <h3 className="mt-3 text-sm font-semibold text-slate-900">
          {carga.descricao || 'Carga sem descrição'}
        </h3>

        <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-slate-500">

          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5" />
            {carga.cliente?.nome || 'Cliente não informado'}
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" />
            {carga.origem?.cidade || '—'}
            {' → '}
            {carga.destino?.cidade || '—'}
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(carga.dataCriacao)}
          </div>

          <div className="flex items-center gap-2">
            <Weight className="w-3.5 h-3.5" />
            {carga.peso ?? '—'} kg
          </div>

        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">

          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
              statusStyle.bg,
              statusStyle.text
            )}
          >
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                statusStyle.dot
              )}
            />

            {formatStatus(carga.status)}
          </span>

          <div className="flex items-center gap-1">

            <Link href={`/cargas/${carga.cargaId}`}>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Ver carga"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </Link>

            {canEdit && (
              <Link
                href={`/cargas/${carga.cargaId}/editar`}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Editar carga"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </Link>
            )}

            {canDelete && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                aria-label="Remover carga"
                onClick={() =>
                  onDelete(carga.cargaId)
                }
                className="text-red-500 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}

          </div>

        </div>

      </CardBody>

    </Card>
  )
}


/* =========================================================
   STATUS
========================================================= */

function formatStatus(status?: string) {
  if (!status) return '—'

  return status
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    )
}