import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useBibleStore } from '../store/useBibleStore';
import { useSpiritualStore } from '../store/useSpiritualStore';
import { SpiritualTheme, ScriptureTypography } from '../constants/spiritualTheme';
import { Sun, ArrowRight, CheckCircle2, X, Sparkles, BookOpen, Heart } from 'lucide-react-native';

export default function MorningJourneyScreen() {
  const router = useRouter();
  const { themeMode } = useBibleStore();
  const { todayScripture, markMorningJourneyComplete } = useSpiritualStore();

  const isDark = themeMode === 'dark';
  const palette = isDark ? SpiritualTheme.dark : SpiritualTheme.light;

  const [step, setStep] = useState<number>(1);
  const todayStr = new Date().toISOString().split('T')[0];

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      markMorningJourneyComplete(todayStr);
      router.back();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      {/* Header */}
      <View style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Sun size={20} color={palette.accentGold} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: palette.textPrimary }}>Morning Journey ({step}/5)</Text>
        </View>

        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <X size={22} color={palette.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Step Indicator Bar */}
      <View style={{ flexDirection: 'row', height: 4, backgroundColor: palette.inputBg, marginHorizontal: 20, borderRadius: 2, marginBottom: 24 }}>
        <View style={{ width: `${(step / 5) * 100}%`, backgroundColor: palette.accentGreen, borderRadius: 2 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        {step === 1 && (
          <View>
            <Text style={[styles.stepHeader, { color: palette.accentGold }]}>Step 1: Read Today's Scripture</Text>
            <Text style={{ fontSize: 24, fontWeight: '800', color: palette.textPrimary, marginBottom: 16 }}>
              {todayScripture.reference}
            </Text>
            <View style={{ backgroundColor: palette.card, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: palette.cardBorder }}>
              <Text
                style={{
                  fontFamily: ScriptureTypography.fontFamilySerif,
                  fontSize: ScriptureTypography.fontSize.lg,
                  lineHeight: ScriptureTypography.fontSize.lg * ScriptureTypography.lineHeightRatio,
                  color: palette.textPrimary,
                  fontStyle: 'italic',
                }}
              >
                "{todayScripture.verseText}"
              </Text>
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={[styles.stepHeader, { color: palette.accentGreen }]}>Step 2: Understand</Text>
            <Text style={{ fontSize: 24, fontWeight: '800', color: palette.textPrimary, marginBottom: 16 }}>
              Scriptural Context
            </Text>
            <View style={{ backgroundColor: palette.card, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: palette.cardBorder }}>
              <Text style={{ fontSize: 17, lineHeight: 26, color: palette.textPrimary }}>
                {todayScripture.understand}
              </Text>
            </View>
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={[styles.stepHeader, { color: palette.accentGold }]}>Step 3: Reflect</Text>
            <Text style={{ fontSize: 24, fontWeight: '800', color: palette.textPrimary, marginBottom: 16 }}>
              Heart Inquiry
            </Text>
            <View style={{ backgroundColor: palette.card, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: palette.cardBorder }}>
              <Text style={{ fontSize: 19, fontWeight: '600', lineHeight: 28, color: palette.textPrimary, fontStyle: 'italic' }}>
                "{todayScripture.reflectQuestion}"
              </Text>
            </View>
          </View>
        )}

        {step === 4 && (
          <View>
            <Text style={[styles.stepHeader, { color: palette.accentGreen }]}>Step 4: Guided Prayer</Text>
            <Text style={{ fontSize: 24, fontWeight: '800', color: palette.textPrimary, marginBottom: 16 }}>
              Praying the Word
            </Text>
            <View style={{ backgroundColor: palette.card, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: palette.cardBorder }}>
              <Text style={{ fontSize: 17, lineHeight: 26, color: palette.textSecondary }}>
                {todayScripture.guidedPrayer}
              </Text>
            </View>
          </View>
        )}

        {step === 5 && (
          <View style={{ alignItems: 'center', paddingTop: 20 }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: palette.accentGreenLight, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <CheckCircle2 size={40} color={palette.accentGreen} />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '800', color: palette.textPrimary, textAlign: 'center', marginBottom: 10 }}>
              Carry God's Word With You Today
            </Text>
            <Text style={{ fontSize: 16, color: palette.textSecondary, textAlign: 'center', lineHeight: 24, marginBottom: 24 }}>
              Today's Practical Intention:{"\n"}"{todayScripture.practicalApplication}"
            </Text>
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
            {step === 5 ? 'Complete Morning Journey' : 'Continue'}
          </Text>
          <ArrowRight size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stepHeader: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
});
