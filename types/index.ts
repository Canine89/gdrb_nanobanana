export interface Prompt {
  id: string;
  content: string;
  rowIndex: number;
  columnIndex: number;
}

export interface BeforeAfterItem {
  id: string; // 고유 식별자
  english: string;
  korean: string;
  tool?: string;
  image?: string; // 이미지 URL
  tip?: string; // 꿀팁
}

export interface PromptCard {
  id: string;
  title: string;
  beforeItems: BeforeAfterItem[]; // 배열로 변경
  afterItems: BeforeAfterItem[]; // 배열로 변경
  rowIndex: number; // 첫 번째 행의 인덱스
}

export interface ClickEvent {
  promptId: string;
  userId: string;
  timestamp: Date;
}

export interface Comment {
  id: string;
  promptId: string;
  userId: string;
  content: string;
  timestamp: Date;
}

export interface PromptStats {
  promptId: string;
  clickCount: number;
}

export interface SheetData {
  values: string[][];
  range: string;
}

