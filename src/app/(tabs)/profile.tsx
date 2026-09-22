import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, Modal, TextInput, Image, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useBibleStore } from '../../store/useBibleStore';
import { useSpiritualStore } from '../../store/useSpiritualStore';
import { useReminderStore } from '../../store/useReminderStore';
import {
  openDeviceNotificationSettings,
  sendInstantTestNotification,
  formatRepeatSummary,
} from '../../services/reminderNotificationService';
import { SpiritualTheme } from '../../constants/spiritualTheme';
import { triggerLightHaptic, triggerSuccessHaptic } from '../../services/mobileHaptics';
import {
  User,
  BookOpen,
  Heart,
  Sparkles,
  Bookmark,
  Highlighter,
  Brain,
  Settings,
  Moon,
  Sun,
  Bell,
  ChevronRight,
  Edit2,
  X,
  Check,
  Compass,
  MapPin,
  Mail,
  ArrowRight,
  Zap,
  Clock,
  Volume2,
  Smartphone,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  LogOut,
  Trash2,
} from 'lucide-react-native';
import { signOutUser } from '../../services/authService';

export default function ProfileScreen() {
  const router = useRouter();
  const { themeMode, setThemeMode, bookmarks, highlights, notes } = useBibleStore();
  const { user, updateUserProfile, todayScripture, privatePrayers, communityPrayers, bibleStudies, memoryVerses, storiesOfFaith } = useSpiritualStore();

  const {
    reminders,
    masterEnabled,
    setMasterEnabled,
    devicePermissionStatus,
    checkDevicePermissions,
    requestDevicePermissions,
    toggleReminderEnabled,
  } = useReminderStore();

  useEffect(() => {
    checkDevicePermissions();
  }, []);

  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [editedName, setEditedName] = useState(user.displayName);
  const [testNotificationFeedback, setTestNotificationFeedback] = useState<string | null>(null);

  const prayerReminders = reminders.filter((r) => r.type === 'prayer');
  const bibleReminders = reminders.filter((r) => r.type === 'bible_reading');
  const activePrayerCount = prayerReminders.filter((r) => r.enabled).length;
  const activeBibleCount = bibleReminders.filter((r) => r.enabled).length;

  const handleTriggerTest = async (reminder: any) => {
    triggerLightHaptic();
    await sendInstantTestNotification(reminder);
    setTestNotificationFeedback(`⚡ Preview sent: "${reminder.title}"!`);
    setTimeout(() => {
      setTestNotificationFeedback(null);
    }, 3500);
  };

  const isDark = themeMode === 'dark';
  const palette = isDark ? SpiritualTheme.dark : SpiritualTheme.light;

  const answeredPrayers = privatePrayers.filter((p) => p.status === 'answered');
  const stageNumber = user.spiritualStage || 5;
  const stageTitle = user.spiritualStageTitle || 'Growing Disciple';

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
        {/* SELA Brand Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 18, backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(5, 150, 105, 0.06)', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(5, 150, 105, 0.12)' }}>
          <Image
            source={require('../../../assets/images/sela_logo.png')}
            style={{ width: 36, height: 36, borderRadius: 10 }}
            resizeMode="cover"
          />
          <View>
            <Text style={{ fontSize: 16, fontWeight: '900', color: palette.textPrimary, letterSpacing: 2 }}>
              SELA
            </Text>
            <Text style={{ fontSize: 9, fontWeight: '700', color: palette.accentGreen, letterSpacing: 0.8, textTransform: 'uppercase' }}>
              PAUSE • PRAY • GROW • BELONG
            </Text>
          </View>
        </View>

        {/* User Header */}
        <View style={{ alignItems: 'center', marginBottom: 20, paddingHorizontal: 8 }}>
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

          {/* Demographic Subtitle: Age & Location & Email */}
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 4 }}>
            {user.age ? (
              <Text style={{ fontSize: 13, color: palette.textSecondary, fontWeight: '600' }}>
                {user.age} yrs
              </Text>
            ) : null}
            {user.age && user.location ? <Text style={{ color: palette.textMuted }}>•</Text> : null}
            {user.location ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <MapPin size={12} color={palette.textSecondary} />
                <Text style={{ fontSize: 13, color: palette.textSecondary, fontWeight: '600' }}>
                  {user.location}
                </Text>
              </View>
            ) : null}
          </View>

          {user.email ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
              <Mail size={12} color={palette.textMuted} />
              <Text style={{ fontSize: 12, color: palette.textMuted }}>{user.email}</Text>
            </View>
          ) : null}
        </View>

        {/* SPIRITUAL JOURNEY STAGE CARD */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? 'rgba(217, 119, 6, 0.08)' : 'rgba(217, 119, 6, 0.06)',
              borderColor: palette.accentGold,
              paddingVertical: 16,
              marginBottom: 16,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Compass size={18} color={palette.accentGold} />
              <Text style={{ fontSize: 14, fontWeight: '800', color: palette.accentGold, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Spiritual Journey Stage
              </Text>
            </View>
            <View style={{ backgroundColor: palette.accentGold, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#FFFFFF' }}>
                Step {stageNumber} / 10
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 18, fontWeight: '800', color: palette.textPrimary, marginBottom: 4 }}>
            {stageTitle}
          </Text>

          <Text style={{ fontSize: 13, color: palette.textSecondary, marginBottom: 12 }}>
            Growing in {user.growthGoals.slice(0, 3).join(', ')} • {user.timeCommitment} daily
          </Text>

          {/* Progress Bar */}
          <View style={{ height: 6, backgroundColor: 'rgba(156, 163, 175, 0.2)', borderRadius: 3, overflow: 'hidden', marginBottom: 14 }}>
            <View style={{ height: '100%', width: `${(stageNumber / 10) * 100}%`, backgroundColor: palette.accentGold, borderRadius: 3 }} />
          </View>

          <TouchableOpacity
            onPress={() => {
              triggerLightHaptic();
              router.push('/onboarding-flow' as any);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: 'rgba(217, 119, 6, 0.15)',
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: palette.accentGold }}>
              Update Spiritual Stage & Routine
            </Text>
            <ArrowRight size={14} color={palette.accentGold} />
          </TouchableOpacity>
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

          {/* Section 14: DEVICE NOTIFICATIONS PERMISSION STATUS */}
          <View style={{ paddingVertical: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Smartphone size={16} color={devicePermissionStatus === 'granted' ? '#10B981' : '#EF4444'} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: palette.textPrimary }}>
                  Device Notifications
                </Text>
              </View>
              <View style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 8,
                backgroundColor: devicePermissionStatus === 'granted' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              }}>
                <Text style={{
                  fontSize: 12,
                  fontWeight: '700',
                  color: devicePermissionStatus === 'granted' ? '#10B981' : '#EF4444',
                }}>
                  {devicePermissionStatus === 'granted' ? '✓ Allowed' : '⚠ Not Allowed'}
                </Text>
              </View>
            </View>

            {devicePermissionStatus !== 'granted' ? (
              <View style={{
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                borderRadius: 10,
                padding: 10,
                marginTop: 6,
                borderWidth: 1,
                borderColor: 'rgba(239, 68, 68, 0.25)',
              }}>
                <Text style={{ fontSize: 12, color: '#DC2626', marginBottom: 8, lineHeight: 17 }}>
                  Your reminders cannot be delivered because notification permissions are turned off on your Android device.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={async () => {
                    triggerLightHaptic();
                    const granted = await requestDevicePermissions();
                    if (!granted) {
                      openDeviceNotificationSettings();
                    }
                  }}
                  style={{
                    backgroundColor: '#EF4444',
                    paddingVertical: 8,
                    borderRadius: 8,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>
                    Enable Device Notifications
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  triggerLightHaptic();
                  openDeviceNotificationSettings();
                }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}
              >
                <Text style={{ fontSize: 12, color: palette.accentGreen, fontWeight: '600' }}>
                  Manage Android App Notification Settings →
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.divider, { backgroundColor: palette.border }]} />

          {/* Master Switch for Spiritual Reminders */}
          <View style={styles.menuRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, paddingRight: 8 }}>
              <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(5, 150, 105, 0.12)', justifyContent: 'center', alignItems: 'center' }}>
                <Bell size={18} color={palette.accentGreen} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuText, { color: palette.textPrimary }]}>Daily Spiritual Reminders</Text>
                <Text style={{ fontSize: 11, color: palette.textMuted }}>
                  {masterEnabled ? 'Scheduled & active on this device' : 'All reminders paused'}
                </Text>
              </View>
            </View>
            <Switch
              value={masterEnabled}
              onValueChange={(val) => {
                triggerLightHaptic();
                setMasterEnabled(val);
              }}
              trackColor={{ false: palette.inputBg, true: palette.accentGreen }}
            />
          </View>

          {/* Fully Customizable Reminders Hub Card */}
          {masterEnabled ? (
            <View style={{
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: 14,
              padding: 14,
              marginBottom: 12,
              borderWidth: 1,
              borderColor: palette.border,
            }}>
              {/* Counts & Status Summary */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: palette.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Active Reminders
                </Text>
                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.accentGold }}>
                  🙏 {activePrayerCount} Prayer • 📖 {activeBibleCount} Bible
                </Text>
              </View>

              {/* Primary Call to Action: Open Full Reminder Center */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  triggerLightHaptic();
                  router.push('/reminders');
                }}
                style={{
                  backgroundColor: isDark ? 'rgba(217, 119, 6, 0.15)' : 'rgba(217, 119, 6, 0.1)',
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(217, 119, 6, 0.4)' : 'rgba(217, 119, 6, 0.25)',
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, paddingRight: 8 }}>
                  <Sparkles size={18} color="#D97706" />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#D97706' }}>
                      Customize & Manage Reminders
                    </Text>
                    <Text style={{ fontSize: 11, color: palette.textSecondary, marginTop: 1 }}>
                      Add, edit, duplicate, set repeat days & custom messages
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color="#D97706" />
              </TouchableOpacity>

              {/* Quick List Preview of Top Reminders */}
              <View style={{ gap: 8 }}>
                {reminders.slice(0, 5).map((reminder) => (
                  <View
                    key={reminder.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: palette.card,
                      borderRadius: 10,
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      borderWidth: 1,
                      borderColor: palette.border,
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => {
                        triggerLightHaptic();
                        router.push('/reminders');
                      }}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, paddingRight: 8 }}
                    >
                      <Text style={{ fontSize: 16 }}>{reminder.type === 'prayer' ? '🙏' : '📖'}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: palette.textPrimary }} numberOfLines={1}>
                          {reminder.title}
                        </Text>
                        <Text style={{ fontSize: 11, color: palette.accentGreen, fontWeight: '600' }}>
                          🕒 {reminder.time} • {formatRepeatSummary(reminder.repeat_type, reminder.selected_days)}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handleTriggerTest(reminder)}
                        style={{
                          paddingHorizontal: 7,
                          paddingVertical: 3,
                          borderRadius: 6,
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                        }}
                      >
                        <Text style={{ fontSize: 10, fontWeight: '700', color: palette.textSecondary }}>Test</Text>
                      </TouchableOpacity>

                      <Switch
                        value={reminder.enabled}
                        onValueChange={() => {
                          triggerLightHaptic();
                          toggleReminderEnabled(reminder.id);
                        }}
                        trackColor={{ false: palette.inputBg, true: palette.accentGreen }}
                        style={{ transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] }}
                      />
                    </View>
                  </View>
                ))}
              </View>

              {/* Quick Add Buttons */}
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    triggerLightHaptic();
                    router.push({ pathname: '/reminders', params: { action: 'add', type: 'prayer' } });
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
                    borderRadius: 8,
                    paddingVertical: 7,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(245, 158, 11, 0.3)',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#F59E0B' }}>+ Prayer Reminder</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    triggerLightHaptic();
                    router.push({ pathname: '/reminders', params: { action: 'add', type: 'bible' } });
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: isDark ? 'rgba(37, 99, 235, 0.15)' : 'rgba(37, 99, 235, 0.1)',
                    borderRadius: 8,
                    paddingVertical: 7,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(37, 99, 235, 0.3)',
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#2563EB' }}>+ Bible Reminder</Text>
                </TouchableOpacity>
              </View>

              {testNotificationFeedback ? (
                <View style={{ marginTop: 10, padding: 8, backgroundColor: 'rgba(5, 150, 105, 0.15)', borderRadius: 8 }}>
                  <Text style={{ fontSize: 11, color: palette.accentGreen, fontWeight: '600', textAlign: 'center' }}>
                    {testNotificationFeedback}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          <View style={[styles.divider, { backgroundColor: palette.border }]} />

          <TouchableOpacity onPress={() => { triggerLightHaptic(); router.push('/onboarding-flow' as any); }} style={styles.menuRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Settings size={18} color={palette.textPrimary} />
              <View>
                <Text style={[styles.menuText, { color: palette.textPrimary }]}>Retake 5-Question Onboarding</Text>
                <Text style={{ fontSize: 11, color: palette.textMuted, marginTop: 1 }}>Update your name, spiritual stage, goals, and daily rhythm</Text>
              </View>
            </View>
            <ChevronRight size={16} color={palette.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: palette.border }]} />

          <TouchableOpacity onPress={() => { triggerLightHaptic(); setIsPrivacyModalOpen(true); }} style={styles.menuRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <ShieldCheck size={18} color="#10B981" />
              <View>
                <Text style={[styles.menuText, { color: palette.textPrimary }]}>Privacy & Community Rules</Text>
                <Text style={{ fontSize: 11, color: palette.textMuted, marginTop: 1 }}>How your data is protected & fellowship guidelines</Text>
              </View>
            </View>
            <ChevronRight size={16} color={palette.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: palette.border }]} />

          <TouchableOpacity
            onPress={() => {
              triggerLightHaptic();
              Linking.openURL('mailto:selabibleapp@gmail.com?subject=Sela%20Holy%20Bible%20Support');
            }}
            style={styles.menuRow}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Mail size={18} color="#3B82F6" />
              <View>
                <Text style={[styles.menuText, { color: palette.textPrimary }]}>Help & Support</Text>
                <Text style={{ fontSize: 11, color: palette.textMuted, marginTop: 1 }}>selabibleapp@gmail.com • Tap to email us</Text>
              </View>
            </View>
            <ChevronRight size={16} color={palette.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: palette.border }]} />

          <TouchableOpacity
            onPress={async () => {
              triggerLightHaptic();
              await signOutUser();
              updateUserProfile({ onboarded: false });
              router.replace('/login' as any);
            }}
            style={styles.menuRow}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <LogOut size={18} color="#EF4444" />
              <View>
                <Text style={[styles.menuText, { color: '#EF4444' }]}>Sign Out / Switch Account</Text>
                <Text style={{ fontSize: 11, color: palette.textMuted, marginTop: 1 }}>Log out of this device or sign in with another account</Text>
              </View>
            </View>
            <ChevronRight size={16} color={palette.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: palette.border }]} />

          <TouchableOpacity
            onPress={() => {
              triggerLightHaptic();
              Alert.alert(
                'Delete Account & Data',
                'Are you sure you want to delete your account? All your personal notes, bookmarks, and streaks will be permanently erased. You may also contact selabibleapp@gmail.com for confirmation.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete Permanently',
                    style: 'destructive',
                    onPress: async () => {
                      triggerSuccessHaptic();
                      await signOutUser();
                      updateUserProfile({ onboarded: false });
                      router.replace('/login' as any);
                    },
                  },
                ]
              );
            }}
            style={styles.menuRow}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Trash2 size={18} color="#DC2626" />
              <View>
                <Text style={[styles.menuText, { color: '#DC2626' }]}>Delete Account & Data</Text>
                <Text style={{ fontSize: 11, color: palette.textMuted, marginTop: 1 }}>Permanently delete your account and personal data</Text>
              </View>
            </View>
            <ChevronRight size={16} color={palette.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: 'center', marginTop: 28, marginBottom: 12, gap: 6 }}>
          <Image
            source={require('../../../assets/images/sela_logo.png')}
            style={{ width: 32, height: 32, borderRadius: 8, opacity: 0.85 }}
            resizeMode="cover"
          />
          <Text style={{ fontSize: 12, color: palette.textMuted, textAlign: 'center' }}>
            Sela • Holy Bible & Spiritual Growth • Version 1.0.0
          </Text>
          <Text style={{ fontSize: 10, color: palette.accentGreen, fontWeight: '700', letterSpacing: 1 }}>
            PAUSE • PRAY • GROW • BELONG
          </Text>
        </View>
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

      {/* PRIVACY RULES MODAL */}
      <Modal
        visible={isPrivacyModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPrivacyModalOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: palette.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: palette.cardBorder, maxHeight: '85%', paddingBottom: 30 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: palette.border }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={22} color="#10B981" />
                <Text style={{ fontSize: 17, fontWeight: '800', color: palette.textPrimary }}>Privacy & Community Rules</Text>
              </View>
              <TouchableOpacity onPress={() => setIsPrivacyModalOpen(false)} style={{ padding: 6 }}>
                <X size={20} color={palette.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }} showsVerticalScrollIndicator={false}>
              {/* Rule 1 */}
              <View style={{ flexDirection: 'row', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.inputBg, gap: 12, alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 22, marginTop: 2 }}>🛡️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: palette.textPrimary, marginBottom: 4 }}>Your Devotionals Are Private</Text>
                  <Text style={{ fontSize: 13, color: palette.textSecondary, lineHeight: 19 }}>
                    Your personal study notes, private prayer journal, and bookmarks belong only to you. We never share them with other users.
                  </Text>
                </View>
              </View>

              {/* Rule 2 */}
              <View style={{ flexDirection: 'row', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.inputBg, gap: 12, alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 22, marginTop: 2 }}>🔒</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: palette.textPrimary, marginBottom: 4 }}>Private & Secure</Text>
                  <Text style={{ fontSize: 13, color: palette.textSecondary, lineHeight: 19 }}>
                    Your spiritual reflections, prayers, and highlights are encrypted and tied strictly to your email account.
                  </Text>
                </View>
              </View>

              {/* Rule 3 */}
              <View style={{ flexDirection: 'row', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.inputBg, gap: 12, alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 22, marginTop: 2 }}>🚫</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: palette.textPrimary, marginBottom: 4 }}>Zero Ads & No Data Selling</Text>
                  <Text style={{ fontSize: 13, color: palette.textSecondary, lineHeight: 19 }}>
                    We will never sell your spiritual reflections, reading habits, or identity to advertising brokers or third parties.
                  </Text>
                </View>
              </View>

              {/* Rule 4 */}
              <View style={{ flexDirection: 'row', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.inputBg, gap: 12, alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 22, marginTop: 2 }}>🤝</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: palette.textPrimary, marginBottom: 4 }}>Community Fellowship Rules</Text>
                  <Text style={{ fontSize: 13, color: palette.textSecondary, lineHeight: 19 }}>
                    Public prayer burdens must be reverent and respectful. Inappropriate, hateful, or commercial content is strictly prohibited and will be removed immediately.
                  </Text>
                </View>
              </View>

              {/* Rule 5 */}
              <View style={{ flexDirection: 'row', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: palette.border, backgroundColor: palette.inputBg, gap: 12, alignItems: 'flex-start' }}>
                <Text style={{ fontSize: 22, marginTop: 2 }}>🗑️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: palette.textPrimary, marginBottom: 4 }}>Data Deletion Rights</Text>
                  <Text style={{ fontSize: 13, color: palette.textSecondary, lineHeight: 19 }}>
                    You can clear all local storage anytime, or email support to permanently delete any cloud records.
                  </Text>
                </View>
              </View>

              {/* Contact Box */}
              <View style={{ padding: 16, borderRadius: 16, alignItems: 'center', backgroundColor: isDark ? 'rgba(79, 70, 229, 0.12)' : 'rgba(79, 70, 229, 0.06)', marginTop: 8, gap: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#4F46E5', textTransform: 'uppercase', letterSpacing: 0.8 }}>Official Privacy & Support Contact</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: palette.textPrimary }}>selabibleapp@gmail.com</Text>
                <Text style={{ fontSize: 11, color: palette.textMuted, textAlign: 'center', marginTop: 2 }}>Questions or data requests will be answered within 48 hours.</Text>
              </View>
            </ScrollView>
          </View>
        </View>
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
