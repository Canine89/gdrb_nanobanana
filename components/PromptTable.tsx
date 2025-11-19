"use client";

import Masonry from 'react-masonry-css';
import { PromptCard } from './PromptCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { PromptCard as PromptCardType } from '@/types';

interface PromptTableProps {
  promptCards: PromptCardType[];
  loading: boolean;
}

export function PromptTable({ promptCards, loading }: PromptTableProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-96 rounded-lg" />
        ))}
      </div>
    );
  }

  if (promptCards.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-muted-foreground">프롬프트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <Masonry
      breakpointCols={{
        default: 3,
        1024: 3,
        768: 2,
        640: 1,
      }}
      className="flex -ml-4 w-auto"
      columnClassName="pl-4 bg-clip-padding"
    >
      {promptCards.map((card) => (
        <div key={card.id} className="mb-4">
          <PromptCard card={card} />
        </div>
      ))}
    </Masonry>
  );
}

