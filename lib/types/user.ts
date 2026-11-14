// ================================================================
// TIPOS DE UTILIZADOR
// ================================================================

export interface User {
  _id?: string;
  utilizadorId: string;
  nomeUtilizador: string;
  email: string;
  nomeCompleto: string;
  telefone: string;
  telefoneAlternativo?: string;
  perfil: UserProfile;
  permissoes: UserPermissions;
  permissoesCargas?: CargaPermission[];
  estadoConta: UserAccountStatus;
  motivoBloqueio?: {
    tipo: BlockReasonType;
    descricao: string;
    dataBloqueio: string;
    dataDesbloqueio?: string;
    bloqueadoPor?: string;
  };
  clienteId?: string;
  transportadorId?: string;
  motoristaId?: string;
  empresas?: EmpresaAssociada[];
  dataNascimento?: string;
  genero?: 'masculino' | 'feminino' | 'outro' | 'prefiro_nao_dizer';
  endereco?: {
    rua: string;
    cidade: string;
    provincia: string;
    pais: string;
    codigoPostal?: string;
  };
  documentosIdentificacao?: DocumentoIdentificacao[];
  preferenciasNotificacao?: NotificacaoPreferences;
  preferenciasSistema?: SistemaPreferences;
  ultimoAcesso?: {
    dataHora: string;
    enderecoIP: string;
    userAgent: string;
    localizacao?: {
      pais: string;
      cidade: string;
      coordenadas?: {
        latitude: number;
        longitude: number;
      };
    };
    dispositivo?: string;
  };
  historicoAcessos?: HistoricoAcesso[];
  sessaoAtiva?: {
    token: string;
    dataInicio: string;
    dataExpiracao: string;
    enderecoIP: string;
    userAgent: string;
  };
  recuperacaoSenha?: {
    token: string;
    dataExpiracao: string;
    utilizado: boolean;
    solicitadoEm: string;
    dataUtilizacao?: string;
    solicitadoPor?: string;
  };
  tentativasFalhas: number;
  ultimaTentativaFalha?: string;
  doisFatores?: {
    ativo: boolean;
    metodo: 'email' | 'sms' | 'authenticator' | 'none';
    segredo?: string;
    codigosRecuperacao?: Array<{
      codigo: string;
      utilizado: boolean;
      criadoEm: string;
    }>;
  };
  observacoes?: string;
  tags: string[];
  ativo: boolean;
  arquivado: boolean;
  versao: number;
  criadoPor?: {
    utilizadorId: string;
    nome: string;
    data: string;
  };
  atualizadoPor?: {
    utilizadorId: string;
    nome: string;
    data: string;
  };
  dataCriacao: string;
  dataAtualizacao: string;
}

// ================================================================
// TIPOS DE PERFIL DE UTILIZADOR
// ================================================================

export type UserProfile = 
  | 'administrador_principal'
  | 'administrador'
  | 'cliente'
  | 'transportador'
  | 'motorista'
  | 'analista'
  | 'suporte';

export interface ProfileInfo {
  value: UserProfile;
  label: string;
  description: string;
  icon?: string;
  color: string;
}

export const PROFILES: Record<UserProfile, ProfileInfo> = {
  administrador_principal: {
    value: 'administrador_principal',
    label: 'Administrador Principal',
    description: 'Acesso total ao sistema, todas as permissões',
    color: 'text-red-600 bg-red-100',
  },
  administrador: {
    value: 'administrador',
    label: 'Administrador',
    description: 'Gestão completa, exceto exclusão de dados e permissões',
    color: 'text-blue-600 bg-blue-100',
  },
  cliente: {
    value: 'cliente',
    label: 'Cliente',
    description: 'Acesso às suas próprias cargas e reclamações',
    color: 'text-green-600 bg-green-100',
  },
  transportador: {
    value: 'transportador',
    label: 'Transportador',
    description: 'Gestão de cargas atribuídas e incidentes',
    color: 'text-purple-600 bg-purple-100',
  },
  motorista: {
    value: 'motorista',
    label: 'Motorista',
    description: 'Atualização de localização e incidentes',
    color: 'text-yellow-600 bg-yellow-100',
  },
  analista: {
    value: 'analista',
    label: 'Analista',
    description: 'Visualização de dados e geração de relatórios',
    color: 'text-indigo-600 bg-indigo-100',
  },
  suporte: {
    value: 'suporte',
    label: 'Suporte',
    description: 'Atendimento a reclamações e suporte aos clientes',
    color: 'text-orange-600 bg-orange-100',
  },
};

// ================================================================
// TIPOS DE PERMISSÕES
// ================================================================

export interface UserPermissions {
  // Cargas
  verTodasCargas: boolean;
  verCargasAtribuidas: boolean;
  criarCarga: boolean;
  editarCarga: boolean;
  eliminarCarga: boolean;
  atualizarStatusCarga: boolean;
  
  // Clientes
  verTodosClientes: boolean;
  verClientesAtribuidos: boolean;
  criarCliente: boolean;
  editarCliente: boolean;
  eliminarCliente: boolean;
  
  // Transportadores
  verTodosTransportadores: boolean;
  verTransportadoresAtribuidos: boolean;
  criarTransportador: boolean;
  editarTransportador: boolean;
  eliminarTransportador: boolean;
  
  // Motoristas
  verTodosMotoristas: boolean;
  verMotoristasAtribuidos: boolean;
  criarMotorista: boolean;
  editarMotorista: boolean;
  eliminarMotorista: boolean;
  
  // Utilizadores
  verTodosUtilizadores: boolean;
  criarUtilizador: boolean;
  editarUtilizador: boolean;
  eliminarUtilizador: boolean;
  atribuirPermissoes: boolean;
  
  // Operações
  atualizarLocalizacao: boolean;
  reportarIncidente: boolean;
  registrarReclamacao: boolean;
  confirmarEntrega: boolean;
  gerarRelatorios: boolean;
  verTodosRelatorios: boolean;
  adicionarEtapa: boolean;
  
  // Documentos
  verDocumentosCarga: boolean;
  uploadDocumentos: boolean;
  eliminarDocumentos: boolean;
  
  // Auditoria
  verLogsAuditoria: boolean;
  exportarLogs: boolean;
  configurarSistema: boolean;
  
  // Alertas
  verAlertasTodasCargas: boolean;
  configurarAlertas: boolean;
}

export interface CargaPermission {
  cargaId: string;
  permissoes: {
    visualizar: boolean;
    editar: boolean;
    eliminar: boolean;
    atualizarLocalizacao: boolean;
    confirmarEntrega: boolean;
    registrarReclamacao: boolean;
    verDocumentos: boolean;
    uploadDocumentos: boolean;
  };
}

export const DEFAULT_PERMISSIONS: UserPermissions = {
  verTodasCargas: false,
  verCargasAtribuidas: false,
  criarCarga: false,
  editarCarga: false,
  eliminarCarga: false,
  verTodosClientes: false,
  verClientesAtribuidos: false,
  criarCliente: false,
  editarCliente: false,
  eliminarCliente: false,
  verTodosTransportadores: false,
  verTransportadoresAtribuidos: false,
  criarTransportador: false,
  editarTransportador: false,
  eliminarTransportador: false,
  verTodosMotoristas: false,
  verMotoristasAtribuidos: false,
  criarMotorista: false,
  editarMotorista: false,
  eliminarMotorista: false,
  verTodosUtilizadores: false,
  criarUtilizador: false,
  editarUtilizador: false,
  eliminarUtilizador: false,
  atribuirPermissoes: false,
  atualizarLocalizacao: false,
  reportarIncidente: false,
  registrarReclamacao: false,
  confirmarEntrega: false,
  gerarRelatorios: false,
  verTodosRelatorios: false,
  verDocumentosCarga: false,
  uploadDocumentos: false,
  eliminarDocumentos: false,
  verLogsAuditoria: false,
  exportarLogs: false,
  configurarSistema: false,
  verAlertasTodasCargas: false,
  configurarAlertas: false,
  adicionarEtapa: false,
  atualizarStatusCarga: false
};

// ================================================================
// TIPOS DE ESTADO DA CONTA
// ================================================================

export type UserAccountStatus = 'ativo' | 'inativo' | 'bloqueado' | 'pendente_ativacao' | 'suspenso';

export type BlockReasonType = 
  | 'tentativas_falhas'
  | 'inatividade_prolongada'
  | 'violacao_termos'
  | 'solicitacao_utilizador'
  | 'suspeita_comprometimento'
  | 'outro';

export interface AccountStatusInfo {
  value: UserAccountStatus;
  label: string;
  color: string;
  description: string;
}

export const ACCOUNT_STATUSES: Record<UserAccountStatus, AccountStatusInfo> = {
  ativo: {
    value: 'ativo',
    label: 'Ativo',
    color: 'text-green-600 bg-green-100',
    description: 'Conta ativa e com acesso total',
  },
  inativo: {
    value: 'inativo',
    label: 'Inativo',
    color: 'text-gray-600 bg-gray-100',
    description: 'Conta desativada, sem acesso',
  },
  bloqueado: {
    value: 'bloqueado',
    label: 'Bloqueado',
    color: 'text-red-600 bg-red-100',
    description: 'Conta bloqueada temporariamente',
  },
  pendente_ativacao: {
    value: 'pendente_ativacao',
    label: 'Pendente Ativação',
    color: 'text-yellow-600 bg-yellow-100',
    description: 'Aguardando ativação da conta',
  },
  suspenso: {
    value: 'suspenso',
    label: 'Suspenso',
    color: 'text-orange-600 bg-orange-100',
    description: 'Conta suspensa por violação',
  },
};

// ================================================================
// TIPOS DE DOCUMENTOS
// ================================================================

export interface DocumentoIdentificacao {
  tipo: 'bi' | 'passaporte' | 'carta_conducao' | 'nif' | 'outro';
  numero: string;
  dataEmissao?: string;
  dataValidade?: string;
  urlDocumento?: string;
}

export interface DocumentoUpload {
  nome: string;
  tipo: string;
  url: string;
  descricao?: string;
  dataUpload: string;
  tamanhoKB?: number;
  formato?: string;
}

// ================================================================
// TIPOS DE EMPRESA ASSOCIADA
// ================================================================

export interface EmpresaAssociada {
  empresaId: string;
  nome: string;
  perfil: string;
}

// ================================================================
// TIPOS DE PREFERÊNCIAS
// ================================================================

export interface NotificacaoPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  alertas: boolean;
  relatorios: boolean;
  atualizacoesStatus: boolean;
  reclamacoes: boolean;
  incidentes: boolean;
}

export interface SistemaPreferences {
  idioma: 'pt' | 'en' | 'es';
  timezone: string;
  tema: 'claro' | 'escuro' | 'auto';
  notificacoesPushAtivas: boolean;
  atualizacoesAutomaticas: boolean;
}

export const DEFAULT_NOTIFICACOES: NotificacaoPreferences = {
  email: true,
  sms: false,
  push: true,
  alertas: true,
  relatorios: true,
  atualizacoesStatus: true,
  reclamacoes: true,
  incidentes: true,
};

export const DEFAULT_SISTEMA: SistemaPreferences = {
  idioma: 'pt',
  timezone: 'Africa/Maputo',
  tema: 'auto',
  notificacoesPushAtivas: true,
  atualizacoesAutomaticas: true,
};

// ================================================================
// TIPOS DE HISTÓRICO
// ================================================================

export interface HistoricoAcesso {
  dataHora: string;
  enderecoIP: string;
  userAgent: string;
  localizacao?: {
    pais: string;
    cidade: string;
  };
  sucesso: boolean;
  mensagem?: string;
}

// ================================================================
// TIPOS DE RECUPERAÇÃO DE SENHA
// ================================================================

export interface RecuperacaoSenha {
  token: string;
  dataExpiracao: string;
  utilizado: boolean;
  solicitadoEm: string;
  dataUtilizacao?: string;
  solicitadoPor?: string;
}

// ================================================================
// TIPOS DE DOIS FATORES (2FA)
// ================================================================

export interface DoisFatores {
  ativo: boolean;
  metodo: 'email' | 'sms' | 'authenticator' | 'none';
  segredo?: string;
  codigosRecuperacao?: Array<{
    codigo: string;
    utilizado: boolean;
    criadoEm: string;
  }>;
}

// ================================================================
// TIPOS DE SESSÃO
// ================================================================

export interface SessaoAtiva {
  token: string;
  dataInicio: string;
  dataExpiracao: string;
  enderecoIP: string;
  userAgent: string;
}

// ================================================================
// TIPOS DE FILTROS E BUSCA
// ================================================================

export interface UserSearchParams {
  search?: string;
  perfil?: UserProfile;
  estadoConta?: UserAccountStatus;
  clienteId?: string;
  transportadorId?: string;
  motoristaId?: string;
  dataInicio?: string;
  dataFim?: string;
  orderBy?: string;
  orderDirection?: -1 | 1;
}

// ================================================================
// TIPOS DE CRIAÇÃO/ATUALIZAÇÃO DE UTILIZADOR
// ================================================================

export interface CreateUserData {
  nomeUtilizador: string;
  email: string;
  palavraPasse: string;
  nomeCompleto: string;
  telefone: string;
  telefoneAlternativo?: string;
  perfil: UserProfile;
  dataNascimento?: string;
  genero?: 'masculino' | 'feminino' | 'outro' | 'prefiro_nao_dizer';
  endereco?: {
    rua: string;
    cidade: string;
    provincia: string;
    pais: string;
    codigoPostal?: string;
  };
  clienteId?: string;
  transportadorId?: string;
  motoristaId?: string;
  observacoes?: string;
  tags?: string[];
}

export interface UpdateUserData extends Partial<CreateUserData> {
  estadoConta?: UserAccountStatus;
  permissoes?: Partial<UserPermissions>;
  preferenciasNotificacao?: Partial<NotificacaoPreferences>;
  preferenciasSistema?: Partial<SistemaPreferences>;
}

// ================================================================
// TIPOS DE RESPOSTA DA API
// ================================================================

export interface UserListResponse {
  returnCode: number;
  returnMsg: string;
  data: {
    list: User[];
    totalCount: number;
    totalPage: number;
    curPage: number;
    pageSize: number;
  };
}

export interface UserDetailResponse {
  returnCode: number;
  returnMsg: string;
  data: User;
}

export interface UserStatsResponse {
  returnCode: number;
  returnMsg: string;
  data: {
    total: number;
    porPerfil: Array<{
      _id: string;
      total: number;
      ativos: number;
      bloqueados: number;
      inativos: number;
    }>;
  };
}

// ================================================================
// TIPOS DE AUTENTICAÇÃO
// ================================================================

export interface AuthResponse {
  returnCode: number;
  returnMsg: string;
  data: {
    token: string;
    user: User;
  };
}

export interface ChangePasswordData {
  palavraPasseAtual: string;
  novaPalavraPasse: string;
  confirmarPalavraPasse: string;
}

export interface ResetPasswordData {
  token: string;
  novaPalavraPasse: string;
  confirmarPalavraPasse: string;
}