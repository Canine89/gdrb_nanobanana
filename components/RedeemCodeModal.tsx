"use client";

import { useState } from 'react';
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

const VALID_REDEEM_CODE = 'GDRB2026-banana';

interface RedeemCodeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRedeemSuccess: () => void;
}

export function RedeemCodeModal({ open, onOpenChange, onRedeemSuccess }: RedeemCodeModalProps) {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast.error('리딤코드를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 리딤코드 검증
      if (code.trim() === VALID_REDEEM_CODE) {
        // localStorage에 리딤코드 활성화 상태 저장
        localStorage.setItem('redeemCode', VALID_REDEEM_CODE);
        localStorage.setItem('redeemCodeActivated', 'true');
        
        toast.success('리딤코드가 활성화되었습니다!');
        setCode('');
        onOpenChange(false);
        onRedeemSuccess();
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>리딤코드 입력</DialogTitle>
          <DialogDescription>
            스페셜 프롬프트를 확인하려면 리딤코드를 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="리딤코드를 입력하세요"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isSubmitting}
            className="w-full"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCode('');
                onOpenChange(false);
              }}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '처리 중...' : '확인'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

