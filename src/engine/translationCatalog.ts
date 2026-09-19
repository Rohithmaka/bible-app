/**
 * ALTER Enterprise Bible Engine - Translation Catalog & Legal Licensing Registry
 * 
 * Every translation in ALTER must have verified license metadata before activation.
 * Never scrape copyrighted texts without permission.
 */

export interface TranslationLicenseInfo {
  translationId: string;
  abbreviation: string;
  fullName: string;
  languageCode: string; // ISO 639-1 code (en, te, hi, ta, etc.)
  languageName: string;
  countryRegion?: string;
  testamentSupport: 'OT' | 'NT' | 'BOTH';
  bookCount: number;
  licenseType: 'Public Domain' | 'CC BY-SA 4.0' | 'CC BY 4.0' | 'Open License' | 'Proprietary Licensed';
  copyrightHolder: string;
  copyrightNotice: string;
  attributionRequired: boolean;
  sourceUrl: string;
  licenseUrl: string;
  versionYear?: number;
  downloadable: boolean;
  offlineAvailable: boolean;
  active: boolean;
  verifiedLicense: boolean;
}

export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
  isIndianLanguage: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', isIndianLanguage: false },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', isIndianLanguage: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', isIndianLanguage: true },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', isIndianLanguage: true },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', isIndianLanguage: true },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', isIndianLanguage: true },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', isIndianLanguage: true },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', isIndianLanguage: true },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', isIndianLanguage: true },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', isIndianLanguage: true },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', isIndianLanguage: true },
  { code: 'ur', name: 'Urdu', nativeName: 'اُردُو', isIndianLanguage: true },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', isIndianLanguage: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', isIndianLanguage: false },
  { code: 'fr', name: 'French', nativeName: 'Français', isIndianLanguage: false },
  { code: 'de', name: 'German', nativeName: 'Deutsch', isIndianLanguage: false },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', isIndianLanguage: false },
  { code: 'la', name: 'Latin', nativeName: 'Latina', isIndianLanguage: false },
];

export const TRANSLATION_CATALOG: TranslationLicenseInfo[] = [
  // English Public Domain Translations
  {
    translationId: 'WEB',
    abbreviation: 'WEB',
    fullName: 'World English Bible',
    languageCode: 'en',
    languageName: 'English',
    countryRegion: 'Global',
    testamentSupport: 'BOTH',
    bookCount: 66,
    licenseType: 'Public Domain',
    copyrightHolder: 'Public Domain (Rainbow Missions, Inc.)',
    copyrightNotice: 'The World English Bible is in the Public Domain. Unlimited redistribution permitted.',
    attributionRequired: false,
    sourceUrl: 'https://worldenglish.bible/',
    licenseUrl: 'https://worldenglish.bible/copyright.htm',
    versionYear: 2000,
    downloadable: true,
    offlineAvailable: true,
    active: true,
    verifiedLicense: true,
  },
  {
    translationId: 'KJV',
    abbreviation: 'KJV',
    fullName: 'King James Version (1611/1769)',
    languageCode: 'en',
    languageName: 'English',
    countryRegion: 'Global / UK',
    testamentSupport: 'BOTH',
    bookCount: 66,
    licenseType: 'Public Domain',
    copyrightHolder: 'Public Domain (Crown Copyright in UK)',
    copyrightNotice: 'Public Domain globally. Rights in the United Kingdom subject to Crown Patent permissions.',
    attributionRequired: true,
    sourceUrl: 'https://www.kingjamesbibleonline.org/',
    licenseUrl: 'https://en.wikipedia.org/wiki/King_James_Version#Copyright_status',
    versionYear: 1769,
    downloadable: true,
    offlineAvailable: true,
    active: true,
    verifiedLicense: true,
  },
  {
    translationId: 'ASV',
    abbreviation: 'ASV',
    fullName: 'American Standard Version (1901)',
    languageCode: 'en',
    languageName: 'English',
    countryRegion: 'United States',
    testamentSupport: 'BOTH',
    bookCount: 66,
    licenseType: 'Public Domain',
    copyrightHolder: 'Public Domain (Thomas Nelson & Sons)',
    copyrightNotice: 'Public Domain in the United States and globally.',
    attributionRequired: false,
    sourceUrl: 'https://free.bible/',
    licenseUrl: 'https://en.wikipedia.org/wiki/American_Standard_Version',
    versionYear: 1901,
    downloadable: true,
    offlineAvailable: true,
    active: true,
    verifiedLicense: true,
  },
  {
    translationId: 'BBE',
    abbreviation: 'BBE',
    fullName: 'Bible in Basic English (1949/1965)',
    languageCode: 'en',
    languageName: 'English',
    countryRegion: 'Global',
    testamentSupport: 'BOTH',
    bookCount: 66,
    licenseType: 'Public Domain',
    copyrightHolder: 'Public Domain (Prof. S. H. Hooke / Cambridge University Press)',
    copyrightNotice: 'Public Domain in the US and countries with 50+ year post-mortem author terms.',
    attributionRequired: true,
    sourceUrl: 'https://free.bible/',
    licenseUrl: 'https://oet.bible/bbe.html',
    versionYear: 1949,
    downloadable: true,
    offlineAvailable: true,
    active: true,
    verifiedLicense: true,
  },
  {
    translationId: 'DARBY',
    abbreviation: 'Darby',
    fullName: 'Darby Translation (1890)',
    languageCode: 'en',
    languageName: 'English',
    countryRegion: 'United Kingdom',
    testamentSupport: 'BOTH',
    bookCount: 66,
    licenseType: 'Public Domain',
    copyrightHolder: 'Public Domain (John Nelson Darby)',
    copyrightNotice: 'Public Domain globally.',
    attributionRequired: false,
    sourceUrl: 'https://free.bible/',
    licenseUrl: 'https://en.wikipedia.org/wiki/Darby_Bible',
    versionYear: 1890,
    downloadable: true,
    offlineAvailable: true,
    active: true,
    verifiedLicense: true,
  },
  {
    translationId: 'YLT',
    abbreviation: 'YLT',
    fullName: "Young's Literal Translation (1862/1898)",
    languageCode: 'en',
    languageName: 'English',
    countryRegion: 'United Kingdom',
    testamentSupport: 'BOTH',
    bookCount: 66,
    licenseType: 'Public Domain',
    copyrightHolder: 'Public Domain (Robert Young)',
    copyrightNotice: 'Public Domain globally.',
    attributionRequired: false,
    sourceUrl: 'https://free.bible/',
    licenseUrl: 'https://en.wikipedia.org/wiki/Young%27s_Literal_Translation',
    versionYear: 1898,
    downloadable: true,
    offlineAvailable: true,
    active: true,
    verifiedLicense: true,
  },
  {
    translationId: 'DRA',
    abbreviation: 'DRA',
    fullName: 'Douay-Rheims Bible (Challoner 1752)',
    languageCode: 'en',
    languageName: 'English',
    countryRegion: 'Global',
    testamentSupport: 'BOTH',
    bookCount: 73,
    licenseType: 'Public Domain',
    copyrightHolder: 'Public Domain (Richard Challoner)',
    copyrightNotice: 'Public Domain globally.',
    attributionRequired: false,
    sourceUrl: 'https://free.bible/',
    licenseUrl: 'https://en.wikipedia.org/wiki/Douay%E2%80%93Rheims_Bible',
    versionYear: 1752,
    downloadable: true,
    offlineAvailable: true,
    active: true,
    verifiedLicense: true,
  },
  {
    translationId: 'GENEVA',
    abbreviation: 'Geneva',
    fullName: 'Geneva Bible (1599)',
    languageCode: 'en',
    languageName: 'English',
    countryRegion: 'Global',
    testamentSupport: 'BOTH',
    bookCount: 66,
    licenseType: 'Public Domain',
    copyrightHolder: 'Public Domain',
    copyrightNotice: 'Public Domain globally.',
    attributionRequired: false,
    sourceUrl: 'https://free.bible/',
    licenseUrl: 'https://en.wikipedia.org/wiki/Geneva_Bible',
    versionYear: 1599,
    downloadable: true,
    offlineAvailable: true,
    active: true,
    verifiedLicense: true,
  },

  // Telugu Open & CC BY-SA Translations
  {
    translationId: 'TEL_IRV',
    abbreviation: 'IRV-TEL',
    fullName: 'Indian Revised Version Telugu (IRV)',
    languageCode: 'te',
    languageName: 'Telugu',
    countryRegion: 'India',
    testamentSupport: 'BOTH',
    bookCount: 66,
    licenseType: 'CC BY-SA 4.0',
    copyrightHolder: 'Bridge Connectivity Solutions Pvt. Ltd.',
    copyrightNotice: '© Bridge Connectivity Solutions. Licensed under Creative Commons Attribution-ShareAlike 4.0 International.',
    attributionRequired: true,
    sourceUrl: 'https://freebiblesindia.in/bible/tel',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    versionYear: 2018,
    downloadable: true,
    offlineAvailable: true,
    active: true,
    verifiedLicense: true,
  },
  {
    translationId: 'TEL_FBI',
    abbreviation: 'FBI-TEL',
    fullName: 'Free Bibles India Telugu Bible',
    languageCode: 'te',
    languageName: 'Telugu',
    countryRegion: 'India',
    testamentSupport: 'BOTH',
    bookCount: 66,
    licenseType: 'CC BY-SA 4.0',
    copyrightHolder: 'Free Bibles India / BCS',
    copyrightNotice: '© Free Bibles India. Released under CC BY-SA 4.0 open license.',
    attributionRequired: true,
    sourceUrl: 'https://freebiblesindia.in/',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    versionYear: 2020,
    downloadable: true,
    offlineAvailable: true,
    active: true,
    verifiedLicense: true,
  },

  // Hindi Open Translations
  {
    translationId: 'HIN_IRV',
    abbreviation: 'IRV-HIN',
    fullName: 'Indian Revised Version Hindi (IRV)',
    languageCode: 'hi',
    languageName: 'Hindi',
    countryRegion: 'India',
    testamentSupport: 'BOTH',
    bookCount: 66,
    licenseType: 'CC BY-SA 4.0',
    copyrightHolder: 'Bridge Connectivity Solutions Pvt. Ltd.',
    copyrightNotice: '© Bridge Connectivity Solutions. Licensed under Creative Commons Attribution-ShareAlike 4.0 International.',
    attributionRequired: true,
    sourceUrl: 'https://freebiblesindia.in/bible/hin',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    versionYear: 2019,
    downloadable: true,
    offlineAvailable: true,
    active: true,
    verifiedLicense: true,
  },

  // Tamil Open Translations
  {
    translationId: 'TAM_IRV',
    abbreviation: 'IRV-TAM',
    fullName: 'Indian Revised Version Tamil (IRV)',
    languageCode: 'ta',
    languageName: 'Tamil',
    countryRegion: 'India',
    testamentSupport: 'BOTH',
    bookCount: 66,
    licenseType: 'CC BY-SA 4.0',
    copyrightHolder: 'Bridge Connectivity Solutions Pvt. Ltd.',
    copyrightNotice: '© Bridge Connectivity Solutions. Licensed under CC BY-SA 4.0.',
    attributionRequired: true,
    sourceUrl: 'https://freebiblesindia.in/bible/tam',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    versionYear: 2019,
    downloadable: true,
    offlineAvailable: true,
    active: true,
    verifiedLicense: true,
  },

  // Spanish Public Domain
  {
    translationId: 'RVR',
    abbreviation: 'RVR1909',
    fullName: 'Reina-Valera 1909',
    languageCode: 'es',
    languageName: 'Spanish',
    countryRegion: 'Spain / Latin America',
    testamentSupport: 'BOTH',
    bookCount: 66,
    licenseType: 'Public Domain',
    copyrightHolder: 'Public Domain (Sociedades Bíblicas Unidas)',
    copyrightNotice: 'Public Domain globally.',
    attributionRequired: false,
    sourceUrl: 'https://free.bible/',
    licenseUrl: 'https://en.wikipedia.org/wiki/Reina-Valera',
    versionYear: 1909,
    downloadable: true,
    offlineAvailable: true,
    active: true,
    verifiedLicense: true,
  },
  
  // French Public Domain
  {
    translationId: 'LSG',
    abbreviation: 'LSG1910',
    fullName: 'Louis Segond 1910',
    languageCode: 'fr',
    languageName: 'French',
    countryRegion: 'France / Francophone',
    testamentSupport: 'BOTH',
    bookCount: 66,
    licenseType: 'Public Domain',
    copyrightHolder: 'Public Domain (Louis Segond)',
    copyrightNotice: 'Public Domain globally.',
    attributionRequired: false,
    sourceUrl: 'https://free.bible/',
    licenseUrl: 'https://en.wikipedia.org/wiki/Louis_Segond',
    versionYear: 1910,
    downloadable: true,
    offlineAvailable: true,
    active: true,
    verifiedLicense: true,
  },
];

/**
 * Gets verified translation metadata by translation ID
 */
export function getTranslationInfo(translationId: string): TranslationLicenseInfo | undefined {
  const normId = translationId.toUpperCase();
  return TRANSLATION_CATALOG.find((t) => t.translationId === normId || t.abbreviation.toUpperCase() === normId);
}

/**
 * Filter active translations by language code
 */
export function getTranslationsByLanguage(languageCode: string): TranslationLicenseInfo[] {
  return TRANSLATION_CATALOG.filter((t) => t.languageCode.toLowerCase() === languageCode.toLowerCase() && t.active && t.verifiedLicense);
}
