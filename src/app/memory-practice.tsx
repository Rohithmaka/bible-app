import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useBibleStore } from '../store/useBibleStore';
import { useSpiritualStore, MemoryVerse } from '../store/useSpiritualStore';
import { SpiritualTheme, ScriptureTypography } from '../constants/spiritualTheme';
import { Brain, ChevronLeft, Eye, EyeOff, CheckCircle2, RotateCcw } from 'lucide-react-native';

export default function MemoryPracticeScreen() {
  const router = useRouter();
  const { themeMode } = useBibleStore();
  const { memoryVerses, updateMemoryStatus } = useSpiritualStore();

  const isDark = themeMode === 'dark';
  const palette = isDark ? SpiritualTheme.dark : SpiritualTheme.light;

  const [hiddenVerses, setHiddenVerses] = useState<Record<string, boolean>>({});

  const toggleHide = (id: string) => {
    setHiddenVerses((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const maskText = (text: string) => {
    const words = text.split(' ');
    return words.map((w, idx) => (idx % 2 === 1 ? '____' : w)).join(' ');
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      {/* Header */}
      <View style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 14, backgroundColor: palette.card, borderBottomWidth: 1, borderBottomColor: palette.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <ChevronLeft size={22} color={palette.textPrimary} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: palette.textPrimary }}>Back</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 18, fontWeight: '800', color: palette.textPrimary }}>Scripture Memory</Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}>
        {memoryVerses.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Brain size={44} color={palette.textMuted} />
            <Text style={{ fontSize: 16, fontWeight: '700', color: palette.textPrimary, marginTop: 14 }}>
              No Memory Verses Yet
            </Text>
            <Text style={{ fontSize: 13, color: palette.textSecondary, textAlign: 'center', marginTop: 4 }}>
              When reading the Bible, select any verse and tap "Memory" to add it to your practice list!
            </Text>
          </View>
        ) : (
          memoryVerses.map((mv) => {
            const isHidden = !!hiddenVerses[mv.id];

            return (
              <View key={mv.id} style={{ backgroundColor: palette.card, borderRadius: 20, borderWidth: 1, borderColor: palette.cardBorder, padding: 20, marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: palette.accentGreen }}>
                    {mv.bookName} {mv.chapter}:{mv.verse}
                  </Text>

                  <View style={{ backgroundColor: palette.accentGoldLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: palette.accentGold, textTransform: 'uppercase' }}>
                      {mv.status}
                    </Text>
                  </View>
                </View>

                <Text
                  style={{
                    fontFamily: ScriptureTypography.fontFamilySerif,
                    fontSize: 17,
                    lineHeight: 26,
                    color: palette.textPrimary,
                    marginBottom: 16,
                  }}
                >
                  {isHidden ? maskText(mv.text) : mv.text}
                </Text>

                {/* Practice Controls */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: palette.border }}>
                  <TouchableOpacity
                    onPress={() => toggleHide(mv.id)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: palette.inputBg, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
                  >
                    {isHidden ? <Eye size={16} color={palette.textPrimary} /> : <EyeOff size={16} color={palette.textPrimary} />}
                    <Text style={{ fontSize: 13, fontWeight: '600', color: palette.textPrimary }}>
                      {isHidden ? 'Reveal Words' : 'Hide Words'}
                    </Text>
                  </TouchableOpacity>

                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity
                      onPress={() => updateMemoryStatus(mv.id, 'reviewing')}
                      style={{ backgroundColor: palette.accentGoldLight, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: palette.accentGold }}>Reviewing</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => updateMemoryStatus(mv.id, 'memorized')}
                      style={{ backgroundColor: palette.accentGreen, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFFFFF' }}>Memorized ✓</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
