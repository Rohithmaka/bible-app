import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
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
  Award,
  Table,
  BarChart3,
  Clock,
  Heart,
  Moon,
  Search,
  Plus,
  Minus,
  CheckSquare,
  Square,
  TrendingUp,
  Activity,
  Cross,
  Flame,
  ShieldCheck,
  Sun,
  Feather,
  Check,
  AlertCircle,
} from 'lucide-react-native';

type ViewMode = 'daily' | 'spreadsheet' | 'analytics';
type QuarterFilter = 'all' | 'q1' | 'q2' | 'q3' | 'q4';

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
  const monthName = date.toLocaleString('en-US', { month: 'long' });
  const dayOfMonth = date.getDate();
  const weekdayName = date.toLocaleString('en-US', { weekday: 'long' });
  return { monthName, dayOfMonth, weekdayName, year };
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
  const initialMode: ViewMode = params.mode === 'spreadsheet' ? 'spreadsheet' : params.mode === 'analytics' ? 'analytics' : 'daily';
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);
  const [spreadsheetSearch, setSpreadsheetSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'completed' | 'pending'>('all');
  const initialQuarter: QuarterFilter = currentYearDay <= 90 ? 'q1' : currentYearDay <= 180 ? 'q2' : currentYearDay <= 270 ? 'q3' : 'q4';
  const [quarterFilter, setQuarterFilter] = useState<QuarterFilter>(initialQuarter);

  // Calendar Format States
  const now = new Date();
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth());
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());
  const [calendarSubMode, setCalendarSubMode] = useState<'calendar' | 'table'>('calendar');

  const handlePrevMonth = () => {
    triggerLightHaptic();
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((prev) => prev - 1);
    } else {
      setCalendarMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    triggerLightHaptic();
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

  // Devotional verse based on day
  const dailyDevotional = DEVOTIONAL_VERSES[selectedDay % DEVOTIONAL_VERSES.length];

  // STREAK CALCULATION
  const currentStreak = calculateFaithStreak(completedDaysArray);

  // Helper for daily time logs
  const getDayLog = (dayNum: number) => {
    const key = `${planId}:${dayNum}`;
    return dailyTimeLogs[key] || { readingMinutes: 15, prayerMinutes: 10, quietMinutes: 10 };
  };

  const handleToggleComplete = (dayNum: number = selectedDay) => {
    triggerSuccessHaptic();
    const isCurrentlyDone = completedDaysArray.includes(dayNum);
    togglePlanDay(planId, dayNum);

    if (!isCurrentlyDone) {
      // Calculate updated streak & rewards
      const updatedDays = [...completedDaysArray, dayNum];
      const newStreak = calculateFaithStreak(updatedDays);
      let pts = 100; // Base 100 points
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

  // Calculate totals for Analytics
  let totalReadingMins = 0;
  let totalPrayerMins = 0;
  let totalQuietMins = 0;

  for (let i = 1; i <= 365; i++) {
    const log = getDayLog(i);
    const isDone = completedDaysArray.includes(i);
    if (isDone || log.readingMinutes !== 15 || log.prayerMinutes !== 10 || log.quietMinutes !== 10) {
      totalReadingMins += log.readingMinutes;
      totalPrayerMins += log.prayerMinutes;
      totalQuietMins += log.quietMinutes;
    }
  }

  const grandTotalMins = totalReadingMins + totalPrayerMins + totalQuietMins;
  const grandTotalHours = (grandTotalMins / 60).toFixed(1);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }} edges={['top', 'left', 'right']}>
      <Stack.Screen
        options={{
          title: '365-Day Walk with Christ',
          headerStyle: { backgroundColor: palette.card },
          headerTintColor: palette.textPrimary,
          headerTitleStyle: { fontWeight: '800', fontSize: 18 },
        }}
      />

      {/* SACRED MOTIVATIONAL DEVOTIONAL HEADER BANNER */}
      <View style={{ backgroundColor: isDark ? '#171412' : '#FFF9F0', borderBottomWidth: 1, borderBottomColor: palette.border, paddingHorizontal: 18, paddingTop: 14, paddingBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          {/* Flame Streak Badge */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(217, 119, 6, 0.16)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(217, 119, 6, 0.3)' }}>
            <Flame size={15} color="#D97706" />
            <Text style={{ fontSize: 12, fontWeight: '800', color: '#D97706' }}>
              🔥 {currentStreak}-Day Streak ({totalCompletedCount} Days)
            </Text>
          </View>

          {/* Grace Points Badge */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: palette.accentGreenLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14 }}>
            <Sparkles size={14} color={palette.accentGreen} />
            <Text style={{ fontSize: 12, fontWeight: '800', color: palette.accentGreen }}>
              {rewardPoints} Grace Pts
            </Text>
          </View>
        </View>

        <Text style={{ fontSize: 13, fontStyle: 'italic', color: palette.textPrimary, marginTop: 6, lineHeight: 18 }}>
          "{dailyDevotional.verse}"
        </Text>
        <Text style={{ fontSize: 11, fontWeight: '700', color: palette.accentGold, marginTop: 2, textAlign: 'right' }}>
          — {dailyDevotional.reference}
        </Text>
      </View>

      {/* VIEW SEGMENT SWITCHER */}
      <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8, backgroundColor: palette.card, borderBottomWidth: 1, borderBottomColor: palette.border }}>
        <View style={{ flexDirection: 'row', backgroundColor: palette.inputBg, borderRadius: 12, padding: 4 }}>
          <TouchableOpacity
            onPress={() => {
              triggerLightHaptic();
              setViewMode('daily');
            }}
            style={[
              styles.segmentBtn,
              viewMode === 'daily' && { backgroundColor: palette.card, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15 },
            ]}
          >
            <Sun size={15} color={viewMode === 'daily' ? palette.accentGold : palette.textSecondary} />
            <Text style={[styles.segmentText, { color: viewMode === 'daily' ? palette.textPrimary : palette.textSecondary, fontWeight: viewMode === 'daily' ? '800' : '600' }]}>
              Daily Walk
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              triggerLightHaptic();
              setViewMode('spreadsheet');
            }}
            style={[
              styles.segmentBtn,
              viewMode === 'spreadsheet' && { backgroundColor: palette.card, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15 },
            ]}
          >
            <Calendar size={15} color={viewMode === 'spreadsheet' ? palette.accentGreen : palette.textSecondary} />
            <Text style={[styles.segmentText, { color: viewMode === 'spreadsheet' ? palette.textPrimary : palette.textSecondary, fontWeight: viewMode === 'spreadsheet' ? '800' : '600' }]}>
              Calendar Grid
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              triggerLightHaptic();
              setViewMode('analytics');
            }}
            style={[
              styles.segmentBtn,
              viewMode === 'analytics' && { backgroundColor: palette.card, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.15 },
            ]}
          >
            <BarChart3 size={15} color={viewMode === 'analytics' ? '#4F46E5' : palette.textSecondary} />
            <Text style={[styles.segmentText, { color: viewMode === 'analytics' ? palette.textPrimary : palette.textSecondary, fontWeight: viewMode === 'analytics' ? '800' : '600' }]}>
              Growth Insights
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* VIEW MODE 1: DAILY DEVOTIONAL WALK */}
      {viewMode === 'daily' && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 18, gap: 16, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Faith Progress Banner */}
          <View style={[styles.progressCard, { backgroundColor: palette.card, borderColor: palette.accentGold, borderWidth: 1.5 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.badgeIcon, { backgroundColor: 'rgba(217, 119, 6, 0.15)' }]}>
                  <Cross size={22} color={palette.accentGold} />
                </View>
                <View>
                  <Text style={[styles.progressTitle, { color: palette.textPrimary }]}>365-Day Walk in the Word</Text>
                  <Text style={{ fontSize: 13, color: palette.textSecondary, marginTop: 1 }}>
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
                  { width: `${Math.max(3, progressPercent)}%`, backgroundColor: palette.accentGold },
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
              <Text style={{ fontSize: 11, fontWeight: '800', color: palette.accentGold, textTransform: 'uppercase', letterSpacing: 1 }}>
                {selectedDay === currentYearDay ? '• TODAY’S DEVOTIONAL' : `DAY ${selectedDay} OF 365`}
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '900', color: palette.textPrimary, marginTop: 2 }}>
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

          {/* Quick Jump to Today */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
            <TouchableOpacity
              onPress={() => {
                triggerLightHaptic();
                setSelectedDay(currentYearDay);
              }}
              style={[styles.jumpChip, { backgroundColor: 'rgba(217, 119, 6, 0.15)', borderColor: palette.accentGold, borderWidth: 1 }]}
            >
              <Calendar size={13} color={palette.accentGold} />
              <Text style={{ fontSize: 12, fontWeight: '800', color: palette.accentGold }}>
                Jump to Today's Walk (Day {currentYearDay})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Dedicated Spiritual Time Tracking */}
          <View style={{ backgroundColor: palette.card, borderRadius: 18, borderWidth: 1, borderColor: palette.cardBorder, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Clock size={16} color={palette.accentGold} />
              <Text style={{ fontSize: 14, fontWeight: '800', color: palette.textPrimary }}>
                Dedicated Time with God — Day {selectedDay}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
              {/* Reading Time */}
              <View style={{ flex: 1, backgroundColor: palette.inputBg, padding: 10, borderRadius: 12, alignItems: 'center' }}>
                <BookOpen size={16} color={palette.accentGreen} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.textSecondary, marginTop: 4 }}>Word Study</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <TouchableOpacity onPress={() => adjustTime(selectedDay, 'readingMinutes', -5)}>
                    <Minus size={14} color={palette.textSecondary} />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: palette.accentGreen }}>
                    {getDayLog(selectedDay).readingMinutes}m
                  </Text>
                  <TouchableOpacity onPress={() => adjustTime(selectedDay, 'readingMinutes', 5)}>
                    <Plus size={14} color={palette.accentGreen} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Prayer Time */}
              <View style={{ flex: 1, backgroundColor: palette.inputBg, padding: 10, borderRadius: 12, alignItems: 'center' }}>
                <Heart size={16} color="#E11D48" />
                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.textSecondary, marginTop: 4 }}>Prayer Time</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <TouchableOpacity onPress={() => adjustTime(selectedDay, 'prayerMinutes', -5)}>
                    <Minus size={14} color={palette.textSecondary} />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#E11D48' }}>
                    {getDayLog(selectedDay).prayerMinutes}m
                  </Text>
                  <TouchableOpacity onPress={() => adjustTime(selectedDay, 'prayerMinutes', 5)}>
                    <Plus size={14} color="#E11D48" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Quiet Time */}
              <View style={{ flex: 1, backgroundColor: palette.inputBg, padding: 10, borderRadius: 12, alignItems: 'center' }}>
                <Moon size={16} color="#7C3AED" />
                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.textSecondary, marginTop: 4 }}>Quiet Reflection</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
                  <TouchableOpacity onPress={() => adjustTime(selectedDay, 'quietMinutes', -5)}>
                    <Minus size={14} color={palette.textSecondary} />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: '#7C3AED' }}>
                    {getDayLog(selectedDay).quietMinutes}m
                  </Text>
                  <TouchableOpacity onPress={() => adjustTime(selectedDay, 'quietMinutes', 5)}>
                    <Plus size={14} color="#7C3AED" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Scripture Readings Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
            <Text style={{ fontSize: 17, fontWeight: '900', color: palette.textPrimary }}>
              Ordered Scripture Journey (1 → 4)
            </Text>
            <TouchableOpacity onPress={() => handleToggleComplete(selectedDay)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: isDayCompleted ? palette.accentGreenLight : palette.inputBg, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 }}>
              <CheckCircle2 size={18} color={isDayCompleted ? palette.accentGreen : palette.textMuted} />
              <Text style={{ fontSize: 12, fontWeight: '800', color: isDayCompleted ? palette.accentGreen : palette.textSecondary }}>
                {isDayCompleted ? 'Day Completed ✓' : 'Mark Complete'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Portion 1: Old Testament */}
          <View style={[styles.portionCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ backgroundColor: 'rgba(217, 119, 6, 0.14)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: palette.accentGold }}>1. OLD TESTAMENT — Prophecy & Promise</Text>
              </View>
              <BookOpen size={16} color={palette.accentGold} />
            </View>

            <Text style={{ fontSize: 19, fontWeight: '800', color: palette.textPrimary, marginTop: 8 }}>
              {reading.oldTestament.displayText}
            </Text>

            <TouchableOpacity
              onPress={() => handleOpenScriptureInBible(reading.oldTestament)}
              style={[styles.readBtn, { backgroundColor: palette.accentGold }]}
            >
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>Read Portion 1 →</Text>
            </TouchableOpacity>
          </View>

          {/* Portion 2: New Testament */}
          <View style={[styles.portionCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ backgroundColor: palette.accentGreenLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: palette.accentGreen }}>2. NEW TESTAMENT — Life & Grace of Jesus</Text>
              </View>
              <Sparkles size={16} color={palette.accentGreen} />
            </View>

            <Text style={{ fontSize: 19, fontWeight: '800', color: palette.textPrimary, marginTop: 8 }}>
              {reading.newTestament.displayText}
            </Text>

            <TouchableOpacity
              onPress={() => handleOpenScriptureInBible(reading.newTestament)}
              style={[styles.readBtn, { backgroundColor: palette.accentGreen }]}
            >
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>Read Portion 2 →</Text>
            </TouchableOpacity>
          </View>

          {/* Portion 3: Psalms */}
          <View style={[styles.portionCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ backgroundColor: 'rgba(52, 152, 219, 0.14)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#3498DB' }}>3. PSALMS — Worship & Refuge</Text>
              </View>
              <Feather size={16} color="#3498DB" />
            </View>

            <Text style={{ fontSize: 19, fontWeight: '800', color: palette.textPrimary, marginTop: 8 }}>
              {reading.psalm.displayText}
            </Text>

            <TouchableOpacity
              onPress={() => handleOpenScriptureInBible(reading.psalm)}
              style={[styles.readBtn, { backgroundColor: '#3498DB' }]}
            >
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>Read Portion 3 →</Text>
            </TouchableOpacity>
          </View>

          {/* Portion 4: Proverbs */}
          <View style={[styles.portionCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ backgroundColor: 'rgba(155, 89, 182, 0.14)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#9B59B6' }}>4. PROVERBS — Heavenly Wisdom</Text>
              </View>
              <Sparkles size={16} color="#9B59B6" />
            </View>

            <Text style={{ fontSize: 19, fontWeight: '800', color: palette.textPrimary, marginTop: 8 }}>
              {reading.proverb.displayText}
            </Text>

            <TouchableOpacity
              onPress={() => handleOpenScriptureInBible(reading.proverb)}
              style={[styles.readBtn, { backgroundColor: '#9B59B6' }]}
            >
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#FFFFFF' }}>Read Portion 4 →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* VIEW MODE 2: SACRED CALENDAR & SPREADSHEET VIEW */}
      {viewMode === 'spreadsheet' && (
        <View style={{ flex: 1 }}>
          {/* Format Toggle Bar: Calendar vs Table */}
          <View style={{ flexDirection: 'row', backgroundColor: palette.card, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: palette.border, justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', backgroundColor: palette.inputBg, borderRadius: 10, padding: 3, flex: 1, marginRight: 10 }}>
              <TouchableOpacity
                onPress={() => {
                  triggerLightHaptic();
                  setCalendarSubMode('calendar');
                }}
                style={{
                  flex: 1,
                  paddingVertical: 7,
                  borderRadius: 8,
                  alignItems: 'center',
                  backgroundColor: calendarSubMode === 'calendar' ? palette.card : 'transparent',
                  elevation: calendarSubMode === 'calendar' ? 2 : 0,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: calendarSubMode === 'calendar' ? palette.accentGreen : palette.textSecondary }}>
                  📅 Calendar Format
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  triggerLightHaptic();
                  setCalendarSubMode('table');
                }}
                style={{
                  flex: 1,
                  paddingVertical: 7,
                  borderRadius: 8,
                  alignItems: 'center',
                  backgroundColor: calendarSubMode === 'table' ? palette.card : 'transparent',
                  elevation: calendarSubMode === 'table' ? 2 : 0,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '800', color: calendarSubMode === 'table' ? palette.accentGold : palette.textSecondary }}>
                  📋 Spreadsheet Table
                </Text>
              </TouchableOpacity>
            </View>

            {calendarSubMode === 'calendar' && (
              <TouchableOpacity
                onPress={handleJumpToToday}
                style={{ backgroundColor: 'rgba(217, 119, 6, 0.15)', borderWidth: 1, borderColor: palette.accentGold, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}
              >
                <Text style={{ fontSize: 11, fontWeight: '800', color: palette.accentGold }}>Today</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* CALENDAR FORMAT VIEW */}
          {calendarSubMode === 'calendar' && (() => {
            const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
            const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();
            const monthCompletedCount = Array.from({ length: daysInMonth }, (_, i) => i + 1).filter((d) => {
              const pDay = getPlanDayForMonthDate(calendarYear, calendarMonth, d);
              return completedDaysArray.includes(pDay);
            }).length;
            const isTodayDone = completedDaysArray.includes(currentYearDay);
            const selectedReading = getReadingForDay(selectedDay);
            const isSelectedDayCompleted = completedDaysArray.includes(selectedDay);
            const isSelectedDayToday = selectedDay === currentYearDay;
            const isSelectedDayPast = selectedDay < currentYearDay;
            const selectedDateDetails = getDateDetailsForDay(selectedDay, calendarYear);

            return (
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Month Navigator Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: palette.card }}>
                  <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
                    <ChevronLeft size={22} color={palette.textPrimary} />
                  </TouchableOpacity>

                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: palette.textPrimary }}>
                      {MONTH_NAMES[calendarMonth]} {calendarYear}
                    </Text>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: palette.accentGold, marginTop: 1 }}>
                      {monthCompletedCount} of {daysInMonth} Days Marked Done ({Math.round((monthCompletedCount / daysInMonth) * 100)}%)
                    </Text>
                  </View>

                  <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
                    <ChevronRight size={22} color={palette.textPrimary} />
                  </TouchableOpacity>
                </View>

                {/* 12-Month Quick Pill Selector Carousel */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ backgroundColor: palette.card, borderBottomWidth: 1, borderBottomColor: palette.border, paddingHorizontal: 12, paddingBottom: 10 }}>
                  {MONTH_SHORT_NAMES.map((name, idx) => {
                    const isCur = calendarMonth === idx;
                    return (
                      <TouchableOpacity
                        key={name}
                        onPress={() => {
                          triggerLightHaptic();
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

                {/* TODAY WORK STATUS BANNER */}
                <View style={{ marginHorizontal: 16, marginTop: 12, marginBottom: 8, padding: 12, borderRadius: 14, backgroundColor: isTodayDone ? (isDark ? 'rgba(16, 185, 129, 0.16)' : '#E6F4EA') : (isDark ? 'rgba(217, 119, 6, 0.14)' : '#FEF3C7'), borderWidth: 1, borderColor: isTodayDone ? palette.accentGreen : '#D97706', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, paddingRight: 8 }}>
                    {isTodayDone ? (
                      <CheckCircle2 size={22} color={palette.accentGreen} />
                    ) : (
                      <AlertCircle size={22} color="#D97706" />
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: isTodayDone ? palette.accentGreen : '#D97706' }}>
                        {isTodayDone ? "Today's Work: Marked Completed ✓" : "Today's Work: Empty / Not Done ⏳"}
                      </Text>
                      <Text style={{ fontSize: 11, color: palette.textSecondary, marginTop: 1 }}>
                        {isTodayDone ? "Great faith walk! Today's reading & devotion recorded." : "Today's reading is pending. Read & check off below to mark done!"}
                      </Text>
                    </View>
                  </View>

                  {!isTodayDone && (
                    <TouchableOpacity
                      onPress={() => handleToggleComplete(currentYearDay)}
                      style={{ backgroundColor: '#D97706', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#FFFFFF' }}>Mark Done</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Calendar Legend Bar */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, paddingVertical: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: palette.accentGreen }} />
                    <Text style={{ fontSize: 10, fontWeight: '700', color: palette.textSecondary }}>Done ✓</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#D97706' }} />
                    <Text style={{ fontSize: 10, fontWeight: '700', color: palette.textSecondary }}>Today (Empty)</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#E11D48' }} />
                    <Text style={{ fontSize: 10, fontWeight: '700', color: palette.textSecondary }}>Past (Not Done)</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: palette.inputBg, borderWidth: 1, borderColor: palette.border }} />
                    <Text style={{ fontSize: 10, fontWeight: '700', color: palette.textSecondary }}>Upcoming</Text>
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

                {/* 7-Column Calendar Grid Cells */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, paddingVertical: 8, backgroundColor: palette.card }}>
                  {/* Leading empty cells */}
                  {Array.from({ length: firstDayIndex }).map((_, idx) => (
                    <View key={`empty-${idx}`} style={{ width: '14.28%', height: 60, padding: 2.5 }} />
                  ))}

                  {/* Day cells for this month */}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const dNum = idx + 1;
                    const planDay = getPlanDayForMonthDate(calendarYear, calendarMonth, dNum);
                    const isDone = completedDaysArray.includes(planDay);
                    const isToday = planDay === currentYearDay && calendarYear === now.getFullYear();
                    const isPast = planDay < currentYearDay;
                    const isSelected = selectedDay === planDay;

                    return (
                      <View key={`day-${dNum}`} style={{ width: '14.28%', padding: 2 }}>
                        <TouchableOpacity
                          onPress={() => {
                            triggerLightHaptic();
                            setSelectedDay(planDay);
                          }}
                          activeOpacity={0.8}
                          style={{
                            height: 60,
                            borderRadius: 10,
                            padding: 3,
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderWidth: isSelected ? 2 : isToday ? 1.8 : 1,
                            borderColor: isSelected
                              ? palette.accentGold
                              : isToday
                              ? (isDone ? palette.accentGreen : '#D97706')
                              : isDone
                              ? 'rgba(16, 185, 129, 0.4)'
                              : isPast
                              ? (isDark ? 'rgba(239, 68, 68, 0.25)' : '#FECDD3')
                              : palette.border,
                            backgroundColor: isDone
                              ? (isDark ? 'rgba(16, 185, 129, 0.2)' : '#E6F4EA')
                              : isToday
                              ? (isDark ? 'rgba(217, 119, 6, 0.16)' : '#FEF3C7')
                              : isPast
                              ? (isDark ? 'rgba(239, 68, 68, 0.08)' : '#FFF1F2')
                              : palette.inputBg,
                          }}
                        >
                          {/* Date Number & Today Indicator Dot */}
                          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2 }}>
                            <Text style={{
                              fontSize: 12,
                              fontWeight: isToday || isSelected ? '900' : '700',
                              color: isSelected ? palette.accentGold : isToday ? '#D97706' : palette.textPrimary,
                            }}>
                              {dNum}
                            </Text>
                            {isToday && (
                              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isDone ? palette.accentGreen : '#D97706' }} />
                            )}
                          </View>

                          {/* Status Marking Badge */}
                          {isDone ? (
                            <View style={{ backgroundColor: palette.accentGreen, borderRadius: 10, paddingHorizontal: 4, paddingVertical: 1, flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                              <Check size={8} color="#FFFFFF" />
                              <Text style={{ fontSize: 7.5, fontWeight: '900', color: '#FFFFFF' }}>DONE</Text>
                            </View>
                          ) : isToday ? (
                            <View style={{ backgroundColor: '#D97706', borderRadius: 6, paddingHorizontal: 3, paddingVertical: 1 }}>
                              <Text style={{ fontSize: 7, fontWeight: '900', color: '#FFFFFF' }}>EMPTY</Text>
                            </View>
                          ) : isPast ? (
                            <View style={{ backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FFE4E6', borderRadius: 6, paddingHorizontal: 3, paddingVertical: 1 }}>
                              <Text style={{ fontSize: 6.5, fontWeight: '800', color: '#E11D48' }}>NOT DONE</Text>
                            </View>
                          ) : (
                            <Text style={{ fontSize: 7.5, fontWeight: '600', color: palette.textMuted }}>
                              D{planDay}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>

                {/* SELECTED DAY INSPECTION & ONE-TAP ACTION CARD */}
                <View style={{ paddingHorizontal: 16, paddingTop: 14 }}>
                  <View style={{ backgroundColor: palette.card, borderRadius: 18, borderWidth: 1.5, borderColor: isSelectedDayCompleted ? palette.accentGreen : isSelectedDayToday ? palette.accentGold : palette.cardBorder, padding: 18 }}>
                    {/* Header with Date & Status Banner */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: palette.accentGold, textTransform: 'uppercase', letterSpacing: 1 }}>
                          {selectedDateDetails.weekdayName.toUpperCase()} • DAY {selectedDay} OF 365
                        </Text>
                        <Text style={{ fontSize: 19, fontWeight: '900', color: palette.textPrimary, marginTop: 2 }}>
                          {selectedDateDetails.monthName} {selectedDateDetails.dayOfMonth}, {selectedDateDetails.year}
                        </Text>
                      </View>

                      {/* Status Banner */}
                      {isSelectedDayCompleted ? (
                        <View style={{ backgroundColor: palette.accentGreenLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                          <CheckCircle2 size={16} color={palette.accentGreen} />
                          <Text style={{ fontSize: 11, fontWeight: '800', color: palette.accentGreen }}>COMPLETED ✓</Text>
                        </View>
                      ) : isSelectedDayToday ? (
                        <View style={{ backgroundColor: 'rgba(217, 119, 6, 0.16)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: '#D97706' }}>
                          <AlertCircle size={15} color="#D97706" />
                          <Text style={{ fontSize: 11, fontWeight: '800', color: '#D97706' }}>TODAY • NOT DONE</Text>
                        </View>
                      ) : isSelectedDayPast ? (
                        <View style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: '#E11D48' }}>
                          <AlertCircle size={15} color="#E11D48" />
                          <Text style={{ fontSize: 11, fontWeight: '800', color: '#E11D48' }}>EMPTY • NOT DONE</Text>
                        </View>
                      ) : (
                        <View style={{ backgroundColor: palette.inputBg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: palette.textSecondary }}>UPCOMING</Text>
                        </View>
                      )}
                    </View>

                    {/* BIG PRIMARY COMPLETION TOGGLE BUTTON */}
                    <TouchableOpacity
                      onPress={() => handleToggleComplete(selectedDay)}
                      activeOpacity={0.85}
                      style={{
                        backgroundColor: isSelectedDayCompleted ? (isDark ? '#1C1917' : '#F3EFE6') : palette.accentGreen,
                        borderRadius: 14,
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        borderWidth: isSelectedDayCompleted ? 1.5 : 0,
                        borderColor: isSelectedDayCompleted ? palette.accentGreen : 'transparent',
                        marginBottom: 16,
                        elevation: isSelectedDayCompleted ? 0 : 3,
                      }}
                    >
                      <CheckCircle2 size={20} color={isSelectedDayCompleted ? palette.accentGreen : '#FFFFFF'} />
                      <Text style={{ fontSize: 15, fontWeight: '800', color: isSelectedDayCompleted ? palette.accentGreen : '#FFFFFF' }}>
                        {isSelectedDayCompleted ? 'Completed ✓ (Tap to unmark)' : isSelectedDayToday ? '✓ Mark Today\'s Work Completed (+100 Pts)' : `✓ Mark Day ${selectedDay} Work Completed (+100 Pts)`}
                      </Text>
                    </TouchableOpacity>

                    {/* 4 Ordered Scripture Portions */}
                    <Text style={{ fontSize: 12, fontWeight: '800', color: palette.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                      Scripture Journey for Day {selectedDay} (1 → 4)
                    </Text>

                    <View style={{ gap: 8, marginBottom: 16 }}>
                      {/* 1. Old Testament */}
                      <TouchableOpacity
                        onPress={() => handleOpenScriptureInBible(selectedReading.oldTestament)}
                        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: palette.inputBg, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: palette.border }}
                      >
                        <View style={{ flex: 1, paddingRight: 8 }}>
                          <Text style={{ fontSize: 10, fontWeight: '800', color: palette.accentGold, textTransform: 'uppercase' }}>1. Old Testament</Text>
                          <Text style={{ fontSize: 14, fontWeight: '700', color: palette.textPrimary, marginTop: 2 }}>{selectedReading.oldTestament.displayText}</Text>
                        </View>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: palette.accentGold }}>Read →</Text>
                      </TouchableOpacity>

                      {/* 2. New Testament */}
                      <TouchableOpacity
                        onPress={() => handleOpenScriptureInBible(selectedReading.newTestament)}
                        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: palette.inputBg, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: palette.border }}
                      >
                        <View style={{ flex: 1, paddingRight: 8 }}>
                          <Text style={{ fontSize: 10, fontWeight: '800', color: palette.accentGreen, textTransform: 'uppercase' }}>2. New Testament</Text>
                          <Text style={{ fontSize: 14, fontWeight: '700', color: palette.textPrimary, marginTop: 2 }}>{selectedReading.newTestament.displayText}</Text>
                        </View>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: palette.accentGreen }}>Read →</Text>
                      </TouchableOpacity>

                      {/* 3. Psalms */}
                      <TouchableOpacity
                        onPress={() => handleOpenScriptureInBible(selectedReading.psalm)}
                        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: palette.inputBg, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: palette.border }}
                      >
                        <View style={{ flex: 1, paddingRight: 8 }}>
                          <Text style={{ fontSize: 10, fontWeight: '800', color: '#3498DB', textTransform: 'uppercase' }}>3. Psalms</Text>
                          <Text style={{ fontSize: 14, fontWeight: '700', color: palette.textPrimary, marginTop: 2 }}>{selectedReading.psalm.displayText}</Text>
                        </View>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: '#3498DB' }}>Read →</Text>
                      </TouchableOpacity>

                      {/* 4. Proverbs */}
                      <TouchableOpacity
                        onPress={() => handleOpenScriptureInBible(selectedReading.proverb)}
                        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: palette.inputBg, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: palette.border }}
                      >
                        <View style={{ flex: 1, paddingRight: 8 }}>
                          <Text style={{ fontSize: 10, fontWeight: '800', color: '#9B59B6', textTransform: 'uppercase' }}>4. Proverbs</Text>
                          <Text style={{ fontSize: 14, fontWeight: '700', color: palette.textPrimary, marginTop: 2 }}>{selectedReading.proverb.displayText}</Text>
                        </View>
                        <Text style={{ fontSize: 12, fontWeight: '800', color: '#9B59B6' }}>Read →</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Dedicated Time Tracking */}
                    <Text style={{ fontSize: 12, fontWeight: '800', color: palette.textSecondary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                      Dedicated Time with God — Day {selectedDay}
                    </Text>

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {/* Reading */}
                      <View style={{ flex: 1, backgroundColor: palette.inputBg, padding: 10, borderRadius: 12, alignItems: 'center' }}>
                        <BookOpen size={15} color={palette.accentGreen} />
                        <Text style={{ fontSize: 10, fontWeight: '700', color: palette.textSecondary, marginTop: 3 }}>Word Study</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <TouchableOpacity onPress={() => adjustTime(selectedDay, 'readingMinutes', -5)}>
                            <Minus size={13} color={palette.textSecondary} />
                          </TouchableOpacity>
                          <Text style={{ fontSize: 13, fontWeight: '800', color: palette.accentGreen }}>{getDayLog(selectedDay).readingMinutes}m</Text>
                          <TouchableOpacity onPress={() => adjustTime(selectedDay, 'readingMinutes', 5)}>
                            <Plus size={13} color={palette.accentGreen} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Prayer */}
                      <View style={{ flex: 1, backgroundColor: palette.inputBg, padding: 10, borderRadius: 12, alignItems: 'center' }}>
                        <Heart size={15} color="#E11D48" />
                        <Text style={{ fontSize: 10, fontWeight: '700', color: palette.textSecondary, marginTop: 3 }}>Prayer</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <TouchableOpacity onPress={() => adjustTime(selectedDay, 'prayerMinutes', -5)}>
                            <Minus size={13} color={palette.textSecondary} />
                          </TouchableOpacity>
                          <Text style={{ fontSize: 13, fontWeight: '800', color: '#E11D48' }}>{getDayLog(selectedDay).prayerMinutes}m</Text>
                          <TouchableOpacity onPress={() => adjustTime(selectedDay, 'prayerMinutes', 5)}>
                            <Plus size={13} color="#E11D48" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Quiet Time */}
                      <View style={{ flex: 1, backgroundColor: palette.inputBg, padding: 10, borderRadius: 12, alignItems: 'center' }}>
                        <Moon size={15} color="#7C3AED" />
                        <Text style={{ fontSize: 10, fontWeight: '700', color: palette.textSecondary, marginTop: 3 }}>Reflection</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <TouchableOpacity onPress={() => adjustTime(selectedDay, 'quietMinutes', -5)}>
                            <Minus size={13} color={palette.textSecondary} />
                          </TouchableOpacity>
                          <Text style={{ fontSize: 13, fontWeight: '800', color: '#7C3AED' }}>{getDayLog(selectedDay).quietMinutes}m</Text>
                          <TouchableOpacity onPress={() => adjustTime(selectedDay, 'quietMinutes', 5)}>
                            <Plus size={13} color="#7C3AED" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </ScrollView>
            );
          })()}

          {/* TABLE FORMAT VIEW (FALLBACK / ALTERNATIVE SPREADSHEET VIEW) */}
          {calendarSubMode === 'table' && (
            <View style={{ flex: 1 }}>
              {/* Search & Filter Bar */}
              <View style={{ paddingHorizontal: 16, paddingVertical: 10, backgroundColor: palette.card, borderBottomWidth: 1, borderBottomColor: palette.border, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: palette.inputBg, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: palette.border }}>
                  <Search size={16} color={palette.textSecondary} style={{ marginRight: 6 }} />
                  <TextInput
                    style={{ flex: 1, fontSize: 13, color: palette.textPrimary }}
                    placeholder="Search day or passage (e.g. Day 263, Job)..."
                    placeholderTextColor={palette.textSecondary}
                    value={spreadsheetSearch}
                    onChangeText={setSpreadsheetSearch}
                  />
                </View>

                <View style={{ flexDirection: 'row', gap: 4 }}>
                  <TouchableOpacity
                    onPress={() => setFilterMode('all')}
                    style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: filterMode === 'all' ? palette.accentGold : palette.inputBg }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '800', color: filterMode === 'all' ? '#FFF' : palette.textSecondary }}>All</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setFilterMode('completed')}
                    style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: filterMode === 'completed' ? palette.accentGreen : palette.inputBg }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '800', color: filterMode === 'completed' ? '#FFF' : palette.textSecondary }}>Done ✓</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* QUARTER NAVIGATOR TABS */}
              <View style={{ flexDirection: 'row', backgroundColor: palette.card, paddingHorizontal: 16, paddingBottom: 10, gap: 6 }}>
                {[
                  { id: 'q1', label: 'Q1 (1–90)' },
                  { id: 'q2', label: 'Q2 (91–180)' },
                  { id: 'q3', label: 'Q3 (181–270)' },
                  { id: 'q4', label: 'Q4 (271–365)' },
                  { id: 'all', label: 'All 365' },
                ].map((q) => {
                  const isActive = quarterFilter === q.id;
                  return (
                    <TouchableOpacity
                      key={q.id}
                      onPress={() => {
                        triggerLightHaptic();
                        setQuarterFilter(q.id as QuarterFilter);
                      }}
                      style={{
                        flex: 1,
                        paddingVertical: 6,
                        borderRadius: 8,
                        backgroundColor: isActive ? palette.accentGold : palette.inputBg,
                        borderWidth: 1,
                        borderColor: isActive ? palette.accentGold : palette.border,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 10.5, fontWeight: '800', color: isActive ? '#FFFFFF' : palette.textSecondary }}>
                        {q.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

          {/* SPREADSHEET TABLE HEADER */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
            <View style={{ minWidth: 720 }}>
              {/* Header Row */}
              <View style={{ flexDirection: 'row', backgroundColor: isDark ? '#1C1917' : '#F3EFE6', paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 2, borderBottomColor: palette.accentGold, alignItems: 'center' }}>
                <Text style={[styles.cell, { width: 48, fontWeight: '900', color: palette.accentGold, textAlign: 'center' }]}>DONE</Text>
                <Text style={[styles.cell, { width: 56, fontWeight: '900', color: palette.textPrimary }]}>DAY</Text>
                <Text style={[styles.cell, { width: 260, fontWeight: '900', color: palette.textPrimary }]}>ORDERED BIBLE SCRIPTURES (1 → 4)</Text>
                <Text style={[styles.cell, { width: 90, fontWeight: '900', color: palette.accentGreen, textAlign: 'center' }]}>READ TIME</Text>
                <Text style={[styles.cell, { width: 90, fontWeight: '900', color: '#E11D48', textAlign: 'center' }]}>PRAYER</Text>
                <Text style={[styles.cell, { width: 90, fontWeight: '900', color: '#7C3AED', textAlign: 'center' }]}>QUIET TIME</Text>
                <Text style={[styles.cell, { width: 55, fontWeight: '900', color: palette.accentGold, textAlign: 'center' }]}>TOTAL</Text>
              </View>

              {/* Rows List */}
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={true}>
                {Array.from({ length: 365 }, (_, i) => i + 1)
                  .filter((dayNum) => {
                    if (!spreadsheetSearch.trim()) {
                      if (quarterFilter === 'q1' && (dayNum < 1 || dayNum > 90)) return false;
                      if (quarterFilter === 'q2' && (dayNum < 91 || dayNum > 180)) return false;
                      if (quarterFilter === 'q3' && (dayNum < 181 || dayNum > 270)) return false;
                      if (quarterFilter === 'q4' && (dayNum < 271 || dayNum > 365)) return false;
                    }
                    const isDone = completedDaysArray.includes(dayNum);
                    if (filterMode === 'completed' && !isDone) return false;
                    if (filterMode === 'pending' && isDone) return false;
                    if (!spreadsheetSearch.trim()) return true;

                    const dayReading = getReadingForDay(dayNum);
                    const q = spreadsheetSearch.toLowerCase();
                    return (
                      `day ${dayNum}`.includes(q) ||
                      dayReading.oldTestament.displayText.toLowerCase().includes(q) ||
                      dayReading.newTestament.displayText.toLowerCase().includes(q) ||
                      dayReading.psalm.displayText.toLowerCase().includes(q) ||
                      dayReading.proverb.displayText.toLowerCase().includes(q)
                    );
                  })
                  .map((dayNum) => {
                    const isDone = completedDaysArray.includes(dayNum);
                    const isToday = dayNum === currentYearDay;
                    const dayReading = getReadingForDay(dayNum);
                    const log = getDayLog(dayNum);
                    const totalMins = log.readingMinutes + log.prayerMinutes + log.quietMinutes;

                    return (
                      <View
                        key={`row-${dayNum}`}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: 10,
                          paddingHorizontal: 8,
                          borderBottomWidth: 1,
                          borderBottomColor: palette.border,
                          backgroundColor: isToday
                            ? 'rgba(217, 119, 6, 0.12)'
                            : isDone
                            ? 'rgba(5, 150, 105, 0.06)'
                            : palette.card,
                        }}
                      >
                        {/* LEFT SIDE CHECKBOX */}
                        <TouchableOpacity
                          onPress={() => handleToggleComplete(dayNum)}
                          style={{ width: 48, alignItems: 'center', justifyContent: 'center' }}
                        >
                          {isDone ? (
                            <CheckSquare size={20} color={palette.accentGreen} />
                          ) : (
                            <Square size={20} color={palette.textMuted} />
                          )}
                        </TouchableOpacity>

                        {/* Day Cell */}
                        <View style={{ width: 56 }}>
                          <Text style={{ fontSize: 12, fontWeight: '800', color: isToday ? palette.accentGold : palette.textPrimary }}>
                            Day {dayNum}
                          </Text>
                          {isToday && (
                            <Text style={{ fontSize: 9, fontWeight: '800', color: palette.accentGold }}>TODAY</Text>
                          )}
                        </View>

                        {/* Ordered Scripture Cell (1 -> 2 -> 3 -> 4) */}
                        <View style={{ width: 260, paddingRight: 6 }}>
                          {/* 1. Old Testament & 2. New Testament */}
                          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                            <TouchableOpacity
                              onPress={() => handleOpenScriptureInBible(dayReading.oldTestament)}
                              style={{ flex: 1 }}
                            >
                              <Text style={{ fontSize: 11.5, fontWeight: '700', color: palette.accentGold }} numberOfLines={1}>
                                1. {dayReading.oldTestament.displayText}
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => handleOpenScriptureInBible(dayReading.newTestament)}
                              style={{ flex: 1 }}
                            >
                              <Text style={{ fontSize: 11.5, fontWeight: '700', color: palette.accentGreen }} numberOfLines={1}>
                                2. {dayReading.newTestament.displayText}
                              </Text>
                            </TouchableOpacity>
                          </View>

                          {/* 3. Psalms & 4. Proverbs */}
                          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 2 }}>
                            <TouchableOpacity
                              onPress={() => handleOpenScriptureInBible(dayReading.psalm)}
                              style={{ flex: 1 }}
                            >
                              <Text style={{ fontSize: 11, color: '#3498DB', fontWeight: '600' }} numberOfLines={1}>
                                3. {dayReading.psalm.displayText}
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => handleOpenScriptureInBible(dayReading.proverb)}
                              style={{ flex: 1 }}
                            >
                              <Text style={{ fontSize: 11, color: '#9B59B6', fontWeight: '600' }} numberOfLines={1}>
                                4. {dayReading.proverb.displayText}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Reading Time Cell */}
                        <View style={{ width: 90, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          <TouchableOpacity onPress={() => adjustTime(dayNum, 'readingMinutes', -5)}>
                            <Minus size={12} color={palette.textSecondary} />
                          </TouchableOpacity>
                          <Text style={{ fontSize: 12, fontWeight: '700', color: palette.accentGreen, minWidth: 26, textAlign: 'center' }}>
                            {log.readingMinutes}m
                          </Text>
                          <TouchableOpacity onPress={() => adjustTime(dayNum, 'readingMinutes', 5)}>
                            <Plus size={12} color={palette.accentGreen} />
                          </TouchableOpacity>
                        </View>

                        {/* Prayer Time Cell */}
                        <View style={{ width: 90, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          <TouchableOpacity onPress={() => adjustTime(dayNum, 'prayerMinutes', -5)}>
                            <Minus size={12} color={palette.textSecondary} />
                          </TouchableOpacity>
                          <Text style={{ fontSize: 12, fontWeight: '700', color: '#E11D48', minWidth: 26, textAlign: 'center' }}>
                            {log.prayerMinutes}m
                          </Text>
                          <TouchableOpacity onPress={() => adjustTime(dayNum, 'prayerMinutes', 5)}>
                            <Plus size={12} color="#E11D48" />
                          </TouchableOpacity>
                        </View>

                        {/* Quiet Time Cell */}
                        <View style={{ width: 90, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          <TouchableOpacity onPress={() => adjustTime(dayNum, 'quietMinutes', -5)}>
                            <Minus size={12} color={palette.textSecondary} />
                          </TouchableOpacity>
                          <Text style={{ fontSize: 12, fontWeight: '700', color: '#7C3AED', minWidth: 26, textAlign: 'center' }}>
                            {log.quietMinutes}m
                          </Text>
                          <TouchableOpacity onPress={() => adjustTime(dayNum, 'quietMinutes', 5)}>
                            <Plus size={12} color="#7C3AED" />
                          </TouchableOpacity>
                        </View>

                        {/* Total Cell */}
                        <View style={{ width: 55, alignItems: 'center' }}>
                          <Text style={{ fontSize: 12, fontWeight: '800', color: palette.accentGold }}>
                            {totalMins}m
                          </Text>
                        </View>
                      </View>
                    );
                  })}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  )}

      {/* VIEW MODE 3: CHRIST-CENTERED GROWTH INSIGHTS */}
      {viewMode === 'analytics' && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 18, gap: 16, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Card */}
          <View style={[styles.progressCard, { backgroundColor: palette.card, borderColor: '#4F46E5', borderWidth: 1.5 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={[styles.badgeIcon, { backgroundColor: 'rgba(79, 70, 229, 0.15)' }]}>
                <ShieldCheck size={24} color="#4F46E5" />
              </View>
              <View>
                <Text style={[styles.progressTitle, { color: palette.textPrimary }]}>Spiritual Armor & Growth</Text>
                <Text style={{ fontSize: 13, color: palette.textSecondary }}>
                  "Grown in grace, and in the knowledge of our Lord" — 2 Peter 3:18
                </Text>
              </View>
            </View>
          </View>

          {/* Grand Total Time Summary */}
          <View style={{ backgroundColor: palette.card, borderRadius: 18, borderWidth: 1, borderColor: palette.cardBorder, padding: 18 }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: palette.accentGold, textTransform: 'uppercase', letterSpacing: 1 }}>
              TOTAL TIME DEDICATED TO GOD
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
              <Text style={{ fontSize: 34, fontWeight: '900', color: palette.accentGreen }}>
                {grandTotalHours}
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '800', color: palette.textPrimary }}>
                Hours Logged in Word & Prayer
              </Text>
            </View>

            {/* Time Distribution Bars */}
            <View style={{ marginTop: 16, gap: 12 }}>
              {/* Scripture Reading */}
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: palette.accentGreen }}>📖 Word Meditated (Reading)</Text>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: palette.textPrimary }}>
                    {totalReadingMins} mins ({((totalReadingMins / Math.max(1, grandTotalMins)) * 100).toFixed(0)}%)
                  </Text>
                </View>
                <View style={{ height: 10, borderRadius: 5, backgroundColor: palette.inputBg, overflow: 'hidden' }}>
                  <View style={{ width: `${Math.min(100, (totalReadingMins / Math.max(1, grandTotalMins)) * 100)}%`, height: '100%', backgroundColor: palette.accentGreen }} />
                </View>
              </View>

              {/* Prayer Time */}
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#E11D48' }}>🙏 Heart Communion (Prayer)</Text>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: palette.textPrimary }}>
                    {totalPrayerMins} mins ({((totalPrayerMins / Math.max(1, grandTotalMins)) * 100).toFixed(0)}%)
                  </Text>
                </View>
                <View style={{ height: 10, borderRadius: 5, backgroundColor: palette.inputBg, overflow: 'hidden' }}>
                  <View style={{ width: `${Math.min(100, (totalPrayerMins / Math.max(1, grandTotalMins)) * 100)}%`, height: '100%', backgroundColor: '#E11D48' }} />
                </View>
              </View>

              {/* Quiet Time */}
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#7C3AED' }}>🧘 Sacred Quiet Time</Text>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: palette.textPrimary }}>
                    {totalQuietMins} mins ({((totalQuietMins / Math.max(1, grandTotalMins)) * 100).toFixed(0)}%)
                  </Text>
                </View>
                <View style={{ height: 10, borderRadius: 5, backgroundColor: palette.inputBg, overflow: 'hidden' }}>
                  <View style={{ width: `${Math.min(100, (totalQuietMins / Math.max(1, grandTotalMins)) * 100)}%`, height: '100%', backgroundColor: '#7C3AED' }} />
                </View>
              </View>
            </View>
          </View>

          {/* Key Metrics Matrix Grid */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1, backgroundColor: palette.card, borderRadius: 16, borderWidth: 1, borderColor: palette.cardBorder, padding: 14 }}>
              <Cross size={20} color={palette.accentGold} />
              <Text style={{ fontSize: 22, fontWeight: '900', color: palette.textPrimary, marginTop: 8 }}>
                {totalCompletedCount} / 365
              </Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: palette.textSecondary, marginTop: 2 }}>
                Faithful Days Completed
              </Text>
            </View>

            <View style={{ flex: 1, backgroundColor: palette.card, borderRadius: 16, borderWidth: 1, borderColor: palette.cardBorder, padding: 14 }}>
              <Clock size={20} color={palette.accentGreen} />
              <Text style={{ fontSize: 22, fontWeight: '900', color: palette.textPrimary, marginTop: 8 }}>
                {(grandTotalMins / Math.max(1, totalCompletedCount || 1)).toFixed(0)}m
              </Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: palette.textSecondary, marginTop: 2 }}>
                Avg Time per Session
              </Text>
            </View>
          </View>

          {/* Fruit of the Spirit & Habit Milestones */}
          <View style={{ backgroundColor: palette.card, borderRadius: 18, borderWidth: 1, borderColor: palette.cardBorder, padding: 18 }}>
            <Text style={{ fontSize: 16, fontWeight: '900', color: palette.textPrimary, marginBottom: 12 }}>
              Fruit of the Spirit & Milestones
            </Text>

            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <BookOpen size={18} color={palette.accentGreen} />
                  <Text style={{ fontSize: 13, fontWeight: '800', color: palette.textPrimary }}>Total Passages Read</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '900', color: palette.accentGreen }}>
                  {totalCompletedCount * 4} / 1460
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Heart size={18} color="#E11D48" />
                  <Text style={{ fontSize: 13, fontWeight: '800', color: palette.textPrimary }}>Prayer Minutes Logged</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '900', color: '#E11D48' }}>
                  {totalPrayerMins} min
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Moon size={18} color="#7C3AED" />
                  <Text style={{ fontSize: 13, fontWeight: '800', color: palette.textPrimary }}>Quiet Reflection Minutes</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '900', color: '#7C3AED' }}>
                  {totalQuietMins} min
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}

      {/* STREAK & REWARD CELEBRATION MODAL */}
      <Modal visible={isRewardModalOpen} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsRewardModalOpen(false)}>
          <View
            style={{
              backgroundColor: palette.card,
              maxWidth: 440,
              width: '90%',
              borderRadius: 24,
              padding: 24,
              alignItems: 'center',
              borderWidth: 2,
              borderColor: palette.accentGold,
              elevation: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
            }}
            onStartShouldSetResponder={() => true}
          >
            {/* Header Badge */}
            <View style={{ width: 68, height: 68, borderRadius: 34, backgroundColor: 'rgba(217, 119, 6, 0.18)', justifyContent: 'center', alignItems: 'center', marginBottom: 14 }}>
              <Flame size={38} color="#D97706" />
            </View>

            <Text style={{ fontSize: 12, fontWeight: '800', color: palette.accentGold, textTransform: 'uppercase', letterSpacing: 1 }}>
              STREAK REWARD UNLOCKED 🎉
            </Text>

            <Text style={{ fontSize: 24, fontWeight: '900', color: palette.textPrimary, textAlign: 'center', marginTop: 4 }}>
              🔥 {rewardDetails.streakCount}-Day Faith Streak!
            </Text>

            {/* Points & Bonus Pill */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <View style={{ backgroundColor: 'rgba(5, 150, 105, 0.14)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} color={palette.accentGreen} />
                <Text style={{ fontSize: 14, fontWeight: '800', color: palette.accentGreen }}>
                  +{rewardDetails.pointsEarned} Grace Points
                </Text>
              </View>
            </View>

            {/* Achievement Card if unlocked */}
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

            {/* Scripture Blessing */}
            <Text style={{ fontSize: 13, fontStyle: 'italic', color: palette.textSecondary, textAlign: 'center', marginTop: 18, lineHeight: 19 }}>
              "Well done, good and faithful servant... enter into the joy of your Lord." — Matthew 25:21
            </Text>

            {/* Dismiss Button */}
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
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  segmentText: {
    fontSize: 12,
  },
  progressCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  badgeIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '800',
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
  cell: {
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
