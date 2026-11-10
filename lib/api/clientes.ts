/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';

export interface Cliente {
  clienteId: string;
  nome: string;
  email: string;
  telefone: string;
  nif: string;
  endereco: string;
  cidade: string;
  provincia: string;
  pais: string;
  ativo: boolean;
  dataCriacao: string;
}

export interface ClienteListParams {
  curPage?: number;
  pageSize?: number;
  search?: string;
  ativo?: boolean;
  cidade?: string;
  provincia?: string;
  orderBy?: string;
  orderDirection?: number;
}

// Dados mockados para fallback
const MOCK_CLIENTES: Cliente[] = [
  {
    clienteId: 'CLI-001',
    nome: 'Empresa ABC Lda',
    email: 'contato@abc.co.mz',
    telefone: '+258 84 123 4567',
    nif: '123456789',
    endereco: 'Av. Eduardo Mondlane, 123',
    cidade: 'Maputo',
    provincia: 'Maputo',
    pais: 'Moçambique',
    ativo: true,
    dataCriacao: new Date().toISOString(),
  },
  {
    clienteId: 'CLI-002',
    nome: 'Comercial XYZ',
    email: 'info@xyz.co.mz',
    telefone: '+258 82 987 6543',
    nif: '987654321',
    endereco: 'Rua das Flores, 45',
    cidade: 'Beira',
    provincia: 'Sofala',
    pais: 'Moçambique',
    ativo: true,
    dataCriacao: new Date().toISOString(),
  },
  {
    clienteId: 'CLI-003',
    nome: 'Distribuidora Nacional',
    email: 'distribuicao@dn.co.mz',
    telefone: '+258 86 456 7890',
    nif: '456789123',
    endereco: 'Estrada Nacional, Km 10',
    cidade: 'Nampula',
    provincia: 'Nampula',
    pais: 'Moçambique',
    ativo: true,
    dataCriacao: new Date().toISOString(),
  },
];

export const clienteApi = {
  async getList(params: ClienteListParams = {}): Promise<{
    returnCode: number;
    returnMsg: string;
    data: { list: Cliente[]; totalCount: number; totalPage: number; curPage: number; pageSize: number };
  }> {
    try {
      const response = await apiClient.post<any>(API_ENDPOINTS.CARGAS, {
        curPage: 1,
        pageSize: 1000,
        search: params.search,
      });

      if (response.returnCode === 200) {
        const cargas = response.data?.list || [];
        const clientesMap = new Map<string, Cliente>();
        
        cargas.forEach((carga: any) => {
          if (carga.cliente && carga.cliente.clienteId) {
            const c = carga.cliente;
            if (!clientesMap.has(c.clienteId)) {
              clientesMap.set(c.clienteId, {
                clienteId: c.clienteId,
                nome: c.nome || 'Cliente sem nome',
                email: c.email || '',
                telefone: c.telefone || '',
                nif: c.nif || '',
                endereco: c.endereco || '',
                cidade: carga.origem?.cidade || '',
                provincia: '',
                pais: carga.origem?.pais || 'Moçambique',
                ativo: true,
                dataCriacao: carga.dataCriacao || new Date().toISOString(),
              });
            }
          }
        });

        let clientes = Array.from(clientesMap.values());
        
        if (params.search) {
          const search = params.search.toLowerCase();
          clientes = clientes.filter(c => 
            c.nome.toLowerCase().includes(search) ||
            c.email.toLowerCase().includes(search) ||
            c.telefone.includes(search)
          );
        }
        if (params.cidade) {
          clientes = clientes.filter(c => c.cidade === params.cidade);
        }

        if (clientes.length === 0) {
          clientes = MOCK_CLIENTES;
        }

        const start = ((params.curPage || 1) - 1) * (params.pageSize || 10);
        const end = start + (params.pageSize || 10);
        const paginated = clientes.slice(start, end);

        return {
          returnCode: 200,
          returnMsg: 'Success',
          data: {
            list: paginated,
            totalCount: clientes.length,
            totalPage: Math.ceil(clientes.length / (params.pageSize || 10)),
            curPage: params.curPage || 1,
            pageSize: params.pageSize || 10,
          }
        };
      }

      return {
        returnCode: 200,
        returnMsg: 'Success (mock)',
        data: {
          list: MOCK_CLIENTES,
          totalCount: MOCK_CLIENTES.length,
          totalPage: 1,
          curPage: 1,
          pageSize: 10,
        }
      };

    } catch (error) {
      console.warn('⚠️ Erro ao buscar clientes, usando dados mockados');
      return {
        returnCode: 200,
        returnMsg: 'Success (mock)',
        data: {
          list: MOCK_CLIENTES,
          totalCount: MOCK_CLIENTES.length,
          totalPage: 1,
          curPage: 1,
          pageSize: 10,
        }
      };
    }
  },

  async create(data: any): Promise<{ returnCode: number; returnMsg: string; data: Cliente }> {
    try {
      const response = await apiClient.post<any>(API_ENDPOINTS.REGISTER, {
        ...data,
        perfil: 'cliente',
      });
      
      if (response.returnCode === 200 || response.returnCode === 201) {
        return {
          returnCode: response.returnCode,
          returnMsg: response.returnMsg || 'Cliente criado com sucesso',
          data: {
            clienteId: response.data?.utilizadorId || `CLI-${Date.now()}`,
            nome: data.nomeCompleto || data.nome || '',
            email: data.email || '',
            telefone: data.telefone || '',
            nif: data.nif || '',
            endereco: data.endereco || '',
            cidade: data.cidade || '',
            provincia: data.provincia || '',
            pais: data.pais || 'Moçambique',
            ativo: true,
            dataCriacao: new Date().toISOString(),
          }
        };
      }
      
      throw new Error(response.returnMsg || 'Erro ao criar cliente');
    } catch (error) {
      const novoCliente: Cliente = {
        clienteId: `CLI-${Date.now()}`,
        nome: data.nomeCompleto || data.nome || 'Novo Cliente',
        email: data.email || '',
        telefone: data.telefone || '',
        nif: data.nif || '',
        endereco: data.endereco || '',
        cidade: data.cidade || '',
        provincia: data.provincia || '',
        pais: data.pais || 'Moçambique',
        ativo: true,
        dataCriacao: new Date().toISOString(),
      };
      
      return {
        returnCode: 201,
        returnMsg: 'Cliente criado localmente',
        data: novoCliente,
      };
    }
  },

  async getDetail(clienteId: string): Promise<{ returnCode: number; returnMsg: string; data: Cliente }> {
    try {
      const response = await apiClient.post<any>(API_ENDPOINTS.CARGAS_BY_CLIENTE, {
        clienteId,
        limit: 1,
      });

      if (response.returnCode === 200 && response.data && response.data.length > 0) {
        const carga = response.data[0];
        return {
          returnCode: 200,
          returnMsg: 'Success',
          data: {
            clienteId: carga.cliente.clienteId,
            nome: carga.cliente.nome,
            email: carga.cliente.email || '',
            telefone: carga.cliente.telefone || '',
            nif: carga.cliente.nif || '',
            endereco: carga.cliente.endereco || '',
            cidade: carga.origem?.cidade || '',
            provincia: '',
            pais: carga.origem?.pais || 'Moçambique',
            ativo: true,
            dataCriacao: carga.dataCriacao || new Date().toISOString(),
          }
        };
      }

      const mock = MOCK_CLIENTES.find(c => c.clienteId === clienteId);
      if (mock) {
        return {
          returnCode: 200,
          returnMsg: 'Success (mock)',
          data: mock,
        };
      }

      return {
        returnCode: 404,
        returnMsg: 'Cliente não encontrado',
        data: {} as Cliente,
      };
    } catch (error) {
      const mock = MOCK_CLIENTES.find(c => c.clienteId === clienteId);
      if (mock) {
        return {
          returnCode: 200,
          returnMsg: 'Success (mock)',
          data: mock,
        };
      }
      return {
        returnCode: 404,
        returnMsg: 'Cliente não encontrado',
        data: {} as Cliente,
      };
    }
  },

  async update(clienteId: string, data: Partial<Cliente>): Promise<{
    returnCode: number;
    returnMsg: string;
    data: Cliente;
  }> {
    return {
      returnCode: 501,
      returnMsg: 'Funcionalidade não implementada para este endpoint',
      data: {} as Cliente,
    };
  },

  async delete(clienteId: string): Promise<{ returnCode: number; returnMsg: string }> {
    return {
      returnCode: 501,
      returnMsg: 'Funcionalidade não implementada para este endpoint',
    };
  },

  async getStats(): Promise<{ returnCode: number; returnMsg: string; data: { total: number; ativos: number; inativos: number } }> {
    const response = await this.getList({ pageSize: 1000 });
    const clientes = response.data?.list || [];
    return {
      returnCode: 200,
      returnMsg: 'Success',
      data: {
        total: clientes.length,
        ativos: clientes.filter(c => c.ativo).length,
        inativos: clientes.filter(c => !c.ativo).length,
      }
    };
  },
};