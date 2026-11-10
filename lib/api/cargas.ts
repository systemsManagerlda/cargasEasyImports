/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';
import {
  Carga,
  CargaListResponse,
  CargaDetailResponse,
  CargaDashboardResponse,
  CreateCargaData,
  Alerta,
  Ocorrencia,
  Reclamacao,
  Documento,
} from '../types/carga';

interface ApiResponse<T> {
  returnCode: number;
  returnMsg: string;
  data: T;
}

export interface CargaListParams {
  curPage?: number;
  pageSize?: number;
  status?: string;
  tipoMercadoria?: string;
  clienteId?: string;
  transportadorId?: string;
  motoristaId?: string;
  origemCidade?: string;
  destinoCidade?: string;
  search?: string;
  orderBy?: string;
  orderDirection?: -1 | 1;
  dataInicio?: string;
  dataFim?: string;
  temAlertas?: boolean;
  temReclamacoes?: boolean;
  prioridade?: string;
}

export interface LocalizacaoParams {
  cargaId: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  velocidade?: number;
  direcao?: number;
  precisao?: number;
  endereco?: string;
  cidade?: string;
  pais?: string;
  fonte?: string;
  observacao?: string;
}

export interface EtapaParams {
  cargaId: string;
  nome: string;
  descricao?: string;
  localizacao?: {
    endereco?: string;
    cidade?: string;
    pais?: string;
    coordenadas?: { latitude: number; longitude: number };
  };
  responsavel?: {
    nome: string;
    cargo?: string;
    contacto?: string;
  };
}

export interface OcorrenciaParams {
  cargaId: string;
  tipo: string;
  descricao: string;
  localizacao?: {
    latitude: number;
    longitude: number;
    endereco?: string;
    cidade?: string;
    pais?: string;
  };
  gravidade?: 'leve' | 'moderada' | 'grave' | 'critica';
  evidencias?: Array<{
    tipo: string;
    url: string;
    nome: string;
    descricao?: string;
  }>;
}

export interface AlertaParams {
  cargaId: string;
  tipo: string;
  mensagem: string;
  gravidade?: 'baixa' | 'media' | 'alta' | 'critica';
  localizacao?: {
    latitude: number;
    longitude: number;
    endereco?: string;
  };
}

export interface ConfirmarEntregaParams {
  cargaId: string;
  status: string;
  observacao?: string;
  assinatura?: {
    url: string;
    nomeAssinante: string;
    dataHora: string;
  };
  fotoComprovativo?: {
    url: string;
    descricao: string;
    dataUpload: string;
  };
}

export interface ReclamacaoParams {
  cargaId: string;
  clienteId: string;
  clienteNome: string;
  tipo: string;
  descricao: string;
  anexos?: Array<{
    nome: string;
    url: string;
    tipo: string;
    dataUpload: string;
  }>;
}

export interface DocumentoParams {
  cargaId: string;
  nome: string;
  tipo?: string;
  url: string;
  descricao?: string;
  tamanhoKB?: number;
  formato?: string;
}

export interface MensagemParams {
  cargaId: string;
  para: Array<{
    usuarioId: string;
    nome: string;
    perfil: string;
  }>;
  assunto?: string;
  conteudo: string;
  tipo?: string;
  prioridade?: string;
  anexos?: Array<{
    nome: string;
    url: string;
    tipo: string;
    tamanhoKB: number;
  }>;
}

export const cargaApi = {
  // Listar cargas - CORRIGIDO
  async getList(
    params: CargaListParams = {}
  ): Promise<ApiResponse<CargaListResponse>> {
    console.log('📦 GET CARGAS - parâmetros:', params);

    const response = await apiClient.post<CargaListResponse>(
      API_ENDPOINTS.CARGAS,
      params
    );

    console.log('📦 GET CARGAS - resposta:', response);

    if (!response.data) {
      return {
        returnCode: 200,
        returnMsg: 'Success',
        data: {
          list: [],
          totalCount: 0,
          totalPage: 0,
          curPage: 1,
          pageSize: 10,
        },
      };
    }

    return {
      ...response,
      data: {
        ...response.data,
        list: Array.isArray(response.data.list)
          ? response.data.list
          : [],
      },
    };
  },

  // Detalhes da carga
  async getDetail(cargaId: string): Promise<ApiResponse<CargaDetailResponse>> {
  console.log('📦 getDetail - cargaId:', cargaId);
  
  // A API espera 'cargaId' no body
  return apiClient.post<CargaDetailResponse>(
    API_ENDPOINTS.CARGA_DETAIL,  // Agora aponta para '/getCargaDetailA'
    { cargaId: cargaId }
  );
},

  // Criar carga
async create(data: CreateCargaData): Promise<ApiResponse<CargaDetailResponse>> {
  console.log('📦 Enviando para API:', JSON.stringify(data, null, 2));
  
  try {
    const response = await apiClient.post<CargaDetailResponse>(
      API_ENDPOINTS.CREATE_CARGA,
      data
    );
    console.log('📦 Resposta da API:', response);
    return response;
  } catch (error: any) {
    console.error('❌ Erro na API:', error.response?.data || error.message);
    throw error;
  }
},

// Atualizar carga
async update(
  cargaId: string,
  data: Partial<CreateCargaData>
): Promise<ApiResponse<CargaDetailResponse>> {
  return apiClient.post<CargaDetailResponse>(
    API_ENDPOINTS.UPDATE_CARGA,
    { cargaId, ...data }
  );
},
  // Deletar carga
  async delete(cargaId: string): Promise<{ returnCode: number; returnMsg: string }> {
    return apiClient.post(API_ENDPOINTS.DELETE_CARGA, { cargaId });
  },

  // Atualizar localização
  async atualizarLocalizacao(params: LocalizacaoParams): Promise<{
    returnCode: number;
    returnMsg: string;
    data: { localizacaoAtual: any; totalHistorico: number };
  }> {
    return apiClient.post(API_ENDPOINTS.ATUALIZAR_LOCALIZACAO, params);
  },

  // Adicionar etapa
  async adicionarEtapa(params: EtapaParams): Promise<{
    returnCode: number;
    returnMsg: string;
    data: { etapas: any[]; etapaAtual: any; progresso: number };
  }> {
    return apiClient.post(API_ENDPOINTS.ADICIONAR_ETAPA, params);
  },

  // Registrar ocorrência
  async registrarOcorrencia(params: OcorrenciaParams): Promise<{
    returnCode: number;
    returnMsg: string;
    data: { ocorrencias: Ocorrencia[]; alertas: Alerta[] };
  }> {
    return apiClient.post(API_ENDPOINTS.REGISTRAR_OCORRENCIA, params);
  },

  // Gerar alerta
  async gerarAlerta(params: AlertaParams): Promise<{
    returnCode: number;
    returnMsg: string;
    data: { alertas: Alerta[]; notificacoes: any[] };
  }> {
    return apiClient.post(API_ENDPOINTS.GERAR_ALERTA, params);
  },

  // Confirmar entrega
  async confirmarEntrega(params: ConfirmarEntregaParams): Promise<{
    returnCode: number;
    returnMsg: string;
    data: { confirmacaoEntrega: any; status: string; destino: any };
  }> {
    return apiClient.post(API_ENDPOINTS.CONFIRMAR_ENTREGA, params);
  },

  // Adicionar reclamação
  async adicionarReclamacao(params: ReclamacaoParams): Promise<{
    returnCode: number;
    returnMsg: string;
    data: Reclamacao[];
  }> {
    return apiClient.post(API_ENDPOINTS.ADICIONAR_RECLAMACAO, params);
  },

  // Buscar cargas por cliente
  async getByCliente(clienteId: string, status?: string, limit: number = 100): Promise<{
    returnCode: number;
    returnMsg: string;
    data: Carga[];
  }> {
    return apiClient.post(API_ENDPOINTS.CARGAS_BY_CLIENTE, { clienteId, status, limit });
  },

  // Buscar cargas por transportador
  async getByTransportador(transportadorId: string, status?: string, limit: number = 100): Promise<{
    returnCode: number;
    returnMsg: string;
    data: Carga[];
  }> {
    return apiClient.post(API_ENDPOINTS.CARGAS_BY_TRANSPORTADOR, { transportadorId, status, limit });
  },

  // Cargas com alertas ativos
  async getComAlertas(gravidade?: string): Promise<{
    returnCode: number;
    returnMsg: string;
    data: Carga[];
  }> {
    return apiClient.post(API_ENDPOINTS.CARGAS_COM_ALERTAS, { gravidade });
  },

  // Dashboard
 async getDashboard(): Promise<ApiResponse<CargaDashboardResponse>> {
    return apiClient.post<CargaDashboardResponse>(API_ENDPOINTS.CARGA_DASHBOARD, {});
  },

  // Resumo da carga
  async getResumo(cargaId: string): Promise<{
    returnCode: number;
    returnMsg: string;
    data: any;
  }> {
    return apiClient.post(API_ENDPOINTS.CARGA_RESUMO, { cargaId });
  },

  // Histórico de localizações
  async getHistoricoLocalizacoes(
    cargaId: string,
    dataInicio?: string,
    dataFim?: string,
    limit: number = 100,
    page: number = 1
  ): Promise<{
    returnCode: number;
    returnMsg: string;
    data: { historico: any[]; total: number; page: number; totalPages: number };
  }> {
    return apiClient.post(API_ENDPOINTS.HISTORICO_LOCALIZACOES, {
      cargaId,
      dataInicio,
      dataFim,
      limit,
      page,
    });
  },

  // Cargas próximas
  async getProximas(latitude: number, longitude: number, raioKm: number = 50, limit: number = 100): Promise<{
    returnCode: number;
    returnMsg: string;
    data: Carga[];
  }> {
    return apiClient.post(API_ENDPOINTS.CARGAS_PROXIMAS, { latitude, longitude, raioKm, limit });
  },

  // Buscar por código de rastreio (público)
  async getByRastreio(codigoRastreio: string): Promise<{
    returnCode: number;
    returnMsg: string;
    data: any;
  }> {
    return apiClient.post(API_ENDPOINTS.CARGA_BY_RASTREIO, { codigoRastreio });
  },

  // Atualizar status
  async atualizarStatus(cargaId: string, status: string, observacao?: string): Promise<{
    returnCode: number;
    returnMsg: string;
    data: { cargaId: string; statusAnterior: string; statusAtual: string; dataHoraStatus: string };
  }> {
    return apiClient.post(API_ENDPOINTS.ATUALIZAR_STATUS, { cargaId, status, observacao });
  },

  // Adicionar documento
  async adicionarDocumento(params: DocumentoParams): Promise<{
    returnCode: number;
    returnMsg: string;
    data: Documento;
  }> {
    return apiClient.post(API_ENDPOINTS.ADICIONAR_DOCUMENTO, params);
  },

  // Listar documentos
  async getDocumentos(cargaId: string, tipo?: string, limit: number = 50, page: number = 1): Promise<{
    returnCode: number;
    returnMsg: string;
    data: { documentos: Documento[]; total: number; page: number; totalPages: number };
  }> {
    return apiClient.post(API_ENDPOINTS.GET_DOCUMENTOS, { cargaId, tipo, limit, page });
  },

  // Enviar mensagem
  async enviarMensagem(params: MensagemParams): Promise<{
    returnCode: number;
    returnMsg: string;
    data: any;
  }> {
    return apiClient.post(API_ENDPOINTS.ENVIAR_MENSAGEM, params);
  },

  // Listar mensagens
  async getMensagens(cargaId: string, usuarioId?: string, tipo?: string, limit: number = 50, page: number = 1): Promise<{
    returnCode: number;
    returnMsg: string;
    data: { mensagens: any[]; total: number; page: number; totalPages: number };
  }> {
    return apiClient.post(API_ENDPOINTS.GET_MENSAGENS, { cargaId, usuarioId, tipo, limit, page });
  },

  // Marcar notificação como lida
  async marcarNotificacaoLida(cargaId: string, notificacaoId: string): Promise<{
    returnCode: number;
    returnMsg: string;
    data: any;
  }> {
    return apiClient.post(API_ENDPOINTS.MARCAR_NOTIFICACAO_LIDA, { cargaId, notificacaoId });
  },

  // Resolver alerta
  async resolverAlerta(cargaId: string, alertaId: string, acaoTomada?: string): Promise<{
    returnCode: number;
    returnMsg: string;
    data: Alerta;
  }> {
    return apiClient.post(API_ENDPOINTS.RESOLVER_ALERTA, { cargaId, alertaId, acaoTomada });
  },

  // Adicionar checklist
  async adicionarChecklist(cargaId: string, item: string, cumprido: boolean = false, observacao: string = ''): Promise<{
    returnCode: number;
    returnMsg: string;
    data: any;
  }> {
    return apiClient.post(API_ENDPOINTS.ADICIONAR_CHECKLIST, { cargaId, item, cumprido, observacao });
  },

  // Atualizar inspeção
  async atualizarInspecao(
    cargaId: string,
    tipoInspecao: 'inicial' | 'final',
    resultado: string,
    observacoes?: string,
    documentos?: string[]
  ): Promise<{
    returnCode: number;
    returnMsg: string;
    data: any;
  }> {
    return apiClient.post(API_ENDPOINTS.ATUALIZAR_INSPECAO, {
      cargaId,
      tipoInspecao,
      resultado,
      observacoes,
      documentos,
    });
  },

  // Registrar pagamento
  async registrarPagamento(
    cargaId: string,
    valor: number,
    dataVencimento: string,
    moeda: string = 'MZN',
    metodoPagamento?: string,
    referencia?: string
  ): Promise<{
    returnCode: number;
    returnMsg: string;
    data: any;
  }> {
    return apiClient.post(API_ENDPOINTS.REGISTRAR_PAGAMENTO, {
      cargaId,
      valor,
      moeda,
      dataVencimento,
      metodoPagamento,
      referencia,
    });
  },

  // Estatísticas do cliente
  async getEstatisticasCliente(clienteId: string): Promise<{
    returnCode: number;
    returnMsg: string;
    data: any;
  }> {
    return apiClient.post(API_ENDPOINTS.ESTATISTICAS_CLIENTE, { clienteId });
  },

  // Arquivar carga
  async arquivar(cargaId: string): Promise<{
    returnCode: number;
    returnMsg: string;
    data: { cargaId: string; codigoRastreio: string; arquivado: boolean };
  }> {
    return apiClient.post(API_ENDPOINTS.ARQUIVAR_CARGA, { cargaId });
  },

  // Desarquivar carga
  async desarquivar(cargaId: string): Promise<{
    returnCode: number;
    returnMsg: string;
    data: { cargaId: string; codigoRastreio: string; arquivado: boolean };
  }> {
    return apiClient.post(API_ENDPOINTS.DESARQUIVAR_CARGA, { cargaId });
  },

  // Adicionar tag
  async adicionarTag(cargaId: string, tag: string): Promise<{
    returnCode: number;
    returnMsg: string;
    data: { tags: string[]; totalTags: number };
  }> {
    return apiClient.post(API_ENDPOINTS.ADICIONAR_TAG, { cargaId, tag });
  },

  // Remover tag
  async removerTag(cargaId: string, tag: string): Promise<{
    returnCode: number;
    returnMsg: string;
    data: { tags: string[]; totalTags: number };
  }> {
    return apiClient.post(API_ENDPOINTS.REMOVER_TAG, { cargaId, tag });
  },

  // Buscar cargas por tag
  async getByTag(tag: string, limit: number = 100): Promise<{
    returnCode: number;
    returnMsg: string;
    data: { tag: string; total: number; cargas: Carga[] };
  }> {
    return apiClient.post(API_ENDPOINTS.CARGAS_BY_TAG, { tag, limit });
  },

  // Relatório de alertas
  async getRelatorioAlertas(cargaId: string, resolvido: boolean = false, limit: number = 50, page: number = 1): Promise<{
    returnCode: number;
    returnMsg: string;
    data: any;
  }> {
    return apiClient.post(API_ENDPOINTS.RELATORIO_ALERTAS, { cargaId, resolvido, limit, page });
  },

  // Relatório de ocorrências
  async getRelatorioOcorrencias(
    cargaId: string,
    status?: string,
    gravidade?: string,
    limit: number = 50,
    page: number = 1
  ): Promise<{
    returnCode: number;
    returnMsg: string;
    data: any;
  }> {
    return apiClient.post(API_ENDPOINTS.RELATORIO_OCORRENCIAS, { cargaId, status, gravidade, limit, page });
  },

  // Relatório de reclamações
  async getRelatorioReclamacoes(
    cargaId: string,
    status?: string,
    prioridade?: string,
    limit: number = 50,
    page: number = 1
  ): Promise<{
    returnCode: number;
    returnMsg: string;
    data: any;
  }> {
    return apiClient.post(API_ENDPOINTS.RELATORIO_RECLAMACOES, { cargaId, status, prioridade, limit, page });
  },

  // Relatório da carga
  async getRelatorio(cargaId: string, tipo: string = 'transporte'): Promise<{
    returnCode: number;
    returnMsg: string;
    data: any;
  }> {
    return apiClient.post(API_ENDPOINTS.RELATORIO_CARGA, { cargaId, tipo });
  },

  // Exportar cargas
  async exportar(format: 'json' | 'csv' = 'json', campos: string[] = [], filtros: any = {}, limit: number = 1000): Promise<{
    returnCode: number;
    returnMsg: string;
    data: any;
  }> {
    return apiClient.post(API_ENDPOINTS.EXPORTAR_CARGAS, { formato: format, campos, filtros, limit });
  },
};