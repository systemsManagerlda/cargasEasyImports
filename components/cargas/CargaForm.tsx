
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { AutocompleteSelect } from '@/components/ui/AutocompleteSelect';
import { Alert } from '@/components/ui/Alert';

import { cargaApi } from '@/lib/api/cargas';
import { clienteApi, Cliente } from '@/lib/api/clientes';
import { apiClient } from '@/lib/api/client';
import { useCargaFormData } from '@/lib/hooks/useCargaFormData';
import { CreateCargaData } from '@/lib/types/carga';

import {
  Package,
  MapPin,
  User,
  Truck,
  DollarSign,
  Weight,
  Ruler,
  Building,
  Map,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

// ============================================================
// VALIDAÇÃO DO FORMULÁRIO
// ============================================================

const cargaSchema = z.object({
  descricao: z.string().min(3, 'Descrição deve ter pelo menos 3 caracteres'),
  tipoMercadoria: z.string().min(1, 'Seleccione o tipo de mercadoria'),

  peso: z.coerce.number().min(0.1, 'Peso deve ser maior que 0'),
  volume: z.coerce.number().min(0.1, 'Volume deve ser maior que 0'),
  valorDeclarado: z.coerce.number().min(0, 'Valor deve ser maior ou igual a 0'),

  origemEndereco: z.string().min(3, 'Endereço de origem é obrigatório'),
  origemCidade: z.string().min(2, 'Cidade de origem é obrigatória'),
  origemPais: z.string().min(2, 'País de origem é obrigatório'),

  destinoEndereco: z.string().min(3, 'Endereço de destino é obrigatório'),
  destinoCidade: z.string().min(2, 'Cidade de destino é obrigatória'),
  destinoPais: z.string().min(2, 'País de destino é obrigatório'),

  clienteId: z.string().min(1, 'Seleccione um cliente'),
  transportadorId: z.string().min(1, 'Seleccione um transportador'),
  motoristaId: z.string().min(1, 'Seleccione um motorista'),

  viaturaMatricula: z.string().min(3, 'Matrícula da viatura é obrigatória'),
  viaturaMarca: z.string().optional(),
  viaturaModelo: z.string().optional(),
  viaturaAno: z.coerce.number().optional(),
  viaturaCor: z.string().optional(),
  viaturaCapacidadeCarga: z.coerce.number().optional(),
  viaturaTipoViatura: z.string().optional(),
});

type CargaFormData = z.infer<typeof cargaSchema>;

// ============================================================
// OPÇÕES
// ============================================================

const tipoMercadoriaOptions = [
  { value: 'alimentos', label: 'Alimentos' },
  { value: 'bebidas', label: 'Bebidas' },
  { value: 'produtos_quimicos', label: 'Produtos Químicos' },
  { value: 'produtos_perigosos', label: 'Produtos Perigosos' },
  { value: 'materiais_construcao', label: 'Materiais de Construção' },
  { value: 'eletronicos', label: 'Electrónicos' },
  { value: 'moveis', label: 'Móveis' },
  { value: 'veiculos', label: 'Veículos' },
  { value: 'medicamentos', label: 'Medicamentos' },
  { value: 'tecidos', label: 'Tecidos' },
  { value: 'papel', label: 'Papel' },
  { value: 'plastico', label: 'Plástico' },
  { value: 'metal', label: 'Metal' },
  { value: 'madeira', label: 'Madeira' },
  { value: 'agricolas', label: 'Agrícolas' },
  { value: 'pecuaria', label: 'Pecuária' },
  { value: 'outros', label: 'Outros' },
];

const paisOptions = [
  { value: 'Moçambique', label: 'Moçambique' },
  { value: 'África do Sul', label: 'África do Sul' },
  { value: 'Zimbábue', label: 'Zimbábue' },
  { value: 'Zâmbia', label: 'Zâmbia' },
  { value: 'Malawi', label: 'Malawi' },
  { value: 'Tanzânia', label: 'Tanzânia' },
  { value: 'Quénia', label: 'Quénia' },
  { value: 'Uganda', label: 'Uganda' },
  { value: 'Ruanda', label: 'Ruanda' },
  { value: 'Burundi', label: 'Burundi' },
  { value: 'Angola', label: 'Angola' },
  { value: 'Botswana', label: 'Botswana' },
  { value: 'Namíbia', label: 'Namíbia' },
  { value: 'Suazilândia', label: 'Suazilândia' },
  { value: 'Lesoto', label: 'Lesoto' },
];

const tipoViaturaOptions = [
  { value: 'camião', label: 'Camião' },
  { value: 'carreta', label: 'Carreta' },
  { value: 'furgão', label: 'Furgão' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'van', label: 'Van' },
  { value: 'outro', label: 'Outro' },
];

// ============================================================
// INTERFACES
// ============================================================

interface Transportador {
  transportadorId: string;
  nome: string;
  email?: string;
  telefone?: string;
  nif?: string | null;
  endereco?: string;
  licenca?: string | null;
  ativo?: boolean;
}

interface CargaFormProps {
  onSuccess?: (cargaId: string) => void;
}

// ============================================================
// COMPONENTE
// ============================================================

export const CargaForm: React.FC<CargaFormProps> = ({ onSuccess }) => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ----------------------------------------------------------
  // CLIENTES
  // ----------------------------------------------------------

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [clienteError, setClienteError] = useState<string | null>(null);

  const hasClientes = clientes.length > 0;

  // ----------------------------------------------------------
  // MOTORISTAS
  // ----------------------------------------------------------

  const {
    motoristas,
    loading: loadingMotoristas,
    error: dataError,
    fetchData,
    hasMotoristas,
  } = useCargaFormData();

  // ----------------------------------------------------------
  // TRANSPORTADORES
  // ----------------------------------------------------------

  const [transportadores, setTransportadores] = useState<Transportador[]>([]);
  const [loadingTransportadores, setLoadingTransportadores] = useState(true);
  const [transportadorError, setTransportadorError] = useState<string | null>(null);

  // ----------------------------------------------------------
  // FORMULÁRIO
  // ----------------------------------------------------------

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<
    z.input<typeof cargaSchema>,
    any,
    z.output<typeof cargaSchema>
  >({
    resolver: zodResolver(cargaSchema),
    defaultValues: {
      origemPais: 'Moçambique',
      destinoPais: 'Moçambique',
      tipoMercadoria: 'outros',
      viaturaTipoViatura: 'camião',
    },
  });

  // ============================================================
  // CARREGAR CLIENTES DA BASE DE DADOS
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const carregarClientes = async () => {
      setLoadingClientes(true);
      setClienteError(null);

      try {
        const listaCompleta: Cliente[] = [];

        let pagina = 1;
        let totalPaginas = 1;

        do {
          const response = await clienteApi.getList({
            curPage: pagina,
            pageSize: 100,
            ativo: true,
          });

          if (response.returnCode !== 200) {
            throw new Error(
              response.returnMsg || 'Não foi possível carregar os clientes.'
            );
          }

          const lista = response.data?.list || [];

          listaCompleta.push(...lista);

          totalPaginas = Math.max(
            1,
            Number(response.data?.totalPage || 1)
          );

          pagina++;

        } while (pagina <= totalPaginas);

        if (!cancelled) {
          // Apenas clientes activos
          const clientesActivos = listaCompleta.filter(
            (cliente) =>
              cliente.ativo === true &&
              (!cliente.estadoConta || cliente.estadoConta === 'ativo')
          );

          setClientes(clientesActivos);
        }

      } catch (err: any) {
        console.error('Erro ao carregar clientes:', err);

        if (!cancelled) {
          setClienteError(
            err.response?.data?.returnMsg ||
            err.response?.data?.mensagem ||
            err.message ||
            'Não foi possível carregar os clientes.'
          );

          setClientes([]);
        }

      } finally {
        if (!cancelled) {
          setLoadingClientes(false);
        }
      }
    };

    carregarClientes();

    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // CARREGAR TRANSPORTADORES DA BASE DE DADOS
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const carregarTransportadores = async () => {
      setLoadingTransportadores(true);
      setTransportadorError(null);

      try {
        const response = await apiClient.post<any>(
          '/getTransportadorList',
          {
            curPage: 1,
            pageSize: 100,
            search: '',
            ativo: true,
          }
        );

        const body =
          response?.data?.returnCode !== undefined
            ? response.data
            : response;

        if (body.returnCode !== 200) {
          throw new Error(
            body.returnMsg || 'Não foi possível carregar os transportadores.'
          );
        }

        if (!cancelled) {
          setTransportadores(body.data?.list || []);
        }

      } catch (err: any) {
        console.error('Erro ao carregar transportadores:', err);

        if (!cancelled) {
          setTransportadorError(
            err.response?.data?.returnMsg ||
            err.response?.data?.mensagem ||
            err.message ||
            'Não foi possível carregar os transportadores.'
          );

          setTransportadores([]);
        }

      } finally {
        if (!cancelled) {
          setLoadingTransportadores(false);
        }
      }
    };

    carregarTransportadores();

    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // OPÇÕES DOS CAMPOS DE SELECÇÃO
  // ============================================================

  const clienteOptions = clientes.map((cliente) => ({
    value: cliente.clienteId || cliente.utilizadorId || '',
    label: cliente.nome,
    sublabel: `${cliente.email || 'Sem e-mail'} • ${cliente.telefone || 'Sem telefone'}`,
    data: cliente,
  }));

  const transportadorOptions = transportadores.map((transportador) => ({
    value: transportador.transportadorId,
    label: transportador.nome,
  }));

  const motoristaOptions = motoristas.map((motorista) => ({
    value: motorista._id,
    label: motorista.nome,
    sublabel: `${motorista.telefone || 'Sem telefone'} • ${motorista.cartaConducao || 'Sem carta'}`,
    data: motorista,
  }));

  // ============================================================
  // CRIAR CARGA
  // ============================================================

  const onSubmit = async (data: CargaFormData) => {
    if (loadingClientes || loadingMotoristas || loadingTransportadores) {
      setError('Aguarde até que todos os dados sejam carregados.');
      return;
    }

    if (!hasClientes || !hasMotoristas || transportadores.length === 0) {
      setError(
        'Não é possível criar a carga. Confirme se existem clientes, motoristas e transportadores activos registados.'
      );
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const cliente = clientes.find(
        (c) =>
          c.clienteId === data.clienteId ||
          c.utilizadorId === data.clienteId
      );

      const motorista = motoristas.find(
        (m) => m._id === data.motoristaId
      );

      const transportador = transportadores.find(
        (t) => t.transportadorId === data.transportadorId
      );

      if (!cliente || !motorista || !transportador) {
        throw new Error(
          'Cliente, motorista ou transportador não encontrado.'
        );
      }

      // --------------------------------------------------------
      // PAYLOAD DA CARGA
      // --------------------------------------------------------

      const payload: CreateCargaData = {
        descricao: data.descricao,
        tipoMercadoria: data.tipoMercadoria || 'outros',
        peso: data.peso,
        volume: data.volume,
        valorDeclarado: data.valorDeclarado,

        unidadeMedidaPeso: 'kg',
        unidadeMedidaVolume: 'm3',

        // ORIGEM
        origem: {
          endereco: data.origemEndereco,
          cidade: data.origemCidade,
          pais: data.origemPais || 'Moçambique',
          estado: '',
          codigoPostal: '',

          coordenadas: {
            latitude: -25.969248,
            longitude: 32.573174,
          },

          pontoReferencia: '',

          contacto: {
            nome: '',
            telefone: '',
            email: '',
          },

          dataHoraPrevistaSaida: null,
          dataHoraRealSaida: null,
        },

        // DESTINO
        destino: {
          endereco: data.destinoEndereco,
          cidade: data.destinoCidade,
          pais: data.destinoPais || 'Moçambique',
          estado: '',
          codigoPostal: '',

          coordenadas: {
            latitude: -19.833333,
            longitude: 34.85,
          },

          pontoReferencia: '',

          contacto: {
            nome: '',
            telefone: '',
            email: '',
          },

          dataHoraPrevistaChegada: null,
          dataHoraRealChegada: null,
        },

        // CLIENTE SELECCIONADO DA BASE DE DADOS
        cliente: {
          clienteId: cliente.clienteId || cliente.utilizadorId || data.clienteId,
          nome: cliente.nome,
          email: cliente.email || '',
          telefone: cliente.telefone || '',
          nif: cliente.nif || '',
          endereco: cliente.endereco || '',
        },

        // TRANSPORTADOR
        transportador: {
          transportadorId: transportador.transportadorId,
          nome: transportador.nome || '',
          email: transportador.email || '',
          telefone: transportador.telefone || '',
          nif: transportador.nif || '',
          endereco: transportador.endereco || '',
          licenca: transportador.licenca || '',
        },

        // MOTORISTA
        motorista: {
          motoristaId: motorista._id,
          nome: motorista.nome,
          email: motorista.email || '',
          telefone: motorista.telefone || '',
          documentoIdentificacao: motorista.documentoIdentificacao || '',
          cartaConducao: motorista.cartaConducao || '',
          categoriaCarta: motorista.categoriaCarta || '',
          validadeCarta: motorista.validadeCarta || undefined,
          foto: '',
        },

        // VIATURA
        viatura: {
          matricula: data.viaturaMatricula,
          marca: data.viaturaMarca || '',
          modelo: data.viaturaModelo || '',
          ano: data.viaturaAno || null,
          cor: data.viaturaCor || '',
          capacidadeCarga: data.viaturaCapacidadeCarga || null,
          tipoViatura: data.viaturaTipoViatura || 'camião',
        },

        // CONTENTOR
        contentor: {
          numeroContentor: '',
          tipoContentor: '20_pes',
          selo: '',
          estadoContentor: 'vazio',
        },

        // REBOQUE
        reboque: {
          matricula: '',
          tipo: '',
          capacidade: null,
        },

        // ROTA
        rota: {
          pontosPassagem: [],
          coordenadasRota: [],
          desvioPermitidoKm: 10,
          rotaOtimizada: false,
          rotaAlternativa: [],
        },

        // ETAPAS E ESTADO
        etapas: [],
        status: 'registada',

        // LOCALIZAÇÃO ACTUAL
        localizacaoAtual: {
          latitude: -25.969248,
          longitude: 32.573174,
          altitude: null,
          velocidade: null,
          direcao: null,
          precisao: null,
          endereco: '',
          cidade: '',
          pais: '',
          dataHora: new Date().toISOString(),
          fonte: 'manual',
        },

        historicoLocalizacoes: [],
        alertas: [],
        ocorrencias: [],
        reclamacoes: [],
        confirmacaoEntrega: {},
        documentos: [],
        mensagens: [],
        notificacoes: [],
        relatorios: [],

        // MÉTRICAS
        metricas: {
          distanciaPercorridaKm: 0,
          tempoTotalViagemHoras: 0,
          tempoParadoHoras: 0,
          numeroParagens: 0,
          combustivelGasto: null,
          custoTotal: null,
          eficiencia: null,
        },

        // CONTROLO DE QUALIDADE
        controleQualidade: {
          inspecaoInicial: {
            realizada: false,
            dataHora: new Date().toISOString(),
            responsavel: '',
            resultado: 'aprovado',
            observacoes: '',
          },

          inspecaoFinal: {
            realizada: false,
            dataHora: new Date().toISOString(),
            responsavel: '',
            resultado: 'aprovado',
            observacoes: '',
          },

          checklist: [],
        },

        pagamentos: [],
        observacoes: '',
        prioridade: 'media',
        tags: [],
      };

      console.log(
        'A enviar carga:',
        JSON.stringify(payload, null, 2)
      );

      const response = await cargaApi.create(payload);

      console.log('Resposta da criação da carga:', response);

      if (
        response.returnCode === 200 ||
        response.returnCode === 201
      ) {
        if (onSuccess) {
          onSuccess(response.data.cargaId);
        } else {
          router.push(`/cargas/${response.data.cargaId}`);
        }
      } else {
        throw new Error(
          response.returnMsg || 'Erro ao criar carga.'
        );
      }

    } catch (err: any) {
      console.error('Erro ao criar carga:', err);

      const errorMsg =
        err.response?.data?.returnMsg ||
        err.response?.data?.mensagem ||
        err.response?.data?.message ||
        err.message ||
        'Erro ao criar carga.';

      setError(errorMsg);

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CARREGAMENTO INICIAL DOS MOTORISTAS
  // ============================================================

  if (loadingMotoristas) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-400 border-t-transparent" />
          <p className="mt-4 text-gray-500">
            A carregar dados...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // INTERFACE DO FORMULÁRIO
  // ============================================================

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* ERRO GERAL */}
      {error && (
        <Alert
          variant="danger"
          dismissible
          onDismiss={() => setError(null)}
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />

            <div>
              <p className="font-medium">
                Erro ao criar carga
              </p>

              <p className="text-sm">{error}</p>

              <div className="mt-2 flex flex-wrap gap-2">
                {!hasClientes && !loadingClientes && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push('/register?perfil=cliente&from=clientes')
                    }
                    className="border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    Cadastrar Cliente
                  </Button>
                )}

                {!hasMotoristas && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push('/register?perfil=motorista&from=motoristas')
                    }
                    className="border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    Cadastrar Motorista
                  </Button>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    fetchData();
                    window.location.reload();
                  }}
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Recarregar
                </Button>
              </div>
            </div>
          </div>
        </Alert>
      )}

      {/* ERRO DOS MOTORISTAS */}
      {dataError && !error && (
        <Alert variant="warning" dismissible>
          {dataError}
        </Alert>
      )}

      {/* ERRO DOS CLIENTES */}
      {clienteError && (
        <Alert variant="warning" dismissible>
          <div className="space-y-1">
            <p className="font-medium">
              Não foi possível carregar os clientes
            </p>
            <p className="text-sm">{clienteError}</p>
          </div>
        </Alert>
      )}

      {/* ERRO DOS TRANSPORTADORES */}
      {transportadorError && (
        <Alert variant="warning" dismissible>
          <div className="space-y-1">
            <p className="font-medium">
              Não foi possível carregar os transportadores
            </p>
            <p className="text-sm">{transportadorError}</p>
          </div>
        </Alert>
      )}

      {/* ======================================================
          INFORMAÇÕES DA CARGA
      ====================================================== */}

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 border-b border-gray-100 pb-2 text-sm font-medium text-gray-700">
          <Package className="h-4 w-4 text-gray-500" />
          Informações da Carga
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Descrição *"
            placeholder="Descreva a carga"
            {...register('descricao')}
            error={errors.descricao?.message}
            className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
          />

          <Select
            label="Tipo de Mercadoria *"
            options={tipoMercadoriaOptions}
            {...register('tipoMercadoria')}
            error={errors.tipoMercadoria?.message}
            className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            label="Peso (kg) *"
            type="number"
            step="0.1"
            placeholder="0.0"
            leftIcon={<Weight className="h-4 w-4 text-gray-400" />}
            {...register('peso', { valueAsNumber: true })}
            error={errors.peso?.message}
            className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
          />

          <Input
            label="Volume (m³) *"
            type="number"
            step="0.1"
            placeholder="0.0"
            leftIcon={<Ruler className="h-4 w-4 text-gray-400" />}
            {...register('volume', { valueAsNumber: true })}
            error={errors.volume?.message}
            className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
          />

          <Input
            label="Valor Declarado (MZN) *"
            type="number"
            step="0.01"
            placeholder="0.00"
            leftIcon={<DollarSign className="h-4 w-4 text-gray-400" />}
            {...register('valorDeclarado', { valueAsNumber: true })}
            error={errors.valorDeclarado?.message}
            className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* ======================================================
          ORIGEM
      ====================================================== */}

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 border-b border-gray-100 pb-2 text-sm font-medium text-gray-700">
          <MapPin className="h-4 w-4 text-gray-500" />
          Origem
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            label="Endereço *"
            placeholder="Rua, número, bairro"
            {...register('origemEndereco')}
            error={errors.origemEndereco?.message}
            className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
          />

          <Input
            label="Cidade *"
            placeholder="Cidade de origem"
            {...register('origemCidade')}
            error={errors.origemCidade?.message}
            className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
          />

          <Select
            label="País *"
            options={paisOptions}
            {...register('origemPais')}
            error={errors.origemPais?.message}
            className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700"
          />
        </div>
      </div>

      {/* ======================================================
          DESTINO
      ====================================================== */}

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 border-b border-gray-100 pb-2 text-sm font-medium text-gray-700">
          <Map className="h-4 w-4 text-gray-500" />
          Destino
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            label="Endereço *"
            placeholder="Rua, número, bairro"
            {...register('destinoEndereco')}
            error={errors.destinoEndereco?.message}
            className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
          />

          <Input
            label="Cidade *"
            placeholder="Cidade de destino"
            {...register('destinoCidade')}
            error={errors.destinoCidade?.message}
            className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
          />

          <Select
            label="País *"
            options={paisOptions}
            {...register('destinoPais')}
            error={errors.destinoPais?.message}
            className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700"
          />
        </div>
      </div>

      {/* ======================================================
          CLIENTE - DADOS REAIS DA BASE DE DADOS
      ====================================================== */}

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 border-b border-gray-100 pb-2 text-sm font-medium text-gray-700">
          <User className="h-4 w-4 text-gray-500" />
          Cliente
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <AutocompleteSelect
            label="Seleccione o Cliente *"
            options={clienteOptions}
            value={watch('clienteId') || ''}
            onChange={(value) =>
              setValue('clienteId', value, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            placeholder="Buscar cliente por nome, e-mail ou telefone..."
            error={errors.clienteId?.message}
            loading={loadingClientes}
            disabled={loadingClientes || !hasClientes}
            required
            noOptionsMessage={
              loadingClientes
                ? 'A carregar clientes...'
                : !hasClientes
                  ? 'Nenhum cliente activo encontrado na base de dados.'
                  : 'Nenhum cliente encontrado.'
            }
          />

          {loadingClientes && (
            <p className="text-xs text-gray-500">
              A carregar clientes da base de dados...
            </p>
          )}

          {!loadingClientes && hasClientes && (
            <p className="text-xs text-gray-500">
              {clientes.length} cliente(s) activo(s) disponível(is).
            </p>
          )}

          {!loadingClientes && !hasClientes && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                router.push('/register?perfil=cliente&from=clientes')
              }
              className="w-fit border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Cadastrar Novo Cliente
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={async () => {
              setLoadingClientes(true);
              setClienteError(null);

              try {
                const response = await clienteApi.getList({
                  curPage: 1,
                  pageSize: 1000,
                  ativo: true,
                });

                setClientes(
                  response.data.list.filter(
                    (c) =>
                      c.ativo === true &&
                      (!c.estadoConta || c.estadoConta === 'ativo')
                  )
                );
              } catch (err: any) {
                setClienteError(
                  err.message || 'Erro ao recarregar clientes.'
                );
              } finally {
                setLoadingClientes(false);
              }
            }}
            leftIcon={<RefreshCw className="h-4 w-4" />}
            className="w-fit text-gray-500 hover:text-gray-700"
          >
            Actualizar lista de clientes
          </Button>
        </div>
      </div>

      {/* ======================================================
          TRANSPORTADOR
      ====================================================== */}

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 border-b border-gray-100 pb-2 text-sm font-medium text-gray-700">
          <Building className="h-4 w-4 text-gray-500" />
          Transportador
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <Select
            label="Seleccione o Transportador *"
            options={transportadorOptions}
            {...register('transportadorId')}
            error={
              errors.transportadorId?.message ||
              (transportadorError
                ? 'Erro ao carregar transportadores'
                : undefined)
            }
            className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700"
          />

          <p className="text-xs text-gray-500">
            {loadingTransportadores
              ? 'A carregar transportadores...'
              : transportadores.length > 0
                ? `${transportadores.length} transportador(es) activo(s) disponível(is)`
                : 'Não existem transportadores activos disponíveis.'}
          </p>
        </div>
      </div>

      {/* ======================================================
          MOTORISTA
      ====================================================== */}

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 border-b border-gray-100 pb-2 text-sm font-medium text-gray-700">
          <User className="h-4 w-4 text-gray-500" />
          Motorista
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <AutocompleteSelect
            label="Seleccione o Motorista *"
            options={motoristaOptions}
            value={watch('motoristaId') || ''}
            onChange={(value) =>
              setValue('motoristaId', value, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            placeholder="Buscar motorista por nome ou telefone..."
            error={errors.motoristaId?.message}
            loading={loadingMotoristas}
            disabled={!hasMotoristas}
            required
            noOptionsMessage={
              !hasMotoristas
                ? 'Nenhum motorista cadastrado. Cadastre um motorista primeiro.'
                : 'Nenhum motorista encontrado.'
            }
          />

          {!hasMotoristas && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                router.push('/register?perfil=motorista&from=motoristas')
              }
              className="w-fit border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Cadastrar Novo Motorista
            </Button>
          )}
        </div>
      </div>

      {/* ======================================================
          VIATURA
      ====================================================== */}

      <div className="space-y-4">
        <h3 className="flex items-center gap-2 border-b border-gray-100 pb-2 text-sm font-medium text-gray-700">
          <Truck className="h-4 w-4 text-gray-500" />
          Viatura
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            label="Matrícula *"
            placeholder="Ex: AB-12-34-CD"
            {...register('viaturaMatricula')}
            error={errors.viaturaMatricula?.message}
            className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400 uppercase"
          />

          <Input
            label="Marca"
            placeholder="Ex: Toyota, Mercedes"
            {...register('viaturaMarca')}
            className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
          />

          <Input
            label="Modelo"
            placeholder="Ex: Hilux, Actros"
            {...register('viaturaModelo')}
            className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Input
            label="Ano"
            type="number"
            placeholder="2024"
            {...register('viaturaAno', { valueAsNumber: true })}
            className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
          />

          <Input
            label="Cor"
            placeholder="Branca, Vermelha"
            {...register('viaturaCor')}
            className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
          />

          <Input
            label="Capacidade Carga (kg)"
            type="number"
            placeholder="5000"
            {...register('viaturaCapacidadeCarga', {
              valueAsNumber: true,
            })}
            className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
          />

          <Select
            label="Tipo de Viatura"
            options={tipoViaturaOptions}
            {...register('viaturaTipoViatura')}
            className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700"
          />
        </div>
      </div>

      {/* ======================================================
          BOTÕES
      ====================================================== */}

      <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          disabled={
            !hasClientes ||
            !hasMotoristas ||
            loadingClientes ||
            loadingMotoristas ||
            loadingTransportadores ||
            transportadores.length === 0
          }
          fullWidth
          className="bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-500 disabled:opacity-50"
        >
          {loading ? 'A criar...' : 'Criar Carga'}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.back()}
          className="border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          Cancelar
        </Button>
      </div>

      {/* ======================================================
          RESUMO DOS REGISTOS
      ====================================================== */}

      <div className="flex flex-wrap justify-between gap-2 border-t border-gray-100 pt-4 text-xs text-gray-400">
        <span>
          Clientes: {clientes.length} registados
        </span>

        <span>
          Motoristas: {motoristas.length} registados
        </span>

        <span>
          Transportadores: {transportadores.length} activos
        </span>
      </div>
    </form>
  );
};
