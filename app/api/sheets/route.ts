import { NextResponse } from 'next/server';
import { getSheetData } from '@/lib/sheets';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // 60초마다 재검증

export async function GET() {
  try {
    const data = await getSheetData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in sheets API route:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? error.stack : String(error);
    
    // 404 에러인 경우 404 상태 코드 반환
    const statusCode = errorMessage.includes('not found') || errorMessage.includes('NOT_FOUND') ? 404 : 500;
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch sheet data',
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: statusCode }
    );
  }
}

