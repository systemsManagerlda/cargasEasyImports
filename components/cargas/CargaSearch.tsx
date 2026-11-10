/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Search, X, Filter } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

interface CargaSearchProps {
  onSearch: (filters: Record<string, any>) => void;
  initialFilters?: Record<string, any>;
  className?: string;
}

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'registada', label: 'Registada' },
  { value: 'em_preparacao', label: 'Em Preparação' },
  { value: 'pronta_para_transporte', label: 'Pronta para Transporte' },
  { value: 'em_transito', label: 'Em Trânsito' },
  { value: 'em_posto_controlo', label: 'Em Posto de Controlo' },
  { value: 'em_fronteira', label: 'Em Fronteira' },
  { value: 'em_porto', label: 'Em Porto' },
  { value: 'em_armazem', label: 'Em Armazém' },
  { value: 'em_distribuicao', label: 'Em Distribuição' },
  { value: 'entregue', label: 'Entregue' },
  { value: 'suspensa', label: 'Suspensa' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'extraviada', label: 'Extraviada' },
  { value: 'danificada', label: 'Danificada' },
];

const prioridadeOptions = [
  { value: '', label: 'Todas as prioridades' },
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];

const tipoMercadoriaOptions = [
  { value: '', label: 'Todos os tipos' },
  { value: 'alimentos', label: 'Alimentos' },
  { value: 'bebidas', label: 'Bebidas' },
  { value: 'produtos_quimicos', label: 'Produtos Químicos' },
  { value: 'produtos_perigosos', label: 'Produtos Perigosos' },
  { value: 'materiais_construcao', label: 'Materiais de Construção' },
  { value: 'eletronicos', label: 'Eletrônicos' },
  { value: 'moveis', label: 'Móveis' },
  { value: 'veiculos', label: 'Veículos' },
  { value: 'medicamentos', label: 'Medicamentos' },
  { value: 'tecidos', label: 'Tecidos' },
  { value: 'papel', label: 'Papel' },
  { value: 'plastico', label: 'Plástico' },
  { value: 'metal', label: 'Metal' },
  { value: 'madeira', label: 'Madeira' },
  { value: 'agricolas', label: 'Agrícolas' },
  { value: 'pecuaria', label: 'Pecuária' },
  { value: 'outros', label: 'Outros' },
];

export const CargaSearch: React.FC<CargaSearchProps> = ({
  onSearch,
  initialFilters = {},
  className,
}) => {
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');

  const handleSearch = useCallback(() => {
    const newFilters = {
      ...filters,
      ...(searchTerm.trim()
        ? { search: searchTerm.trim() }
        : {}),
    }

    onSearch(newFilters)
  }, [filters, searchTerm, onSearch])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const handleFilterChange = useCallback(
    (key: string, value: any) => {
      setFilters((prev) => {
        const next = {
          ...prev,
        }

        if (
          value === undefined ||
          value === null ||
          value === ''
        ) {
          delete next[key]
        } else {
          next[key] = value
        }

        return next
      })
    },
    []
  )

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
    onSearch({});
  }, [onSearch]);

  const hasActiveFilters = Object.keys(filters).some(key => filters[key] !== undefined && filters[key] !== '');

  return (
    <div className={cn('space-y-4', className)}>
      {/* Busca principal */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Buscar por código de rastreio, descrição, cliente, transportador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            leftIcon={<Search className="w-4 h-4 text-gray-400" />}
            rightIcon={
              searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    const newFilters = { ...filters };
                    delete newFilters.search;
                    onSearch(newFilters);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )
            }
            className="pl-10 pr-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={handleSearch}
            leftIcon={<Search className="w-4 h-4" />}
          >
            Buscar
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            leftIcon={<Filter className="w-4 h-4" />}
          >
            Filtros
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-600 rounded-full">
                {Object.keys(filters).filter(k => filters[k] !== undefined && filters[k] !== '').length}
              </span>
            )}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500"
            >
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Filtros avançados */}
      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <Select
            label="Status"
            options={statusOptions}
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          />
          <Select
            label="Prioridade"
            options={prioridadeOptions}
            value={filters.prioridade || ''}
            onChange={(e) => handleFilterChange('prioridade', e.target.value)}
          />
          <Select
            label="Tipo de Mercadoria"
            options={tipoMercadoriaOptions}
            value={filters.tipoMercadoria || ''}
            onChange={(e) => handleFilterChange('tipoMercadoria', e.target.value)}
          />
          <Input
            label="Cidade de Origem"
            type="text"
            placeholder="Ex: Maputo"
            value={filters.origemCidade || ''}
            onChange={(e) => handleFilterChange('origemCidade', e.target.value)}
          />
          <Input
            label="Cidade de Destino"
            type="text"
            placeholder="Ex: Beira"
            value={filters.destinoCidade || ''}
            onChange={(e) => handleFilterChange('destinoCidade', e.target.value)}
          />
          <Input
            label="Data Início"
            type="date"
            value={filters.dataInicio || ''}
            onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
          />
          <Input
            label="Data Fim"
            type="date"
            value={filters.dataFim || ''}
            onChange={(e) => handleFilterChange('dataFim', e.target.value)}
          />
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opções
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={filters.temAlertas === true}
                    onChange={(e) => handleFilterChange('temAlertas', e.target.checked ? true : undefined)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Com Alertas
                </label>
                <label className="flex items-center gap-1 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={filters.temReclamacoes === true}
                    onChange={(e) => handleFilterChange('temReclamacoes', e.target.checked ? true : undefined)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Com Reclamações
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros ativos (tags) */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value || value === '') return null;
            
            let label = key;
            let displayValue = value;
            
            // Mapear labels para exibição
            const labelMap: Record<string, string> = {
              status: 'Status',
              prioridade: 'Prioridade',
              tipoMercadoria: 'Tipo',
              origemCidade: 'Origem',
              destinoCidade: 'Destino',
              dataInicio: 'Data Início',
              dataFim: 'Data Fim',
              temAlertas: 'Alertas',
              temReclamacoes: 'Reclamações',
              search: 'Busca',
            };
            
            label = labelMap[key] || key;
            
            if (key === 'temAlertas' && value === true) displayValue = 'Sim';
            if (key === 'temReclamacoes' && value === true) displayValue = 'Sim';
            
            // Buscar label do status
            if (key === 'status') {
              const statusOption = statusOptions.find(opt => opt.value === value);
              if (statusOption) displayValue = statusOption.label;
            }
            
            // Buscar label da prioridade
            if (key === 'prioridade') {
              const prioridadeOption = prioridadeOptions.find(opt => opt.value === value);
              if (prioridadeOption) displayValue = prioridadeOption.label;
            }
            
            // Buscar label do tipo
            if (key === 'tipoMercadoria') {
              const tipoOption = tipoMercadoriaOptions.find(opt => opt.value === value);
              if (tipoOption) displayValue = tipoOption.label;
            }
            
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full border border-blue-200"
              >
                <span className="font-medium">{label}:</span>
                <span>{displayValue}</span>
                <button
                  type="button"
                  onClick={() => {
                    const newFilters = { ...filters };
                    delete newFilters[key];
                    setFilters(newFilters);
                    onSearch(newFilters);
                  }}
                  className="ml-0.5 text-blue-400 hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};