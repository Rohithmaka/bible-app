import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useBibleStore } from '../../store/useBibleStore';
import { searchBible, SearchResult } from '../../engine/bibleEngine';
import { Search, X, BookOpen, ChevronRight, Tag } from 'lucide-react-native';

const POPULAR_SEARCHES = ['Love', 'Light', 'Peace', 'Hope', 'Faith', 'Forgiveness', 'Strength', 'Shepherd', 'Kingdom'];

export default function SearchScreen() {
  const router = useRouter();
  const { setLocation, themeMode } = useBibleStore();

  const [query, setQuery] = useState('');
  const [testamentFilter, setTestamentFilter] = useState<'ALL' | 'OT' | 'NT'>('ALL');

  const isDark = themeMode === 'dark';
  const bgColor = isDark ? '#0F172A' : '#F8FAFC';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const borderColor = isDark ? '#334155' : '#E2E8F0';

  const results: SearchResult[] = searchBible(query, testamentFilter);

  const handleSelectResult = (bookId: string, chapter: number) => {
    setLocation(bookId, chapter);
    router.push('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.headerArea}>
        <Text style={[styles.pageTitle, { color: textColor }]}>Bible Search</Text>
        <Text style={styles.pageSub}>Search keywords, phrases, and topics across Scripture</Text>

        {/* Search Input Box */}
        <View style={[styles.searchBox, { backgroundColor: cardBg, borderColor }]}>
          <Search size={20} color="#94A3B8" style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search keywords (e.g. love, peace, light)..."
            placeholderTextColor="#94A3B8"
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            onPress={() => setTestamentFilter('ALL')}
            style={[styles.filterPill, testamentFilter === 'ALL' && styles.filterPillActive]}
          >
            <Text style={[styles.filterText, testamentFilter === 'ALL' && styles.filterTextActive]}>All Books</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTestamentFilter('OT')}
            style={[styles.filterPill, testamentFilter === 'OT' && styles.filterPillActive]}
          >
            <Text style={[styles.filterText, testamentFilter === 'OT' && styles.filterTextActive]}>Old Testament</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTestamentFilter('NT')}
            style={[styles.filterPill, testamentFilter === 'NT' && styles.filterPillActive]}
          >
            <Text style={[styles.filterText, testamentFilter === 'NT' && styles.filterTextActive]}>New Testament</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* If no query, show popular search topics */}
        {query.length === 0 ? (
          <View>
            <View style={styles.popularHeader}>
              <Tag size={16} color="#4F46E5" style={{ marginRight: 6 }} />
              <Text style={[styles.popularTitle, { color: textColor }]}>Popular Topics</Text>
            </View>

            <View style={styles.chipsContainer}>
              {POPULAR_SEARCHES.map((topic) => (
                <TouchableOpacity
                  key={topic}
                  onPress={() => setQuery(topic)}
                  style={[styles.topicChip, { backgroundColor: cardBg, borderColor }]}
                >
                  <Text style={[styles.topicText, { color: textColor }]}>{topic}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View>
            {/* Search Results Summary */}
            <View style={styles.resultsSummary}>
              <Text style={styles.summaryText}>
                {results.length > 0
                  ? `Found ${results.length} verse matches for "${query}"`
                  : `No verses found matching "${query}"`}
              </Text>
            </View>

            {/* Results List */}
            <View style={styles.resultsList}>
              {results.map((res, index) => (
                <TouchableOpacity
                  key={`${res.bookId}-${res.chapter}-${res.verse}-${index}`}
                  onPress={() => handleSelectResult(res.bookId, res.chapter)}
                  style={[styles.resultCard, { backgroundColor: cardBg, borderColor }]}
                >
                  <View style={styles.resultHeader}>
                    <View style={styles.bookBadge}>
                      <BookOpen size={14} color="#4F46E5" style={{ marginRight: 4 }} />
                      <Text style={styles.bookBadgeText}>
                        {res.bookName} {res.chapter}:{res.verse}
                      </Text>
                    </View>
                    <Text style={styles.testamentTag}>{res.testament}</Text>
                  </View>

                  <Text style={[styles.verseSnippet, { color: textColor }]}>"{res.text}"</Text>

                  <View style={styles.readLinkRow}>
                    <Text style={styles.readLinkText}>Jump to Chapter</Text>
                    <ChevronRight size={14} color="#4F46E5" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 36 : 0,
  },
  headerArea: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
  },
  pageSub: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  filterPillActive: {
    backgroundColor: '#4F46E5',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  popularHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 14,
  },
  popularTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  topicChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  topicText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resultsSummary: {
    marginBottom: 14,
    marginTop: 6,
  },
  summaryText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '700',
  },
  resultsList: {
    gap: 12,
  },
  resultCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bookBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
  },
  testamentTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verseSnippet: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 10,
  },
  readLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  readLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    marginRight: 2,
  },
});
