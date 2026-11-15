/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  RefreshCw,
  Route,
  ShieldCheck,
  Truck,
} from 'lucide-react'

import { useAuth } from '../../../lib/hooks/useAuth'
import { cargaApi } from '../../../lib/api/cargas'
import { Carga } from '../../../lib/types/carga'
import { CargaStatusBadge } from '../../../components/cargas/CargaStatusBadge'
import { Card, CardBody } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Spinner } from '../../../components/ui/Spinner'
import { Alert } from '../../../components/ui/Alert'
import { getStatusLabel, formatDate } from '../../../lib/utils/format'

const STATUS_TERMINAIS = ['entregue', 'cancelada', 'extraviada']
const STATUS_EM_MOVIMENTO = [
  'em_transito',
  'em_posto_controlo',
  'em_fronteira',
  'em_porto',
  'em_armazem',
  'em_distribuicao',
]

function dataValida(value?: string) {
  if (!value) return 'Data não disponível'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Data não disponível'
  return formatDate(date)
}

function StatCard({
  title,
  value,
  description,
  icon,
  tone,
}: {
  title: string
  value: number | string
  description: string
  icon: React.ReactNode
  tone: 'blue' | 'green' | 'amber' | 'slate'
}) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-100',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  }

  return (
    <Card className="border border-slate-200/70 shadow-sm">
      <CardBody className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              {value}
            </p>
            <p className="mt-1 text-xs text-slate-500">{description}</p>
          </div>
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ${tones[tone]}`}>
            {icon}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export default function ClienteDashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()

  const [cargas, setCargas] = useState<Carga[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregarCargas = useCallback(async () => {
    if (!user?.clienteId) {
      setCargas([])
      setError('A sua conta ainda não está associada a um registo de cliente. Contacte o administrador do sistema.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await cargaApi.getByCliente(user.clienteId, undefined, 100)

      if (response.returnCode !== 200) {
        throw new Error(response.returnMsg || 'Não foi possível consultar as suas cargas.')
      }

      setCargas(Array.isArray(response.data) ? response.data : [])
    } catch (err: any) {
      setError(
        err?.response?.data?.returnMsg ||
        err?.message ||
        'Ocorreu um erro ao carregar as suas cargas.'
      )
      setCargas([])
    } finally {
      setLoading(false)
    }
  }, [user?.clienteId])

  useEffect(() => {
  if (loading || error) return;
  if (window.location.hash !== '#cargas') return;

  const frame = window.requestAnimationFrame(() => {
    document.getElementById('cargas')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  });

    return () => window.cancelAnimationFrame(frame);
  }, [loading, error, cargas.length]);

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      router.replace('/login')
      return
    }

    if (user?.perfil !== 'cliente') {
      router.replace('/dashboard')
      return
    }

    void carregarCargas()
  }, [authLoading, isAuthenticated, user?.perfil, carregarCargas, router])

  const metricas = useMemo(() => {
    const total = cargas.length
    const entregues = cargas.filter(c => c.status === 'entregue').length
    const emMovimento = cargas.filter(c => STATUS_EM_MOVIMENTO.includes(c.status)).length
    const pendentes = cargas.filter(c => !STATUS_TERMINAIS.includes(c.status) && !STATUS_EM_MOVIMENTO.includes(c.status)).length
    const alertas = cargas.reduce(
      (totalAlertas, carga) => totalAlertas + (carga.alertas || []).filter(a => !a.resolvido).length,
      0
    )
    const ocorrencias = cargas.reduce(
      (totalOcorrencias, carga) => totalOcorrencias + (carga.ocorrencias || []).filter(o => !['resolvido', 'fechado'].includes(o.status)).length,
      0
    )

    return { total, entregues, emMovimento, pendentes, alertas, ocorrencias }
  }, [cargas])

  const cargasRecentes = useMemo(() => {
    return [...cargas]
      .sort((a, b) => {
        const dateA = new Date(a.dataAtualizacao || a.dataCriacao || 0).getTime()
        const dateB = new Date(b.dataAtualizacao || b.dataCriacao || 0).getTime()
        return dateB - dateA
      })
      .slice(0, 6)
  }, [cargas])

  const distribuicao = useMemo(() => {
    const statuses = [
      'registada',
      'em_preparacao',
      'pronta_para_transporte',
      'em_transito',
      'em_posto_controlo',
      'em_fronteira',
      'em_porto',
      'em_armazem',
      'em_distribuicao',
      'entregue',
    ]

    return statuses
      .map(status => ({
        status,
        label: getStatusLabel(status),
        count: cargas.filter(c => c.status === status).length,
      }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)
  }, [cargas])

  if (authLoading || (loading && !error && cargas.length === 0)) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="text-center">
          <Spinner size="xl" label="A carregar o seu painel" />
          <p className="mt-4 text-sm text-slate-500">A consultar as suas cargas…</p>
        </div>
      </div>
    )
  }

  const primeiroNome = user?.nomeCompleto?.trim().split(/\s+/)[0] || user?.nomeUtilizador || 'Cliente'

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-7 text-white shadow-xl lg:px-8">
        <div className="absolute -right-16 -top-28 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-32 right-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Área do cliente
            </div>
            <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
              Bem-vindo, {primeiroNome}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 lg:text-base">
              Acompanhe as suas expedições, consulte o estado das entregas e mantenha-se informado sobre cada movimento das suas cargas.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/rastrear">
              <Button
                variant="outline"
                className="!border-white/20 !bg-white/5 !text-white hover:!bg-white/10"
                leftIcon={<Route className="h-4 w-4" />}
              >
                Rastrear carga
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="!text-slate-200 hover:!bg-white/10"
              onClick={carregarCargas}
              disabled={loading}
              leftIcon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
            >
              Actualizar
            </Button>
          </div>
        </div>
      </section>

      {error && (
        <Alert variant="danger" title="Não foi possível carregar os dados">
          <div className="flex flex-col gap-3">
            <span>{error}</span>
            <div>
              <Button size="sm" variant="outline" onClick={carregarCargas}>
                Tentar novamente
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {!error && (
        <>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total de cargas"
              value={metricas.total}
              description="Expedições associadas à sua conta"
              icon={<Package className="h-5 w-5" />}
              tone="blue"
            />
            <StatCard
              title="Em trânsito"
              value={metricas.emMovimento}
              description="Cargas em percurso ou distribuição"
              icon={<Truck className="h-5 w-5" />}
              tone="amber"
            />
            <StatCard
              title="Entregues"
              value={metricas.entregues}
              description="Cargas com entrega concluída"
              icon={<CheckCircle2 className="h-5 w-5" />}
              tone="green"
            />
            <StatCard
              title="Pendentes"
              value={metricas.pendentes}
              description="Registadas ou em preparação"
              icon={<Clock3 className="h-5 w-5" />}
              tone="slate"
            />
          </section>

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
            <Card className="border border-slate-200/70 shadow-sm">
              <CardBody className="p-5 lg:p-6">
                <div
                  id="cargas"
                  className="scroll-mt-24 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950">As minhas cargas</h2>
                    <p className="mt-1 text-sm text-slate-500">Acompanhe as expedições mais recentes.</p>
                  </div>
                  <span className="text-xs font-medium text-slate-500">{metricas.total} registo(s)</span>
                </div>

                {cargasRecentes.length === 0 ? (
                  <div className="py-14 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Package className="h-7 w-7" />
                    </div>
                    <h3 className="mt-4 font-semibold text-slate-900">Ainda não existem cargas</h3>
                    <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
                      Quando forem registadas expedições associadas à sua conta, poderá acompanhá-las aqui.
                    </p>
                  </div>
                ) : (
                  <div className="mt-5 divide-y divide-slate-100">
                    {cargasRecentes.map(carga => (
                      <div key={carga.cargaId} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-slate-900">
                              {carga.codigoRastreio || carga.cargaId}
                            </span>
                            <CargaStatusBadge status={carga.status} size="sm" />
                          </div>
                          <p className="mt-1 truncate text-sm text-slate-700">{carga.descricao}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {carga.origem?.cidade || 'Origem não indicada'} <ArrowRight className="h-3 w-3" /> {carga.destino?.cidade || 'Destino não indicado'}
                            </span>
                            <span>Actualizada: {dataValida(carga.dataAtualizacao || carga.dataCriacao)}</span>
                          </div>
                        </div>
                        <Link
                          href={`/cargas/${encodeURIComponent(carga.cargaId)}`}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                        >
                          Ver detalhes
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>

            <div className="space-y-5">
              <Card className="border border-slate-200/70 shadow-sm">
                <CardBody className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-semibold text-slate-950">Estado das expedições</h2>
                      <p className="mt-1 text-xs text-slate-500">Distribuição por estado actual</p>
                    </div>
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>

                  {distribuicao.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-400">Sem dados para apresentar.</p>
                  ) : (
                    <div className="mt-5 space-y-4">
                      {distribuicao.slice(0, 6).map(item => {
                        const percent = metricas.total ? (item.count / metricas.total) * 100 : 0
                        return (
                          <div key={item.status}>
                            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                              <span className="font-medium text-slate-600">{item.label}</span>
                              <span className="tabular-nums text-slate-500">{item.count}</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardBody>
              </Card>

              <Card className="border border-slate-200/70 shadow-sm">
                <CardBody className="p-5">
                  <h2 className="font-semibold text-slate-950">Atenção às suas cargas</h2>
                  <p className="mt-1 text-xs text-slate-500">Alertas e ocorrências ainda não resolvidos.</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-amber-50 p-3">
                      <div className="flex items-center gap-2 text-amber-700">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-xs font-medium">Alertas activos</span>
                      </div>
                      <p className="mt-2 text-2xl font-bold text-amber-900">{metricas.alertas}</p>
                    </div>
                    <div className="rounded-2xl bg-rose-50 p-3">
                      <div className="flex items-center gap-2 text-rose-700">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-xs font-medium">Ocorrências abertas</span>
                      </div>
                      <p className="mt-2 text-2xl font-bold text-rose-900">{metricas.ocorrencias}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    Consulte os detalhes de cada carga para ver a descrição e a evolução dos alertas e ocorrências.
                  </p>
                </CardBody>
              </Card>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link href="/rastrear" className="group">
              <Card className="h-full border border-slate-200/70 shadow-sm transition group-hover:-translate-y-0.5 group-hover:shadow-md">
                <CardBody className="flex flex-row items-center gap-4 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                    <Route className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">Rastrear uma carga</p>
                    <p className="mt-1 text-xs text-slate-500">Consultar uma expedição pelo código de rastreio.</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />
                </CardBody>
              </Card>
            </Link>

            <Link href="/perfil" className="group">
              <Card className="h-full border border-slate-200/70 shadow-sm transition group-hover:-translate-y-0.5 group-hover:shadow-md">
                <CardBody className="flex flex-row items-center gap-4 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">Os meus dados</p>
                    <p className="mt-1 text-xs text-slate-500">Consultar os dados e as informações da sua conta.</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />
                </CardBody>
              </Card>
            </Link>

            <Link href="/ajuda" className="group">
              <Card className="h-full border border-slate-200/70 shadow-sm transition group-hover:-translate-y-0.5 group-hover:shadow-md">
                <CardBody className="flex flex-row items-center gap-4 p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">Centro de ajuda</p>
                    <p className="mt-1 text-xs text-slate-500">Obter apoio na utilização do CargoTrack.</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />
                </CardBody>
              </Card>
            </Link>
          </section>
        </>
      )}
    </div>
  )
}
