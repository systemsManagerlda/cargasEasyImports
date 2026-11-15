/* eslint-disable @typescript-eslint/no-explicit-any */

import { apiClient } from "./client";

export interface Cliente {
  _id?: string;
  clienteId: string;
  utilizadorId?: string;
  nome: string;
  email: string;
  telefone: string;
  telefoneAlternativo?: string;
  nif: string;
  endereco: string;
  cidade: string;
  provincia: string;
  pais: string;
  ativo: boolean;
  estadoConta?: string;
  observacoes?: string;
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

export interface ClienteListResponse {
  returnCode: number;
  returnMsg: string;
  data: {
    list: Cliente[];
    totalCount: number;
    totalPage: number;
    curPage: number;
    pageSize: number;
  };
}

// Normalizar respostas da API
const getBody = (response: any) => {
  return response?.data?.returnCode !== undefined
    ? response.data
    : response;
};

// Normalizar dados provenientes do UtilizadorSchema
const normalizarCliente = (item: any): Cliente => {
  const endereco = item.endereco || {};

  const documentoNif = item.documentosIdentificacao?.find(
    (doc: any) => doc.tipo === "nif"
  );

  return {
    _id: item._id,
    clienteId: item.clienteId || item.utilizadorId || "",
    utilizadorId: item.utilizadorId || "",
    nome: item.nome || item.nomeCompleto || "",
    email: item.email || "",
    telefone: item.telefone || "",
    telefoneAlternativo: item.telefoneAlternativo || "",
    nif: item.nif || documentoNif?.numero || "",
    endereco:
      typeof endereco === "object"
        ? endereco.rua || ""
        : endereco,
    cidade:
      typeof endereco === "object"
        ? endereco.cidade || ""
        : item.cidade || "",
    provincia:
      typeof endereco === "object"
        ? endereco.provincia || ""
        : item.provincia || "",
    pais:
      typeof endereco === "object"
        ? endereco.pais || "Moçambique"
        : item.pais || "Moçambique",
    ativo: Boolean(item.ativo),
    estadoConta: item.estadoConta || "",
    observacoes: item.observacoes || "",
    dataCriacao: item.dataCriacao || item.createdAt || "",
  };
};

export const clienteApi = {
  // ============================================================
  // LISTAR CLIENTES DA BASE DE DADOS
  // ============================================================

  async getList(
    params: ClienteListParams = {}
  ): Promise<ClienteListResponse> {
    const response = await apiClient.post<any>(
      "/getClienteListA",
      {
        curPage: params.curPage || 1,
        pageSize: params.pageSize || 10,
        search: params.search || "",
        ativo: params.ativo,
        cidade: params.cidade || "",
        provincia: params.provincia || "",
        orderBy: params.orderBy || "dataCriacao",
        orderDirection: params.orderDirection ?? -1,
      }
    );

    const body = getBody(response);

    if (
      body?.returnCode !== undefined &&
      body.returnCode !== 200
    ) {
      throw new Error(
        body.returnMsg || "Erro ao carregar clientes."
      );
    }

    if (body?.sucesso === false) {
      throw new Error(
        body.mensagem || "Erro ao carregar clientes."
      );
    }

    const dados = body?.data || {};

    const lista = Array.isArray(dados)
      ? dados
      : dados.list || [];

    return {
      returnCode: 200,
      returnMsg: body.returnMsg || body.mensagem || "Sucesso",
      data: {
        list: lista.map(normalizarCliente),
        totalCount: Number(dados.totalCount ?? lista.length),
        totalPage: Number(dados.totalPage ?? 1),
        curPage: Number(dados.curPage ?? params.curPage ?? 1),
        pageSize: Number(dados.pageSize ?? params.pageSize ?? 10),
      },
    };
  },

  // ============================================================
  // CONSULTAR DETALHES DO CLIENTE
  // ============================================================

  async getDetail(
    clienteId: string
  ): Promise<{
    returnCode: number;
    returnMsg: string;
    data: Cliente;
  }> {
    const response = await apiClient.post<any>(
      "/getClienteDetailA",
      { clienteId }
    );

    const body = getBody(response);

    if (
      body?.returnCode !== undefined &&
      body.returnCode !== 200
    ) {
      throw new Error(
        body.returnMsg || "Cliente não encontrado."
      );
    }

    if (body?.sucesso === false) {
      throw new Error(
        body.mensagem || "Cliente não encontrado."
      );
    }

    const cliente = body?.data || body?.cliente;

    if (!cliente) {
      throw new Error("Cliente não encontrado.");
    }

    return {
      returnCode: 200,
      returnMsg: "Cliente encontrado.",
      data: normalizarCliente(cliente),
    };
  },

  // ============================================================
  // CRIAR CLIENTE
  // ============================================================

  async create(data: any): Promise<{
    returnCode: number;
    returnMsg: string;
    data: Cliente;
  }> {
    const response = await apiClient.post<any>(
      "/register",
      {
        ...data,
        perfil: "cliente",
      }
    );

    const body = getBody(response);

    if (
      body?.returnCode !== 200 &&
      body?.returnCode !== 201
    ) {
      throw new Error(
        body?.returnMsg ||
        body?.mensagem ||
        "Erro ao criar cliente."
      );
    }

    return {
      returnCode: body.returnCode,
      returnMsg: body.returnMsg || body.mensagem || "Cliente criado com sucesso.",
      data: normalizarCliente(body.data || body.utilizador || {}),
    };
  },

  // ============================================================
  // ACTUALIZAR CLIENTE
  // ============================================================

  async update(
    clienteId: string,
    data: Partial<Cliente>
  ): Promise<{
    returnCode: number;
    returnMsg: string;
    data: Cliente;
  }> {
    const response = await apiClient.post<any>(
      "/updateClienteA",
      {
        ...data,
        clienteId,
      }
    );

    const body = getBody(response);

    if (
      body?.returnCode !== undefined &&
      body.returnCode !== 200
    ) {
      throw new Error(
        body.returnMsg || "Erro ao actualizar cliente."
      );
    }

    if (body?.sucesso === false) {
      throw new Error(
        body.mensagem || "Erro ao actualizar cliente."
      );
    }

    const cliente = body?.data || body?.cliente;

    return {
      returnCode: 200,
      returnMsg:
        body.returnMsg ||
        body.mensagem ||
        "Cliente actualizado com sucesso.",
      data: cliente
        ? normalizarCliente(cliente)
        : ({} as Cliente),
    };
  },

  // ============================================================
  // ESTATÍSTICAS
  // ============================================================

  async getStats(): Promise<{
    returnCode: number;
    returnMsg: string;
    data: {
      total: number;
      ativos: number;
      inativos: number;
    };
  }> {
    const response = await this.getList({
      curPage: 1,
      pageSize: 1000,
    });

    const clientes = response.data.list;

    return {
      returnCode: 200,
      returnMsg: "Sucesso",
      data: {
        total: response.data.totalCount,
        ativos: clientes.filter(
          (c) => c.ativo && c.estadoConta === "ativo"
        ).length,
        inativos: clientes.filter(
          (c) => !c.ativo || c.estadoConta !== "ativo"
        ).length,
      },
    };
  },
};
