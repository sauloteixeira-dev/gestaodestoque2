import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-2)',
      marginTop: 'var(--space-4)',
      paddingTop: 'var(--space-4)',
      borderTop: '1px solid var(--border)'
    }}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn-secondary"
        style={{
          padding: 'var(--space-2)',
          minWidth: 'unset',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <ChevronLeft size={16} />
      </button>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)'
      }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          // Show first page, last page, current page, and pages around current
          const showPage =
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1);

          // Show ellipsis
          const showEllipsisBefore = page === currentPage - 2 && currentPage > 3;
          const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2;

          if (!showPage && !showEllipsisBefore && !showEllipsisAfter) return null;

          if (showEllipsisBefore || showEllipsisAfter) {
            return (
              <span key={page} style={{ color: 'var(--text-muted)', padding: '0 var(--space-1)' }}>
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={page === currentPage ? 'btn-primary' : 'btn-secondary'}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                minWidth: '36px',
                fontWeight: page === currentPage ? 'var(--font-semibold)' : 'var(--font-normal)'
              }}
            >
              {page}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn-secondary"
        style={{
          padding: 'var(--space-2)',
          minWidth: 'unset',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <ChevronRight size={16} />
      </button>

      <span style={{
        marginLeft: 'var(--space-3)',
        fontSize: 'var(--text-sm)',
        color: 'var(--text-secondary)'
      }}>
        Página {currentPage} de {totalPages}
      </span>
    </div>
  );
};

export default Pagination;
