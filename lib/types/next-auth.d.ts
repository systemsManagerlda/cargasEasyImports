import type { DefaultJWT } from 'next-auth/jwt';

export interface AppUser {
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

declare module 'next-auth' {
  interface Session {
    user: AppUser;
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    user?: AppUser;
    accessToken?: string;
  }
}