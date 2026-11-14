/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  RefreshCw,
  Search,
} from 'lucide-react'
import { useMotoristaCargas } from '../../../../lib/hooks/useMotoristaCargas'
import { cargaApi } from '../../../../lib/api/cargas'
import { Carga, Etapa, LocalizacaoAtual, Ocorrencia } from '../../../../lib/types/carga'
import { Spinner } from '../../../../components/ui/Spinner'
import { Button } from '../../../../components/ui/Button'

type EventType = 'etapa' | 'ocorrencia' | 'localizacao' | 'entrega'
type HistoryEvent = {
  id: string
  type: EventType
  title: string
  description: string
  date?: string
  cargaId: string
  code: string
  location?: string
  status?: string
  severity?: string
}

function formatDate(value?: string) {
  if (!value) return 'Data não indicada'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Data não indicada'
  return new Intl.DateTimeFormat('pt-MZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function normalise(value?: string) {
  return (value || '').toLocaleLowerCase('pt-MZ').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function eventLabel(value?: string) {
  if (!value) return 'Actividade registada'
  return value.replaceAll('_', ' ').replace(/\b\w/g, char => char.toLocaleUpperCase('pt-MZ'))
}

function locationLabel(value?: { endereco?: string; cidade?: string; pais?: string }) {
  if (!value) return undefined
  return [value.endereco, value.cidade, value.pais].filter(Boolean).join(', ') || undefined
}

function buildEvents(cargas: Carga[]): HistoryEvent[] {
  const events: HistoryEvent[] = []

  cargas.forEach(carga => {
    const code = carga.codigoRastreio || carga.numeroOrdem || carga.cargaId

    ;(Array.isArray(carga.etapas) ? carga.etapas : []).forEach((etapa: Etapa, index) => {
      events.push({
        id: `etapa-${carga.cargaId}-${etapa.etapaId || index}`,
        type: 'etapa',
        title: eventLabel(etapa.nome),
        description: etapa.descricao || etapa.observacoes || 'Etapa adicionada ao acompanhamento da carga.',
        date: etapa.dataHoraFim || etapa.dataHoraInicio,
        cargaId: carga.cargaId,
        code,
        location: locationLabel(etapa.localizacao),
        status: etapa.status,
      })
    })

    ;(Array.isArray(carga.ocorrencias) ? carga.ocorrencias : []).forEach((ocorrencia: Ocorrencia, index) => {
      events.push({
        id: `ocorrencia-${carga.cargaId}-${ocorrencia.ocorrenciaId || index}`,
        type: 'ocorrencia',
        title: `Ocorrência: ${eventLabel(ocorrencia.tipo)}`,
        description: ocorrencia.descricao,
        date: ocorrencia.dataHora,
        cargaId: carga.cargaId,
        code,
        location: locationLabel(ocorrencia.localizacao),
        status: ocorrencia.status,
        severity: ocorrencia.gravidade,
      })
    })

    ;(Array.isArray(carga.historicoLocalizacoes) ? carga.historicoLocalizacoes : []).forEach((localizacao: LocalizacaoAtual, index) => {
      events.push({
        id: `gps-${carga.cargaId}-${localizacao.dataHora || index}`,
        type: 'localizacao',
        title: 'Localização actualizada',
        description: [
          localizacao.cidade,
          localizacao.pais,
          localizacao.velocidade != null ? `${Math.round(localizacao.velocidade)} km/h` : undefined,
        ].filter(Boolean).join(' · ') || 'Posição GPS registada.',
        date: localizacao.dataHora,
        cargaId: carga.cargaId,
        code,
        location: locationLabel(localizacao),
      })
    })

    if (carga.confirmacaoEntrega?.realizada) {
      events.push({
        id: `entrega-${carga.cargaId}`,
        type: 'entrega',
        title: 'Entrega confirmada',
        description: carga.confirmacaoEntrega.observacao || `Entrega confirmada${carga.confirmacaoEntrega.clienteNome ? ` por ${carga.confirmacaoEntrega.clienteNome}` : ''}.`,
        date: carga.confirmacaoEntrega.dataHora,
        cargaId: carga.cargaId,
        code,
        location: carga.destino ? [carga.destino.cidade, carga.destino.pais].filter(Boolean).join(', ') : undefined,
      })
    }
  })

  return events.sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0
    const dateB = b.date ? new Date(b.date).getTime() : 0
    return dateB - dateA
  })
}

export default function HistoricoMotoristaPage() {
  const { cargas, loading, refreshing, error, refresh } = useMotoristaCargas()
  const [historyCargas, setHistoryCargas] = useState<Carga[]>([])
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('todos')

  // A listagem pode trazer apenas um resumo. Nesta página carregamos os detalhes
  // e o histórico de GPS pelas operações que já existem na API.
  useEffect(() => {
    if (loading) return

    let cancelled = false

    if (cargas.length === 0) {
      setHistoryCargas([])
      setDetailsLoading(false)
      return
    }

    const loadDetails = async () => {
      setDetailsLoading(true)

      const results = await Promise.all(cargas.map(async carga => {
        let current: Carga = carga

        try {
          const detailResponse = await cargaApi.getDetail(carga.cargaId)
          if (detailResponse.returnCode === 200 && detailResponse.data) {
            current = { ...carga, ...detailResponse.data }
          }
        } catch {
          // Mantém os dados da listagem se o detalhe não estiver disponível.
        }

        try {
          const locationResponse = await cargaApi.getHistoricoLocalizacoes(carga.cargaId, undefined, undefined, 100, 1)
          if (locationResponse.returnCode === 200 && Array.isArray(locationResponse.data?.historico)) {
            current = { ...current, historicoLocalizacoes: locationResponse.data.historico as LocalizacaoAtual[] }
          }
        } catch {
          // As restantes actividades continuam disponíveis mesmo sem histórico GPS.
        }

        return current
      }))

      if (!cancelled) setHistoryCargas(results)
      if (!cancelled) setDetailsLoading(false)
    }

    void loadDetails()

    return () => {
      cancelled = true
    }
  }, [cargas, loading])

  const events = useMemo(() => buildEvents(historyCargas), [historyCargas])
  const filtered = useMemo(() => events.filter(event => {
    const query = normalise(search)
    const matchesQuery = !query || [event.title, event.description, event.code, event.location].some(value => normalise(value).includes(query))
    return matchesQuery && (type === 'todos' || event.type === type)
  }), [events, search, type])

  if (loading || detailsLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Spinner size="xl" label={detailsLoading ? 'A carregar os registos das cargas' : 'A carregar o histórico'} /></div>
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <section className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl lg:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-300">Área do motorista</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight lg:text-3xl">Histórico de registos</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">Consulte cronologicamente as etapas, ocorrências, actualizações de localização e entregas das suas cargas.</p>
          </div>
          <Button variant="secondary" onClick={refresh} loading={refreshing} leftIcon={<RefreshCw className="h-4 w-4" />}>Actualizar</Button>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"><p className="text-xs text-slate-400">Registos encontrados</p><p className="mt-1 text-2xl font-bold">{events.length}</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"><p className="text-xs text-slate-400">Cargas no histórico</p><p className="mt-1 text-2xl font-bold">{historyCargas.length}</p></div>
        </div>
      </section>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <section className="flex flex-col gap-3 sm:flex-row">
        <label className="relative block flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar por carga, actividade ou localização..." className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        </label>
        <select value={type} onChange={e => setType(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 sm:min-w-56">
          <option value="todos">Todos os registos</option>
          <option value="etapa">Etapas / actividades</option>
          <option value="ocorrencia">Ocorrências</option>
          <option value="localizacao">Localizações GPS</option>
          <option value="entrega">Entregas</option>
        </select>
      </section>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <Activity className="mx-auto h-9 w-9 text-slate-300" />
          <h2 className="mt-3 font-semibold text-slate-800">{events.length ? 'Nenhum registo encontrado' : 'Ainda não existem registos'}</h2>
          <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">{events.length ? 'Experimente alterar a pesquisa ou o tipo de registo.' : 'Os acontecimentos registados nas suas cargas serão apresentados aqui.'}</p>
          <Link href="/motorista/cargas" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800">Consultar minhas cargas <Package className="h-4 w-4" /></Link>
        </div>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div><h2 className="font-bold text-slate-900">Actividade recente</h2><p className="text-xs text-slate-500">{filtered.length} registo(s)</p></div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Mais recentes primeiro</span>
          </div>
          <div className="divide-y divide-slate-100">{filtered.map(event => <HistoryRow key={event.id} event={event} />)}</div>
        </section>
      )}
    </div>
  )
}

function HistoryRow({ event }: { event: HistoryEvent }) {
  const icon = event.type === 'ocorrencia'
    ? <AlertTriangle className="h-4 w-4" />
    : event.type === 'localizacao'
      ? <MapPin className="h-4 w-4" />
      : event.type === 'entrega'
        ? <CheckCircle2 className="h-4 w-4" />
        : <Activity className="h-4 w-4" />
  const tone = event.type === 'ocorrencia'
    ? 'bg-amber-50 text-amber-700'
    : event.type === 'entrega'
      ? 'bg-emerald-50 text-emerald-700'
      : event.type === 'localizacao'
        ? 'bg-cyan-50 text-cyan-700'
        : 'bg-blue-50 text-blue-700'

  return (
    <article className="flex gap-3 px-5 py-5 sm:gap-4">
      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0"><h3 className="font-semibold text-slate-900">{event.title}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{event.description}</p></div>
          <time className="shrink-0 text-xs text-slate-500">{formatDate(event.date)}</time>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1"><Package className="h-3.5 w-3.5" />{event.code}</span>
          {event.location && <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{event.location}</span>}
          {event.status && <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{eventLabel(event.status)}</span>}
          {event.severity && <span className="inline-flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" />Gravidade: {eventLabel(event.severity)}</span>}
        </div>
        <Link href={`/rastrear?codigo=${encodeURIComponent(event.code)}`} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800">Ver carga <CalendarClock className="h-3.5 w-3.5" /></Link>
      </div>
    </article>
  )
}
