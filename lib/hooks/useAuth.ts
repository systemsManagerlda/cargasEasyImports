// lib/hooks/useAuth.ts
'use client'

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';

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

interface LoginResult {
  success: boolean;
  error?: string;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const user = session?.user as AppUser | undefined;

  const login = useCallback(
    async (username: string, password: string): Promise<LoginResult> => {
      console.log('🔐 login - iniciando');
      setIsLoading(true);

      try {
        const result = await signIn('credentials', {
          username,
          password,
          redirect: false,
        });

        console.log('🔐 login - resultado:', result);

        if (!result || result.error) {
          return {
            success: false,
            error: result?.error || 'Credenciais inválidas',
          };
        }

        console.log('✅ login - autenticação concluída');
        router.replace('/dashboard');

        return { success: true };
      } catch (error: unknown) {
        console.error('❌ login - erro:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Erro ao fazer login',
        };
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(async (): Promise<void> => {
    console.log('🔐 logout - iniciando');
    setIsLoading(true);

    try {
      await signOut({ redirect: false });
      router.replace('/login');
      console.log('✅ logout - sucesso');
    } catch (error) {
      console.error('❌ logout - erro:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return {
    user,
    session,
    status,
    loading: status === 'loading' || isLoading,
    login,
    logout,
    isAuthenticated: status === 'authenticated',
  };
}