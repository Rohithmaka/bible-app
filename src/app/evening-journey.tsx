import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useBibleStore } from '../store/useBibleStore';
import { useSpiritualStore } from '../store/useSpiritualStore';
import { SpiritualTheme } from '../constants/spiritualTheme';
import { Moon, ArrowRight, CheckCircle2, X } from 'lucide-react-native';

export default function EveningJourneyScreen() {
  const router = useRouter();
  const { themeMode } = useBibleStore();
  const { markEveningJourneyComplete } = useSpiritualStore();

  const isDark = themeMode === 'dark';
  const palette = isDark ? SpiritualTheme.dark : SpiritualTheme.light;

  const [step, setStep] = useState<number>(1);
  const [gratitude, setGratitude] = useState('');
  const [goodness, setGoodness] = useState('');
  const [struggles, setStruggles] = useState('');
  const [surrender, setSurrender] = useState('');
  const [eveningPrayer, setEveningPrayer] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      markEveningJourneyComplete(todayStr);
      router.back();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      {/* Header */}
      <View style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Moon size={20} color={palette.accentGreen} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: palette.textPrimary }}>Evening Reflection ({step}/5)</Text>
        </View>

        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <X size={22} color={palette.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Progress Line */}
      <View style={{ flexDirection: 'row', height: 4, backgroundColor: palette.inputBg, marginHorizontal: 20, borderRadius: 2, marginBottom: 24 }}>
        <View style={{ width: `${(step / 5) * 100}%`, backgroundColor: palette.accentGreen, borderRadius: 2 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        {step === 1 && (
          <View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: palette.accentGold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Step 1: Gratitude</Text>
            <Text style={{ fontSize: 22, fontWeight: '800', color: palette.textPrimary, marginBottom: 12 }}>What are you thankful for today?</Text>
            <TextInput
              placeholder="e.g. Grateful for family health, a quiet lunch, and peace during work..."
              placeholderTextColor={palette.textMuted}
              value={gratitude}
              onChangeText={setGratitude}
              multiline
              numberOfLines={4}
              style={[styles.input, { backgroundColor: palette.card, color: palette.textPrimary, borderColor: palette.cardBorder }]}
            />
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: palette.accentGreen, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Step 2: God's Goodness</Text>
            <Text style={{ fontSize: 22, fontWeight: '800', color: palette.textPrimary, marginBottom: 12 }}>Where did you see God's grace today?</Text>
            <TextInput
              placeholder="e.g. Saw His patience during a difficult conversation with a colleague..."
              placeholderTextColor={palette.textMuted}
              value={goodness}
              onChangeText={setGoodness}
              multiline
              numberOfLines={4}
              style={[styles.input, { backgroundColor: palette.card, color: palette.textPrimary, borderColor: palette.cardBorder }]}
            />
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: palette.accentGold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Step 3: Review & Struggle</Text>
            <Text style={{ fontSize: 22, fontWeight: '800', color: palette.textPrimary, marginBottom: 12 }}>Where did you struggle or feel tested today?</Text>
            <TextInput
              placeholder="e.g. Felt anxious about upcoming deadlines and lost patience..."
              placeholderTextColor={palette.textMuted}
              value={struggles}
              onChangeText={setStruggles}
              multiline
              numberOfLines={4}
              style={[styles.input, { backgroundColor: palette.card, color: palette.textPrimary, borderColor: palette.cardBorder }]}
            />
          </View>
        )}

        {step === 4 && (
          <View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: palette.accentGreen, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Step 4: Surrender</Text>
            <Text style={{ fontSize: 22, fontWeight: '800', color: palette.textPrimary, marginBottom: 12 }}>What burden do you choose to surrender before sleep?</Text>
            <TextInput
              placeholder="e.g. I release my need to control tomorrow's outcome into God's hands..."
              placeholderTextColor={palette.textMuted}
              value={surrender}
              onChangeText={setSurrender}
              multiline
              numberOfLines={4}
              style={[styles.input, { backgroundColor: palette.card, color: palette.textPrimary, borderColor: palette.cardBorder }]}
            />
          </View>
        )}

        {step === 5 && (
          <View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: palette.accentGold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Step 5: Evening Prayer</Text>
            <Text style={{ fontSize: 22, fontWeight: '800', color: palette.textPrimary, marginBottom: 12 }}>Resting in God's Peace</Text>
            <View style={{ backgroundColor: palette.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: palette.cardBorder, marginBottom: 16 }}>
              <Text style={{ fontSize: 16, lineHeight: 24, color: palette.textSecondary }}>
                "Father, into Your hands I commit my night. Thank You for Your protection and grace today. Forgive my shortcomings, refresh my soul, and grant me restful sleep under Your care. Amen."
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer CTA */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 36 }}>
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.85}
          style={{ backgroundColor: palette.accentGreen, paddingVertical: 16, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>
            {step === 5 ? 'Complete Evening Reflection' : 'Continue'}
          </Text>
          <ArrowRight size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    height: 120,
    textAlignVertical: 'top',
  },
});
