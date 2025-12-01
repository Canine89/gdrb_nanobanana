import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 구글 드라이브 공유 링크를 직접 이미지 URL로 변환
 * https://drive.google.com/file/d/FILE_ID/view... → https://lh3.googleusercontent.com/d/FILE_ID
 * https://drive.google.com/open?id=FILE_ID → https://lh3.googleusercontent.com/d/FILE_ID
 */
export function convertGoogleDriveUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;

  // 이미 변환된 URL이면 그대로 반환
  if (url.includes('lh3.googleusercontent.com')) {
    return url;
  }

  // 구글 드라이브 URL이 아니면 그대로 반환
  if (!url.includes('drive.google.com')) {
    return url;
  }

  // 파일 ID 추출 패턴들
  // 패턴 1: /file/d/FILE_ID/
  const filePattern = /\/file\/d\/([a-zA-Z0-9_-]+)/;
  // 패턴 2: ?id=FILE_ID 또는 &id=FILE_ID
  const idPattern = /[?&]id=([a-zA-Z0-9_-]+)/;

  let fileId: string | null = null;

  const fileMatch = url.match(filePattern);
  if (fileMatch) {
    fileId = fileMatch[1];
  } else {
    const idMatch = url.match(idPattern);
    if (idMatch) {
      fileId = idMatch[1];
    }
  }

  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // 파일 ID를 찾지 못하면 원본 반환
  return url;
}

