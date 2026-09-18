import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useBibleStore } from '../store/useBibleStore';
import { useSpiritualStore } from '../store/useSpiritualStore';
import { SpiritualTheme } from '../constants/spiritualTheme';
import { Heart, X, CheckCircle2, Clock } from 'lucide-react-native';

export default function PrayNowScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const { themeMode } = useBibleStore();
  const { communityPrayers } = useSpiritualStore();

  const isDark = themeMode === 'dark';
  const palette = isDark ? SpiritualTheme.dark : SpiritualTheme.light;

  const prayerId = searchParams.id as string;
  const targetPrayer = communityPrayers.find((p) => p.id === prayerId) || {
    authorName: 'Believer',
    isAnonymous: false,
    title: 'Prayer for Peace & Guidance',
    burdenText: 'Lord, bring comfort, guidance, and breakthrough in this situation. Strengthen hearts and grant faith.',
    category: 'General',
  };

  const [seconds, setSeconds] = useState<number>(0);
  const [isDone, setIsDone] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remainingSecs = sec % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const handleComplete = () => {
    setIsDone(true);
    setTimeout(() => {
      router.back();
    }, 1200);
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.background, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40, justifyContent: 'space-between' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Heart size={20} color={palette.accentGold} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: palette.textPrimary }}>Focused Prayer Space</Text>
        </View>

        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <X size={22} color={palette.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Main Burden Body */}
      <View style={{ flex: 1, justifyContent: 'center', marginVertical: 20 }}>
        {isDone ? (
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: palette.accentGreenLight, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <CheckCircle2 size={48} color={palette.accentGreen} />
            </View>
            <Text style={{ fontSize: 24, fontWeight: '800', color: palette.textPrimary, textAlign: 'center' }}>
              Prayer Completed 🙏
            </Text>
            <Text style={{ fontSize: 15, color: palette.textSecondary, marginTop: 8, textAlign: 'center' }}>
              Thank you for carrying this burden before God's throne.
            </Text>
          </View>
        ) : (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, justifyContent: 'center' }}>
              <Clock size={16} color={palette.accentGold} />
              <Text style={{ fontSize: 14, fontWeight: '700', color: palette.accentGold }}>
                Prayer Time: {formatTimer(seconds)}
              </Text>
            </View>

            <View style={{ backgroundColor: palette.card, borderRadius: 24, borderWidth: 1, borderColor: palette.cardBorder, padding: 24, elevation: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: palette.accentGreen, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                Praying For: {targetPrayer.isAnonymous ? 'Anonymous Believer' : targetPrayer.authorName}
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '800', color: palette.textPrimary, marginBottom: 12 }}>
                {targetPrayer.title}
              </Text>
              <Text style={{ fontSize: 16, lineHeight: 25, color: palette.textSecondary, marginBottom: 20 }}>
                "{targetPrayer.burdenText}"
              </Text>

              <View style={{ backgroundColor: palette.accentGreenLight, borderRadius: 12, padding: 14, borderLeftWidth: 3, borderLeftColor: palette.accentGreen }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: palette.accentGreen, textTransform: 'uppercase', marginBottom: 4 }}>
                  Guided Focus:
                </Text>
                <Text style={{ fontSize: 14, color: palette.textPrimary, fontStyle: 'italic' }}>
                  "Lord, grant strength, peace, and wisdom. Surround them with Your presence and let Your will be done."
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Completion Button */}
      {!isDone && (
        <TouchableOpacity
          onPress={handleComplete}
          activeOpacity={0.85}
          style={{ backgroundColor: palette.accentGreen, paddingVertical: 18, borderRadius: 16, alignItems: 'center', justifyContent: 'center', elevation: 4 }}
        >
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#FFFFFF' }}>
            PRAYER COMPLETED 🙏
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
