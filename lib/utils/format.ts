import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDate(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'dd/MM/yyyy HH:mm', { locale: ptBR });
}

export function formatDateShort(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'dd/MM/yyyy', { locale: ptBR });
}

export function formatTime(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'HH:mm', { locale: ptBR });
}

export function formatRelativeTime(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(parsedDate, { addSuffix: true, locale: ptBR });
}

export function formatCurrency(value: number, currency: string = 'MZN'): string {
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-MZ').format(value);
}

export function formatWeight(value: number, unit: string = 'kg'): string {
  return `${formatNumber(value)} ${unit}`;
}

export function formatVolume(value: number, unit: string = 'm³'): string {
  return `${formatNumber(value)} ${unit}`;
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    registada: 'Registada',
    em_preparacao: 'Em Preparação',
    pronta_para_transporte: 'Pronta para Transporte',
    em_transito: 'Em Trânsito',
    em_posto_controlo: 'Em Posto de Controlo',
    em_fronteira: 'Em Fronteira',
    em_porto: 'Em Porto',
    em_armazem: 'Em Armazém',
    em_distribuicao: 'Em Distribuição',
    entregue: 'Entregue',
    suspensa: 'Suspensa',
    cancelada: 'Cancelada',
    extraviada: 'Extraviada',
    danificada: 'Danificada',
  };
  return statusMap[status] || status;
}

export function getPrioridadeLabel(prioridade: string): string {
  const prioridadeMap: Record<string, string> = {
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta',
    urgente: 'Urgente',
  };
  return prioridadeMap[prioridade] || prioridade;
}

export function getGravidadeLabel(gravidade: string): string {
  const gravidadeMap: Record<string, string> = {
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta',
    critica: 'Crítica',
  };
  return gravidadeMap[gravidade] || gravidade;
}

export function formatFileSize(sizeKB: number): string {
  if (!sizeKB || sizeKB === 0) return '0 KB';
  if (sizeKB < 1024) {
    return `${sizeKB.toFixed(1)} KB`;
  }
  const sizeMB = sizeKB / 1024;
  if (sizeMB < 1024) {
    return `${sizeMB.toFixed(1)} MB`;
  }
  const sizeGB = sizeMB / 1024;
  return `${sizeGB.toFixed(1)} GB`;
}