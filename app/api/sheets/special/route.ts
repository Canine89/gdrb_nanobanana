import { NextRequest, NextResponse } from 'next/server';
import { getSpecialSheetData } from '@/lib/sheets';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // 60초마다 재검증

const VALID_REDEEM_CODE = 'GDRB2026-banana';

export async function GET(request: NextRequest) {
  try {
    // 리딤코드 검증 (클라이언트에서도 검증하지만 서버에서도 한 번 더 확인)
    // 실제로는 헤더나 쿼리 파라미터로 받을 수도 있지만, 
    // 클라이언트에서 localStorage로 관리하므로 여기서는 단순히 데이터만 반환
    // 보안이 더 필요하면 Authorization 헤더나 쿠키를 사용할 수 있습니다.

    const data = await getSpecialSheetData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in special sheets API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? error.stack : String(error);
    
    // 404 에러인 경우 404 상태 코드 반환
    const statusCode = errorMessage.includes('not found') || errorMessage.includes('NOT_FOUND') ? 404 : 500;
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch special sheet data',
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: statusCode }
    );
  }
}

