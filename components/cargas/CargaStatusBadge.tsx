import React from 'react';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/utils/cn';

const statusConfig: Record<string, { variant: 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'gray'; label: string }> = {
  registada: { variant: 'gray', label: 'Registada' },
  em_preparacao: { variant: 'info', label: 'Em Preparação' },
  pronta_para_transporte: { variant: 'info', label: 'Pronta para Transporte' },
  em_transito: { variant: 'primary', label: 'Em Trânsito' },
  em_posto_controlo: { variant: 'warning', label: 'Em Posto de Controlo' },
  em_fronteira: { variant: 'warning', label: 'Em Fronteira' },
  em_porto: { variant: 'warning', label: 'Em Porto' },
  em_armazem: { variant: 'info', label: 'Em Armazém' },
  em_distribuicao: { variant: 'primary', label: 'Em Distribuição' },
  entregue: { variant: 'success', label: 'Entregue' },
  suspensa: { variant: 'warning', label: 'Suspensa' },
  cancelada: { variant: 'danger', label: 'Cancelada' },
  extraviada: { variant: 'danger', label: 'Extraviada' },
  danificada: { variant: 'danger', label: 'Danificada' },
};

interface CargaStatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CargaStatusBadge: React.FC<CargaStatusBadgeProps> = ({
  status,
  className,
  size = 'md',
}) => {
  const config = statusConfig[status] || { variant: 'gray', label: status };

  return (
    <Badge
      variant={config.variant}
      size={size}
      className={cn('capitalize', className)}
    >
      {config.label}
    </Badge>
  );
};