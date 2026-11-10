/* eslint-disable @typescript-eslint/no-explicit-any */
// ================================================================
// TIPOS DE RESPOSTA DA API
// ================================================================

export interface ApiResponse<T = any> {
  returnCode: number;
  returnMsg: string;
  data: T;
}

export interface ApiError {
  returnCode: number;
  returnMsg: string;
  errors?: Record<string, string[]>;
}

// ================================================================
// TIPOS DE AUTENTICAÇÃO
// ================================================================

export interface LoginRequest {
  nomeUtilizador: string;
  palavraPasse: string;
}

export interface LoginResponse {
  token: string;
  user: {
    utilizadorId: string;
    nomeUtilizador: string;
    email: string;
    nomeCompleto: string;
    perfil: string;
    clienteId?: string;
    transportadorId?: string;
    motoristaId?: string;
    permissoes?: Record<string, boolean>;
    estadoConta: string;
  };
}

export interface RegisterRequest {
  nomeUtilizador: string;
  email: string;
  palavraPasse: string;
  nomeCompleto: string;
  telefone: string;
  perfil: string;
}

// ================================================================
// TIPOS DE PAGINAÇÃO
// ================================================================

export interface PaginationParams {
  curPage?: number;
  pageSize?: number;
  orderBy?: string;
  orderDirection?: -1 | 1;
}

export interface PaginatedResponse<T> {
  list: T[];
  totalCount: number;
  totalPage: number;
  curPage: number;
  pageSize: number;
}

// ================================================================
// TIPOS DE FILTROS
// ================================================================

export interface CargaFilters {
  status?: string;
  tipoMercadoria?: string;
  clienteId?: string;
  transportadorId?: string;
  motoristaId?: string;
  origemCidade?: string;
  destinoCidade?: string;
  search?: string;
  dataInicio?: string;
  dataFim?: string;
  temAlertas?: boolean;
  temReclamacoes?: boolean;
  prioridade?: string;
}

export interface ClienteFilters {
  search?: string;
  cidade?: string;
  provincia?: string;
  ativo?: boolean;
}

export interface TransportadorFilters {
  search?: string;
  cidade?: string;
  provincia?: string;
  ativo?: boolean;
}

// ================================================================
// TIPOS DE PERMISSÕES
// ================================================================

export interface Permissoes {
  verTodasCargas: boolean;
  verCargasAtribuidas: boolean;
  criarCarga: boolean;
  editarCarga: boolean;
  eliminarCarga: boolean;
  verTodosClientes: boolean;
  verClientesAtribuidos: boolean;
  criarCliente: boolean;
  editarCliente: boolean;
  eliminarCliente: boolean;
  verTodosTransportadores: boolean;
  verTransportadoresAtribuidos: boolean;
  criarTransportador: boolean;
  editarTransportador: boolean;
  eliminarTransportador: boolean;
  verTodosMotoristas: boolean;
  verMotoristasAtribuidos: boolean;
  criarMotorista: boolean;
  editarMotorista: boolean;
  eliminarMotorista: boolean;
  verTodosUtilizadores: boolean;
  criarUtilizador: boolean;
  editarUtilizador: boolean;
  eliminarUtilizador: boolean;
  atribuirPermissoes: boolean;
  atualizarLocalizacao: boolean;
  reportarIncidente: boolean;
  registrarReclamacao: boolean;
  confirmarEntrega: boolean;
  gerarRelatorios: boolean;
  verTodosRelatorios: boolean;
  verDocumentosCarga: boolean;
  uploadDocumentos: boolean;
  eliminarDocumentos: boolean;
  verLogsAuditoria: boolean;
  exportarLogs: boolean;
  configurarSistema: boolean;
  verAlertasTodasCargas: boolean;
  configurarAlertas: boolean;
}

// ================================================================
// TIPOS DE UTILIZADOR
// ================================================================

export interface Utilizador {
  utilizadorId: string;
  nomeUtilizador: string;
  email: string;
  nomeCompleto: string;
  telefone: string;
  telefoneAlternativo?: string;
  perfil: string;
  permissoes: Permissoes;
  estadoConta: 'ativo' | 'inativo' | 'bloqueado' | 'pendente_ativacao' | 'suspenso';
  clienteId?: string;
  transportadorId?: string;
  motoristaId?: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

// ================================================================
// TIPOS DE LOG DE AUDITORIA
// ================================================================

export interface LogAuditoria {
  logId: string;
  utilizadorId: string;
  utilizadorNome: string;
  utilizadorPerfil: string;
  acao: string;
  recursoTipo: string;
  recursoId?: string;
  recursoNome?: string;
  descricao: string;
  detalhes?: {
    antes?: any;
    depois?: any;
    alteracoes?: Array<{
      campo: string;
      antigoValor: any;
      novoValor: any;
    }>;
    dados?: any;
  };
  resultado: 'sucesso' | 'falha' | 'parcial';
  mensagemErro?: string;
  enderecoIP?: string;
  userAgent?: string;
  dataHora: string;
}

// ================================================================
// TIPOS DE NOTIFICAÇÃO
// ================================================================

export interface Notificacao {
  notificacaoId: string;
  destinatario: {
    usuarioId: string;
    nome: string;
    perfil: string;
  };
  tipo: string;
  titulo: string;
  mensagem: string;
  dataEnvio: string;
  lido: boolean;
  dataLeitura?: string;
  linkAcao?: string;
  acao?: {
    tipo: string;
    dados: any;
  };
}

// ================================================================
// TIPOS DE SESSÃO
// ================================================================

export interface Sessao {
  sessaoId: string;
  utilizadorId: string;
  token: string;
  dataInicio: string;
  dataExpiracao: string;
  dataUltimaAtividade: string;
  enderecoIP?: string;
  userAgent?: string;
  dispositivo?: string;
  localizacao?: {
    pais?: string;
    cidade?: string;
    coordenadas?: {
      latitude: number;
      longitude: number;
    };
  };
  ativa: boolean;
  terminadaEm?: string;
  motivoTermino?: 'logout' | 'expiracao' | 'inatividade' | 'forcado' | 'sistema';
}

// ================================================================
// TIPOS DE RELATÓRIO
// ================================================================

export interface RelatorioParams {
  cargaId?: string;
  tipo?: string;
  formato?: 'pdf' | 'excel' | 'csv' | 'json';
  dataInicio?: string;
  dataFim?: string;
  clienteId?: string;
  transportadorId?: string;
}

export interface Relatorio {
  relatorioId: string;
  tipo: string;
  titulo: string;
  descricao?: string;
  dataGeracao: string;
  geradoPor: {
    usuarioId: string;
    nome: string;
    perfil: string;
  };
  formato: string;
  url: string;
  parametros?: any;
  tamanhoKB?: number;
}

// ================================================================
// TIPOS DE ESTATÍSTICAS
// ================================================================

export interface EstatisticasGerais {
  totalCargas: number;
  totalEntregues: number;
  totalEmTransito: number;
  totalAtrasadas: number;
  totalIncidentes: number;
  totalReclamacoes: number;
  totalValorDeclarado: number;
  totalPeso: number;
  totalVolume: number;
}

export interface EstatisticasCliente {
  clienteId: string;
  clienteNome: string;
  totalCargas: number;
  totalEntregues: number;
  totalEmTransito: number;
  totalReclamacoes: number;
  totalAtrasadas: number;
  valorTotalCargas: number;
  pesoTotal: number;
  volumeTotal: number;
}

export interface EstatisticasTransportador {
  transportadorId: string;
  transportadorNome: string;
  totalCargas: number;
  totalEntregues: number;
  totalEmTransito: number;
  totalIncidentes: number;
  totalAtrasadas: number;
  valorTotalCargas: number;
  distanciaTotalPercorrida: number;
}

// ================================================================
// TIPOS DE DASHBOARD
// ================================================================

export interface DashboardData {
  estatisticas: EstatisticasGerais;
  ultimasCargas: any[];
  cargasPorStatus: Array<{ _id: string; count: number }>;
  cargasPorTipoMercadoria: Array<{ _id: string; count: number }>;
  cargasPorPrioridade: Array<{ _id: string; count: number }>;
  cargasAtrasadas: any[];
  alertasRecentes?: any[];
  atividadesRecentes?: any[];
}

// ================================================================
// TIPOS DE EXPORTAÇÃO
// ================================================================

export interface ExportParams {
  formato: 'json' | 'csv' | 'excel';
  campos?: string[];
  filtros?: Record<string, any>;
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface ExportResult {
  formato: string;
  conteudo: any;
  totalRegistros: number;
  nomeArquivo?: string;
}

// ================================================================
// TIPOS DE VALIDAÇÃO
// ================================================================

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ================================================================
// TIPOS DE WEBSOCKET
// ================================================================

export interface WebSocketMessage {
  type: 'carga_update' | 'localizacao' | 'alerta' | 'notificacao' | 'status_change';
  payload: any;
  timestamp: string;
}

export interface CargaUpdateMessage {
  cargaId: string;
  codigoRastreio: string;
  status?: string;
  localizacao?: {
    latitude: number;
    longitude: number;
  };
  alerta?: {
    tipo: string;
    mensagem: string;
    gravidade: string;
  };
  timestamp: string;
}