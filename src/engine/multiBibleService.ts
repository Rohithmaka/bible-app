import { getChapterVerses, Verse, BIBLE_BOOKS } from '../data/bibleData';
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
 * Maps book ID to 1-based canonical index (1..66) for Bolls API
 */

function getBookIndex(bookId: string): number {
  const index = BIBLE_BOOKS.findIndex((item) => item.id.toLowerCase() === bookId.toLowerCase());
  return index >= 0 ? index + 1 : 1;
}

/**
 * Maps translation ID to Bolls API short codes
 */
const BOLLS_CODE_MAP: Record<string, string> = {
  // Spanish
  rvr: 'RV1960',
  rvr1909: 'RV1960',
  // French
  lsg: 'LSG',
  lsg1910: 'LSG',
  // German
  lut: 'LUT',
  lut1912: 'LUT',
  // Portuguese
  arc: 'ARA',
  arc1969: 'ARA',
  // Latin
  vulgate: 'VULG',
  vul: 'VULG',
  // Chinese
  cuvs: 'CUVS',
  // Arabic
  svd: 'SVD',
  // Russian
  synod: 'SYNOD',
  syn: 'SYNOD',
  // Swahili
  suv: 'SUV',
  // Amharic
  amh: 'AMH',
  // Tagalog
  tag: 'TAG',
  tab: 'TAG',
  // Vietnamese
  vie: 'VI1934',
  vie1934: 'VI1934',
  // Korean
  krv: 'KRV',
  // Japanese
  ja: 'JPKJV',
  jap1950: 'JPKJV',
  // Italian
  ita: 'NR06',
  riv1927: 'NR06',
  // Dutch
  dut: 'SV',
  sv1637: 'SV',
  // Polish
  pol: 'BG',
  bg1632: 'BG',
  // Indonesian
  ind: 'TB',
  tl1958: 'TB',
  // Romanian
  rum: 'VDCL',
  cor1924: 'VDCL',
  // Swedish
  swe: 'SFB2015',
  swe1917: 'SFB2015',
  // Norwegian
  nor: 'DNB',
  nor1930: 'DNB',
  // Tamil
  bsi_tam: 'TBSI',
  tam_irv: 'TBSI',
  irv_tam: 'TBSI',
};

/**
 * Fetches chapter verses for any supported Bible translation.
 * - Telugu (BSI_TEL, TEL_IRV, TEL_FBI): Fetches actual Telugu script from GitHub aruljohn/Bible-telugu
 * - Tamil (BSI_TAM, TAM_IRV): Fetches actual Tamil script from GitHub aruljohn/Bible-tamil or Bolls API
 * - International / Global: Fetches from Bolls API or bible-api.com
 * - English (KJV, WEB): Local built-in dataset
 */
export async function fetchChapterVerses(
  bookId: string,
  bookName: string,
  chapter: number,
  translationId: string = 'KJV'
): Promise<Verse[]> {
  const normTransId = translationId.toLowerCase();

  // 1. Memory cache check
  const cacheKey = `${bookId}:${chapter}:${normTransId}`;
  if (verseCache[cacheKey]) {
    return verseCache[cacheKey];
  }

  // 2. Local storage check for built-in public domain datasets (KJV / WEB)
  if (normTransId === 'kjv' || normTransId === 'web') {
    return getChapterVerses(bookId, chapter);
  }

  // 3. TELUGU TRANSLATIONS (BSI_TEL, TEL_IRV, TEL_FBI, TEL) -> Fetch Actual Telugu Text
  if (normTransId.includes('tel')) {
    try {
      const gitHubBookName = bookName === 'Song of Solomon' ? 'Song of Songs' : bookName;
      const url = `https://raw.githubusercontent.com/aruljohn/Bible-telugu/master/${encodeURIComponent(gitHubBookName)}.json`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        if (data && data.chapters && Array.isArray(data.chapters)) {
          const targetChapter = data.chapters.find((c: any) => c.chapter == chapter);
          if (targetChapter && Array.isArray(targetChapter.verses)) {
            const parsedVerses: Verse[] = targetChapter.verses.map((v: any) => ({
              verse: parseInt(v.verse, 10),
              text: (v.text || '').trim().replace(/\n/g, ' '),
            }));

            verseCache[cacheKey] = parsedVerses;
            return parsedVerses;
          }
        }
      }
    } catch (error) {
      console.warn(`Telugu fetch failed for ${bookName} ${chapter}:`, error);
    }
  }

  // 4. TAMIL TRANSLATIONS (BSI_TAM, TAM_IRV, TAM) -> Fetch Actual Tamil Text
  if (normTransId.includes('tam')) {
    try {
      const gitHubBookName = bookName === 'Song of Solomon' ? 'Song of Songs' : bookName;
      const url = `https://raw.githubusercontent.com/aruljohn/Bible-tamil/master/${encodeURIComponent(gitHubBookName)}.json`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        if (data && data.chapters && Array.isArray(data.chapters)) {
          const targetChapter = data.chapters.find((c: any) => c.chapter == chapter);
          if (targetChapter && Array.isArray(targetChapter.verses)) {
            const parsedVerses: Verse[] = targetChapter.verses.map((v: any) => ({
              verse: parseInt(v.verse, 10),
              text: (v.text || '').trim().replace(/\n/g, ' '),
            }));

            verseCache[cacheKey] = parsedVerses;
            return parsedVerses;
          }
        }
      }
    } catch (error) {
      console.warn(`Tamil fetch failed for ${bookName} ${chapter}:`, error);
    }
  }

  // 5. BOLLS API TRANSLATIONS (Spanish, French, German, Portuguese, Russian, Swahili, Amharic, Chinese, Arabic, Tagalog, etc.)
  const bollsCode = BOLLS_CODE_MAP[normTransId];
  if (bollsCode) {
    try {
      const bookIndex = getBookIndex(bookId);
      const url = `https://bolls.life/get-chapter/${bollsCode}/${bookIndex}/${chapter}/`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const parsedVerses: Verse[] = data.map((v: any) => ({
            verse: v.verse,
            text: (v.text || '').replace(/<[^>]*>/g, '').trim().replace(/\n/g, ' '),
          }));

          verseCache[cacheKey] = parsedVerses;
          return parsedVerses;
        }
      }
    } catch (error) {
      console.warn(`Bolls API fetch failed for ${translationId}:`, error);
    }
  }

  // 6. Generic Online API (bible-api.com)
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
    console.warn(`bible-api.com Fetch failed for ${translationId}:`, error);
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
