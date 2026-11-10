'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { Card, CardBody, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { CargaForm } from '@/components/cargas/CargaForm';
import { ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NovaCargaPage() {
  return (
    <ProtectedRoute requiredPermissions={['criarCarga']}>
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/cargas">
            <Button className='text-gray-800' variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gray-100 rounded-full hidden sm:flex">
              <Package className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Nova Carga</h1>
              <p className="text-sm text-gray-500 hidden sm:block">
                Preencha os dados para criar uma nova carga
              </p>
            </div>
          </div>
        </div>

        <Card className="border border-gray-100 shadow-sm text-gray-800">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-gray-950">Formulário de Carga</CardTitle>
            <CardDescription>
              Todos os campos marcados com * são obrigatórios
            </CardDescription>
          </CardHeader>
          <CardBody className="p-4 md:p-6">
            <CargaForm />
          </CardBody>
        </Card>
      </div>
    </ProtectedRoute>
  );
}