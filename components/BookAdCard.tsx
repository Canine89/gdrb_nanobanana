"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BookAdCardProps {
  variant: 'inline' | 'sidebar';
  className?: string;
}

const BOOK_URL = 'https://www.yes24.com/product/goods/167400825';
const BOOK_TITLE_LINE_1 = '나노바나나 AI 비포&애프터';
const BOOK_TITLE_LINE_2 = '미친 활용법 71제';
const BOOK_TITLE = `${BOOK_TITLE_LINE_1} ${BOOK_TITLE_LINE_2}`;
const BOOK_SUBTITLE = '클릭 몇 번으로 이렇게 달라진다고! 쌩초의 비포/애프터 레시피 대방출!';
const BOOK_COVER = '/nanobanana_cover_3d.png';

export function BookAdCard({ variant, className }: BookAdCardProps) {
  const openBookLink = () => window.open(BOOK_URL, '_blank');

  const baseSurface =
    'bg-claude-ivory rounded-2xl shadow-ring-warm hover:shadow-whisper transition-shadow duration-300';

  if (variant === 'sidebar') {
    return (
      <div className={cn(baseSurface, 'p-5 flex flex-col items-center text-center', className)}>
        <p className="text-[10px] uppercase tracking-[0.14em] text-claude-stone font-medium mb-4">
          원작 도서
        </p>
        <div className="relative mb-5">
          <Image
            src={BOOK_COVER}
            alt={`${BOOK_TITLE} 도서 표지`}
            width={120}
            height={160}
            className="object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.14)]"
          />
        </div>
        <p className="font-medium text-sm text-foreground leading-snug mb-2">
          {BOOK_TITLE_LINE_1}
          <br />
          {BOOK_TITLE_LINE_2}
        </p>
        <p className="text-xs text-claude-olive leading-relaxed mb-5">
          {BOOK_SUBTITLE}
        </p>
        <Button
          size="sm"
          variant="default"
          className="w-full"
          onClick={openBookLink}
        >
          도서 구매
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(baseSurface, 'p-4 sm:p-5', className)}>
      <div className="flex items-center gap-4 sm:gap-5">
        <div className="relative flex-shrink-0">
          <Image
            src={BOOK_COVER}
            alt={`${BOOK_TITLE} 도서 표지`}
            width={64}
            height={84}
            className="object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)]"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-base sm:text-lg text-foreground leading-tight">
            {BOOK_TITLE_LINE_1}
            <br />
            {BOOK_TITLE_LINE_2}
          </p>
          <p className="text-xs sm:text-sm text-claude-olive mt-1.5 hidden sm:block leading-relaxed">
            {BOOK_SUBTITLE}
          </p>
        </div>
        <Button
          size="sm"
          variant="default"
          className="flex-shrink-0"
          onClick={openBookLink}
        >
          도서 구매
        </Button>
      </div>
    </div>
  );
}
