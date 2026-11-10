'use client';

import React, { useState } from 'react';
import { Carga } from '../../lib/types/carga';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { CargaStatusBadge } from './CargaStatusBadge';
import { CargaMap } from './CargaMap';
import { 
  MapPin, 
  Calendar, 
  Package, 
  Truck, 
  User, 
  Building2, 
  Phone, 
  Mail,
  AlertTriangle,
  FileText,
  Clock,
  DollarSign,
  Weight,
  Box,
  Map,
  Navigation,
  CheckCircle,
  XCircle,
  Loader2,
  Download,
  Eye,
  Edit,
  Trash2,
  Archive,
  RefreshCw,
  MessageSquare,
  Flag,
  ClipboardList,
  Image
} from 'lucide-react';
import { formatDate, formatCurrency, formatWeight, formatVolume } from '../../lib/utils/format';
import { cn } from '../../lib/utils/cn';

interface CargaDetailProps {
  carga: Carga;
  onRefresh?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  onGenerateReport?: () => void;
}

export const CargaDetail: React.FC<CargaDetailProps> = ({
  carga,
  onRefresh,
  onEdit,
  onDelete,
  onArchive,
  onGenerateReport,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'localizacao' | 'etapas' | 'documentos' | 'alertas' | 'reclamacoes'>('info');

  const hasAlertas = carga.alertas?.some(a => !a.resolvido) || false;

  return (
    <div className="space-y-6 text-gray-950">
      {/* Cabeçalho com ações */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-semibold text-gray-900">{carga.descricao}</h2>
            <CargaStatusBadge status={carga.status} />
            {hasAlertas && (
              <Badge variant="danger">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Alertas
              </Badge>
            )}
            {carga.prioridade === 'urgente' && (
              <Badge variant="danger">
                <Flag className="w-3 h-3 mr-1" />
                Urgente
              </Badge>
            )}
            {carga.prioridade === 'alta' && (
              <Badge variant="warning">
                <Flag className="w-3 h-3 mr-1" />
                Alta
              </Badge>
            )}
          </div>
          <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
            <span className="font-mono">Código: {carga.codigoRastreio}</span>
            {carga.numeroOrdem && <span>| Ordem: {carga.numeroOrdem}</span>}
            <span>| Criado: {formatDate(carga.dataCriacao)}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
          )}
          {onGenerateReport && (
            <Button variant="outline" size="sm" onClick={onGenerateReport}>
              <Download className="w-4 h-4 mr-1" />
              Relatório
            </Button>
          )}
          {onArchive && (
            <Button variant="outline" size="sm" onClick={onArchive}>
              <Archive className="w-4 h-4 mr-1" />
              Arquivar
            </Button>
          )}
          {onDelete && (
            <Button variant="danger" size="sm" onClick={onDelete}>
              <Trash2 className="w-4 h-4 mr-1" />
              Excluir
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 ">
        <button
          onClick={() => setActiveTab('info')}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors border-b-2',
            activeTab === 'info'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <Package className="w-4 h-4 inline mr-1" />
          Informações
        </button>
        <button
          onClick={() => setActiveTab('localizacao')}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors border-b-2',
            activeTab === 'localizacao'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <Navigation className="w-4 h-4 inline mr-1" />
          Localização
        </button>
        <button
          onClick={() => setActiveTab('etapas')}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors border-b-2',
            activeTab === 'etapas'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <ClipboardList className="w-4 h-4 inline mr-1" />
          Etapas
        </button>
        <button
          onClick={() => setActiveTab('documentos')}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors border-b-2',
            activeTab === 'documentos'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <FileText className="w-4 h-4 inline mr-1" />
          Documentos
        </button>
        <button
          onClick={() => setActiveTab('alertas')}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors border-b-2 relative',
            activeTab === 'alertas'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <AlertTriangle className="w-4 h-4 inline mr-1" />
          Alertas
          {hasAlertas && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('reclamacoes')}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors border-b-2',
            activeTab === 'reclamacoes'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          )}
        >
          <MessageSquare className="w-4 h-4 inline mr-1" />
          Reclamações
        </button>
      </div>

      {/* Conteúdo das tabs */}
      <div className="mt-4">
        {activeTab === 'info' && <InfoTab carga={carga} />}
        {activeTab === 'localizacao' && <LocalizacaoTab carga={carga} />}
        {activeTab === 'etapas' && <EtapasTab carga={carga} />}
        {activeTab === 'documentos' && <DocumentosTab carga={carga} />}
        {activeTab === 'alertas' && <AlertasTab carga={carga} />}
        {activeTab === 'reclamacoes' && <ReclamacoesTab carga={carga} />}
      </div>
    </div>
  );
};

// ================================================================
// TAB DE INFORMAÇÕES
// ================================================================

const InfoTab: React.FC<{ carga: Carga }> = ({ carga }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Informações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-950">Informações Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-500">Código de Rastreio</dt>
              <dd className="font-medium font-mono text-gray-500">{carga.codigoRastreio}</dd>
            </div>
            {carga.numeroOrdem && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Número de Ordem</dt>
                <dd className="font-medium text-gray-500">{carga.numeroOrdem}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-gray-500">Tipo de Mercadoria</dt>
              <dd className="font-medium capitalize text-gray-500">{carga.tipoMercadoria || 'N/A'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Prioridade</dt>
              <dd className='text-gray-500'>
                <Badge 
                  variant={
                    carga.prioridade === 'urgente' ? 'danger' :
                    carga.prioridade === 'alta' ? 'warning' :
                    carga.prioridade === 'media' ? 'info' : 'gray'
                  }
                  size="sm"
                >
                  {carga.prioridade || 'Média'}
                </Badge>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Status</dt>
              <dd className='text-gray-500'>
                <CargaStatusBadge status={carga.status} size="sm" />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Progresso</dt>
              <dd className="font-medium text-gray-500">{carga.progressoPercentual || 0}%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Criado em</dt>
              <dd className="font-medium text-gray-500">{formatDate(carga.dataCriacao)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Última atualização</dt>
              <dd className="font-medium text-gray-500">{formatDate(carga.dataAtualizacao)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Medidas e Valores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-950">Medidas e Valores</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-gray-500 flex items-center gap-1">
                <Weight className="w-4 h-4" />
                Peso
              </dt>
              <dd className="font-medium text-gray-500">{formatWeight(carga.peso, carga.unidadeMedidaPeso)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 flex items-center gap-1">
                <Box className="w-4 h-4" />
                Volume
              </dt>
              <dd className="font-medium text-gray-500">{formatVolume(carga.volume, carga.unidadeMedidaVolume)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500 flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                Valor Declarado
              </dt>
              <dd className="font-medium text-gray-500">{formatCurrency(carga.valorDeclarado)}</dd>
            </div>
            {carga.metricas?.custoTotal && (
              <div className="flex justify-between">
                <dt className="text-gray-500 flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  Custo Total
                </dt>
                <dd className="font-medium text-gray-500">{formatCurrency(carga.metricas.custoTotal)}</dd>
              </div>
            )}
            {carga.metricas?.distanciaPercorridaKm && (
              <div className="flex justify-between text-gray-500">
                <dt className="text-gray-500 flex items-center gap-1">
                  <Map className="w-4 h-4" />
                  Distância Percorrida
                </dt>
                <dd className="font-medium">{carga.metricas.distanciaPercorridaKm} km</dd>
              </div>
            )}
            {carga.metricas?.tempoTotalViagemHoras && (
              <div className="flex justify-between text-gray-500">
                <dt className="text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Tempo Total
                </dt>
                <dd className="font-medium">{carga.metricas.tempoTotalViagemHoras.toFixed(1)} horas</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Origem e Destino */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-950">Origem</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-gray-500">
            <div className="flex justify-between">
              <dt className="text-gray-500 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Endereço
              </dt>
              <dd className="font-medium text-right">{carga.origem?.endereco || 'N/A'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Cidade</dt>
              <dd className="font-medium">{carga.origem?.cidade || 'N/A'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">País</dt>
              <dd className="font-medium">{carga.origem?.pais || 'N/A'}</dd>
            </div>
            {carga.origem?.dataHoraPrevistaSaida && (
              <div className="flex justify-between">
                <dt className="text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Previsão de Saída
                </dt>
                <dd className="font-medium">{formatDate(carga.origem.dataHoraPrevistaSaida)}</dd>
              </div>
            )}
            {carga.origem?.dataHoraRealSaida && (
              <div className="flex justify-between">
                <dt className="text-gray-500 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Saída Real
                </dt>
                <dd className="font-medium">{formatDate(carga.origem.dataHoraRealSaida)}</dd>
              </div>
            )}
            {carga.origem?.contacto && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Contacto</dt>
                <dd className="font-medium text-right">
                  {carga.origem.contacto.nome}
                  {carga.origem.contacto.telefone && (
                    <div className="text-sm text-gray-500">{carga.origem.contacto.telefone}</div>
                  )}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-gray-950">Destino</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-gray-500">
            <div className="flex justify-between">
              <dt className="text-gray-500 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                Endereço
              </dt>
              <dd className="font-medium text-right">{carga.destino?.endereco || 'N/A'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Cidade</dt>
              <dd className="font-medium">{carga.destino?.cidade || 'N/A'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">País</dt>
              <dd className="font-medium">{carga.destino?.pais || 'N/A'}</dd>
            </div>
            {carga.destino?.dataHoraPrevistaChegada && (
              <div className="flex justify-between">
                <dt className="text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Previsão de Chegada
                </dt>
                <dd className="font-medium">{formatDate(carga.destino.dataHoraPrevistaChegada)}</dd>
              </div>
            )}
            {carga.destino?.dataHoraRealChegada && (
              <div className="flex justify-between">
                <dt className="text-gray-500 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Chegada Real
                </dt>
                <dd className="font-medium">{formatDate(carga.destino.dataHoraRealChegada)}</dd>
              </div>
            )}
            {carga.destino?.contacto && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Contacto</dt>
                <dd className="font-medium text-right">
                  {carga.destino.contacto.nome}
                  {carga.destino.contacto.telefone && (
                    <div className="text-sm text-gray-500">{carga.destino.contacto.telefone}</div>
                  )}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Cliente, Transportador e Motorista */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-950">Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-gray-500">
            <div className="flex justify-between">
              <dt className="text-gray-500 flex items-center gap-1">
                <User className="w-4 h-4" />
                Nome
              </dt>
              <dd className="font-medium">{carga.cliente?.nome || 'N/A'}</dd>
            </div>
            {carga.cliente?.telefone && (
              <div className="flex justify-between">
                <dt className="text-gray-500 flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  Telefone
                </dt>
                <dd className="font-medium">{carga.cliente.telefone}</dd>
              </div>
            )}
            {carga.cliente?.email && (
              <div className="flex justify-between">
                <dt className="text-gray-500 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  Email
                </dt>
                <dd className="font-medium">{carga.cliente.email}</dd>
              </div>
            )}
            {carga.cliente?.clienteId && (
              <div className="flex justify-between">
                <dt className="text-gray-500">ID</dt>
                <dd className="font-medium font-mono">{carga.cliente.clienteId}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-gray-950">Transportador</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-gray-500">
            <div className="flex justify-between">
              <dt className="text-gray-500 flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                Nome
              </dt>
              <dd className="font-medium">{carga.transportador?.nome || 'N/A'}</dd>
            </div>
            {carga.transportador?.telefone && (
              <div className="flex justify-between">
                <dt className="text-gray-500 flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  Telefone
                </dt>
                <dd className="font-medium">{carga.transportador.telefone}</dd>
              </div>
            )}
            {carga.transportador?.email && (
              <div className="flex justify-between">
                <dt className="text-gray-500 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  Email
                </dt>
                <dd className="font-medium">{carga.transportador.email}</dd>
              </div>
            )}
            {carga.transportador?.transportadorId && (
              <div className="flex justify-between">
                <dt className="text-gray-500">ID</dt>
                <dd className="font-medium font-mono">{carga.transportador.transportadorId}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-gray-950">Motorista</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-500">
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-gray-500 flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Nome
                </dt>
                <dd className="font-medium">{carga.motorista?.nome || 'N/A'}</dd>
              </div>
              {carga.motorista?.telefone && (
                <div className="flex justify-between">
                  <dt className="text-gray-500 flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    Telefone
                  </dt>
                  <dd className="font-medium">{carga.motorista.telefone}</dd>
                </div>
              )}
            </dl>
            <dl className="space-y-3">
              {carga.motorista?.email && (
                <div className="flex justify-between">
                  <dt className="text-gray-500 flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    Email
                  </dt>
                  <dd className="font-medium">{carga.motorista.email}</dd>
                </div>
              )}
              {carga.motorista?.motoristaId && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">ID</dt>
                  <dd className="font-medium font-mono">{carga.motorista.motoristaId}</dd>
                </div>
              )}
            </dl>
          </div>
        </CardContent>
      </Card>

      {/* Veículo */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-gray-950">Veículo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-500">
            <div className="flex justify-between">
              <dt className="text-gray-500 flex items-center gap-1">
                <Truck className="w-4 h-4" />
                Matrícula
              </dt>
              <dd className="font-medium">{carga.viatura?.matricula || 'N/A'}</dd>
            </div>
            {carga.viatura?.marca && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Marca</dt>
                <dd className="font-medium">{carga.viatura.marca}</dd>
              </div>
            )}
            {carga.viatura?.modelo && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Modelo</dt>
                <dd className="font-medium">{carga.viatura.modelo}</dd>
              </div>
            )}
            {carga.viatura?.tipoViatura && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Tipo</dt>
                <dd className="font-medium capitalize">{carga.viatura.tipoViatura}</dd>
              </div>
            )}
            {carga.viatura?.ano && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Ano</dt>
                <dd className="font-medium">{carga.viatura.ano}</dd>
              </div>
            )}
            {carga.viatura?.cor && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Cor</dt>
                <dd className="font-medium">{carga.viatura.cor}</dd>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      {carga.tags && carga.tags.length > 0 && (
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {carga.tags.map((tag) => (
                <Badge key={tag} variant="gray" size="md">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ================================================================
// TAB DE LOCALIZAÇÃO
// ================================================================

const LocalizacaoTab: React.FC<{ carga: Carga }> = ({ carga }) => {
  return (
    <CargaMap
      localizacaoAtual={carga.localizacaoAtual}
      historicoLocalizacoes={carga.historicoLocalizacoes}
      origem={{
        endereco: carga.origem?.endereco || '',
        cidade: carga.origem?.cidade || '',
        pais: carga.origem?.pais || '',
        coordenadas: carga.origem?.coordenadas,
      }}
      destino={{
        endereco: carga.destino?.endereco || '',
        cidade: carga.destino?.cidade || '',
        pais: carga.destino?.pais || '',
        coordenadas: carga.destino?.coordenadas,
      }}
      rota={carga.rota}
      height="500px"
    />
  );
};

// ================================================================
// TAB DE ETAPAS
// ================================================================

const EtapasTab: React.FC<{ carga: Carga }> = ({ carga }) => {
  const etapas = carga.etapas || [];

  if (etapas.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          <ClipboardList className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Nenhuma etapa registrada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-gray-500">Etapas do Transporte</CardTitle>
        <CardDescription className='text-gray-500'>Progresso: {carga.progressoPercentual || 0}%</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative text-gray-500">
          {/* Linha de progresso */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
          
          <div className="space-y-6">
            {etapas.map((etapa, index) => {
              const isCompleted = etapa.status === 'concluido';
              const isActive = etapa.status === 'em_andamento';
              const isPending = etapa.status === 'pendente';

              return (
                <div key={etapa.etapaId || index} className="relative pl-10">
                  {/* Círculo de status */}
                  <div className={cn(
                    'absolute left-0 top-1 w-10 h-10 rounded-full flex items-center justify-center',
                    isCompleted ? 'bg-green-100' : 
                    isActive ? 'bg-blue-100' : 
                    'bg-gray-100'
                  )}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : isActive ? (
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-gray-300" />
                    )}
                  </div>

                  <div className={cn(
                    'rounded-lg p-4',
                    isCompleted ? 'bg-green-50 border border-green-200' :
                    isActive ? 'bg-blue-50 border border-blue-200' :
                    'bg-gray-50 border border-gray-200'
                  )}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{etapa.nome}</h4>
                        {etapa.descricao && (
                          <p className="text-sm text-gray-600 mt-1">{etapa.descricao}</p>
                        )}
                      </div>
                      <Badge 
                        variant={
                          isCompleted ? 'success' : 
                          isActive ? 'info' : 
                          'gray'
                        }
                        size="sm"
                      >
                        {isCompleted ? 'Concluído' : 
                         isActive ? 'Em Andamento' : 
                         'Pendente'}
                      </Badge>
                    </div>

                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {etapa.dataHoraInicio && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>Início: {formatDate(etapa.dataHoraInicio)}</span>
                        </div>
                      )}
                      {etapa.dataHoraFim && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>Fim: {formatDate(etapa.dataHoraFim)}</span>
                        </div>
                      )}
                      {etapa.duracaoReal && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>Duração: {etapa.duracaoReal.toFixed(1)} horas</span>
                        </div>
                      )}
                      {etapa.localizacao?.cidade && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span>{etapa.localizacao.cidade}</span>
                        </div>
                      )}
                    </div>

                    {etapa.observacoes && (
                      <p className="mt-2 text-sm text-gray-600 border-t border-gray-200 pt-2">
                        {etapa.observacoes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ================================================================
// TAB DE DOCUMENTOS
// ================================================================

const DocumentosTab: React.FC<{ carga: Carga }> = ({ carga }) => {
  const documentos = carga.documentos || [];

  if (documentos.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Nenhum documento anexado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-gray-950">Documentos</CardTitle>
        <CardDescription className='text-gray-500'>{documentos.length} documento(s) anexado(s)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-500">
          {documentos.map((doc) => (
            <div key={doc.documentoId} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
              <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{doc.nome}</p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                  {doc.tipo && <span className="capitalize">{doc.tipo}</span>}
                  {doc.tamanhoKB && <span>{doc.tamanhoKB} KB</span>}
                  {doc.formato && <span className="uppercase">{doc.formato}</span>}
                  <span>| {formatDate(doc.dataUpload)}</span>
                </div>
                {doc.descricao && (
                  <p className="text-xs text-gray-500 mt-1">{doc.descricao}</p>
                )}
                {doc.uploadPor?.nome && (
                  <p className="text-xs text-gray-400 mt-1">Upload por: {doc.uploadPor.nome}</p>
                )}
              </div>
              <Button variant="outline" size="sm" className="flex-shrink-0">
                <Eye className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ================================================================
// TAB DE ALERTAS
// ================================================================

const AlertasTab: React.FC<{ carga: Carga }> = ({ carga }) => {
  const alertas = carga.alertas || [];
  const alertasAtivos = alertas.filter(a => !a.resolvido);

  if (alertas.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-300" />
          <p>Nenhum alerta registrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-gray-950">Alertas</CardTitle>
        <CardDescription className='text-gray-500'>
          {alertasAtivos.length} alerta(s) ativo(s) | {alertas.filter(a => a.resolvido).length} resolvido(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-gray-500">
          {alertas.map((alerta) => (
            <div key={alerta.alertaId} className={cn(
              'p-4 border rounded-lg',
              alerta.resolvido ? 'bg-gray-50 border-gray-200' :
              alerta.gravidade === 'critica' ? 'bg-red-50 border-red-200' :
              alerta.gravidade === 'alta' ? 'bg-orange-50 border-orange-200' :
              alerta.gravidade === 'media' ? 'bg-yellow-50 border-yellow-200' :
              'bg-blue-50 border-blue-200'
            )}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <AlertTriangle className={cn(
                    'w-5 h-5 mt-0.5',
                    alerta.resolvido ? 'text-gray-400' :
                    alerta.gravidade === 'critica' ? 'text-red-500' :
                    alerta.gravidade === 'alta' ? 'text-orange-500' :
                    alerta.gravidade === 'media' ? 'text-yellow-500' :
                    'text-blue-500'
                  )} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{alerta.tipo}</h4>
                      <Badge 
                        variant={
                          alerta.resolvido ? 'gray' :
                          alerta.gravidade === 'critica' ? 'danger' :
                          alerta.gravidade === 'alta' ? 'warning' :
                          alerta.gravidade === 'media' ? 'warning' : 'info'
                        }
                        size="sm"
                      >
                        {alerta.resolvido ? 'Resolvido' : alerta.gravidade}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{alerta.mensagem}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(alerta.dataHora)}
                      </span>
                      {alerta.resolvido && alerta.resolvidoEm && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          Resolvido em: {formatDate(alerta.resolvidoEm)}
                        </span>
                      )}
                      {alerta.resolvidoPor && (
                        <span>Por: {alerta.resolvidoPor}</span>
                      )}
                      {alerta.acaoTomada && (
                        <span className="text-gray-600">Ação: {alerta.acaoTomada}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// ================================================================
// TAB DE RECLAMAÇÕES
// ================================================================

const ReclamacoesTab: React.FC<{ carga: Carga }> = ({ carga }) => {
  const reclamacoes = carga.reclamacoes || [];

  if (reclamacoes.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Nenhuma reclamação registrada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-gray-950">Reclamações</CardTitle>
        <CardDescription className='text-gray-500'>{reclamacoes.length} reclamação(ões) registrada(s)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-gray-500">
          {reclamacoes.map((reclamacao) => (
            <div key={reclamacao.reclamacaoId} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{reclamacao.tipo}</h4>
                    <Badge 
                      variant={
                        reclamacao.status === 'resolvida' ? 'success' :
                        reclamacao.status === 'fechada' ? 'gray' :
                        reclamacao.status === 'rejeitada' ? 'danger' :
                        reclamacao.status === 'em_analise' ? 'info' :
                        'warning'
                      }
                      size="sm"
                    >
                      {reclamacao.status}
                    </Badge>
                    <Badge 
                      variant={
                        reclamacao.prioridade === 'urgente' ? 'danger' :
                        reclamacao.prioridade === 'alta' ? 'warning' :
                        reclamacao.prioridade === 'media' ? 'info' : 'gray'
                      }
                      size="sm"
                    >
                      {reclamacao.prioridade}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{reclamacao.descricao}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-2">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {reclamacao.clienteNome}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(reclamacao.dataHora)}
                    </span>
                    {reclamacao.atendimento?.responsavel && (
                      <span>Responsável: {reclamacao.atendimento.responsavel}</span>
                    )}
                  </div>
                  {reclamacao.anexos && reclamacao.anexos.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      <Image className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{reclamacao.anexos.length} anexo(s)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};