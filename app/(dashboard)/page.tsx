'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/hooks/useAuth';
import { LoadingScreen } from '../../components/common/LoadingScreen';

export default function DashboardRootPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (isAuthenticated) {
      router.replace(user?.perfil === 'motorista' ? '/motorista' : user?.perfil === 'cliente' ? '/cliente' : '/dashboard');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router, user?.perfil]);

  if (loading) {
    return <LoadingScreen />;
  }

  return null;
}