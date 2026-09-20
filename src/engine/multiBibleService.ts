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
  // English
  web: 'WEB',
  asv: 'ASV',
  bbe: 'BBE',
  darby: 'DRB',
  dra: 'DRB',
  geneva: 'GNV',
  ylt: 'YLT',

  // Spanish
  rvr: 'RV1960',
  rvr1909: 'RV1960',
  rv1960: 'RV1960',
  spa: 'RV1960',
  spanish: 'RV1960',
  es: 'RV1960',

  // French
  lsg: 'FRLSG',
  lsg1910: 'FRLSG',
  frlsg: 'FRLSG',
  fra: 'FRLSG',
  french: 'FRLSG',
  fr: 'FRLSG',

  // German
  lut: 'LUT',
  lut1912: 'LUT',
  ger: 'LUT',
  deu: 'LUT',
  german: 'LUT',
  de: 'LUT',

  // Portuguese
  arc: 'ARA',
  arc1969: 'ARA',
  ara: 'ARA',
  por: 'ARA',
  portuguese: 'ARA',
  pt: 'ARA',

  // Latin
  vulgate: 'VULG',
  vul: 'VULG',
  lat: 'VULG',
  la: 'VULG',

  // Chinese
  cuvs: 'CUNPS',
  cuv: 'CUNPS',
  cunps: 'CUNPS',
  chi: 'CUNPS',
  zho: 'CUNPS',
  chinese: 'CUNPS',
  zh: 'CUNPS',

  // Arabic
  svd: 'SVD',
  ara_svd: 'SVD',
  arabic: 'SVD',
  ar: 'SVD',

  // Russian
  synod: 'SYNOD',
  syn: 'SYNOD',
  rus: 'SYNOD',
  russian: 'SYNOD',
  ru: 'SYNOD',

  // Ukrainian
  ukr: 'UBIO',
  ubio: 'UBIO',
  ukrainian: 'UBIO',
  uk: 'UBIO',

  // Swahili
  suv: 'SUV',
  swa: 'SUV',
  swahili: 'SUV',
  sw: 'SUV',

  // Amharic
  amh: 'AMH',
  amharic: 'AMH',
  am: 'AMH',

  // Tagalog
  tag: 'TAG',
  tab: 'TAG',
  tgl: 'TAG',
  tagalog: 'TAG',
  tl: 'TAG',

  // Vietnamese
  vie: 'VI1934',
  vie1934: 'VI1934',
  vi1934: 'VI1934',
  vietnamese: 'VI1934',
  vi: 'VI1934',

  // Korean
  krv: 'KRV',
  kor: 'KRV',
  korean: 'KRV',
  ko: 'KRV',

  // Japanese
  ja: 'JPKJV',
  jap1950: 'JPKJV',
  jpkjv: 'JPKJV',
  jpn: 'JPKJV',
  japanese: 'JPKJV',

  // Italian
  ita: 'NR06',
  nr06: 'NR06',
  riv1927: 'NR06',
  italian: 'NR06',
  it: 'NR06',

  // Dutch
  dut: 'DSV',
  dsv: 'DSV',
  sv1637: 'DSV',
  nld: 'DSV',
  dutch: 'DSV',
  nl: 'DSV',

  // Polish
  pol: 'BG',
  bg: 'BG',
  bg1632: 'BG',
  polish: 'BG',
  pl: 'BG',

  // Indonesian
  ind: 'TB',
  tb: 'TB',
  tl1958: 'TB',
  indonesian: 'TB',
  id: 'TB',

  // Romanian
  rum: 'VDCL',
  vdcl: 'VDCL',
  cor1924: 'VDCL',
  ron: 'VDCL',
  romanian: 'VDCL',
  ro: 'VDCL',

  // Swedish
  swe: 'SFB2015',
  sfb2015: 'SFB2015',
  swe1917: 'SFB2015',
  swedish: 'SFB2015',
  sv: 'SFB2015',

  // Norwegian
  nor: 'DNB',
  dnb: 'DNB',
  nor1930: 'DNB',
  norwegian: 'DNB',
  no: 'DNB',

  // Finnish
  fin: 'FIK38',
  fik38: 'FIK38',
  finnish: 'FIK38',
  fi: 'FIK38',

  // Hungarian
  hun: 'KB',
  kb: 'KB',
  hungarian: 'KB',
  hu: 'KB',

  // Hindi
  hiov: 'HIOV',
  hindi_irv: 'HIOV',
  hin_irv: 'HIOV',
  bsi_hin: 'HIOV',
  hin: 'HIOV',
  hi: 'HIOV',

  // Malayalam
  mov: 'MOV',
  mal_irv: 'MOV',
  bsi_mal: 'MOV',
  mal: 'MOV',
  ml: 'MOV',

  // Kannada
  kncl: 'KNCL',
  kan_irv: 'KNCL',
  bsi_kan: 'KNCL',
  kan: 'KNCL',
  kn: 'KNCL',

  // Nepali
  nnrv: 'NNRV',
  nep_irv: 'NNRV',
  bsi_nep: 'NNRV',
  nep: 'NNRV',
  ne: 'NNRV',

  // Tamil
  bsi_tam: 'TBSI',
  tam_irv: 'TBSI',
  irv_tam: 'TBSI',
  tam: 'TBSI',
  ta: 'TBSI',

  // Telugu
  bsi_tel: 'TBSI',
  tel_irv: 'TBSI',
  tel_fbi: 'TBSI',
  tel: 'TBSI',
  te: 'TBSI',
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

  // 2. Local storage check for built-in public domain dataset (KJV)
  if (normTransId === 'kjv') {
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
