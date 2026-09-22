import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Share,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useBibleStore } from '../store/useBibleStore';
import { useDevotionStore } from '../store/useDevotionStore';
import { SpiritualTheme, ScriptureTypography, isTeluguScript } from '../constants/spiritualTheme';
import { triggerLightHaptic, triggerSuccessHaptic } from '../services/mobileHaptics';
import {
  ChevronLeft,
  BookOpen,
  Bookmark,
  Share2,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Heart,
  Flame,
  ArrowRight,
} from 'lucide-react-native';

export default function DailyDevotionScreen() {
  const router = useRouter();
  const { themeMode, setLocation } = useBibleStore();
  const isDark = themeMode === 'dark';
  const palette = isDark ? SpiritualTheme.dark : SpiritualTheme.light;

  const {
    todayDevotion,
    isLoading,
    isCompleted,
    isSaved,
    devotionStreak,
    loadTodayDevotion,
    markDevotionCompleted,
    toggleDevotionSaved,
  } = useDevotionStore();

  useEffect(() => {
    loadTodayDevotion();
  }, []);

  const formatDateDisplay = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const handleComplete = async () => {
    if (isCompleted) return;
    triggerSuccessHaptic();
    await markDevotionCompleted();
  };

  const handleToggleSave = async () => {
    triggerLightHaptic();
    await toggleDevotionSaved();
  };

  const handleShare = async () => {
    triggerLightHaptic();
    try {
      const shareContent = `🌅 SELA Daily Devotion: ${todayDevotion.title}

"${todayDevotion.verseText}"
— ${todayDevotion.verseReference} (${todayDevotion.verseTranslation})

${todayDevotion.devotion}

💭 Reflect: ${todayDevotion.reflectionQuestion}
🙏 Prayer: ${todayDevotion.prayer}
✨ Today's Action: ${todayDevotion.dailyAction}

Read on SELA Holy Bible App`;

      await Share.share({
        message: shareContent,
        title: `SELA Daily Devotion - ${todayDevotion.title}`,
      });
    } catch (e) {
      console.warn('Share devotion error:', e);
    }
  };

  const handleReadInContext = () => {
    triggerLightHaptic();
    if (todayDevotion.bookId && todayDevotion.chapter) {
      setLocation(todayDevotion.bookId, todayDevotion.chapter);
      router.push({
        pathname: '/bible',
        params: {
          bookId: todayDevotion.bookId,
          chapter: todayDevotion.chapter,
        },
      });
    } else {
      router.push('/bible');
    }
  };

  const isTeluguVerse = isTeluguScript(todayDevotion.verseText);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }} edges={['top', 'left', 'right']}>
      {/* Top Header Navigation */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: palette.card,
            borderBottomColor: palette.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <ChevronLeft size={24} color={palette.textPrimary} />
          <Text style={[styles.backButtonText, { color: palette.textPrimary }]}>Back</Text>
        </TouchableOpacity>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            onPress={handleToggleSave}
            style={[styles.headerIconButton, isSaved && { backgroundColor: 'rgba(217, 119, 6, 0.15)' }]}
            accessibilityLabel={isSaved ? 'Remove bookmark' : 'Bookmark devotion'}
            accessibilityRole="button"
          >
            <Bookmark size={20} color={isSaved ? '#D97706' : palette.textSecondary} fill={isSaved ? '#D97706' : 'none'} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            style={styles.headerIconButton}
            accessibilityLabel="Share devotion"
            accessibilityRole="button"
          >
            <Share2 size={20} color={palette.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#D97706" />
          <Text style={[styles.loadingText, { color: palette.textSecondary }]}>Loading today’s devotion...</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Title & Date Banner */}
          <View style={styles.titleSection}>
            <View style={styles.badgeRow}>
              <View style={styles.devotionBadge}>
                <Text style={styles.devotionBadgeText}>🌅 DAILY DEVOTION</Text>
              </View>

              {devotionStreak > 0 && (
                <View style={styles.streakBadge}>
                  <Flame size={14} color="#D97706" />
                  <Text style={styles.streakBadgeText}>{devotionStreak} Day Streak</Text>
                </View>
              )}
            </View>

            <Text style={[styles.dateSubtitle, { color: palette.textSecondary }]}>
              {formatDateDisplay(todayDevotion.date)}
            </Text>
          </View>

          {/* 1. TODAY'S VERSE CARD */}
          <View
            style={[
              styles.verseCard,
              {
                backgroundColor: palette.card,
                borderColor: palette.cardBorder,
              },
            ]}
          >
            <View style={styles.verseCardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <BookOpen size={16} color="#D97706" />
                <Text style={styles.verseCardLabel}>TODAY'S VERSE</Text>
              </View>
              <View style={[styles.translationPill, { backgroundColor: palette.accentGreenLight }]}>
                <Text style={[styles.translationPillText, { color: palette.accentGreen }]}>
                  {todayDevotion.verseTranslation}
                </Text>
              </View>
            </View>

            <Text
              style={[
                styles.verseScriptureText,
                isTeluguVerse
                  ? { fontFamily: Platform.OS === 'android' ? 'Mandali-Bold' : 'Mandali', fontWeight: '700' }
                  : { fontFamily: ScriptureTypography.fontFamilySerif, fontStyle: 'italic' },
                { color: palette.textPrimary },
              ]}
            >
              "{todayDevotion.verseText}"
            </Text>

            <View style={styles.verseCardFooter}>
              <Text style={[styles.referenceText, { color: palette.accentGreen }]}>
                — {todayDevotion.verseReference}
              </Text>

              <TouchableOpacity
                onPress={handleReadInContext}
                style={[styles.readContextLink, { backgroundColor: palette.inputBg }]}
                accessibilityLabel="Read this chapter in the Bible"
              >
                <Text style={[styles.readContextText, { color: palette.textPrimary }]}>Read in Bible</Text>
                <ArrowRight size={13} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. DEVOTION TITLE & ORIGINAL MESSAGE */}
          <View style={[styles.sectionContainer, { marginTop: 8 }]}>
            <Text style={[styles.devotionHeading, { color: palette.textPrimary }]}>
              {todayDevotion.title}
            </Text>
            <Text style={[styles.devotionBodyText, { color: palette.textPrimary }]}>
              {todayDevotion.devotion}
            </Text>
          </View>

          {/* 3. 💭 REFLECTION QUESTION */}
          <View
            style={[
              styles.reflectionCard,
              {
                backgroundColor: isDark ? 'rgba(217, 119, 6, 0.08)' : 'rgba(245, 158, 11, 0.09)',
                borderColor: 'rgba(217, 119, 6, 0.25)',
              },
            ]}
          >
            <View style={styles.sectionHeaderRow}>
              <HelpCircle size={18} color="#D97706" />
              <Text style={[styles.sectionHeaderTitle, { color: '#D97706' }]}>💭 REFLECT</Text>
            </View>
            <Text style={[styles.reflectionQuestionText, { color: palette.textPrimary }]}>
              "{todayDevotion.reflectionQuestion}"
            </Text>
          </View>

          {/* 4. 🙏 GUIDED PRAYER */}
          <View
            style={[
              styles.prayerCard,
              {
                backgroundColor: isDark ? 'rgba(5, 150, 105, 0.08)' : 'rgba(16, 185, 129, 0.09)',
                borderColor: 'rgba(16, 185, 129, 0.25)',
              },
            ]}
          >
            <View style={styles.sectionHeaderRow}>
              <Heart size={18} color="#059669" />
              <Text style={[styles.sectionHeaderTitle, { color: '#059669' }]}>🙏 PRAYER</Text>
            </View>
            <Text style={[styles.prayerBodyText, { color: palette.textPrimary }]}>
              {todayDevotion.prayer}
            </Text>
          </View>

          {/* 5. ✨ TODAY'S ACTION */}
          <View
            style={[
              styles.actionCard,
              {
                backgroundColor: palette.card,
                borderColor: palette.cardBorder,
              },
            ]}
          >
            <View style={styles.sectionHeaderRow}>
              <Sparkles size={18} color="#D97706" />
              <Text style={[styles.sectionHeaderTitle, { color: palette.accentGold }]}>✨ TODAY'S ACTION</Text>
            </View>
            <Text style={[styles.actionBodyText, { color: palette.textPrimary }]}>
              {todayDevotion.dailyAction}
            </Text>
          </View>

          {/* 6. COMPLETION STATUS & PRIMARY BUTTON */}
          <View style={styles.completionSection}>
            {isCompleted ? (
              <View
                style={[
                  styles.completedBanner,
                  {
                    backgroundColor: isDark ? 'rgba(5, 150, 105, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    borderColor: 'rgba(16, 185, 129, 0.35)',
                  },
                ]}
              >
                <CheckCircle2 size={24} color="#059669" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.completedBannerTitle, { color: palette.textPrimary }]}>
                    Devotion Completed Today
                  </Text>
                  <Text style={[styles.completedBannerSubtitle, { color: palette.accentGreen }]}>
                    🔥 {devotionStreak} Day Faith Streak • God's peace be with you!
                  </Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleComplete}
                activeOpacity={0.85}
                style={styles.completeButton}
                accessibilityLabel="Mark devotion as complete"
                accessibilityRole="button"
              >
                <CheckCircle2 size={20} color="#FFFFFF" />
                <Text style={styles.completeButtonText}>Complete Devotion</Text>
              </TouchableOpacity>
            )}

            {/* Secondary actions: Save & Share */}
            <View style={styles.secondaryActionsRow}>
              <TouchableOpacity
                onPress={handleToggleSave}
                style={[styles.secondaryButton, { backgroundColor: palette.card, borderColor: palette.border }]}
                accessibilityLabel={isSaved ? 'Devotion saved' : 'Save devotion'}
              >
                <Bookmark
                  size={16}
                  color={isSaved ? '#D97706' : palette.textSecondary}
                  fill={isSaved ? '#D97706' : 'none'}
                />
                <Text
                  style={[
                    styles.secondaryButtonText,
                    { color: isSaved ? '#D97706' : palette.textSecondary, fontWeight: isSaved ? '800' : '600' },
                  ]}
                >
                  {isSaved ? 'Saved' : 'Save'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShare}
                style={[styles.secondaryButton, { backgroundColor: palette.card, borderColor: palette.border }]}
                accessibilityLabel="Share devotion"
              >
                <Share2 size={16} color={palette.textSecondary} />
                <Text style={[styles.secondaryButtonText, { color: palette.textSecondary }]}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,
  },
  titleSection: {
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  devotionBadge: {
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  devotionBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  streakBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
  },
  dateSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  verseCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  verseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  verseCardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 1,
  },
  translationPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  translationPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  verseScriptureText: {
    fontSize: 19,
    lineHeight: 28,
    marginBottom: 14,
  },
  verseCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(156, 163, 175, 0.15)',
  },
  referenceText: {
    fontSize: 15,
    fontWeight: '800',
  },
  readContextLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  readContextText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionContainer: {
    marginBottom: 18,
  },
  devotionHeading: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 10,
  },
  devotionBodyText: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400',
  },
  reflectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  reflectionQuestionText: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
    fontWeight: '600',
  },
  prayerCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  prayerBodyText: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
  },
  actionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 24,
  },
  actionBodyText: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
  },
  completionSection: {
    marginTop: 8,
  },
  completeButton: {
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  completedBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  completedBannerSubtitle: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
