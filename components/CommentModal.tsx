"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addComment, subscribeToComments } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Comment } from '@/types';
import { MessageSquare, Send } from 'lucide-react';

interface CommentModalProps {
  promptId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommentModal({ promptId, open, onOpenChange }: CommentModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { userId } = useAuth();

  useEffect(() => {
    if (!open || !promptId) return;

    const unsubscribe = subscribeToComments(promptId, (updatedComments) => {
      setComments(updatedComments);
    });

    return () => unsubscribe();
  }, [open, promptId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !userId) return;

    setLoading(true);
    try {
      await addComment(promptId, userId, newComment.trim());
      setNewComment('');
      toast.success('댓글이 등록되었습니다!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('댓글 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            댓글 ({comments.length})
          </DialogTitle>
          <DialogDescription>
            프롬프트에 대한 의견을 남겨주세요. 모든 댓글은 익명으로 표시됩니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 댓글 목록 */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!
              </p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3 rounded-lg border bg-card"
                >
                  <p className="text-sm">{comment.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {comment.timestamp.toLocaleString('ko-KR')}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* 댓글 작성 폼 */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 입력하세요..."
              disabled={loading || !userId}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !userId || !newComment.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

