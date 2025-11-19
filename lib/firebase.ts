import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// 환경 변수를 모듈 레벨에서 상수로 추출 (빌드 타임에 번들에 포함됨)
const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 환경 변수 검증 함수
function validateFirebaseConfig(): { isValid: boolean; missingVars: string[] } {
  const requiredVars = [
    { key: 'NEXT_PUBLIC_FIREBASE_API_KEY', value: FIREBASE_CONFIG.apiKey },
    { key: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', value: FIREBASE_CONFIG.authDomain },
    { key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', value: FIREBASE_CONFIG.projectId },
    { key: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', value: FIREBASE_CONFIG.storageBucket },
    { key: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', value: FIREBASE_CONFIG.messagingSenderId },
    { key: 'NEXT_PUBLIC_FIREBASE_APP_ID', value: FIREBASE_CONFIG.appId },
  ];

  const missingVars = requiredVars
    .filter(({ value }) => !value || value.trim() === '')
    .map(({ key }) => key);

  return {
    isValid: missingVars.length === 0,
    missingVars,
  };
}

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

// Lazy initialization function
function initializeFirebase() {
  // Server-side에서는 초기화하지 않음
  if (typeof window === 'undefined') {
    return null;
  }

  // 환경 변수 검증
  const validation = validateFirebaseConfig();

  if (!validation.isValid) {
    console.error('Firebase environment variables not found - Firebase features will be disabled');
    console.error('Missing environment variables:', validation.missingVars.join(', '));
    console.error('Environment variables status:', {
      apiKey: FIREBASE_CONFIG.apiKey ? `set (length: ${FIREBASE_CONFIG.apiKey.length})` : 'missing',
      authDomain: FIREBASE_CONFIG.authDomain ? `set (length: ${FIREBASE_CONFIG.authDomain.length})` : 'missing',
      projectId: FIREBASE_CONFIG.projectId ? `set (length: ${FIREBASE_CONFIG.projectId.length})` : 'missing',
      storageBucket: FIREBASE_CONFIG.storageBucket ? `set (length: ${FIREBASE_CONFIG.storageBucket.length})` : 'missing',
      messagingSenderId: FIREBASE_CONFIG.messagingSenderId ? `set (length: ${FIREBASE_CONFIG.messagingSenderId.length})` : 'missing',
      appId: FIREBASE_CONFIG.appId ? `set (length: ${FIREBASE_CONFIG.appId.length})` : 'missing',
    });
    return null;
  }

  // Firebase 설정 사용
  const firebaseConfig = {
    apiKey: FIREBASE_CONFIG.apiKey!,
    authDomain: FIREBASE_CONFIG.authDomain!,
    projectId: FIREBASE_CONFIG.projectId!,
    storageBucket: FIREBASE_CONFIG.storageBucket!,
    messagingSenderId: FIREBASE_CONFIG.messagingSenderId!,
    appId: FIREBASE_CONFIG.appId!,
  };

  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    db = getFirestore(app);
    return { app, auth, db };
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    console.error('Firebase config (without sensitive values):', {
      apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'missing',
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId ? `${firebaseConfig.appId.substring(0, 10)}...` : 'missing',
    });
    return null;
  }
}

// 초기화 함수 export
export { initializeFirebase };

// 현재 인스턴스 export (호환성을 위해)
export { app, auth, db };

