"use client";

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Gift, Check } from 'lucide-react';

const VALID_CODES = {
  'GDRB2026-banana': {
    label: '71제',
    storageKey: 'redeemCode',
    activatedKey: 'redeemCodeActivated',
  },
  'GDRB2026-banana-2': {
    label: '82제',
    storageKey: 'redeemCode82',
    activatedKey: 'redeemCode82Activated',
  },
} as const;

interface RedeemCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRedeemSuccess: () => void;
}

export function RedeemCodeModal({ open, onOpenChange, onRedeemSuccess }: RedeemCodeModalProps) {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activated, setActivated] = useState<string[]>([]);

  // 모달이 열릴 때 현재 활성화 상태를 읽어와 UI에 반영
  useEffect(() => {
    if (!open) return;
    const now: string[] = [];
    for (const [, meta] of Object.entries(VALID_CODES)) {
      if (localStorage.getItem(meta.activatedKey) === 'true') {
        now.push(meta.label);
      }
    }
    setActivated(now);
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const input = code.trim();
    if (!input) {
      toast.error('리딤코드를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const match = VALID_CODES[input as keyof typeof VALID_CODES];

      if (match) {
        const alreadyActivated = localStorage.getItem(match.activatedKey) === 'true';

        localStorage.setItem(match.storageKey, input);
        localStorage.setItem(match.activatedKey, 'true');

        toast.success(
          alreadyActivated
            ? `${match.label}는 이미 활성화되어 있습니다.`
            : `${match.label} 리딤코드가 활성화되었습니다!`
        );
        setCode('');
        onOpenChange(false);

        // 새로 활성화된 경우에만 데이터 로드 트리거 (현재 구현은 reload).
        if (!alreadyActivated) {
          onRedeemSuccess();
        }
      } else {
        toast.error('유효하지 않은 리딤코드입니다.');
      }
    } catch (error) {
      console.error('Error redeeming code:', error);
      toast.error('리딤코드 활성화에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md mx-4">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1 text-primary">
            <Gift className="h-4 w-4" />
            <span className="text-[10px] uppercase tracking-[0.14em] font-medium">
              Redeem Code
            </span>
          </div>
          <DialogTitle>리딤코드 입력</DialogTitle>
          <DialogDescription>
            슈퍼 프롬프트를 확인하려면 리딤코드를 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        {activated.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-claude-ivory px-3 py-2 shadow-ring-warm">
            <span className="text-[10px] uppercase tracking-[0.14em] font-medium text-claude-stone">
              활성화됨
            </span>
            {activated.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary text-primary-foreground"
              >
                <Check className="h-3 w-3" />
                {label}
              </span>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="리딤코드를 입력하세요"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isSubmitting}
            className="w-full text-base h-11"
          />
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setCode('');
                onOpenChange(false);
              }}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? '처리 중...' : '확인'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
