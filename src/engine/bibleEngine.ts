import { BIBLE_BOOKS, SCRIPTURE_DATA, getChapterVerses, BibleBook, Verse } from '../data/bibleData';
import { getTranslationInfo } from './translationCatalog';

export interface SearchResult {
  bookId: string;
  bookName: string;
  testament: 'OT' | 'NT';
  chapter: number;
  verse: number;
  text: string;
  matchedTerm: string;
  translationId?: string;
}

/**
 * Searches scripture verses across Old and New Testaments
 */
export function searchBible(query: string, testamentFilter?: 'ALL' | 'OT' | 'NT', translationId: string = 'KJV'): SearchResult[] {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = query.trim().toLowerCase();
  const results: SearchResult[] = [];

  const targetBooks = BIBLE_BOOKS.filter((b) => {
    if (testamentFilter === 'OT') return b.testament === 'OT';
    if (testamentFilter === 'NT') return b.testament === 'NT';
    return true;
  });

  for (const book of targetBooks) {
    const bookChapters = SCRIPTURE_DATA[book.id];
    if (bookChapters) {
      for (const [chapStr, verses] of Object.entries(bookChapters)) {
        const chapter = parseInt(chapStr, 10);
        for (const v of verses) {
          if (v.text.toLowerCase().includes(cleanQuery)) {
            results.push({
              bookId: book.id,
              bookName: book.name,
              testament: book.testament,
              chapter,
              verse: v.verse,
              text: v.text,
              matchedTerm: cleanQuery,
              translationId,
            });

            if (results.length >= 100) return results; // Max limit
          }
        }
      }
    }
  }

  return results;
}

/**
 * Parses passage reference strings like "John 3:16", "Ps 23:1", "1 Cor 13"
 */
export function parseVerseReference(refString: string): { bookId: string; bookName: string; chapter: number; verse?: number } | null {
  if (!refString) return null;
  const clean = refString.trim();

  // Pattern matching: e.g. "John 3:16" or "1 John 4:8"
  const match = clean.match(/^(\d?\s*[A-Za-z\u0C00-\u0C7F]+)\s+(\d+)(?::(\d+))?$/);
  if (!match) return null;

  const rawBook = match[1].trim().toLowerCase();
  const chapter = parseInt(match[2], 10);
  const verse = match[3] ? parseInt(match[3], 10) : undefined;

  const foundBook = BIBLE_BOOKS.find(
    (b) => b.name.toLowerCase() === rawBook || b.id.toLowerCase() === rawBook
  );

  if (!foundBook) return null;

  return {
    bookId: foundBook.id,
    bookName: foundBook.name,
    chapter: Math.min(Math.max(1, chapter), foundBook.chaptersCount),
    verse,
  };
}

/**
 * Navigation helpers to get next and previous chapter locations
 */
export function getNextChapterLocation(bookId: string, chapter: number): { bookId: string; chapter: number } | null {
  const currentBookIndex = BIBLE_BOOKS.findIndex((b) => b.id === bookId);
  if (currentBookIndex === -1) return null;

  const currentBook = BIBLE_BOOKS[currentBookIndex];
  if (chapter < currentBook.chaptersCount) {
    return { bookId, chapter: chapter + 1 };
  } else if (currentBookIndex < BIBLE_BOOKS.length - 1) {
    const nextBook = BIBLE_BOOKS[currentBookIndex + 1];
    return { bookId: nextBook.id, chapter: 1 };
  }

  return null; // End of Bible
}

export function getPrevChapterLocation(bookId: string, chapter: number): { bookId: string; chapter: number } | null {
  const currentBookIndex = BIBLE_BOOKS.findIndex((b) => b.id === bookId);
  if (currentBookIndex === -1) return null;

  if (chapter > 1) {
    return { bookId, chapter: chapter - 1 };
  } else if (currentBookIndex > 0) {
    const prevBook = BIBLE_BOOKS[currentBookIndex - 1];
    return { bookId: prevBook.id, chapter: prevBook.chaptersCount };
  }

  return null; // Start of Bible
}

/**
 * Format selected verses into copyable text, preserving required copyright & attribution notices
 */
export function formatVerseShareText(
  bookName: string,
  chapter: number,
  selectedVerses: Verse[],
  translation: string = 'KJV'
): string {
  if (selectedVerses.length === 0) return '';

  const sorted = [...selectedVerses].sort((a, b) => a.verse - b.verse);
  const verseNumbersStr = sorted.length === 1 ? `${sorted[0].verse}` : `${sorted[0].verse}-${sorted[sorted.length - 1].verse}`;

  const bodyText = sorted.map((v) => `"${v.text}"`).join('\n\n');

  // Surface required copyright attribution if applicable
  const licenseInfo = getTranslationInfo(translation);
  let legalNotice = '';
  if (licenseInfo?.attributionRequired && licenseInfo.copyrightNotice) {
    legalNotice = `\n\nAttribution: ${licenseInfo.copyrightNotice}`;
  }

  return `${bookName} ${chapter}:${verseNumbersStr} (${translation})\n\n${bodyText}${legalNotice}\n\nShared via ALTER Prayer Community`;
}
