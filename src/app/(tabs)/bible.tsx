import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Clipboard, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useBibleStore, HighlightColor } from '../../store/useBibleStore';
import { useSpiritualStore } from '../../store/useSpiritualStore';
import { BIBLE_BOOKS, getChapterVerses, Verse } from '../../data/bibleData';
import { getNextChapterLocation, getPrevChapterLocation, formatVerseShareText } from '../../engine/bibleEngine';
import { fetchChapterVerses, AVAILABLE_TRANSLATIONS, TranslationMetadata } from '../../engine/multiBibleService';
import { SpiritualTheme, ScriptureTypography } from '../../constants/spiritualTheme';
import { triggerLightHaptic, triggerMediumHaptic, triggerSuccessHaptic } from '../../services/mobileHaptics';
import { shareScriptureVerse } from '../../services/mobileShare';
import { ChevronLeft, ChevronRight, BookOpen, Sparkles, Bookmark as BookmarkIcon, Copy, Brain, Type, X, Share2, Globe, Check } from 'lucide-react-native';

export default function BibleReaderScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();

  const {
    activeBookId,
    activeChapter,
    selectedVerseNumbers,
    translation,
    themeMode,
    fontSize,
    showVerseNumbers,
    highlights,
    bookmarks,
    setLocation,
    toggleVerseSelection,
    clearVerseSelection,
    setTranslation,
    setHighlight,
    removeHighlight,
    addBookmark,
    removeBookmark,
    isBookmarked,
    setFontSize,
  } = useBibleStore();

  const { addMemoryVerse } = useSpiritualStore();
  const isDark = themeMode === 'dark';
  const palette = isDark ? SpiritualTheme.dark : SpiritualTheme.light;

  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);
  const [isTranslationMenuOpen, setIsTranslationMenuOpen] = useState(false);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);

  // Read params if passed from navigation
  const currentBookId = (searchParams.bookId as string) || activeBookId;
  const currentChapter = searchParams.chapter ? parseInt(searchParams.chapter as string, 10) : activeChapter;

  const currentBook = BIBLE_BOOKS.find((b) => b.id === currentBookId) || BIBLE_BOOKS[0];

  // Load verses whenever book, chapter, or translation changes
  useEffect(() => {
    let isMounted = true;
    setIsLoadingVerses(true);

    fetchChapterVerses(currentBook.id, currentBook.name, currentChapter, translation).then((loaded) => {
      if (isMounted) {
        setVerses(loaded);
        setIsLoadingVerses(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentBook.id, currentChapter, translation]);

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

  const handleAddToMemory = () => {
    triggerSuccessHaptic();
    selectedVerses.forEach((v) => {
      addMemoryVerse({
        verseKey: `${currentBook.id}:${currentChapter}:${v.verse}`,
        bookName: currentBook.name,
        chapter: currentChapter,
        verse: v.verse,
        text: v.text,
        category: 'Personal Study',
      });
    });
    clearVerseSelection();
  };

  const handleLaunchStudy = () => {
    triggerLightHaptic();
    const primaryVerse = selectedVerseNumbers[0] || 1;
    clearVerseSelection();
    router.push({
      pathname: '/study-workspace' as any,
      params: { bookId: currentBook.id, chapter: currentChapter, verse: primaryVerse },
    });
  };

  const handleLaunchNote = () => {
    triggerLightHaptic();
    const primaryVerse = selectedVerseNumbers[0] || 1;
    const vText = verses.find((v) => v.verse === primaryVerse)?.text || '';
    clearVerseSelection();
    router.push({
      pathname: '/note-editor',
      params: {
        bookId: currentBook.id,
        bookName: currentBook.name,
        chapter: currentChapter,
        verse: primaryVerse,
        verseText: vText,
      },
    });
  };

  const fontSizePx = ScriptureTypography.fontSize[fontSize] || 18;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }} edges={['top', 'left', 'right']}>
      {/* Header Bar */}
      <View
        style={{
          paddingTop: 12,
          paddingHorizontal: 16,
          paddingBottom: 12,
          backgroundColor: palette.card,
          borderBottomWidth: 1,
          borderBottomColor: palette.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity
          onPress={() => {
            triggerLightHaptic();
            router.push('/book-selector');
          }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: palette.inputBg, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 }}
        >
          <BookOpen size={16} color={palette.accentGreen} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: palette.textPrimary }}>
            {currentBook.name} {currentChapter}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* 15 Translation Selector Launcher */}
          <TouchableOpacity
            onPress={() => {
              triggerLightHaptic();
              setIsTranslationMenuOpen(true);
            }}
            style={{ backgroundColor: palette.accentGreenLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Globe size={14} color={palette.accentGreen} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: palette.accentGreen, textTransform: 'uppercase' }}>
              {translation}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              triggerLightHaptic();
              setIsFontMenuOpen(true);
            }}
            style={{ padding: 8, borderRadius: 8, backgroundColor: palette.inputBg }}
          >
            <Type size={18} color={palette.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scripture Reading Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 24, fontWeight: '800', color: palette.textPrimary, marginBottom: 16, textAlign: 'center' }}>
          {currentBook.name} {currentChapter}
        </Text>

        {isLoadingVerses ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={palette.accentGreen} />
            <Text style={{ fontSize: 14, color: palette.textSecondary, marginTop: 12 }}>
              Loading {translation.toUpperCase()} scripture text...
            </Text>
          </View>
        ) : (
          verses.map((v) => {
            const isSelected = selectedVerseNumbers.includes(v.verse);
            const vKey = `${currentBook.id}:${currentChapter}:${v.verse}`;
            const highlightItem = highlights[vKey];

            let highlightBg = 'transparent';
            if (highlightItem) {
              if (highlightItem.color === 'gold') highlightBg = palette.highlightGold;
              if (highlightItem.color === 'sapphire') highlightBg = palette.highlightSapphire;
              if (highlightItem.color === 'emerald') highlightBg = palette.highlightEmerald;
              if (highlightItem.color === 'rose') highlightBg = palette.highlightRose;
              if (highlightItem.color === 'purple') highlightBg = palette.highlightPurple;
            }

            return (
              <TouchableOpacity
                key={v.verse}
                onPress={() => handleVersePress(v.verse)}
                activeOpacity={0.7}
                style={{
                  backgroundColor: isSelected ? palette.accentGreenLight : highlightBg,
                  borderRadius: 8,
                  paddingVertical: 6,
                  paddingHorizontal: 8,
                  marginBottom: 6,
                  borderLeftWidth: isSelected ? 3 : 0,
                  borderLeftColor: palette.accentGreen,
                }}
              >
                <Text
                  style={{
                    fontFamily: ScriptureTypography.fontFamilySerif,
                    fontSize: fontSizePx,
                    lineHeight: fontSizePx * ScriptureTypography.lineHeightRatio,
                    color: palette.textPrimary,
                  }}
                >
                  {showVerseNumbers && (
                    <Text style={{ fontSize: 12, fontWeight: '700', color: palette.accentGold, fontFamily: 'sans-serif' }}>
                      {v.verse}{' '}
                    </Text>
                  )}
                  {v.text}
                </Text>
              </TouchableOpacity>
            );
          })
        )}

        {/* Chapter Navigation Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, paddingTop: 16, borderTopWidth: 1, borderTopColor: palette.border }}>
          <TouchableOpacity
            onPress={handlePrevChapter}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: 12, backgroundColor: palette.card, borderRadius: 12, borderWidth: 1, borderColor: palette.cardBorder }}
          >
            <ChevronLeft size={18} color={palette.textPrimary} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: palette.textPrimary }}>Prev Chapter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNextChapter}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: 12, backgroundColor: palette.accentGreen, borderRadius: 12 }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>Next Chapter</Text>
            <ChevronRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Verse Action Sheet */}
      {hasSelection && (
        <View
          style={{
            position: 'absolute',
            bottom: 20,
            left: 16,
            right: 16,
            backgroundColor: palette.card,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: palette.cardBorder,
            padding: 16,
            elevation: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: palette.accentGold }}>
              {selectedVerseNumbers.length} Verse{selectedVerseNumbers.length > 1 ? 's' : ''} Selected
            </Text>
            <TouchableOpacity onPress={clearVerseSelection} style={{ padding: 4 }}>
              <X size={18} color={palette.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Color Highlighters */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: palette.border }}>
            {(['gold', 'sapphire', 'emerald', 'rose', 'purple'] as HighlightColor[]).map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => handleApplyHighlight(c)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor:
                    c === 'gold' ? '#EAB308' : c === 'sapphire' ? '#3B82F6' : c === 'emerald' ? '#22C55E' : c === 'rose' ? '#F43F5E' : '#A855F7',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              />
            ))}
          </View>

          {/* Main Action Buttons Grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={handleLaunchStudy} style={styles.actionGridItem}>
              <Sparkles size={18} color={palette.accentGreen} />
              <Text style={[styles.actionGridLabel, { color: palette.accentGreen }]}>Study</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLaunchNote} style={styles.actionGridItem}>
              <BookOpen size={18} color={palette.textPrimary} />
              <Text style={[styles.actionGridLabel, { color: palette.textPrimary }]}>Note</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleToggleBookmark} style={styles.actionGridItem}>
              <BookmarkIcon size={18} color={palette.accentGold} />
              <Text style={[styles.actionGridLabel, { color: palette.accentGold }]}>Bookmark</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleAddToMemory} style={styles.actionGridItem}>
              <Brain size={18} color={palette.textPrimary} />
              <Text style={[styles.actionGridLabel, { color: palette.textPrimary }]}>Memory</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleCopy} style={styles.actionGridItem}>
              <Copy size={18} color={palette.textSecondary} />
              <Text style={[styles.actionGridLabel, { color: palette.textSecondary }]}>Copy</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleShareText} style={styles.actionGridItem}>
              <Share2 size={18} color={palette.textSecondary} />
              <Text style={[styles.actionGridLabel, { color: palette.textSecondary }]}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 15 Bible Translations Selection Modal */}
      <Modal visible={isTranslationMenuOpen} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: palette.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Globe size={20} color={palette.accentGreen} />
                <Text style={{ fontSize: 18, fontWeight: '800', color: palette.textPrimary }}>
                  Bible Translations ({AVAILABLE_TRANSLATIONS.length})
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsTranslationMenuOpen(false)}>
                <X size={20} color={palette.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {AVAILABLE_TRANSLATIONS.map((t) => {
                const isSelected = translation.toLowerCase() === t.id.toLowerCase();
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => {
                      triggerLightHaptic();
                      setTranslation(t.id as any);
                      setIsTranslationMenuOpen(false);
                    }}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingVertical: 14,
                      paddingHorizontal: 14,
                      borderRadius: 12,
                      backgroundColor: isSelected ? palette.accentGreenLight : 'transparent',
                      marginBottom: 6,
                    }}
                  >
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: isSelected ? palette.accentGreen : palette.textPrimary }}>
                          {t.name}
                        </Text>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: palette.accentGold, textTransform: 'uppercase' }}>
                          ({t.id})
                        </Text>
                      </View>
                      <Text style={{ fontSize: 12, color: palette.textSecondary, marginTop: 2 }}>
                        {t.language} • {t.isLocalAvailable ? 'Offline Instant' : 'Online Translation'}
                      </Text>
                    </View>

                    {isSelected && <Check size={20} color={palette.accentGreen} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Typography / Font Size Modal */}
      <Modal visible={isFontMenuOpen} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: palette.card, borderRadius: 20, width: '85%', padding: 24, borderWidth: 1, borderColor: palette.cardBorder }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: palette.textPrimary }}>Text Size Settings</Text>
              <TouchableOpacity onPress={() => setIsFontMenuOpen(false)}>
                <X size={20} color={palette.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 14, color: palette.textSecondary, marginBottom: 12 }}>Choose Scripture Font Size:</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              {(['sm', 'md', 'lg', 'xl'] as const).map((sizeKey) => (
                <TouchableOpacity
                  key={sizeKey}
                  onPress={() => setFontSize(sizeKey)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: fontSize === sizeKey ? palette.accentGreen : palette.inputBg,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: fontSize === sizeKey ? '#FFFFFF' : palette.textPrimary, textTransform: 'uppercase' }}>
                    {sizeKey}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionGridItem: {
    width: '30%',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  actionGridLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
