import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  increment, 
  onSnapshot, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { CommunityPrayer } from '../store/useSpiritualStore';

/**
 * Real-time Firestore subscription to global community prayer requests.
 * Fires callback whenever any user worldwide posts a burden or taps "🙏 I Prayed".
 */
export function subscribeToCloudCommunityPrayers(
  onUpdate: (prayers: CommunityPrayer[]) => void
): () => void {
  try {
    const q = query(
      collection(db, 'community_prayers'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const cloudPrayers: CommunityPrayer[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            authorName: data.authorName || 'Believer',
            isAnonymous: !!data.isAnonymous,
            title: data.title || 'Prayer Request',
            burdenText: data.burdenText || '',
            category: data.category || 'family',
            prayerCount: data.prayerCount || 1,
            userHasPrayed: false,
            createdAt: data.createdAt || Date.now(),
            updates: data.updates || [],
            isAnswered: !!data.isAnswered,
          };
        });

        if (cloudPrayers.length > 0) {
          onUpdate(cloudPrayers);
        }
      },
      (error) => {
        console.warn('Real-time Firestore listener offline fallback:', error.message);
      }
    );

    return unsubscribe;
  } catch (e) {
    console.warn('Firestore subscription offline fallback');
    return () => {};
  }
}

/**
 * Publishes a new community prayer burden to Cloud Firestore.
 */
export async function publishCommunityPrayerToCloud(prayer: Omit<CommunityPrayer, 'id' | 'createdAt' | 'prayerCount' | 'userHasPrayed' | 'updates' | 'isAnswered'>) {
  try {
    const newDocRef = doc(collection(db, 'community_prayers'));
    const payload = {
      ...prayer,
      createdAt: Date.now(),
      prayerCount: 1,
      updates: [],
      isAnswered: false,
    };
    await setDoc(newDocRef, payload);
    return newDocRef.id;
  } catch (e) {
    console.warn('Failed to publish prayer to cloud:', e);
    return null;
  }
}

/**
 * Atomically increments the prayer count in Cloud Firestore when any user taps "🙏 I Prayed".
 */
export async function incrementCloudIPrayedCount(prayerId: string) {
  try {
    const prayerRef = doc(db, 'community_prayers', prayerId);
    await updateDoc(prayerRef, {
      prayerCount: increment(1),
    });
  } catch (e) {
    console.warn('Failed to update cloud prayer count:', e);
  }
}

/**
 * Backs up private user state (notes, highlights, bookmarks, answered prayers) to Cloud Firestore.
 */
export async function backupUserDataToCloud(uid: string, userData: any) {
  if (!uid) return;
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, { ...userData, updatedAt: Date.now() }, { merge: true });
  } catch (e) {
    console.warn('Failed to backup user data to cloud:', e);
  }
}
