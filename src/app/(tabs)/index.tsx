import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useBibleStore } from '../../store/useBibleStore';
import { useSpiritualStore } from '../../store/useSpiritualStore';
import { SpiritualTheme, ScriptureTypography, isTeluguScript } from '../../constants/spiritualTheme';
import { triggerLightHaptic, triggerMediumHaptic, triggerSuccessHaptic } from '../../services/mobileHaptics';
import { shareScriptureVerse } from '../../services/mobileShare';
import { requestMobileNotificationPermissions, scheduleDailySpiritualReminders } from '../../services/mobileNotifications';
import { BookOpen, Heart, Sparkles, ArrowRight, Share2, CheckCircle2 } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { themeMode } = useBibleStore();
  const isDark = themeMode === 'dark';
  const palette = isDark ? SpiritualTheme.dark : SpiritualTheme.light;

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
    // Initialize mobile push notification permissions & reminders schedule
    requestMobileNotificationPermissions().then((granted) => {
      if (granted) {
        scheduleDailySpiritualReminders({
          enabled: user.notificationsEnabled,
          soundEnabled: user.notificationSoundEnabled !== false,
          vibrateEnabled: user.notificationVibrateEnabled !== false,
          showVerseSnippet: user.notificationShowVerseSnippet !== false,
          userName: user.displayName,
          personalizedGreeting: user.notificationPersonalizedGreeting !== false,
          activeDays: user.notificationActiveDays || 'everyday',

          bibleReadingEnabled: user.bibleReadingEnabled !== false,
          bibleReadingTime: user.bibleReadingTime || user.notificationTime || '07:00 AM',
          verseReference: todayScripture?.reference,
          verseSnippet: todayScripture?.verseText,

          morningPrayerEnabled: user.morningPrayerEnabled !== false,
          morningPrayerTime: user.morningPrayerTime || '08:30 AM',

          afternoonPrayerEnabled: user.afternoonPrayerEnabled !== false,
          afternoonPrayerTime: user.afternoonPrayerTime || '01:00 PM',

          eveningPrayerEnabled: user.eveningPrayerEnabled !== false,
          eveningPrayerTime: user.eveningPrayerTime || '07:00 PM',

          nightPrayerEnabled: user.nightPrayerEnabled !== false,
          nightPrayerTime: user.nightPrayerTime || '09:30 PM',
        });
      }
    });
  }, [
    user.notificationsEnabled,
    user.notificationSoundEnabled,
    user.notificationVibrateEnabled,
    user.notificationShowVerseSnippet,
    user.notificationPersonalizedGreeting,
    user.notificationActiveDays,
    user.displayName,
    user.bibleReadingEnabled,
    user.bibleReadingTime,
    user.morningPrayerEnabled,
    user.morningPrayerTime,
    user.afternoonPrayerEnabled,
    user.afternoonPrayerTime,
    user.eveningPrayerEnabled,
    user.eveningPrayerTime,
    user.nightPrayerEnabled,
    user.nightPrayerTime,
    todayScripture,
  ]);

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
        {/* Header Banner */}
        <View style={{ paddingTop: 16, paddingHorizontal: 20, paddingBottom: 16 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: palette.accentGreen, textTransform: 'uppercase', letterSpacing: 1.2 }}>
            Daily Spiritual Dashboard
          </Text>
          <Text style={{ fontSize: 28, fontWeight: '800', color: palette.textPrimary, marginTop: 2 }}>
            {getGreeting()}, {user.displayName}
          </Text>
          <Text style={{ fontSize: 14, color: palette.textSecondary, marginTop: 2 }}>
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

        {/* 1. TODAY'S SCRIPTURE */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{ backgroundColor: palette.card, borderRadius: 18, borderWidth: 1, borderColor: palette.cardBorder, padding: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: palette.accentGold, textTransform: 'uppercase', letterSpacing: 1 }}>
                Today's Scripture
              </Text>
              <View style={{ backgroundColor: palette.accentGreenLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.accentGreen }}>
                  {todayScripture.translation}
                </Text>
              </View>
            </View>

            <Text
              style={{
                fontFamily: isTeluguScript(todayScripture.verseText)
                  ? (Platform.OS === 'android' ? 'Mandali-Bold' : 'Mandali')
                  : ScriptureTypography.fontFamilySerif,
                fontWeight: isTeluguScript(todayScripture.verseText) ? '700' : '400',
                fontStyle: isTeluguScript(todayScripture.verseText) ? 'normal' : 'italic',
                fontSize: ScriptureTypography.fontSize.lg,
                lineHeight: ScriptureTypography.fontSize.lg * ScriptureTypography.lineHeightRatio,
                color: palette.textPrimary,
                marginBottom: 12,
              }}
            >
              "{todayScripture.verseText}"
            </Text>

            <Text
              style={{
                fontFamily: isTeluguScript(todayScripture.reference)
                  ? (Platform.OS === 'android' ? 'Mandali-Bold' : 'Mandali')
                  : undefined,
                fontSize: 15,
                fontWeight: '700',
                color: palette.accentGreen,
                marginBottom: 16,
              }}
            >
              — {todayScripture.reference}
            </Text>

            {/* Quick Action Buttons */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: palette.border }}>
              <TouchableOpacity
                onPress={() => {
                  triggerLightHaptic();
                  router.push({ pathname: '/bible' as any, params: { bookId: todayScripture.bookId, chapter: todayScripture.chapter } });
                }}
                style={[styles.actionBtn, { backgroundColor: palette.inputBg }]}
              >
                <BookOpen size={14} color={palette.textPrimary} />
                <Text style={[styles.actionBtnText, { color: palette.textPrimary }]}>Read</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  triggerLightHaptic();
                  router.push({ pathname: '/study-workspace' as any, params: { bookId: todayScripture.bookId, chapter: todayScripture.chapter, verse: todayScripture.verse } });
                }}
                style={[styles.actionBtn, { backgroundColor: palette.accentGreenLight }]}
              >
                <Sparkles size={14} color={palette.accentGreen} />
                <Text style={[styles.actionBtnText, { color: palette.accentGreen }]}>Study</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  triggerMediumHaptic();
                  router.push('/pray-now' as any);
                }}
                style={[styles.actionBtn, { backgroundColor: palette.accentGoldLight }]}
              >
                <Heart size={14} color={palette.accentGold} />
                <Text style={[styles.actionBtnText, { color: palette.accentGold }]}>Pray</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShare}
                style={[styles.actionBtn, { backgroundColor: palette.inputBg }]}
              >
                <Share2 size={14} color={palette.textSecondary} />
                <Text style={[styles.actionBtnText, { color: palette.textSecondary }]}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 2. UNDERSTAND */}
        <View style={{ paddingHorizontal: 20, marginBottom: 18 }}>
          <View style={{ backgroundColor: palette.card, borderRadius: 16, borderWidth: 1, borderColor: palette.cardBorder, padding: 18 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: palette.accentGreen, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Understand
            </Text>
            <Text style={{ fontSize: 15, lineHeight: 22, color: palette.textPrimary }}>
              {todayScripture.understand}
            </Text>
          </View>
        </View>

        {/* 3. REFLECT */}
        <View style={{ paddingHorizontal: 20, marginBottom: 18 }}>
          <View style={{ backgroundColor: palette.card, borderRadius: 16, borderWidth: 1, borderColor: palette.cardBorder, padding: 18 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: palette.accentGold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Reflect
            </Text>
            <Text style={{ fontSize: 16, fontWeight: '600', lineHeight: 24, color: palette.textPrimary, fontStyle: 'italic' }}>
              "{todayScripture.reflectQuestion}"
            </Text>
          </View>
        </View>

        {/* 4. PRAY */}
        <View style={{ paddingHorizontal: 20, marginBottom: 18 }}>
          <View style={{ backgroundColor: palette.card, borderRadius: 16, borderWidth: 1, borderColor: palette.cardBorder, padding: 18 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: palette.accentGreen, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Guided Prayer
            </Text>
            <Text style={{ fontSize: 15, lineHeight: 23, color: palette.textSecondary }}>
              {todayScripture.guidedPrayer}
            </Text>
          </View>
        </View>

        {/* 5. TODAY'S APPLICATION */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View style={{ backgroundColor: palette.accentGreenLight, borderRadius: 16, padding: 18, borderLeftWidth: 4, borderLeftColor: palette.accentGreen }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: palette.accentGreen, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
              Today's Practical Application
            </Text>
            <Text style={{ fontSize: 15, fontWeight: '600', lineHeight: 22, color: palette.textPrimary }}>
              {todayScripture.practicalApplication}
            </Text>
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
