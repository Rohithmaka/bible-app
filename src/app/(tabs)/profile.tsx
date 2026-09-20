import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useBibleStore } from '../../store/useBibleStore';
import { useSpiritualStore } from '../../store/useSpiritualStore';
import { SpiritualTheme } from '../../constants/spiritualTheme';
import { triggerLightHaptic } from '../../services/mobileHaptics';
import { User, BookOpen, Heart, Sparkles, Bookmark, Highlighter, Brain, Settings, Moon, Sun, Bell, ChevronRight, Edit2, X, Check } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { themeMode, setThemeMode, bookmarks, highlights, notes } = useBibleStore();
  const { user, updateUserProfile, privatePrayers, communityPrayers, bibleStudies, memoryVerses, storiesOfFaith } = useSpiritualStore();

  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [editedName, setEditedName] = useState(user.displayName);

  const isDark = themeMode === 'dark';
  const palette = isDark ? SpiritualTheme.dark : SpiritualTheme.light;

  const answeredPrayers = privatePrayers.filter((p) => p.status === 'answered');

  const handleSaveName = () => {
    if (editedName.trim()) {
      updateUserProfile({ displayName: editedName.trim() });
      triggerLightHaptic();
    }
    setIsNameModalOpen(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }} edges={['top', 'left', 'right']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 16, paddingHorizontal: 16, paddingBottom: 40, maxWidth: 500, width: '100%', alignSelf: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        {/* User Header */}
        <View style={{ alignItems: 'center', marginBottom: 24, paddingHorizontal: 8 }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setEditedName(user.displayName);
              setIsNameModalOpen(true);
              triggerLightHaptic();
            }}
            style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: palette.accentGreen, alignItems: 'center', justifyContent: 'center', marginBottom: 12, elevation: 4, shadowColor: palette.accentGreen, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
          >
            <User size={38} color="#FFFFFF" />
            <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: palette.accentGold, borderRadius: 10, padding: 4, borderWidth: 2, borderColor: palette.background }}>
              <Edit2 size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setEditedName(user.displayName);
              setIsNameModalOpen(true);
              triggerLightHaptic();
            }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
          >
            <Text style={{ fontSize: 22, fontWeight: '800', color: palette.textPrimary, textAlign: 'center', flexShrink: 1 }}>
              {user.displayName}
            </Text>
            <Edit2 size={14} color={palette.accentGreen} />
          </TouchableOpacity>

          <Text style={{ fontSize: 13, color: palette.textSecondary, marginTop: 4, textAlign: 'center', flexWrap: 'wrap', paddingHorizontal: 16 }}>
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

      {/* EDIT NAME MODAL - OPTIMIZED FOR MOBILE SCREENS */}
      <Modal visible={isNameModalOpen} animationType="fade" transparent>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}
          activeOpacity={1}
          onPress={() => setIsNameModalOpen(false)}
        >
          <View
            style={{
              backgroundColor: palette.card,
              borderRadius: 20,
              padding: 24,
              width: '100%',
              maxWidth: 400,
              borderWidth: 1,
              borderColor: palette.cardBorder,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 15,
              elevation: 8,
            }}
            onStartShouldSetResponder={() => true}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: palette.textPrimary }}>Update Display Name</Text>
              <TouchableOpacity onPress={() => setIsNameModalOpen(false)}>
                <X size={20} color={palette.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: palette.textSecondary, marginBottom: 12 }}>
              Enter your preferred name to personalize your prayer requests and reading progress.
            </Text>

            <TextInput
              style={{
                backgroundColor: palette.inputBg,
                color: palette.textPrimary,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                borderWidth: 1,
                borderColor: palette.border,
                marginBottom: 20,
              }}
              value={editedName}
              onChangeText={setEditedName}
              placeholder="Your Name"
              placeholderTextColor={palette.textMuted}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSaveName}
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setIsNameModalOpen(false)}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: palette.border, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 15, fontWeight: '600', color: palette.textSecondary }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveName}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: palette.accentGreen, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
              >
                <Check size={18} color="#FFFFFF" />
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>Save Name</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
