import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || 'local-mock-api-key';

export const isFirebaseConfigured = Boolean(
  apiKey &&
    apiKey !== 'local-mock-api-key' &&
    import.meta.env.VITE_USE_EMULATOR !== 'true' &&
    import.meta.env.MODE !== 'test'
);

const firebaseConfig = {
  apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'ttl-reading-lesson-sma.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'ttl-reading-lesson-sma',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'ttl-reading-lesson-sma.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '459932514534',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:459932514534:web:264291099eae09b87e6327',
};

// 메인 Firebase 인스턴스 초기화
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// 에뮬레이터 연결 플래그
const useEmulator = import.meta.env.VITE_USE_EMULATOR === 'true';

let emulatorsConnected = false;
if (useEmulator && !emulatorsConnected && typeof window !== 'undefined') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, 'localhost', 8080);
    emulatorsConnected = true;
    console.info('Connected to Firebase Local Emulators (Auth: 9099, Firestore: 8080)');
  } catch (error) {
    console.warn('Firebase emulator connection note:', error);
  }
}

// 교사 ID -> 가상 내부 이메일 변환 유틸리티 (§6.1)
export const VIRTUAL_EMAIL_DOMAIN = 'ttl-edu.local';
export const idToVirtualEmail = (id: string): string => {
  const sanitizedId = id.trim().toLowerCase();
  return `${sanitizedId}@${VIRTUAL_EMAIL_DOMAIN}`;
};

export const virtualEmailToId = (email: string): string => {
  return email.replace(`@${VIRTUAL_EMAIL_DOMAIN}`, '');
};
