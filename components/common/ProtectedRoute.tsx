'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/hooks/useAuth';
import { LoadingScreen } from './LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
}) => {
  const router = useRouter();

  const {
    isAuthenticated,
    loading,
    user,
  } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    router.replace('/login');
    return <LoadingScreen />;
  }

  if (requiredPermissions.length > 0) {
    if (!user) {
      return <LoadingScreen />;
    }

    const isAdministrator =
      user.perfil === 'administrador_principal';

    const hasAllPermissions =
      isAdministrator ||
      requiredPermissions.every(
        (permission) =>
          user.permissoes?.[permission] === true
      );

    if (!hasAllPermissions) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              Acesso Negado
            </h2>

            <p className="text-gray-500 mt-2">
              Você não tem permissão para acessar esta página.
            </p>

            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};