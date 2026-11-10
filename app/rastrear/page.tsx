/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

import { cargaApi } from '../../lib/api/cargas'
import { CargaStatusBadge } from '../../components/cargas/CargaStatusBadge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'

import {
  Package,
  Search,
  ArrowRight,
  MapPin,
  Clock3,
  Route,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react'

import Link from 'next/link'

// Carregar o mapa exclusivamente no navegador.
// O Leaflet depende do objecto window.
const CargaMap = dynamic(
  () =>
    import('../../components/cargas/CargaMap').then(
      (mod) => mod.CargaMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[480px] flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-sm text-slate-500">
            A carregar mapa...
          </p>
        </div>
      </div>
    ),
  }
)

export default function RastrearPage() {
  const [codigo, setCodigo] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [carga, setCarga] = useState<any>(null)

  const rastrear = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!codigo.trim()) return

    setLoading(true)
    setErro('')
    setCarga(null)

    try {
      const r = await cargaApi.getByRastreio(
        codigo.trim().toUpperCase()
      )

      if (r.returnCode === 200) {
        setCarga(r.data)
      } else {
        setErro(r.returnMsg || 'Carga não encontrada')
      }
    } catch (e: any) {
      setErro(
        e?.response?.data?.returnMsg ||
        'Não foi possível consultar o código de rastreio'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">

      {/* Cabeçalho */}
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto h-16 px-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>

            <span className="font-bold">
              Cargo<span className="text-blue-600">Track</span>
            </span>
          </Link>

          <Link
            href="/login"
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            Área administrativa →
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 py-12 lg:py-16">

        {/* Pesquisa de rastreamento */}
        <section className="text-center max-w-3xl mx-auto">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Rastreio público seguro
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mt-5">
            Onde está a sua carga?
          </h1>

          <p className="text-slate-500 mt-4">
            Introduza o código de rastreio para consultar o estado,
            a rota e a última localização disponível.
          </p>

          <form
            onSubmit={rastrear}
            className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
          >
            <input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Ex.: TRK-ABC123"
              className="flex-1 h-13 rounded-2xl border border-slate-200 bg-white px-5 font-mono text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />

            <Button
              type="submit"
              size="lg"
              className="h-13 px-7"
              loading={loading}
              leftIcon={
                !loading ? <Search className="w-4 h-4" /> : undefined
              }
            >
              Rastrear
            </Button>
          </form>

          {erro && (
            <div className="mt-4 inline-flex items-center gap-2 text-sm text-rose-600">
              <AlertTriangle className="w-4 h-4" />
              {erro}
            </div>
          )}
        </section>

        {/* Carregamento da consulta */}
        {loading && (
          <div className="mt-12 flex justify-center">
            <Spinner size="lg" label="Consultando" />
          </div>
        )}

        {/* Resultado do rastreamento */}
        {carga && (
          <section className="mt-12 space-y-5 animate-fade-in">

            <Card className="border-0 shadow-lg overflow-hidden">
              <CardBody className="p-6 lg:p-8">

                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">

                  <div>
                    <p className="font-mono text-xs text-blue-600 font-semibold tracking-wider">
                      {carga.codigoRastreio}
                    </p>

                    <h2 className="text-2xl font-bold mt-1">
                      {carga.descricao}
                    </h2>

                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                      <span>{carga.origem?.cidade}</span>
                      <ArrowRight className="w-4 h-4" />
                      <span>{carga.destino?.cidade}</span>
                    </div>
                  </div>

                  <CargaStatusBadge status={carga.status} />

                </div>

                {/* Informações da carga */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-7">

                  <Info
                    icon={<MapPin className="w-4 h-4" />}
                    label="Localização"
                    value={
                      carga.localizacaoAtual?.cidade ||
                      carga.localizacaoAtual?.endereco ||
                      'Indisponível'
                    }
                  />

                  <Info
                    icon={<Route className="w-4 h-4" />}
                    label="Progresso"
                    value={`${carga.progresso || 0}%`}
                  />

                  <Info
                    icon={<Clock3 className="w-4 h-4" />}
                    label="Previsão"
                    value={
                      carga.destino?.dataHoraPrevistaChegada
                        ? new Date(
                            carga.destino.dataHoraPrevistaChegada
                          ).toLocaleString('pt-MZ', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })
                        : '—'
                    }
                  />

                  <Info
                    icon={<ShieldCheck className="w-4 h-4" />}
                    label="Actualizado"
                    value={
                      carga.dataAtualizacao
                        ? new Date(
                            carga.dataAtualizacao
                          ).toLocaleString('pt-MZ', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })
                        : '—'
                    }
                  />

                </div>
              </CardBody>
            </Card>

            {/* Mapa e linha da viagem */}
            <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_.5fr] gap-5">

              <Card className="border-0 shadow-lg overflow-hidden">
                <CardBody className="p-0">
                  <div className="h-[480px]">

                    <CargaMap
                      localizacaoAtual={carga.localizacaoAtual || null}
                      origem={{
                        ...carga.origem,
                        coordenadas: carga.origem?.coordenadas,
                      }}
                      destino={{
                        ...carga.destino,
                        coordenadas: carga.destino?.coordenadas,
                      }}
                      rota={carga.rota}
                      height="480px"
                    />

                  </div>
                </CardBody>
              </Card>

              {/* Linha da viagem */}
              <Card className="border-0 shadow-lg">
                <CardBody className="p-6">

                  <h3 className="font-semibold">
                    Linha da viagem
                  </h3>

                  <div className="mt-5 space-y-5">

                    {(carga.rota?.pontosPassagem || [])
                      .slice()
                      .sort((a: any, b: any) => a.ordem - b.ordem)
                      .map((p: any, i: number) => (
                        <div
                          key={`${p.ordem}-${i}`}
                          className="relative pl-7"
                        >
                          <span className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-50" />

                          <div className="text-sm font-medium">
                            {p.nome}
                          </div>

                          <div className="text-xs text-slate-400">
                            {p.cidade}, {p.pais}
                          </div>
                        </div>
                      ))}

                    {!carga.rota?.pontosPassagem?.length && (
                      <p className="text-sm text-slate-400">
                        Sem pontos de passagem registados.
                      </p>
                    )}

                  </div>
                </CardBody>
              </Card>

            </div>
          </section>
        )}

      </div>
    </main>
  )
}

// Componente de informação
function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-slate-400 text-xs">
        {icon}
        {label}
      </div>

      <p className="mt-2 text-sm font-semibold text-slate-800 truncate">
        {value}
      </p>
    </div>
  )
}
