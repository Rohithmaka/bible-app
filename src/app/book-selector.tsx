import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { BIBLE_BOOKS, BibleBook } from '../data/bibleData';
import { useBibleStore } from '../store/useBibleStore';
import { Search, X, ChevronRight, BookOpen } from 'lucide-react-native';

export default function BookSelectorModal() {
  const router = useRouter();
  const { activeBookId, activeChapter, setLocation, themeMode } = useBibleStore();

  const [selectedBook, setSelectedBook] = useState<BibleBook>(() => {
    return BIBLE_BOOKS.find(b => b.id === activeBookId) || BIBLE_BOOKS[0];
  });
  const [activeTab, setActiveTab] = useState<'OT' | 'NT'>('NT');
  const [searchQuery, setSearchQuery] = useState('');

  const isDark = themeMode === 'dark';
  const bgColor = isDark ? '#0F172A' : '#F8FAFC';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const borderColor = isDark ? '#334155' : '#E2E8F0';

  const filteredBooks = BIBLE_BOOKS.filter(b => {
    const matchesTestament = b.testament === activeTab;
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.abbreviation.toLowerCase().includes(searchQuery.toLowerCase());
    return searchQuery.length > 0 ? matchesSearch : matchesTestament;
  });

  const handleSelectChapter = (chapterNum: number) => {
    setLocation(selectedBook.id, chapterNum);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { borderColor }]}>
        <Text style={[styles.headerTitle, { color: textColor }]}>Select Book & Chapter</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={22} color={isDark ? '#94A3B8' : '#64748B'} />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: cardBg, borderColor }]}>
          <Search size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search books (e.g. Genesis, Matthew)..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Testament Tabs (Hidden when searching) */}
      {searchQuery.length === 0 && (
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab('OT')}
            style={[
              styles.tabButton,
              activeTab === 'OT' && styles.tabButtonActive,
            ]}
          >
            <Text style={[styles.tabText, activeTab === 'OT' && styles.tabTextActive]}>
              Old Testament (39)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('NT')}
            style={[
              styles.tabButton,
              activeTab === 'NT' && styles.tabButtonActive,
            ]}
          >
            <Text style={[styles.tabText, activeTab === 'NT' && styles.tabTextActive]}>
              New Testament (27)
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content Columns */}
      <View style={styles.contentRow}>
        {/* Left Side: Books List */}
        <ScrollView style={[styles.booksColumn, { borderColor }]}>
          {filteredBooks.map((book) => {
            const isSelected = selectedBook.id === book.id;
            return (
              <TouchableOpacity
                key={book.id}
                onPress={() => setSelectedBook(book)}
                style={[
                  styles.bookItem,
                  isSelected && { backgroundColor: isDark ? '#334155' : '#EEF2FF' },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.bookName,
                      { color: isSelected ? '#4F46E5' : textColor },
                      isSelected && { fontWeight: '700' },
                    ]}
                  >
                    {book.name}
                  </Text>
                  <Text style={styles.bookCategory}>{book.chaptersCount} chapters</Text>
                </View>
                {isSelected && <ChevronRight size={16} color="#4F46E5" />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Right Side: Chapter Grid Picker */}
        <ScrollView style={styles.chaptersColumn}>
          <Text style={[styles.chapterHeader, { color: textColor }]}>
            {selectedBook.name} Chapters
          </Text>
          <View style={styles.chapterGrid}>
            {Array.from({ length: selectedBook.chaptersCount }, (_, i) => i + 1).map((ch) => {
              const isCurrent = activeBookId === selectedBook.id && activeChapter === ch;
              return (
                <TouchableOpacity
                  key={ch}
                  onPress={() => handleSelectChapter(ch)}
                  style={[
                    styles.chapterSquare,
                    { backgroundColor: cardBg, borderColor },
                    isCurrent && styles.chapterSquareCurrent,
                  ]}
                >
                  <Text
                    style={[
                      styles.chapterNum,
                      { color: textColor },
                      isCurrent && styles.chapterNumCurrent,
                    ]}
                  >
                    {ch}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#4F46E5',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
  },
  booksColumn: {
    flex: 1.2,
    borderRightWidth: 1,
    paddingHorizontal: 8,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  bookName: {
    fontSize: 14,
    fontWeight: '600',
  },
  bookCategory: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  chaptersColumn: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  chapterHeader: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  chapterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 24,
  },
  chapterSquare: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterSquareCurrent: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  chapterNum: {
    fontSize: 14,
    fontWeight: '600',
  },
  chapterNumCurrent: {
    color: '#FFFFFF',
  },
});
