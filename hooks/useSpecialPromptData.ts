import { useState, useEffect } from 'react';
import type { SheetData, PromptCard } from '@/types';
import { convertGoogleDriveUrl } from '@/lib/utils';

export function useSpecialPromptData() {
  const [data, setData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 스페셜 프롬프트는 항상 로드 (로그인 시 기본 표시)
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
          // 새 열 구조: A:제목, B:Before이미지, C:BeforeEng, D:BeforeKor, E:Before꿀팁, F:BeforeTool, G:After이미지, H:AfterEng, I:AfterKor, J:After꿀팁, K:AfterTool
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

