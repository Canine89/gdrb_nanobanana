"use client";

import { useEffect, useMemo, useState } from 'react';
import type { PromptCard as PromptCardType } from '@/types';

interface MasonryGridProps {
  cards: PromptCardType[];
  renderCard: (card: PromptCardType) => React.ReactNode;
  gap?: number;
}

function estimateHeight(card: PromptCardType): number {
  // Rough pixel estimate used only for shortest-column-first packing.
  // Order-of-magnitude accuracy is sufficient; perfect measurement is unnecessary.
  let h = 180; // header (title/tag) + footer (댓글) + paddings + dividers
  const items = [...card.beforeItems, ...card.afterItems];
  for (const item of items) {
    h += 40; // section divider + control row
    if (item.tool) h += 34;
    if (item.image) h += 260;
    if (item.english) h += 48 + Math.ceil(item.english.length / 34) * 19;
    if (item.korean) h += 48 + Math.ceil(item.korean.length / 22) * 22;
  }
  return h;
}

function getColumnCount(width: number): number {
  if (width <= 640) return 1;
  if (width <= 768) return 2;
  if (width <= 1536) return 3;
  return 4;
}

function distribute<T>(cards: T[], heights: number[], columnCount: number): T[][] {
  const columns = Array.from({ length: columnCount }, () => ({ items: [] as T[], h: 0 }));
  cards.forEach((card, i) => {
    let minIdx = 0;
    for (let k = 1; k < columnCount; k++) {
      if (columns[k].h < columns[minIdx].h) minIdx = k;
    }
    columns[minIdx].items.push(card);
    columns[minIdx].h += heights[i];
  });
  return columns.map((c) => c.items);
}

export function MasonryGrid({ cards, renderCard, gap = 20 }: MasonryGridProps) {
  const [columnCount, setColumnCount] = useState<number>(() => {
    if (typeof window !== 'undefined') return getColumnCount(window.innerWidth);
    return 3;
  });

  useEffect(() => {
    const update = () => setColumnCount(getColumnCount(window.innerWidth));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const effectiveColumnCount = Math.max(1, Math.min(columnCount, cards.length));

  const columns = useMemo(() => {
    if (effectiveColumnCount <= 1) return [cards];
    const heights = cards.map(estimateHeight);
    return distribute(cards, heights, effectiveColumnCount);
  }, [cards, effectiveColumnCount]);

  return (
    <div className="flex items-start" style={{ gap: `${gap}px` }}>
      {columns.map((items, i) => (
        <div
          key={i}
          className="flex-1 min-w-0 flex flex-col"
          style={{ gap: `${gap}px` }}
        >
          {items.map((card) => (
            <div key={card.id}>{renderCard(card)}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
