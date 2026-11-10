'use client';

import React from 'react';
import { cn } from '../../lib/utils/cn';

// ================================================================
// COMPONENTE PRINCIPAL DA TABELA
// ================================================================

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
  className?: string;
  striped?: boolean;
  hover?: boolean;
  bordered?: boolean;
  compact?: boolean;
}

export const Table: React.FC<TableProps> = ({
  children,
  className,
  striped = false,
  hover = false,
  bordered = false,
  compact = false,
  ...props
}) => {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn(
          'w-full text-sm text-left',
          bordered && 'border border-gray-200',
          className
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

// ================================================================
// CABEÇALHO DA TABELA
// ================================================================

interface TableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
  className?: string;
}

export const TableHead: React.FC<TableHeadProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <thead
      className={cn(
        'bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider',
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
};

// ================================================================
// LINHA DO CABEÇALHO
// ================================================================

interface TableHeadRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  className?: string;
}

export const TableHeadRow: React.FC<TableHeadRowProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <tr className={cn('border-b border-gray-200', className)} {...props}>
      {children}
    </tr>
  );
};

// ================================================================
// CÉLULA DO CABEÇALHO
// ================================================================

interface TableHeadCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  className?: string;
  sortable?: boolean;
  onSort?: () => void;
  sorted?: 'asc' | 'desc' | null;
}

export const TableHeadCell: React.FC<TableHeadCellProps> = ({
  children,
  className,
  sortable = false,
  onSort,
  sorted = null,
  ...props
}) => {
  return (
    <th
      className={cn(
        'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
        sortable && 'cursor-pointer hover:text-gray-700 select-none',
        className
      )}
      onClick={sortable ? onSort : undefined}
      {...props}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortable && (
          <span className="text-gray-400 text-xs">
            {sorted === 'asc' && '↑'}
            {sorted === 'desc' && '↓'}
            {!sorted && '⇅'}
          </span>
        )}
      </div>
    </th>
  );
};

// ================================================================
// CORPO DA TABELA
// ================================================================

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
  className?: string;
}

export const TableBody: React.FC<TableBodyProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <tbody className={cn('divide-y divide-gray-200', className)} {...props}>
      {children}
    </tbody>
  );
};

// ================================================================
// LINHA DA TABELA
// ================================================================

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  striped?: boolean;
  selected?: boolean;
  clickable?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({
  children,
  className,
  hover = false,
  striped = false,
  selected = false,
  clickable = false,
  ...props
}) => {
  return (
    <tr
      className={cn(
        'transition-colors duration-150',
        hover && 'hover:bg-gray-50',
        striped && 'even:bg-gray-50',
        selected && 'bg-blue-50 hover:bg-blue-100',
        clickable && 'cursor-pointer hover:bg-gray-50',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
};

// ================================================================
// CÉLULA DA TABELA
// ================================================================

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  nowrap?: boolean;
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  className,
  align = 'left',
  nowrap = false,
  ...props
}) => {
  return (
    <td
      className={cn(
        'px-4 py-3 text-sm text-gray-700',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        nowrap && 'whitespace-nowrap',
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
};

// ================================================================
// RODAPÉ DA TABELA
// ================================================================

interface TableFootProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
  className?: string;
}

export const TableFoot: React.FC<TableFootProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <tfoot
      className={cn(
        'bg-gray-50 text-xs font-medium text-gray-500',
        className
      )}
      {...props}
    >
      {children}
    </tfoot>
  );
};

// ================================================================
// COMPONENTES DE UTILIDADE
// ================================================================

interface TableEmptyProps {
  colSpan: number;
  message?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const TableEmpty: React.FC<TableEmptyProps> = ({
  colSpan,
  message = 'Nenhum dado encontrado',
  icon,
  className,
}) => {
  return (
    <tr>
      <td colSpan={colSpan} className={cn('px-4 py-8 text-center', className)}>
        <div className="flex flex-col items-center justify-center text-gray-500">
          {icon && <div className="mb-2">{icon}</div>}
          <p className="text-sm">{message}</p>
        </div>
      </td>
    </tr>
  );
};

// ================================================================
// COMPONENTE DE CARREGAMENTO
// ================================================================

interface TableLoadingProps {
  colSpan: number;
  message?: string;
  className?: string;
}

export const TableLoading: React.FC<TableLoadingProps> = ({
  colSpan,
  message = 'Carregando...',
  className,
}) => {
  return (
    <tr>
      <td colSpan={colSpan} className={cn('px-4 py-8 text-center', className)}>
        <div className="flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-2 text-sm text-gray-500">{message}</p>
        </div>
      </td>
    </tr>
  );
};

// ================================================================
// COMPONENTE DE PAGINAÇÃO DA TABELA
// ================================================================

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 25, 50],
  className,
}) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={cn(
      'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 bg-gray-50 border-t border-gray-200',
      className
    )}>
      <div className="text-sm text-gray-500">
        Mostrando <span className="font-medium">{startItem}</span> a{' '}
        <span className="font-medium">{endItem}</span> de{' '}
        <span className="font-medium">{totalItems}</span> registros
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {onPageSizeChange && (
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-500">Por página:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={cn(
              'px-3 py-1 text-sm rounded-md transition-colors',
              currentPage === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-200'
            )}
          >
            Anterior
          </button>

          <span className="px-3 py-1 text-sm font-medium text-gray-700">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={cn(
              'px-3 py-1 text-sm rounded-md transition-colors',
              currentPage === totalPages
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-200'
            )}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
};

// ================================================================
// EXPORTAÇÃO PADRÃO
// ================================================================

export default Object.assign(Table, {
  Head: TableHead,
  HeadRow: TableHeadRow,
  HeadCell: TableHeadCell,
  Body: TableBody,
  Row: TableRow,
  Cell: TableCell,
  Foot: TableFoot,
  Empty: TableEmpty,
  Loading: TableLoading,
  Pagination: TablePagination,
});