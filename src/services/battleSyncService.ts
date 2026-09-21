import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  collection 
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { DailyBattle, Task } from '../engine/xpEngine';
import { RivalState } from '../store/useStore';

/**
 * Pushes daily battle state (Player XP vs Rival XP, tasks progress) to Cloud Firestore.
 */
export async function syncDailyBattleToFirestore(
  uid: string, 
  dateStr: string, 
  battle: DailyBattle
): Promise<void> {
  if (!uid) return;
  try {
    const battleDocRef = doc(db, 'dailyBattle', uid, 'days', dateStr);
    await setDoc(battleDocRef, {
      date: battle.date,
      playerTotalXP: battle.playerTotalXP,
      rivalTotalXP: battle.rivalTotalXP,
      result: battle.result,
      cleanDay: battle.cleanDay,
      tasks: battle.tasks,
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (e) {
    console.warn('Firestore battle sync fallback offline:', e);
  }
}

/**
 * Pushes user active task list to Cloud Firestore.
 */
export async function syncTasksToFirestore(uid: string, tasks: Task[]): Promise<void> {
  if (!uid) return;
  try {
    const tasksDocRef = doc(db, 'tasks', uid);
    await setDoc(tasksDocRef, {
      taskList: tasks,
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (e) {
    console.warn('Firestore tasks sync fallback offline:', e);
  }
}

/**
 * Pushes Rival state (Level, Form, Personality, XP) to Cloud Firestore.
 */
export async function syncRivalToFirestore(uid: string, rival: RivalState): Promise<void> {
  if (!uid) return;
  try {
    const rivalDocRef = doc(db, 'rivals', uid);
    await setDoc(rivalDocRef, {
      name: rival.name,
      level: rival.level,
      evolutionForm: rival.evolutionForm,
      totalXP: rival.totalXP,
      personality: rival.personality,
      tauntFrequency: rival.tauntFrequency,
      updatedAt: Date.now(),
    }, { merge: true });
  } catch (e) {
    console.warn('Firestore rival sync fallback offline:', e);
  }
}

/**
 * Subscribes to real-time updates of the daily battle document from Cloud Firestore.
 */
export function subscribeToRemoteBattle(
  uid: string, 
  dateStr: string, 
  onUpdate: (data: any) => void
): () => void {
  if (!uid) return () => {};
  try {
    const battleDocRef = doc(db, 'dailyBattle', uid, 'days', dateStr);
    const unsubscribe = onSnapshot(battleDocRef, (snap) => {
      if (snap.exists()) {
        onUpdate(snap.data());
      }
    }, (err) => {
      console.warn('Firestore battle listener fallback:', err.message);
    });
    return unsubscribe;
  } catch (e) {
    return () => {};
  }
}
