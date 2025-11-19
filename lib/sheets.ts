import { google } from 'googleapis';

const SPREADSHEET_ID = '1PI1MR0w4c6jM6_8-ReI1i_73BemdcPHrJuYY8oj0Uyo';
const SHEET_NAME = '나노바나나 AI 비포&애프터 미친 활용법 71제 슈퍼 프롬프트 복붙 시트';

export async function getGoogleSheetsClient() {
  // 환경 변수에서 서비스 계정 정보 가져오기
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  
  if (!serviceAccountJson) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set');
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch (error) {
    throw new Error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON. Make sure it is valid JSON.');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  return sheets;
}

export async function getSheetData() {
  try {
    const sheets = await getGoogleSheetsClient();
    
    // 먼저 시트 목록을 가져와서 정확한 시트 이름 확인
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    // 시트 이름으로 찾기 (정확한 이름 또는 첫 번째 시트 사용)
    const sheet = spreadsheetInfo.data.sheets?.find(
      s => s.properties?.title === SHEET_NAME
    ) || spreadsheetInfo.data.sheets?.[0];

    if (!sheet || !sheet.properties?.title) {
      throw new Error('Sheet not found');
    }

    const actualSheetName = sheet.properties.title;
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: actualSheetName,
    });

    return {
      values: response.data.values || [],
      range: response.data.range || '',
    };
  } catch (error: any) {
    console.error('Error fetching sheet data:', error);
    
    // 더 자세한 에러 메시지 제공
    if (error.code === 'ENOENT') {
      throw new Error('Service account file not found');
    } else if (error.code === 403) {
      throw new Error('Permission denied. Please check if the service account has access to the spreadsheet.');
    } else if (error.code === 404) {
      throw new Error('Spreadsheet not found. Please check the spreadsheet ID.');
    }
    
    throw error;
  }
}

