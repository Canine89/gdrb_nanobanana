"use client";

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1.5">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-9 px-3"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline ml-0.5">이전</span>
      </Button>

      <div className="hidden sm:flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          if (
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1)
          ) {
            const isActive = currentPage === page;
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={cn(
                  'inline-flex items-center justify-center min-w-[36px] h-9 px-2.5 rounded-md text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-ring-brand'
                    : 'bg-transparent text-claude-olive hover:bg-claude-sand/70 hover:text-foreground'
                )}
              >
                {page}
              </button>
            );
          } else if (page === currentPage - 2 || page === currentPage + 2) {
            return <span key={page} className="px-1 text-claude-stone">…</span>;
          }
          return null;
        })}
      </div>

      <div className="sm:hidden px-3 h-9 inline-flex items-center bg-claude-sand rounded-md text-sm font-medium text-claude-charcoal">
        {currentPage} / {totalPages}
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-9 px-3"
      >
        <span className="hidden sm:inline mr-0.5">다음</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
