import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useBibleStore } from '../../store/useBibleStore';
import { useSpiritualStore } from '../../store/useSpiritualStore';
import { SpiritualTheme } from '../../constants/spiritualTheme';
import { triggerLightHaptic } from '../../services/mobileHaptics';
import { Calendar, Sun, Moon, Clock, Sparkles, CheckCircle2, ArrowRight, Brain } from 'lucide-react-native';

export default function PlannerScreen() {
  const router = useRouter();
  const { themeMode } = useBibleStore();
  const isDark = themeMode === 'dark';
  const palette = isDark ? SpiritualTheme.dark : SpiritualTheme.light;

  const {
    user,
    morningCompletedDates,
    eveningCompletedDates,
    memoryVerses,
  } = useSpiritualStore();

  const todayStr = new Date().toISOString().split('T')[0];
  const isMorningDone = morningCompletedDates.includes(todayStr);
  const isEveningDone = eveningCompletedDates.includes(todayStr);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }} edges={['top', 'left', 'right']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: palette.accentGreen, textTransform: 'uppercase', letterSpacing: 1.2 }}>
            Personalized Daily Routine
          </Text>
          <Text style={{ fontSize: 26, fontWeight: '800', color: palette.textPrimary, marginTop: 4 }}>
            Daily Bible Planner
          </Text>
          <Text style={{ fontSize: 14, color: palette.textSecondary, marginTop: 4 }}>
            Tailored to your {user.timeCommitment} commitment for growing in {user.growthGoals.slice(0, 3).join(', ')}.
          </Text>
        </View>

        {/* TODAY'S ROUTINE COMPLETION CHECKLIST */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ backgroundColor: palette.card, borderRadius: 18, borderWidth: 1.5, borderColor: (isMorningDone && isEveningDone) ? palette.accentGreen : palette.cardBorder, padding: 18 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={20} color={(isMorningDone && isEveningDone) ? palette.accentGreen : palette.accentGold} />
                <Text style={{ fontSize: 16, fontWeight: '800', color: palette.textPrimary }}>
                  Today's Completion Checklist
                </Text>
              </View>
              <Text style={{ fontSize: 12, fontWeight: '700', color: (isMorningDone && isEveningDone) ? palette.accentGreen : palette.accentGold }}>
                {(isMorningDone && isEveningDone) ? '100% COMPLETE 🎉' : 'IN PROGRESS'}
              </Text>
            </View>

            {/* Interactive Checklist Items */}
            <View style={{ gap: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  triggerLightHaptic();
                  router.push('/morning-journey' as any);
                }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: palette.inputBg, padding: 12, borderRadius: 12 }}
              >
                <CheckCircle2 size={18} color={isMorningDone ? palette.accentGreen : palette.textMuted} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: palette.textPrimary }}>
                    1. Morning Scripture & Walk
                  </Text>
                  <Text style={{ fontSize: 12, color: isMorningDone ? palette.accentGreen : palette.textSecondary }}>
                    {isMorningDone ? 'Completed ✓' : 'Tap to start morning routine'}
                  </Text>
                </View>
                <ArrowRight size={14} color={palette.accentGreen} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  triggerLightHaptic();
                  router.push('/one-year-planner' as any);
                }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: palette.inputBg, padding: 12, borderRadius: 12 }}
              >
                <CheckCircle2 size={18} color={palette.accentGreen} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: palette.textPrimary }}>
                    2. 365-Day Bible Portion
                  </Text>
                  <Text style={{ fontSize: 12, color: palette.accentGreen }}>
                    Old & New Testament • Psalms & Proverbs
                  </Text>
                </View>
                <ArrowRight size={14} color={palette.accentGreen} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  triggerLightHaptic();
                  router.push('/pray-now' as any);
                }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: palette.inputBg, padding: 12, borderRadius: 12 }}
              >
                <CheckCircle2 size={18} color={palette.accentGold} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: palette.textPrimary }}>
                    3. Heart Reflection & Prayer
                  </Text>
                  <Text style={{ fontSize: 12, color: palette.textSecondary }}>
                    Conversational prayer & intercession
                  </Text>
                </View>
                <ArrowRight size={14} color={palette.accentGold} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  triggerLightHaptic();
                  router.push('/evening-journey' as any);
                }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: palette.inputBg, padding: 12, borderRadius: 12 }}
              >
                <CheckCircle2 size={18} color={isEveningDone ? palette.accentGreen : palette.textMuted} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: palette.textPrimary }}>
                    4. Evening Reflection
                  </Text>
                  <Text style={{ fontSize: 12, color: isEveningDone ? palette.accentGreen : palette.textSecondary }}>
                    {isEveningDone ? 'Completed ✓' : 'Review day & surrender burdens'}
                  </Text>
                </View>
                <ArrowRight size={14} color={palette.accentGreen} />
              </TouchableOpacity>
            </View>

            {(isMorningDone && isEveningDone) && (
              <View style={{ marginTop: 12, padding: 12, borderRadius: 10, backgroundColor: palette.accentGreenLight, alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: palette.accentGreen }}>
                  🎉 Amen! Your Daily Bible Walk for today is complete!
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Routine Timeline breakdown */}
        <View style={{ backgroundColor: palette.card, borderRadius: 20, borderWidth: 1, borderColor: palette.cardBorder, padding: 20, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Clock size={18} color={palette.accentGold} />
            <Text style={{ fontSize: 15, fontWeight: '700', color: palette.textPrimary }}>
              Your Daily Schedule ({user.notificationTime})
            </Text>
          </View>

          {/* Schedule blocks */}
          <View style={{ gap: 14 }}>
            <View style={styles.scheduleItem}>
              <View style={[styles.timeBadge, { backgroundColor: palette.accentGreenLight }]}>
                <Text style={[styles.timeText, { color: palette.accentGreen }]}>7:00 AM</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepTitle, { color: palette.textPrimary }]}>SCRIPTURE — 5 min</Text>
                <Text style={[styles.stepSubtitle, { color: palette.textSecondary }]}>Read today's passage & meditate on God's Word</Text>
              </View>
            </View>

            <View style={styles.scheduleItem}>
              <View style={[styles.timeBadge, { backgroundColor: palette.accentGreenLight }]}>
                <Text style={[styles.timeText, { color: palette.accentGreen }]}>7:05 AM</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepTitle, { color: palette.textPrimary }]}>UNDERSTAND — 3 min</Text>
                <Text style={[styles.stepSubtitle, { color: palette.textSecondary }]}>Historical and spiritual context breakdown</Text>
              </View>
            </View>

            <View style={styles.scheduleItem}>
              <View style={[styles.timeBadge, { backgroundColor: palette.accentGoldLight }]}>
                <Text style={[styles.timeText, { color: palette.accentGold }]}>7:08 AM</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepTitle, { color: palette.textPrimary }]}>REFLECT — 2 min</Text>
                <Text style={[styles.stepSubtitle, { color: palette.textSecondary }]}>Personal inquiry & heart examination</Text>
              </View>
            </View>

            <View style={styles.scheduleItem}>
              <View style={[styles.timeBadge, { backgroundColor: palette.accentGoldLight }]}>
                <Text style={[styles.timeText, { color: palette.accentGold }]}>7:10 AM</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepTitle, { color: palette.textPrimary }]}>PRAY — 3 min</Text>
                <Text style={[styles.stepSubtitle, { color: palette.textSecondary }]}>Guided conversational prayer with God</Text>
              </View>
            </View>

            <View style={styles.scheduleItem}>
              <View style={[styles.timeBadge, { backgroundColor: palette.accentGreenLight }]}>
                <Text style={[styles.timeText, { color: palette.accentGreen }]}>7:13 AM</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.stepTitle, { color: palette.textPrimary }]}>APPLY — 2 min</Text>
                <Text style={[styles.stepSubtitle, { color: palette.textSecondary }]}>One practical step to live it out today</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 365-Day One-Year Bible Plan Feature Banner */}
        <TouchableOpacity
          onPress={() => {
            triggerLightHaptic();
            router.push('/one-year-planner' as any);
          }}
          activeOpacity={0.88}
          style={{
            backgroundColor: palette.card,
            borderRadius: 20,
            borderWidth: 1.5,
            borderColor: palette.accentGreen,
            padding: 18,
            marginBottom: 20,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: palette.accentGreenLight, justifyContent: 'center', alignItems: 'center' }}>
                <Sparkles size={22} color={palette.accentGreen} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.accentGold, textTransform: 'uppercase', letterSpacing: 1 }}>
                  • 365-DAY BIBLE PLAN
                </Text>
                <Text style={{ fontSize: 17, fontWeight: '800', color: palette.textPrimary, marginTop: 1 }}>
                  One-Year Bible Planner
                </Text>
                <Text style={{ fontSize: 13, color: palette.textSecondary, marginTop: 2 }}>
                  Old & New Testament, Psalms & Proverbs daily
                </Text>
              </View>
            </View>

            <View style={{ backgroundColor: palette.accentGreen, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFFFFF' }}>Open Plan →</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Guided Journeys Section */}
        <Text style={{ fontSize: 18, fontWeight: '800', color: palette.textPrimary, marginBottom: 14 }}>
          Guided Daily Routines
        </Text>

        {/* Morning Journey Card */}
        <TouchableOpacity
          onPress={() => {
            triggerLightHaptic();
            router.push('/morning-journey' as any);
          }}
          activeOpacity={0.85}
          style={{
            backgroundColor: palette.card,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: isMorningDone ? palette.accentGreen : palette.cardBorder,
            padding: 18,
            marginBottom: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: palette.accentGoldLight, alignItems: 'center', justifyContent: 'center' }}>
              <Sun size={22} color={palette.accentGold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: palette.textPrimary }}>Morning Journey</Text>
              <Text style={{ fontSize: 13, color: palette.textSecondary, marginTop: 2 }}>Start your morning rooted in Scripture</Text>
            </View>
          </View>
          {isMorningDone ? (
            <CheckCircle2 size={24} color={palette.accentGreen} />
          ) : (
            <ArrowRight size={20} color={palette.accentGreen} />
          )}
        </TouchableOpacity>

        {/* Evening Journey Card */}
        <TouchableOpacity
          onPress={() => {
            triggerLightHaptic();
            router.push('/evening-journey' as any);
          }}
          activeOpacity={0.85}
          style={{
            backgroundColor: palette.card,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: isEveningDone ? palette.accentGreen : palette.cardBorder,
            padding: 18,
            marginBottom: 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: palette.accentGreenLight, alignItems: 'center', justifyContent: 'center' }}>
              <Moon size={22} color={palette.accentGreen} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: palette.textPrimary }}>Evening Reflection</Text>
              <Text style={{ fontSize: 13, color: palette.textSecondary, marginTop: 2 }}>Review your day, surrender burdens</Text>
            </View>
          </View>
          {isEveningDone ? (
            <CheckCircle2 size={24} color={palette.accentGreen} />
          ) : (
            <ArrowRight size={20} color={palette.accentGreen} />
          )}
        </TouchableOpacity>

        {/* Scripture Memory Review Queue */}
        <View style={{ backgroundColor: palette.card, borderRadius: 18, borderWidth: 1, borderColor: palette.cardBorder, padding: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Brain size={18} color={palette.accentGold} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: palette.textPrimary }}>
                Scripture Memory
              </Text>
            </View>
            <TouchableOpacity onPress={() => {
              triggerLightHaptic();
              router.push('/memory-practice' as any);
            }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: palette.accentGreen }}>Practice →</Text>
            </TouchableOpacity>
          </View>

          {memoryVerses.length === 0 ? (
            <Text style={{ fontSize: 14, color: palette.textSecondary, fontStyle: 'italic' }}>
              No verses added yet. Highlight a verse in the Bible tab to add it to your memory list!
            </Text>
          ) : (
            memoryVerses.slice(0, 2).map((mv) => (
              <View key={mv.id} style={{ backgroundColor: palette.inputBg, borderRadius: 12, padding: 12, marginBottom: 8 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: palette.accentGreen, marginBottom: 2 }}>
                  {mv.bookName} {mv.chapter}:{mv.verse}
                </Text>
                <Text style={{ fontSize: 13, color: palette.textSecondary }} numberOfLines={2}>
                  "{mv.text}"
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
