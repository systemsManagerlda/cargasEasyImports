'use client';

import React from 'react';
import { Spinner } from '../ui/Spinner';
import { Package } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-blue-100 rounded-full animate-pulse">
            <Package className="w-12 h-12 text-blue-600" />
          </div>
        </div>
        <Spinner size="lg" />
        <p className="mt-4 text-gray-500">Carregando...</p>
      </div>
    </div>
  );
};