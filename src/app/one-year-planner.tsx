import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useBibleStore } from '../store/useBibleStore';
import { SpiritualTheme } from '../constants/spiritualTheme';
import {
  getReadingForDay,
  getCurrentYearDayNumber,
  ScripturePortion,
} from '../engine/oneYearPlanEngine';
import { triggerLightHaptic, triggerSuccessHaptic } from '../services/mobileHaptics';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  ArrowRight,
  Award,
} from 'lucide-react-native';

export default function OneYearPlannerScreen() {
  const router = useRouter();
  const { themeMode, setLocation, completedPlanDays, togglePlanDay } = useBibleStore();
  const isDark = themeMode === 'dark';
  const palette = isDark ? SpiritualTheme.dark : SpiritualTheme.light;

  const currentYearDay = getCurrentYearDayNumber();
  const [selectedDay, setSelectedDay] = useState(currentYearDay);

  const planId = 'one-year-bible-plan';
  const completedDaysArray = completedPlanDays[planId] || [];
  const isDayCompleted = completedDaysArray.includes(selectedDay);

  const reading = getReadingForDay(selectedDay);
  const totalCompletedCount = completedDaysArray.length;
  const progressPercent = Math.min(100, Math.round((totalCompletedCount / 365) * 100));

  const handleToggleComplete = () => {
    triggerSuccessHaptic();
    togglePlanDay(planId, selectedDay);
    if (!isDayCompleted) {
      Alert.alert('Day Completed! 🎉', `Amen! You completed Day ${selectedDay} of your One-Year Bible Plan.`);
    }
  };

  const handleOpenScriptureInBible = (portion: ScripturePortion) => {
    triggerLightHaptic();
    setLocation(portion.bookId, portion.chapter);
    router.push('/(tabs)/bible' as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }} edges={['top', 'left', 'right']}>
      <Stack.Screen
        options={{
          title: '365-Day Bible Planner',
          headerStyle: { backgroundColor: palette.card },
          headerTintColor: palette.textPrimary,
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        }}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 18, gap: 16, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Card */}
        <View style={[styles.progressCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[styles.badgeIcon, { backgroundColor: palette.accentGreenLight }]}>
                <Award size={22} color={palette.accentGreen} />
              </View>
              <View>
                <Text style={[styles.progressTitle, { color: palette.textPrimary }]}>365-Day Bible Progress</Text>
                <Text style={{ fontSize: 13, color: palette.textSecondary }}>
                  {totalCompletedCount} of 365 Days Completed ({progressPercent}%)
                </Text>
              </View>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={[styles.progressBarTrack, { backgroundColor: palette.inputBg }]}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.max(3, progressPercent)}%`, backgroundColor: palette.accentGreen },
              ]}
            />
          </View>
        </View>

        {/* Day Navigator */}
        <View style={[styles.dayNavCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
          <TouchableOpacity
            onPress={() => {
              triggerLightHaptic();
              setSelectedDay((prev) => Math.max(1, prev - 1));
            }}
            style={styles.navBtn}
          >
            <ChevronLeft size={22} color={palette.textPrimary} />
          </TouchableOpacity>

          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: palette.accentGold, textTransform: 'uppercase' }}>
              {selectedDay === currentYearDay ? '• TODAY' : `DAY ${selectedDay} OF 365`}
            </Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: palette.textPrimary, marginTop: 2 }}>
              Day {selectedDay}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              triggerLightHaptic();
              setSelectedDay((prev) => Math.min(365, prev + 1));
            }}
            style={styles.navBtn}
          >
            <ChevronRight size={22} color={palette.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Quick Jump Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
          <TouchableOpacity
            onPress={() => {
              triggerLightHaptic();
              setSelectedDay(currentYearDay);
            }}
            style={[styles.jumpChip, { backgroundColor: palette.accentGreenLight }]}
          >
            <Calendar size={13} color={palette.accentGreen} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: palette.accentGreen }}>
              Jump to Today (Day {currentYearDay})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Readings List Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: palette.textPrimary }}>
            Today's Scripture Readings
          </Text>
          <TouchableOpacity onPress={handleToggleComplete} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={18} color={isDayCompleted ? palette.accentGreen : palette.textMuted} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: isDayCompleted ? palette.accentGreen : palette.textSecondary }}>
              {isDayCompleted ? 'Day Finished ✓' : 'Mark Day Done'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Portion 1: Old Testament */}
        <View style={[styles.portionCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ backgroundColor: 'rgba(200, 150, 62, 0.12)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: palette.accentGold }}>OLD TESTAMENT</Text>
            </View>
            <BookOpen size={16} color={palette.textMuted} />
          </View>

          <Text style={{ fontSize: 18, fontWeight: '800', color: palette.textPrimary, marginTop: 8 }}>
            {reading.oldTestament.displayText}
          </Text>

          <TouchableOpacity
            onPress={() => handleOpenScriptureInBible(reading.oldTestament)}
            style={[styles.readBtn, { backgroundColor: palette.accentGreen }]}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>Read Passage</Text>
            <ArrowRight size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Portion 2: New Testament */}
        <View style={[styles.portionCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ backgroundColor: palette.accentGreenLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: palette.accentGreen }}>NEW TESTAMENT</Text>
            </View>
            <Sparkles size={16} color={palette.textMuted} />
          </View>

          <Text style={{ fontSize: 18, fontWeight: '800', color: palette.textPrimary, marginTop: 8 }}>
            {reading.newTestament.displayText}
          </Text>

          <TouchableOpacity
            onPress={() => handleOpenScriptureInBible(reading.newTestament)}
            style={[styles.readBtn, { backgroundColor: palette.accentGreen }]}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>Read Passage</Text>
            <ArrowRight size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Portion 3: Psalms */}
        <View style={[styles.portionCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ backgroundColor: 'rgba(52, 152, 219, 0.12)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#3498DB' }}>PSALMS</Text>
            </View>
            <BookOpen size={16} color={palette.textMuted} />
          </View>

          <Text style={{ fontSize: 18, fontWeight: '800', color: palette.textPrimary, marginTop: 8 }}>
            {reading.psalm.displayText}
          </Text>

          <TouchableOpacity
            onPress={() => handleOpenScriptureInBible(reading.psalm)}
            style={[styles.readBtn, { backgroundColor: palette.accentGreen }]}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>Read Passage</Text>
            <ArrowRight size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Portion 4: Proverbs */}
        <View style={[styles.portionCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ backgroundColor: 'rgba(155, 89, 182, 0.12)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#9B59B6' }}>PROVERBS</Text>
            </View>
            <Sparkles size={16} color={palette.textMuted} />
          </View>

          <Text style={{ fontSize: 18, fontWeight: '800', color: palette.textPrimary, marginTop: 8 }}>
            {reading.proverb.displayText}
          </Text>

          <TouchableOpacity
            onPress={() => handleOpenScriptureInBible(reading.proverb)}
            style={[styles.readBtn, { backgroundColor: palette.accentGreen }]}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>Read Passage</Text>
            <ArrowRight size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  progressCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  badgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  dayNavCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jumpChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  portionCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  readBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    marginTop: 6,
  },
});
