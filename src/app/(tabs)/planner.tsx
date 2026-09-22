import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useBibleStore } from '../../store/useBibleStore';
import { useSpiritualStore } from '../../store/useSpiritualStore';
import { SpiritualTheme } from '../../constants/spiritualTheme';
import { triggerLightHaptic } from '../../services/mobileHaptics';
import { getCurrentYearDayNumber } from '../../engine/oneYearPlanEngine';
import {
  Calendar,
  Sun,
  Moon,
  Clock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Brain,
  BarChart3,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Heart,
} from 'lucide-react-native';

export default function PlannerScreen() {
  const router = useRouter();
  const { themeMode, completedPlanDays } = useBibleStore();
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

  const currentYearDay = getCurrentYearDayNumber();
  const planId = 'one-year-bible-plan';
  const completedDaysArray = completedPlanDays[planId] || [];
  const isBiblePlanDone = completedDaysArray.includes(currentYearDay);

  // Progressive Disclosure / Accordion States
  const [expandedChecklist, setExpandedChecklist] = useState<Record<string, boolean>>({});
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(false);
  const [isMemoryExpanded, setIsMemoryExpanded] = useState(false);

  const toggleChecklistItem = (key: string) => {
    triggerLightHaptic();
    setExpandedChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isAllComplete = isMorningDone && isBiblePlanDone && isEveningDone;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }} edges={['top', 'left', 'right']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingHorizontal: 20, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. MINIMAL HEADER */}
        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '800', color: palette.accentGreen, textTransform: 'uppercase', letterSpacing: 1.2 }}>
            Personalized Daily Routine
          </Text>
          <Text style={{ fontSize: 26, fontWeight: '900', color: palette.textPrimary, marginTop: 4, letterSpacing: -0.5 }}>
            Daily Bible Planner
          </Text>
          <Text style={{ fontSize: 13, color: palette.textSecondary, marginTop: 3 }}>
            Tailored to your {user.timeCommitment} commitment for spiritual growth.
          </Text>
        </View>

        {/* 2. SLEEK QUICK NAVIGATION PILLS */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => {
              triggerLightHaptic();
              router.push({ pathname: '/one-year-planner', params: { mode: 'calendar' } } as any);
            }}
            activeOpacity={0.85}
            style={[styles.quickNavPill, { backgroundColor: palette.card, borderColor: palette.accentGold }]}
          >
            <Calendar size={17} color={palette.accentGold} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: palette.textPrimary }}>Calendar</Text>
              <Text style={{ fontSize: 11, color: palette.textSecondary }}>Daily Marked Work</Text>
            </View>
            <ArrowRight size={14} color={palette.accentGold} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              triggerLightHaptic();
              router.push('/one-year-planner' as any);
            }}
            activeOpacity={0.85}
            style={[styles.quickNavPill, { backgroundColor: palette.card, borderColor: '#4F46E5' }]}
          >
            <BarChart3 size={17} color="#4F46E5" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: palette.textPrimary }}>Analytics</Text>
              <Text style={{ fontSize: 11, color: palette.textSecondary }}>Spiritual Insights</Text>
            </View>
            <ArrowRight size={14} color="#4F46E5" />
          </TouchableOpacity>
        </View>

        {/* 3. TODAY'S COMPLETION CHECKLIST (INTERACTIVE ACCORDION) */}
        <View style={{ marginBottom: 18 }}>
          <View style={[styles.cardContainer, { backgroundColor: palette.card, borderColor: isAllComplete ? palette.accentGreen : palette.cardBorder }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={19} color={isAllComplete ? palette.accentGreen : palette.accentGold} />
                <Text style={{ fontSize: 16, fontWeight: '800', color: palette.textPrimary }}>
                  Today's Completion Checklist
                </Text>
              </View>
              <Text style={{ fontSize: 11, fontWeight: '800', color: isAllComplete ? palette.accentGreen : palette.accentGold }}>
                {isAllComplete ? '100% COMPLETE 🎉' : 'IN PROGRESS'}
              </Text>
            </View>

            {/* Checklist Items */}
            <View style={{ gap: 10 }}>
              {/* ITEM 1: Morning Scripture & Walk */}
              <View style={[styles.accordionItem, { backgroundColor: palette.inputBg, borderColor: palette.border }]}>
                <TouchableOpacity
                  onPress={() => toggleChecklistItem('morning')}
                  activeOpacity={0.7}
                  style={styles.accordionHeader}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    <CheckCircle2 size={18} color={isMorningDone ? palette.accentGreen : palette.textMuted} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13.5, fontWeight: '800', color: palette.textPrimary }}>
                        1. Morning Scripture & Walk
                      </Text>
                      <Text style={{ fontSize: 11, color: isMorningDone ? palette.accentGreen : palette.textSecondary, marginTop: 1 }}>
                        {isMorningDone ? 'Completed ✓' : 'Scripture, reflection & prayer'}
                      </Text>
                    </View>
                  </View>

                  {expandedChecklist['morning'] ? (
                    <ChevronUp size={18} color={palette.textSecondary} />
                  ) : (
                    <ChevronDown size={18} color={palette.textSecondary} />
                  )}
                </TouchableOpacity>

                {expandedChecklist['morning'] && (
                  <View style={styles.accordionBody}>
                    <Text style={[styles.accordionDesc, { color: palette.textSecondary }]}>
                      Start your day rooted in God's Word with morning passage reading, historical context breakdown, reflection questions, and guided prayer.
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        triggerLightHaptic();
                        router.push('/morning-journey' as any);
                      }}
                      style={[styles.actionBtn, { backgroundColor: palette.accentGold }]}
                    >
                      <Sun size={15} color="#FFFFFF" />
                      <Text style={styles.actionBtnText}>
                        {isMorningDone ? 'Revisit Morning Walk →' : 'Begin Morning Walk →'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* ITEM 2: 365-Day Bible Portion */}
              <View style={[styles.accordionItem, { backgroundColor: palette.inputBg, borderColor: palette.border }]}>
                <TouchableOpacity
                  onPress={() => toggleChecklistItem('bible_plan')}
                  activeOpacity={0.7}
                  style={styles.accordionHeader}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    <CheckCircle2 size={18} color={isBiblePlanDone ? palette.accentGreen : palette.textMuted} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13.5, fontWeight: '800', color: palette.textPrimary }}>
                        2. 365-Day Bible Portion
                      </Text>
                      <Text style={{ fontSize: 11, color: isBiblePlanDone ? palette.accentGreen : palette.accentGold, marginTop: 1 }}>
                        {isBiblePlanDone ? 'Completed for today ✓' : 'Old & New Testament • Psalms & Proverbs'}
                      </Text>
                    </View>
                  </View>

                  {expandedChecklist['bible_plan'] ? (
                    <ChevronUp size={18} color={palette.textSecondary} />
                  ) : (
                    <ChevronDown size={18} color={palette.textSecondary} />
                  )}
                </TouchableOpacity>

                {expandedChecklist['bible_plan'] && (
                  <View style={styles.accordionBody}>
                    <Text style={[styles.accordionDesc, { color: palette.textSecondary }]}>
                      Read your 4 daily passages: Old Testament prophecy, New Testament grace, Psalms worship, and Proverbs wisdom.
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        triggerLightHaptic();
                        router.push('/one-year-planner' as any);
                      }}
                      style={[styles.actionBtn, { backgroundColor: palette.accentGreen }]}
                    >
                      <BookOpen size={15} color="#FFFFFF" />
                      <Text style={styles.actionBtnText}>Open Today's 4 Portions →</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* ITEM 3: Heart Reflection & Prayer */}
              <View style={[styles.accordionItem, { backgroundColor: palette.inputBg, borderColor: palette.border }]}>
                <TouchableOpacity
                  onPress={() => toggleChecklistItem('prayer')}
                  activeOpacity={0.7}
                  style={styles.accordionHeader}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    <CheckCircle2 size={18} color={palette.accentGold} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13.5, fontWeight: '800', color: palette.textPrimary }}>
                        3. Heart Reflection & Prayer
                      </Text>
                      <Text style={{ fontSize: 11, color: palette.textSecondary, marginTop: 1 }}>
                        Conversational prayer & intercession
                      </Text>
                    </View>
                  </View>

                  {expandedChecklist['prayer'] ? (
                    <ChevronUp size={18} color={palette.textSecondary} />
                  ) : (
                    <ChevronDown size={18} color={palette.textSecondary} />
                  )}
                </TouchableOpacity>

                {expandedChecklist['prayer'] && (
                  <View style={styles.accordionBody}>
                    <Text style={[styles.accordionDesc, { color: palette.textSecondary }]}>
                      Step into your sacred prayer chamber for guided intercession, personal thanksgiving, and quiet contemplation with the Holy Spirit.
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        triggerLightHaptic();
                        router.push('/pray-now' as any);
                      }}
                      style={[styles.actionBtn, { backgroundColor: '#E11D48' }]}
                    >
                      <Heart size={15} color="#FFFFFF" />
                      <Text style={styles.actionBtnText}>Enter Prayer Chamber →</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* ITEM 4: Evening Reflection */}
              <View style={[styles.accordionItem, { backgroundColor: palette.inputBg, borderColor: palette.border }]}>
                <TouchableOpacity
                  onPress={() => toggleChecklistItem('evening')}
                  activeOpacity={0.7}
                  style={styles.accordionHeader}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                    <CheckCircle2 size={18} color={isEveningDone ? palette.accentGreen : palette.textMuted} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13.5, fontWeight: '800', color: palette.textPrimary }}>
                        4. Evening Reflection
                      </Text>
                      <Text style={{ fontSize: 11, color: isEveningDone ? palette.accentGreen : palette.textSecondary, marginTop: 1 }}>
                        {isEveningDone ? 'Completed ✓' : 'Review day & surrender burdens'}
                      </Text>
                    </View>
                  </View>

                  {expandedChecklist['evening'] ? (
                    <ChevronUp size={18} color={palette.textSecondary} />
                  ) : (
                    <ChevronDown size={18} color={palette.textSecondary} />
                  )}
                </TouchableOpacity>

                {expandedChecklist['evening'] && (
                  <View style={styles.accordionBody}>
                    <Text style={[styles.accordionDesc, { color: palette.textSecondary }]}>
                      Release today's worries, surrender any heavy burdens to Jesus, and enter restful night sleep covered by His peace.
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        triggerLightHaptic();
                        router.push('/evening-journey' as any);
                      }}
                      style={[styles.actionBtn, { backgroundColor: '#7C3AED' }]}
                    >
                      <Moon size={15} color="#FFFFFF" />
                      <Text style={styles.actionBtnText}>
                        {isEveningDone ? 'Revisit Evening Reflection →' : 'Begin Evening Reflection →'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            {isAllComplete && (
              <View style={{ marginTop: 14, padding: 10, borderRadius: 10, backgroundColor: palette.accentGreenLight, alignItems: 'center' }}>
                <Text style={{ fontSize: 12.5, fontWeight: '800', color: palette.accentGreen }}>
                  🎉 Amen! Your Daily Bible Walk for today is complete!
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 4. COLLAPSIBLE DAILY ROUTINE SCHEDULE */}
        <View style={{ marginBottom: 18 }}>
          <View style={[styles.cardContainer, { backgroundColor: palette.card, borderColor: palette.cardBorder, overflow: 'hidden' }]}>
            <TouchableOpacity
              onPress={() => {
                triggerLightHaptic();
                setIsScheduleExpanded(!isScheduleExpanded);
              }}
              activeOpacity={0.7}
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Clock size={18} color={palette.accentGold} />
                <View>
                  <Text style={{ fontSize: 14.5, fontWeight: '800', color: palette.textPrimary }}>
                    Daily Schedule ({user.notificationTime || '07:00 AM'})
                  </Text>
                  <Text style={{ fontSize: 11, color: palette.textSecondary, marginTop: 1 }}>
                    {isScheduleExpanded ? 'Tap to hide breakdown' : 'Tap to reveal 15-min breakdown'}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ backgroundColor: 'rgba(217, 119, 6, 0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: palette.accentGold }}>15 min</Text>
                </View>
                {isScheduleExpanded ? (
                  <ChevronUp size={18} color={palette.textSecondary} />
                ) : (
                  <ChevronDown size={18} color={palette.textSecondary} />
                )}
              </View>
            </TouchableOpacity>

            {isScheduleExpanded && (
              <View style={{ marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: palette.border, gap: 12 }}>
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
            )}
          </View>
        </View>

        {/* 5. COLLAPSIBLE SCRIPTURE MEMORY */}
        <View style={{ marginBottom: 18 }}>
          <View style={[styles.cardContainer, { backgroundColor: palette.card, borderColor: palette.cardBorder, overflow: 'hidden' }]}>
            <TouchableOpacity
              onPress={() => {
                triggerLightHaptic();
                setIsMemoryExpanded(!isMemoryExpanded);
              }}
              activeOpacity={0.7}
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Brain size={18} color={palette.accentGold} />
                <View>
                  <Text style={{ fontSize: 14.5, fontWeight: '800', color: palette.textPrimary }}>
                    Scripture Memory
                  </Text>
                  <Text style={{ fontSize: 11, color: palette.textSecondary, marginTop: 1 }}>
                    {memoryVerses.length} {memoryVerses.length === 1 ? 'verse' : 'verses'} in rotation
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.accentGreen }}>
                  {isMemoryExpanded ? 'Hide ▲' : 'Practice ▼'}
                </Text>
                {isMemoryExpanded ? (
                  <ChevronUp size={18} color={palette.textSecondary} />
                ) : (
                  <ChevronDown size={18} color={palette.textSecondary} />
                )}
              </View>
            </TouchableOpacity>

            {isMemoryExpanded && (
              <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: palette.border }}>
                {memoryVerses.length === 0 ? (
                  <Text style={{ fontSize: 13, color: palette.textSecondary, fontStyle: 'italic', marginBottom: 10 }}>
                    No verses added yet. Highlight any verse in the Bible tab to add it to your memory list!
                  </Text>
                ) : (
                  memoryVerses.slice(0, 2).map((mv) => (
                    <View key={mv.id} style={{ backgroundColor: palette.inputBg, borderRadius: 10, padding: 10, marginBottom: 8 }}>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: palette.accentGreen, marginBottom: 2 }}>
                        {mv.bookName} {mv.chapter}:{mv.verse}
                      </Text>
                      <Text style={{ fontSize: 12, color: palette.textSecondary }} numberOfLines={2}>
                        "{mv.text}"
                      </Text>
                    </View>
                  ))
                )}

                <TouchableOpacity
                  onPress={() => {
                    triggerLightHaptic();
                    router.push('/memory-practice' as any);
                  }}
                  style={[styles.actionBtn, { backgroundColor: palette.accentGold, marginTop: 4 }]}
                >
                  <Sparkles size={15} color="#FFFFFF" />
                  <Text style={styles.actionBtnText}>Practice Scripture Memory →</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  quickNavPill: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardContainer: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  accordionItem: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  accordionBody: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 2,
  },
  accordionDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  timeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  stepSubtitle: {
    fontSize: 11.5,
    marginTop: 1,
  },
});
