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
import { apiClient } from '@/lib/api/client';
import { useCargaFormData } from '@/lib/hooks/useCargaFormData';
import { 
  Package, 
  MapPin, 
  User, 
  Truck, 
  DollarSign, 
  Weight,
  Ruler,
  Phone,
  Building,
  Map,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { CreateCargaData } from '@/lib/types/carga';

// Schema de validação
const cargaSchema = z.object({
  descricao: z.string().min(3, 'Descrição deve ter pelo menos 3 caracteres'),
  tipoMercadoria: z.string().min(1, 'Selecione o tipo de mercadoria'),
  peso: z.coerce.number().min(0.1, 'Peso deve ser maior que 0'),
  volume: z.coerce.number().min(0.1, 'Volume deve ser maior que 0'),
  valorDeclarado: z.coerce.number().min(0, 'Valor deve ser maior ou igual a 0'),
  
  origemEndereco: z.string().min(3, 'Endereço de origem é obrigatório'),
  origemCidade: z.string().min(2, 'Cidade de origem é obrigatória'),
  origemPais: z.string().min(2, 'País de origem é obrigatório'),
  
  destinoEndereco: z.string().min(3, 'Endereço de destino é obrigatório'),
  destinoCidade: z.string().min(2, 'Cidade de destino é obrigatória'),
  destinoPais: z.string().min(2, 'País de destino é obrigatório'),
  
  clienteId: z.string().min(1, 'Selecione um cliente'),
  transportadorId: z.string().min(1, 'Selecione um transportador'),
  motoristaId: z.string().min(1, 'Selecione um motorista'),
  
  viaturaMatricula: z.string().min(3, 'Matrícula da viatura é obrigatória'),
  viaturaMarca: z.string().optional(),
  viaturaModelo: z.string().optional(),
  viaturaAno: z.coerce.number().optional(),
  viaturaCor: z.string().optional(),
  viaturaCapacidadeCarga: z.coerce.number().optional(),
  viaturaTipoViatura: z.string().optional(),
});

type CargaFormData = z.infer<typeof cargaSchema>;

// Opções
const tipoMercadoriaOptions = [
  { value: 'alimentos', label: 'Alimentos' },
  { value: 'bebidas', label: 'Bebidas' },
  { value: 'produtos_quimicos', label: 'Produtos Químicos' },
  { value: 'produtos_perigosos', label: 'Produtos Perigosos' },
  { value: 'materiais_construcao', label: 'Materiais de Construção' },
  { value: 'eletronicos', label: 'Eletrônicos' },
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

interface TransportadorListData {
  list: Transportador[];
  totalCount: number;
  totalPage: number;
  curPage: number;
  pageSize: number;
}

interface CargaFormProps {
  onSuccess?: (cargaId: string) => void;
}

export const CargaForm: React.FC<CargaFormProps> = ({ onSuccess }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transportadores, setTransportadores] = useState<Transportador[]>([]);
  const [loadingTransportadores, setLoadingTransportadores] = useState(true);
  const [transportadorError, setTransportadorError] = useState<string | null>(null);

  const {
    clientes,
    motoristas,
    loading: loadingData,
    error: dataError,
    fetchData,
    hasClientes,
    hasMotoristas,
  } = useCargaFormData();

  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    setValue,
    watch,
  } = useForm<z.input<typeof cargaSchema>, any, z.output<typeof cargaSchema>>({
    resolver: zodResolver(cargaSchema),
    defaultValues: {
      origemPais: 'Moçambique',
      destinoPais: 'Moçambique',
      tipoMercadoria: 'outros',
      viaturaTipoViatura: 'camião',
    },
  });

  // Carregar transportadores reais através da API.
  useEffect(() => {
    let cancelled = false;

    const loadTransportadores = async () => {
      setLoadingTransportadores(true);
      setTransportadorError(null);

      try {
        const response = await apiClient.post<TransportadorListData>(
          '/getTransportadorList',
          {
            curPage: 1,
            pageSize: 100,
            search: '',
            ativo: true,
          }
        );

        if (response.returnCode !== 200) {
          throw new Error(response.returnMsg || 'Não foi possível carregar os transportadores.');
        }

        if (!cancelled) {
          setTransportadores(response.data?.list || []);
        }
      } catch (err: any) {
        console.error('Erro ao carregar transportadores:', err);

        if (!cancelled) {
          setTransportadorError(
            err.response?.data?.returnMsg ||
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

    loadTransportadores();

    return () => {
      cancelled = true;
    };
  }, []);

  const transportadorOptions = transportadores.map((transportador) => ({
    value: transportador.transportadorId,
    label: transportador.nome,
  }));

  const clienteOptions = clientes.map(c => ({
    value: c.clienteId,
    label: c.nome,
    sublabel: `${c.email} • ${c.telefone}`,
    data: c,
  }));

  const motoristaOptions = motoristas.map(m => ({
    value: m.motoristaId,
    label: m.nome,
    sublabel: `${m.telefone} • ${m.cartaConducao || 'Sem carta'}`,
    data: m,
  }));

  const onSubmit = async (data: CargaFormData) => {
    if (!hasClientes || !hasMotoristas || transportadores.length === 0) {
      setError('Não é possível criar a carga. Confirme se existem clientes, motoristas e transportadores activos registados.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const cliente = clientes.find(c => c.clienteId === data.clienteId);
      const motorista = motoristas.find(m => m.motoristaId === data.motoristaId);
      const transportador = transportadores.find(
        (t) => t.transportadorId === data.transportadorId
      );

      if (!cliente || !motorista || !transportador) {
        setError('Cliente, motorista ou transportador não encontrado.');
        setLoading(false);
        return;
      }

      // ============================================================
      // PAYLOAD COMPLETO - COM CODIGO RASTREIO
      // ============================================================
      const payload: CreateCargaData = {
        // CODIGO DE RASTREIO - GERADO MANUALMENTE
        
        // Campos obrigatórios da carga
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
        
        // Cliente
        cliente: {
          clienteId: data.clienteId,
          nome: cliente.nome,
          email: cliente.email || '',
          telefone: cliente.telefone || '',
          nif: cliente.nif || '',
          endereco: cliente.endereco || '',
        },
        
        // Transportador
        transportador: {
          transportadorId: transportador.transportadorId,
          nome: transportador.nome || '',
          email: transportador.email || '',
          telefone: transportador.telefone || '',
          nif: transportador.nif || '',
          endereco: transportador.endereco || '',
          licenca: transportador.licenca || '',
        },
        
        // Motorista
        motorista: {
          motoristaId: data.motoristaId || undefined,
          nome: motorista.nome,
          email: motorista.email || '',
          telefone: motorista.telefone || '',
          documentoIdentificacao: motorista.documentoIdentificacao || '',
          cartaConducao: motorista.cartaConducao || '',
          categoriaCarta: motorista.categoriaCarta || '',
          validadeCarta: motorista.validadeCarta || undefined,
          foto: '',
        },
        
        // Viatura
        viatura: {
          matricula: data.viaturaMatricula,
          marca: data.viaturaMarca || '',
          modelo: data.viaturaModelo || '',
          ano: data.viaturaAno || null,
          cor: data.viaturaCor || '',
          capacidadeCarga: data.viaturaCapacidadeCarga || null,
          tipoViatura: data.viaturaTipoViatura || 'camião',
        },
        
        // Contentor
        contentor: {
          numeroContentor: '',
          tipoContentor: '20_pes',
          selo: '',
          estadoContentor: 'vazio',
        },
        
        // Reboque
        reboque: {
          matricula: '',
          tipo: '',
          capacidade: null,
        },
        
        // Rota
        rota: {
          pontosPassagem: [],
          coordenadasRota: [],
          desvioPermitidoKm: 10,
          rotaOtimizada: false,
          rotaAlternativa: [],
        },
        
        // Etapas e Status
        etapas: [],
        status: 'registada',
        
        // LOCALIZAÇÃO ATUAL
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
        
        // Métricas
        metricas: {
          distanciaPercorridaKm: 0,
          tempoTotalViagemHoras: 0,
          tempoParadoHoras: 0,
          numeroParagens: 0,
          combustivelGasto: null,
          custoTotal: null,
          eficiencia: null,
        },
        
        // Controle de Qualidade
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

      console.log('📦 Enviando payload com codigoRastreio:', JSON.stringify(payload, null, 2));

      const response = await cargaApi.create(payload);

      console.log('📦 Resposta:', response);

      if (response.returnCode === 200 || response.returnCode === 201) {
        if (onSuccess) {
          onSuccess(response.data.cargaId);
        } else {
          router.push(`/cargas/${response.data.cargaId}`);
        }
      } else {
        setError(response.returnMsg || 'Erro ao criar carga');
      }
    } catch (err: any) {
      console.error('❌ Erro ao criar carga:', err);
      
      let errorMsg = err.message || 'Erro ao criar carga';
      if (err.response?.data?.returnMsg) {
        errorMsg = err.response.data.returnMsg;
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="danger" dismissible onDismiss={() => setError(null)}>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Erro ao criar carga</p>
              <p className="text-sm">{error}</p>
              {(!hasClientes || !hasMotoristas) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {!hasClientes && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/register?perfil=cliente&from=clientes')}
                      className="border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      Cadastrar Cliente
                    </Button>
                  )}
                  {!hasMotoristas && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/register?perfil=motorista&from=motoristas')}
                      className="border-gray-200 text-gray-600 hover:bg-gray-50"
                    >
                      Cadastrar Motorista
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchData}
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Recarregar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Alert>
      )}

      {dataError && !error && (
        <Alert variant="warning" dismissible>
          {dataError}
        </Alert>
      )}

      {transportadorError && (
        <Alert variant="warning" dismissible>
          <div className="space-y-1">
            <p className="font-medium">Não foi possível carregar os transportadores</p>
            <p className="text-sm">{transportadorError}</p>
          </div>
        </Alert>
      )}

      {/* Informações da Carga */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-2 flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-500" />
          Informações da Carga
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Peso (kg) *"
            type="number"
            step="0.1"
            placeholder="0.0"
            leftIcon={<Weight className="w-4 h-4 text-gray-400" />}
            {...register('peso', { valueAsNumber: true })}
            error={errors.peso?.message}
            className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
          />

          <Input
            label="Volume (m³) *"
            type="number"
            step="0.1"
            placeholder="0.0"
            leftIcon={<Ruler className="w-4 h-4 text-gray-400" />}
            {...register('volume', { valueAsNumber: true })}
            error={errors.volume?.message}
            className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
          />

          <Input
            label="Valor Declarado (MZN) *"
            type="number"
            step="0.01"
            placeholder="0.00"
            leftIcon={<DollarSign className="w-4 h-4 text-gray-400" />}
            {...register('valorDeclarado', { valueAsNumber: true })}
            error={errors.valorDeclarado?.message}
            className="bg-gray-50 border-gray-200 focus:bg-white text-gray-700 placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Origem */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          Origem
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Destino */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-2 flex items-center gap-2">
          <Map className="w-4 h-4 text-gray-500" />
          Destino
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Cliente */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-2 flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          Cliente
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <AutocompleteSelect
            label="Selecione o Cliente *"
            options={clienteOptions}
            value={watch('clienteId') || ''}
            onChange={(value) => setValue('clienteId', value)}
            placeholder="Buscar cliente por nome ou email..."
            error={errors.clienteId?.message}
            loading={loadingData}
            disabled={!hasClientes}
            required
            noOptionsMessage={!hasClientes ? 'Nenhum cliente cadastrado. Cadastre um cliente primeiro.' : 'Nenhum cliente encontrado'}
          />
          
          {!hasClientes && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/register?perfil=cliente&from=clientes')}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 w-fit"
            >
              Cadastrar Novo Cliente
            </Button>
          )}
        </div>
      </div>

      {/* Transportador */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-2 flex items-center gap-2">
          <Building className="w-4 h-4 text-gray-500" />
          Transportador
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <Select
            label="Selecione o Transportador *"
            options={transportadorOptions}
            {...register('transportadorId')}
            error={
              errors.transportadorId?.message ||
              (transportadorError ? 'Erro ao carregar transportadores' : undefined)
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

      {/* Motorista */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-2 flex items-center gap-2">
          <User className="w-4 h-4 text-gray-500" />
          Motorista
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <AutocompleteSelect
            label="Selecione o Motorista *"
            options={motoristaOptions}
            value={watch('motoristaId') || ''}
            onChange={(value) => setValue('motoristaId', value)}
            placeholder="Buscar motorista por nome ou telefone..."
            error={errors.motoristaId?.message}
            loading={loadingData}
            disabled={!hasMotoristas}
            required
            noOptionsMessage={!hasMotoristas ? 'Nenhum motorista cadastrado. Cadastre um motorista primeiro.' : 'Nenhum motorista encontrado'}
          />
          
          {!hasMotoristas && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/register?perfil=motorista&from=motoristas')}
              className="border-gray-200 text-gray-600 hover:bg-gray-50 w-fit"
            >
              Cadastrar Novo Motorista
            </Button>
          )}
        </div>
      </div>

      {/* Viatura */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-2 flex items-center gap-2">
          <Truck className="w-4 h-4 text-gray-500" />
          Viatura
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            {...register('viaturaCapacidadeCarga', { valueAsNumber: true })}
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

      {/* Botões */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          disabled={
            !hasClientes ||
            !hasMotoristas ||
            loadingData ||
            loadingTransportadores ||
            transportadores.length === 0
          }
          fullWidth
          className="bg-gray-800 hover:bg-gray-900 text-white focus:ring-gray-500 disabled:opacity-50"
        >
          {loading ? 'Criando...' : 'Criar Carga'}
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

      <div className="text-xs text-gray-400 flex justify-between border-t border-gray-100 pt-4">
        <span>Clientes: {clientes.length} registados</span>
        <span>Motoristas: {motoristas.length} registados</span>
        <span>Transportadores: {transportadores.length} activos</span>
      </div>
    </form>
  );
};