// ================================================================
// TIPOS DE CARGA - COMPLETO
// ================================================================

export interface Coordenadas {
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface Contacto {
  nome: string;
  telefone: string;
  email?: string;
}

export interface Endereco {
  endereco: string;
  cidade: string;
  estado?: string;
  pais: string;
  codigoPostal?: string;
  coordenadas?: Coordenadas;
  pontoReferencia?: string;
  contacto?: Contacto;
  dataHoraPrevistaSaida?: string;
  dataHoraRealSaida?: string;
  dataHoraPrevistaChegada?: string;
  dataHoraRealChegada?: string;
}

export interface Viatura {
  matricula: string;
  marca?: string;
  modelo?: string;
  ano?: number;
  cor?: string;
  capacidadeCarga?: number;
  tipoViatura?: string;
}

export interface Cliente {
  clienteId: string;
  nome: string;
  email?: string;
  telefone?: string;
  nif?: string;
  endereco?: string;
}

export interface Transportador {
  transportadorId: string;
  nome: string;
  email?: string;
  telefone?: string;
  nif?: string;
  endereco?: string;
  licenca?: string;
}

export interface Motorista {
  /** _id do documento Utilizador do motorista, convertido para string. */
  motoristaId?: string;
  nome: string;
  email?: string;
  telefone: string;
  documentoIdentificacao?: string;
  cartaConducao?: string;
  categoriaCarta?: string;
  validadeCarta?: string;
  foto?: string;
}

export interface Etapa {
  etapaId: string;
  nome: string;
  descricao?: string;
  dataHoraInicio?: string;
  dataHoraFim?: string;
  duracaoEstimada?: number;
  duracaoReal?: number;
  localizacao?: {
    endereco?: string;
    cidade?: string;
    pais?: string;
    coordenadas?: Coordenadas;
  };
  responsavel?: {
    nome: string;
    cargo?: string;
    contacto?: string;
  };
  documentos?: Documento[];
  status: 'pendente' | 'em_andamento' | 'concluido' | 'atrasado' | 'interrompido';
  observacoes?: string;
}

export interface Documento {
  documentoId: string;
  nome: string;
  tipo?: string;
  url: string;
  descricao?: string;
  dataUpload: string;
  uploadPor?: {
    usuarioId: string;
    nome: string;
    perfil: string;
  };
  tamanhoKB?: number;
  formato?: string;
  versao?: number;
}

export interface NotificacaoEnviada {
  destinatario: string;
  tipo: string;
  dataEnvio: string;
  lido: boolean;
}

export interface Alerta {
  alertaId: string;
  tipo: string;
  gravidade: 'baixa' | 'media' | 'alta' | 'critica';
  mensagem: string;
  dataHora: string;
  localizacao?: {
    latitude: number;
    longitude: number;
    endereco?: string;
  };
  resolvido: boolean;
  resolvidoEm?: string;
  resolvidoPor?: string;
  acaoTomada?: string;
  notificacoesEnviadas?: NotificacaoEnviada[];
}

export interface Ocorrencia {
  ocorrenciaId: string;
  tipo: string;
  descricao: string;
  dataHora: string;
  localizacao?: {
    latitude: number;
    longitude: number;
    endereco?: string;
    cidade?: string;
    pais?: string;
  };
  gravidade: 'leve' | 'moderada' | 'grave' | 'critica';
  status: 'reportado' | 'em_analise' | 'em_resolucao' | 'resolvido' | 'fechado';
  responsavel?: {
    nome: string;
    cargo?: string;
    contacto?: string;
  };
  acoesTomadas?: Array<{
    descricao: string;
    dataHora: string;
    responsavel: string;
  }>;
  evidencias?: Array<{
    tipo: string;
    url: string;
    nome: string;
    descricao?: string;
    dataUpload: string;
  }>;
}

export interface Reclamacao {
  reclamacaoId: string;
  clienteId: string;
  clienteNome: string;
  tipo: string;
  descricao: string;
  dataHora: string;
  anexos?: Array<{
    nome: string;
    url: string;
    tipo: string;
    dataUpload: string;
  }>;
  status: 'recebida' | 'em_analise' | 'em_negociacao' | 'resolvida' | 'fechada' | 'rejeitada';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  atendimento?: {
    responsavel: string;
    dataAtribuicao: string;
    dataResolucao?: string;
    acaoTomada?: string;
    observacoes?: string;
  };
  historico: Array<{
    status: string;
    dataHora: string;
    responsavel: string;
    comentario?: string;
  }>;
}

export interface LocalizacaoAtual {
  latitude: number;
  longitude: number;
  altitude?: number;
  velocidade?: number;
  direcao?: number;
  precisao?: number;
  endereco?: string;
  cidade?: string;
  pais?: string;
  dataHora: string;
  fonte: 'gps' | 'manual' | 'sistema' | 'transportador';
}

export interface ConfirmacaoEntrega {
  realizada: boolean;
  dataHora?: string;
  clienteId?: string;
  clienteNome?: string;
  status?: string;
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
  documentos?: Documento[];
  coordenadas?: Coordenadas;
}

export interface Metricas {
  distanciaPercorridaKm?: number | null;
  tempoTotalViagemHoras?: number | null;
  tempoParadoHoras?: number | null;
  numeroParagens?: number | null;
  combustivelGasto?: number | null;
  custoTotal?: number | null;
  eficiencia?: number | null;
  pontualidade?: string | null;
}

export interface ControleQualidade {
  inspecaoInicial?: {
    realizada: boolean;
    dataHora: string;
    responsavel: string;
    resultado: 'aprovado' | 'reprovado' | 'condicional';
    observacoes: string;
  };
  inspecaoFinal?: {
    realizada: boolean;
    dataHora: string;
    responsavel: string;
    resultado: 'aprovado' | 'reprovado' | 'condicional';
    observacoes: string;
  };
  checklist?: Array<{
    item: string;
    cumprido: boolean;
    dataHora: string;
    responsavel: string;
    observacao: string;
  }>;
}

export interface Pagamento {
  pagamentoId: string;
  valor: number;
  moeda: string;
  dataPagamento: string;
  dataVencimento: string;
  status: string;
  metodoPagamento: string;
  referencia: string;
  comprovativo?: {
    url: string;
    nome: string;
    dataUpload: string;
  };
  observacoes?: string;
}

export interface Rota {
  distanciaTotalKm?: number;
  tempoEstimadoHoras?: number;
  pontosPassagem?: Array<{
    ordem: number;
    nome: string;
    cidade: string;
    pais: string;
    coordenadas?: Coordenadas;
    tempoEstimadoChegada?: string;
    tempoRealChegada?: string;
    tempoEstimadoSaida?: string;
    tempoRealSaida?: string;
    observacao?: string;
  }>;
  coordenadasRota?: Array<{
    latitude: number;
    longitude: number;
    timestamp: string;
    velocidade?: number;
    altitude?: number;
  }>;
  desvioPermitidoKm?: number;
  rotaOtimizada?: boolean;
  rotaAlternativa?: Array<{
    descricao: string;
    distanciaKm: number;
    tempoEstimadoHoras: number;
    motivo: string;
  }>;
}

export interface Contentor {
  numeroContentor?: string;
  tipoContentor?: string;
  selo?: string;
  estadoContentor?: string;
}

export interface Reboque {
  matricula?: string;
  tipo?: string;
  capacidade?: number | null;
}

// ================================================================
// INTERFACE PRINCIPAL DA CARGA
// ================================================================

export interface Carga {
  cargaId: string;
  numeroOrdem?: string;
  codigoRastreio: string;
  descricao: string;
  tipoMercadoria: string;
  peso: number;
  volume: number;
  valorDeclarado: number;
  unidadeMedidaPeso?: string;
  unidadeMedidaVolume?: string;
  
  contentor?: Contentor;
  viatura: Viatura;
  reboque?: Reboque;
  
  origem: Endereco;
  destino: Endereco;
  rota?: Rota;
  
  etapas: Etapa[];
  status: string;
  statusAnterior?: string;
  dataHoraStatus: string;
  
  cliente: Cliente;
  transportador: Transportador;
  motorista: Motorista;
  
  localizacaoAtual: LocalizacaoAtual;
  historicoLocalizacoes: LocalizacaoAtual[];
  
  alertas: Alerta[];
  ocorrencias: Ocorrencia[];
  reclamacoes: Reclamacao[];
  
  confirmacaoEntrega?: ConfirmacaoEntrega;
  documentos: Documento[];
  
  metricas?: Metricas;
  controleQualidade?: ControleQualidade;
  pagamentos?: Pagamento[];
  
  observacoes?: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  tags: string[];
  
  ativo: boolean;
  arquivado: boolean;
  versao: number;
  visibilidade?: 'publico' | 'privado' | 'restrito';
  
  dataCriacao: string;
  dataAtualizacao: string;
  dataExpiracao?: string;
  dataCancelamento?: string;
  
  createdBy?: {
    usuarioId: string;
    nome: string;
    perfil: string;
  };
  updatedBy?: {
    usuarioId: string;
    nome: string;
    perfil: string;
  };
  
  progressoPercentual?: number;
  estaAtrasada?: boolean;
  tempoDecorridoHoras?: number;
  etapaAtual?: Etapa;
  totalReclamacoesAbertas?: number;
  totalIncidentesAtivos?: number;
  tempoEstimadoRestanteHoras?: number;
}

// ================================================================
// TIPOS DE RESPOSTA DA API
// ================================================================

export interface CargaListResponse {
  list: Carga[];
  totalCount: number;
  totalPage: number;
  curPage: number;
  pageSize: number;
}

export type CargaDetailResponse = Carga;

export interface CargaDashboardResponse {
  estatisticas: {
    totalCargas: number;
    totalEntregues: number;
    totalEmTransito: number;
    totalAtrasadas: number;
    totalIncidentes: number;
    totalReclamacoes: number;
    totalValorDeclarado: number;
    totalPeso: number;
    totalVolume: number;
  };
  ultimasCargas: Carga[];
  cargasPorStatus: Array<{ _id: string; count: number }>;
  cargasPorTipoMercadoria: Array<{ _id: string; count: number }>;
  cargasPorPrioridade: Array<{ _id: string; count: number }>;
  cargasAtrasadas: Carga[];
}

// ================================================================
// TIPOS DE CRIAÇÃO/ATUALIZAÇÃO DE CARGA
// ================================================================

export interface CreateCargaData {
  // ============================================================
  // CODIGO RASTREIO - ADICIONADO
  // ============================================================
  codigoRastreio?: string;  // <<<--- ADICIONADO
  
  descricao: string;
  tipoMercadoria?: string;
  peso: number;
  volume: number;
  valorDeclarado: number;

  unidadeMedidaPeso?: string;
  unidadeMedidaVolume?: string;

  contentor?: Contentor;

  viatura: {
    matricula: string;
    marca?: string;
    modelo?: string;
    ano?: number | null;
    cor?: string;
    capacidadeCarga?: number | null;
    tipoViatura?: string;
  };

  reboque?: Reboque;

  origem: {
    endereco: string;
    cidade: string;
    estado?: string;
    pais?: string;
    codigoPostal?: string;
    coordenadas?: Coordenadas;
    pontoReferencia?: string;
    contacto?: Contacto;
    dataHoraPrevistaSaida?: string | null;
    dataHoraRealSaida?: string | null;
  };

  destino: {
    endereco: string;
    cidade: string;
    estado?: string;
    pais?: string;
    codigoPostal?: string;
    coordenadas?: Coordenadas;
    pontoReferencia?: string;
    contacto?: Contacto;
    dataHoraPrevistaChegada?: string | null;
    dataHoraRealChegada?: string | null;
  };

  rota?: Rota;
  etapas?: Etapa[];

  status?: string;

  cliente: Cliente;
  transportador: Transportador;
  motorista: Motorista;

  localizacaoAtual?: {
    latitude: number;
    longitude: number;
    altitude?: number | null;
    velocidade?: number | null;
    direcao?: number | null;
    precisao?: number | null;
    endereco?: string;
    cidade?: string;
    pais?: string;
    dataHora: string;
    fonte?: 'gps' | 'manual' | 'sistema' | 'transportador';
  };

  historicoLocalizacoes?: LocalizacaoAtual[];

  alertas?: Alerta[];

  ocorrencias?: Ocorrencia[];

  reclamacoes?: Reclamacao[];

  confirmacaoEntrega?: ConfirmacaoEntrega | Record<string, never>;

  documentos?: Documento[];

  pagamentos?: Pagamento[];

  mensagens?: unknown[];

  notificacoes?: unknown[];

  relatorios?: unknown[];

  prioridade?: 'baixa' | 'media' | 'alta' | 'urgente';

  observacoes?: string;

  tags?: string[];

  metricas?: Metricas;

  controleQualidade?: ControleQualidade;
}