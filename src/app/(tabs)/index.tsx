import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useBibleStore } from '../../store/useBibleStore';
import { useSpiritualStore, getDailyScriptureForDate } from '../../store/useSpiritualStore';
import { SpiritualTheme, ScriptureTypography, isTeluguScript } from '../../constants/spiritualTheme';
import { triggerLightHaptic, triggerMediumHaptic, triggerSuccessHaptic } from '../../services/mobileHaptics';
import { shareScriptureVerse } from '../../services/mobileShare';
import { useReminderStore } from '../../store/useReminderStore';
import { useDevotionStore } from '../../store/useDevotionStore';
import { BookOpen, Heart, Sparkles, ArrowRight, Share2, CheckCircle2, Flame } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { themeMode, dailyStreak } = useBibleStore();
  const isDark = themeMode === 'dark';
  const palette = isDark ? SpiritualTheme.dark : SpiritualTheme.light;

  const {
    todayDevotion,
    isCompleted: isDevotionCompleted,
    devotionStreak,
    loadTodayDevotion,
  } = useDevotionStore();

  const {
    todayScripture,
    communityPrayers,
    incrementIPrayed,
    morningCompletedDates,
    user
  } = useSpiritualStore();

  const todayStr = new Date().toISOString().split('T')[0];
  const isMorningDone = morningCompletedDates.includes(todayStr);

  useEffect(() => {
    // Load today's devotion and sync cloud/local completion
    loadTodayDevotion();

    // Refresh Daily Scripture automatically if calendar day has changed
    const currentScripture = useSpiritualStore.getState().todayScripture;
    if (currentScripture.dateStr !== todayStr) {
      useSpiritualStore.setState({ todayScripture: getDailyScriptureForDate() });
    }

    // Non-intrusively verify device permission status and sync scheduled reminders if already granted
    useReminderStore.getState().checkDevicePermissions().then((status) => {
      if (status === 'granted') {
        useReminderStore.getState().syncAllScheduledNotifications();
      }
    });
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleShare = async () => {
    triggerLightHaptic();
    await shareScriptureVerse(todayScripture.reference, todayScripture.verseText, todayScripture.translation);
  };

  const handlePrayForBurden = (id: string) => {
    triggerMediumHaptic();
    incrementIPrayed(id);
    router.push({ pathname: '/pray-now' as any, params: { id } });
  };

  const handleStartJourney = () => {
    triggerLightHaptic();
    router.push('/morning-journey' as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }} edges={['top', 'left', 'right']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Banner with SELA Brand Identity */}
        <View style={{ paddingTop: 14, paddingHorizontal: 20, paddingBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Image
                source={require('../../../assets/images/sela_logo.png')}
                style={{ width: 46, height: 46, borderRadius: 14 }}
                resizeMode="cover"
              />
              <View>
                <Text style={{ fontSize: 20, fontWeight: '900', color: palette.textPrimary, letterSpacing: 2 }}>
                  SELA
                </Text>
                <Text style={{ fontSize: 10, fontWeight: '700', color: palette.accentGreen, letterSpacing: 1, textTransform: 'uppercase' }}>
                  PAUSE • PRAY • GROW • BELONG
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                triggerLightHaptic();
                router.push('/one-year-planner' as any);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                backgroundColor: 'rgba(217, 119, 6, 0.14)',
                borderWidth: 1,
                borderColor: 'rgba(217, 119, 6, 0.3)',
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 16,
              }}
            >
              <Text style={{ fontSize: 12 }}>🔥</Text>
              <Text style={{ fontSize: 12, fontWeight: '800', color: palette.accentGold }}>
                {dailyStreak}d
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 26, fontWeight: '800', color: palette.textPrimary, marginTop: 2 }}>
            {getGreeting()}, {user.displayName}
          </Text>
          <Text style={{ fontSize: 13, color: palette.textSecondary, marginTop: 3 }}>
            "Read the Word. Understand it. Pray through it. Live it."
          </Text>
        </View>

        {/* Start Journey Primary CTA */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={handleStartJourney}
            activeOpacity={0.85}
            style={{
              backgroundColor: palette.accentGreen,
              borderRadius: 18,
              padding: 20,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              elevation: 4,
              shadowColor: palette.accentGreen,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
            }}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                {isMorningDone ? (
                  <CheckCircle2 size={18} color="#A7F3D0" />
                ) : (
                  <Sparkles size={18} color={palette.accentGold} />
                )}
                <Text style={{ color: palette.accentGold, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
                  {isMorningDone ? 'Journey Completed Today' : 'Guided Daily Walk'}
                </Text>
              </View>
              <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>
                {isMorningDone ? 'Revisit Today\'s Journey' : 'START TODAY\'S JOURNEY'}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 4 }}>
                Scripture → Understand → Reflect → Pray → Apply
              </Text>
            </View>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowRight size={22} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* TODAY'S ROUTINE COMPLETION CHECKLIST */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{ backgroundColor: palette.card, borderRadius: 18, borderWidth: 1, borderColor: isMorningDone ? palette.accentGreen : palette.cardBorder, padding: 18 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={20} color={isMorningDone ? palette.accentGreen : palette.accentGold} />
                <Text style={{ fontSize: 16, fontWeight: '800', color: palette.textPrimary }}>
                  Today's Completion Checklist
                </Text>
              </View>
              <Text style={{ fontSize: 12, fontWeight: '700', color: isMorningDone ? palette.accentGreen : palette.accentGold }}>
                {isMorningDone ? '100% COMPLETE 🎉' : 'IN PROGRESS'}
              </Text>
            </View>

            {/* Checklist Items */}
            <View style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: palette.inputBg, padding: 10, borderRadius: 10 }}>
                <CheckCircle2 size={18} color={isMorningDone ? palette.accentGreen : palette.textMuted} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: palette.textPrimary }}>
                    1. Morning Scripture & Meditation
                  </Text>
                  <Text style={{ fontSize: 11, color: palette.textSecondary }}>
                    {isMorningDone ? 'Completed for today' : 'Pending — Tap Start Journey'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => {
                  triggerLightHaptic();
                  router.push('/one-year-planner' as any);
                }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: palette.inputBg, padding: 10, borderRadius: 10 }}
              >
                <CheckCircle2 size={18} color={palette.accentGreen} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: palette.textPrimary }}>
                    2. 365-Day Bible Reading Portion
                  </Text>
                  <Text style={{ fontSize: 11, color: palette.accentGreen }}>
                    Day Portion Selected • Tap to view
                  </Text>
                </View>
                <ArrowRight size={14} color={palette.accentGreen} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  triggerLightHaptic();
                  router.push('/pray-now' as any);
                }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: palette.inputBg, padding: 10, borderRadius: 10 }}
              >
                <CheckCircle2 size={18} color={palette.accentGold} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: palette.textPrimary }}>
                    3. Heart Reflection & Guided Prayer
                  </Text>
                  <Text style={{ fontSize: 11, color: palette.textSecondary }}>
                    Tap to open prayer chamber
                  </Text>
                </View>
                <ArrowRight size={14} color={palette.accentGold} />
              </TouchableOpacity>
            </View>

            {isMorningDone && (
              <View style={{ marginTop: 12, padding: 10, borderRadius: 10, backgroundColor: palette.accentGreenLight, alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: palette.accentGreen }}>
                  🎉 Amen! Today's daily walk is complete. Keep growing in grace!
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 🌅 DAILY DEVOTION CARD */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View
            style={{
              backgroundColor: palette.card,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: isDevotionCompleted ? palette.accentGreen : palette.cardBorder,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.06,
              shadowRadius: 10,
              elevation: 3,
            }}
          >
            {/* Devotion Card Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#D97706', letterSpacing: 1 }}>
                  🌅 DAILY DEVOTION
                </Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {devotionStreak > 0 && (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      backgroundColor: 'rgba(217, 119, 6, 0.12)',
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 12,
                    }}
                  >
                    <Flame size={12} color="#D97706" />
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#D97706' }}>
                      {devotionStreak}d Streak
                    </Text>
                  </View>
                )}

                <View style={{ backgroundColor: palette.accentGreenLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: palette.accentGreen }}>
                    {todayDevotion.verseTranslation || 'KJV'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Scripture Verse Quote */}
            <Text
              style={{
                fontFamily: isTeluguScript(todayDevotion.verseText)
                  ? (Platform.OS === 'android' ? 'Mandali-Bold' : 'Mandali')
                  : ScriptureTypography.fontFamilySerif,
                fontWeight: isTeluguScript(todayDevotion.verseText) ? '700' : '400',
                fontStyle: isTeluguScript(todayDevotion.verseText) ? 'normal' : 'italic',
                fontSize: 17,
                lineHeight: 26,
                color: palette.textPrimary,
                marginBottom: 8,
              }}
            >
              "{todayDevotion.verseText}"
            </Text>

            <Text
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: palette.accentGreen,
                marginBottom: 14,
              }}
            >
              — {todayDevotion.verseReference}
            </Text>

            {/* Devotion Title & 2-Line Preview */}
            <View
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                borderRadius: 14,
                padding: 14,
                marginBottom: 16,
                borderLeftWidth: 3,
                borderLeftColor: '#D97706',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '800', color: palette.textPrimary, marginBottom: 4 }}>
                {todayDevotion.title}
              </Text>
              <Text style={{ fontSize: 13, lineHeight: 20, color: palette.textSecondary }} numberOfLines={2}>
                {todayDevotion.devotion}
              </Text>
            </View>

            {/* Primary Action Button: Read Today's Devotion */}
            <TouchableOpacity
              onPress={() => {
                triggerLightHaptic();
                router.push('/daily-devotion');
              }}
              activeOpacity={0.85}
              style={{
                backgroundColor: isDevotionCompleted ? palette.accentGreenLight : '#D97706',
                borderWidth: isDevotionCompleted ? 1 : 0,
                borderColor: palette.accentGreen,
                paddingVertical: 14,
                borderRadius: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginBottom: 12,
              }}
            >
              {isDevotionCompleted ? (
                <>
                  <CheckCircle2 size={18} color={palette.accentGreen} />
                  <Text style={{ fontSize: 15, fontWeight: '800', color: palette.accentGreen }}>
                    ✓ Completed Today • Revisit Devotion
                  </Text>
                  <ArrowRight size={16} color={palette.accentGreen} />
                </>
              ) : (
                <>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: '#FFFFFF' }}>
                    Read Today's Devotion
                  </Text>
                  <ArrowRight size={16} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            {/* Quick Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: palette.border }}>
              <TouchableOpacity
                onPress={() => {
                  triggerLightHaptic();
                  if (todayDevotion.bookId && todayDevotion.chapter) {
                    router.push({
                      pathname: '/bible' as any,
                      params: { bookId: todayDevotion.bookId, chapter: todayDevotion.chapter },
                    });
                  } else {
                    router.push('/bible' as any);
                  }
                }}
                style={[styles.actionBtn, { backgroundColor: palette.inputBg, flex: 1 }]}
              >
                <BookOpen size={14} color={palette.textPrimary} />
                <Text style={[styles.actionBtnText, { color: palette.textPrimary }]}>Read Bible</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  triggerMediumHaptic();
                  router.push('/pray-now' as any);
                }}
                style={[styles.actionBtn, { backgroundColor: palette.inputBg, flex: 1 }]}
              >
                <Heart size={14} color={palette.accentGold} />
                <Text style={[styles.actionBtnText, { color: palette.accentGold }]}>Pray</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={async () => {
                  triggerLightHaptic();
                  await shareScriptureVerse(
                    todayDevotion.verseReference,
                    todayDevotion.verseText,
                    todayDevotion.verseTranslation
                  );
                }}
                style={[styles.actionBtn, { backgroundColor: palette.inputBg, flex: 1 }]}
              >
                <Share2 size={14} color={palette.textSecondary} />
                <Text style={[styles.actionBtnText, { color: palette.textSecondary }]}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 6. PEOPLE ASKING FOR PRAYER (Community Preview) */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: palette.textPrimary }}>
              People Asking for Prayer
            </Text>
            <TouchableOpacity onPress={() => router.push('/prayer' as any)}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: palette.accentGreen }}>
                See All →
              </Text>
            </TouchableOpacity>
          </View>

          {communityPrayers.slice(0, 2).map((prayer) => (
            <View
              key={prayer.id}
              style={{
                backgroundColor: palette.card,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: palette.cardBorder,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: palette.textSecondary }}>
                  {prayer.isAnonymous ? 'Anonymous Believer' : prayer.authorName}
                </Text>
                <Text style={{ fontSize: 12, color: palette.textMuted }}>
                  {prayer.category}
                </Text>
              </View>

              <Text style={{ fontSize: 15, fontWeight: '700', color: palette.textPrimary, marginBottom: 4 }}>
                {prayer.title}
              </Text>
              <Text style={{ fontSize: 14, color: palette.textSecondary, lineHeight: 20, marginBottom: 12 }} numberOfLines={2}>
                {prayer.burdenText}
              </Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: palette.border }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: palette.accentGold }}>
                  🙏 {prayer.prayerCount} people prayed
                </Text>

                <TouchableOpacity
                  onPress={() => handlePrayForBurden(prayer.id)}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: prayer.userHasPrayed ? palette.accentGreenLight : palette.accentGreen,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Heart size={14} color={prayer.userHasPrayed ? palette.accentGreen : '#FFFFFF'} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: prayer.userHasPrayed ? palette.accentGreen : '#FFFFFF' }}>
                    {prayer.userHasPrayed ? 'Prayed 🙏' : '🙏 I Prayed'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
