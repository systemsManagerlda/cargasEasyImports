/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(dashboard)/cargas/[id]/editar/page.tsx

'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Save,
  Package,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'

import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { Alert } from '@/components/ui/Alert'

import { cargaApi } from '@/lib/api/cargas'
import {
  Carga,
  CreateCargaData,
} from '@/lib/types/carga'

type Prioridade =
  | 'baixa'
  | 'media'
  | 'alta'
  | 'urgente'

type TipoMercadoria =
  | 'alimentos'
  | 'bebidas'
  | 'produtos_quimicos'
  | 'produtos_perigosos'
  | 'materiais_construcao'
  | 'eletronicos'
  | 'moveis'
  | 'veiculos'
  | 'medicamentos'
  | 'tecidos'
  | 'papel'
  | 'plastico'
  | 'metal'
  | 'madeira'
  | 'agricolas'
  | 'pecuaria'
  | 'outros'

export default function EditarCargaPage() {
  const params = useParams()
  const router = useRouter()

  const cargaId = params.id as string

  const [carga, setCarga] = useState<Carga | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [descricao, setDescricao] = useState('')
  const [peso, setPeso] = useState('')
  const [volume, setVolume] = useState('')
  const [valorDeclarado, setValorDeclarado] = useState('')
  const [tipoMercadoria, setTipoMercadoria] =
  useState<TipoMercadoria>('outros')

  const [prioridade, setPrioridade] =
  useState<Prioridade>('media')

  const [origemEndereco, setOrigemEndereco] = useState('')
  const [origemCidade, setOrigemCidade] = useState('')
  const [origemPais, setOrigemPais] = useState('')

  const [destinoEndereco, setDestinoEndereco] = useState('')
  const [destinoCidade, setDestinoCidade] = useState('')
  const [destinoPais, setDestinoPais] = useState('')

  useEffect(() => {
    if (!cargaId) return

    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        const response =
          await cargaApi.getDetail(cargaId)

        if (response.returnCode !== 200) {
          throw new Error(
            response.returnMsg ||
              'Não foi possível carregar a carga.'
          )
        }

        const data = response.data

        setCarga(data)

        setDescricao(data.descricao || '')
        setPeso(String(data.peso ?? ''))
        setVolume(String(data.volume ?? ''))
        setValorDeclarado(
          String(data.valorDeclarado ?? '')
        )

        setTipoMercadoria(
        (data.tipoMercadoria || 'outros') as TipoMercadoria
        )

        setPrioridade(
        (data.prioridade || 'media') as Prioridade
        )

        setOrigemEndereco(
          data.origem?.endereco || ''
        )

        setOrigemCidade(
          data.origem?.cidade || ''
        )

        setOrigemPais(
          data.origem?.pais || ''
        )

        setDestinoEndereco(
          data.destino?.endereco || ''
        )

        setDestinoCidade(
          data.destino?.cidade || ''
        )

        setDestinoPais(
          data.destino?.pais || ''
        )

      } catch (err: any) {
        setError(
          err?.response?.data?.returnMsg ||
            err?.message ||
            'Erro ao carregar carga.'
        )
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [cargaId])

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault()

    if (!carga) return

    if (!descricao.trim()) {
      toast.error('Informe a descrição da carga.')
      return
    }

    if (!peso || Number(peso) <= 0) {
      toast.error('Informe um peso válido.')
      return
    }

    if (!volume || Number(volume) <= 0) {
      toast.error('Informe um volume válido.')
      return
    }

    if (
      !valorDeclarado ||
      Number(valorDeclarado) < 0
    ) {
      toast.error(
        'Informe um valor declarado válido.'
      )
      return
    }

    try {
      setSaving(true)

      const payload: Partial<CreateCargaData> = {
        descricao: descricao.trim(),

        tipoMercadoria,

        peso: Number(peso),

        volume: Number(volume),

        valorDeclarado: Number(valorDeclarado),

        prioridade,

        origem: {
            ...carga.origem,
            endereco: origemEndereco,
            cidade: origemCidade,
            pais: origemPais,
        },

        destino: {
            ...carga.destino,
            endereco: destinoEndereco,
            cidade: destinoCidade,
            pais: destinoPais,
        },
        }

      const response =
        await cargaApi.update(
          cargaId,
          payload
        )

      if (response.returnCode !== 200) {
        throw new Error(
          response.returnMsg ||
            'Não foi possível atualizar a carga.'
        )
      }

      toast.success(
        'Carga atualizada com sucesso.'
      )

      router.push(
        `/cargas/${cargaId}`
      )

      router.refresh()

    } catch (err: any) {
      toast.error(
        err?.response?.data?.returnMsg ||
          err?.message ||
          'Erro ao atualizar carga.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute
        requiredPermissions={['editarCarga']}
      >
        <div className="min-h-[500px] flex items-center justify-center">
          <div className="text-center">
            <Spinner size="xl" />
            <p className="mt-4 text-sm text-slate-500">
              Carregando carga...
            </p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !carga) {
    return (
      <ProtectedRoute
        requiredPermissions={['editarCarga']}
      >
        <div className="container mx-auto px-4 py-8">

          <Alert variant="danger">
            {error ||
              'Carga não encontrada.'}
          </Alert>

          <Link
            href="/cargas"
            className="inline-block mt-4"
          >
            <Button>
              Voltar para cargas
            </Button>
          </Link>

        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute
      requiredPermissions={['editarCarga']}
    >
      <div className="container mx-auto px-4 py-6 md:py-8">

        <div className="flex items-center gap-4 mb-6">

          <Link href={`/cargas/${cargaId}`}>

            <Button
              variant="outline"
              size="sm"
              leftIcon={
                <ArrowLeft className="w-4 h-4" />
              }
            >
              Voltar
            </Button>

          </Link>

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-2xl bg-slate-900 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>

            <div>

              <h1 className="text-2xl font-bold text-slate-900">
                Editar carga
              </h1>

              <p className="text-sm text-slate-500">
                {carga.codigoRastreio}
              </p>

            </div>

          </div>

        </div>


        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          <Card className="border-0 shadow-sm">

            <CardHeader className="border-b border-slate-100">

              <CardTitle>
                Informações da carga
              </CardTitle>

              <CardDescription>
                Atualize os dados principais da carga.
              </CardDescription>

            </CardHeader>

            <CardBody className="p-6">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div className="md:col-span-2">

                  <Input
                    label="Descrição"
                    value={descricao}
                    onChange={(e) =>
                      setDescricao(e.target.value)
                    }
                    required
                  />

                </div>

                <Input
                  label="Peso (kg)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={peso}
                  onChange={(e) =>
                    setPeso(e.target.value)
                  }
                  required
                />

                <Input
                  label="Volume (m³)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={volume}
                  onChange={(e) =>
                    setVolume(e.target.value)
                  }
                  required
                />

                <Input
                  label="Valor declarado"
                  type="number"
                  min="0"
                  step="0.01"
                  value={valorDeclarado}
                  onChange={(e) =>
                    setValorDeclarado(
                      e.target.value
                    )
                  }
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tipo de mercadoria
                  </label>

                  <select
                    value={tipoMercadoria}
                    onChange={(e) =>
                    setTipoMercadoria(
                        e.target.value as TipoMercadoria
                    )
                    }
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
                  >
                    <option value="alimentos">
                      Alimentos
                    </option>

                    <option value="bebidas">
                      Bebidas
                    </option>

                    <option value="produtos_quimicos">
                      Produtos químicos
                    </option>

                    <option value="produtos_perigosos">
                      Produtos perigosos
                    </option>

                    <option value="materiais_construcao">
                      Materiais de construção
                    </option>

                    <option value="eletronicos">
                      Eletrónicos
                    </option>

                    <option value="moveis">
                      Móveis
                    </option>

                    <option value="veiculos">
                      Veículos
                    </option>

                    <option value="medicamentos">
                      Medicamentos
                    </option>

                    <option value="tecidos">
                      Tecidos
                    </option>

                    <option value="papel">
                      Papel
                    </option>

                    <option value="plastico">
                      Plástico
                    </option>

                    <option value="metal">
                      Metal
                    </option>

                    <option value="madeira">
                      Madeira
                    </option>

                    <option value="agricolas">
                      Agrícolas
                    </option>

                    <option value="pecuaria">
                      Pecuária
                    </option>

                    <option value="outros">
                      Outros
                    </option>

                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Prioridade
                  </label>

                  <select
                    value={prioridade}
                    onChange={(e) =>
                        setPrioridade(
                        e.target.value as Prioridade
                        )
                    }
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
                  >
                    <option value="baixa">
                      Baixa
                    </option>

                    <option value="media">
                      Média
                    </option>

                    <option value="alta">
                      Alta
                    </option>

                    <option value="urgente">
                      Urgente
                    </option>

                  </select>
                </div>

              </div>

            </CardBody>

          </Card>


          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <Card className="border-0 shadow-sm">

              <CardHeader>
                <CardTitle>
                  Origem
                </CardTitle>
              </CardHeader>

              <CardBody className="space-y-4">

                <Input
                  label="Endereço"
                  value={origemEndereco}
                  onChange={(e) =>
                    setOrigemEndereco(
                      e.target.value
                    )
                  }
                />

                <Input
                  label="Cidade"
                  value={origemCidade}
                  onChange={(e) =>
                    setOrigemCidade(
                      e.target.value
                    )
                  }
                />

                <Input
                  label="País"
                  value={origemPais}
                  onChange={(e) =>
                    setOrigemPais(
                      e.target.value
                    )
                  }
                />

              </CardBody>

            </Card>


            <Card className="border-0 shadow-sm">

              <CardHeader>
                <CardTitle>
                  Destino
                </CardTitle>
              </CardHeader>

              <CardBody className="space-y-4">

                <Input
                  label="Endereço"
                  value={destinoEndereco}
                  onChange={(e) =>
                    setDestinoEndereco(
                      e.target.value
                    )
                  }
                />

                <Input
                  label="Cidade"
                  value={destinoCidade}
                  onChange={(e) =>
                    setDestinoCidade(
                      e.target.value
                    )
                  }
                />

                <Input
                  label="País"
                  value={destinoPais}
                  onChange={(e) =>
                    setDestinoPais(
                      e.target.value
                    )
                  }
                />

              </CardBody>

            </Card>

          </div>


          <div className="flex justify-end gap-3">

            <Link href={`/cargas/${cargaId}`}>

              <Button
                type="button"
                variant="outline"
              >
                Cancelar
              </Button>

            </Link>

            <Button
              type="submit"
              disabled={saving}
              leftIcon={
                saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )
              }
            >
              {saving
                ? 'A guardar...'
                : 'Guardar alterações'}
            </Button>

          </div>

        </form>

      </div>
    </ProtectedRoute>
  )
}