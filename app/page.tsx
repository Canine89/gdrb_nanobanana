"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Masonry from 'react-masonry-css';
import { PromptTable } from '@/components/PromptTable';
import { PromptCard } from '@/components/PromptCard';
import { SpecialPromptCard } from '@/components/SpecialPromptCard';
import { RedeemCodeModal } from '@/components/RedeemCodeModal';
import { Pagination } from '@/components/Pagination';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePromptData } from '@/hooks/usePromptData';
import { useSpecialPromptData } from '@/hooks/useSpecialPromptData';
import { Search, Gift } from 'lucide-react';
import type { PromptCard as PromptCardType } from '@/types';

export default function Home() {
  const { promptCards, loading, error } = usePromptData();
  const { promptCards: specialCards, loading: specialLoading, error: specialError } = useSpecialPromptData();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [redeemCodeModalOpen, setRedeemCodeModalOpen] = useState(false);
  const [isRedeemCodeActivated, setIsRedeemCodeActivated] = useState(false);
  
  // 스페셜 프롬프트 검색 필터링 (항상 표시 - 로그인 시 기본)
  const filteredSpecialCards = useMemo(() => {
    if (!searchQuery.trim()) {
      return specialCards;
    }

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

      return (
        title.includes(query) ||
        tool.includes(query) ||
        beforeMatches ||
        afterMatches
      );
    });
  }, [specialCards, searchQuery]);

  // 슈퍼 프롬프트 검색 필터링 (리딤코드 활성화 시에만 표시)
  const filteredSuperCards = useMemo(() => {
    if (!isRedeemCodeActivated) return [];

    if (!searchQuery.trim()) {
      return promptCards;
    }

    const query = searchQuery.toLowerCase();
    return promptCards.filter((card: PromptCardType) => {
      const title = card.title?.toLowerCase() || '';

      // 첫 번째 beforeItem의 tool 검색
      const tool = card.beforeItems.length > 0 && card.beforeItems[0].tool
        ? card.beforeItems[0].tool.toLowerCase()
        : '';

      // 모든 beforeItems 검색
      const beforeMatches = card.beforeItems.some(item =>
        item.english.toLowerCase().includes(query) ||
        item.korean.toLowerCase().includes(query)
      );

      // 모든 afterItems 검색
      const afterMatches = card.afterItems.some(item =>
        item.english.toLowerCase().includes(query) ||
        item.korean.toLowerCase().includes(query)
      );

      return (
        title.includes(query) ||
        tool.includes(query) ||
        beforeMatches ||
        afterMatches
      );
    });
  }, [promptCards, searchQuery, isRedeemCodeActivated]);

  // 통합된 카드 배열 (슈퍼 프롬프트가 앞에, 스페셜 프롬프트가 뒤에 배치)
  const allFilteredCards = useMemo(() => {
    return [...filteredSuperCards, ...filteredSpecialCards];
  }, [filteredSuperCards, filteredSpecialCards]);
  
  // 페이지네이션 (첫 페이지에 표지가 있으므로 카드는 itemsPerPage - 1개, 나머지는 itemsPerPage개)
  const totalPages = Math.ceil((allFilteredCards.length + 1) / itemsPerPage); // 표지 포함
  const paginatedCards = useMemo(() => {
    if (currentPage === 1) {
      // 첫 페이지: 표지 1개 + 카드 (itemsPerPage - 1)개
      return allFilteredCards.slice(0, itemsPerPage - 1);
    } else {
      // 나머지 페이지: 카드 itemsPerPage개 (표지 제외하고 계산)
      const startIndex = (currentPage - 1) * itemsPerPage - 1; // 첫 페이지의 표지 자리 제외
      return allFilteredCards.slice(startIndex, startIndex + itemsPerPage);
    }
  }, [allFilteredCards, currentPage, itemsPerPage]);
  
  // 검색어 변경 시 첫 페이지로 이동
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };
  
  // 페이지당 개수 변경 시 첫 페이지로 이동
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };
  
  // 리딤코드 활성화 상태 확인
  useEffect(() => {
    const checkRedeemCode = () => {
      const activated = localStorage.getItem('redeemCodeActivated') === 'true';
      setIsRedeemCodeActivated(activated);
    };
    
    checkRedeemCode();
    // storage 이벤트 리스너 추가 (다른 탭에서 변경 시 반영)
    window.addEventListener('storage', checkRedeemCode);
    
    return () => {
      window.removeEventListener('storage', checkRedeemCode);
    };
  }, []);

  const handleRedeemSuccess = () => {
    setIsRedeemCodeActivated(true);
    // 페이지 새로고침하여 스페셜 프롬프트 데이터 로드
    window.location.reload();
  };

  const cardCount = promptCards.length;
  const formattedCount = cardCount.toString().padStart(2, '0');

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* 헤더 */}
        <div className="mb-8 sm:mb-12">
          {/* 모바일: 세로 배치, 데스크톱: 가로 배치 */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 mb-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-primary/40 shadow-lg ring-2 ring-primary/20">
                <Image
                  src="/ssangcho.png"
                  alt="쌩초"
                  width={80}
                  height={80}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground font-noto-sans-kr">
                나노바나나 AI 슈퍼 프롬프트 🍌
              </h1>
            </div>

            {/* 검색 입력 및 리딤코드 버튼 */}
            <div className="flex flex-col sm:flex-row sm:flex-shrink-0 gap-2 sm:gap-2 sm:items-center">
              {!isRedeemCodeActivated && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRedeemCodeModalOpen(true)}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <Gift className="h-4 w-4" />
                  리딤코드
                </Button>
              )}
              <div className="w-full sm:w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="프롬프트 검색..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* 마케팅 문구 */}
          <div className="max-w-2xl px-6 py-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm text-foreground">
              프롬프트 입력하느라 고생하지 마세요! 쌩초의 <strong className="font-bold shimmer-text text-primary">슈퍼 프롬프트 시트 {formattedCount}</strong>를 쉽게 사용해보세요!
            </p>
          </div>
          
          {searchQuery && (
            <p className="text-sm text-muted-foreground mt-3">
              {allFilteredCards.length}개의 결과를 찾았습니다
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg border border-destructive/50 bg-destructive/5 text-destructive text-sm">
            {error}
          </div>
        )}

        {specialError && (
          <div className="mb-6 p-4 rounded-lg border border-destructive/50 bg-destructive/5 text-destructive text-sm">
            {specialError}
          </div>
        )}

        {/* 페이지당 개수 선택 및 페이지네이션 */}
        {!loading && allFilteredCards.length > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">페이지당 표시:</span>
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="9">9</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* 카드 그리드 (표지 + 카드들) - Masonry 레이아웃 */}
        {loading ? (
          <PromptTable promptCards={[]} loading={true} />
        ) : (
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
            {/* 도서 표지 - 첫 번째 위치 (첫 페이지에만 표시) */}
            {currentPage === 1 && (
              <div className="group relative bg-card rounded-lg p-3 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col border border-border mb-4">
                {/* 표지 이미지 */}
                <div className="relative w-full flex items-center justify-center mb-3">
                  <Image 
                    src="/nanobanana_cover_3d.png" 
                    alt="나노바나나 AI 비포&애프터 미친 활용법 71제 도서 표지" 
                    width={400}
                    height={533}
                    className="object-contain w-full drop-shadow-xl"
                    priority
                  />
                </div>
                
                {/* 설명 글 */}
                <div className="space-y-1.5 mb-3">
                  <p className="text-xs font-medium text-foreground leading-tight">
                    ★ 클릭 몇 번으로 이렇게 달라진다고!
                  </p>
                  <p className="text-xs font-medium text-foreground leading-tight">
                    ★ 나노바나나를 200% 활용하는 &apos;쌩초&apos;의 비포/애프터 레시피 대방출!
                  </p>
                  <p className="text-xs font-medium text-foreground leading-tight">
                    ★ 포토샵 없이, 스튜디오 촬영 없이 만드는 71가지 고퀄리티 사진
                  </p>
                </div>
                
                {/* 구매 버튼 */}
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                  onClick={() => {
                    window.open('https://www.yes24.com/product/goods/167400825', '_blank');
                  }}
                >
                  도서 구매하기
                </Button>
              </div>
            )}
            
            {/* 실제 카드들 (스페셜 프롬프트가 앞에, 슈퍼 프롬프트가 뒤에 배치) */}
            {paginatedCards.map((card) => {
              // 슈퍼 프롬프트인지 확인 (ID에 'super-'가 포함되어 있음)
              const isSuper = card.id.startsWith('super-');
              return (
                <div key={card.id} className="mb-4">
                  {isSuper ? (
                    <SpecialPromptCard card={card} isSuper />
                  ) : (
                    <PromptCard card={card} />
                  )}
                </div>
              );
            })}
          </Masonry>
        )}

        {/* 리딤코드 모달 */}
        <RedeemCodeModal
          open={redeemCodeModalOpen}
          onOpenChange={setRedeemCodeModalOpen}
          onRedeemSuccess={handleRedeemSuccess}
        />
      </div>
    </main>
  );
}

