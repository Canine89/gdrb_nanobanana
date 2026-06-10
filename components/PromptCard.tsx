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
import { toast } from 'sonner';
import type { PromptCard as PromptCardType, PromptStats } from '@/types';
import { MessageSquare, Copy, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromptCardProps {
  card: PromptCardType;
}

function getScoreText(clickCount: number): string {
  if (clickCount === 0) return '0';
  return clickCount.toString();
}

function parseTitle(title: string): { prefix: string | null; rest: string } {
  const match = title.match(/^((?:미친 활용|스페셜 프롬프트)\s*\d+)\s*(.*)$/);
  if (match) {
    return { prefix: match[1], rest: match[2].trim() };
  }
  return { prefix: null, rest: title };
}

function renderBoldText(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(<strong key={match.index} className="font-semibold text-foreground">{match[1]}</strong>);
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? <>{parts}</> : text;
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-[10px] uppercase tracking-[0.14em] font-medium text-claude-stone">
        {label}
      </span>
      <div className="flex-1 h-px bg-claude-border-cream" />
    </div>
  );
}

function ToolBadge({ tool }: { tool: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-claude-sand text-claude-charcoal">
      {tool}
    </span>
  );
}

function HoneyTipPopover({ tip }: { tip: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-1 px-2.5 h-8 text-xs rounded-md bg-claude-sand text-claude-charcoal hover:bg-claude-sand/80 shadow-ring-warm transition-colors"
        >
          🐝 꿀팁
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-claude-ivory border-claude-border-cream">
        <div className="space-y-2">
          <h4 className="font-serif text-sm text-primary flex items-center gap-1">🐝 꿀팁</h4>
          <p className="text-sm text-claude-olive leading-relaxed whitespace-pre-wrap">{tip}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function PromptCard({ card }: PromptCardProps) {
  const [stats, setStats] = useState<PromptStats | null>(null);
  const [commentModalOpen, setCommentModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToPromptStats(card.id, (updatedStats) => {
      setStats(updatedStats);
    });
    return () => unsubscribe();
  }, [card.id]);

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type}가 클립보드에 복사되었습니다!`);

      recordClick(card.id).catch((error) => {
        console.error('Error recording click:', error);
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('복사에 실패했습니다.');
    }
  };

  const clickCount = stats?.clickCount || 0;
  const { prefix, rest } = parseTitle(card.title);

  const renderItem = (
    item: PromptCardType['beforeItems'][number],
    copyKind: 'before' | 'after',
  ) => (
    <div>
      {item.tool && (
        <div className="mb-5 flex flex-wrap gap-1.5">
          {item.tool.split('/').map((tool, idx) => (
            <ToolBadge key={idx} tool={tool.trim()} />
          ))}
        </div>
      )}
      {item.image && (
        <div className="mb-6 overflow-hidden rounded-xl shadow-ring-warm">
          <img src={item.image} alt={copyKind} className="w-full block" />
        </div>
      )}
      {item.english && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-[0.14em] font-medium text-claude-stone">
              English
            </span>
            <div className="flex items-center gap-1.5">
              {item.tip && <HoneyTipPopover tip={item.tip} />}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(item.english, `${copyKind}-english`);
                }}
                className={
                  copyKind === 'after'
                    ? 'flex items-center gap-1 px-2.5 h-8 text-xs rounded-md bg-primary text-primary-foreground shadow-ring-brand hover:brightness-95 transition-all'
                    : 'flex items-center gap-1 px-2.5 h-8 text-xs rounded-md bg-claude-sand text-claude-charcoal hover:bg-claude-sand/80 shadow-ring-warm transition-colors'
                }
              >
                <Copy className="h-3 w-3" />
                복사
              </button>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-background text-[13px] font-mono leading-relaxed whitespace-pre-wrap break-words text-claude-charcoal shadow-ring-warm">
            {renderBoldText(item.english)}
          </div>
        </div>
      )}
      {item.korean && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-[0.14em] font-medium text-claude-stone">
              한국어
            </span>
            <div className="flex items-center gap-1.5">
              {item.tip && !item.english && <HoneyTipPopover tip={item.tip} />}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(item.korean, `${copyKind}-korean`);
                }}
                className={
                  copyKind === 'after'
                    ? 'flex items-center gap-1 px-2.5 h-8 text-xs rounded-md bg-primary text-primary-foreground shadow-ring-brand hover:brightness-95 transition-all'
                    : 'flex items-center gap-1 px-2.5 h-8 text-xs rounded-md bg-claude-sand text-claude-charcoal hover:bg-claude-sand/80 shadow-ring-warm transition-colors'
                }
              >
                <Copy className="h-3 w-3" />
                복사
              </button>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-background text-sm leading-relaxed whitespace-pre-wrap break-words text-claude-charcoal shadow-ring-warm">
            {renderBoldText(item.korean)}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <article className="group relative bg-claude-ivory rounded-2xl overflow-hidden shadow-ring-warm hover:shadow-whisper hover:-translate-y-0.5 transition-all duration-300 cursor-pointer flex flex-col">
            {/* 색띠지(obi) — 엷은 톤으로 Special Prompt + 챕터 번호 집약 */}
            <div className="px-6 pt-3.5 pb-4 bg-primary/12 text-primary">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="h-4 w-4 flex-shrink-0" />
                <span className="text-[11px] uppercase tracking-[0.16em] font-bold">
                  Special Prompt
                </span>
              </div>
              {prefix && (
                <div className="text-lg font-bold whitespace-nowrap">{prefix}</div>
              )}
            </div>

            <div className="p-6">
              <header className="flex items-start justify-between gap-4 mb-7">
                <h3 className="font-serif text-[20px] leading-[1.3] text-foreground flex-1 min-w-0">
                  {rest || card.title}
                </h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 px-2.5 h-7 rounded-full bg-primary/15 text-primary text-xs font-medium shrink-0">
                        <span>{getScoreText(clickCount)}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{clickCount}명이 사용했어요!</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </header>

              {card.beforeItems.length > 0 && (
                <section className="mb-8">
                  <SectionDivider label="Before" />
                  <div className="space-y-7">
                    {card.beforeItems.map((item, index) => (
                      <div key={item.id} className={index > 0 ? 'pt-7 border-t border-claude-border-cream' : ''}>
                        {renderItem(item, 'before')}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {card.afterItems.length > 0 && (
                <section className="mb-4">
                  <SectionDivider label="After" />
                  <div className="space-y-7">
                    {card.afterItems.map((item, index) => (
                      <div key={item.id} className={index > 0 ? 'pt-7 border-t border-claude-border-cream' : ''}>
                        {renderItem(item, 'after')}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <footer className="pt-5 mt-7 border-t border-claude-border-cream flex items-center justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCommentModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 h-9 text-xs rounded-lg text-claude-olive hover:text-foreground hover:bg-claude-sand/70 transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  댓글
                </button>
              </footer>
            </div>
          </article>
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
