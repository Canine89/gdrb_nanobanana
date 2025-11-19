import { useState, useEffect } from 'react';
import type { SheetData, PromptCard } from '@/types';

export function useSpecialPromptData() {
  const [data, setData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 리딤코드 활성화 여부 확인
    const isActivated = localStorage.getItem('redeemCodeActivated') === 'true';
    
    if (!isActivated) {
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch('/api/sheets/special');
        if (!response.ok) {
          throw new Error('Failed to fetch special sheet data');
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

  // 헤더 기반으로 구조화된 카드 배열로 변환
  // 동일한 제목을 가진 행들을 그룹화하여 하나의 카드로 병합
  const promptCards: PromptCard[] = data?.values
    ? (() => {
        const rows = data.values;
        if (rows.length < 2) return []; // 헤더와 최소 1개 데이터 행 필요

        const headers = rows[0];
        const dataRows = rows.slice(1);

        // 동일한 제목을 가진 행들을 Map으로 그룹화
        const titleGroups = new Map<string, PromptCard>();

        dataRows.forEach((row, rowIndex) => {
          const title = (row[0] || '').trim();
          if (!title) return; // 제목이 없으면 건너뛰기

          if (!titleGroups.has(title)) {
            // 새로운 제목이면 카드 생성
            titleGroups.set(title, {
              id: `special-title-${title.replace(/\s+/g, '-')}-${rowIndex + 1}`,
              title,
              beforeItems: [],
              afterItems: [],
              rowIndex: rowIndex + 1,
            });
          }

          const card = titleGroups.get(title)!;

          // before/after 항목 추가 (값이 있을 때만)
          const beforeEnglish = (row[1] || '').trim();
          const beforeKorean = (row[2] || '').trim();
          const beforeTool = (row[3] || '').trim();
          const afterEnglish = (row[4] || '').trim();
          const afterKorean = (row[5] || '').trim();
          const afterTool = (row[6] || '').trim();

          if (beforeEnglish || beforeKorean) {
            card.beforeItems.push({
              id: `${card.id}-before-${card.beforeItems.length}`,
              english: beforeEnglish,
              korean: beforeKorean,
              tool: beforeTool || undefined,
            });
          }

          if (afterEnglish || afterKorean) {
            card.afterItems.push({
              id: `${card.id}-after-${card.afterItems.length}`,
              english: afterEnglish,
              korean: afterKorean,
              tool: afterTool || undefined,
            });
          }
        });

        return Array.from(titleGroups.values());
      })()
    : [];

  return { data, promptCards, loading, error };
}

