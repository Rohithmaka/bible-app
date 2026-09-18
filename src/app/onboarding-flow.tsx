import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useBibleStore } from '../store/useBibleStore';
import { useSpiritualStore, GrowthGoal, TimeCommitment, TimeOfDay } from '../store/useSpiritualStore';
import { SpiritualTheme } from '../constants/spiritualTheme';
import { CheckCircle2, ChevronLeft, ArrowRight, Sparkles } from 'lucide-react-native';

const ALL_GOALS: { id: GrowthGoal; label: string }[] = [
  { id: 'faith', label: 'Faith' },
  { id: 'prayer', label: 'Prayer' },
  { id: 'wisdom', label: 'Wisdom' },
  { id: 'purpose', label: 'Purpose' },
  { id: 'discipline', label: 'Discipline' },
  { id: 'patience', label: 'Patience' },
  { id: 'forgiveness', label: 'Forgiveness' },
  { id: 'peace', label: 'Peace' },
  { id: 'courage', label: 'Courage' },
  { id: 'love', label: 'Love' },
  { id: 'gratitude', label: 'Gratitude' },
  { id: 'relationships', label: 'Relationships' },
];

const TIME_OPTIONS: TimeCommitment[] = ['5 min', '10 min', '15 min', '30 min', '60 min'];
const TIME_OF_DAY_OPTIONS: { id: TimeOfDay; label: string }[] = [
  { id: 'morning', label: 'Morning (e.g. 7:00 AM)' },
  { id: 'afternoon', label: 'Afternoon (e.g. 12:30 PM)' },
  { id: 'evening', label: 'Evening (e.g. 9:00 PM)' },
];

export default function OnboardingFlowScreen() {
  const router = useRouter();
  const { themeMode } = useBibleStore();
  const { user, setOnboardedPreferences } = useSpiritualStore();

  const isDark = themeMode === 'dark';
  const palette = isDark ? SpiritualTheme.dark : SpiritualTheme.light;

  const [selectedGoals, setSelectedGoals] = useState<GrowthGoal[]>(user.growthGoals);
  const [selectedTime, setSelectedTime] = useState<TimeCommitment>(user.timeCommitment);
  const [selectedTod, setSelectedTod] = useState<TimeOfDay>(user.timeOfDay);

  const toggleGoal = (g: GrowthGoal) => {
    if (selectedGoals.includes(g)) {
      if (selectedGoals.length > 1) {
        setSelectedGoals(selectedGoals.filter((x) => x !== g));
      }
    } else {
      setSelectedGoals([...selectedGoals, g]);
    }
  };

  const handleSave = () => {
    setOnboardedPreferences(selectedGoals, selectedTime, selectedTod);
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      {/* Header */}
      <View style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 14, backgroundColor: palette.card, borderBottomWidth: 1, borderBottomColor: palette.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <ChevronLeft size={22} color={palette.textPrimary} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: palette.textPrimary }}>Back</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 18, fontWeight: '800', color: palette.textPrimary }}>Spiritual Growth Plan</Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Q1: Growth Goals */}
        <Text style={[styles.questionTitle, { color: palette.textPrimary }]}>1. What do you want to grow in?</Text>
        <Text style={[styles.questionSub, { color: palette.textSecondary }]}>Select areas to personalize your daily Scripture & reflections:</Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
          {ALL_GOALS.map((g) => {
            const isSelected = selectedGoals.includes(g.id);
            return (
              <TouchableOpacity
                key={g.id}
                onPress={() => toggleGoal(g.id)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 20,
                  backgroundColor: isSelected ? palette.accentGreen : palette.card,
                  borderWidth: 1,
                  borderColor: isSelected ? palette.accentGreen : palette.cardBorder,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {isSelected && <CheckCircle2 size={16} color="#FFFFFF" />}
                <Text style={{ fontSize: 14, fontWeight: '700', color: isSelected ? '#FFFFFF' : palette.textPrimary }}>
                  {g.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Q2: Time Commitment */}
        <Text style={[styles.questionTitle, { color: palette.textPrimary }]}>2. How much time do you have daily?</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 28 }}>
          {TIME_OPTIONS.map((t) => {
            const isSelected = selectedTime === t;
            return (
              <TouchableOpacity
                key={t}
                onPress={() => setSelectedTime(t)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: isSelected ? palette.accentGold : palette.card,
                  borderWidth: 1,
                  borderColor: isSelected ? palette.accentGold : palette.cardBorder,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: isSelected ? '#FFFFFF' : palette.textPrimary }}>
                  {t}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Q3: Time of Day */}
        <Text style={[styles.questionTitle, { color: palette.textPrimary }]}>3. When do you want to spend time with God?</Text>
        <View style={{ gap: 10, marginBottom: 28 }}>
          {TIME_OF_DAY_OPTIONS.map((tod) => {
            const isSelected = selectedTod === tod.id;
            return (
              <TouchableOpacity
                key={tod.id}
                onPress={() => setSelectedTod(tod.id)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderRadius: 14,
                  backgroundColor: isSelected ? palette.accentGreenLight : palette.card,
                  borderWidth: 1,
                  borderColor: isSelected ? palette.accentGreen : palette.cardBorder,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: '700', color: isSelected ? palette.accentGreen : palette.textPrimary }}>
                  {tod.label}
                </Text>
                {isSelected && <CheckCircle2 size={18} color={palette.accentGreen} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Save CTA */}
        <TouchableOpacity
          onPress={handleSave}
          activeOpacity={0.85}
          style={{ backgroundColor: palette.accentGreen, paddingVertical: 16, borderRadius: 14, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>Save Personalized Routine</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  questionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  questionSub: {
    fontSize: 13,
    marginBottom: 12,
  },
});
