# 나노바나나 AI 프롬프트 서비스

Google Sheets의 프롬프트 데이터를 읽어와 사용자가 클릭으로 복사하고, 점수를 실시간으로 업데이트하며, 댓글을 남길 수 있는 웹 서비스입니다.

## 주요 기능

- 📋 **프롬프트 클릭 복사**: 프롬프트 셀을 클릭하면 클립보드에 자동 복사
- 🔥 **실시간 점수 시스템**: 클릭 횟수에 따라 재미있는 표현으로 점수 표시
- 💬 **익명 댓글 시스템**: 우클릭으로 댓글 작성 및 조회
- ⚡ **실시간 업데이트**: Firestore를 통한 실시간 데이터 동기화

## 기술 스택

- **프레임워크**: Next.js 14 (App Router)
- **UI 라이브러리**: shadcn/ui (Candyland 테마)
- **데이터베이스**: Firebase Firestore
- **인증**: Firebase Anonymous Auth
- **API**: Google Sheets API v4
- **배포**: Vercel

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Service Account (서비스 계정 JSON 전체를 한 줄로 변환하여 입력)
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}
```

### 3. Firebase 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 생성
2. Firestore Database 생성 (테스트 모드로 시작 가능)
3. Authentication에서 Anonymous 인증 활성화
4. Firebase 설정 정보를 `.env.local`에 추가

### 4. Google Sheets API 설정

1. `service-account-file.json` 파일을 프로젝트 루트에 배치
2. 서비스 계정이 스프레드시트에 대한 읽기 권한을 가지고 있는지 확인

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 배포

### Vercel 배포

1. GitHub에 코드 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 import
3. 환경 변수 설정
4. `service-account-file.json`의 내용을 환경 변수로 설정하거나 Vercel의 환경 변수로 관리

### 환경 변수 설정 (Vercel)

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

서비스 계정 파일의 경우, Vercel의 환경 변수로 관리하거나 Secrets로 저장할 수 있습니다.

## Firestore 보안 규칙

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 읽기는 모든 사용자 허용
    match /{document=**} {
      allow read: if true;
    }
    
    // 쓰기는 인증된 사용자만 허용
    match /clicks/{clickId} {
      allow create: if request.auth != null;
    }
    
    match /comments/{commentId} {
      allow create: if request.auth != null;
    }
    
    match /promptStats/{statId} {
      allow write: if request.auth != null;
    }
  }
}
```

## 프로젝트 구조

```
gdrb_nanobanana/
├── app/
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # 메인 페이지
│   ├── api/
│   │   └── sheets/route.ts # Google Sheets API Route
│   └── globals.css         # 전역 스타일
├── components/
│   ├── ui/                 # shadcn/ui 컴포넌트
│   ├── PromptTable.tsx     # 프롬프트 테이블
│   ├── PromptCell.tsx     # 개별 프롬프트 셀
│   ├── CommentModal.tsx   # 댓글 모달
│   └── Toaster.tsx        # 토스트 알림
├── lib/
│   ├── firebase.ts        # Firebase 초기화
│   ├── firestore.ts      # Firestore 유틸리티
│   └── sheets.ts         # Google Sheets API 유틸리티
├── hooks/
│   └── usePromptData.ts  # 프롬프트 데이터 훅
└── types/
    └── index.ts          # 타입 정의
```

## 라이선스

MIT

