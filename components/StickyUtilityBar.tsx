"use client";

import { Search, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StickyUtilityBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (value: string) => void;
  onOpenRedeemModal: () => void;
}

export function StickyUtilityBar({
  searchQuery,
  onSearchChange,
  itemsPerPage,
  onItemsPerPageChange,
  onOpenRedeemModal,
}: StickyUtilityBarProps) {
  return (
    <div className="sticky top-0 z-40 bg-claude-ivory/85 backdrop-blur-md border-b border-claude-border-cream">
      <div className="container mx-auto px-6 max-w-7xl 2xl:max-w-[1600px] py-3">
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 min-w-0 basis-full sm:basis-auto order-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-claude-stone" />
            <Input
              type="text"
              placeholder="프롬프트 검색..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-10"
              aria-label="프롬프트 검색"
            />
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenRedeemModal}
            className="order-2 flex-shrink-0"
          >
            <Gift className="h-4 w-4" />
            리딤코드
          </Button>

          <div className="flex items-center gap-2 order-3 flex-shrink-0 ml-auto sm:ml-0">
            <span className="text-[11px] uppercase tracking-wider text-claude-stone font-medium hidden sm:inline">
              페이지당
            </span>
            <Select value={itemsPerPage.toString()} onValueChange={onItemsPerPageChange}>
              <SelectTrigger
                className="w-[72px] h-9 rounded-lg border-claude-border-cream bg-claude-ivory text-sm"
                aria-label="페이지당 항목 수"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="6">6</SelectItem>
                <SelectItem value="9">9</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
