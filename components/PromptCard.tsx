"use client";

import React, { useState, useEffect } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CommentModal } from './CommentModal';
import { recordClick, subscribeToPromptStats } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { PromptCard as PromptCardType, PromptStats } from '@/types';
import { MessageSquare, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromptCardProps {
  card: PromptCardType;
}

function getScoreText(clickCount: number): string {
  if (clickCount === 0) return '0';
  return clickCount.toString();
}

function renderBoldText(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // 이전 텍스트 추가
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    // 볼드 텍스트 추가
    parts.push(<strong key={match.index}>{match[1]}</strong>);
    lastIndex = regex.lastIndex;
  }

  // 남은 텍스트 추가
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? <>{parts}</> : text;
}

function renderTitle(title: string): React.ReactNode {
  // "미친 활용 XX" 또는 "스페셜 프롬프트 XX" 패턴 매칭 (XX는 숫자)
  const match = title.match(/^((?:미친 활용|스페셜 프롬프트)\s*\d+)\s*(.*)$/);

  if (match) {
    const [, prefix, rest] = match;
    return (
      <>
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold mr-2 bg-primary/20 text-primary border border-primary/40">
          {prefix}
        </span>
        <span>{rest}</span>
      </>
    );
  }

  return title;
}

export function PromptCard({ card }: PromptCardProps) {
  const [stats, setStats] = useState<PromptStats | null>(null);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const { userId } = useAuth();

  useEffect(() => {
    const unsubscribe = subscribeToPromptStats(card.id, (updatedStats) => {
      setStats(updatedStats);
    });

    return () => unsubscribe();
  }, [card.id]);

  const handleCopy = async (text: string, type: string) => {
    if (!userId) {
      toast.error('인증 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type}가 클립보드에 복사되었습니다!`);
      
      // 클릭 이벤트 기록 - 카드 ID만 사용하여 통계 집계
      await recordClick(card.id, userId);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('복사에 실패했습니다.');
    }
  };

  const clickCount = stats?.clickCount || 0;

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="group relative bg-card rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col border border-border">
            {/* 헤더 */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold mb-1 line-clamp-2 text-card-foreground flex flex-wrap items-center">
                  {renderTitle(card.title)}
                </h3>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-primary text-primary-foreground text-xs font-medium shrink-0">
                      <span>{getScoreText(clickCount)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{clickCount}명이 사용했어요!</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Before 섹션 */}
            {card.beforeItems.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-foreground">Before</span>
                  <div className="flex-1 h-px bg-border"></div>
                </div>
                <div className="space-y-4">
                  {card.beforeItems.map((item, index) => (
                    <div key={item.id} className={index > 0 ? 'pt-3 border-t border-border/50' : ''}>
                      {/* Before 도구 배지 */}
                      {item.tool && (
                        <div className="mb-2 flex flex-wrap gap-2">
                          {item.tool.split('/').map((tool, idx) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground border border-border">
                              {tool.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Before 이미지 */}
                      {item.image && (
                        <div className="mb-3">
                          <img
                            src={item.image}
                            alt="Before"
                            className="w-full rounded-lg border border-border shadow-sm"
                          />
                        </div>
                      )}
                      {item.english && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-muted-foreground">English</span>
                            <div className="flex items-center gap-2">
                              {item.tip && (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
                                    >
                                      🐝 꿀팁
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80">
                                    <div className="space-y-2">
                                      <h4 className="font-medium text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">🐝 꿀팁</h4>
                                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.tip}</p>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(item.english, 'before-english');
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded transition-colors bg-secondary text-secondary-foreground hover:opacity-80 min-h-[32px]"
                              >
                                <Copy className="h-3 w-3" />
                                복사
                              </button>
                            </div>
                          </div>
                          <div className="p-3 rounded border border-border bg-muted text-xs font-mono whitespace-pre-wrap break-words text-foreground">
                            {renderBoldText(item.english)}
                          </div>
                        </div>
                      )}
                      {item.korean && (
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-muted-foreground">한국어</span>
                            <div className="flex items-center gap-2">
                              {item.tip && !item.english && (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
                                    >
                                      🐝 꿀팁
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80">
                                    <div className="space-y-2">
                                      <h4 className="font-medium text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">🐝 꿀팁</h4>
                                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.tip}</p>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(item.korean, 'before-korean');
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded transition-colors bg-secondary text-secondary-foreground hover:opacity-80 min-h-[32px]"
                              >
                                <Copy className="h-3 w-3" />
                                복사
                              </button>
                            </div>
                          </div>
                          <div className="p-3 rounded border border-border bg-muted text-xs whitespace-pre-wrap break-words text-foreground">
                            {renderBoldText(item.korean)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* After 섹션 */}
            {card.afterItems.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-foreground">After</span>
                  <div className="flex-1 h-px bg-border"></div>
                </div>
                <div className="space-y-4">
                  {card.afterItems.map((item, index) => (
                    <div key={item.id} className={index > 0 ? 'pt-3 border-t border-border/50' : ''}>
                      {/* After 도구 배지 */}
                      {item.tool && (
                        <div className="mb-2 flex flex-wrap gap-2">
                          {item.tool.split('/').map((tool, idx) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground border border-border">
                              {tool.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* After 이미지 */}
                      {item.image && (
                        <div className="mb-3">
                          <img
                            src={item.image}
                            alt="After"
                            className="w-full rounded-lg border border-border shadow-sm"
                          />
                        </div>
                      )}
                      {item.english && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-muted-foreground">English</span>
                            <div className="flex items-center gap-2">
                              {item.tip && (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
                                    >
                                      🐝 꿀팁
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80">
                                    <div className="space-y-2">
                                      <h4 className="font-medium text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">🐝 꿀팁</h4>
                                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.tip}</p>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(item.english, 'after-english');
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded transition-colors bg-primary text-primary-foreground hover:opacity-80 min-h-[32px]"
                              >
                                <Copy className="h-3 w-3" />
                                복사
                              </button>
                            </div>
                          </div>
                          <div className="p-3 rounded border border-border bg-muted text-xs font-mono whitespace-pre-wrap break-words text-foreground">
                            {renderBoldText(item.english)}
                          </div>
                        </div>
                      )}
                      {item.korean && (
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs text-muted-foreground">한국어</span>
                            <div className="flex items-center gap-2">
                              {item.tip && !item.english && (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
                                    >
                                      🐝 꿀팁
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-80">
                                    <div className="space-y-2">
                                      <h4 className="font-medium text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">🐝 꿀팁</h4>
                                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.tip}</p>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(item.korean, 'after-korean');
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded transition-colors bg-primary text-primary-foreground hover:opacity-80 min-h-[32px]"
                              >
                                <Copy className="h-3 w-3" />
                                복사
                              </button>
                            </div>
                          </div>
                          <div className="p-3 rounded border border-border bg-muted text-xs whitespace-pre-wrap break-words text-foreground">
                            {renderBoldText(item.korean)}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 푸터 */}
            <div className="pt-4 border-t border-border flex items-center justify-end mt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCommentModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs rounded transition-colors text-muted-foreground hover:text-foreground hover:bg-muted min-h-[36px]"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                댓글
              </button>
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => setCommentModalOpen(true)}>
            <MessageSquare className="h-4 w-4 mr-2" />
            댓글 보기
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <CommentModal
        promptId={card.id}
        open={commentModalOpen}
        onOpenChange={setCommentModalOpen}
      />
    </>
  );
}

