'use client';

import React, { useState } from 'react';
import { Etapa } from '../../lib/types/carga';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  CheckCircle,
  Clock,
  Calendar,
  MapPin,
  User,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Filter,
  Search,
  X,
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '../../lib/utils/format';
import { cn } from '../../lib/utils/cn';

interface CargaTimelineProps {
  etapas: Etapa[];
  statusAtual?: string;
  onRefresh?: () => void;
  loading?: boolean;
  className?: string;
  showControls?: boolean;
  maxHeight?: string | number;
}

export const CargaTimeline: React.FC<CargaTimelineProps> = ({
  etapas,
  statusAtual,
  onRefresh,
  loading = false,
  className,
  showControls = true,
  maxHeight = '500px',
}) => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'in_progress'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');

  // Ordenar etapas por data de início
  const sortedEtapas = [...etapas].sort((a, b) => {
    const dateA = a.dataHoraInicio ? new Date(a.dataHoraInicio).getTime() : 0;
    const dateB = b.dataHoraInicio ? new Date(b.dataHoraInicio).getTime() : 0;
    return dateA - dateB;
  });

  // Filtrar etapas
  const filteredEtapas = sortedEtapas.filter(etapa => {
    // Filtro por status
    if (filter === 'completed' && etapa.status !== 'concluido') return false;
    if (filter === 'pending' && etapa.status !== 'pendente') return false;
    if (filter === 'in_progress' && etapa.status !== 'em_andamento') return false;
    
    // Filtro por busca
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return etapa.nome.toLowerCase().includes(searchLower) ||
        (etapa.descricao && etapa.descricao.toLowerCase().includes(searchLower)) ||
        (etapa.responsavel?.nome && etapa.responsavel.nome.toLowerCase().includes(searchLower)) ||
        (etapa.localizacao?.cidade && etapa.localizacao.cidade.toLowerCase().includes(searchLower));
    }
    
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'em_andamento':
        return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'pendente':
        return <Clock className="w-5 h-5 text-gray-400" />;
      case 'atrasado':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'interrompido':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'info' | 'gray' | 'danger' | 'warning'> = {
      concluido: 'success',
      em_andamento: 'info',
      pendente: 'gray',
      atrasado: 'danger',
      interrompido: 'warning',
    };
    return variants[status] || 'gray';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      concluido: 'Concluído',
      em_andamento: 'Em Andamento',
      pendente: 'Pendente',
      atrasado: 'Atrasado',
      interrompido: 'Interrompido',
    };
    return labels[status] || status;
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Calcular progresso
  const totalEtapas = etapas.length;
  const concluidas = etapas.filter(e => e.status === 'concluido').length;
  const emAndamento = etapas.filter(e => e.status === 'em_andamento').length;
  const progresso = totalEtapas > 0 ? Math.round((concluidas / totalEtapas) * 100) : 0;

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="mt-2 text-sm text-gray-500">Carregando etapas...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (etapas.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8">
          <div className="text-center">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 font-medium">Nenhuma etapa registrada</p>
            <p className="text-sm text-gray-400 mt-1">Esta carga não possui etapas definidas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Linha do Tempo
              <Badge variant="info" size="sm">
                {concluidas}/{totalEtapas}
              </Badge>
            </CardTitle>
            <CardDescription>
              {progresso}% concluído • {emAndamento} em andamento • {totalEtapas - concluidas - emAndamento} pendente(s)
            </CardDescription>
          </div>
          {showControls && (
            <div className="flex flex-wrap items-center gap-2">
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={loading}
                >
                  <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                </Button>
              )}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('timeline')}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                    viewMode === 'timeline'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  Lista
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Barra de progresso */}
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progresso</span>
            <span>{progresso}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progresso}%` }}
            />
          </div>
        </div>

        {/* Filtros e busca */}
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar etapas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                filter === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('in_progress')}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                filter === 'in_progress'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              Em Andamento
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                filter === 'completed'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              Concluídas
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                filter === 'pending'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              Pendentes
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div 
          className="overflow-y-auto pr-2"
          style={{ maxHeight }}
        >
          {filteredEtapas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Nenhuma etapa encontrada com os filtros atuais</p>
            </div>
          ) : viewMode === 'timeline' ? (
            // Visualização Timeline
            <div className="relative">
              {/* Linha vertical */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
              
              <div className="space-y-6">
                {filteredEtapas.map((etapa, index) => {
                  const isCompleted = etapa.status === 'concluido';
                  const isActive = etapa.status === 'em_andamento';
                  const isExpanded = expandedId === etapa.etapaId;

                  return (
                    <div key={etapa.etapaId || index} className="relative pl-10">
                      {/* Círculo de status */}
                      <div className={cn(
                        'absolute left-0 top-1 w-10 h-10 rounded-full flex items-center justify-center border-2',
                        isCompleted ? 'bg-green-100 border-green-500' :
                        isActive ? 'bg-blue-100 border-blue-500' :
                        etapa.status === 'atrasado' ? 'bg-red-100 border-red-500' :
                        'bg-gray-100 border-gray-300'
                      )}>
                        {getStatusIcon(etapa.status)}
                      </div>

                      {/* Conteúdo */}
                      <div className={cn(
                        'rounded-lg p-4 border transition-all duration-200 cursor-pointer',
                        isCompleted ? 'bg-green-50 border-green-200 hover:border-green-300' :
                        isActive ? 'bg-blue-50 border-blue-200 hover:border-blue-300' :
                        etapa.status === 'atrasado' ? 'bg-red-50 border-red-200 hover:border-red-300' :
                        'bg-gray-50 border-gray-200 hover:border-gray-300'
                      )}
                      onClick={() => toggleExpand(etapa.etapaId)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-medium text-gray-900">
                                {etapa.nome}
                              </h4>
                              <Badge variant={getStatusBadge(etapa.status)} size="sm">
                                {getStatusLabel(etapa.status)}
                              </Badge>
                              {etapa.duracaoReal && (
                                <Badge variant="gray" size="sm">
                                  {etapa.duracaoReal.toFixed(1)}h
                                </Badge>
                              )}
                            </div>
                            {etapa.descricao && !isExpanded && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                                {etapa.descricao}
                              </p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                              {etapa.dataHoraInicio && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(etapa.dataHoraInicio)}
                                </span>
                              )}
                              {etapa.dataHoraFim && (
                                <span className="flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                  {formatDate(etapa.dataHoraFim)}
                                </span>
                              )}
                              {etapa.localizacao?.cidade && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {etapa.localizacao.cidade}
                                </span>
                              )}
                              {etapa.responsavel?.nome && (
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {etapa.responsavel.nome}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatRelativeTime(etapa.dataHoraInicio || etapa.dataHoraFim || new Date().toISOString())}
                              </span>
                            </div>
                          </div>
                          <button
                            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(etapa.etapaId);
                            }}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Conteúdo expandido */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                            {etapa.descricao && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-700">Descrição</h5>
                                <p className="text-sm text-gray-600 mt-1">{etapa.descricao}</p>
                              </div>
                            )}

                            {etapa.localizacao && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-700">Localização</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1 text-sm text-gray-600">
                                  {etapa.localizacao.endereco && (
                                    <div>
                                      <span className="text-gray-500">Endereço:</span>
                                      <span className="ml-1">{etapa.localizacao.endereco}</span>
                                    </div>
                                  )}
                                  {etapa.localizacao.cidade && (
                                    <div>
                                      <span className="text-gray-500">Cidade:</span>
                                      <span className="ml-1">{etapa.localizacao.cidade}</span>
                                    </div>
                                  )}
                                  {etapa.localizacao.pais && (
                                    <div>
                                      <span className="text-gray-500">País:</span>
                                      <span className="ml-1">{etapa.localizacao.pais}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {etapa.responsavel && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-700">Responsável</h5>
                                <div className="mt-1 text-sm text-gray-600">
                                  <div>
                                    <span className="text-gray-500">Nome:</span>
                                    <span className="ml-1">{etapa.responsavel.nome}</span>
                                  </div>
                                  {etapa.responsavel.cargo && (
                                    <div>
                                      <span className="text-gray-500">Cargo:</span>
                                      <span className="ml-1">{etapa.responsavel.cargo}</span>
                                    </div>
                                  )}
                                  {etapa.responsavel.contacto && (
                                    <div>
                                      <span className="text-gray-500">Contacto:</span>
                                      <span className="ml-1">{etapa.responsavel.contacto}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {etapa.documentos && etapa.documentos.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium text-gray-700">Documentos</h5>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {etapa.documentos.map((doc, idx) => (
                                    <Badge key={idx} variant="gray" size="sm">
                                      📄 {doc.nome}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {etapa.observacoes && (
                              <div className="bg-gray-50 rounded-lg p-3">
                                <h5 className="text-sm font-medium text-gray-700">Observações</h5>
                                <p className="text-sm text-gray-600 mt-1">{etapa.observacoes}</p>
                              </div>
                            )}

                            <div className="flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedId(null);
                                }}
                              >
                                Fechar detalhes
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            // Visualização Lista
            <div className="space-y-2">
              {filteredEtapas.map((etapa, index) => (
                <div
                  key={etapa.etapaId || index}
                  className={cn(
                    'flex items-center gap-4 p-3 rounded-lg border transition-all duration-200',
                    etapa.status === 'concluido' ? 'bg-green-50 border-green-200' :
                    etapa.status === 'em_andamento' ? 'bg-blue-50 border-blue-200' :
                    etapa.status === 'atrasado' ? 'bg-red-50 border-red-200' :
                    'bg-gray-50 border-gray-200'
                  )}
                >
                  <div className="flex-shrink-0">
                    {getStatusIcon(etapa.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">{etapa.nome}</span>
                      <Badge variant={getStatusBadge(etapa.status)} size="sm">
                        {getStatusLabel(etapa.status)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                      {etapa.dataHoraInicio && (
                        <span>{formatDate(etapa.dataHoraInicio)}</span>
                      )}
                      {etapa.localizacao?.cidade && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {etapa.localizacao.cidade}
                        </span>
                      )}
                      {etapa.responsavel?.nome && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {etapa.responsavel.nome}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(etapa.etapaId)}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className={cn(
                      'w-4 h-4 transition-transform',
                      expandedId === etapa.etapaId && 'rotate-180'
                    )} />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumo */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap justify-between gap-2 text-xs text-gray-500">
          <div>
            Total: <span className="font-medium">{totalEtapas}</span> etapas
          </div>
          <div className="flex gap-4">
            <span>
              ✅ Concluídas: <span className="font-medium text-green-600">{concluidas}</span>
            </span>
            <span>
              🔄 Em andamento: <span className="font-medium text-blue-600">{emAndamento}</span>
            </span>
            <span>
              ⏳ Pendentes: <span className="font-medium text-gray-600">{totalEtapas - concluidas - emAndamento}</span>
            </span>
          </div>
          {statusAtual && (
            <div>
              Status atual: <Badge variant="info" size="sm">{statusAtual}</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};