/* eslint-disable @typescript-eslint/no-explicit-any */

import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  AxiosRequestConfig,
} from "axios";

import { getSession, signOut } from "next-auth/react";

/* ============================================================
   TIPOS
   ============================================================ */

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

/* ============================================================
   API CLIENT
   ============================================================ */

class ApiClient {
  private client: AxiosInstance;

  private static instance: ApiClient;

  private constructor() {
    const baseURL =
      process.env.NEXT_PUBLIC_API_URL ||
      "https://desktop-api-4f850b3f9733.herokuapp.com";

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    this.setupInterceptors();
  }

  /* ==========================================================
     SINGLETON
     ========================================================== */

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }

    return ApiClient.instance;
  }

  /* ==========================================================
     OBTER TOKEN
     ========================================================== */

  private async getAccessToken(): Promise<string | null> {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      // 1. Tentar obter o token da sessão NextAuth
      const session = await getSession();

      const sessionToken = (session as any)?.accessToken;

      if (sessionToken) {
        return sessionToken;
      }

      // 2. Alternativa: token guardado localmente
      const storedToken = localStorage.getItem("auth_token");

      if (storedToken) {
        return storedToken;
      }

      return null;
    } catch (error) {
      console.error(
        "Erro ao obter token de autenticação:",
        error
      );

      // Fallback para localStorage
      return localStorage.getItem("auth_token");
    }
  }

  /* ==========================================================
     INTERCEPTORS
     ========================================================== */

  private setupInterceptors(): void {
    /* ========================================================
       REQUEST INTERCEPTOR
       ======================================================== */

    this.client.interceptors.request.use(
      async (config) => {
        try {
          const isBrowser =
            typeof window !== "undefined";

          if (!isBrowser) {
            return config;
          }

          const accessToken =
            await this.getAccessToken();

          if (accessToken) {
            config.headers = AxiosHeaders.from(
              config.headers
            );

            config.headers.set(
              "Authorization",
              `Bearer ${accessToken}`
            );
          }

          return config;
        } catch (error) {
          console.error(
            "Erro no request interceptor:",
            error
          );

          return Promise.reject(error);
        }
      },

      (error) => {
        return Promise.reject(error);
      }
    );

    /* ========================================================
       RESPONSE INTERCEPTOR
       ======================================================== */

    this.client.interceptors.response.use(
      (response) => {
        return response;
      },

      async (error: AxiosError<ApiError>) => {
        const status = error.response?.status;
        const url = error.config?.url;

        console.error("Erro na API:", {
          status,
          url,
          message: error.message,
          data: error.response?.data,
        });

        /* ====================================================
           401 - NÃO AUTENTICADO
           ==================================================== */

        if (
          status === 401 &&
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/login")
        ) {
          console.warn(
            "A API rejeitou a autenticação. A sessão será mantida para investigação."
          );

          // Não executar signOut automaticamente.
          // Primeiro devemos confirmar a origem do erro 401.
        }

        return Promise.reject(error);
      }
    );
  }

  /* ==========================================================
     GET
     ========================================================== */

  public async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response =
      await this.client.get<ApiResponse<T>>(
        url,
        config
      );

    return response.data;
  }

  /* ==========================================================
     POST
     ========================================================== */

  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response =
      await this.client.post<ApiResponse<T>>(
        url,
        data,
        config
      );

    return response.data;
  }

  /* ==========================================================
     PUT
     ========================================================== */

  public async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response =
      await this.client.put<ApiResponse<T>>(
        url,
        data,
        config
      );

    return response.data;
  }

  /* ==========================================================
     PATCH
     ========================================================== */

  public async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response =
      await this.client.patch<ApiResponse<T>>(
        url,
        data,
        config
      );

    return response.data;
  }

  /* ==========================================================
     DELETE
     ========================================================== */

  public async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response =
      await this.client.delete<ApiResponse<T>>(
        url,
        config
      );

    return response.data;
  }

  /* ==========================================================
     COMPATIBILIDADE COM CÓDIGO EXISTENTE
     ========================================================== */

  public setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
  }

  public setUser(user: any): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );
    }
  }

  public getUser(): any {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const user = localStorage.getItem("user");

      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  public isAuthenticated(): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    return Boolean(
      localStorage.getItem("auth_token")
    );
  }

  public logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");

      signOut({
        callbackUrl: "/login",
      });
    }
  }
}

/* ============================================================
   EXPORT
   ============================================================ */

export const apiClient = ApiClient.getInstance();