import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useBibleStore } from '../../store/useBibleStore';
import { useSpiritualStore } from '../../store/useSpiritualStore';
import { SpiritualTheme } from '../../constants/spiritualTheme';
import { triggerLightHaptic } from '../../services/mobileHaptics';
import { User, BookOpen, Heart, Sparkles, Bookmark, Highlighter, Brain, Settings, Moon, Sun, Bell, ChevronRight } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { themeMode, setThemeMode, bookmarks, highlights, notes } = useBibleStore();
  const { user, updateUserProfile, privatePrayers, communityPrayers, bibleStudies, memoryVerses, storiesOfFaith } = useSpiritualStore();

  const isDark = themeMode === 'dark';
  const palette = isDark ? SpiritualTheme.dark : SpiritualTheme.light;

  const answeredPrayers = privatePrayers.filter((p) => p.status === 'answered');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }} edges={['top', 'left', 'right']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Header */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: palette.accentGreen, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <User size={36} color="#FFFFFF" />
          </View>
          <Text style={{ fontSize: 22, fontWeight: '800', color: palette.textPrimary }}>
            {user.displayName}
          </Text>
          <Text style={{ fontSize: 13, color: palette.textSecondary, marginTop: 2 }}>
            Growing in {user.growthGoals.slice(0, 2).join(' & ')} • {user.timeCommitment} daily
          </Text>
        </View>

        {/* 1. MY BIBLE SECTION */}
        <Text style={[styles.sectionHeader, { color: palette.textPrimary }]}>My Bible & Study Tools</Text>
        <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
          <TouchableOpacity onPress={() => { triggerLightHaptic(); router.push('/library'); }} style={styles.menuRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Sparkles size={18} color={palette.accentGreen} />
              <Text style={[styles.menuText, { color: palette.textPrimary }]}>Structured Bible Studies</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 13, color: palette.accentGreen, fontWeight: '700' }}>{bibleStudies.length}</Text>
              <ChevronRight size={16} color={palette.textMuted} />
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: palette.border }]} />

          <TouchableOpacity onPress={() => { triggerLightHaptic(); router.push('/library'); }} style={styles.menuRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Bookmark size={18} color={palette.accentGold} />
              <Text style={[styles.menuText, { color: palette.textPrimary }]}>Bookmarks & Saved Verses</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 13, color: palette.textSecondary, fontWeight: '600' }}>{bookmarks.length}</Text>
              <ChevronRight size={16} color={palette.textMuted} />
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: palette.border }]} />

          <TouchableOpacity onPress={() => { triggerLightHaptic(); router.push('/library'); }} style={styles.menuRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Highlighter size={18} color={palette.accentGreen} />
              <Text style={[styles.menuText, { color: palette.textPrimary }]}>Color Highlights</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 13, color: palette.textSecondary, fontWeight: '600' }}>{Object.keys(highlights).length}</Text>
              <ChevronRight size={16} color={palette.textMuted} />
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: palette.border }]} />

          <TouchableOpacity onPress={() => { triggerLightHaptic(); router.push('/library'); }} style={styles.menuRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <BookOpen size={18} color={palette.textPrimary} />
              <Text style={[styles.menuText, { color: palette.textPrimary }]}>Verse Study Notes</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 13, color: palette.textSecondary, fontWeight: '600' }}>{Object.keys(notes).length}</Text>
              <ChevronRight size={16} color={palette.textMuted} />
            </View>
          </TouchableOpacity>
        </View>

        {/* 2. MY SPIRITUAL JOURNEY */}
        <Text style={[styles.sectionHeader, { color: palette.textPrimary }]}>My Spiritual Journey</Text>
        <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
          <View style={styles.menuRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Heart size={18} color={palette.accentGold} />
              <Text style={[styles.menuText, { color: palette.textPrimary }]}>Answered Prayers Log</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '700', color: palette.accentGold }}>{answeredPrayers.length} Answered</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: palette.border }]} />

          <TouchableOpacity onPress={() => { triggerLightHaptic(); router.push('/memory-practice' as any); }} style={styles.menuRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Brain size={18} color={palette.accentGreen} />
              <Text style={[styles.menuText, { color: palette.textPrimary }]}>Scripture Memory Verses</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 13, color: palette.textSecondary, fontWeight: '600' }}>{memoryVerses.length}</Text>
              <ChevronRight size={16} color={palette.textMuted} />
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: palette.border }]} />

          <TouchableOpacity onPress={() => { triggerLightHaptic(); router.push('/stories' as any); }} style={styles.menuRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Sparkles size={18} color={palette.accentGreen} />
              <Text style={[styles.menuText, { color: palette.textPrimary }]}>Stories of Faith / Testimonies</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 13, color: palette.textSecondary, fontWeight: '600' }}>{storiesOfFaith.length}</Text>
              <ChevronRight size={16} color={palette.textMuted} />
            </View>
          </TouchableOpacity>
        </View>

        {/* 3. SETTINGS & APP PREFERENCES */}
        <Text style={[styles.sectionHeader, { color: palette.textPrimary }]}>Settings & Preferences</Text>
        <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
          <View style={styles.menuRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {isDark ? <Moon size={18} color={palette.accentGold} /> : <Sun size={18} color={palette.accentGold} />}
              <Text style={[styles.menuText, { color: palette.textPrimary }]}>Dark Appearance</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={(val) => {
                triggerLightHaptic();
                setThemeMode(val ? 'dark' : 'light');
              }}
              trackColor={{ false: palette.inputBg, true: palette.accentGreen }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: palette.border }]} />

          <View style={styles.menuRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Bell size={18} color={palette.accentGreen} />
              <Text style={[styles.menuText, { color: palette.textPrimary }]}>Daily Notifications ({user.notificationTime})</Text>
            </View>
            <Switch
              value={user.notificationsEnabled}
              onValueChange={(val) => {
                triggerLightHaptic();
                updateUserProfile({ notificationsEnabled: val });
              }}
              trackColor={{ false: palette.inputBg, true: palette.accentGreen }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: palette.border }]} />

          <TouchableOpacity onPress={() => { triggerLightHaptic(); router.push('/onboarding-flow' as any); }} style={styles.menuRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Settings size={18} color={palette.textPrimary} />
              <Text style={[styles.menuText, { color: palette.textPrimary }]}>Update Growth Goals & Schedule</Text>
            </View>
            <ChevronRight size={16} color={palette.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 12, color: palette.textMuted, textAlign: 'center', marginTop: 24 }}>
          Holy Bible & Daily Spiritual Growth App • Version 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 10,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '100%',
  },
});
