'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface PaginationProps {
  pagination: PaginationData;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  currentPage,
  onPageChange,
}) => {
  if (!pagination || pagination.total === 0) return null;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/50">
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          Showing{' '}
          <span className="font-medium">
            {((currentPage - 1) * pagination.limit) + 1}
          </span>{' '}
          to{' '}
          <span className="font-medium">
            {Math.min(currentPage * pagination.limit, pagination.total)}
          </span>{' '}
          of{' '}
          <span className="font-medium">{pagination.total}</span>{' '}
          results
        </div>

        {pagination.pages > 1 && (
          <div className="text-sm text-gray-500">
            Page {currentPage} of {pagination.pages}
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center gap-2">
          {/* First Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="hidden sm:flex"
          >
            First
          </Button>

          {/* Previous Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Previous</span>
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {(() => {
              const totalPages = pagination.pages;
              const current = currentPage;
              const pages = [];

              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(i);
                }
              } else {
                pages.push(1);
                if (current > 4) {
                  pages.push('...');
                }
                const start = Math.max(2, current - 1);
                const end = Math.min(totalPages - 1, current + 1);
                for (let i = start; i <= end; i++) {
                  if (i !== 1 && i !== totalPages) {
                    pages.push(i);
                  }
                }
                if (current < totalPages - 3) {
                  pages.push('...');
                }
                if (totalPages > 1) {
                  pages.push(totalPages);
                }
              }

              return pages.map((page, index) => {
                if (page === '...') {
                  return (
                    <span key={`ellipsis-${index}`} className="px-2 py-1 text-gray-400">
                      ...
                    </span>
                  );
                }

                return (
                  <Button
                    key={page}
                    variant={page === current ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page as number)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                );
              });
            })()}
          </div>

          {/* Next Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === pagination.pages}
          >
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Last Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.pages)}
            disabled={currentPage === pagination.pages}
            className="hidden sm:flex"
          >
            Last
          </Button>
        </div>
      )}
    </div>
  );
};
