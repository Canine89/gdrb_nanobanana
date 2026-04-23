"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { PromptTable } from '@/components/PromptTable';
import { PromptCard } from '@/components/PromptCard';
import { SpecialPromptCard } from '@/components/SpecialPromptCard';
import { RedeemCodeModal } from '@/components/RedeemCodeModal';
import { Pagination } from '@/components/Pagination';
import { StickyUtilityBar } from '@/components/StickyUtilityBar';
import { BookAdCard } from '@/components/BookAdCard';
import { MasonryGrid } from '@/components/MasonryGrid';
import { usePromptData } from '@/hooks/usePromptData';
import { useSpecialPromptData } from '@/hooks/useSpecialPromptData';
import { useSuper82PromptData } from '@/hooks/useSuper82PromptData';
import type { PromptCard as PromptCardType } from '@/types';

export default function Home() {
  const { promptCards, loading, error } = usePromptData();
  const { promptCards: specialCards, loading: specialLoading, error: specialError } = useSpecialPromptData();
  const { promptCards: super82Cards, loading: super82Loading, error: super82Error } = useSuper82PromptData();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [redeemCodeModalOpen, setRedeemCodeModalOpen] = useState(false);
  const [isRedeemCodeActivated, setIsRedeemCodeActivated] = useState(false);
  const [isRedeemCode82Activated, setIsRedeemCode82Activated] = useState(false);

  const filteredSpecialCards = useMemo(() => {
    if (!searchQuery.trim()) return specialCards;
    const query = searchQuery.toLowerCase();
    return specialCards.filter((card: PromptCardType) => {
      const title = card.title?.toLowerCase() || '';
      const tool = card.beforeItems.length > 0 && card.beforeItems[0].tool
        ? card.beforeItems[0].tool.toLowerCase()
        : '';
      const beforeMatches = card.beforeItems.some(item =>
        item.english.toLowerCase().includes(query) ||
        item.korean.toLowerCase().includes(query)
      );
      const afterMatches = card.afterItems.some(item =>
        item.english.toLowerCase().includes(query) ||
        item.korean.toLowerCase().includes(query)
      );
      return title.includes(query) || tool.includes(query) || beforeMatches || afterMatches;
    });
  }, [specialCards, searchQuery]);

  const filteredSuperCards = useMemo(() => {
    if (!isRedeemCodeActivated) return [];
    if (!searchQuery.trim()) return promptCards;
    const query = searchQuery.toLowerCase();
    return promptCards.filter((card: PromptCardType) => {
      const title = card.title?.toLowerCase() || '';
      const tool = card.beforeItems.length > 0 && card.beforeItems[0].tool
        ? card.beforeItems[0].tool.toLowerCase()
        : '';
      const beforeMatches = card.beforeItems.some(item =>
        item.english.toLowerCase().includes(query) ||
        item.korean.toLowerCase().includes(query)
      );
      const afterMatches = card.afterItems.some(item =>
        item.english.toLowerCase().includes(query) ||
        item.korean.toLowerCase().includes(query)
      );
      return title.includes(query) || tool.includes(query) || beforeMatches || afterMatches;
    });
  }, [promptCards, searchQuery, isRedeemCodeActivated]);

  const filteredSuper82Cards = useMemo(() => {
    if (!isRedeemCode82Activated) return [];
    if (!searchQuery.trim()) return super82Cards;
    const query = searchQuery.toLowerCase();
    return super82Cards.filter((card: PromptCardType) => {
      const title = card.title?.toLowerCase() || '';
      const tool = card.beforeItems.length > 0 && card.beforeItems[0].tool
        ? card.beforeItems[0].tool.toLowerCase()
        : '';
      const beforeMatches = card.beforeItems.some(item =>
        item.english.toLowerCase().includes(query) ||
        item.korean.toLowerCase().includes(query)
      );
      const afterMatches = card.afterItems.some(item =>
        item.english.toLowerCase().includes(query) ||
        item.korean.toLowerCase().includes(query)
      );
      return title.includes(query) || tool.includes(query) || beforeMatches || afterMatches;
    });
  }, [super82Cards, searchQuery, isRedeemCode82Activated]);

  const allFilteredCards = useMemo(
    () => [...filteredSuperCards, ...filteredSuper82Cards, ...filteredSpecialCards],
    [filteredSuperCards, filteredSuper82Cards, filteredSpecialCards]
  );

  const totalPages = Math.ceil(allFilteredCards.length / itemsPerPage);
  const paginatedCards = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return allFilteredCards.slice(startIndex, startIndex + itemsPerPage);
  }, [allFilteredCards, currentPage, itemsPerPage]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  useEffect(() => {
    const checkRedeemCode = () => {
      setIsRedeemCodeActivated(localStorage.getItem('redeemCodeActivated') === 'true');
      setIsRedeemCode82Activated(localStorage.getItem('redeemCode82Activated') === 'true');
    };
    checkRedeemCode();
    window.addEventListener('storage', checkRedeemCode);
    return () => window.removeEventListener('storage', checkRedeemCode);
  }, []);

  const handleRedeemSuccess = () => {
    // 새로 활성화된 코드에 해당하는 시트를 fetch하기 위해 리로드
    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-background">
      <StickyUtilityBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
        onOpenRedeemModal={() => setRedeemCodeModalOpen(true)}
      />

      <div className="container mx-auto px-6 py-10 sm:py-14 max-w-7xl 2xl:max-w-[1600px]">
        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_280px] xl:gap-10">
          <div className="min-w-0">
            {/* 헤더 — editorial layout */}
            <header className="mb-10 sm:mb-14">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shadow-ring-deep">
                  <Image
                    src="/ssangcho.png"
                    alt="쌩초"
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.12em] text-claude-stone mb-2 font-medium">
                    쌩초 × 나노바나나
                  </p>
                  <h1 className="claude-headline text-3xl sm:text-4xl lg:text-5xl text-foreground">
                    나노바나나 AI <span className="text-primary">슈퍼 프롬프트</span>
                  </h1>
                </div>
              </div>

              {/* Marketing subtitle — magazine lede */}
              <div className="mt-8 max-w-2xl">
                <p className="claude-body text-base text-claude-olive">
                  프롬프트 입력하느라 고생하지 마세요.{' '}
                  <span className="text-foreground">
                    쌩초의{' '}
                    <strong className="font-serif italic font-medium text-primary shimmer-text">
                      프롬프트를
                    </strong>
                  </span>{' '}
                  그대로 복사해서 바로 써보세요.
                </p>
              </div>

              {searchQuery && (
                <p className="text-sm text-claude-stone mt-5">
                  <span className="text-foreground font-medium">{allFilteredCards.length}개</span>의 결과를 찾았습니다
                </p>
              )}
            </header>

            {/* 모바일·태블릿 인라인 도서 광고 — xl 미만 */}
            <BookAdCard variant="inline" className="mb-10 xl:hidden" />

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-claude-ivory shadow-ring-warm text-destructive text-sm">
                {error}
              </div>
            )}

            {specialError && (
              <div className="mb-6 p-4 rounded-lg bg-claude-ivory shadow-ring-warm text-destructive text-sm">
                {specialError}
              </div>
            )}

            {/* Card grid — true masonry (shortest-column-first) */}
            {loading ? (
              <PromptTable promptCards={[]} loading={true} />
            ) : (
              <MasonryGrid
                cards={paginatedCards}
                renderCard={(card) => {
                  if (card.id.startsWith('super82-')) {
                    return <SpecialPromptCard card={card} isSuper sourceBadge="82제" />;
                  }
                  if (card.id.startsWith('super-')) {
                    return <SpecialPromptCard card={card} isSuper sourceBadge="71제" />;
                  }
                  return <PromptCard card={card} />;
                }}
              />
            )}

            {/* Pagination — placed below grid, the natural "next page" position */}
            {!loading && allFilteredCards.length > 0 && (
              <div className="mt-10 flex items-center justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>

          {/* 데스크톱 사이드바 도서 광고 — xl 이상에서만 sticky */}
          <aside className="hidden xl:block xl:sticky xl:top-24 xl:self-start">
            <BookAdCard variant="sidebar" />
          </aside>
        </div>

        <RedeemCodeModal
          open={redeemCodeModalOpen}
          onOpenChange={setRedeemCodeModalOpen}
          onRedeemSuccess={handleRedeemSuccess}
        />
      </div>
    </main>
  );
}
