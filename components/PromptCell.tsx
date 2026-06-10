"use client";

import { useState, useEffect } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { CommentModal } from './CommentModal';
import { recordClick, subscribeToPromptStats } from '@/lib/firestore';
import { toast } from 'sonner';
import type { Prompt, PromptStats } from '@/types';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromptCellProps {
  prompt: Prompt;
}

function getScoreEmoji(clickCount: number): string {
  if (clickCount === 0) return '✨';
  if (clickCount < 10) return '🌟';
  if (clickCount < 50) return '🔥';
  if (clickCount < 100) return '⭐';
  if (clickCount < 500) return '💎';
  return '👑';
}

function getScoreText(clickCount: number): string {
  if (clickCount === 0) return '새로운 프롬프트';
  if (clickCount < 10) return `${clickCount}회`;
  if (clickCount < 50) return `🔥 ${clickCount}회`;
  if (clickCount < 100) return `⭐ ${clickCount}회`;
  if (clickCount < 500) return `💎 ${clickCount}회`;
  return `👑 ${clickCount}회`;
}

export function PromptCell({ prompt }: PromptCellProps) {
  const [stats, setStats] = useState<PromptStats | null>(null);
  const [commentModalOpen, setCommentModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToPromptStats(prompt.id, (updatedStats) => {
      setStats(updatedStats);
    });

    return () => unsubscribe();
  }, [prompt.id]);

  const handleClick = async () => {
    try {
      // 클립보드에 복사
      await navigator.clipboard.writeText(prompt.content);
      toast.success('클립보드에 복사되었습니다!');
      
      // 클릭 이벤트 기록
      recordClick(prompt.id).catch((error) => {
        console.error('Error recording click:', error);
      });
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
          <div
            onClick={handleClick}
            className={cn(
              "p-4 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors",
              "min-h-[100px] flex flex-col justify-between"
            )}
          >
            <p className="text-sm whitespace-pre-wrap break-words">
              {prompt.content}
            </p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t">
              <span className="text-xs font-medium text-muted-foreground">
                {getScoreEmoji(clickCount)} {getScoreText(clickCount)}
              </span>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
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
        promptId={prompt.id}
        open={commentModalOpen}
        onOpenChange={setCommentModalOpen}
      />
    </>
  );
}
