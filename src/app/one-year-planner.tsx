import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useBibleStore, calculateFaithStreak } from '../store/useBibleStore';
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
  Clock,
  Heart,
  Moon,
  Plus,
  Minus,
  Flame,
  Check,
  Sun,
  X,
  AlertCircle,
  Lock,
} from 'lucide-react-native';

type ViewMode = 'today' | 'calendar';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const WEEKDAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function getPlanDayForMonthDate(year: number, month: number, dayOfMonth: number): number {
  const date = new Date(year, month, dayOfMonth);
  const start = new Date(year, 0, 0);
  const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  return Math.min(365, Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24))));
}

function getDateDetailsForDay(dayNumber: number, year: number = new Date().getFullYear()) {
  const date = new Date(year, 0, dayNumber);
  const monthName = date.toLocaleString('en-US', { month: 'short' });
  const fullMonthName = date.toLocaleString('en-US', { month: 'long' });
  const dayOfMonth = date.getDate();
  const weekdayName = date.toLocaleString('en-US', { weekday: 'long' });
  const weekdayShort = date.toLocaleString('en-US', { weekday: 'short' });
  return { monthName, fullMonthName, dayOfMonth, weekdayName, weekdayShort, year };
}

const DEVOTIONAL_VERSES = [
  { verse: "Thy word is a lamp unto my feet, and a light unto my path.", reference: "Psalm 119:105" },
  { verse: "Let the word of Christ dwell in you richly in all wisdom.", reference: "Colossians 3:16" },
  { verse: "Rooted and built up in Him, and stablished in the faith.", reference: "Colossians 2:7" },
  { verse: "I can do all things through Christ which strengtheneth me.", reference: "Philippians 4:13" },
  { verse: "Man shall not live by bread alone, but by every word of God.", reference: "Luke 4:4" },
];

export default function OneYearPlannerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const {
    themeMode,
    setLocation,
    completedPlanDays,
    togglePlanDay,
    dailyTimeLogs,
    setDailyTimeLog,
    dailyStreak,
    setDailyStreak,
    rewardPoints,
    addRewardPoints,
  } = useBibleStore();

  const isDark = themeMode === 'dark';
  const palette = isDark ? SpiritualTheme.dark : SpiritualTheme.light;

  const currentYearDay = getCurrentYearDayNumber();
  const [selectedDay, setSelectedDay] = useState(currentYearDay);
  const initialMode: ViewMode = params.mode === 'calendar' || params.mode === 'spreadsheet' ? 'calendar' : 'today';
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);
  const [isTimeLoggingOpen, setIsTimeLoggingOpen] = useState(false);

  // Calendar States: tapped date details are ONLY exposed on tap!
  const [tappedCalendarDay, setTappedCalendarDay] = useState<number | null>(null);
  const now = new Date();
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth());
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());

  const handlePrevMonth = () => {
    triggerLightHaptic();
    setTappedCalendarDay(null); // reset exposed card when browsing months
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((prev) => prev - 1);
    } else {
      setCalendarMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    triggerLightHaptic();
    setTappedCalendarDay(null); // reset exposed card when browsing months
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((prev) => prev + 1);
    } else {
      setCalendarMonth((prev) => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    triggerLightHaptic();
    const today = new Date();
    setCalendarMonth(today.getMonth());
    setCalendarYear(today.getFullYear());
    setSelectedDay(currentYearDay);
    setTappedCalendarDay(currentYearDay);
  };

  // Reward Modal state
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [rewardDetails, setRewardDetails] = useState({
    streakCount: 1,
    pointsEarned: 100,
    milestoneTitle: '',
  });

  const planId = 'one-year-bible-plan';
  const completedDaysArray = completedPlanDays[planId] || [];
  const isDayCompleted = completedDaysArray.includes(selectedDay);

  const reading = getReadingForDay(selectedDay);
  const totalCompletedCount = completedDaysArray.length;
  const progressPercent = Math.min(100, Math.round((totalCompletedCount / 365) * 100));

  const dailyDevotional = DEVOTIONAL_VERSES[selectedDay % DEVOTIONAL_VERSES.length];
  const currentStreak = calculateFaithStreak(completedDaysArray);

  const getDayLog = (dayNum: number) => {
    const key = `${planId}:${dayNum}`;
    return dailyTimeLogs[key] || { readingMinutes: 15, prayerMinutes: 10, quietMinutes: 10 };
  };

  const currentDayLog = getDayLog(selectedDay);
  const totalLogMinutes = currentDayLog.readingMinutes + currentDayLog.prayerMinutes + currentDayLog.quietMinutes;

  /**
   * Toggle completion with STRICT integrity rule:
   * If a user skipped a past day, they CANNOT turn it green!
   */
  const handleToggleComplete = (dayNum: number = selectedDay) => {
    const isCurrentlyDone = completedDaysArray.includes(dayNum);
    const isPast = dayNum < currentYearDay;

    // STRICT USER RULE: If skipped in the past, do NOT allow marking green!
    if (isPast && !isCurrentlyDone) {
      Alert.alert(
        "Day Skipped & Locked",
        "You missed this day's reading. You can still read the scriptures to catch up, but past missed days cannot be turned green to keep your faith streak honest."
      );
      return;
    }

    triggerSuccessHaptic();
    togglePlanDay(planId, dayNum);

    if (!isCurrentlyDone) {
      const updatedDays = [...completedDaysArray, dayNum];
      const newStreak = calculateFaithStreak(updatedDays);
      let pts = 100;
      let milestone = '';

      if (newStreak === 1) milestone = 'First Step of Faith ✝️';
      else if (newStreak === 3) { pts += 50; milestone = 'Spark of Grace 🔥'; }
      else if (newStreak === 7) { pts += 200; milestone = 'Flame of Faith 🕯️'; }
      else if (newStreak === 14) { pts += 350; milestone = 'Shield of Truth 🛡️'; }
      else if (newStreak === 30) { pts += 1000; milestone = 'Pillar of Grace 🏛️'; }
      else if (newStreak === 100) { pts += 2500; milestone = 'Crown of Life 👑'; }

      setDailyStreak(newStreak);
      if (pts > 100) {
        addRewardPoints(pts - 100);
      }

      setRewardDetails({
        streakCount: newStreak,
        pointsEarned: pts,
        milestoneTitle: milestone,
      });
      setIsRewardModalOpen(true);
    }
  };

  const handleOpenScriptureInBible = (portion: ScripturePortion) => {
    triggerLightHaptic();
    setLocation(portion.bookId, portion.chapter);
    router.push('/(tabs)/bible' as any);
  };

  const adjustTime = (dayNum: number, field: 'readingMinutes' | 'prayerMinutes' | 'quietMinutes', delta: number) => {
    triggerLightHaptic();
    const currentLog = getDayLog(dayNum);
    const newValue = Math.max(0, currentLog[field] + delta);
    setDailyTimeLog(planId, dayNum, { [field]: newValue });
  };

  const dateDetails = getDateDetailsForDay(selectedDay);
  const isSelectedDayToday = selectedDay === currentYearDay;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }} edges={['top', 'left', 'right']}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      {/* 1. TOP HEADER BAR */}
      <View style={{ paddingHorizontal: 18, paddingTop: 12, paddingBottom: 10, backgroundColor: palette.card, borderBottomWidth: 1, borderBottomColor: palette.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity
              onPress={() => {
                triggerLightHaptic();
                router.back();
              }}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: palette.inputBg, alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronLeft size={20} color={palette.textPrimary} />
            </TouchableOpacity>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '900', color: palette.textPrimary, letterSpacing: -0.3 }}>
                365-Day Walk with Christ
              </Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color: palette.textSecondary, marginTop: 1 }}>
                Day {selectedDay} • {dateDetails.fullMonthName} {dateDetails.dayOfMonth}
              </Text>
            </View>
          </View>

          {/* Flame Streak Badge */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(217, 119, 6, 0.14)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(217, 119, 6, 0.3)' }}>
            <Flame size={14} color="#D97706" />
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#D97706' }}>
              {currentStreak}d Streak
            </Text>
          </View>
        </View>

        {/* Progress Bar Line */}
        <View style={{ marginTop: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: palette.textSecondary }}>
              Overall Year Progress
            </Text>
            <Text style={{ fontSize: 11, fontWeight: '800', color: palette.accentGold }}>
              {progressPercent}% ({totalCompletedCount} of 365 Days)
            </Text>
          </View>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: palette.inputBg, overflow: 'hidden' }}>
            <View style={{ width: `${Math.max(2, progressPercent)}%`, height: '100%', backgroundColor: palette.accentGold, borderRadius: 3 }} />
          </View>
        </View>
      </View>

      {/* 2. MAIN 2-TAB SEGMENT SWITCHER */}
      <View style={{ paddingHorizontal: 18, paddingVertical: 10, backgroundColor: palette.card, borderBottomWidth: 1, borderBottomColor: palette.border }}>
        <View style={{ flexDirection: 'row', backgroundColor: palette.inputBg, borderRadius: 12, padding: 3 }}>
          <TouchableOpacity
            onPress={() => {
              triggerLightHaptic();
              setViewMode('today');
            }}
            style={[
              styles.segmentPill,
              viewMode === 'today' && { backgroundColor: palette.card, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 2 },
            ]}
          >
            <Sun size={14} color={viewMode === 'today' ? palette.accentGold : palette.textSecondary} />
            <Text style={[styles.segmentText, { color: viewMode === 'today' ? palette.textPrimary : palette.textSecondary, fontWeight: viewMode === 'today' ? '800' : '600' }]}>
              Today's Reading
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              triggerLightHaptic();
              setViewMode('calendar');
            }}
            style={[
              styles.segmentPill,
              viewMode === 'calendar' && { backgroundColor: palette.card, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, elevation: 2 },
            ]}
          >
            <Calendar size={14} color={viewMode === 'calendar' ? palette.accentGreen : palette.textSecondary} />
            <Text style={[styles.segmentText, { color: viewMode === 'calendar' ? palette.textPrimary : palette.textSecondary, fontWeight: viewMode === 'calendar' ? '800' : '600' }]}>
              Calendar Grid
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ======================================================== */}
      {/* TAB 1: TODAY'S READING (UNIFIED SCRIPTURE JOURNEY)       */}
      {/* ======================================================== */}
      {viewMode === 'today' && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 18, gap: 14, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Day Navigation Bar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <TouchableOpacity
              onPress={() => {
                triggerLightHaptic();
                setSelectedDay((prev) => Math.max(1, prev - 1));
              }}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: palette.card, borderWidth: 1, borderColor: palette.cardBorder, alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronLeft size={20} color={palette.textPrimary} />
            </TouchableOpacity>

            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: palette.accentGold, textTransform: 'uppercase', letterSpacing: 1 }}>
                {isSelectedDayToday ? '• TODAY’S WALK' : `DAY ${selectedDay} OF 365`}
              </Text>
              <Text style={{ fontSize: 17, fontWeight: '900', color: palette.textPrimary, marginTop: 1 }}>
                {dateDetails.weekdayShort}, {dateDetails.monthName} {dateDetails.dayOfMonth}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                triggerLightHaptic();
                setSelectedDay((prev) => Math.min(365, prev + 1));
              }}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: palette.card, borderWidth: 1, borderColor: palette.cardBorder, alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronRight size={20} color={palette.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Quick Jump to Today (if navigating other dates) */}
          {!isSelectedDayToday && (
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity
                onPress={handleJumpToToday}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(217, 119, 6, 0.12)', borderWidth: 1, borderColor: palette.accentGold, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 }}
              >
                <Calendar size={12} color={palette.accentGold} />
                <Text style={{ fontSize: 11, fontWeight: '800', color: palette.accentGold }}>
                  Jump to Today's Walk (Day {currentYearDay})
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Sacred Scripture Anchor Quote */}
          <View style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFFBF4', borderRadius: 14, borderWidth: 1, borderColor: palette.border, paddingHorizontal: 16, paddingVertical: 10 }}>
            <Text style={{ fontSize: 12.5, fontStyle: 'italic', color: palette.textSecondary, lineHeight: 18, textAlign: 'center' }}>
              "{dailyDevotional.verse}"
            </Text>
            <Text style={{ fontSize: 11, fontWeight: '700', color: palette.accentGold, marginTop: 3, textAlign: 'center' }}>
              — {dailyDevotional.reference}
            </Text>
          </View>

          {/* 🌟 THE UNIFIED SCRIPTURE JOURNEY CARD */}
          <View
            style={{
              backgroundColor: palette.card,
              borderRadius: 20,
              borderWidth: 1.5,
              borderColor: isDayCompleted ? palette.accentGreen : (selectedDay < currentYearDay ? '#EF4444' : palette.cardBorder),
              padding: 18,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.06,
              shadowRadius: 10,
              elevation: 3,
            }}
          >
            {/* Card Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <BookOpen size={18} color={palette.accentGold} />
                <Text style={{ fontSize: 16, fontWeight: '900', color: palette.textPrimary }}>
                  Scripture Journey
                </Text>
              </View>

              <View style={{
                backgroundColor: isDayCompleted
                  ? palette.accentGreenLight
                  : selectedDay < currentYearDay
                  ? (isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2')
                  : 'rgba(217, 119, 6, 0.12)',
                paddingHorizontal: 9,
                paddingVertical: 3,
                borderRadius: 10,
              }}>
                <Text style={{
                  fontSize: 11,
                  fontWeight: '800',
                  color: isDayCompleted
                    ? palette.accentGreen
                    : selectedDay < currentYearDay
                    ? '#DC2626'
                    : palette.accentGold,
                }}>
                  {isDayCompleted ? '✓ Completed' : selectedDay < currentYearDay ? 'Missed Day' : '4 Portions'}
                </Text>
              </View>
            </View>

            {/* 4 Consolidated Scripture Rows */}
            <View style={{ gap: 10 }}>
              {/* Row 1: Old Testament */}
              <View style={[styles.portionRow, { backgroundColor: palette.inputBg, borderColor: palette.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: isDayCompleted ? palette.accentGreenLight : 'rgba(217, 119, 6, 0.14)', alignItems: 'center', justifyContent: 'center' }}>
                    {isDayCompleted ? (
                      <Check size={14} color={palette.accentGreen} />
                    ) : (
                      <Text style={{ fontSize: 11, fontWeight: '800', color: palette.accentGold }}>1</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10.5, fontWeight: '700', color: palette.accentGold, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Old Testament
                    </Text>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: palette.textPrimary, marginTop: 1 }}>
                      {reading.oldTestament.displayText}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleOpenScriptureInBible(reading.oldTestament)}
                  style={[styles.rowReadBtn, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}
                >
                  <Text style={{ fontSize: 12, fontWeight: '800', color: palette.accentGold }}>Read</Text>
                  <ArrowRight size={13} color={palette.accentGold} />
                </TouchableOpacity>
              </View>

              {/* Row 2: New Testament */}
              <View style={[styles.portionRow, { backgroundColor: palette.inputBg, borderColor: palette.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: isDayCompleted ? palette.accentGreenLight : 'rgba(16, 185, 129, 0.14)', alignItems: 'center', justifyContent: 'center' }}>
                    {isDayCompleted ? (
                      <Check size={14} color={palette.accentGreen} />
                    ) : (
                      <Text style={{ fontSize: 11, fontWeight: '800', color: palette.accentGreen }}>2</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10.5, fontWeight: '700', color: palette.accentGreen, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      New Testament
                    </Text>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: palette.textPrimary, marginTop: 1 }}>
                      {reading.newTestament.displayText}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleOpenScriptureInBible(reading.newTestament)}
                  style={[styles.rowReadBtn, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}
                >
                  <Text style={{ fontSize: 12, fontWeight: '800', color: palette.accentGreen }}>Read</Text>
                  <ArrowRight size={13} color={palette.accentGreen} />
                </TouchableOpacity>
              </View>

              {/* Row 3: Psalms */}
              <View style={[styles.portionRow, { backgroundColor: palette.inputBg, borderColor: palette.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: isDayCompleted ? palette.accentGreenLight : 'rgba(52, 152, 219, 0.14)', alignItems: 'center', justifyContent: 'center' }}>
                    {isDayCompleted ? (
                      <Check size={14} color={palette.accentGreen} />
                    ) : (
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#3498DB' }}>3</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#3498DB', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Psalms
                    </Text>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: palette.textPrimary, marginTop: 1 }}>
                      {reading.psalm.displayText}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleOpenScriptureInBible(reading.psalm)}
                  style={[styles.rowReadBtn, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}
                >
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#3498DB' }}>Read</Text>
                  <ArrowRight size={13} color="#3498DB" />
                </TouchableOpacity>
              </View>

              {/* Row 4: Proverbs */}
              <View style={[styles.portionRow, { backgroundColor: palette.inputBg, borderColor: palette.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: isDayCompleted ? palette.accentGreenLight : 'rgba(155, 89, 182, 0.14)', alignItems: 'center', justifyContent: 'center' }}>
                    {isDayCompleted ? (
                      <Check size={14} color={palette.accentGreen} />
                    ) : (
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#9B59B6' }}>4</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#9B59B6', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Proverbs
                    </Text>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: palette.textPrimary, marginTop: 1 }}>
                      {reading.proverb.displayText}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleOpenScriptureInBible(reading.proverb)}
                  style={[styles.rowReadBtn, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}
                >
                  <Text style={{ fontSize: 12, fontWeight: '800', color: '#9B59B6' }}>Read</Text>
                  <ArrowRight size={13} color="#9B59B6" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Complete Day Button */}
            {selectedDay < currentYearDay && !isDayCompleted ? (
              <View style={{ marginTop: 16, padding: 12, borderRadius: 14, backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2', borderWidth: 1.5, borderColor: '#DC2626', alignItems: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#DC2626' }}>
                  ❌ Missed Day • Reading Allowed (Cannot Mark Green)
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => handleToggleComplete(selectedDay)}
                activeOpacity={0.85}
                style={{
                  marginTop: 16,
                  paddingVertical: 14,
                  borderRadius: 14,
                  backgroundColor: isDayCompleted ? palette.accentGreenLight : palette.accentGold,
                  borderWidth: 1.5,
                  borderColor: isDayCompleted ? palette.accentGreen : palette.accentGold,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 8,
                }}
              >
                <CheckCircle2 size={18} color={isDayCompleted ? palette.accentGreen : '#FFFFFF'} />
                <Text style={{ fontSize: 15, fontWeight: '900', color: isDayCompleted ? palette.accentGreen : '#FFFFFF' }}>
                  {isDayCompleted ? 'Day ' + selectedDay + ' Completed ✓' : 'Complete Today\'s Walk ✓'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ⏱️ COLLAPSIBLE DEDICATED TIME TRACKER */}
          <View style={{ backgroundColor: palette.card, borderRadius: 16, borderWidth: 1, borderColor: palette.cardBorder, overflow: 'hidden' }}>
            <TouchableOpacity
              onPress={() => {
                triggerLightHaptic();
                setIsTimeLoggingOpen(!isTimeLoggingOpen);
              }}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Clock size={16} color={palette.accentGold} />
                <Text style={{ fontSize: 13, fontWeight: '800', color: palette.textPrimary }}>
                  Dedicated Time: {totalLogMinutes} mins logged
                </Text>
              </View>
              <Text style={{ fontSize: 12, fontWeight: '700', color: palette.textSecondary }}>
                {isTimeLoggingOpen ? 'Hide ▲' : 'Log Time ▼'}
              </Text>
            </TouchableOpacity>

            {isTimeLoggingOpen && (
              <View style={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4, gap: 10 }}>
                <Text style={{ fontSize: 11, color: palette.textSecondary }}>
                  Track your intentional minutes spent with the Lord today:
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                  {/* Reading Time */}
                  <View style={{ flex: 1, backgroundColor: palette.inputBg, padding: 10, borderRadius: 12, alignItems: 'center' }}>
                    <BookOpen size={15} color={palette.accentGreen} />
                    <Text style={{ fontSize: 10.5, fontWeight: '700', color: palette.textSecondary, marginTop: 4 }}>Word Study</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <TouchableOpacity onPress={() => adjustTime(selectedDay, 'readingMinutes', -5)}>
                        <Minus size={14} color={palette.textSecondary} />
                      </TouchableOpacity>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: palette.accentGreen }}>
                        {currentDayLog.readingMinutes}m
                      </Text>
                      <TouchableOpacity onPress={() => adjustTime(selectedDay, 'readingMinutes', 5)}>
                        <Plus size={14} color={palette.accentGreen} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Prayer Time */}
                  <View style={{ flex: 1, backgroundColor: palette.inputBg, padding: 10, borderRadius: 12, alignItems: 'center' }}>
                    <Heart size={15} color="#E11D48" />
                    <Text style={{ fontSize: 10.5, fontWeight: '700', color: palette.textSecondary, marginTop: 4 }}>Prayer</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <TouchableOpacity onPress={() => adjustTime(selectedDay, 'prayerMinutes', -5)}>
                        <Minus size={14} color={palette.textSecondary} />
                      </TouchableOpacity>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: '#E11D48' }}>
                        {currentDayLog.prayerMinutes}m
                      </Text>
                      <TouchableOpacity onPress={() => adjustTime(selectedDay, 'prayerMinutes', 5)}>
                        <Plus size={14} color="#E11D48" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Quiet Time */}
                  <View style={{ flex: 1, backgroundColor: palette.inputBg, padding: 10, borderRadius: 12, alignItems: 'center' }}>
                    <Moon size={15} color="#7C3AED" />
                    <Text style={{ fontSize: 10.5, fontWeight: '700', color: palette.textSecondary, marginTop: 4 }}>Reflection</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <TouchableOpacity onPress={() => adjustTime(selectedDay, 'quietMinutes', -5)}>
                        <Minus size={14} color={palette.textSecondary} />
                      </TouchableOpacity>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: '#7C3AED' }}>
                        {currentDayLog.quietMinutes}m
                      </Text>
                      <TouchableOpacity onPress={() => adjustTime(selectedDay, 'quietMinutes', 5)}>
                        <Plus size={14} color="#7C3AED" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CALENDAR & PLAN VIEW                              */}
      {/* ======================================================== */}
      {viewMode === 'calendar' && (() => {
        const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
        const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();
        const monthCompletedCount = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter((d) => {
          const pDay = getPlanDayForMonthDate(calendarYear, calendarMonth, d);
          return completedDaysArray.includes(pDay);
        }).length;

        // Details for the tapped date (if any)
        const tappedDayNumber = tappedCalendarDay;
        const tappedReading = tappedDayNumber ? getReadingForDay(tappedDayNumber) : null;
        const isTappedDone = tappedDayNumber ? completedDaysArray.includes(tappedDayNumber) : false;
        const isTappedToday = tappedDayNumber === currentYearDay && calendarYear === now.getFullYear();
        const isTappedPast = tappedDayNumber ? (tappedDayNumber < currentYearDay || calendarYear < now.getFullYear()) : false;
        const isTappedFuture = tappedDayNumber ? (tappedDayNumber > currentYearDay && calendarYear >= now.getFullYear()) : false;
        const tappedDetails = tappedDayNumber ? getDateDetailsForDay(tappedDayNumber, calendarYear) : null;

        return (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
            {/* Month Navigator Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: palette.card }}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
                <ChevronLeft size={20} color={palette.textPrimary} />
              </TouchableOpacity>

              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 17, fontWeight: '900', color: palette.textPrimary }}>
                  {MONTH_NAMES[calendarMonth]} {calendarYear}
                </Text>
                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.accentGold, marginTop: 2 }}>
                  {monthCompletedCount} of {daysInMonth} Days Completed ({Math.round((monthCompletedCount / daysInMonth) * 100)}%)
                </Text>
              </View>

              <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
                <ChevronRight size={20} color={palette.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* 12-Month Quick Pill Carousel */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ backgroundColor: palette.card, borderBottomWidth: 1, borderBottomColor: palette.border, paddingHorizontal: 12, paddingBottom: 10 }}>
              {MONTH_SHORT_NAMES.map((name, idx) => {
                const isCur = calendarMonth === idx;
                return (
                  <TouchableOpacity
                    key={name}
                    onPress={() => {
                      triggerLightHaptic();
                      setTappedCalendarDay(null);
                      setCalendarMonth(idx);
                    }}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                      borderRadius: 8,
                      marginRight: 6,
                      backgroundColor: isCur ? palette.accentGold : palette.inputBg,
                      borderWidth: 1,
                      borderColor: isCur ? palette.accentGold : palette.border,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: isCur ? '900' : '600', color: isCur ? '#FFFFFF' : palette.textSecondary }}>
                      {name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Calendar Legend Bar */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 14, paddingVertical: 8, backgroundColor: isDark ? '#141210' : '#FAF8F5' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#10B981' }} />
                <Text style={{ fontSize: 10.5, fontWeight: '700', color: palette.textSecondary }}>Done ✓</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#DC2626' }} />
                <Text style={{ fontSize: 10.5, fontWeight: '800', color: '#DC2626' }}>Missed (Skipped)</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#D97706' }} />
                <Text style={{ fontSize: 10.5, fontWeight: '700', color: palette.textSecondary }}>Today</Text>
              </View>
            </View>

            {/* Weekday Row Header */}
            <View style={{ flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 8, backgroundColor: isDark ? '#171412' : '#F9F6F0', borderTopWidth: 1, borderBottomWidth: 1, borderColor: palette.border }}>
              {WEEKDAY_NAMES.map((wName) => (
                <View key={wName} style={{ width: '14.28%', alignItems: 'center' }}>
                  <Text style={{ fontSize: 10.5, fontWeight: '800', color: (wName === 'SUN' || wName === 'SAT') ? palette.accentGold : palette.textSecondary }}>
                    {wName}
                  </Text>
                </View>
              ))}
            </View>

            {/* 7-Column Calendar Grid */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, paddingVertical: 8, backgroundColor: palette.card }}>
              {/* Empty leading cells */}
              {Array.from({ length: firstDayIndex }).map((_, idx) => (
                <View key={`empty-${idx}`} style={{ width: '14.28%', height: 58, padding: 2 }} />
              ))}

              {/* Days in Month */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dNum = idx + 1;
                const planDay = getPlanDayForMonthDate(calendarYear, calendarMonth, dNum);
                const isDone = completedDaysArray.includes(planDay);
                const isToday = planDay === currentYearDay && calendarYear === now.getFullYear();
                const isPast = planDay < currentYearDay || calendarYear < now.getFullYear();
                const isMissed = isPast && !isDone;
                const isSelected = tappedCalendarDay === planDay;

                return (
                  <View key={`day-${dNum}`} style={{ width: '14.28%', padding: 2 }}>
                    <TouchableOpacity
                      onPress={() => {
                        triggerLightHaptic();
                        // Reveal details for this tapped date!
                        setTappedCalendarDay(planDay);
                        setSelectedDay(planDay);
                      }}
                      activeOpacity={0.78}
                      style={{
                        height: 58,
                        borderRadius: 10,
                        padding: 3,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderWidth: isSelected ? 2.5 : isMissed ? 1.8 : isToday ? 1.8 : isDone ? 1.5 : 1,
                        borderColor: isSelected
                          ? palette.accentGold
                          : isDone
                          ? '#10B981'
                          : isMissed
                          ? '#DC2626' // WAY MORE BRIGHT RED!
                          : isToday
                          ? '#D97706'
                          : palette.border,
                        backgroundColor: isDone
                          ? (isDark ? 'rgba(16, 185, 129, 0.22)' : '#DCFCE7')
                          : isMissed
                          ? (isDark ? 'rgba(239, 68, 68, 0.28)' : '#FEE2E2') // WAY MORE BRIGHT RED TINT!
                          : isToday
                          ? (isDark ? 'rgba(217, 119, 6, 0.18)' : '#FEF3C7')
                          : palette.inputBg,
                      }}
                    >
                      <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2 }}>
                        <Text style={{
                          fontSize: 12,
                          fontWeight: isToday || isSelected || isMissed ? '900' : '700',
                          color: isSelected
                            ? palette.accentGold
                            : isDone
                            ? '#10B981'
                            : isMissed
                            ? '#DC2626' // BRIGHT RED NUMBER
                            : isToday
                            ? '#D97706'
                            : palette.textPrimary,
                        }}>
                          {dNum}
                        </Text>
                        {isToday && (
                          <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: isDone ? '#10B981' : '#D97706' }} />
                        )}
                      </View>

                      {isDone ? (
                        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={12} color="#FFFFFF" />
                        </View>
                      ) : isMissed ? (
                        <View style={{ backgroundColor: '#DC2626', borderRadius: 4, paddingHorizontal: 3, paddingVertical: 1 }}>
                          <Text style={{ fontSize: 6.5, fontWeight: '900', color: '#FFFFFF', letterSpacing: 0.3 }}>MISSED</Text>
                        </View>
                      ) : isToday ? (
                        <View style={{ backgroundColor: '#D97706', borderRadius: 4, paddingHorizontal: 3, paddingVertical: 1 }}>
                          <Text style={{ fontSize: 7, fontWeight: '900', color: '#FFFFFF' }}>TODAY</Text>
                        </View>
                      ) : (
                        <Text style={{ fontSize: 8.5, fontWeight: '700', color: palette.textMuted }}>
                          D{planDay}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            {/* 🌟 ONLY EXPOSED WHEN USER TAPS A PARTICULAR DATE */}
            {tappedCalendarDay !== null && tappedReading && tappedDetails && (
              <View
                style={{
                  marginHorizontal: 16,
                  marginTop: 16,
                  backgroundColor: palette.card,
                  borderRadius: 20,
                  borderWidth: 2,
                  borderColor: isTappedDone
                    ? '#10B981'
                    : isTappedPast && !isTappedDone
                    ? '#DC2626' // BRIGHT RED BORDER FOR MISSED DAY!
                    : isTappedToday
                    ? '#D97706'
                    : palette.cardBorder,
                  padding: 18,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 4,
                }}
              >
                {/* Header with Close ✕ button */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={{
                      fontSize: 11,
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      color: isTappedDone
                        ? '#10B981'
                        : isTappedPast && !isTappedDone
                        ? '#DC2626'
                        : isTappedToday
                        ? '#D97706'
                        : palette.accentGold,
                    }}>
                      {tappedDetails.weekdayName} • DAY {tappedCalendarDay} OF 365
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: palette.textPrimary, marginTop: 2 }}>
                      {tappedDetails.fullMonthName} {tappedDetails.dayOfMonth}, {tappedDetails.year}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {isTappedDone ? (
                      <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 }}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: '#10B981' }}>COMPLETED ✓</Text>
                      </View>
                    ) : isTappedPast && !isTappedDone ? (
                      <View style={{ backgroundColor: isDark ? 'rgba(239, 68, 68, 0.25)' : '#FEE2E2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 }}>
                        <Text style={{ fontSize: 11, fontWeight: '900', color: '#DC2626' }}>SKIPPED / MISSED</Text>
                      </View>
                    ) : isTappedToday ? (
                      <View style={{ backgroundColor: 'rgba(217, 119, 6, 0.14)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 }}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: '#D97706' }}>TODAY'S TASK</Text>
                      </View>
                    ) : null}

                    {/* Close ✕ Button */}
                    <TouchableOpacity
                      onPress={() => {
                        triggerLightHaptic();
                        setTappedCalendarDay(null);
                      }}
                      style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: palette.inputBg, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={16} color={palette.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 4 Scripture Portions for Tapped Date */}
                <Text style={{ fontSize: 12, fontWeight: '800', color: palette.textSecondary, textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>
                  Scripture Portions to Read:
                </Text>

                <View style={{ gap: 8 }}>
                  {/* Portion 1: Old Testament */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: palette.inputBg, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 }}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={{ fontSize: 10.5, fontWeight: '700', color: palette.accentGold, textTransform: 'uppercase' }}>1. Old Testament</Text>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: palette.textPrimary, marginTop: 1 }}>{tappedReading.oldTestament.displayText}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleOpenScriptureInBible(tappedReading.oldTestament)}
                      style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.cardBorder, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '800', color: palette.accentGold }}>Read</Text>
                      <ArrowRight size={12} color={palette.accentGold} />
                    </TouchableOpacity>
                  </View>

                  {/* Portion 2: New Testament */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: palette.inputBg, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 }}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={{ fontSize: 10.5, fontWeight: '700', color: palette.accentGreen, textTransform: 'uppercase' }}>2. New Testament</Text>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: palette.textPrimary, marginTop: 1 }}>{tappedReading.newTestament.displayText}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleOpenScriptureInBible(tappedReading.newTestament)}
                      style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.cardBorder, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '800', color: palette.accentGreen }}>Read</Text>
                      <ArrowRight size={12} color={palette.accentGreen} />
                    </TouchableOpacity>
                  </View>

                  {/* Portion 3: Psalms */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: palette.inputBg, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 }}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#3498DB', textTransform: 'uppercase' }}>3. Psalms</Text>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: palette.textPrimary, marginTop: 1 }}>{tappedReading.psalm.displayText}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleOpenScriptureInBible(tappedReading.psalm)}
                      style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.cardBorder, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#3498DB' }}>Read</Text>
                      <ArrowRight size={12} color="#3498DB" />
                    </TouchableOpacity>
                  </View>

                  {/* Portion 4: Proverbs */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: palette.inputBg, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 }}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#9B59B6', textTransform: 'uppercase' }}>4. Proverbs</Text>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: palette.textPrimary, marginTop: 1 }}>{tappedReading.proverb.displayText}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleOpenScriptureInBible(tappedReading.proverb)}
                      style={{ backgroundColor: palette.card, borderWidth: 1, borderColor: palette.cardBorder, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#9B59B6' }}>Read</Text>
                      <ArrowRight size={12} color="#9B59B6" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* ACTION BUTTON BASED ON DATE STATUS */}
                {isTappedToday ? (
                  // CASE 1: TODAY'S DATE -> Button to mark done and turn GREEN!
                  <TouchableOpacity
                    onPress={() => handleToggleComplete(tappedCalendarDay)}
                    activeOpacity={0.85}
                    style={{
                      marginTop: 14,
                      backgroundColor: isTappedDone ? palette.accentGreenLight : '#10B981',
                      borderWidth: 1.5,
                      borderColor: '#10B981',
                      borderRadius: 14,
                      paddingVertical: 13,
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <CheckCircle2 size={18} color={isTappedDone ? '#10B981' : '#FFFFFF'} />
                    <Text style={{ fontSize: 15, fontWeight: '900', color: isTappedDone ? '#10B981' : '#FFFFFF' }}>
                      {isTappedDone ? 'Today Done ✓ (Tap to unmark)' : 'Mark Today Done ✓'}
                    </Text>
                  </TouchableOpacity>
                ) : isTappedPast && !isTappedDone ? (
                  // CASE 2: PAST SKIPPED DAY -> STRICTLY FORBIDDEN TO TURN GREEN!
                  <View style={{ marginTop: 14, gap: 8 }}>
                    <View style={{ backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2', borderWidth: 1, borderColor: '#DC2626', borderRadius: 12, padding: 10, gap: 3 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <AlertCircle size={15} color="#DC2626" />
                        <Text style={{ fontSize: 12, fontWeight: '800', color: '#DC2626' }}>Skipped Day Locked</Text>
                      </View>
                      <Text style={{ fontSize: 11, color: palette.textSecondary, lineHeight: 15 }}>
                        You missed this day. You can still read the scriptures above to catch up on God's Word, but this day cannot be turned green to keep your faith streak honest.
                      </Text>
                    </View>

                    <View style={{ backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#FEE2E2', borderWidth: 1.5, borderColor: '#DC2626', paddingVertical: 12, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                      <Lock size={15} color="#DC2626" />
                      <Text style={{ fontSize: 13, fontWeight: '900', color: '#DC2626' }}>
                        Missed Day • Cannot Turn Green
                      </Text>
                    </View>
                  </View>
                ) : isTappedDone ? (
                  // CASE 3: PAST DAY THAT WAS COMPLETED ON TIME
                  <View style={{ marginTop: 14, backgroundColor: palette.accentGreenLight, borderWidth: 1.5, borderColor: '#10B981', paddingVertical: 12, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                    <CheckCircle2 size={16} color="#10B981" />
                    <Text style={{ fontSize: 13, fontWeight: '800', color: '#10B981' }}>
                      Completed on Day {tappedCalendarDay} ✓
                    </Text>
                  </View>
                ) : (
                  // CASE 4: FUTURE UPCOMING DAY
                  <View style={{ marginTop: 14, backgroundColor: palette.inputBg, borderWidth: 1, borderColor: palette.border, paddingVertical: 12, borderRadius: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
                    <Lock size={14} color={palette.textSecondary} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: palette.textSecondary }}>
                      Upcoming Day • Unlocks on {tappedDetails.monthName} {tappedDetails.dayOfMonth}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Prompt when no date is tapped yet */}
            {tappedCalendarDay === null && (
              <View style={{ marginHorizontal: 20, marginTop: 16, padding: 14, borderRadius: 14, backgroundColor: palette.card, borderWidth: 1, borderColor: palette.cardBorder, alignItems: 'center' }}>
                <Text style={{ fontSize: 12.5, fontWeight: '700', color: palette.textSecondary }}>
                  👆 Tap any date above to expose its reading portions
                </Text>
              </View>
            )}
          </ScrollView>
        );
      })()}

      {/* 3. STREAK & MILESTONE REWARD CELEBRATION MODAL */}
      <Modal
        visible={isRewardModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsRewardModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsRewardModalOpen(false)}
        >
          <View style={[styles.rewardModalCard, { backgroundColor: palette.card, borderColor: palette.accentGold }]}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(217, 119, 6, 0.16)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Flame size={36} color="#D97706" />
            </View>

            <Text style={{ fontSize: 12, fontWeight: '800', color: palette.accentGold, textTransform: 'uppercase', letterSpacing: 1 }}>
              STREAK REWARD UNLOCKED 🎉
            </Text>

            <Text style={{ fontSize: 24, fontWeight: '900', color: palette.textPrimary, textAlign: 'center', marginTop: 4 }}>
              🔥 {rewardDetails.streakCount}-Day Faith Streak!
            </Text>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <View style={{ backgroundColor: 'rgba(5, 150, 105, 0.14)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} color={palette.accentGreen} />
                <Text style={{ fontSize: 14, fontWeight: '800', color: palette.accentGreen }}>
                  +{rewardDetails.pointsEarned} Grace Points
                </Text>
              </View>
            </View>

            {rewardDetails.milestoneTitle ? (
              <View style={{ width: '100%', backgroundColor: 'rgba(217, 119, 6, 0.12)', borderWidth: 1.5, borderColor: palette.accentGold, borderRadius: 16, padding: 14, marginTop: 16, alignItems: 'center' }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: palette.accentGold, textTransform: 'uppercase', letterSpacing: 1 }}>
                  🏆 NEW MILESTONE UNLOCKED!
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '900', color: palette.textPrimary, marginTop: 3 }}>
                  {rewardDetails.milestoneTitle}
                </Text>
              </View>
            ) : null}

            <Text style={{ fontSize: 13, fontStyle: 'italic', color: palette.textSecondary, textAlign: 'center', marginTop: 18, lineHeight: 19 }}>
              "Well done, good and faithful servant... enter into the joy of your Lord." — Matthew 25:21
            </Text>

            <TouchableOpacity
              onPress={() => {
                triggerLightHaptic();
                setIsRewardModalOpen(false);
              }}
              style={{
                width: '100%',
                backgroundColor: palette.accentGold,
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: 'center',
                marginTop: 20,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#FFFFFF' }}>Amen! Keep Walking in Faith →</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  segmentPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
    gap: 6,
  },
  segmentText: {
    fontSize: 12.5,
  },
  portionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  rowReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  rewardModalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
});
