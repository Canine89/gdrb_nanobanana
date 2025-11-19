import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  increment,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { initializeFirebase } from './firebase';
import type { ClickEvent, Comment, PromptStats } from '@/types';

// 클릭 이벤트 기록
export async function recordClick(promptId: string, userId: string) {
  const firebaseInstance = initializeFirebase();
  const db = firebaseInstance?.db;

  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  
  try {
    // 클릭 이벤트 추가
    await addDoc(collection(db, 'clicks'), {
      promptId,
      userId,
      timestamp: serverTimestamp(),
    });

    // 프롬프트 통계 업데이트
    const statsRef = doc(db, 'promptStats', promptId);
    const statsSnap = await getDoc(statsRef);
    
    if (statsSnap.exists()) {
      await setDoc(statsRef, {
        clickCount: increment(1),
      }, { merge: true });
    } else {
      await setDoc(statsRef, {
        promptId,
        clickCount: 1,
      });
    }
  } catch (error) {
    console.error('Error recording click:', error);
    throw error;
  }
}

// 댓글 추가
export async function addComment(promptId: string, userId: string, content: string) {
  const firebaseInstance = initializeFirebase();
  const db = firebaseInstance?.db;

  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  
  try {
    await addDoc(collection(db, 'comments'), {
      promptId,
      userId,
      content,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

// 댓글 조회
export async function getComments(promptId: string): Promise<Comment[]> {
  const firebaseInstance = initializeFirebase();
  const db = firebaseInstance?.db;

  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  
  try {
    const q = query(
      collection(db, 'comments'),
      where('promptId', '==', promptId)
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        promptId: data.promptId,
        userId: data.userId,
        content: data.content,
        timestamp: data.timestamp?.toDate() || new Date(),
      };
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  } catch (error) {
    console.error('Error getting comments:', error);
    throw error;
  }
}

// 프롬프트 통계 조회
export async function getPromptStats(promptId: string): Promise<PromptStats | null> {
  const firebaseInstance = initializeFirebase();
  const db = firebaseInstance?.db;

  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  
  try {
    const statsRef = doc(db, 'promptStats', promptId);
    const statsSnap = await getDoc(statsRef);
    
    if (statsSnap.exists()) {
      const data = statsSnap.data();
      return {
        promptId: data.promptId || promptId,
        clickCount: data.clickCount || 0,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting prompt stats:', error);
    return null;
  }
}

// 실시간 통계 리스너
export function subscribeToPromptStats(
  promptId: string,
  callback: (stats: PromptStats | null) => void
) {
  const firebaseInstance = initializeFirebase();
  const db = firebaseInstance?.db;

  if (!db) {
    console.error('Firestore is not initialized');
    callback(null);
    return () => {};
  }

  const statsRef = doc(db, 'promptStats', promptId);

  return onSnapshot(statsRef,
    (snapshot) => {
      try {
        if (snapshot.exists()) {
          const data = snapshot.data();
          callback({
            promptId: data.promptId || promptId,
            clickCount: data.clickCount || 0,
          });
        } else {
          callback(null);
        }
      } catch (error) {
        console.error('Error processing prompt stats snapshot:', error);
        callback(null);
      }
    },
    (error) => {
      console.error('Error in prompt stats listener:', error);
      callback(null);
    }
  );
}

// 실시간 댓글 리스너
export function subscribeToComments(
  promptId: string,
  callback: (comments: Comment[]) => void
) {
  const firebaseInstance = initializeFirebase();
  const db = firebaseInstance?.db;

  if (!db) {
    console.error('Firestore is not initialized');
    callback([]);
    return () => {};
  }

  const q = query(
    collection(db, 'comments'),
    where('promptId', '==', promptId)
  );

  return onSnapshot(q,
    (snapshot) => {
      try {
        const comments = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            promptId: data.promptId,
            userId: data.userId,
            content: data.content,
            timestamp: data.timestamp?.toDate() || new Date(),
          };
        }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        callback(comments);
      } catch (error) {
        console.error('Error processing comments snapshot:', error);
        callback([]);
      }
    },
    (error) => {
      console.error('Error in comments listener:', error);
      callback([]);
    }
  );
}

