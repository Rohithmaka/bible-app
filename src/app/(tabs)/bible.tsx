import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Clipboard,
  ActivityIndicator,
  TextInput,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useBibleStore, HighlightColor, ThemeMode } from '../../store/useBibleStore';
import { useSpiritualStore } from '../../store/useSpiritualStore';
import { BIBLE_BOOKS, Verse } from '../../data/bibleData';
import { getNextChapterLocation, getPrevChapterLocation, formatVerseShareText, getLocalizedBookName } from '../../engine/bibleEngine';
import { fetchChapterVerses, fetchParallelChapterVerses, ParallelChapterResult } from '../../engine/multiBibleService';
import { TRANSLATION_CATALOG, getTranslationInfo, SUPPORTED_LANGUAGES } from '../../engine/translationCatalog';
import { SpiritualTheme } from '../../constants/spiritualTheme';
import { triggerLightHaptic, triggerMediumHaptic, triggerSuccessHaptic } from '../../services/mobileHaptics';
import { shareScriptureVerse } from '../../services/mobileShare';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Search,
  Bookmark as BookmarkIcon,
  Copy,
  Type,
  X,
  Share2,
  Columns,
  Info,
  HeartHandshake,
  Check,
  Edit3,
  SlidersHorizontal,
} from 'lucide-react-native';

export default function BibleReaderScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();

  const {
    activeBookId,
    activeChapter,
    selectedVerseNumbers,
    translation,
    parallelMode,
    parallelTranslations,
    themeMode,
    fontSize,
    lineSpacing,
    verseSpacing,
    showVerseNumbers,
    highlights,
    bookmarks,
    notes,
    setLocation,
    toggleVerseSelection,
    clearVerseSelection,
    setTranslation,
    setParallelMode,
    toggleParallelTranslation,
    setThemeMode,
    setFontSize,
    setLineSpacing,
    setVerseSpacing,
    setHighlight,
    removeHighlight,
    addBookmark,
    removeBookmark,
    isBookmarked,
    saveNote,
  } = useBibleStore();

  const { addMemoryVerse } = useSpiritualStore();

  // Palette handling based on themeMode
  const isDark = themeMode === 'dark';
  const isSepia = themeMode === 'sepia';
  const palette = isSepia
    ? {
        ...SpiritualTheme.light,
        background: '#FBF0D9',
        card: '#F3E5C8',
        cardBorder: '#E2D2B4',
        textPrimary: '#4A3B2C',
        textSecondary: '#7C6752',
        border: '#E2D2B4',
      }
    : isDark
    ? SpiritualTheme.dark
    : SpiritualTheme.light;

  // Modals state
  const [isTranslationMenuOpen, setIsTranslationMenuOpen] = useState(false);
  const [pickerStep, setPickerStep] = useState<'language' | 'version'>('language');
  const [selectedLangCode, setSelectedLangCode] = useState<string>('en');
  const [langSearchQuery, setLangSearchQuery] = useState<string>('');
  const [isBookPickerOpen, setIsBookPickerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');

  const openTranslationMenu = () => {
    const currentInfo = getTranslationInfo(translation);
    if (currentInfo) {
      setSelectedLangCode(currentInfo.languageCode);
    } else {
      setSelectedLangCode('en');
    }
    setPickerStep('language');
    setLangSearchQuery('');
    setIsTranslationMenuOpen(true);
  };

  // Verses state
  const [verses, setVerses] = useState<Verse[]>([]);
  const [parallelVerses, setParallelVerses] = useState<ParallelChapterResult[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);

  // Read params if passed from navigation
  const currentBookId = (searchParams.bookId as string) || activeBookId;
  const currentChapter = searchParams.chapter ? parseInt(searchParams.chapter as string, 10) : activeChapter;
  const currentBook = BIBLE_BOOKS.find((b) => b.id === currentBookId) || BIBLE_BOOKS[0];

  // Load primary / parallel verses
  useEffect(() => {
    let isMounted = true;
    setIsLoadingVerses(true);

    if (parallelMode) {
      fetchParallelChapterVerses(currentBook.id, currentBook.name, currentChapter, parallelTranslations).then((parallelData) => {
        if (isMounted) {
          setParallelVerses(parallelData);
          if (parallelData.length > 0) {
            setVerses(parallelData[0].verses);
          }
          setIsLoadingVerses(false);
        }
      });
    } else {
      fetchChapterVerses(currentBook.id, currentBook.name, currentChapter, translation).then((loaded) => {
        if (isMounted) {
          setVerses(loaded);
          setIsLoadingVerses(false);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [currentBook.id, currentChapter, translation, parallelMode, parallelTranslations]);

  const handleNextChapter = () => {
    triggerLightHaptic();
    const next = getNextChapterLocation(currentBook.id, currentChapter);
    if (next) {
      setLocation(next.bookId, next.chapter);
      clearVerseSelection();
    }
  };

  const handlePrevChapter = () => {
    triggerLightHaptic();
    const prev = getPrevChapterLocation(currentBook.id, currentChapter);
    if (prev) {
      setLocation(prev.bookId, prev.chapter);
      clearVerseSelection();
    }
  };

  const handleVersePress = (verseNum: number) => {
    triggerLightHaptic();
    toggleVerseSelection(verseNum);
  };

  const selectedVerses = verses.filter((v) => selectedVerseNumbers.includes(v.verse));
  const hasSelection = selectedVerseNumbers.length > 0;

  // Actions
  const handleToggleBookmark = () => {
    triggerLightHaptic();
    if (selectedVerseNumbers.length === 0) return;
    const vNum = selectedVerseNumbers[0];
    const vText = verses.find((v) => v.verse === vNum)?.text || '';

    if (isBookmarked(currentBook.id, currentChapter, vNum)) {
      const bm = bookmarks.find((b) => b.bookId === currentBook.id && b.chapter === currentChapter && b.verse === vNum);
      if (bm) removeBookmark(bm.id);
    } else {
      addBookmark({
        bookId: currentBook.id,
        bookName: currentBook.name,
        chapter: currentChapter,
        verse: vNum,
        text: vText,
      });
    }
    clearVerseSelection();
  };

  const handleApplyHighlight = (color: HighlightColor) => {
    triggerLightHaptic();
    selectedVerseNumbers.forEach((vNum) => {
      const vText = verses.find((v) => v.verse === vNum)?.text || '';
      const vKey = `${currentBook.id}:${currentChapter}:${vNum}`;
      if (highlights[vKey]?.color === color) {
        removeHighlight(vKey);
      } else {
        setHighlight(currentBook.id, currentBook.name, currentChapter, vNum, vText, color);
      }
    });
    clearVerseSelection();
  };

  const handleCopy = () => {
    triggerLightHaptic();
    const shareText = formatVerseShareText(currentBook.name, currentChapter, selectedVerses, translation);
    Clipboard.setString(shareText);
    clearVerseSelection();
  };

  const handleShareText = async () => {
    triggerLightHaptic();
    const primaryVerse = selectedVerses[0];
    if (primaryVerse) {
      await shareScriptureVerse(`${currentBook.name} ${currentChapter}:${primaryVerse.verse}`, primaryVerse.text, translation);
    }
    clearVerseSelection();
  };

  const handlePrayAboutThis = () => {
    triggerMediumHaptic();
    if (selectedVerses.length === 0) return;
    const primaryVerse = selectedVerses[0];

    const verseRef = `${currentBook.name} ${currentChapter}:${primaryVerse.verse}`;
    const verseText = primaryVerse.text;

    clearVerseSelection();

    // Navigate to Prayer Tab with verse context prefilled
    router.push({
      pathname: '/(tabs)/prayer',
      params: {
        action: 'create',
        scriptureRef: verseRef,
        scriptureText: verseText,
      },
    });
  };

  const handleSaveNote = () => {
    if (selectedVerseNumbers.length === 0 || !noteContent.trim()) return;
    const vNum = selectedVerseNumbers[0];
    const vText = verses.find((v) => v.verse === vNum)?.text || '';

    saveNote(currentBook.id, currentBook.name, currentChapter, vNum, vText, noteContent.trim());
    setNoteContent('');
    setIsNoteModalOpen(false);
    clearVerseSelection();
    triggerSuccessHaptic();
  };

  // Typography Styles based on settings
  const getFontSizeStyle = () => {
    switch (fontSize) {
      case 'sm':
        return 15;
      case 'lg':
        return 19;
      case 'xl':
        return 22;
      default:
        return 17; // md
    }
  };

  const getLineHeightStyle = () => {
    const base = getFontSizeStyle();
    switch (lineSpacing) {
      case 'normal':
        return base * 1.4;
      case 'spacious':
        return base * 1.9;
      default:
        return base * 1.6; // relaxed
    }
  };

  const getVerseMarginStyle = () => {
    switch (verseSpacing) {
      case 'compact':
        return 6;
      case 'spacious':
        return 18;
      default:
        return 12; // normal
    }
  };

  const currentTranslationInfo = getTranslationInfo(translation);

  // Language & Version Picker Helper Calculations
  const filteredLanguages = SUPPORTED_LANGUAGES.filter((lang) => {
    if (!langSearchQuery.trim()) return true;
    const q = langSearchQuery.toLowerCase();
    return lang.name.toLowerCase().includes(q) || lang.nativeName.toLowerCase().includes(q);
  });

  const currentSelectedLangInfo = SUPPORTED_LANGUAGES.find(
    (l) => l.code.toLowerCase() === selectedLangCode.toLowerCase()
  );
  const versionsForSelectedLang = TRANSLATION_CATALOG.filter(
    (t) => t.languageCode.toLowerCase() === selectedLangCode.toLowerCase() && t.active
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      {/* Top Header Controls */}
      <View style={[styles.header, { borderBottomColor: palette.border }]}>
        <TouchableOpacity style={styles.headerPill} onPress={openTranslationMenu}>
          <Text style={[styles.headerPillText, { color: palette.textPrimary }]}>{translation}</Text>
          {parallelMode ? <Columns size={12} color="#D97706" style={{ marginLeft: 4 }} /> : null}
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerBookButton} onPress={() => setIsBookPickerOpen(true)}>
          <Text style={[styles.headerBookTitle, { color: palette.textPrimary }]}>
            {getLocalizedBookName(currentBook.id, translation)} {currentChapter}
          </Text>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setParallelMode(!parallelMode)}>
            <Columns size={20} color={parallelMode ? '#D97706' : palette.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/bible-search')}>
            <Search size={20} color={palette.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={() => setIsSettingsOpen(true)}>
            <SlidersHorizontal size={20} color={palette.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Chapter Reader Content */}
      <ScrollView contentContainerStyle={styles.readerContent} showsVerticalScrollIndicator={false}>
        {/* Chapter Header Title */}
        <View style={styles.chapterHeaderContainer}>
          <Text style={[styles.chapterHeaderTitle, { color: palette.textPrimary }]}>
            {getLocalizedBookName(currentBook.id, translation)} {currentChapter}
          </Text>

          {currentTranslationInfo ? (
            <View style={styles.licenseNoticeRow}>
              <Text style={[styles.licenseNoticeText, { color: palette.textSecondary }]}>
                {currentTranslationInfo.fullName}
              </Text>
            </View>
          ) : null}
        </View>

        {isLoadingVerses ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D97706" />
            <Text style={[styles.loadingText, { color: palette.textSecondary }]}>Loading Scripture...</Text>
          </View>
        ) : parallelMode ? (
          /* PARALLEL BIBLE VIEW (2 - 4 Translations Side-by-Side per verse) */
          <View style={styles.parallelContainer}>
            {verses.map((vItem) => (
              <View
                key={`par-v-${vItem.verse}`}
                style={[
                  styles.parallelVerseBlock,
                  { borderBottomColor: palette.border, marginBottom: getVerseMarginStyle() },
                ]}
              >
                <View style={styles.verseNumberBadge}>
                  <Text style={styles.verseNumberText}>{vItem.verse}</Text>
                </View>

                {parallelVerses.map((pCol) => {
                  const pVerse = pCol.verses.find((pv) => pv.verse === vItem.verse);
                  return (
                    <View key={`col-${pCol.translationId}-${vItem.verse}`} style={styles.parallelCol}>
                      <Text style={styles.parallelTransTag}>{pCol.translationId}</Text>
                      <Text
                        style={[
                          styles.verseText,
                          {
                            fontSize: getFontSizeStyle() * 0.95,
                            lineHeight: getLineHeightStyle() * 0.95,
                            color: palette.textPrimary,
                          },
                        ]}
                      >
                        {pVerse ? pVerse.text : '...'}
                      </Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        ) : (
          /* SINGLE BIBLE VIEW */
          <View style={styles.singleVerseContainer}>
            {verses.map((v) => {
              const isSelected = selectedVerseNumbers.includes(v.verse);
              const vKey = `${currentBook.id}:${currentChapter}:${v.verse}`;
              const highlight = highlights[vKey];
              const note = notes[vKey];
              const bookmarked = isBookmarked(currentBook.id, currentChapter, v.verse);

              let bgColor = 'transparent';
              if (isSelected) bgColor = 'rgba(217, 119, 6, 0.15)';
              else if (highlight) {
                switch (highlight.color) {
                  case 'gold':
                    bgColor = 'rgba(234, 179, 8, 0.25)';
                    break;
                  case 'emerald':
                    bgColor = 'rgba(16, 185, 129, 0.25)';
                    break;
                  case 'rose':
                    bgColor = 'rgba(244, 63, 94, 0.25)';
                    break;
                  case 'purple':
                    bgColor = 'rgba(168, 85, 247, 0.25)';
                    break;
                  default:
                    bgColor = 'rgba(59, 130, 246, 0.25)';
                    break;
                }
              }

              return (
                <TouchableOpacity
                  key={`v-${v.verse}`}
                  activeOpacity={0.7}
                  onPress={() => handleVersePress(v.verse)}
                  style={[
                    styles.verseRow,
                    {
                      backgroundColor: bgColor,
                      marginBottom: getVerseMarginStyle(),
                      borderRadius: isSelected || highlight ? 8 : 0,
                    },
                  ]}
                >
                  {showVerseNumbers ? (
                    <Text style={[styles.verseNumber, { color: isSelected ? '#D97706' : palette.textSecondary }]}>
                      {v.verse}{' '}
                    </Text>
                  ) : null}

                  <Text
                    style={[
                      styles.verseText,
                      {
                        fontSize: getFontSizeStyle(),
                        lineHeight: getLineHeightStyle(),
                        color: palette.textPrimary,
                      },
                    ]}
                  >
                    {v.text}
                  </Text>

                  {bookmarked ? <BookmarkIcon size={12} color="#D97706" style={styles.indicatorIcon} /> : null}
                  {note ? <Edit3 size={12} color="#2563EB" style={styles.indicatorIcon} /> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Next/Prev Chapter Navigation Footer */}
        <View style={styles.navFooter}>
          <TouchableOpacity style={[styles.navButton, { borderColor: palette.border }]} onPress={handlePrevChapter}>
            <ChevronLeft size={20} color={palette.textPrimary} />
            <Text style={[styles.navButtonText, { color: palette.textPrimary }]}>Previous</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.navButton, { borderColor: palette.border }]} onPress={handleNextChapter}>
            <Text style={[styles.navButtonText, { color: palette.textPrimary }]}>Next</Text>
            <ChevronRight size={20} color={palette.textPrimary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Verse Action Sheet */}
      {hasSelection ? (
        <View style={[styles.actionSheet, { backgroundColor: palette.card, borderTopColor: palette.border }]}>
          <View style={styles.actionSheetHeader}>
            <Text style={[styles.actionSheetTitle, { color: palette.textPrimary }]}>
              {selectedVerseNumbers.length === 1
                ? `${getLocalizedBookName(currentBook.id, translation)} ${currentChapter}:${selectedVerseNumbers[0]}`
                : `${getLocalizedBookName(currentBook.id, translation)} ${currentChapter}:${selectedVerseNumbers[0]}-${
                    selectedVerseNumbers[selectedVerseNumbers.length - 1]
                  }`}
            </Text>
            <TouchableOpacity onPress={clearVerseSelection}>
              <X size={20} color={palette.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Highlights Palette */}
          <View style={styles.colorRow}>
            {(['gold', 'emerald', 'rose', 'purple', 'sapphire'] as HighlightColor[]).map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorDot,
                  {
                    backgroundColor:
                      c === 'gold'
                        ? '#EAB308'
                        : c === 'emerald'
                        ? '#10B981'
                        : c === 'rose'
                        ? '#F43F5E'
                        : c === 'purple'
                        ? '#A855F7'
                        : '#3B82F6',
                  },
                ]}
                onPress={() => handleApplyHighlight(c)}
              />
            ))}
          </View>

          {/* Primary Action Buttons */}
          <View style={styles.actionButtonRow}>
            <TouchableOpacity style={styles.prayActionButton} onPress={handlePrayAboutThis}>
              <HeartHandshake size={18} color="#FFFFFF" />
              <Text style={styles.prayActionText}>Pray About This</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconActionButton} onPress={handleToggleBookmark}>
              <BookmarkIcon
                size={18}
                color={
                  selectedVerseNumbers.length > 0 &&
                  isBookmarked(currentBook.id, currentChapter, selectedVerseNumbers[0])
                    ? '#D97706'
                    : palette.textPrimary
                }
              />
              <Text style={[styles.iconActionLabel, { color: palette.textPrimary }]}>Bookmark</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconActionButton} onPress={() => setIsNoteModalOpen(true)}>
              <Edit3 size={18} color={palette.textPrimary} />
              <Text style={[styles.iconActionLabel, { color: palette.textPrimary }]}>Note</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconActionButton} onPress={handleCopy}>
              <Copy size={18} color={palette.textPrimary} />
              <Text style={[styles.iconActionLabel, { color: palette.textPrimary }]}>Copy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconActionButton} onPress={handleShareText}>
              <Share2 size={18} color={palette.textPrimary} />
              <Text style={[styles.iconActionLabel, { color: palette.textPrimary }]}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* MODAL 1: TWO-STEP LANGUAGE & VERSION PICKER (TOP-TO-BOTTOM FULL SCREEN) */}
      <Modal visible={isTranslationMenuOpen} animationType="slide">
        <SafeAreaView style={[styles.fullScreenModalContainer, { backgroundColor: palette.background }]}>
          {/* Header */}
          <View style={[styles.fullModalHeader, { borderBottomColor: palette.border }]}>
            {pickerStep === 'version' ? (
              <TouchableOpacity
                style={styles.modalBackBtn}
                onPress={() => {
                  triggerLightHaptic();
                  setPickerStep('language');
                }}
              >
                <ChevronLeft size={22} color={palette.textPrimary} />
                <Text style={[styles.modalBackText, { color: palette.textPrimary }]}>Languages</Text>
              </TouchableOpacity>
            ) : (
              <Text style={[styles.fullModalTitle, { color: palette.textPrimary }]}>
                {parallelMode ? 'Select Parallel Translation' : 'Select Language'}
              </Text>
            )}

            <TouchableOpacity
              onPress={() => {
                triggerLightHaptic();
                setIsTranslationMenuOpen(false);
              }}
              style={styles.modalCloseIconBtn}
            >
              <X size={24} color={palette.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* STEP 1: LANGUAGE SELECTION */}
          {pickerStep === 'language' ? (
            <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}>
              {/* Search Bar for Languages */}
              <View style={[styles.langSearchBox, { backgroundColor: palette.card, borderColor: palette.border }]}>
                <Search size={18} color={palette.textSecondary} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.langSearchInput, { color: palette.textPrimary }]}
                  placeholder="Search language..."
                  placeholderTextColor={palette.textSecondary}
                  value={langSearchQuery}
                  onChangeText={setLangSearchQuery}
                />
                {langSearchQuery ? (
                  <TouchableOpacity onPress={() => setLangSearchQuery('')}>
                    <X size={18} color={palette.textSecondary} />
                  </TouchableOpacity>
                ) : null}
              </View>

              <ScrollView style={{ flex: 1, marginTop: 12 }} showsVerticalScrollIndicator={false}>
                {filteredLanguages.map((lang) => {
                  const isCurrentLang = lang.code.toLowerCase() === selectedLangCode.toLowerCase();
                  const vCount = TRANSLATION_CATALOG.filter(
                    (t) => t.languageCode.toLowerCase() === lang.code.toLowerCase()
                  ).length;

                  return (
                    <TouchableOpacity
                      key={lang.code}
                      style={[
                        styles.langItemRow,
                        {
                          borderBottomColor: palette.border,
                          backgroundColor: isCurrentLang ? 'rgba(217, 119, 6, 0.08)' : 'transparent',
                        },
                      ]}
                      onPress={() => {
                        triggerLightHaptic();
                        setSelectedLangCode(lang.code);
                        setPickerStep('version');
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.langNameText, { color: palette.textPrimary }]}>{lang.name}</Text>
                        <Text style={[styles.langNativeText, { color: palette.textSecondary }]}>{lang.nativeName}</Text>
                      </View>
                      <View style={styles.langRightBadgeRow}>
                        <Text style={[styles.langVersionCountText, { color: palette.textSecondary }]}>
                          {vCount} {vCount === 1 ? 'version' : 'versions'}
                        </Text>
                        <ChevronRight size={18} color={palette.textSecondary} style={{ marginLeft: 6 }} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          ) : (
            /* STEP 2: VERSION SELECTION FOR SELECTED LANGUAGE */
            <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 12 }}>
              <View style={[styles.selectedLangHeaderCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
                <Text style={[styles.selectedLangHeaderText, { color: palette.textSecondary }]}>
                  Language:{' '}
                  <Text style={{ fontWeight: '700', color: palette.textPrimary }}>
                    {currentSelectedLangInfo?.name || selectedLangCode}
                  </Text>{' '}
                  {currentSelectedLangInfo?.nativeName ? `(${currentSelectedLangInfo.nativeName})` : ''}
                </Text>
                <TouchableOpacity onPress={() => setPickerStep('language')}>
                  <Text style={styles.changeLangLinkText}>Change</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={{ flex: 1, marginTop: 12 }} showsVerticalScrollIndicator={false}>
                {versionsForSelectedLang.map((t) => {
                  const isSelected = parallelMode
                    ? parallelTranslations.includes(t.translationId)
                    : translation === t.translationId;

                  return (
                    <TouchableOpacity
                      key={t.translationId}
                      style={[
                        styles.versionItemCard,
                        {
                          borderColor: isSelected ? '#D97706' : palette.border,
                          backgroundColor: isSelected ? 'rgba(217, 119, 6, 0.1)' : palette.card,
                        },
                      ]}
                      onPress={() => {
                        triggerLightHaptic();
                        if (parallelMode) {
                          toggleParallelTranslation(t.translationId);
                        } else {
                          setTranslation(t.translationId);
                          setIsTranslationMenuOpen(false);
                        }
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.versionAbbrText, { color: palette.textPrimary }]}>{t.abbreviation}</Text>
                        <Text style={[styles.versionFullNameText, { color: palette.textSecondary }]}>{t.fullName}</Text>
                      </View>

                      {isSelected ? <Check size={22} color="#D97706" /> : null}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* MODAL 2: BOOK & CHAPTER PICKER */}
      <Modal visible={isBookPickerOpen} animationType="fade" transparent>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsBookPickerOpen(false)}>
          <View style={[styles.modalContent, { backgroundColor: palette.card, maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>Select Book & Chapter</Text>
              <TouchableOpacity onPress={() => setIsBookPickerOpen(false)}>
                <X size={24} color={palette.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1 }}>
              {BIBLE_BOOKS.map((b) => (
                <View key={b.id} style={[styles.bookRow, { borderBottomColor: palette.border }]}>
                  <Text style={[styles.bookRowName, { color: palette.textPrimary }]}>
                    {getLocalizedBookName(b.id, translation)}
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chapterGrid}>
                    {Array.from({ length: b.chaptersCount }, (_, i) => i + 1).map((ch) => (
                      <TouchableOpacity
                        key={`${b.id}-ch-${ch}`}
                        style={[
                          styles.chapterChip,
                          b.id === currentBook.id && ch === currentChapter && styles.activeChapterChip,
                        ]}
                        onPress={() => {
                          setLocation(b.id, ch);
                          setIsBookPickerOpen(false);
                          clearVerseSelection();
                        }}
                      >
                        <Text
                          style={[
                            styles.chapterChipText,
                            b.id === currentBook.id && ch === currentChapter && styles.activeChapterChipText,
                          ]}
                        >
                          {ch}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL 3: READING CONTROLS & TYPOGRAPHY SETTINGS */}
      <Modal visible={isSettingsOpen} animationType="slide" transparent>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsSettingsOpen(false)}>
          <View style={[styles.modalContent, { backgroundColor: palette.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>Reading Preferences</Text>
              <TouchableOpacity onPress={() => setIsSettingsOpen(false)}>
                <X size={24} color={palette.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.settingLabel, { color: palette.textSecondary }]}>Theme Mode</Text>
            <View style={styles.settingPillRow}>
              {(['light', 'dark', 'sepia'] as ThemeMode[]).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.settingPill,
                    themeMode === mode && styles.activeSettingPill,
                    { borderColor: palette.border },
                  ]}
                  onPress={() => setThemeMode(mode)}
                >
                  <Text style={[styles.settingPillText, themeMode === mode && styles.activeSettingPillText]}>
                    {mode.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.settingLabel, { color: palette.textSecondary, marginTop: 14 }]}>Font Size</Text>
            <View style={styles.settingPillRow}>
              {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
                <TouchableOpacity
                  key={sz}
                  style={[styles.settingPill, fontSize === sz && styles.activeSettingPill, { borderColor: palette.border }]}
                  onPress={() => setFontSize(sz)}
                >
                  <Text style={[styles.settingPillText, fontSize === sz && styles.activeSettingPillText]}>
                    {sz.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.settingLabel, { color: palette.textSecondary, marginTop: 14 }]}>Line Spacing</Text>
            <View style={styles.settingPillRow}>
              {(['normal', 'relaxed', 'spacious'] as const).map((ls) => (
                <TouchableOpacity
                  key={ls}
                  style={[
                    styles.settingPill,
                    lineSpacing === ls && styles.activeSettingPill,
                    { borderColor: palette.border },
                  ]}
                  onPress={() => setLineSpacing(ls)}
                >
                  <Text style={[styles.settingPillText, lineSpacing === ls && styles.activeSettingPillText]}>
                    {ls.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL 4: STUDY NOTE INPUT */}
      <Modal visible={isNoteModalOpen} animationType="fade" transparent>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsNoteModalOpen(false)}>
          <View style={[styles.modalContent, { backgroundColor: palette.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>Add Study Note</Text>
              <TouchableOpacity onPress={() => setIsNoteModalOpen(false)}>
                <X size={24} color={palette.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.noteInput,
                { color: palette.textPrimary, borderColor: palette.border, backgroundColor: isDark ? '#1F2937' : '#F9FAFB' },
              ]}
              placeholder="Write your reflection or personal note on this verse..."
              placeholderTextColor={palette.textSecondary}
              multiline
              numberOfLines={4}
              value={noteContent}
              onChangeText={setNoteContent}
            />

            <TouchableOpacity style={styles.saveNoteButton} onPress={handleSaveNote}>
              <Text style={styles.saveNoteButtonText}>Save Reflection</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerPillText: {
    fontWeight: '800',
    fontSize: 13,
  },
  headerBookButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  headerBookTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 6,
  },
  readerContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  chapterHeaderContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  chapterHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  licenseNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  licenseNoticeText: {
    fontSize: 12,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  singleVerseContainer: {
    marginBottom: 24,
  },
  verseRow: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  verseNumber: {
    fontWeight: '800',
    fontSize: 13,
  },
  verseText: {
    fontWeight: '400',
  },
  indicatorIcon: {
    marginLeft: 4,
  },
  parallelContainer: {
    marginBottom: 24,
  },
  parallelVerseBlock: {
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  verseNumberBadge: {
    backgroundColor: '#D97706',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  verseNumberText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  parallelCol: {
    marginTop: 6,
  },
  parallelTransTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  navFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 10,
    gap: 6,
  },
  navButtonText: {
    fontWeight: '700',
    fontSize: 14,
  },
  actionSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  actionSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionSheetTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14,
    justifyContent: 'center',
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  actionButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prayActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D97706',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  prayActionText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  iconActionButton: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  iconActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  translationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  selectedTranslationOption: {
    backgroundColor: 'rgba(217, 119, 6, 0.08)',
  },
  translationInfoCol: {
    flex: 1,
  },
  translationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  translationAbbr: {
    fontSize: 16,
    fontWeight: '800',
  },
  translationLangBadge: {
    fontSize: 12,
  },
  pdSmallBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ccSmallBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  translationFullName: {
    fontSize: 13,
    marginTop: 2,
  },
  attributionLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    paddingVertical: 10,
  },
  attributionLinkText: {
    color: '#D97706',
    fontWeight: '700',
    fontSize: 13,
  },
  bookRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  bookRowName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  chapterGrid: {
    gap: 6,
  },
  chapterChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(156, 163, 175, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeChapterChip: {
    backgroundColor: '#D97706',
  },
  chapterChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  activeChapterChipText: {
    color: '#FFFFFF',
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  settingPillRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  settingPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  activeSettingPill: {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
  },
  settingPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
  },
  activeSettingPillText: {
    color: '#FFFFFF',
  },
  noteInput: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    height: 100,
    marginBottom: 16,
  },
  saveNoteButton: {
    backgroundColor: '#D97706',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveNoteButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  fullScreenModalContainer: {
    flex: 1,
  },
  fullModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalBackText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  fullModalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalCloseIconBtn: {
    padding: 4,
  },
  langSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  langSearchInput: {
    flex: 1,
    fontSize: 15,
  },
  langItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderRadius: 8,
    marginBottom: 4,
  },
  langNameText: {
    fontSize: 16,
    fontWeight: '700',
  },
  langNativeText: {
    fontSize: 13,
    marginTop: 2,
  },
  langRightBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langVersionCountText: {
    fontSize: 13,
    fontWeight: '500',
  },
  selectedLangHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  selectedLangHeaderText: {
    fontSize: 14,
  },
  changeLangLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D97706',
  },
  versionItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  versionAbbrText: {
    fontSize: 17,
    fontWeight: '800',
  },
  versionFullNameText: {
    fontSize: 14,
    marginTop: 4,
  },
});
