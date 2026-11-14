'use client';

import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';

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
    _id: string;
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
  clienteId?: string;
  transportadorId?: string;
  motoristaId?: string;
}

export interface RegisterResponse {
  utilizadorId: string;
  nomeUtilizador: string;
  email: string;
  nomeCompleto: string;
  perfil: string;
  estadoConta: string;
  dataCriacao: string;
}

export interface ChangePasswordRequest {
  palavraPasseAtual: string;
  novaPalavraPasse: string;
  confirmarPalavraPasse: string;
}

export interface ResetPasswordRequest {
  token: string;
  novaPalavraPasse: string;
  confirmarPalavraPasse: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface RefreshTokenResponse {
  token: string;
}

export interface LogoutResponse {
  returnCode: number;
  returnMsg: string;
}

export interface UserProfile {
  _id?: string;
  utilizadorId: string;
  nomeUtilizador: string;
  email: string;
  nomeCompleto: string;
  perfil: string;
  telefone: string;
  telefoneAlternativo?: string;
  clienteId?: string;
  transportadorId?: string;
  motoristaId?: string;
  permissoes?: Record<string, boolean>;
  estadoConta: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

// ================================================================
// FUNÇÕES DE AUTENTICAÇÃO
// ================================================================

export const authApi = {
  /**
   * Login do utilizador
   */
  async login(username: string, password: string): Promise<{
    returnCode: number;
    returnMsg: string;
    data: LoginResponse;
  }> {
    const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.LOGIN, {
      nomeUtilizador: username,
      palavraPasse: password,
    });
    return response;
  },

  /**
   * Logout do utilizador
   */
  async logout(): Promise<{
    returnCode: number;
    returnMsg: string;
  }> {
    const response = await apiClient.post<{ returnCode: number; returnMsg: string }>(
      API_ENDPOINTS.LOGOUT,
      {}
    );
    return response;
  },

  /**
   * Registro de novo utilizador
   */
  async register(data: RegisterRequest): Promise<{
    returnCode: number;
    returnMsg: string;
    data: RegisterResponse;
  }> {
    const response = await apiClient.post<RegisterResponse>(API_ENDPOINTS.REGISTER, data);
    return response;
  },

  /**
   * Atualizar token de refresh
   */
  async refreshToken(): Promise<{
    returnCode: number;
    returnMsg: string;
    data: RefreshTokenResponse;
  }> {
    const response = await apiClient.post<RefreshTokenResponse>(API_ENDPOINTS.REFRESH_TOKEN, {});
    return response;
  },

  /**
   * Alterar palavra-passe
   */
  async changePassword(data: ChangePasswordRequest): Promise<{
    returnCode: number;
    returnMsg: string;
  }> {
    const response = await apiClient.post<{ returnCode: number; returnMsg: string }>(
      '/auth/change-password',
      data
    );
    return response;
  },

  /**
   * Solicitar recuperação de palavra-passe
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<{
    returnCode: number;
    returnMsg: string;
  }> {
    const response = await apiClient.post<{ returnCode: number; returnMsg: string }>(
      '/auth/forgot-password',
      data
    );
    return response;
  },

  /**
   * Redefinir palavra-passe
   */
  async resetPassword(data: ResetPasswordRequest): Promise<{
    returnCode: number;
    returnMsg: string;
  }> {
    const response = await apiClient.post<{ returnCode: number; returnMsg: string }>(
      '/auth/reset-password',
      data
    );
    return response;
  },

  /**
   * Verificar token de autenticação
   */
  async verifyToken(): Promise<{
    returnCode: number;
    returnMsg: string;
    data: { valid: boolean; user?: UserProfile };
  }> {
    const response = await apiClient.post<{ valid: boolean; user?: UserProfile }>(
      '/auth/verify-token',
      {}
    );
    return response;
  },

  /**
   * Buscar perfil do utilizador atual
   */
  async getProfile(): Promise<{
    returnCode: number;
    returnMsg: string;
    data: UserProfile;
  }> {
    const response = await apiClient.post<UserProfile>('/auth/profile', {});
    return response;
  },

  /**
   * Atualizar perfil do utilizador
   */
  async updateProfile(data: Partial<UserProfile>): Promise<{
    returnCode: number;
    returnMsg: string;
    data: UserProfile;
  }> {
    const response = await apiClient.post<UserProfile>('/auth/profile/update', data);
    return response;
  },

  /**
   * Ativar conta do utilizador
   */
  async activateAccount(token: string): Promise<{
    returnCode: number;
    returnMsg: string;
  }> {
    const response = await apiClient.post<{ returnCode: number; returnMsg: string }>(
      '/auth/activate',
      { token }
    );
    return response;
  },

  /**
   * Verificar se o utilizador está autenticado
   */
  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  },

  /**
   * Obter token de autenticação
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  },

  /**
   * Obter dados do utilizador
   */
  getUser(): UserProfile | null {
    return apiClient.getUser();
  },

  /**
   * Salvar token e dados do utilizador
   */
  setAuthData(token: string, user: UserProfile): void {
    apiClient.setToken(token);
    apiClient.setUser(user);
  },

  /**
   * Limpar dados de autenticação
   */
  clearAuthData(): void {
    apiClient.logout();
  },
};

// ================================================================
// HELPERS DE AUTENTICAÇÃO
// ================================================================

/**
 * Verificar se o utilizador tem uma determinada permissão
 */
export function hasPermission(user: UserProfile | null, permission: string): boolean {
  if (!user) return false;
  if (user.perfil === 'administrador_principal') return true;
  return user.permissoes?.[permission] === true;
}

/**
 * Verificar se o utilizador tem um determinado perfil
 */
export function hasProfile(user: UserProfile | null, profiles: string | string[]): boolean {
  if (!user) return false;
  const profileList = Array.isArray(profiles) ? profiles : [profiles];
  return profileList.includes(user.perfil);
}

/**
 * Verificar se o utilizador é administrador
 */
export function isAdmin(user: UserProfile | null): boolean {
  if (!user) return false;
  return user.perfil === 'administrador_principal' || user.perfil === 'administrador';
}

/**
 * Verificar se o utilizador é cliente
 */
export function isCliente(user: UserProfile | null): boolean {
  if (!user) return false;
  return user.perfil === 'cliente';
}

/**
 * Verificar se o utilizador é transportador
 */
export function isTransportador(user: UserProfile | null): boolean {
  if (!user) return false;
  return user.perfil === 'transportador';
}

/**
 * Verificar se o utilizador é motorista
 */
export function isMotorista(user: UserProfile | null): boolean {
  if (!user) return false;
  return user.perfil === 'motorista';
}

/**
 * Obter label do perfil do utilizador
 */
export function getPerfilLabel(perfil: string): string {
  const labels: Record<string, string> = {
    administrador_principal: 'Administrador Principal',
    administrador: 'Administrador',
    cliente: 'Cliente',
    transportador: 'Transportador',
    motorista: 'Motorista',
    analista: 'Analista',
    suporte: 'Suporte',
  };
  return labels[perfil] || perfil;
}

/**
 * Obter cor do perfil do utilizador
 */
export function getPerfilColor(perfil: string): string {
  const colors: Record<string, string> = {
    administrador_principal: 'bg-red-100 text-red-800',
    administrador: 'bg-blue-100 text-blue-800',
    cliente: 'bg-green-100 text-green-800',
    transportador: 'bg-purple-100 text-purple-800',
    motorista: 'bg-yellow-100 text-yellow-800',
    analista: 'bg-indigo-100 text-indigo-800',
    suporte: 'bg-orange-100 text-orange-800',
  };
  return colors[perfil] || 'bg-gray-100 text-gray-800';
}

// Exportação padrão
export default authApi;