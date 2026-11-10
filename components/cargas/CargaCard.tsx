import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { CargaStatusBadge } from './CargaStatusBadge';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Carga } from '../../lib/types/carga';
import { formatDate, formatCurrency } from '../../lib/utils/format';
import { MapPin, Package, Truck, Calendar, AlertTriangle } from 'lucide-react';

interface CargaCardProps {
  carga: Carga;
  onView?: (carga: Carga) => void;
  onEdit?: (carga: Carga) => void;
  showActions?: boolean;
}

export const CargaCard: React.FC<CargaCardProps> = ({
  carga,
  onView,
  onEdit,
  showActions = true,
}) => {
  const hasAlertas = carga.alertas?.some(a => !a.resolvido) || false;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">
              <Link href={`/cargas/${carga.cargaId}`} className="hover:text-blue-600">
                {carga.descricao || 'Carga sem descrição'}
              </Link>
            </CardTitle>
            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
              <span className="font-mono">{carga.codigoRastreio}</span>
              {carga.numeroOrdem && (
                <span className="text-gray-400">| {carga.numeroOrdem}</span>
              )}
            </div>
          </div>
          <CargaStatusBadge status={carga.status} />
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Package className="w-4 h-4" />
            <span>{carga.tipoMercadoria || 'N/A'}</span>
            <span className="text-gray-300">|</span>
            <span>{carga.peso} {carga.unidadeMedidaPeso || 'kg'}</span>
            <span className="text-gray-300">|</span>
            <span>{carga.volume} {carga.unidadeMedidaVolume || 'm³'}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{carga.origem?.cidade || 'N/A'}</span>
            <span className="text-gray-300">→</span>
            <span className="truncate">{carga.destino?.cidade || 'N/A'}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Truck className="w-4 h-4" />
            <span>{carga.viatura?.matricula || 'N/A'}</span>
            <span className="text-gray-300">|</span>
            <span>{carga.motorista?.nome || 'Motorista não atribuído'}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Criado em: {formatDate(carga.dataCriacao)}</span>
          </div>

          {carga.valorDeclarado > 0 && (
            <div className="text-gray-600">
              Valor: {formatCurrency(carga.valorDeclarado, 'MZN')}
            </div>
          )}
        </div>

        {hasAlertas && (
          <div className="mt-3 flex items-center gap-1 text-yellow-600 bg-yellow-50 rounded-md px-2 py-1 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Alertas ativos</span>
          </div>
        )}

        {carga.tags && carga.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {carga.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="gray" size="sm">
                {tag}
              </Badge>
            ))}
            {carga.tags.length > 3 && (
              <Badge variant="gray" size="sm">
                +{carga.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="flex gap-2">
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => onView?.(carga)}
          >
            Ver Detalhes
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit?.(carga)}
          >
            Editar
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};