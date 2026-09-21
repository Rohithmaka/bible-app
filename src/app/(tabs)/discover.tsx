import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, ImageBackground, Share, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useBibleStore } from '../../store/useBibleStore';
import { useSpiritualStore, getDailyScriptureForDate } from '../../store/useSpiritualStore';
import { TOPICAL_CATEGORIES, BIBLE_READING_PLANS } from '../../data/bibleData';
import { isTeluguScript } from '../../constants/spiritualTheme';
import { Flame, Sparkles, Heart, Shield, Zap, Compass, Share2, BookOpen, CheckCircle, ArrowRight } from 'lucide-react-native';

export default function DiscoverScreen() {
  const router = useRouter();
  const { setLocation, themeMode, dailyStreak, enrolledPlanIds, completedPlanDays, enrollPlan } = useBibleStore();
  const { todayScripture } = useSpiritualStore();

  const isDark = themeMode === 'dark';
  const bgColor = isDark ? '#0F172A' : '#F8FAFC';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const borderColor = isDark ? '#334155' : '#E2E8F0';

  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (todayScripture.dateStr !== todayStr) {
      useSpiritualStore.setState({ todayScripture: getDailyScriptureForDate() });
    }
  }, []);

  const handleReadVerse = (bookId: string, chapter: number) => {
    setLocation(bookId, chapter);
    router.push('/(tabs)');
  };

  const handleShareDailyVerse = () => {
    Share.share({
      title: 'Verse of the Day',
      message: `"${todayScripture.verseText}"\n\n— ${todayScripture.reference}\n\nShared via Sela App`,
    });
  };

  const todayFormatted = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.todayDate}>{todayFormatted}</Text>
            <Text style={[styles.mainHeading, { color: textColor }]}>Daily Devotion</Text>
          </View>
          <TouchableOpacity
            style={styles.streakBadge}
            onPress={() => router.push('/one-year-planner' as any)}
            activeOpacity={0.8}
          >
            <Flame size={18} color="#FF6B00" />
            <Text style={styles.streakText}>{dailyStreak} Day Streak</Text>
          </TouchableOpacity>
        </View>

        {/* Verse of the Day Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroBadgeRow}>
            <View style={styles.heroTag}>
              <Sparkles size={14} color="#D4AF37" style={{ marginRight: 4 }} />
              <Text style={styles.heroTagText}>VERSE OF THE DAY</Text>
            </View>
            <TouchableOpacity onPress={handleShareDailyVerse} style={styles.heroShareBtn}>
              <Share2 size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text
            style={[
              styles.heroVerseText,
              isTeluguScript(todayScripture.verseText)
                ? { fontFamily: Platform.OS === 'android' ? 'Mandali-Bold' : 'Mandali', fontWeight: '700' }
                : null,
            ]}
          >
            "{todayScripture.verseText}"
          </Text>
          <Text style={styles.heroVerseRef}>
            — {todayScripture.reference} ({todayScripture.translation})
          </Text>

          <TouchableOpacity
            onPress={() => handleReadVerse(todayScripture.bookId, todayScripture.chapter)}
            style={styles.heroReadBtn}
          >
            <BookOpen size={16} color="#4F46E5" style={{ marginRight: 6 }} />
            <Text style={styles.heroReadText}>Read Full Chapter</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Reflection */}
        <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor }]}>
          <Text style={[styles.cardTitle, { color: textColor }]}>{todayScripture.reference} • Explanation & Reflection</Text>
          <Text style={styles.reflectionText}>{todayScripture.understand}</Text>

          {todayScripture.reflectQuestion ? (
            <View style={{ marginTop: 14, marginBottom: 14, padding: 14, borderRadius: 14, backgroundColor: isDark ? '#33415555' : '#F1F5F9', borderWidth: 1, borderColor }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#059669', marginBottom: 4 }}>Heart Question</Text>
              <Text style={{ fontSize: 13, color: textColor, lineHeight: 19 }}>{todayScripture.reflectQuestion}</Text>
            </View>
          ) : null}

          <View style={styles.prayerBox}>
            <Text style={styles.prayerTitle}>Today's Guided Prayer</Text>
            <Text style={styles.prayerText}>"{todayScripture.guidedPrayer}"</Text>
          </View>

          {todayScripture.practicalApplication ? (
            <View style={{ marginTop: 14, padding: 12, borderRadius: 12, backgroundColor: isDark ? '#064E3B22' : '#ECFDF5', borderWidth: 1, borderColor: '#10B98144' }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#059669', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Daily Action Step</Text>
              <Text style={{ fontSize: 13, color: isDark ? '#A7F3D0' : '#065F46', lineHeight: 18 }}>{todayScripture.practicalApplication}</Text>
            </View>
          ) : null}
        </View>

        {/* Topical Bible Categories */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Topical Bible Guide</Text>
          <Text style={styles.sectionSub}>Verses for every emotion and season</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.topicalScroll}>
          {TOPICAL_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => handleReadVerse(cat.verses[0].bookId, cat.verses[0].chapter)}
              style={[styles.topicalCard, { backgroundColor: cardBg, borderColor }]}
            >
              <View style={styles.topicalIconCircle}>
                <Heart size={20} color="#4F46E5" />
              </View>
              <Text style={[styles.topicalTitle, { color: textColor }]}>{cat.title}</Text>
              <Text style={styles.topicalDesc} numberOfLines={2}>{cat.description}</Text>
              <View style={styles.topicalFooter}>
                <Text style={styles.topicalVerseCount}>{cat.verses.length} Scriptures</Text>
                <ArrowRight size={14} color="#4F46E5" />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Reading Plans */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Bible Reading Plans</Text>
          <Text style={styles.sectionSub}>Structured plans for spiritual growth</Text>
        </View>

        <View style={styles.plansContainer}>
          {BIBLE_READING_PLANS.map((plan) => {
            const isEnrolled = enrolledPlanIds.includes(plan.id);
            const completedCount = completedPlanDays[plan.id]?.length || 0;
            const progressPercent = Math.round((completedCount / plan.durationDays) * 100);

            return (
              <View key={plan.id} style={[styles.planCard, { backgroundColor: cardBg, borderColor }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planCategory}>{plan.category} • {plan.durationDays} Days</Text>
                  <Text style={[styles.planTitle, { color: textColor }]}>{plan.title}</Text>
                  <Text style={styles.planDesc}>{plan.description}</Text>

                  {isEnrolled ? (
                    <View style={styles.planProgressRow}>
                      <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                      </View>
                      <Text style={styles.progressText}>{completedCount}/{plan.durationDays} Days</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => enrollPlan(plan.id)}
                      style={styles.enrollBtn}
                    >
                      <Text style={styles.enrollText}>Start Plan</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 36 : 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  todayDate: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    textTransform: 'uppercase',
  },
  mainHeading: {
    fontSize: 26,
    fontWeight: '800',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  streakText: {
    color: '#C2410C',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  heroCard: {
    backgroundColor: '#312E81',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heroTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroTagText: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroShareBtn: {
    padding: 4,
  },
  heroVerseText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 28,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginBottom: 12,
  },
  heroVerseRef: {
    color: '#A5B4FC',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 20,
  },
  heroReadBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  heroReadText: {
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  reflectionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#64748B',
    marginBottom: 16,
  },
  prayerBox: {
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  prayerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 4,
  },
  prayerText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#334155',
    lineHeight: 20,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  sectionSub: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  topicalScroll: {
    marginBottom: 24,
  },
  topicalCard: {
    width: 200,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginRight: 12,
  },
  topicalIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  topicalTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  topicalDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 12,
  },
  topicalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  topicalVerseCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4F46E5',
  },
  plansContainer: {
    gap: 16,
  },
  planCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
  },
  planCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  planDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
  },
  planProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  enrollBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  enrollText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
