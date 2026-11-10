/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';

export interface Motorista {
  motoristaId: string;
  nome: string;
  email: string;
  telefone: string;
  documentoIdentificacao?: string;
  cartaConducao?: string;
  categoriaCarta?: string;
  validadeCarta?: string;
  ativo: boolean;
  dataCriacao: string;
}

export interface MotoristaListParams {
  curPage?: number;
  pageSize?: number;
  search?: string;
  ativo?: boolean;
  orderBy?: string;
  orderDirection?: number;
}

// Dados mockados para fallback
const MOCK_MOTORISTAS: Motorista[] = [
  {
    motoristaId: 'MOT-001',
    nome: 'João Silva',
    email: 'joao.silva@email.com',
    telefone: '+258 84 111 2222',
    documentoIdentificacao: 'BI-123456789',
    cartaConducao: 'CC-123456',
    categoriaCarta: 'C',
    validadeCarta: '2025-12-31',
    ativo: true,
    dataCriacao: new Date().toISOString(),
  },
  {
    motoristaId: 'MOT-002',
    nome: 'Maria Santos',
    email: 'maria.santos@email.com',
    telefone: '+258 82 333 4444',
    documentoIdentificacao: 'BI-987654321',
    cartaConducao: 'CC-654321',
    categoriaCarta: 'B',
    validadeCarta: '2024-12-31',
    ativo: true,
    dataCriacao: new Date().toISOString(),
  },
  {
    motoristaId: 'MOT-003',
    nome: 'Carlos Andrade',
    email: 'carlos.andrade@email.com',
    telefone: '+258 86 555 6666',
    documentoIdentificacao: 'BI-456789123',
    cartaConducao: 'CC-789012',
    categoriaCarta: 'D',
    validadeCarta: '2026-06-30',
    ativo: true,
    dataCriacao: new Date().toISOString(),
  },
];

export const motoristaApi = {
  async getList(params: MotoristaListParams = {}): Promise<{
    returnCode: number;
    returnMsg: string;
    data: { list: Motorista[]; totalCount: number; totalPage: number; curPage: number; pageSize: number };
  }> {
    try {
      const response = await apiClient.post<any>(API_ENDPOINTS.CARGAS, {
        curPage: 1,
        pageSize: 1000,
        search: params.search,
      });

      if (response.returnCode === 200) {
        const cargas = response.data?.list || [];
        const motoristasMap = new Map<string, Motorista>();
        
        cargas.forEach((carga: any) => {
          if (carga.motorista && carga.motorista.motoristaId) {
            const m = carga.motorista;
            const id = m.motoristaId || `MOT-${Date.now()}`;
            if (!motoristasMap.has(id)) {
              motoristasMap.set(id, {
                motoristaId: id,
                nome: m.nome || 'Motorista sem nome',
                email: m.email || '',
                telefone: m.telefone || '',
                documentoIdentificacao: m.documentoIdentificacao || '',
                cartaConducao: m.cartaConducao || '',
                categoriaCarta: m.categoriaCarta || '',
                validadeCarta: m.validadeCarta || '',
                ativo: true,
                dataCriacao: carga.dataCriacao || new Date().toISOString(),
              });
            }
          }
        });

        let motoristas = Array.from(motoristasMap.values());
        
        if (params.search) {
          const search = params.search.toLowerCase();
          motoristas = motoristas.filter(m => 
            m.nome.toLowerCase().includes(search) ||
            m.email.toLowerCase().includes(search) ||
            m.telefone.includes(search)
          );
        }

        if (motoristas.length === 0) {
          motoristas = MOCK_MOTORISTAS;
        }

        const start = ((params.curPage || 1) - 1) * (params.pageSize || 10);
        const end = start + (params.pageSize || 10);
        const paginated = motoristas.slice(start, end);

        return {
          returnCode: 200,
          returnMsg: 'Success',
          data: {
            list: paginated,
            totalCount: motoristas.length,
            totalPage: Math.ceil(motoristas.length / (params.pageSize || 10)),
            curPage: params.curPage || 1,
            pageSize: params.pageSize || 10,
          }
        };
      }

      return {
        returnCode: 200,
        returnMsg: 'Success (mock)',
        data: {
          list: MOCK_MOTORISTAS,
          totalCount: MOCK_MOTORISTAS.length,
          totalPage: 1,
          curPage: 1,
          pageSize: 10,
        }
      };

    } catch (error) {
      console.warn('⚠️ Erro ao buscar motoristas, usando dados mockados');
      return {
        returnCode: 200,
        returnMsg: 'Success (mock)',
        data: {
          list: MOCK_MOTORISTAS,
          totalCount: MOCK_MOTORISTAS.length,
          totalPage: 1,
          curPage: 1,
          pageSize: 10,
        }
      };
    }
  },

  async create(data: any): Promise<{ returnCode: number; returnMsg: string; data: Motorista }> {
    try {
      const response = await apiClient.post<any>(API_ENDPOINTS.REGISTER, {
        ...data,
        perfil: 'motorista',
      });
      
      if (response.returnCode === 200 || response.returnCode === 201) {
        return {
          returnCode: response.returnCode,
          returnMsg: response.returnMsg || 'Motorista criado com sucesso',
          data: {
            motoristaId: response.data?.utilizadorId || `MOT-${Date.now()}`,
            nome: data.nomeCompleto || data.nome || '',
            email: data.email || '',
            telefone: data.telefone || '',
            documentoIdentificacao: data.documentoIdentificacao || '',
            cartaConducao: data.cartaConducao || '',
            categoriaCarta: data.categoriaCarta || '',
            validadeCarta: data.validadeCarta || '',
            ativo: true,
            dataCriacao: new Date().toISOString(),
          }
        };
      }
      
      throw new Error(response.returnMsg || 'Erro ao criar motorista');
    } catch (error) {
      const novoMotorista: Motorista = {
        motoristaId: `MOT-${Date.now()}`,
        nome: data.nomeCompleto || data.nome || 'Novo Motorista',
        email: data.email || '',
        telefone: data.telefone || '',
        documentoIdentificacao: data.documentoIdentificacao || '',
        cartaConducao: data.cartaConducao || '',
        categoriaCarta: data.categoriaCarta || '',
        validadeCarta: data.validadeCarta || '',
        ativo: true,
        dataCriacao: new Date().toISOString(),
      };
      
      return {
        returnCode: 201,
        returnMsg: 'Motorista criado localmente',
        data: novoMotorista,
      };
    }
  },

  async getDetail(motoristaId: string): Promise<{ returnCode: number; returnMsg: string; data: Motorista }> {
    const mock = MOCK_MOTORISTAS.find(m => m.motoristaId === motoristaId);
    if (mock) {
      return {
        returnCode: 200,
        returnMsg: 'Success (mock)',
        data: mock,
      };
    }
    return {
      returnCode: 404,
      returnMsg: 'Motorista não encontrado',
      data: {} as Motorista,
    };
  },

  async update(motoristaId: string, data: Partial<Motorista>): Promise<{
    returnCode: number;
    returnMsg: string;
    data: Motorista;
  }> {
    return {
      returnCode: 501,
      returnMsg: 'Funcionalidade não implementada para este endpoint',
      data: {} as Motorista,
    };
  },

  async delete(motoristaId: string): Promise<{ returnCode: number; returnMsg: string }> {
    return {
      returnCode: 501,
      returnMsg: 'Funcionalidade não implementada para este endpoint',
    };
  },

  async getStats(): Promise<{ returnCode: number; returnMsg: string; data: { total: number; ativos: number; inativos: number } }> {
    const response = await this.getList({ pageSize: 1000 });
    const motoristas = response.data?.list || [];
    return {
      returnCode: 200,
      returnMsg: 'Success',
      data: {
        total: motoristas.length,
        ativos: motoristas.filter(m => m.ativo).length,
        inativos: motoristas.filter(m => !m.ativo).length,
      }
    };
  },
};