import { SCRIPTURE_DATA, getChapterVerses, Verse } from '../data/bibleData';

export interface TranslationMetadata {
  id: string;
  name: string;
  language: string;
  category: 'English' | 'Spanish' | 'French' | 'German' | 'Portuguese' | 'Latin';
  isLocalAvailable: boolean;
}

export const AVAILABLE_TRANSLATIONS: TranslationMetadata[] = [
  { id: 'KJV', name: 'King James Version', language: 'English', category: 'English', isLocalAvailable: true },
  { id: 'WEB', name: 'World English Bible', language: 'English', category: 'English', isLocalAvailable: true },
  { id: 'asv', name: 'American Standard Version (1901)', language: 'English', category: 'English', isLocalAvailable: false },
  { id: 'bbe', name: 'Bible in Basic English', language: 'English', category: 'English', isLocalAvailable: false },
  { id: 'darby', name: 'Darby Bible', language: 'English', category: 'English', isLocalAvailable: false },
  { id: 'ylt', name: 'Young\'s Literal Translation', language: 'English', category: 'English', isLocalAvailable: false },
  { id: 'wey', name: 'Weymouth New Testament', language: 'English', category: 'English', isLocalAvailable: false },
  { id: 'bsb', name: 'Berean Study Bible', language: 'English', category: 'English', isLocalAvailable: false },
  { id: 'rvr', name: 'Reina-Valera 1909', language: 'Spanish', category: 'Spanish', isLocalAvailable: false },
  { id: 'lsg', name: 'Louis Segond 1910', language: 'French', category: 'French', isLocalAvailable: false },
  { id: 'lut', name: 'Luther Bible 1545', language: 'German', category: 'German', isLocalAvailable: false },
  { id: 'nvi', name: 'Almeida Revista e Corrigida', language: 'Portuguese', category: 'Portuguese', isLocalAvailable: false },
  { id: 'vul', name: 'Clementine Latin Vulgate', language: 'Latin', category: 'Latin', isLocalAvailable: false },
  { id: 'dby_fr', name: 'French Darby Bible', language: 'French', category: 'French', isLocalAvailable: false },
  { id: 'rv60', name: 'Reina Valera Antigua', language: 'Spanish', category: 'Spanish', isLocalAvailable: false },
];

const verseCache: Record<string, Verse[]> = {};

/**
 * Fetches chapter verses for any of the 15 supported Bible translations.
 * Uses local data for KJV & WEB, and online API with local memory caching for other translations.
 */
export async function fetchChapterVerses(
  bookId: string,
  bookName: string,
  chapter: number,
  translationId: string = 'KJV'
): Promise<Verse[]> {
  const normTransId = translationId.toLowerCase();

  // 1. Check local offline storage first (KJV / WEB)
  if (normTransId === 'kjv' || normTransId === 'web') {
    return getChapterVerses(bookId, chapter);
  }

  // 2. Check memory cache
  const cacheKey = `${bookId}:${chapter}:${normTransId}`;
  if (verseCache[cacheKey]) {
    return verseCache[cacheKey];
  }

  // 3. Online API Fetching
  try {
    const formattedPassage = `${bookName} ${chapter}`;
    const url = `https://bible-api.com/${encodeURIComponent(formattedPassage)}?translation=${normTransId}`;
    const response = await fetch(url);

    if (!response.ok) {
      // Fallback to local KJV on API error
      return getChapterVerses(bookId, chapter);
    }

    const data = await response.json();
    if (data && data.verses && Array.isArray(data.verses)) {
      const parsedVerses: Verse[] = data.verses.map((v: any) => ({
        verse: v.verse,
        text: v.text.trim().replace(/\n/g, ' '),
      }));

      // Store in memory cache
      verseCache[cacheKey] = parsedVerses;
      return parsedVerses;
    }
  } catch (error) {
    console.warn(`API Fetch failed for ${translationId}, using local KJV fallback:`, error);
  }

  // Fallback if API fails or device is offline
  return getChapterVerses(bookId, chapter);
}
