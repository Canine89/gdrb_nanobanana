import { NextRequest, NextResponse } from 'next/server';
import { getSuper82SheetData } from '@/lib/sheets';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

const VALID_REDEEM_CODE = 'GDRB2026-banana-2';

export async function GET(request: NextRequest) {
  try {
    // 리딤코드 검증은 클라이언트의 localStorage로 관리 (기존 sheets/special 라우트와 동일 패턴).
    // 보안이 더 필요하면 Authorization 헤더 또는 쿠키로 업그레이드 가능.

    const data = await getSuper82SheetData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in 82je sheets API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? error.stack : String(error);

    const statusCode = errorMessage.includes('not found') || errorMessage.includes('NOT_FOUND') ? 404 : 500;

    return NextResponse.json(
      {
        error: 'Failed to fetch 82je sheet data',
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
      },
      { status: statusCode }
    );
  }
}
