/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '../../../components/common/ProtectedRoute'
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardDescription,
} from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Spinner } from '../../../components/ui/Spinner'
import { Alert } from '../../../components/ui/Alert'
import { CargaStatusBadge } from '../../../components/cargas/CargaStatusBadge'
import { cargaApi } from '../../../lib/api/cargas'
import {
  Carga,
  CargaDashboardResponse,
} from '../../../lib/types/carga'
import { formatCurrency, formatDate } from '../../../lib/utils/format'
import {
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  ArrowUpRight,
  RefreshCw,
  MessageSquare,
  Activity,
  MapPin,
  Route,
  Plus,
  Database,
  Users,
  UserRound,
  FileBarChart2,
} from 'lucide-react'
import { useAuth } from '../../../lib/hooks/useAuth'

export default function DashboardPage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<CargaDashboardResponse | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await cargaApi.getDashboard()

      if (response.returnCode === 200) {
        setData(response.data)
      } else {
        setError(
          response.returnMsg ||
            'Não foi possível carregar o dashboard.'
        )
      }
    } catch (error: any) {
      setError(
        error?.message ||
          'Erro de comunicação com o servidor.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (user?.perfil === 'motorista') {
        router.replace('/motorista')
        return
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      load()
    }
  }, [authLoading, isAuthenticated, user?.perfil, router])

  if (authLoading || loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="text-center">
            <Spinner
              size="xl"
              label="Carregando dashboard"
            />

            <p className="mt-4 text-sm text-slate-500">
              A consultar os dados da operação…
            </p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="max-w-2xl mx-auto py-16">
          <Alert
            variant="danger"
            title="Não foi possível carregar os dados"
          >
            {error}
          </Alert>

          <Button
            className="mt-4"
            onClick={load}
            leftIcon={
              <RefreshCw className="w-4 h-4" />
            }
          >
            Tentar novamente
          </Button>
        </div>
      </ProtectedRoute>
    )
  }

  const dashboard = normalizeDashboardData(data)

  const hasData =
    dashboard.estatisticas.totalCargas > 0 ||
    dashboard.ultimasCargas.length > 0

  return (
    <ProtectedRoute>
      <div className="max-w-[1600px] mx-auto space-y-6 animate-fade-in">

        {/* CABEÇALHO */}
        <section className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-6 lg:p-8 shadow-xl">
          <div className="absolute -right-20 -top-28 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-6">

            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3 py-1 text-xs text-slate-300 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Operação
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                Dashboard
              </h1>

              <p className="mt-2 text-slate-400 max-w-2xl">
                Visão geral da operação de rastreio de cargas.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">

              <Link href="/rastrear">
                <Button
                  variant="outline"
                  className="!bg-white/5 !border-white/15 !text-white hover:!bg-white/10"
                  leftIcon={
                    <Route className="w-4 h-4" />
                  }
                >
                  Rastrear carga
                </Button>
              </Link>

              <Link href="/motoristas">
                <Button
                  variant="outline"
                  className="!bg-white/5 !border-white/15 !text-white hover:!bg-white/10"
                  leftIcon={<UserRound className="w-4 h-4" />}
                >
                  Motoristas
                </Button>
              </Link>

              <Link href="/cargas/nova">
                <Button
                  leftIcon={
                    <Plus className="w-4 h-4" />
                  }
                >
                  Nova carga
                </Button>
              </Link>

              <Button
                variant="ghost"
                className="!text-slate-300 hover:!bg-white/10"
                onClick={load}
                leftIcon={
                  <RefreshCw className="w-4 h-4" />
                }
              >
                Atualizar
              </Button>

            </div>
          </div>
        </section>

        {/* SEM DADOS */}
        {!hasData ? (
          <EmptyDashboard />
        ) : (
          <DashboardData data={dashboard} />
        )}

      </div>
    </ProtectedRoute>
  )
}


/* =========================================================
   DASHBOARD VAZIO
========================================================= */

function EmptyDashboard() {
  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardBody className="py-20 px-6 text-center">

          <div className="mx-auto w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center">
            <Database className="w-9 h-9 text-slate-400" />
          </div>

          <h2 className="mt-6 text-xl font-semibold text-slate-900">
            Nenhum dado disponível
          </h2>

          <p className="mt-2 max-w-xl mx-auto text-sm leading-6 text-slate-500">
            O sistema está pronto para utilização.
            Quando forem registadas cargas no backend,
            os dados reais serão apresentados neste dashboard.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">

            <Link href="/cargas/nova">
              <Button
                leftIcon={
                  <Plus className="w-4 h-4" />
                }
              >
                Registar primeira carga
              </Button>
            </Link>

            <Link href="/cargas">
              <Button
                variant="outline"
                leftIcon={
                  <Package className="w-4 h-4" />
                }
              >
                Abrir cargas
              </Button>
            </Link>

          </div>
        </CardBody>
      </Card>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <QuickLink
          href="/clientes"
          icon={<Users className="w-5 h-5" />}
          title="Clientes"
          description="Gerir os clientes registados."
        />

        <QuickLink
          href="/transportadores"
          icon={<Truck className="w-5 h-5" />}
          title="Transportadores"
          description="Gerir transportadores."
        />

        <QuickLink
          href="/motoristas"
          icon={<UserRound className="w-5 h-5" />}
          title="Motoristas"
          description="Consultar e gerir os motoristas registados."
        />

        <QuickLink
          href="/relatorios"
          icon={<FileBarChart2 className="w-5 h-5" />}
          title="Relatórios"
          description="Consultar relatórios da operação."
        />

      </section>
    </>
  )
}


/* =========================================================
   LINKS RÁPIDOS
========================================================= */

function QuickLink({
  href,
  icon,
  title,
  description,
}: {
  href: string
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="group"
    >
      <Card className="h-full border-0 shadow-sm transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">

        <CardBody className="p-5">

          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            {icon}
          </div>

          <h3 className="mt-4 font-semibold text-slate-900">
            {title}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>

        </CardBody>

      </Card>
    </Link>
  )
}


/* =========================================================
   DASHBOARD COM DADOS REAIS
========================================================= */

function DashboardData({
  data,
}: {
  data: CargaDashboardResponse
}) {
  const {
    estatisticas,
    ultimasCargas,
    cargasPorStatus,
    cargasPorPrioridade,
    cargasAtrasadas,
  } = data

  const taxa =
    estatisticas.totalCargas > 0
      ? Math.round(
          (estatisticas.totalEntregues /
            estatisticas.totalCargas) *
            100
        )
      : 0

  return (
    <>
      {/* ESTATÍSTICAS */}

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <Stat
          title="Total de cargas"
          value={estatisticas.totalCargas}
          icon={<Package className="w-5 h-5" />}
        />

        <Stat
          title="Em trânsito"
          value={estatisticas.totalEmTransito}
          icon={<Truck className="w-5 h-5" />}
        />

        <Stat
          title="Entregues"
          value={estatisticas.totalEntregues}
          icon={<CheckCircle2 className="w-5 h-5" />}
        />

        <Stat
          title="Atrasadas"
          value={estatisticas.totalAtrasadas}
          icon={<AlertTriangle className="w-5 h-5" />}
        />

      </section>


      {/* CARGAS + FINANCEIRO */}

      <section className="grid grid-cols-1 xl:grid-cols-[1.4fr_.6fr] gap-6">

        <Card className="border-0 shadow-sm overflow-hidden">

          <CardHeader className="border-b border-slate-100 p-5">

            <div className="flex items-center justify-between gap-4">

              <div>
                <CardTitle className="text-base">
                  Cargas recentes
                </CardTitle>

                <CardDescription>
                  Últimos registos da operação
                </CardDescription>
              </div>

              <Link href="/cargas">
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={
                    <ArrowUpRight className="w-4 h-4" />
                  }
                >
                  Ver todas
                </Button>
              </Link>

            </div>

          </CardHeader>

          <CardBody className="p-0">

            {ultimasCargas.length > 0 ? (
              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead>
                    <tr className="bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500">

                      <th className="px-5 py-3">
                        Rastreio
                      </th>

                      <th className="px-5 py-3">
                        Carga
                      </th>

                      <th className="px-5 py-3">
                        Rota
                      </th>

                      <th className="px-5 py-3">
                        Status
                      </th>

                      <th className="px-5 py-3">
                        Atualização
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {ultimasCargas
                      .slice(0, 7)
                      .map((carga: Carga) => (

                        <tr
                          key={carga.cargaId}
                          className="border-t border-slate-100 hover:bg-slate-50/80"
                        >

                          <td className="px-5 py-4">

                            <Link
                              href={`/cargas/${carga.cargaId}`}
                              className="font-mono text-xs font-semibold text-blue-600 hover:underline"
                            >
                              {carga.codigoRastreio}
                            </Link>

                          </td>

                          <td className="px-5 py-4">

                            <div className="font-medium text-slate-800 max-w-[190px] truncate">
                              {carga.descricao || '—'}
                            </div>

                            <div className="text-xs text-slate-400">
                              {carga.cliente?.nome || '—'}
                            </div>

                          </td>

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-2 text-xs text-slate-600">

                              <span>
                                {carga.origem?.cidade || '—'}
                              </span>

                              <span className="text-slate-300">
                                →
                              </span>

                              <span>
                                {carga.destino?.cidade || '—'}
                              </span>

                            </div>

                          </td>

                          <td className="px-5 py-4">
                            <CargaStatusBadge
                              status={carga.status}
                              size="sm"
                            />
                          </td>

                          <td className="px-5 py-4 text-xs text-slate-500">
                            {formatDate(
                              carga.dataAtualizacao ||
                                carga.dataCriacao
                            )}
                          </td>

                        </tr>

                      ))}

                  </tbody>

                </table>

              </div>
            ) : (
              <EmptySection text="Nenhuma carga registada." />
            )}

          </CardBody>

        </Card>


        {/* FINANCEIRO */}

        <Card className="border-0 shadow-sm">

          <CardHeader className="p-5">

            <CardTitle className="text-base">
              Resumo financeiro
            </CardTitle>

            <CardDescription>
              Dados calculados a partir das cargas existentes
            </CardDescription>

          </CardHeader>

          <CardBody className="p-5 pt-0">

            <div className="rounded-2xl bg-slate-950 text-white p-5">

              <DollarSign className="w-5 h-5" />

              <p className="text-xs text-slate-400 mt-6">
                Valor total declarado
              </p>

              <p className="text-2xl font-bold mt-1">
                {formatCurrency(
                  estatisticas.totalValorDeclarado
                )}
              </p>

            </div>


            <div className="grid grid-cols-2 gap-3 mt-4">

              <MiniMetric
                label="Peso total"
                value={`${estatisticas.totalPeso.toFixed(1)} kg`}
                icon={<Activity className="w-4 h-4" />}
              />

              <MiniMetric
                label="Incidentes"
                value={estatisticas.totalIncidentes}
                icon={<AlertTriangle className="w-4 h-4" />}
              />

              <MiniMetric
                label="Reclamações"
                value={estatisticas.totalReclamacoes}
                icon={<MessageSquare className="w-4 h-4" />}
              />

              <MiniMetric
                label="Volume"
                value={`${estatisticas.totalVolume.toFixed(1)} m³`}
                icon={<Package className="w-4 h-4" />}
              />

            </div>

          </CardBody>

        </Card>

      </section>


      {/* DISTRIBUIÇÕES */}

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Distribution
          title="Distribuição por status"
          items={cargasPorStatus}
          total={estatisticas.totalCargas}
        />

        <Distribution
          title="Prioridade operacional"
          items={cargasPorPrioridade}
          total={estatisticas.totalCargas}
          priority
        />

      </section>


      {/* CARGAS ATRASADAS */}

      {cargasAtrasadas.length > 0 && (

        <Card className="border-0 shadow-sm">

          <CardHeader className="p-5">

            <div className="flex items-center gap-2">

              <AlertTriangle className="w-5 h-5 text-rose-500" />

              <CardTitle className="text-base">
                Atenção necessária
              </CardTitle>

              <span className="rounded-full bg-rose-50 text-rose-600 px-2 py-0.5 text-xs font-semibold">
                {cargasAtrasadas.length}
              </span>

            </div>

            <CardDescription>
              Cargas que ultrapassaram a previsão de chegada
            </CardDescription>

          </CardHeader>


          <CardBody className="p-5 pt-0 grid gap-3">

            {cargasAtrasadas
              .slice(0, 5)
              .map((carga: Carga) => (

                <Link
                  key={carga.cargaId}
                  href={`/cargas/${carga.cargaId}`}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 hover:bg-slate-50 transition-colors"
                >

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-rose-500" />
                    </div>

                    <div>

                      <p className="font-medium text-slate-800">
                        {carga.descricao ||
                          'Carga sem descrição'}
                      </p>

                      <p className="text-xs text-slate-400">
                        {carga.codigoRastreio}
                        {' · '}
                        {carga.destino?.cidade ||
                          'Destino não informado'}
                      </p>

                    </div>

                  </div>

                  <ArrowUpRight className="w-4 h-4 text-slate-400" />

                </Link>

              ))}

          </CardBody>

        </Card>

      )}


      <p className="text-center text-xs text-slate-400">
        Taxa de entrega: {taxa}% — calculada exclusivamente
        com os registos existentes.
      </p>

    </>
  )
}


/* =========================================================
   NORMALIZAÇÃO
========================================================= */

function normalizeDashboardData(
  data: CargaDashboardResponse | null
): CargaDashboardResponse {

  const emptyStats = {
    totalCargas: 0,
    totalEmTransito: 0,
    totalEntregues: 0,
    totalAtrasadas: 0,
    totalValorDeclarado: 0,
    totalPeso: 0,
    totalIncidentes: 0,
    totalReclamacoes: 0,
    totalVolume: 0,
  }

  return {
    estatisticas: {
      ...emptyStats,
      ...(data?.estatisticas || {}),
    },

    ultimasCargas: Array.isArray(
      data?.ultimasCargas
    )
      ? data!.ultimasCargas
      : [],

    cargasPorStatus: Array.isArray(
      data?.cargasPorStatus
    )
      ? data!.cargasPorStatus
      : [],

    cargasPorPrioridade: Array.isArray(
      data?.cargasPorPrioridade
    )
      ? data!.cargasPorPrioridade
      : [],

    cargasAtrasadas: Array.isArray(
      data?.cargasAtrasadas
    )
      ? data!.cargasAtrasadas
      : [],
  } as CargaDashboardResponse
}


/* =========================================================
   STAT
========================================================= */

function Stat({
  title,
  value,
  icon,
}: {
  title: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <Card className="border-0 shadow-sm">

      <CardBody className="p-5">

        <div className="flex justify-between gap-3">

          <div>

            <p className="text-xs font-medium text-slate-500">
              {title}
            </p>

            <p className="text-2xl font-bold mt-1 text-slate-900">
              {value}
            </p>

          </div>

          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
            {icon}
          </div>

        </div>

      </CardBody>

    </Card>
  )
}


/* =========================================================
   MINI METRIC
========================================================= */

function MiniMetric({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">

      <div className="flex items-center gap-2 text-slate-400">

        {icon}

        <span className="text-[11px]">
          {label}
        </span>

      </div>

      <p className="mt-1 font-semibold text-slate-800">
        {value}
      </p>

    </div>
  )
}


/* =========================================================
   DISTRIBUTION
========================================================= */

function Distribution({
  title,
  items,
  total,
  priority = false,
}: {
  title: string
  items: Array<{
    _id: string
    count: number
  }>
  total: number
  priority?: boolean
}) {

  const colors: Record<string, string> =
    priority
      ? {
          urgente: 'bg-rose-500',
          alta: 'bg-orange-500',
          media: 'bg-amber-400',
          baixa: 'bg-slate-400',
        }
      : {}

  return (
    <Card className="border-0 shadow-sm">

      <CardHeader className="p-5">

        <CardTitle className="text-base">
          {title}
        </CardTitle>

        <CardDescription>
          Distribuição atual
        </CardDescription>

      </CardHeader>

      <CardBody className="p-5 pt-1 space-y-4">

        {items.length > 0 ? (

          items.map((item) => {

            const percentage =
              total > 0
                ? (item.count / total) * 100
                : 0

            return (
              <div key={item._id}>

                <div className="flex justify-between text-xs mb-1.5">

                  <span className="text-slate-600 capitalize">
                    {item._id.replaceAll('_', ' ')}
                  </span>

                  <span className="font-semibold text-slate-700">
                    {item.count}
                  </span>

                </div>

                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">

                  <div
                    className={`h-full rounded-full ${
                      colors[item._id] ||
                      'bg-blue-500'
                    }`}
                    style={{
                      width: `${percentage}%`,
                    }}
                  />

                </div>

              </div>
            )
          })

        ) : (

          <EmptySection text="Sem dados." />

        )}

      </CardBody>

    </Card>
  )
}


/* =========================================================
   EMPTY SECTION
========================================================= */

function EmptySection({
  text,
}: {
  text: string
}) {
  return (
    <div className="py-10 text-center text-sm text-slate-400">

      <Package className="w-9 h-9 mx-auto mb-2 opacity-40" />

      {text}

    </div>
  )
}