import React from 'react'
import { cn } from '../../lib/utils/cn'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  showFirstLast?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showFirstLast = true,
  size = 'sm',
}) => {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const delta = 2
    const range: number[] = []
    const rangeWithDots: (string | number)[] = []
    let l: number

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i)
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    })

    return rangeWithDots
  }

  const pageNumbers = getPageNumbers()

  const sizeClasses = {
    sm: 'text-xs px-2 py-1 min-w-[28px] h-7',
    md: 'text-sm px-3 py-1.5 min-w-[36px] h-9',
    lg: 'text-base px-4 py-2 min-w-[44px] h-11',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  return (
    <nav className={cn('flex items-center gap-1', className)} aria-label="Pagination">
      {showFirstLast && (
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={cn(
            'flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
            sizeClasses[size]
          )}
          aria-label="Primeira página"
        >
          <ChevronsLeft className={iconSizes[size]} />
        </button>
      )}

      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          'flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
          sizeClasses[size]
        )}
        aria-label="Página anterior"
      >
        <ChevronLeft className={iconSizes[size]} />
      </button>

      {pageNumbers.map((page, index) =>
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="px-2 text-gray-400 text-sm">…</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(Number(page))}
            className={cn(
              'flex items-center justify-center rounded-md border transition-colors font-medium',
              currentPage === page
                ? 'bg-gray-800 text-white border-gray-800 hover:bg-gray-900'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800',
              sizeClasses[size]
            )}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          'flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
          sizeClasses[size]
        )}
        aria-label="Próxima página"
      >
        <ChevronRight className={iconSizes[size]} />
      </button>

      {showFirstLast && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={cn(
            'flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent',
            sizeClasses[size]
          )}
          aria-label="Última página"
        >
          <ChevronsRight className={iconSizes[size]} />
        </button>
      )}
    </nav>
  )
}