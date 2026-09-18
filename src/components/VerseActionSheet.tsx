import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { Bookmark, FileText, Copy, Share2, X, Check } from 'lucide-react-native';
import { useBibleStore, HighlightColor } from '../store/useBibleStore';
import { BIBLE_BOOKS, Verse } from '../data/bibleData';
import { formatVerseShareText } from '../engine/bibleEngine';
import { useRouter } from 'expo-router';

interface VerseActionSheetProps {
  verses: Verse[];
  onAddNote: () => void;
}

const COLOR_MAP: Record<HighlightColor, string> = {
  gold: '#EAB308',
  sapphire: '#3B82F6',
  emerald: '#22C55E',
  rose: '#F43F5E',
  purple: '#A855F7',
};

export const VerseActionSheet: React.FC<VerseActionSheetProps> = ({ verses, onAddNote }) => {
  const router = useRouter();
  const {
    activeBookId,
    activeChapter,
    selectedVerseNumbers,
    clearVerseSelection,
    setHighlight,
    addBookmark,
    isBookmarked,
    translation,
  } = useBibleStore();

  const currentBook = BIBLE_BOOKS.find(b => b.id === activeBookId);
  const bookName = currentBook?.name || activeBookId;

  if (selectedVerseNumbers.length === 0) return null;

  const selectedVerses = verses.filter(v => selectedVerseNumbers.includes(v.verse));
  const isSingleVerse = selectedVerseNumbers.length === 1;
  const singleVerseNum = selectedVerseNumbers[0];
  const isBookmarkedVerse = isSingleVerse ? isBookmarked(activeBookId, activeChapter, singleVerseNum) : false;

  const handleHighlight = (color: HighlightColor) => {
    selectedVerses.forEach(v => {
      setHighlight(activeBookId, bookName, activeChapter, v.verse, v.text, color);
    });
    clearVerseSelection();
  };

  const handleBookmarkToggle = () => {
    selectedVerses.forEach(v => {
      addBookmark({
        bookId: activeBookId,
        bookName,
        chapter: activeChapter,
        verse: v.verse,
        text: v.text,
      });
    });
    clearVerseSelection();
  };

  const handleCopyText = () => {
    const formatted = formatVerseShareText(bookName, activeChapter, selectedVerses, translation);
    // Share / Copy action
    Share.share({ message: formatted });
    clearVerseSelection();
  };

  const handleShare = () => {
    const formatted = formatVerseShareText(bookName, activeChapter, selectedVerses, translation);
    Share.share({
      title: `${bookName} ${activeChapter}`,
      message: formatted,
    });
    clearVerseSelection();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>
          {bookName} {activeChapter}:{selectedVerseNumbers.join(', ')}
        </Text>
        <TouchableOpacity onPress={clearVerseSelection} style={styles.closeBtn}>
          <X size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* Color Palette Selector */}
      <View style={styles.colorsRow}>
        {(Object.keys(COLOR_MAP) as HighlightColor[]).map((col) => (
          <TouchableOpacity
            key={col}
            onPress={() => handleHighlight(col)}
            style={[styles.colorCircle, { backgroundColor: COLOR_MAP[col] }]}
          />
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity onPress={onAddNote} style={styles.actionBtn}>
          <FileText size={18} color="#F8FAFC" />
          <Text style={styles.actionLabel}>Note</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleBookmarkToggle} style={styles.actionBtn}>
          <Bookmark size={18} color={isBookmarkedVerse ? '#D4AF37' : '#F8FAFC'} />
          <Text style={[styles.actionLabel, isBookmarkedVerse && { color: '#D4AF37' }]}>
            {isBookmarkedVerse ? 'Saved' : 'Bookmark'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleCopyText} style={styles.actionBtn}>
          <Copy size={18} color="#F8FAFC" />
          <Text style={styles.actionLabel}>Copy</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
          <Share2 size={18} color="#F8FAFC" />
          <Text style={styles.actionLabel}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 16,
    zIndex: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  colorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    marginBottom: 12,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#0F172A',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  actionLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});
