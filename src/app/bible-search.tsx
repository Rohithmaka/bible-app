import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useBibleStore } from '../store/useBibleStore';
import { searchBible, parseVerseReference, SearchResult } from '../engine/bibleEngine';
import { TRANSLATION_CATALOG } from '../engine/translationCatalog';
import { SpiritualTheme } from '../constants/spiritualTheme';
import { ChevronLeft, Search as SearchIcon, X, BookOpen, ArrowRight, Filter } from 'lucide-react-native';
import { triggerLightHaptic } from '../services/mobileHaptics';

export default function BibleSearchScreen() {
  const router = useRouter();
  const { setLocation, themeMode, translation } = useBibleStore();
  const isDark = themeMode === 'dark';
  const palette = isDark ? SpiritualTheme.dark : SpiritualTheme.light;

  const [query, setQuery] = useState('');
  const [selectedTranslation, setSelectedTranslation] = useState(translation);
  const [testamentFilter, setTestamentFilter] = useState<'ALL' | 'OT' | 'NT'>('ALL');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (!text.trim() || text.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setTimeout(() => {
      // 1. Check if user typed a direct verse reference like "John 3:16"
      const parsedRef = parseVerseReference(text);
      if (parsedRef) {
        setResults([
          {
            bookId: parsedRef.bookId,
            bookName: parsedRef.bookName,
            testament: 'NT',
            chapter: parsedRef.chapter,
            verse: parsedRef.verse || 1,
            text: `Open ${parsedRef.bookName} Chapter ${parsedRef.chapter}${parsedRef.verse ? ` Verse ${parsedRef.verse}` : ''}`,
            matchedTerm: text,
            translationId: selectedTranslation,
          },
        ]);
        setIsSearching(false);
        return;
      }

      // 2. Perform text search
      const res = searchBible(text, testamentFilter, selectedTranslation);
      setResults(res);
      setIsSearching(false);
    }, 150);
  };

  const handleSelectResult = (item: SearchResult) => {
    triggerLightHaptic();
    setLocation(item.bookId, item.chapter);
    router.replace({
      pathname: '/(tabs)/bible',
      params: { bookId: item.bookId, chapter: item.chapter, verse: item.verse },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      {/* Search Header */}
      <View style={[styles.header, { borderBottomColor: (palette as any).border || palette.cardBorder }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={palette.textPrimary} />
        </TouchableOpacity>

        <View style={[styles.searchInputContainer, { backgroundColor: (palette as any).cardBg || palette.card, borderColor: (palette as any).border || palette.cardBorder }]}>
          <SearchIcon size={18} color={palette.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: palette.textPrimary }]}
            placeholder="Search verses, phrases, or John 3:16..."
            placeholderTextColor={palette.textSecondary}
            value={query}
            onChangeText={handleSearch}
            autoFocus
            returnKeyType="search"
          />
          {query ? (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <X size={18} color={palette.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filter Bar */}
      <View style={[styles.filterBar, { borderBottomColor: (palette as any).border || palette.cardBorder }]}>
        <View style={styles.filterPills}>
          {(['ALL', 'OT', 'NT'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.filterPill, testamentFilter === t && styles.activeFilterPill]}
              onPress={() => {
                setTestamentFilter(t);
                if (query) handleSearch(query);
              }}
            >
              <Text style={[styles.filterPillText, testamentFilter === t && styles.activeFilterPillText]}>
                {t === 'ALL' ? 'All Books' : t === 'OT' ? 'Old Testament' : 'New Testament'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Results List */}
      {isSearching ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#D97706" />
          <Text style={[styles.searchingText, { color: palette.textSecondary }]}>Searching Scripture...</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item, index) => `${item.bookId}-${item.chapter}-${item.verse}-${index}`}
          contentContainerStyle={styles.resultsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.resultCard, { backgroundColor: (palette as any).cardBg || palette.card, borderColor: (palette as any).border || palette.cardBorder }]}
              onPress={() => handleSelectResult(item)}
            >
              <View style={styles.resultHeader}>
                <View style={styles.refBadge}>
                  <BookOpen size={14} color="#D97706" />
                  <Text style={styles.refText}>
                    {item.bookName} {item.chapter}:{item.verse}
                  </Text>
                </View>
                <Text style={[styles.transBadge, { color: palette.textSecondary }]}>
                  {item.translationId || selectedTranslation}
                </Text>
              </View>

              <Text style={[styles.verseBody, { color: palette.textPrimary }]} numberOfLines={3}>
                {item.text}
              </Text>

              <View style={styles.cardFooter}>
                <Text style={styles.openLink}>Read Passage</Text>
                <ArrowRight size={14} color="#D97706" />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            query.length >= 2 ? (
              <View style={styles.centered}>
                <Text style={[styles.emptyTitle, { color: palette.textPrimary }]}>No Verses Found</Text>
                <Text style={[styles.emptySubtitle, { color: palette.textSecondary }]}>
                  Try searching for keywords like "love", "peace", "hope", or passage references like "John 3:16".
                </Text>
              </View>
            ) : (
              <View style={styles.centered}>
                <SearchIcon size={40} color={palette.textSecondary} style={{ opacity: 0.4 }} />
                <Text style={[styles.emptySubtitle, { color: palette.textSecondary, marginTop: 12 }]}>
                  Type a verse reference or search term above.
                </Text>
              </View>
            )
          }
        />
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  filterBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  filterPills: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(156, 163, 175, 0.15)',
  },
  activeFilterPill: {
    backgroundColor: '#D97706',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeFilterPillText: {
    color: '#FFFFFF',
  },
  resultsList: {
    padding: 16,
  },
  resultCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  refBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  refText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#D97706',
  },
  transBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  verseBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 10,
  },
  openLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40,
  },
  searchingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});
