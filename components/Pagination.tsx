"use client";

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="min-h-[44px] px-4"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline ml-1">이전</span>
      </Button>

      {/* 데스크톱: 페이지 번호 표시 */}
      <div className="hidden sm:flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          if (
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1)
          ) {
            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                className="min-w-[40px]"
              >
                {page}
              </Button>
            );
          } else if (page === currentPage - 2 || page === currentPage + 2) {
            return <span key={page} className="px-2">...</span>;
          }
          return null;
        })}
      </div>

      {/* 모바일: 현재 페이지 표시 */}
      <div className="sm:hidden px-3 py-2 bg-muted rounded-md text-sm font-medium">
        {currentPage} / {totalPages}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="min-h-[44px] px-4"
      >
        <span className="hidden sm:inline mr-1">다음</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

