import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useBibleStore } from '../store/useBibleStore';
import {
  useSpiritualStore,
  GrowthGoal,
  TimeCommitment,
  TimeOfDay,
  SPIRITUAL_STAGES,
} from '../store/useSpiritualStore';
import { SpiritualTheme } from '../constants/spiritualTheme';
import { triggerLightHaptic } from '../services/mobileHaptics';
import {
  CheckCircle2,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  User,
  Mail,
  MapPin,
  Calendar,
  Compass,
  Heart,
  Clock,
  Bell,
  Check,
} from 'lucide-react-native';
import { supabase } from '../services/supabaseConfig';

const ALL_GOALS: { id: GrowthGoal; label: string; icon: string }[] = [
  { id: 'faith', label: 'Faith', icon: '✝️' },
  { id: 'prayer', label: 'Prayer', icon: '🙏' },
  { id: 'wisdom', label: 'Wisdom', icon: '📖' },
  { id: 'purpose', label: 'Purpose', icon: '🎯' },
  { id: 'discipline', label: 'Discipline', icon: '🛡️' },
  { id: 'patience', label: 'Patience', icon: '⏳' },
  { id: 'forgiveness', label: 'Forgiveness', icon: '🕊️' },
  { id: 'peace', label: 'Peace', icon: '🌿' },
  { id: 'courage', label: 'Courage', icon: '🦁' },
  { id: 'love', label: 'Love', icon: '❤️' },
  { id: 'gratitude', label: 'Gratitude', icon: '☀️' },
  { id: 'relationships', label: 'Relationships', icon: '🤝' },
];

const TIME_OPTIONS: TimeCommitment[] = ['5 min', '10 min', '15 min', '30 min', '60 min'];

const TIME_OF_DAY_OPTIONS: { id: TimeOfDay; label: string; sub: string }[] = [
  { id: 'morning', label: 'Morning Devotional', sub: 'e.g. 7:00 AM — start your day with God' },
  { id: 'afternoon', label: 'Midday Reflection', sub: 'e.g. 12:30 PM — pause and recenter' },
  { id: 'evening', label: 'Evening Meditation', sub: 'e.g. 9:00 PM — rest in God’s peace' },
];

export default function OnboardingFlowScreen() {
  const router = useRouter();
  const { themeMode } = useBibleStore();
  const { user, updateUserProfile, setOnboardedPreferences } = useSpiritualStore();

  const isDark = themeMode === 'dark';
  const palette = isDark ? SpiritualTheme.dark : SpiritualTheme.light;

  // Active step: 1 (Profile), 2 (Spiritual Stage), 3 (Goals), 4 (Routine)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [name, setName] = useState<string>(user.displayName || '');
  const [age, setAge] = useState<string>(user.age || '');
  const [location, setLocation] = useState<string>(user.location || '');
  const [email, setEmail] = useState<string>(user.email || '');

  const [spiritualStage, setSpiritualStage] = useState<number>(user.spiritualStage || 5);
  const [selectedGoals, setSelectedGoals] = useState<GrowthGoal[]>(user.growthGoals || ['faith', 'peace', 'prayer']);
  const [selectedTime, setSelectedTime] = useState<TimeCommitment>(user.timeCommitment || '15 min');
  const [selectedTod, setSelectedTod] = useState<TimeOfDay>(user.timeOfDay || 'morning');
  const [enableReminders, setEnableReminders] = useState<boolean>(user.notificationsEnabled ?? true);

  const activeStageInfo = SPIRITUAL_STAGES.find((s) => s.step === spiritualStage) || SPIRITUAL_STAGES[4];

  const toggleGoal = (g: GrowthGoal) => {
    triggerLightHaptic();
    if (selectedGoals.includes(g)) {
      if (selectedGoals.length > 1) {
        setSelectedGoals(selectedGoals.filter((x) => x !== g));
      }
    } else {
      setSelectedGoals([...selectedGoals, g]);
    }
  };

  const handleNextStep = () => {
    triggerLightHaptic();
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCompleteOnboarding();
    }
  };

  const handlePrevStep = () => {
    triggerLightHaptic();
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleCompleteOnboarding = async () => {
    const finalName = name.trim() || 'Friend';
    const stageTitle = activeStageInfo.title;

    // 1. Update local Zustand persistent store
    updateUserProfile({
      displayName: finalName,
      age: age.trim(),
      location: location.trim(),
      email: email.trim(),
      spiritualStage,
      spiritualStageTitle: stageTitle,
      notificationsEnabled: enableReminders,
      onboarded: true,
    });

    setOnboardedPreferences(selectedGoals, selectedTime, selectedTod);

    // 2. Sync to Supabase profiles table if available
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        await supabase.from('profiles').upsert({
          id: authUser.id,
          email: email.trim() || authUser.email,
          display_name: finalName,
          age: age.trim() ? parseInt(age.trim(), 10) : null,
          location: location.trim(),
          spiritual_stage: spiritualStage,
          growth_goals: selectedGoals,
          time_commitment: selectedTime,
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.log('Background cloud profile sync skipped:', err);
    }

    triggerLightHaptic();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Top Navigation & Step Indicator */}
        <View style={[styles.topBar, { backgroundColor: palette.card, borderBottomColor: palette.border }]}>
          <TouchableOpacity onPress={handlePrevStep} style={styles.backButton}>
            <ChevronLeft size={22} color={palette.textPrimary} />
            <Text style={[styles.backText, { color: palette.textPrimary }]}>
              {currentStep === 1 ? 'Close' : 'Back'}
            </Text>
          </TouchableOpacity>

          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.stepIndicatorText, { color: palette.accentGreen }]}>
              STEP {currentStep} OF 4
            </Text>
            <Text style={[styles.stepTitleHeader, { color: palette.textPrimary }]}>
              {currentStep === 1 && 'Personal Profile'}
              {currentStep === 2 && 'Spiritual Stage'}
              {currentStep === 3 && 'Growth Goals'}
              {currentStep === 4 && 'Daily Routine'}
            </Text>
          </View>

          <View style={{ width: 60 }} />
        </View>

        {/* Progress Bar (25% per step) */}
        <View style={{ height: 4, backgroundColor: palette.border, width: '100%' }}>
          <View
            style={{
              height: '100%',
              backgroundColor: palette.accentGreen,
              width: `${(currentStep / 4) * 100}%`,
            }}
          />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.contentContainer, { maxWidth: 480, alignSelf: 'center', width: '100%' }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ================= STEP 1: PERSONAL PROFILE ================= */}
          {currentStep === 1 && (
            <View>
              <View style={[styles.headerBox, { alignItems: 'center' }]}>
                <Image
                  source={require('../../assets/images/sela_logo.png')}
                  style={{ width: 88, height: 88, borderRadius: 22, marginBottom: 12 }}
                  resizeMode="cover"
                />
                <Text style={{ fontSize: 11, fontWeight: '800', color: palette.accentGreen, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
                  PAUSE • PRAY • GROW • BELONG
                </Text>
                <Text style={[styles.heading, { color: palette.textPrimary, textAlign: 'center' }]}>Welcome to Sela</Text>
                <Text style={[styles.subheading, { color: palette.textSecondary, textAlign: 'center' }]}>
                  Personalize your devotional experience, prayer journals, and community intercession.
                </Text>
              </View>

              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: palette.textPrimary }]}>Full Name</Text>
                <View style={[styles.inputWrapper, { backgroundColor: palette.card, borderColor: palette.border }]}>
                  <User size={18} color={palette.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInputField, { color: palette.textPrimary }]}
                    placeholder="Enter your name"
                    placeholderTextColor={palette.textMuted}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              {/* Age & Place (Row) */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                <View style={[styles.inputGroup, { flex: 1, marginBottom: 0 }]}>
                  <Text style={[styles.inputLabel, { color: palette.textPrimary }]}>Age</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: palette.card, borderColor: palette.border }]}>
                    <Calendar size={18} color={palette.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInputField, { color: palette.textPrimary }]}
                      placeholder="e.g. 24"
                      placeholderTextColor={palette.textMuted}
                      keyboardType="numeric"
                      value={age}
                      onChangeText={setAge}
                      maxLength={3}
                    />
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1.6, marginBottom: 0 }]}>
                  <Text style={[styles.inputLabel, { color: palette.textPrimary }]}>Place / City</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: palette.card, borderColor: palette.border }]}>
                    <MapPin size={18} color={palette.textSecondary} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.textInputField, { color: palette.textPrimary }]}
                      placeholder="e.g. Hyderabad"
                      placeholderTextColor={palette.textMuted}
                      value={location}
                      onChangeText={setLocation}
                    />
                  </View>
                </View>
              </View>

              {/* Email Address */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: palette.textPrimary }]}>Email ID (Optional)</Text>
                <View style={[styles.inputWrapper, { backgroundColor: palette.card, borderColor: palette.border }]}>
                  <Mail size={18} color={palette.textSecondary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInputField, { color: palette.textPrimary }]}
                    placeholder="you@example.com"
                    placeholderTextColor={palette.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              <Text style={{ fontSize: 12, color: palette.textMuted, marginTop: 4 }}>
                🔒 Your details stay private and help personalize your daily spiritual insights.
              </Text>
            </View>
          )}

          {/* ================= STEP 2: SPIRITUAL STAGE (1 TO 10) ================= */}
          {currentStep === 2 && (
            <View>
              <View style={styles.headerBox}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(217, 119, 6, 0.15)' }]}>
                  <Compass size={30} color={palette.accentGold} />
                </View>
                <Text style={[styles.heading, { color: palette.textPrimary }]}>Where Are You in Your Walk?</Text>
                <Text style={[styles.subheading, { color: palette.textSecondary }]}>
                  Select your current spiritual stage (1 out of 10) so we can calibrate scripture explanations and prayer depth.
                </Text>
              </View>

              {/* 10-Step Number Ladder */}
              <Text style={[styles.inputLabel, { color: palette.textPrimary, marginBottom: 8 }]}>
                Choose Your Stage (1 to 10):
              </Text>

              <View style={styles.stepNumberGrid}>
                {SPIRITUAL_STAGES.map((s) => {
                  const isSelected = s.step === spiritualStage;
                  return (
                    <TouchableOpacity
                      key={s.step}
                      activeOpacity={0.8}
                      onPress={() => {
                        triggerLightHaptic();
                        setSpiritualStage(s.step);
                      }}
                      style={[
                        styles.stepButton,
                        {
                          backgroundColor: isSelected ? palette.accentGold : palette.card,
                          borderColor: isSelected ? palette.accentGold : palette.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.stepButtonText,
                          { color: isSelected ? '#FFFFFF' : palette.textPrimary },
                        ]}
                      >
                        {s.step}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Active Stage Highlight Card */}
              <View
                style={[
                  styles.activeStageCard,
                  {
                    backgroundColor: isDark ? 'rgba(217, 119, 6, 0.08)' : 'rgba(217, 119, 6, 0.06)',
                    borderColor: palette.accentGold,
                  },
                ]}
              >
                <View style={styles.stageHeaderRow}>
                  <View style={[styles.stageBadge, { backgroundColor: palette.accentGold }]}>
                    <Text style={styles.stageBadgeText}>Step {activeStageInfo.step} out of 10</Text>
                  </View>

                  <Text style={[styles.stageScriptureAnchor, { color: palette.accentGold }]}>
                    {activeStageInfo.scriptureAnchor}
                  </Text>
                </View>

                <Text style={[styles.stageTitleText, { color: palette.textPrimary }]}>
                  {activeStageInfo.title}
                </Text>

                <Text style={[styles.stageDescText, { color: palette.textSecondary }]}>
                  {activeStageInfo.description}
                </Text>

                {/* Visual Ladder Indicator */}
                <View style={styles.ladderTrack}>
                  <View
                    style={[
                      styles.ladderFill,
                      {
                        width: `${(activeStageInfo.step / 10) * 100}%`,
                        backgroundColor: palette.accentGold,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.ladderPercent, { color: palette.textMuted }]}>
                  {activeStageInfo.step * 10}% along the disciple journey
                </Text>
              </View>
            </View>
          )}

          {/* ================= STEP 3: GROWTH GOALS ================= */}
          {currentStep === 3 && (
            <View>
              <View style={styles.headerBox}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Heart size={30} color={palette.accentGreen} />
                </View>
                <Text style={[styles.heading, { color: palette.textPrimary }]}>What Do You Want to Grow In?</Text>
                <Text style={[styles.subheading, { color: palette.textSecondary }]}>
                  Select one or more virtues to guide your daily verses, devotionals, and prayer prompts.
                </Text>
              </View>

              <View style={styles.goalsGrid}>
                {ALL_GOALS.map((g) => {
                  const isSelected = selectedGoals.includes(g.id);
                  return (
                    <TouchableOpacity
                      key={g.id}
                      activeOpacity={0.8}
                      onPress={() => toggleGoal(g.id)}
                      style={[
                        styles.goalPill,
                        {
                          backgroundColor: isSelected ? palette.accentGreen : palette.card,
                          borderColor: isSelected ? palette.accentGreen : palette.border,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 16 }}>{g.icon}</Text>
                      <Text
                        style={[
                          styles.goalLabel,
                          { color: isSelected ? '#FFFFFF' : palette.textPrimary },
                        ]}
                      >
                        {g.label}
                      </Text>
                      {isSelected && <Check size={16} color="#FFFFFF" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* ================= STEP 4: DAILY ROUTINE ================= */}
          {currentStep === 4 && (
            <View>
              <View style={styles.headerBox}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                  <Clock size={30} color="#3B82F6" />
                </View>
                <Text style={[styles.heading, { color: palette.textPrimary }]}>Set Your Daily Rhythm</Text>
                <Text style={[styles.subheading, { color: palette.textSecondary }]}>
                  Consistent small moments with God produce transformative long-term spiritual growth.
                </Text>
              </View>

              {/* Time Commitment */}
              <Text style={[styles.inputLabel, { color: palette.textPrimary }]}>Daily Time Commitment</Text>
              <View style={styles.timeOptionsRow}>
                {TIME_OPTIONS.map((t) => {
                  const isSelected = selectedTime === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      activeOpacity={0.8}
                      onPress={() => {
                        triggerLightHaptic();
                        setSelectedTime(t);
                      }}
                      style={[
                        styles.timeOptionPill,
                        {
                          backgroundColor: isSelected ? palette.accentGreen : palette.card,
                          borderColor: isSelected ? palette.accentGreen : palette.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.timeOptionText,
                          { color: isSelected ? '#FFFFFF' : palette.textPrimary },
                        ]}
                      >
                        {t}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Best Time of Day */}
              <Text style={[styles.inputLabel, { color: palette.textPrimary, marginTop: 20 }]}>
                Best Time for You
              </Text>
              <View style={{ gap: 10, marginTop: 8 }}>
                {TIME_OF_DAY_OPTIONS.map((tod) => {
                  const isSelected = selectedTod === tod.id;
                  return (
                    <TouchableOpacity
                      key={tod.id}
                      activeOpacity={0.8}
                      onPress={() => {
                        triggerLightHaptic();
                        setSelectedTod(tod.id);
                      }}
                      style={[
                        styles.todCard,
                        {
                          backgroundColor: isSelected
                            ? isDark
                              ? 'rgba(5, 150, 105, 0.12)'
                              : 'rgba(5, 150, 105, 0.08)'
                            : palette.card,
                          borderColor: isSelected ? palette.accentGreen : palette.border,
                        },
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.todTitle, { color: palette.textPrimary }]}>{tod.label}</Text>
                        <Text style={[styles.todSub, { color: palette.textSecondary }]}>{tod.sub}</Text>
                      </View>
                      {isSelected && <CheckCircle2 size={20} color={palette.accentGreen} />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Daily Reminder Toggle */}
              <View
                style={[
                  styles.reminderRow,
                  { backgroundColor: palette.card, borderColor: palette.border, marginTop: 24 },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <Bell size={20} color={palette.accentGreen} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.reminderTitle, { color: palette.textPrimary }]}>
                      Daily Gentle Reminders
                    </Text>
                    <Text style={[styles.reminderSub, { color: palette.textSecondary }]}>
                      Receive an uplifting verse notification every day
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    triggerLightHaptic();
                    setEnableReminders(!enableReminders);
                  }}
                  style={[
                    styles.toggleBtn,
                    { backgroundColor: enableReminders ? palette.accentGreen : palette.border },
                  ]}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      { alignSelf: enableReminders ? 'flex-end' : 'flex-start' },
                    ]}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Bottom Action Button */}
          <View style={{ marginTop: 32, marginBottom: 20 }}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleNextStep}
              style={[styles.primaryCtaBtn, { backgroundColor: palette.accentGreen }]}
            >
              <Text style={styles.primaryCtaText}>
                {currentStep < 4 ? 'Continue' : 'Complete Spiritual Setup'}
              </Text>
              <ArrowRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
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
    gap: 2,
    width: 60,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
  },
  stepIndicatorText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  stepTitleHeader: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  subheading: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 48,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInputField: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  stepNumberGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  stepButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  activeStageCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 18,
    marginBottom: 16,
  },
  stageHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  stageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stageBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stageScriptureAnchor: {
    fontSize: 13,
    fontWeight: '700',
  },
  stageTitleText: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 6,
  },
  stageDescText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  ladderTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(156, 163, 175, 0.2)',
    overflow: 'hidden',
    marginBottom: 6,
  },
  ladderFill: {
    height: '100%',
    borderRadius: 3,
  },
  ladderPercent: {
    fontSize: 11,
    fontWeight: '600',
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  goalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  timeOptionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  timeOptionPill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  timeOptionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  todCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  todTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  todSub: {
    fontSize: 12,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  reminderTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  reminderSub: {
    fontSize: 12,
  },
  toggleBtn: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 3,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
  },
  primaryCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryCtaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
