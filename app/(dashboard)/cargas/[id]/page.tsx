// app/(dashboard)/cargas/[id]/page.tsx
'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { CargaDetail } from '@/components/cargas/CargaDetail';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useCarga } from '@/lib/hooks/useCarga2';

export default function CargaDetailPage() {
  const params = useParams();
  const cargaId = params.id as string;
  
  console.log('📄 CargaDetailPage - cargaId:', cargaId);
  
  const { carga, loading, error, refetch } = useCarga(cargaId);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-gray-950">
        <Alert variant="danger">
          {error}
          <Button variant="outline" size="sm" onClick={refetch} className="ml-4">
            Tentar novamente
          </Button>
        </Alert>
        <Link href="/cargas">
          <Button variant="primary" className="mt-4">
            Voltar para lista
          </Button>
        </Link>
      </div>
    );
  }

  if (!carga) {
    return (
      <div className="container mx-auto px-4 py-8 text-gray-950">
        <Alert variant="warning">
          Carga não encontrada
        </Alert>
        <Link href="/cargas">
          <Button variant="primary" className="mt-4">
            Voltar para lista
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 text-gray-950">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/cargas">
            <Button className='text-gray-950' variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{carga.descricao}</h1>
            <p className="text-gray-500">Código: {carga.codigoRastreio}</p>
          </div>
        </div>

        <CargaDetail carga={carga} onRefresh={refetch} />
      </div>
    </ProtectedRoute>
  );
}