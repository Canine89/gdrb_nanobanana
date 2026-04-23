import { useState, useEffect } from 'react';
import type { SheetData, PromptCard } from '@/types';
import { convertGoogleDriveUrl } from '@/lib/utils';

export function useSuper82PromptData() {
  const [data, setData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 82제 슈퍼 프롬프트는 'GDRB2026-banana-2' 리딤코드 활성화 시에만 로드
    const isActivated = localStorage.getItem('redeemCode82Activated') === 'true';

    if (!isActivated) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch('/api/sheets/82je');
        if (!response.ok) {
          throw new Error('Failed to fetch 82제 sheet data');
        }
        const sheetData = await response.json();
        setData(sheetData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // 헤더 기반 구조화 (usePromptData와 동일 규격, ID prefix만 다름)
  const promptCards: PromptCard[] = data?.values
    ? (() => {
        const rows = data.values;
        if (rows.length < 2) return [];

        const dataRows = rows.slice(1);
        const titleGroups = new Map<string, PromptCard>();

        dataRows.forEach((row, rowIndex) => {
          const title = (row[0] || '').trim();
          if (!title) return;

          if (!titleGroups.has(title)) {
            titleGroups.set(title, {
              id: `super82-${title.replace(/\s+/g, '-')}-${rowIndex + 1}`,
              title,
              beforeItems: [],
              afterItems: [],
              rowIndex: rowIndex + 1,
            });
          }

          const card = titleGroups.get(title)!;

          // 열 구조: A:제목, B:Before이미지, C:BeforeEng, D:BeforeKor, E:Before꿀팁, F:BeforeTool,
          // G:After이미지, H:AfterEng, I:AfterKor, J:After꿀팁, K:AfterTool
          const beforeImage = (row[1] || '').trim();
          const beforeEnglish = (row[2] || '').trim();
          const beforeKorean = (row[3] || '').trim();
          const beforeTip = (row[4] || '').trim();
          const beforeTool = (row[5] || '').trim();
          const afterImage = (row[6] || '').trim();
          const afterEnglish = (row[7] || '').trim();
          const afterKorean = (row[8] || '').trim();
          const afterTip = (row[9] || '').trim();
          const afterTool = (row[10] || '').trim();

          if (beforeEnglish || beforeKorean || beforeImage) {
            card.beforeItems.push({
              id: `${card.id}-before-${card.beforeItems.length}`,
              english: beforeEnglish,
              korean: beforeKorean,
              tool: beforeTool || undefined,
              image: convertGoogleDriveUrl(beforeImage) || undefined,
              tip: beforeTip || undefined,
            });
          }

          if (afterEnglish || afterKorean || afterImage) {
            card.afterItems.push({
              id: `${card.id}-after-${card.afterItems.length}`,
              english: afterEnglish,
              korean: afterKorean,
              tool: afterTool || undefined,
              image: convertGoogleDriveUrl(afterImage) || undefined,
              tip: afterTip || undefined,
            });
          }
        });

        return Array.from(titleGroups.values());
      })()
    : [];

  return { data, promptCards, loading, error };
}
