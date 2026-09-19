import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
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
} from 'lucide-react-native';

type ViewMode = 'daily' | 'spreadsheet' | 'analytics';

export default function OneYearPlannerScreen() {
  const router = useRouter();
  const {
    themeMode,
    setLocation,
    completedPlanDays,
    togglePlanDay,
    dailyTimeLogs,
    setDailyTimeLog,
  } = useBibleStore();

  const isDark = themeMode === 'dark';
  const palette = isDark ? SpiritualTheme.dark : SpiritualTheme.light;

  const currentYearDay = getCurrentYearDayNumber();
  const [selectedDay, setSelectedDay] = useState(currentYearDay);
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [spreadsheetSearch, setSpreadsheetSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'completed' | 'pending'>('all');

  const planId = 'one-year-bible-plan';
  const completedDaysArray = completedPlanDays[planId] || [];
  const isDayCompleted = completedDaysArray.includes(selectedDay);

  const reading = getReadingForDay(selectedDay);
  const totalCompletedCount = completedDaysArray.length;
  const progressPercent = Math.min(100, Math.round((totalCompletedCount / 365) * 100));

  // Helper for daily time logs
  const getDayLog = (dayNum: number) => {
    const key = `${planId}:${dayNum}`;
    return dailyTimeLogs[key] || { readingMinutes: 15, prayerMinutes: 10, quietMinutes: 10 };
  };

  const handleToggleComplete = (dayNum: number = selectedDay) => {
    triggerSuccessHaptic();
    togglePlanDay(planId, dayNum);
    if (!completedDaysArray.includes(dayNum)) {
      Alert.alert('Day Completed! 🎉', `Amen! You completed Day ${dayNum} of your 365-Day Bible Plan.`);
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
          title: '365-Day Bible Planner',
          headerStyle: { backgroundColor: palette.card },
          headerTintColor: palette.textPrimary,
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        }}
      />

      {/* VIEW SEGMENT SWITCHER */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, backgroundColor: palette.card, borderBottomWidth: 1, borderBottomColor: palette.border }}>
        <View style={{ flexDirection: 'row', backgroundColor: palette.inputBg, borderRadius: 12, padding: 4 }}>
          <TouchableOpacity
            onPress={() => {
              triggerLightHaptic();
              setViewMode('daily');
            }}
            style={[
              styles.segmentBtn,
              viewMode === 'daily' && { backgroundColor: palette.card, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1 },
            ]}
          >
            <Calendar size={15} color={viewMode === 'daily' ? palette.accentGreen : palette.textSecondary} />
            <Text style={[styles.segmentText, { color: viewMode === 'daily' ? palette.textPrimary : palette.textSecondary, fontWeight: viewMode === 'daily' ? '800' : '600' }]}>
              Daily View
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              triggerLightHaptic();
              setViewMode('spreadsheet');
            }}
            style={[
              styles.segmentBtn,
              viewMode === 'spreadsheet' && { backgroundColor: palette.card, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1 },
            ]}
          >
            <Table size={15} color={viewMode === 'spreadsheet' ? palette.accentGold : palette.textSecondary} />
            <Text style={[styles.segmentText, { color: viewMode === 'spreadsheet' ? palette.textPrimary : palette.textSecondary, fontWeight: viewMode === 'spreadsheet' ? '800' : '600' }]}>
              Spreadsheet
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              triggerLightHaptic();
              setViewMode('analytics');
            }}
            style={[
              styles.segmentBtn,
              viewMode === 'analytics' && { backgroundColor: palette.card, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1 },
            ]}
          >
            <BarChart3 size={15} color={viewMode === 'analytics' ? '#4F46E5' : palette.textSecondary} />
            <Text style={[styles.segmentText, { color: viewMode === 'analytics' ? palette.textPrimary : palette.textSecondary, fontWeight: viewMode === 'analytics' ? '800' : '600' }]}>
              Analytics
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* VIEW MODE 1: DAILY CARDS VIEW */}
      {viewMode === 'daily' && (
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

          {/* Time Logger for Selected Day */}
          <View style={{ backgroundColor: palette.card, borderRadius: 16, borderWidth: 1, borderColor: palette.cardBorder, padding: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: palette.textPrimary, marginBottom: 12 }}>
              ⏱️ Daily Spiritual Time Tracking — Day {selectedDay}
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
              {/* Reading Time */}
              <View style={{ flex: 1, backgroundColor: palette.inputBg, padding: 10, borderRadius: 12, alignItems: 'center' }}>
                <BookOpen size={16} color={palette.accentGreen} />
                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.textSecondary, marginTop: 4 }}>Reading Time</Text>
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
                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.textSecondary, marginTop: 4 }}>Quiet Time</Text>
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

          {/* Readings List Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
            <Text style={{ fontSize: 16, fontWeight: '800', color: palette.textPrimary }}>
              Today's Scripture Readings
            </Text>
            <TouchableOpacity onPress={() => handleToggleComplete(selectedDay)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
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
      )}

      {/* VIEW MODE 2: SPREADSHEET GRID VIEW */}
      {viewMode === 'spreadsheet' && (
        <View style={{ flex: 1 }}>
          {/* Search & Filter Bar */}
          <View style={{ paddingHorizontal: 16, paddingVertical: 10, backgroundColor: palette.card, borderBottomWidth: 1, borderBottomColor: palette.border, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: palette.inputBg, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: palette.border }}>
              <Search size={16} color={palette.textSecondary} style={{ marginRight: 6 }} />
              <TextInput
                style={{ flex: 1, fontSize: 13, color: palette.textPrimary }}
                placeholder="Search day or scripture (e.g. Day 263, Job)..."
                placeholderTextColor={palette.textSecondary}
                value={spreadsheetSearch}
                onChangeText={setSpreadsheetSearch}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 4 }}>
              <TouchableOpacity
                onPress={() => setFilterMode('all')}
                style={{ paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, backgroundColor: filterMode === 'all' ? palette.accentGreen : palette.inputBg }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: filterMode === 'all' ? '#FFF' : palette.textSecondary }}>All</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setFilterMode('completed')}
                style={{ paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6, backgroundColor: filterMode === 'completed' ? palette.accentGreen : palette.inputBg }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: filterMode === 'completed' ? '#FFF' : palette.textSecondary }}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* SPREADSHEET TABLE HEADER */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
            <View style={{ minWidth: 700 }}>
              {/* Header Row */}
              <View style={{ flexDirection: 'row', backgroundColor: isDark ? '#1F2937' : '#E5E7EB', paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1.5, borderBottomColor: palette.border, alignItems: 'center' }}>
                <Text style={[styles.cell, { width: 44, fontWeight: '800', color: palette.textPrimary, textAlign: 'center' }]}>DONE</Text>
                <Text style={[styles.cell, { width: 56, fontWeight: '800', color: palette.textPrimary }]}>DAY</Text>
                <Text style={[styles.cell, { width: 250, fontWeight: '800', color: palette.textPrimary }]}>ORDERED BIBLE SCRIPTURES (1 → 4)</Text>
                <Text style={[styles.cell, { width: 90, fontWeight: '800', color: palette.accentGreen, textAlign: 'center' }]}>READ TIME</Text>
                <Text style={[styles.cell, { width: 90, fontWeight: '800', color: '#E11D48', textAlign: 'center' }]}>PRAYER TIME</Text>
                <Text style={[styles.cell, { width: 90, fontWeight: '800', color: '#7C3AED', textAlign: 'center' }]}>QUIET TIME</Text>
                <Text style={[styles.cell, { width: 55, fontWeight: '800', color: palette.accentGold, textAlign: 'center' }]}>TOTAL</Text>
              </View>

              {/* Rows List */}
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={true}>
                {Array.from({ length: 365 }, (_, i) => i + 1)
                  .filter((dayNum) => {
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
                  .slice(0, 100) // Render up to 100 rows per view for max speed
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
                            ? 'rgba(217, 119, 6, 0.1)'
                            : isDone
                            ? 'rgba(5, 150, 105, 0.05)'
                            : palette.card,
                        }}
                      >
                        {/* LEFT SIDE CHECKBOX */}
                        <TouchableOpacity
                          onPress={() => handleToggleComplete(dayNum)}
                          style={{ width: 44, alignItems: 'center', justifyContent: 'center' }}
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
                            <Text style={{ fontSize: 9, fontWeight: '700', color: palette.accentGold }}>TODAY</Text>
                          )}
                        </View>

                        {/* Ordered Scripture Cell (1 -> 2 -> 3 -> 4) */}
                        <View style={{ width: 250, paddingRight: 6 }}>
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

      {/* VIEW MODE 3: ANALYTICAL VIEW DASHBOARD */}
      {viewMode === 'analytics' && (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 18, gap: 16, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Card */}
          <View style={[styles.progressCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={[styles.badgeIcon, { backgroundColor: 'rgba(79, 70, 229, 0.15)' }]}>
                <TrendingUp size={22} color="#4F46E5" />
              </View>
              <View>
                <Text style={[styles.progressTitle, { color: palette.textPrimary }]}>Spiritual Analytics & Habits</Text>
                <Text style={{ fontSize: 13, color: palette.textSecondary }}>
                  Real-time breakdown of scriptures, prayer & quiet time
                </Text>
              </View>
            </View>
          </View>

          {/* Grand Total Time Summary */}
          <View style={{ backgroundColor: palette.card, borderRadius: 16, borderWidth: 1, borderColor: palette.cardBorder, padding: 18 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: palette.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Total Spiritual Investment
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
              <Text style={{ fontSize: 32, fontWeight: '900', color: palette.accentGreen }}>
                {grandTotalHours}
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: palette.textPrimary }}>
                Hours Logged in Plan
              </Text>
            </View>

            {/* Time Distribution Bars */}
            <View style={{ marginTop: 16, gap: 10 }}>
              {/* Scripture Reading */}
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: palette.accentGreen }}>📖 Scripture Reading</Text>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: palette.textPrimary }}>
                    {totalReadingMins} mins ({((totalReadingMins / Math.max(1, grandTotalMins)) * 100).toFixed(0)}%)
                  </Text>
                </View>
                <View style={{ height: 8, borderRadius: 4, backgroundColor: palette.inputBg, overflow: 'hidden' }}>
                  <View style={{ width: `${Math.min(100, (totalReadingMins / Math.max(1, grandTotalMins)) * 100)}%`, height: '100%', backgroundColor: palette.accentGreen }} />
                </View>
              </View>

              {/* Prayer Time */}
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#E11D48' }}>🙏 Conversational Prayer</Text>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: palette.textPrimary }}>
                    {totalPrayerMins} mins ({((totalPrayerMins / Math.max(1, grandTotalMins)) * 100).toFixed(0)}%)
                  </Text>
                </View>
                <View style={{ height: 8, borderRadius: 4, backgroundColor: palette.inputBg, overflow: 'hidden' }}>
                  <View style={{ width: `${Math.min(100, (totalPrayerMins / Math.max(1, grandTotalMins)) * 100)}%`, height: '100%', backgroundColor: '#E11D48' }} />
                </View>
              </View>

              {/* Quiet Time */}
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#7C3AED' }}>🧘 Quiet Time & Reflection</Text>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: palette.textPrimary }}>
                    {totalQuietMins} mins ({((totalQuietMins / Math.max(1, grandTotalMins)) * 100).toFixed(0)}%)
                  </Text>
                </View>
                <View style={{ height: 8, borderRadius: 4, backgroundColor: palette.inputBg, overflow: 'hidden' }}>
                  <View style={{ width: `${Math.min(100, (totalQuietMins / Math.max(1, grandTotalMins)) * 100)}%`, height: '100%', backgroundColor: '#7C3AED' }} />
                </View>
              </View>
            </View>
          </View>

          {/* Key Metrics Matrix Grid */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1, backgroundColor: palette.card, borderRadius: 16, borderWidth: 1, borderColor: palette.cardBorder, padding: 14 }}>
              <Activity size={18} color={palette.accentGold} />
              <Text style={{ fontSize: 22, fontWeight: '900', color: palette.textPrimary, marginTop: 8 }}>
                {totalCompletedCount} / 365
              </Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: palette.textSecondary, marginTop: 2 }}>
                Days Completed
              </Text>
            </View>

            <View style={{ flex: 1, backgroundColor: palette.card, borderRadius: 16, borderWidth: 1, borderColor: palette.cardBorder, padding: 14 }}>
              <Clock size={18} color={palette.accentGreen} />
              <Text style={{ fontSize: 22, fontWeight: '900', color: palette.textPrimary, marginTop: 8 }}>
                {(grandTotalMins / Math.max(1, totalCompletedCount || 1)).toFixed(0)}m
              </Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: palette.textSecondary, marginTop: 2 }}>
                Avg Daily Session
              </Text>
            </View>
          </View>

          {/* Target vs Actual Habit Summary */}
          <View style={{ backgroundColor: palette.card, borderRadius: 16, borderWidth: 1, borderColor: palette.cardBorder, padding: 18 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: palette.textPrimary, marginBottom: 12 }}>
              Spiritual Habits Breakdown
            </Text>

            <View style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <BookOpen size={16} color={palette.accentGreen} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: palette.textPrimary }}>Total Passages Read</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '800', color: palette.accentGreen }}>
                  {totalCompletedCount * 4} / 1460
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Heart size={16} color="#E11D48" />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: palette.textPrimary }}>Total Prayer Minutes</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#E11D48' }}>
                  {totalPrayerMins} min
                </Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Moon size={16} color="#7C3AED" />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: palette.textPrimary }}>Total Quiet Time</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#7C3AED' }}>
                  {totalQuietMins} min
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
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
  cell: {
    fontSize: 11,
  },
});
