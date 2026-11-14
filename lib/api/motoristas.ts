/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from './client';
import { API_ENDPOINTS } from './endpoints';

export interface Motorista {
  /** _id original do documento Utilizador no MongoDB. */
  _id: string;
  /** Alias de compatibilidade: contém sempre o mesmo valor de _id. */
  motoristaId: string;
  utilizadorId: string;
  nome: string;
  nomeCompleto: string;
  nomeUtilizador?: string;
  email: string;
  telefone: string;
  telefoneAlternativo?: string;
  documentoIdentificacao?: string;
  documentosIdentificacao?: Array<{
    tipo: string;
    numero: string;
    dataEmissao?: string;
    dataValidade?: string;
    urlDocumento?: string;
  }>;
  cartaConducao?: string;
  categoriaCarta?: string;
  validadeCarta?: string;
  endereco?: {
    rua?: string;
    cidade?: string;
    provincia?: string;
    pais?: string;
    codigoPostal?: string;
  };
  estadoConta: string;
  ativo: boolean;
  observacoes?: string;
  tags?: string[];
  dataCriacao: string;
}

export interface MotoristaListParams {
  curPage?: number;
  pageSize?: number;
  search?: string;
  ativo?: boolean;
}

export interface MotoristaUpdateData {
  nomeCompleto?: string;
  email?: string;
  telefone?: string;
  telefoneAlternativo?: string;
  endereco?: Motorista['endereco'];
  documentosIdentificacao?: Motorista['documentosIdentificacao'];
  estadoConta?: string;
  ativo?: boolean;
  observacoes?: string;
  tags?: string[];
}

interface MotoristaApiResponse<T> {
  returnCode: number;
  returnMsg: string;
  data: T;
}

interface MotoristaListData {
  list: any[];
  totalCount: number;
  totalPage: number;
  curPage: number;
  pageSize: number;
}

const normalizarMotorista = (m: any): Motorista => {
  if (!m?._id) {
    throw new Error(
      'A API devolveu um motorista sem o _id original do MongoDB. Confirme respostaGestao().'
    );
  }

  const mongoId = String(m._id);
  const nome = m.nomeCompleto || m.nomeUtilizador || m.nome || 'Motorista sem nome';

  return {
    _id: mongoId,
    motoristaId: mongoId,
    utilizadorId: String(m.utilizadorId || ''),
    nome,
    nomeCompleto: nome,
    nomeUtilizador: m.nomeUtilizador || '',
    email: m.email || '',
    telefone: m.telefone || '',
    telefoneAlternativo: m.telefoneAlternativo || '',
    documentoIdentificacao: m.documentoIdentificacao || '',
    documentosIdentificacao: Array.isArray(m.documentosIdentificacao)
      ? m.documentosIdentificacao
      : [],
    cartaConducao: m.cartaConducao || '',
    categoriaCarta: m.categoriaCarta || '',
    validadeCarta: m.validadeCarta || '',
    endereco: m.endereco || {},
    estadoConta: m.estadoConta || (m.ativo === false ? 'inativo' : 'ativo'),
    ativo: m.ativo !== false,
    observacoes: m.observacoes || '',
    tags: Array.isArray(m.tags) ? m.tags : [],
    dataCriacao: m.dataCriacao || m.createdAt || '',
  };
};

function normalizarErro(error: any, fallback: string): Error {
  return new Error(
    error?.response?.data?.returnMsg ||
    error?.message ||
    fallback
  );
}

export const motoristaApi = {
  async getList(params: MotoristaListParams = {}): Promise<MotoristaApiResponse<MotoristaListData & { list: Motorista[] }>> {
    try {
      const curPage = Math.max(1, params.curPage || 1);
      // O backend limita pageSize a 100.
      const pageSize = Math.min(100, Math.max(1, params.pageSize || 10));

      const response = await apiClient.post<MotoristaListData>(
        '/getMotoristaListA',
        {
          curPage,
          pageSize,
          search: params.search || '',
          ...(params.ativo === undefined ? {} : { ativo: params.ativo }),
        }
      );

      if (response.returnCode !== 200) {
        throw new Error(response.returnMsg || 'Erro ao carregar motoristas.');
      }

      return {
        returnCode: response.returnCode,
        returnMsg: response.returnMsg || 'Motoristas carregados com sucesso.',
        data: {
          list: (response.data?.list || []).map(normalizarMotorista),
          totalCount: response.data?.totalCount || 0,
          totalPage: response.data?.totalPage || 0,
          curPage: response.data?.curPage || curPage,
          pageSize: response.data?.pageSize || pageSize,
        },
      };
    } catch (error: any) {
      console.error('Erro ao buscar motoristas:', error);
      throw normalizarErro(error, 'Não foi possível carregar os motoristas.');
    }
  },

  /** Percorre todas as páginas respeitando o limite de 100 registos do backend. */
  async getAll(params: Omit<MotoristaListParams, 'curPage' | 'pageSize'> = {}): Promise<Motorista[]> {
    const pageSize = 100;
    const primeira = await this.getList({ ...params, curPage: 1, pageSize });
    const lista = [...primeira.data.list];

    for (let page = 2; page <= primeira.data.totalPage; page += 1) {
      const resposta = await this.getList({ ...params, curPage: page, pageSize });
      lista.push(...resposta.data.list);
    }

    return lista;
  },

  /** Cria a conta através da rota de registo e recupera o _id pela rota de detalhe. */
  async create(data: Record<string, unknown>): Promise<MotoristaApiResponse<Motorista>> {
    try {
      const response = await apiClient.post<any>(API_ENDPOINTS.REGISTER, {
        ...data,
        perfil: 'motorista',
      });

      if (response.returnCode !== 200 && response.returnCode !== 201) {
        throw new Error(response.returnMsg || 'Erro ao criar motorista.');
      }

      const utilizadorId = response.data?.utilizadorId;
      if (!utilizadorId) {
        throw new Error(
          'A conta foi registada, mas a resposta não contém utilizadorId para consultar o motorista.'
        );
      }

      const detalhe = await apiClient.post<any>('/getMotoristaDetailA', { utilizadorId });
      if (detalhe.returnCode !== 200 || !detalhe.data) {
        throw new Error(detalhe.returnMsg || 'Motorista registado, mas não foi possível recuperar os seus dados.');
      }

      return {
        returnCode: response.returnCode,
        returnMsg: response.returnMsg || 'Motorista criado com sucesso.',
        data: normalizarMotorista(detalhe.data),
      };
    } catch (error: any) {
      throw normalizarErro(error, 'Não foi possível criar o motorista.');
    }
  },

  /** Consulta pelo _id do documento MongoDB. */
  async getDetail(mongoId: string): Promise<MotoristaApiResponse<Motorista>> {
    if (!mongoId) throw new Error('ID MongoDB do motorista não informado.');

    try {
      const response = await apiClient.post<Motorista>('/getMotoristaDetailA', {
        motoristaId: mongoId,
      });

      if (response.returnCode !== 200 || !response.data) {
        throw new Error(response.returnMsg || 'Motorista não encontrado.');
      }

      return {
        returnCode: response.returnCode,
        returnMsg: response.returnMsg || 'Motorista encontrado.',
        data: normalizarMotorista(response.data),
      };
    } catch (error: any) {
      throw normalizarErro(error, 'Não foi possível consultar o motorista.');
    }
  },

  /** Actualiza somente os campos permitidos pelo endpoint do backend. */
  async update(
    mongoId: string,
    data: MotoristaUpdateData
  ): Promise<MotoristaApiResponse<Motorista>> {
    if (!mongoId) throw new Error('ID MongoDB do motorista não informado.');

    try {
      const response = await apiClient.post<Motorista>('/updateMotoristaA', {
        motoristaId: mongoId,
        ...data,
      });

      if (response.returnCode !== 200 || !response.data) {
        throw new Error(response.returnMsg || 'Erro ao actualizar motorista.');
      }

      return {
        returnCode: response.returnCode,
        returnMsg: response.returnMsg || 'Motorista actualizado.',
        data: normalizarMotorista(response.data),
      };
    } catch (error: any) {
      throw normalizarErro(error, 'Não foi possível actualizar o motorista.');
    }
  },

  /** O backend partilhado ainda não disponibiliza uma rota de eliminação. */
  async delete(_mongoId: string): Promise<never> {
    throw new Error(
      'A eliminação de motoristas não está disponível: não foi fornecida uma rota deleteMotoristaA no backend.'
    );
  },

  async getStats(): Promise<MotoristaApiResponse<{
    total: number;
    ativos: number;
    inativos: number;
  }>> {
    const motoristas = await this.getAll();

    return {
      returnCode: 200,
      returnMsg: 'Estatísticas carregadas com sucesso.',
      data: {
        total: motoristas.length,
        ativos: motoristas.filter((m) => m.ativo && m.estadoConta === 'ativo').length,
        inativos: motoristas.filter((m) => !m.ativo || m.estadoConta !== 'ativo').length,
      },
    };
  },
};
