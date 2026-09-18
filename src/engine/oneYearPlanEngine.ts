export interface ScripturePortion {
  bookId: string;
  bookName: string;
  chapter: number;
  displayText: string; // e.g. "Genesis 1:1 - 2:17"
}

export interface DayReading {
  dayNumber: number; // 1 to 365
  title: string;
  oldTestament: ScripturePortion;
  newTestament: ScripturePortion;
  psalm: ScripturePortion;
  proverb: ScripturePortion;
}

// 365-Day Bible Reading Generator
const OT_BOOKS = [
  { id: 'GEN', name: 'Genesis', chapters: 50 },
  { id: 'EXO', name: 'Exodus', chapters: 40 },
  { id: 'LEV', name: 'Leviticus', chapters: 27 },
  { id: 'NUM', name: 'Numbers', chapters: 36 },
  { id: 'DEU', name: 'Deuteronomy', chapters: 34 },
  { id: 'JOS', name: 'Joshua', chapters: 24 },
  { id: 'JDG', name: 'Judges', chapters: 21 },
  { id: 'RUT', name: 'Ruth', chapters: 4 },
  { id: '1SA', name: '1 Samuel', chapters: 31 },
  { id: '2SA', name: '2 Samuel', chapters: 24 },
  { id: '1KI', name: '1 Kings', chapters: 22 },
  { id: '2KI', name: '2 Kings', chapters: 25 },
  { id: '1CH', name: '1 Chronicles', chapters: 29 },
  { id: '2CH', name: '2 Chronicles', chapters: 36 },
  { id: 'EZR', name: 'Ezra', chapters: 10 },
  { id: 'NEH', name: 'Nehemiah', chapters: 13 },
  { id: 'EST', name: 'Esther', chapters: 10 },
  { id: 'JOB', name: 'Job', chapters: 42 },
  { id: 'ISA', name: 'Isaiah', chapters: 66 },
  { id: 'JER', name: 'Jeremiah', chapters: 52 },
  { id: 'LAM', name: 'Lamentations', chapters: 5 },
  { id: 'EZE', name: 'Ezekiel', chapters: 48 },
  { id: 'DAN', name: 'Daniel', chapters: 12 },
  { id: 'HOS', name: 'Hosea', chapters: 14 },
  { id: 'JOE', name: 'Joel', chapters: 3 },
  { id: 'AMO', name: 'Amos', chapters: 9 },
  { id: 'OBA', name: 'Obadiah', chapters: 1 },
  { id: 'JON', name: 'Jonah', chapters: 4 },
  { id: 'MIC', name: 'Micah', chapters: 7 },
  { id: 'NAM', name: 'Nahum', chapters: 3 },
  { id: 'HAB', name: 'Habakkuk', chapters: 3 },
  { id: 'ZEP', name: 'Zephaniah', chapters: 3 },
  { id: 'HAG', name: 'Haggai', chapters: 2 },
  { id: 'ZEC', name: 'Zechariah', chapters: 14 },
  { id: 'MAL', name: 'Malachi', chapters: 4 },
];

const NT_BOOKS = [
  { id: 'MAT', name: 'Matthew', chapters: 28 },
  { id: 'MRK', name: 'Mark', chapters: 16 },
  { id: 'LUK', name: 'Luke', chapters: 24 },
  { id: 'JHN', name: 'John', chapters: 21 },
  { id: 'ACT', name: 'Acts', chapters: 28 },
  { id: 'ROM', name: 'Romans', chapters: 16 },
  { id: '1CO', name: '1 Corinthians', chapters: 16 },
  { id: '2CO', name: '2 Corinthians', chapters: 13 },
  { id: 'GAL', name: 'Galatians', chapters: 6 },
  { id: 'EPH', name: 'Ephesians', chapters: 6 },
  { id: 'PHP', name: 'Philippians', chapters: 4 },
  { id: 'COL', name: 'Colossians', chapters: 4 },
  { id: '1TH', name: '1 Thessalonians', chapters: 5 },
  { id: '2TH', name: '2 Thessalonians', chapters: 3 },
  { id: '1TI', name: '1 Timothy', chapters: 6 },
  { id: '2TI', name: '2 Timothy', chapters: 4 },
  { id: 'TIT', name: 'Titus', chapters: 3 },
  { id: 'PHM', name: 'Philemon', chapters: 1 },
  { id: 'HEB', name: 'Hebrews', chapters: 13 },
  { id: 'JAS', name: 'James', chapters: 5 },
  { id: '1PE', name: '1 Peter', chapters: 5 },
  { id: '2PE', name: '2 Peter', chapters: 3 },
  { id: '1JN', name: '1 John', chapters: 5 },
  { id: '2JN', name: '2 John', chapters: 1 },
  { id: '3JN', name: '3 John', chapters: 1 },
  { id: 'JUD', name: 'Jude', chapters: 1 },
  { id: 'REV', name: 'Revelation', chapters: 22 },
];

export function getReadingForDay(dayNumber: number): DayReading {
  const safeDay = Math.min(365, Math.max(1, dayNumber));

  // 1. Calculate OT Chapter
  const otIndex = (safeDay - 1) % OT_BOOKS.length;
  const otBook = OT_BOOKS[otIndex];
  const otChapter = ((safeDay * 2 - 1) % otBook.chapters) + 1;

  // 2. Calculate NT Chapter
  const ntIndex = (safeDay - 1) % NT_BOOKS.length;
  const ntBook = NT_BOOKS[ntIndex];
  const ntChapter = ((safeDay - 1) % ntBook.chapters) + 1;

  // 3. Calculate Psalm Chapter (1 to 150)
  const psalmChapter = ((safeDay - 1) % 150) + 1;

  // 4. Calculate Proverb Chapter (1 to 31)
  const proverbChapter = ((safeDay - 1) % 31) + 1;

  return {
    dayNumber: safeDay,
    title: `Day ${safeDay} — Daily Bread`,
    oldTestament: {
      bookId: otBook.id,
      bookName: otBook.name,
      chapter: otChapter,
      displayText: `${otBook.name} ${otChapter}`,
    },
    newTestament: {
      bookId: ntBook.id,
      bookName: ntBook.name,
      chapter: ntChapter,
      displayText: `${ntBook.name} ${ntChapter}`,
    },
    psalm: {
      bookId: 'PSA',
      bookName: 'Psalms',
      chapter: psalmChapter,
      displayText: `Psalms ${psalmChapter}`,
    },
    proverb: {
      bookId: 'PRO',
      bookName: 'Proverbs',
      chapter: proverbChapter,
      displayText: `Proverbs ${proverbChapter}`,
    },
  };
}

/**
 * Calculates current day number of the year (1 - 365).
 */
export function getCurrentYearDayNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.min(365, Math.floor(diff / oneDay));
}
