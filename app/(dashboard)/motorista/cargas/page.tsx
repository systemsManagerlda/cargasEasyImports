'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, MapPin, Package, RefreshCw, Search, Truck, CalendarClock, Route } from 'lucide-react'
import { useMotoristaCargas } from '../../../../lib/hooks/useMotoristaCargas'
import { Carga } from '../../../../lib/types/carga'
import { Spinner } from '../../../../components/ui/Spinner'
import { Button } from '../../../../components/ui/Button'
import { CargaStatusBadge } from '../../../../components/cargas/CargaStatusBadge'

function formatDate(value?: string) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('pt-MZ', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date)
}

function place(value?: Carga['origem']) {
  if (!value) return 'Local não indicado'
  return [value.cidade, value.pais].filter(Boolean).join(', ') || value.endereco || 'Local não indicado'
}

function normalise(value?: string) {
  return (value || '').toLocaleLowerCase('pt-MZ').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export default function MinhasCargasPage() {
  const { cargas, loading, refreshing, error, refresh } = useMotoristaCargas()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('todas')

  const filtered = useMemo(() => cargas.filter(carga => {
    const query = normalise(search)
    const matchesSearch = !query || [carga.codigoRastreio, carga.numeroOrdem, carga.descricao, carga.tipoMercadoria, carga.origem?.cidade, carga.destino?.cidade]
      .some(value => normalise(value).includes(query))
    const matchesStatus = status === 'todas' || normalise(carga.status) === status
    return matchesSearch && matchesStatus
  }), [cargas, search, status])

  const activeCount = cargas.filter(c => !['entregue', 'cancelada', 'suspensa', 'extraviada'].includes(normalise(c.status))).length
  const deliveredCount = cargas.filter(c => normalise(c.status) === 'entregue').length

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Spinner size="xl" label="A carregar as suas cargas" /></div>

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-300">Área do motorista</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight lg:text-3xl">Minhas cargas</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">Consulte as cargas que lhe foram atribuídas e acompanhe o respectivo estado de transporte.</p>
          </div>
          <Button variant="secondary" onClick={refresh} loading={refreshing} leftIcon={<RefreshCw className="h-4 w-4" />}>Actualizar</Button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:max-w-lg">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">Cargas atribuídas</p><p className="mt-1 text-3xl font-bold">{cargas.length}</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs text-slate-400">Em acompanhamento</p><p className="mt-1 text-3xl font-bold">{activeCount}</p></div>
        </div>
      </section>

      {error && (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={refresh} loading={refreshing} leftIcon={<RefreshCw className="h-4 w-4" />}>Tentar novamente</Button>
        </div>
      )}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Summary label="Total de cargas" value={cargas.length} icon={<Package />} />
        <Summary label="Em transporte / activas" value={activeCount} icon={<Truck />} />
        <Summary label="Entregues" value={deliveredCount} icon={<Route />} />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div><h2 className="text-lg font-bold text-slate-900">Lista de cargas</h2><p className="text-sm text-slate-500">{filtered.length} resultado(s)</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative block sm:min-w-72"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar código, mercadoria ou destino..." className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
            <select value={status} onChange={e => setStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500">
              <option value="todas">Todos os estados</option>
              <option value="registada">Registada</option>
              <option value="em_preparacao">Em preparação</option>
              <option value="pronta_para_transporte">Pronta para transporte</option>
              <option value="em_transito">Em trânsito</option>
              <option value="em_posto_controlo">Em posto de controlo</option>
              <option value="em_fronteira">Em fronteira</option>
              <option value="em_porto">Em porto</option>
              <option value="em_armazem">Em armazém</option>
              <option value="em_distribuicao">Em distribuição</option>
              <option value="entregue">Entregue</option>
              <option value="suspensa">Suspensa</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        {error && cargas.length === 0 ? (
          <EmptyState title="Não foi possível carregar as cargas" description="Verifique a ligação e tente novamente. Se o problema continuar, contacte a Central." />
        ) : cargas.length === 0 ? (
          <EmptyState title="Ainda não tem cargas atribuídas" description="Quando a Central ou o transportador lhe atribuir uma carga, ela aparecerá nesta página." />
        ) : filtered.length === 0 ? (
          <EmptyState title="Nenhuma carga encontrada" description="Altere os termos de pesquisa ou o filtro de estado." />
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filtered.map(carga => <CargaCard key={carga.cargaId} carga={carga} />)}
          </div>
        )}
      </section>
    </div>
  )
}

function Summary({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-sm text-slate-500">{label}</p><span className="rounded-xl bg-blue-50 p-2 text-blue-600">{React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'h-4 w-4' })}</span></div><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p></div>
}

function CargaCard({ carga }: { carga: Carga }) {
  const delivered = normalise(carga.status) === 'entregue'
  return <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 p-5">
      <div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Código de rastreio</p><h3 className="mt-1 break-all text-lg font-bold text-slate-900">{carga.codigoRastreio || carga.numeroOrdem || carga.cargaId}</h3><p className="mt-1 text-sm text-slate-500">{carga.descricao || carga.tipoMercadoria || 'Sem descrição'}</p></div>
      <CargaStatusBadge status={carga.status || 'registada'} />
    </div>
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 py-4">
      <div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Origem</p><p className="mt-1 truncate text-sm font-semibold text-slate-800">{place(carga.origem)}</p></div>
      <ArrowRight className="h-4 w-4 text-slate-400" />
      <div className="min-w-0 text-right"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Destino</p><p className="mt-1 truncate text-sm font-semibold text-slate-800">{place(carga.destino)}</p></div>
    </div>
    <div className="grid grid-cols-1 gap-3 border-t border-slate-100 px-5 py-4 text-sm sm:grid-cols-2">
      <div className="flex items-center gap-2 text-slate-500"><Truck className="h-4 w-4 shrink-0" /><span>{carga.viatura?.matricula || 'Viatura não indicada'}</span></div>
      <div className="flex items-center gap-2 text-slate-500"><CalendarClock className="h-4 w-4 shrink-0" /><span>{formatDate(carga.dataAtualizacao || carga.dataHoraStatus)}</span></div>
      <div className="flex items-center gap-2 text-slate-500 sm:col-span-2"><MapPin className="h-4 w-4 shrink-0" /><span>{carga.localizacaoAtual?.cidade || carga.localizacaoAtual?.endereco || 'Localização não actualizada'}</span></div>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4">
      <span className="text-xs text-slate-500">{Array.isArray(carga.etapas) ? carga.etapas.length : 0} etapa(s) registada(s) · {Array.isArray(carga.ocorrencias) ? carga.ocorrencias.length : 0} ocorrência(s)</span>
      <div className="flex flex-wrap gap-2">
        <Link href={`/rastrear?codigo=${encodeURIComponent(carga.codigoRastreio || '')}`} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-blue-700">Acompanhar <ArrowRight className="h-3.5 w-3.5" /></Link>
        {!delivered && <Link href="/motorista" className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">Actualizar carga <ArrowRight className="h-3.5 w-3.5" /></Link>}
      </div>
    </div>
  </article>
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><Package className="mx-auto h-9 w-9 text-slate-300" /><h3 className="mt-3 font-semibold text-slate-800">{title}</h3><p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{description}</p></div>
}
