import NextAuth, {
  type NextAuthOptions,
  type DefaultSession,
  type DefaultUser,
} from "next-auth";

import CredentialsProvider from "next-auth/providers/credentials";

import { apiClient } from "../../../../lib/api/client";
import { API_ENDPOINTS } from "../../../../lib/api/endpoints";

/* ============================================================
   TIPOS
   ============================================================ */

interface AppUser {
  id: string;
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

  token?: string;
}

interface LoginResponseData {
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

/* ============================================================
   EXTENSÃO NEXTAUTH - SESSION
   ============================================================ */

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
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

    token?: string;
  }

  interface Session {
    user: User;

    /**
     * Token devolvido pela API
     */
    accessToken?: string;
  }
}

/* ============================================================
   EXTENSÃO NEXTAUTH - JWT
   ============================================================ */

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;

    user?: {
      id: string;
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
}

/* ============================================================
   AUTH OPTIONS
   ============================================================ */

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",

      credentials: {
        username: {
          label: "Usuário ou Email",
          type: "text",
        },

        password: {
          label: "Senha",
          type: "password",
        },
      },

      async authorize(credentials) {
  console.log("======================================");
  console.log("🔐 NEXTAUTH AUTHORIZE");
  console.log("======================================");

  if (!credentials?.username || !credentials?.password) {
    throw new Error(
      "Usuário/Email e senha são obrigatórios"
    );
  }

  try {
    console.log(
      "👤 Utilizador:",
      credentials.username
    );

    const response =
      await apiClient.post<LoginResponseData>(
        API_ENDPOINTS.LOGIN,
        {
          nomeUtilizador: credentials.username,
          palavraPasse: credentials.password,
        }
      );

    console.log(
      "🔐 returnCode:",
      response.returnCode
    );

    console.log(
      "🔐 returnMsg:",
      response.returnMsg
    );

    if (response.returnCode !== 200) {
      throw new Error(
        response.returnMsg ||
          "Credenciais inválidas"
      );
    }

    /*
     * IMPORTANTE:
     *
     * O apiClient retorna:
     *
     * {
     *   returnCode,
     *   returnMsg,
     *   data: {
     *     token,
     *     user
     *   }
     * }
     */

    if (!response.data) {
      throw new Error(
        "A API não devolveu os dados do login."
      );
    }

    const { token, user } = response.data;

    if (!token) {
      throw new Error(
        "A API não devolveu o token de autenticação."
      );
    }

    if (!user) {
      throw new Error(
        "A API não devolveu os dados do utilizador."
      );
    }

    if (user.perfil === "motorista" && !user._id) {
      throw new Error(
        "A API não devolveu o _id MongoDB do motorista. Confirme a resposta da rota de login."
      );
    }

    console.log(
      "✅ Login API realizado:",
      user.nomeUtilizador
    );

    console.log(
      "🔐 Token recebido:",
      `${token.substring(0, 15)}...`
    );

    console.log(
      "👤 Perfil:",
      user.perfil
    );

    console.log(
      "🟢 Estado da conta:",
      user.estadoConta
    );

    if (
      user.estadoConta !== "ativo" &&
      user.estadoConta !== "pendente_ativacao"
    ) {
      throw new Error(
        `Conta ${user.estadoConta}. Entre em contato com o suporte.`
      );
    }

    /*
     * Retornar o utilizador para o NextAuth.
     *
     * O token da API vai em `token`.
     * Depois o callback JWT irá transferi-lo para
     * `token.accessToken`.
     */

    return {
      id: user.utilizadorId,
      _id: String(user._id || ""),

      utilizadorId:
        user.utilizadorId,

      nomeUtilizador:
        user.nomeUtilizador,

      email:
        user.email,

      nomeCompleto:
        user.nomeCompleto,

      perfil:
        user.perfil,

      clienteId:
        user.clienteId,

      transportadorId:
        user.transportadorId,

      motoristaId:
        user.perfil === "motorista" ? String(user._id) : user.motoristaId,

      permissoes:
        user.permissoes,

      estadoConta:
        user.estadoConta,

      token,
    };
  } catch (error) {
    console.error(
      "❌ NEXTAUTH AUTHORIZE ERROR:",
      error
    );

    if (error instanceof Error) {
      throw new Error(error.message);
    }

    throw new Error(
      "Erro ao autenticar utilizador."
    );
  }
}
    }),
  ],

  /* ==========================================================
     CALLBACKS
     ========================================================== */

  callbacks: {
    /*
     * ----------------------------------------------------------
     * JWT
     * ----------------------------------------------------------
     */

    async jwt({ token, user }) {
      console.log("🔐 JWT callback");

      /*
       * Este bloco só é executado quando o utilizador
       * acabou de fazer login.
       */

      if (user) {
        console.log(
          "🔐 Guardando token da API no JWT..."
        );

        token.accessToken = user.token;

        token.user = {
          id: user.id,
          _id: user._id,

          utilizadorId:
            user.utilizadorId,

          nomeUtilizador:
            user.nomeUtilizador,

          email:
            user.email,

          nomeCompleto:
            user.nomeCompleto,

          perfil:
            user.perfil,

          clienteId:
            user.clienteId,

          transportadorId:
            user.transportadorId,

          motoristaId:
            user.motoristaId,

          permissoes:
            user.permissoes,

          estadoConta:
            user.estadoConta,
        };

        console.log(
          "✅ JWT accessToken:",
          token.accessToken
            ? `${token.accessToken.substring(
                0,
                15
              )}...`
            : "NÃO EXISTE"
        );
      }

      return token;
    },

    /*
     * ----------------------------------------------------------
     * SESSION
     * ----------------------------------------------------------
     */

    async session({ session, token }) {
      console.log("🔐 Session callback");

      /*
       * Restaurar utilizador
       */

      if (token.user) {
        session.user = token.user;
      }

      /*
       * Restaurar token da API
       */

      if (token.accessToken) {
        session.accessToken =
          token.accessToken;
      } else {
        session.accessToken = undefined;
      }

      console.log(
        "✅ Session possui token:",
        Boolean(session.accessToken)
      );

      if (session.accessToken) {
        console.log(
          "🔐 Session token:",
          `${session.accessToken.substring(
            0,
            15
          )}...`
        );
      }

      return session;
    },
  },

  /* ==========================================================
     SESSION
     ========================================================== */

  session: {
    strategy: "jwt",

    maxAge: 30 * 24 * 60 * 60,
  },

  /* ==========================================================
     PÁGINAS
     ========================================================== */

  pages: {
    signIn: "/login",

    error: "/login",
  },

  /* ==========================================================
     SECRET
     ========================================================== */

  secret:
    process.env.NEXTAUTH_SECRET,

  /* ==========================================================
     DEBUG
     ========================================================== */

  debug:
    process.env.NODE_ENV === "development",
};

/* ============================================================
   HANDLER
   ============================================================ */

const handler = NextAuth(authOptions);

export {
  handler as GET,
  handler as POST,
};