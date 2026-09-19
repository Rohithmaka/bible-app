import { getChapterVerses, Verse } from '../data/bibleData';
import { TRANSLATION_CATALOG, TranslationLicenseInfo, getTranslationInfo } from './translationCatalog';

export interface TranslationMetadata {
  id: string;
  name: string;
  language: string;
  category: string;
  isLocalAvailable: boolean;
  licenseType: string;
  attributionRequired: boolean;
  copyrightNotice: string;
}

export const AVAILABLE_TRANSLATIONS: TranslationMetadata[] = TRANSLATION_CATALOG.map((t) => ({
  id: t.translationId,
  name: t.fullName,
  language: t.languageName,
  category: t.languageName,
  isLocalAvailable: t.offlineAvailable,
  licenseType: t.licenseType,
  attributionRequired: t.attributionRequired,
  copyrightNotice: t.copyrightNotice,
}));

const verseCache: Record<string, Verse[]> = {};

/**
 * Fetches chapter verses for any supported Bible translation.
 * Uses local dataset for offline-ready translations (WEB, KJV) and online API / Supabase for others.
 */
export async function fetchChapterVerses(
  bookId: string,
  bookName: string,
  chapter: number,
  translationId: string = 'KJV'
): Promise<Verse[]> {
  const normTransId = translationId.toLowerCase();

  // 1. Local storage check for built-in public domain datasets (KJV / WEB)
  if (normTransId === 'kjv' || normTransId === 'web') {
    return getChapterVerses(bookId, chapter);
  }

  // 2. Memory cache check
  const cacheKey = `${bookId}:${chapter}:${normTransId}`;
  if (verseCache[cacheKey]) {
    return verseCache[cacheKey];
  }

  // 3. Online API / Supabase query
  try {
    const formattedPassage = `${bookName} ${chapter}`;
    const url = `https://bible-api.com/${encodeURIComponent(formattedPassage)}?translation=${normTransId}`;
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      if (data && data.verses && Array.isArray(data.verses)) {
        const parsedVerses: Verse[] = data.verses.map((v: any) => ({
          verse: v.verse,
          text: v.text.trim().replace(/\n/g, ' '),
        }));

        verseCache[cacheKey] = parsedVerses;
        return parsedVerses;
      }
    }
  } catch (error) {
    console.warn(`API Fetch failed for translation ${translationId}, falling back to local KJV:`, error);
  }

  // Safe fallback if offline or API unavailable
  return getChapterVerses(bookId, chapter);
}

export interface ParallelChapterResult {
  translationId: string;
  translationInfo?: TranslationLicenseInfo;
  verses: Verse[];
}

/**
 * Fetches chapter verses for 2 to 4 parallel translations simultaneously.
 */
export async function fetchParallelChapterVerses(
  bookId: string,
  bookName: string,
  chapter: number,
  translationIds: string[]
): Promise<ParallelChapterResult[]> {
  const results = await Promise.all(
    translationIds.map(async (tId) => {
      const verses = await fetchChapterVerses(bookId, bookName, chapter, tId);
      const info = getTranslationInfo(tId);
      return {
        translationId: tId,
        translationInfo: info,
        verses,
      };
    })
  );
  return results;
}
