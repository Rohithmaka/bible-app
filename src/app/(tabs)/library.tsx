import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useBibleStore, HighlightColor } from '../../store/useBibleStore';
import { BIBLE_READING_PLANS } from '../../data/bibleData';
import { isTeluguScript } from '../../constants/spiritualTheme';
import { Bookmark, Sparkles, FileText, Calendar, Trash2, CheckSquare, Square, Edit3 } from 'lucide-react-native';

const COLOR_MAP: Record<HighlightColor, string> = {
  gold: '#EAB308',
  sapphire: '#3B82F6',
  emerald: '#22C55E',
  rose: '#F43F5E',
  purple: '#A855F7',
};

export default function LibraryScreen() {
  const router = useRouter();
  const {
    bookmarks,
    removeBookmark,
    highlights,
    removeHighlight,
    notes,
    deleteNote,
    enrolledPlanIds,
    completedPlanDays,
    togglePlanDay,
    setLocation,
    themeMode,
  } = useBibleStore();

  const [activeTab, setActiveTab] = useState<'bookmarks' | 'highlights' | 'notes' | 'plans'>('bookmarks');

  const isDark = themeMode === 'dark';
  const bgColor = isDark ? '#0F172A' : '#F8FAFC';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const borderColor = isDark ? '#334155' : '#E2E8F0';

  const highlightList = Object.values(highlights);
  const noteList = Object.values(notes);
  const enrolledPlans = BIBLE_READING_PLANS.filter(p => enrolledPlanIds.includes(p.id));

  const handleJumpToVerse = (bookId: string, chapter: number) => {
    setLocation(bookId, chapter);
    router.push('/(tabs)' as any);
  };

  const handleEditNote = (n: typeof noteList[0]) => {
    router.push({
      pathname: '/note-editor' as any,
      params: {
        bookId: n.bookId,
        bookName: n.bookName,
        chapter: `${n.chapter}`,
        verse: `${n.verse}`,
        verseText: n.verseText,
      },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Top Title & Header */}
      <View style={styles.headerArea}>
        <Text style={[styles.pageTitle, { color: textColor }]}>My Holy Library</Text>
        <Text style={styles.pageSub}>Your bookmarks, verse highlights, study notes & plans</Text>

        {/* Tab Segment Controls */}
        <View style={styles.segmentRow}>
          <TouchableOpacity
            onPress={() => setActiveTab('bookmarks')}
            style={[styles.segmentBtn, activeTab === 'bookmarks' && styles.segmentBtnActive]}
          >
            <Bookmark size={14} color={activeTab === 'bookmarks' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.segmentText, activeTab === 'bookmarks' && styles.segmentTextActive]}>
              Saved ({bookmarks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('highlights')}
            style={[styles.segmentBtn, activeTab === 'highlights' && styles.segmentBtnActive]}
          >
            <Sparkles size={14} color={activeTab === 'highlights' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.segmentText, activeTab === 'highlights' && styles.segmentTextActive]}>
              Highlights ({highlightList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('notes')}
            style={[styles.segmentBtn, activeTab === 'notes' && styles.segmentBtnActive]}
          >
            <FileText size={14} color={activeTab === 'notes' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.segmentText, activeTab === 'notes' && styles.segmentTextActive]}>
              Notes ({noteList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('plans')}
            style={[styles.segmentBtn, activeTab === 'plans' && styles.segmentBtnActive]}
          >
            <Calendar size={14} color={activeTab === 'plans' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.segmentText, activeTab === 'plans' && styles.segmentTextActive]}>
              Plans ({enrolledPlans.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Bookmarks Tab */}
        {activeTab === 'bookmarks' && (
          <View style={styles.listSection}>
            {bookmarks.length === 0 ? (
              <View style={styles.emptyState}>
                <Bookmark size={40} color="#94A3B8" />
                <Text style={[styles.emptyTitle, { color: textColor }]}>No Saved Bookmarks</Text>
                <Text style={styles.emptySub}>Tap on any verse in the reader view to bookmark it here.</Text>
              </View>
            ) : (
              bookmarks.map((bm) => (
                <View key={bm.id} style={[styles.cardItem, { backgroundColor: cardBg, borderColor }]}>
                  <TouchableOpacity
                    onPress={() => handleJumpToVerse(bm.bookId, bm.chapter)}
                    style={{ flex: 1 }}
                  >
                    <Text style={styles.verseRefText}>
                      {bm.bookName} {bm.chapter}:{bm.verse}
                    </Text>
                    <Text
                      style={[
                        styles.verseBodyText,
                        isTeluguScript(bm.text)
                          ? { fontFamily: Platform.OS === 'android' ? 'Mandali-Bold' : 'Mandali', fontWeight: '700' }
                          : null,
                        { color: textColor },
                      ]}
                    >
                      "{bm.text}"
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeBookmark(bm.id)} style={styles.deleteIconBtn}>
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* Highlights Tab */}
        {activeTab === 'highlights' && (
          <View style={styles.listSection}>
            {highlightList.length === 0 ? (
              <View style={styles.emptyState}>
                <Sparkles size={40} color="#94A3B8" />
                <Text style={[styles.emptyTitle, { color: textColor }]}>No Verse Highlights</Text>
                <Text style={styles.emptySub}>Highlight your favorite scriptures with custom colors.</Text>
              </View>
            ) : (
              highlightList.map((hl) => (
                <View
                  key={hl.verseKey}
                  style={[
                    styles.cardItem,
                    { backgroundColor: cardBg, borderColor, borderLeftWidth: 4, borderLeftColor: COLOR_MAP[hl.color] },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() => handleJumpToVerse(hl.bookId, hl.chapter)}
                    style={{ flex: 1 }}
                  >
                    <View style={styles.highlightHeader}>
                      <Text style={styles.verseRefText}>
                        {hl.bookName} {hl.chapter}:{hl.verse}
                      </Text>
                      <View style={[styles.colorBadge, { backgroundColor: COLOR_MAP[hl.color] }]} />
                    </View>
                    <Text
                      style={[
                        styles.verseBodyText,
                        isTeluguScript(hl.text)
                          ? { fontFamily: Platform.OS === 'android' ? 'Mandali-Bold' : 'Mandali', fontWeight: '700' }
                          : null,
                        { color: textColor },
                      ]}
                    >
                      "{hl.text}"
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeHighlight(hl.verseKey)} style={styles.deleteIconBtn}>
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <View style={styles.listSection}>
            {noteList.length === 0 ? (
              <View style={styles.emptyState}>
                <FileText size={40} color="#94A3B8" />
                <Text style={[styles.emptyTitle, { color: textColor }]}>No Study Notes</Text>
                <Text style={styles.emptySub}>Select a verse in the reader to write your thoughts & reflections.</Text>
              </View>
            ) : (
              noteList.map((n) => (
                <View key={n.verseKey} style={[styles.cardItem, { backgroundColor: cardBg, borderColor }]}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.noteRefRow}>
                      <Text style={styles.verseRefText}>
                        {n.bookName} {n.chapter}:{n.verse} Note
                      </Text>
                      <TouchableOpacity onPress={() => handleEditNote(n)}>
                        <Edit3 size={16} color="#4F46E5" />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.noteScriptureQuote}>"{n.verseText}"</Text>
                    <Text style={[styles.noteUserContent, { color: textColor }]}>{n.content}</Text>
                  </View>

                  <TouchableOpacity onPress={() => deleteNote(n.verseKey)} style={styles.deleteIconBtn}>
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* Reading Plans Progress Tab */}
        {activeTab === 'plans' && (
          <View style={styles.listSection}>
            {enrolledPlans.length === 0 ? (
              <View style={styles.emptyState}>
                <Calendar size={40} color="#94A3B8" />
                <Text style={[styles.emptyTitle, { color: textColor }]}>No Active Plans</Text>
                <Text style={styles.emptySub}>Enroll in a reading plan from the Discover tab to track your journey.</Text>
              </View>
            ) : (
              enrolledPlans.map((plan) => {
                const completed = completedPlanDays[plan.id] || [];
                return (
                  <View key={plan.id} style={[styles.planBoxCard, { backgroundColor: cardBg, borderColor }]}>
                    <Text style={styles.planCategoryText}>{plan.category}</Text>
                    <Text style={[styles.planTitleText, { color: textColor }]}>{plan.title}</Text>

                    <View style={styles.daysChecklist}>
                      {plan.days.map((day) => {
                        const isDone = completed.includes(day.day);
                        return (
                          <TouchableOpacity
                            key={day.day}
                            onPress={() => togglePlanDay(plan.id, day.day)}
                            style={[
                              styles.dayCheckRow,
                              isDone && { backgroundColor: '#EEF2FF' },
                            ]}
                          >
                            {isDone ? (
                              <CheckSquare size={18} color="#4F46E5" />
                            ) : (
                              <Square size={18} color="#94A3B8" />
                            )}
                            <Text style={[styles.dayTitleText, isDone && { color: '#4F46E5', fontWeight: '700' }]}>
                              Day {day.day}: {day.title}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                );
              })
            )}
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
  segmentRow: {
    flexDirection: 'row',
    gap: 6,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    gap: 4,
  },
  segmentBtnActive: {
    backgroundColor: '#4F46E5',
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 12,
  },
  listSection: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  verseRefText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 4,
  },
  verseBodyText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  deleteIconBtn: {
    padding: 8,
    marginLeft: 8,
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colorBadge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  noteRefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  noteScriptureQuote: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#94A3B8',
    marginBottom: 8,
  },
  noteUserContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  planBoxCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
  },
  planCategoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
    textTransform: 'uppercase',
  },
  planTitleText: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
  },
  daysChecklist: {
    gap: 8,
  },
  dayCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    gap: 10,
  },
  dayTitleText: {
    fontSize: 13,
    color: '#334155',
  },
});
