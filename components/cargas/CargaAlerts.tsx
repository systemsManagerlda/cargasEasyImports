'use client';

import React, { useState } from 'react';
import { Alerta } from '../../lib/types/carga';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Filter,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '../../lib/utils/format';
import { cn } from '../../lib/utils/cn';

interface CargaAlertsProps {
  alertas: Alerta[];
  onResolve?: (alertaId: string, acaoTomada?: string) => void;
  onRefresh?: () => void;
  loading?: boolean;
  className?: string;
}

export const CargaAlerts: React.FC<CargaAlertsProps> = ({
  alertas,
  onResolve,
  onRefresh,
  loading = false,
  className,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('active');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alerta | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveAction, setResolveAction] = useState('');

  const alertasAtivos = alertas.filter(a => !a.resolvido);
  const alertasResolvidos = alertas.filter(a => a.resolvido);

  const filteredAlerts = alertas.filter(a => {
    if (filter === 'active') return !a.resolvido;
    if (filter === 'resolved') return a.resolvido;
    return true;
  });

  const getGravidadeConfig = (gravidade: string) => {
    const configs: Record<string, { variant: 'danger' | 'warning' | 'info' | 'gray'; icon: React.ReactNode }> = {
      critica: { 
        variant: 'danger', 
        icon: <AlertTriangle className="w-4 h-4 text-red-500" /> 
      },
      alta: { 
        variant: 'warning', 
        icon: <AlertTriangle className="w-4 h-4 text-orange-500" /> 
      },
      media: { 
        variant: 'info', 
        icon: <AlertTriangle className="w-4 h-4 text-yellow-500" /> 
      },
      baixa: { 
        variant: 'gray', 
        icon: <AlertTriangle className="w-4 h-4 text-blue-500" /> 
      },
    };
    return configs[gravidade] || configs.baixa;
  };

  const getStatusColor = (resolvido: boolean) => {
    return resolvido ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200';
  };

  const handleResolve = (alerta: Alerta) => {
    setSelectedAlert(alerta);
    setResolveAction('');
    setShowResolveModal(true);
  };

  const confirmResolve = () => {
    if (selectedAlert && onResolve) {
      onResolve(selectedAlert.alertaId, resolveAction || 'Resolvido manualmente');
      setShowResolveModal(false);
      setSelectedAlert(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="mt-2 text-sm text-gray-500">Carregando alertas...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alertas.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-2" />
            <p className="text-gray-500 font-medium">Nenhum alerta registrado</p>
            <p className="text-sm text-gray-400 mt-1">Esta carga não possui alertas</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Alertas
                {alertasAtivos.length > 0 && (
                  <Badge variant="danger" size="sm">
                    {alertasAtivos.length} ativo(s)
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {alertas.length} alerta(s) no total • {alertasResolvidos.length} resolvido(s)
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setFilter('active')}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                    filter === 'active'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  Ativos
                </button>
                <button
                  onClick={() => setFilter('resolved')}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                    filter === 'resolved'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  Resolvidos
                </button>
                <button
                  onClick={() => setFilter('all')}
                  className={cn(
                    'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                    filter === 'all'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  Todos
                </button>
              </div>
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
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>Nenhum alerta {filter === 'active' ? 'ativo' : filter === 'resolved' ? 'resolvido' : ''}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAlerts.map((alerta) => {
                const gravidadeConfig = getGravidadeConfig(alerta.gravidade);
                const isExpanded = expandedId === alerta.alertaId;

                return (
                  <div
                    key={alerta.alertaId}
                    className={cn(
                      'border rounded-lg transition-all duration-200',
                      alerta.resolvido
                        ? 'bg-gray-50 border-gray-200'
                        : gravidadeConfig.variant === 'danger'
                        ? 'bg-red-50 border-red-200'
                        : gravidadeConfig.variant === 'warning'
                        ? 'bg-orange-50 border-orange-200'
                        : gravidadeConfig.variant === 'info'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-blue-50 border-blue-200'
                    )}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="mt-0.5 flex-shrink-0">
                            {alerta.resolvido ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              gravidadeConfig.icon
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-medium text-gray-900 truncate">
                                {alerta.tipo}
                              </h4>
                              <Badge
                                variant={alerta.resolvido ? 'gray' : gravidadeConfig.variant}
                                size="sm"
                              >
                                {alerta.resolvido ? 'Resolvido' : alerta.gravidade}
                              </Badge>
                              {!alerta.resolvido && (
                                <Badge variant="danger" size="sm">
                                  Ativo
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 mt-1 break-words">
                              {alerta.mensagem}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(alerta.dataHora)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatRelativeTime(alerta.dataHora)}
                              </span>
                              {alerta.resolvido && alerta.resolvidoEm && (
                                <span className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="w-3 h-3" />
                                  Resolvido em: {formatDate(alerta.resolvidoEm)}
                                </span>
                              )}
                              {alerta.resolvidoPor && (
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  Por: {alerta.resolvidoPor}
                                </span>
                              )}
                              {alerta.localizacao?.endereco && (
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  {alerta.localizacao.endereco}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {!alerta.resolvido && onResolve && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleResolve(alerta)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Resolver
                            </Button>
                          )}
                          <button
                            onClick={() => toggleExpand(alerta.alertaId)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Conteúdo expandido */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                          {alerta.localizacao && (
                            <div className="bg-white rounded-lg p-3">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Localização</h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                {alerta.localizacao.latitude && (
                                  <div>
                                    <span className="text-gray-500">Latitude:</span>
                                    <span className="ml-1 font-mono">{alerta.localizacao.latitude}</span>
                                  </div>
                                )}
                                {alerta.localizacao.longitude && (
                                  <div>
                                    <span className="text-gray-500">Longitude:</span>
                                    <span className="ml-1 font-mono">{alerta.localizacao.longitude}</span>
                                  </div>
                                )}
                                {alerta.localizacao.endereco && (
                                  <div className="sm:col-span-2">
                                    <span className="text-gray-500">Endereço:</span>
                                    <span className="ml-1">{alerta.localizacao.endereco}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {alerta.resolvido && alerta.acaoTomada && (
                            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                              <h5 className="text-sm font-medium text-green-700 mb-1">Ação Tomada</h5>
                              <p className="text-sm text-gray-700">{alerta.acaoTomada}</p>
                            </div>
                          )}

                          {alerta.notificacoesEnviadas && alerta.notificacoesEnviadas.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-3">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Notificações Enviadas</h5>
                              <div className="space-y-1">
                                {alerta.notificacoesEnviadas.map((notif, index) => (
                                  <div key={index} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">{notif.destinatario}</span>
                                    <span className="text-gray-400">{formatDate(notif.dataEnvio)}</span>
                                    <Badge
                                      variant={notif.lido ? 'success' : 'warning'}
                                      size="sm"
                                    >
                                      {notif.lido ? 'Lido' : 'Não lido'}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setExpandedId(null)}
                            >
                              <EyeOff className="w-4 h-4 mr-1" />
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
          )}
        </CardContent>
      </Card>

      {/* Modal de Resolução */}
      {showResolveModal && selectedAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Resolver Alerta
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Descreva a ação tomada para resolver este alerta:
              </p>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-gray-700">{selectedAlert.tipo}</p>
                <p className="text-sm text-gray-600 mt-1">{selectedAlert.mensagem}</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ação Tomada
                </label>
                <textarea
                  value={resolveAction}
                  onChange={(e) => setResolveAction(e.target.value)}
                  placeholder="Descreva o que foi feito para resolver..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowResolveModal(false);
                    setSelectedAlert(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="success"
                  onClick={confirmResolve}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar Resolução
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};