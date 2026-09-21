import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
  AppState,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  useReminderStore,
  PRAYER_TEMPLATES,
  BIBLE_TEMPLATES,
  ReminderTemplate,
} from '../store/useReminderStore';
import {
  ReminderItem,
  ReminderType,
  RepeatType,
  ReminderDestination,
  formatRepeatSummary,
  getDestinationLabel,
  sendInstantTestNotification,
  openDeviceNotificationSettings,
  parseHourAndMinute,
  formatTo12Hour,
} from '../services/reminderNotificationService';
import { SpiritualTheme } from '../constants/spiritualTheme';
import { useBibleStore } from '../store/useBibleStore';
import { triggerLightHaptic, triggerMediumHaptic, triggerSuccessHaptic } from '../services/mobileHaptics';
import {
  ChevronLeft,
  Plus,
  Bell,
  BellOff,
  Clock,
  Copy,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Volume2,
  VolumeX,
  Smartphone,
  ExternalLink,
  Calendar,
  X,
  Check,
  Zap,
  BookOpen,
  Heart,
  Repeat,
} from 'lucide-react-native';

const DAYS_OF_WEEK = [
  { dayIndex: 1, label: 'M', full: 'Monday' },
  { dayIndex: 2, label: 'T', full: 'Tuesday' },
  { dayIndex: 3, label: 'W', full: 'Wednesday' },
  { dayIndex: 4, label: 'T', full: 'Thursday' },
  { dayIndex: 5, label: 'F', full: 'Friday' },
  { dayIndex: 6, label: 'S', full: 'Saturday' },
  { dayIndex: 0, label: 'S', full: 'Sunday' },
];

const PRESET_TIMES = [
  '06:00 AM',
  '06:30 AM',
  '07:00 AM',
  '07:30 AM',
  '08:00 AM',
  '08:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '07:00 PM',
  '08:00 PM',
  '09:00 PM',
  '09:30 PM',
  '10:00 PM',
];

export default function RemindersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { themeMode } = useBibleStore();
  const isDark = themeMode === 'dark';
  const palette = isDark ? SpiritualTheme.dark : SpiritualTheme.light;

  const {
    reminders,
    masterEnabled,
    devicePermissionStatus,
    checkDevicePermissions,
    requestDevicePermissions,
    setMasterEnabled,
    addReminder,
    updateReminder,
    deleteReminder,
    duplicateReminder,
    toggleReminderEnabled,
  } = useReminderStore();

  // Modal State for Add / Edit
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);

  // Form Fields
  const [formType, setFormType] = useState<ReminderType>('prayer');
  const [formTitle, setFormTitle] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formTime, setFormTime] = useState('07:00 AM');
  const [formRepeatType, setFormRepeatType] = useState<RepeatType>('daily');
  const [formSelectedDays, setFormSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [formSound, setFormSound] = useState(true);
  const [formVibration, setFormVibration] = useState(true);
  const [formDestination, setFormDestination] = useState<ReminderDestination>('prayer');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Permission Banner & Modal State
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [testNotificationFeedback, setTestNotificationFeedback] = useState<string | null>(null);

  // Check device permission on load and when app returns to foreground
  useEffect(() => {
    checkDevicePermissions();

    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        checkDevicePermissions();
      }
    });

    return () => sub.remove();
  }, []);

  const prayerReminders = reminders.filter((r) => r.type === 'prayer');
  const bibleReminders = reminders.filter((r) => r.type === 'bible_reading');

  const openNewReminder = (type: ReminderType = 'prayer') => {
    setEditingReminderId(null);
    setFormType(type);

    // Default template for initial load
    const defaultTemplate = type === 'prayer' ? PRAYER_TEMPLATES[0] : BIBLE_TEMPLATES[0];
    setFormTitle(defaultTemplate.title);
    setFormMessage(defaultTemplate.message);
    setFormTime(defaultTemplate.defaultTime);
    setFormRepeatType(defaultTemplate.repeatType);
    setFormSelectedDays(defaultTemplate.selectedDays);
    setFormDestination(defaultTemplate.destination);
    setFormSound(true);
    setFormVibration(true);
    setShowAdvanced(false);

    setIsEditorOpen(true);
    triggerLightHaptic();
  };

  // Check query params if user was directed to create a reminder directly
  useEffect(() => {
    if (params.action === 'add') {
      const type = params.type === 'bible' ? 'bible_reading' : 'prayer';
      openNewReminder(type);
    }
  }, [params.action, params.type]);

  const openEditReminder = (reminder: ReminderItem) => {
    setEditingReminderId(reminder.id);
    setFormType(reminder.type);
    setFormTitle(reminder.title);
    setFormMessage(reminder.message);
    setFormTime(reminder.time);
    setFormRepeatType(reminder.repeat_type);
    setFormSelectedDays(reminder.selected_days || [0, 1, 2, 3, 4, 5, 6]);
    setFormDestination(reminder.destination);
    setFormSound(reminder.sound_enabled !== false);
    setFormVibration(reminder.vibration_enabled !== false);
    setShowAdvanced(true);

    setIsEditorOpen(true);
    triggerLightHaptic();
  };

  const applyTemplate = (tpl: ReminderTemplate) => {
    setFormTitle(tpl.title);
    setFormMessage(tpl.message);
    setFormTime(tpl.defaultTime);
    setFormRepeatType(tpl.repeatType);
    setFormSelectedDays(tpl.selectedDays);
    setFormDestination(tpl.destination);
    triggerLightHaptic();
  };

  const toggleDaySelection = (dayIndex: number) => {
    if (formSelectedDays.includes(dayIndex)) {
      if (formSelectedDays.length > 1) {
        setFormSelectedDays(formSelectedDays.filter((d) => d !== dayIndex));
      }
    } else {
      setFormSelectedDays([...formSelectedDays, dayIndex].sort((a, b) => a - b));
    }
    setFormRepeatType('specific_days');
    triggerLightHaptic();
  };

  const handleSaveReminder = async () => {
    if (!formTitle.trim()) {
      Alert.alert('Reminder Name Required', 'Please enter a name for this reminder.');
      return;
    }

    // Permission Verification (Section 14: Never silently fail)
    if (devicePermissionStatus !== 'granted') {
      const granted = await requestDevicePermissions();
      if (!granted) {
        // Show contextual explanation
        setIsPermissionModalOpen(true);
        return;
      }
    }

    await saveReminderData(true);
  };

  const saveReminderData = async (enabledState: boolean) => {
    const reminderData = {
      type: formType,
      title: formTitle.trim(),
      message: formMessage.trim() || (formType === 'prayer' ? 'Time for prayer.' : "Time for God's Word."),
      time: formTime,
      repeat_type: formRepeatType,
      selected_days: formSelectedDays,
      enabled: enabledState,
      sound_enabled: formSound,
      vibration_enabled: formVibration,
      destination: formDestination,
    };

    if (editingReminderId) {
      await updateReminder(editingReminderId, reminderData);
    } else {
      await addReminder(reminderData);
    }

    triggerSuccessHaptic();
    setIsEditorOpen(false);
    setIsPermissionModalOpen(false);
  };

  const handleTestNotification = async (reminder: ReminderItem) => {
    triggerLightHaptic();
    await sendInstantTestNotification(reminder);
    setTestNotificationFeedback(`⚡ Test sent: "${reminder.title}"! Check your notification bar.`);
    setTimeout(() => setTestNotificationFeedback(null), 4000);
  };

  const handleDeleteReminder = (id: string, title: string) => {
    Alert.alert(
      'Delete Reminder',
      `Are you sure you want to delete "${title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            triggerMediumHaptic();
            await deleteReminder(id);
          },
        },
      ]
    );
  };

  const handleDuplicateReminder = async (id: string) => {
    triggerLightHaptic();
    await duplicateReminder(id);
  };

  const prayerDestinations: { id: ReminderDestination; label: string }[] = [
    { id: 'prayer', label: 'Prayer Screen' },
    { id: 'prayer_requests', label: 'Prayer Requests' },
    { id: 'bible', label: 'Bible Reader' },
    { id: 'home', label: 'Home Screen' },
  ];

  const bibleDestinations: { id: ReminderDestination; label: string }[] = [
    { id: 'bible', label: 'Bible Reader' },
    { id: 'reading_plan', label: 'Reading Plan' },
    { id: 'verse_of_day', label: 'Verse of the Day' },
    { id: 'study', label: 'Bible Study' },
    { id: 'home', label: 'Home Screen' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      {/* Top Navigation Header */}
      <View style={[styles.header, { borderBottomColor: palette.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color={palette.textPrimary} />
          <Text style={[styles.backBtnText, { color: palette.textPrimary }]}>Back</Text>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>My Reminders</Text>

        <TouchableOpacity style={styles.addIconBtn} onPress={() => openNewReminder('prayer')}>
          <Plus size={22} color="#D97706" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Real Device Notification Permission Status Card (Section 14) */}
        <View
          style={[
            styles.permissionCard,
            {
              backgroundColor:
                devicePermissionStatus === 'granted'
                  ? 'rgba(16, 185, 129, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
              borderColor:
                devicePermissionStatus === 'granted' ? '#10B981' : '#EF4444',
            },
          ]}
        >
          <View style={styles.permissionCardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {devicePermissionStatus === 'granted' ? (
                <CheckCircle2 size={20} color="#10B981" />
              ) : (
                <AlertTriangle size={20} color="#EF4444" />
              )}
              <Text
                style={[
                  styles.permissionTitle,
                  {
                    color:
                      devicePermissionStatus === 'granted' ? '#065F46' : '#991B1B',
                  },
                ]}
              >
                Device Notifications:{' '}
                {devicePermissionStatus === 'granted' ? '✓ Allowed' : '⚠ Not Allowed'}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.permissionActionBtn,
                {
                  backgroundColor:
                    devicePermissionStatus === 'granted' ? '#10B981' : '#EF4444',
                },
              ]}
              onPress={async () => {
                triggerLightHaptic();
                if (devicePermissionStatus === 'granted') {
                  openDeviceNotificationSettings();
                } else {
                  const granted = await requestDevicePermissions();
                  if (!granted) {
                    openDeviceNotificationSettings();
                  }
                }
              }}
            >
              <Text style={styles.permissionActionBtnText}>
                {devicePermissionStatus === 'granted' ? 'Manage Settings' : 'Enable Notifications'}
              </Text>
            </TouchableOpacity>
          </View>

          {devicePermissionStatus !== 'granted' ? (
            <Text style={[styles.permissionNoticeSub, { color: '#991B1B' }]}>
              Your reminders cannot be delivered until notifications are enabled in Android device settings.
            </Text>
          ) : (
            <Text style={[styles.permissionNoticeSub, { color: '#065F46' }]}>
              Notifications are active. Reminders trigger automatically when phone is locked or app is closed.
            </Text>
          )}
        </View>

        {/* Master Reminder Switch Card */}
        <View
          style={[
            styles.masterSwitchCard,
            { backgroundColor: palette.card, borderColor: palette.cardBorder },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.masterSwitchTitle, { color: palette.textPrimary }]}>
              All Daily Reminders
            </Text>
            <Text style={[styles.masterSwitchSub, { color: palette.textSecondary }]}>
              {masterEnabled
                ? 'Reminders are scheduled and active'
                : 'All reminders are currently paused'}
            </Text>
          </View>
          <Switch
            value={masterEnabled}
            onValueChange={(val) => {
              triggerLightHaptic();
              setMasterEnabled(val);
            }}
            trackColor={{ false: '#9CA3AF', true: '#D97706' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Quick Add Action Banner */}
        <View style={styles.quickAddRow}>
          <TouchableOpacity
            style={[styles.quickAddBtn, { backgroundColor: '#F59E0B' }]}
            onPress={() => openNewReminder('prayer')}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.quickAddBtnText}>+ Add Prayer Reminder</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAddBtn, { backgroundColor: '#2563EB' }]}
            onPress={() => openNewReminder('bible_reading')}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.quickAddBtnText}>+ Add Bible Reminder</Text>
          </TouchableOpacity>
        </View>

        {/* Instant Test Feedback Banner */}
        {testNotificationFeedback ? (
          <View style={styles.feedbackBanner}>
            <Zap size={16} color="#059669" />
            <Text style={styles.feedbackBannerText}>{testNotificationFeedback}</Text>
          </View>
        ) : null}

        {/* SECTION 1: PRAYER REMINDERS */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 18 }}>🙏</Text>
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
              PRAYER REMINDERS ({prayerReminders.length})
            </Text>
          </View>
          <TouchableOpacity onPress={() => openNewReminder('prayer')}>
            <Text style={styles.sectionActionText}>+ New</Text>
          </TouchableOpacity>
        </View>

        {prayerReminders.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
            <Text style={[styles.emptyCardTitle, { color: palette.textPrimary }]}>No prayer reminders yet</Text>
            <Text style={[styles.emptyCardSub, { color: palette.textSecondary }]}>
              Create your first prayer reminder to stay connected with God throughout your day.
            </Text>
            <TouchableOpacity style={styles.emptyAddBtn} onPress={() => openNewReminder('prayer')}>
              <Text style={styles.emptyAddBtnText}>Add Prayer Reminder</Text>
            </TouchableOpacity>
          </View>
        ) : (
          prayerReminders.map((reminder) => (
            <View
              key={reminder.id}
              style={[
                styles.reminderCard,
                { backgroundColor: palette.card, borderColor: palette.cardBorder },
                !reminder.enabled && { opacity: 0.65 },
              ]}
            >
              <View style={styles.cardTopRow}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[styles.reminderCardTitle, { color: palette.textPrimary }]}>
                      🙏 {reminder.title}
                    </Text>
                    <View style={styles.destBadge}>
                      <Text style={styles.destBadgeText}>
                        {getDestinationLabel(reminder.destination)}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.reminderCardTime, { color: '#D97706' }]}>
                    {formatRepeatSummary(reminder.repeat_type, reminder.selected_days)} ·{' '}
                    <Text style={{ fontWeight: '800' }}>{reminder.time}</Text>
                  </Text>
                </View>

                <Switch
                  value={reminder.enabled && masterEnabled}
                  onValueChange={() => {
                    triggerLightHaptic();
                    toggleReminderEnabled(reminder.id);
                  }}
                  trackColor={{ false: '#9CA3AF', true: '#D97706' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <Text style={[styles.reminderCardMessage, { color: palette.textSecondary }]}>
                "{reminder.message}"
              </Text>

              {/* Action Bar */}
              <View style={[styles.cardActionsRow, { borderTopColor: palette.border }]}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    style={styles.cardActionItem}
                    onPress={() => handleTestNotification(reminder)}
                  >
                    <Zap size={14} color="#D97706" />
                    <Text style={[styles.cardActionText, { color: '#D97706' }]}>Test</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cardActionItem}
                    onPress={() => handleDuplicateReminder(reminder.id)}
                  >
                    <Copy size={14} color={palette.textSecondary} />
                    <Text style={[styles.cardActionText, { color: palette.textSecondary }]}>
                      Duplicate
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    style={styles.cardActionItem}
                    onPress={() => openEditReminder(reminder)}
                  >
                    <Edit3 size={14} color="#2563EB" />
                    <Text style={[styles.cardActionText, { color: '#2563EB' }]}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cardActionItem}
                    onPress={() => handleDeleteReminder(reminder.id, reminder.title)}
                  >
                    <Trash2 size={14} color="#EF4444" />
                    <Text style={[styles.cardActionText, { color: '#EF4444' }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        {/* SECTION 2: BIBLE READING REMINDERS */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 18 }}>📖</Text>
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
              BIBLE READING REMINDERS ({bibleReminders.length})
            </Text>
          </View>
          <TouchableOpacity onPress={() => openNewReminder('bible_reading')}>
            <Text style={styles.sectionActionText}>+ New</Text>
          </TouchableOpacity>
        </View>

        {bibleReminders.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: palette.card, borderColor: palette.cardBorder }]}>
            <Text style={[styles.emptyCardTitle, { color: palette.textPrimary }]}>No Bible reading reminders yet</Text>
            <Text style={[styles.emptyCardSub, { color: palette.textSecondary }]}>
              Schedule regular scripture reading to build a consistent daily habit.
            </Text>
            <TouchableOpacity
              style={[styles.emptyAddBtn, { backgroundColor: '#2563EB' }]}
              onPress={() => openNewReminder('bible_reading')}
            >
              <Text style={styles.emptyAddBtnText}>Add Bible Reading Reminder</Text>
            </TouchableOpacity>
          </View>
        ) : (
          bibleReminders.map((reminder) => (
            <View
              key={reminder.id}
              style={[
                styles.reminderCard,
                { backgroundColor: palette.card, borderColor: palette.cardBorder },
                !reminder.enabled && { opacity: 0.65 },
              ]}
            >
              <View style={styles.cardTopRow}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[styles.reminderCardTitle, { color: palette.textPrimary }]}>
                      📖 {reminder.title}
                    </Text>
                    <View style={[styles.destBadge, { backgroundColor: 'rgba(37, 99, 235, 0.12)' }]}>
                      <Text style={[styles.destBadgeText, { color: '#2563EB' }]}>
                        {getDestinationLabel(reminder.destination)}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.reminderCardTime, { color: '#2563EB' }]}>
                    {formatRepeatSummary(reminder.repeat_type, reminder.selected_days)} ·{' '}
                    <Text style={{ fontWeight: '800' }}>{reminder.time}</Text>
                  </Text>
                </View>

                <Switch
                  value={reminder.enabled && masterEnabled}
                  onValueChange={() => {
                    triggerLightHaptic();
                    toggleReminderEnabled(reminder.id);
                  }}
                  trackColor={{ false: '#9CA3AF', true: '#2563EB' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <Text style={[styles.reminderCardMessage, { color: palette.textSecondary }]}>
                "{reminder.message}"
              </Text>

              {/* Action Bar */}
              <View style={[styles.cardActionsRow, { borderTopColor: palette.border }]}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    style={styles.cardActionItem}
                    onPress={() => handleTestNotification(reminder)}
                  >
                    <Zap size={14} color="#2563EB" />
                    <Text style={[styles.cardActionText, { color: '#2563EB' }]}>Test</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cardActionItem}
                    onPress={() => handleDuplicateReminder(reminder.id)}
                  >
                    <Copy size={14} color={palette.textSecondary} />
                    <Text style={[styles.cardActionText, { color: palette.textSecondary }]}>
                      Duplicate
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    style={styles.cardActionItem}
                    onPress={() => openEditReminder(reminder)}
                  >
                    <Edit3 size={14} color="#2563EB" />
                    <Text style={[styles.cardActionText, { color: '#2563EB' }]}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cardActionItem}
                    onPress={() => handleDeleteReminder(reminder.id, reminder.title)}
                  >
                    <Trash2 size={14} color="#EF4444" />
                    <Text style={[styles.cardActionText, { color: '#EF4444' }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ======================================================== */}
      {/* MODAL 1: ADD / EDIT REMINDER MODAL                       */}
      {/* ======================================================== */}
      <Modal visible={isEditorOpen} animationType="slide" transparent>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsEditorOpen(false)}
        >
          <View
            style={[
              styles.modalCard,
              { backgroundColor: palette.card, borderColor: palette.cardBorder },
            ]}
            onStartShouldSetResponder={() => true}
          >
            {/* Modal Header */}
            <View style={[styles.modalHeaderRow, { borderBottomColor: palette.border }]}>
              <Text style={[styles.modalHeaderTitle, { color: palette.textPrimary }]}>
                {editingReminderId ? 'Edit Reminder' : formType === 'prayer' ? 'Add Prayer Reminder' : 'Add Bible Reminder'}
              </Text>
              <TouchableOpacity onPress={() => setIsEditorOpen(false)}>
                <X size={22} color={palette.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 520 }} showsVerticalScrollIndicator={false}>
              {/* Type Switcher */}
              <View style={styles.typeSwitcherRow}>
                <TouchableOpacity
                  style={[
                    styles.typeSwitcherPill,
                    formType === 'prayer' && { backgroundColor: '#D97706', borderColor: '#D97706' },
                  ]}
                  onPress={() => {
                    triggerLightHaptic();
                    setFormType('prayer');
                    setFormDestination('prayer');
                  }}
                >
                  <Text
                    style={[
                      styles.typeSwitcherPillText,
                      formType === 'prayer' && { color: '#FFFFFF' },
                    ]}
                  >
                    🙏 Prayer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeSwitcherPill,
                    formType === 'bible_reading' && { backgroundColor: '#2563EB', borderColor: '#2563EB' },
                  ]}
                  onPress={() => {
                    triggerLightHaptic();
                    setFormType('bible_reading');
                    setFormDestination('bible');
                  }}
                >
                  <Text
                    style={[
                      styles.typeSwitcherPillText,
                      formType === 'bible_reading' && { color: '#FFFFFF' },
                    ]}
                  >
                    📖 Bible Reading
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Quick Template Carousel (Section 8 & 9) */}
              <Text style={[styles.fieldLabel, { color: palette.textSecondary, marginTop: 14 }]}>
                Quick Inspiration Templates
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateScroll}>
                {(formType === 'prayer' ? PRAYER_TEMPLATES : BIBLE_TEMPLATES).map((tpl) => (
                  <TouchableOpacity
                    key={tpl.id}
                    style={[
                      styles.templateChip,
                      { backgroundColor: palette.inputBg, borderColor: palette.border },
                      formTitle === tpl.title && { borderColor: formType === 'prayer' ? '#D97706' : '#2563EB', borderWidth: 1.5 },
                    ]}
                    onPress={() => applyTemplate(tpl)}
                  >
                    <Text style={{ fontSize: 16 }}>{tpl.icon}</Text>
                    <Text style={[styles.templateChipTitle, { color: palette.textPrimary }]}>
                      {tpl.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Reminder Name */}
              <Text style={[styles.fieldLabel, { color: palette.textSecondary, marginTop: 14 }]}>
                Reminder Name
              </Text>
              <TextInput
                value={formTitle}
                onChangeText={setFormTitle}
                placeholder={formType === 'prayer' ? 'e.g. Morning Prayer' : 'e.g. Evening Bible Reading'}
                placeholderTextColor={palette.textMuted}
                style={[styles.inputField, { backgroundColor: palette.inputBg, color: palette.textPrimary, borderColor: palette.border }]}
              />

              {/* Reminder Message (Custom Message Support - Section 7) */}
              <Text style={[styles.fieldLabel, { color: palette.textSecondary, marginTop: 14 }]}>
                Custom Notification Message
              </Text>
              <TextInput
                value={formMessage}
                onChangeText={setFormMessage}
                placeholder="e.g. Take a quiet moment to pray and give thanks."
                placeholderTextColor={palette.textMuted}
                multiline
                style={[
                  styles.inputField,
                  {
                    height: 70,
                    textAlignVertical: 'top',
                    backgroundColor: palette.inputBg,
                    color: palette.textPrimary,
                    borderColor: palette.border,
                  },
                ]}
              />

              {/* Time Picker */}
              <Text style={[styles.fieldLabel, { color: palette.textSecondary, marginTop: 14 }]}>
                Reminder Time: <Text style={{ color: palette.textPrimary, fontWeight: '800' }}>{formTime}</Text>
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeScroll}>
                {PRESET_TIMES.map((time) => (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timePill,
                      { borderColor: palette.border },
                      formTime === time && { backgroundColor: formType === 'prayer' ? '#D97706' : '#2563EB', borderColor: formType === 'prayer' ? '#D97706' : '#2563EB' },
                    ]}
                    onPress={() => {
                      triggerLightHaptic();
                      setFormTime(time);
                    }}
                  >
                    <Text
                      style={[
                        styles.timePillText,
                        { color: palette.textSecondary },
                        formTime === time && { color: '#FFFFFF', fontWeight: '800' },
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Repeat Frequency (Section 1 & 2) */}
              <Text style={[styles.fieldLabel, { color: palette.textSecondary, marginTop: 14 }]}>
                Repeat Frequency
              </Text>
              <View style={styles.repeatRow}>
                {(['daily', 'weekdays', 'weekends', 'specific_days', 'once'] as RepeatType[]).map((rpt) => (
                  <TouchableOpacity
                    key={rpt}
                    style={[
                      styles.repeatPill,
                      { borderColor: palette.border },
                      formRepeatType === rpt && { backgroundColor: formType === 'prayer' ? '#D97706' : '#2563EB', borderColor: formType === 'prayer' ? '#D97706' : '#2563EB' },
                    ]}
                    onPress={() => {
                      triggerLightHaptic();
                      setFormRepeatType(rpt);
                      if (rpt === 'daily') setFormSelectedDays([0, 1, 2, 3, 4, 5, 6]);
                      if (rpt === 'weekdays') setFormSelectedDays([1, 2, 3, 4, 5]);
                      if (rpt === 'weekends') setFormSelectedDays([0, 6]);
                    }}
                  >
                    <Text
                      style={[
                        styles.repeatPillText,
                        { color: palette.textSecondary },
                        formRepeatType === rpt && { color: '#FFFFFF', fontWeight: '800' },
                      ]}
                    >
                      {rpt === 'daily'
                        ? 'Every Day'
                        : rpt === 'weekdays'
                        ? 'Weekdays'
                        : rpt === 'weekends'
                        ? 'Weekends'
                        : rpt === 'specific_days'
                        ? 'Specific Days'
                        : 'One-Time'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Days of Week Pills: [ M ] [ T ] [ W ] [ T ] [ F ] [ S ] [ S ] (Section 3) */}
              <Text style={[styles.fieldLabel, { color: palette.textSecondary, marginTop: 14 }]}>
                Days of Week
              </Text>
              <View style={styles.daysRow}>
                {DAYS_OF_WEEK.map((d) => {
                  const isSelected = formSelectedDays.includes(d.dayIndex);
                  return (
                    <TouchableOpacity
                      key={`${d.full}-${d.dayIndex}`}
                      style={[
                        styles.dayCircle,
                        { borderColor: palette.border },
                        isSelected && { backgroundColor: formType === 'prayer' ? '#D97706' : '#2563EB', borderColor: formType === 'prayer' ? '#D97706' : '#2563EB' },
                      ]}
                      onPress={() => toggleDaySelection(d.dayIndex)}
                    >
                      <Text
                        style={[
                          styles.dayCircleText,
                          { color: palette.textSecondary },
                          isSelected && { color: '#FFFFFF', fontWeight: '800' },
                        ]}
                      >
                        {d.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Open When Tapped Destination (Section 1, 2, 3) */}
              <Text style={[styles.fieldLabel, { color: palette.textSecondary, marginTop: 14 }]}>
                Open When Tapped
              </Text>
              <View style={styles.destinationRow}>
                {(formType === 'prayer' ? prayerDestinations : bibleDestinations).map((dest) => (
                  <TouchableOpacity
                    key={dest.id}
                    style={[
                      styles.destinationPill,
                      { borderColor: palette.border },
                      formDestination === dest.id && { backgroundColor: formType === 'prayer' ? '#D97706' : '#2563EB', borderColor: formType === 'prayer' ? '#D97706' : '#2563EB' },
                    ]}
                    onPress={() => {
                      triggerLightHaptic();
                      setFormDestination(dest.id);
                    }}
                  >
                    <Text
                      style={[
                        styles.destinationPillText,
                        { color: palette.textSecondary },
                        formDestination === dest.id && { color: '#FFFFFF', fontWeight: '700' },
                      ]}
                    >
                      {dest.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Sound & Vibration Toggles */}
              <View style={[styles.switchRow, { borderTopColor: palette.border, marginTop: 16 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Volume2 size={18} color={palette.textSecondary} />
                  <Text style={[styles.switchRowLabel, { color: palette.textPrimary }]}>Notification Sound</Text>
                </View>
                <Switch
                  value={formSound}
                  onValueChange={setFormSound}
                  trackColor={{ false: '#9CA3AF', true: formType === 'prayer' ? '#D97706' : '#2563EB' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={[styles.switchRow, { borderTopColor: palette.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Smartphone size={18} color={palette.textSecondary} />
                  <Text style={[styles.switchRowLabel, { color: palette.textPrimary }]}>Vibration</Text>
                </View>
                <Switch
                  value={formVibration}
                  onValueChange={setFormVibration}
                  trackColor={{ false: '#9CA3AF', true: formType === 'prayer' ? '#D97706' : '#2563EB' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </ScrollView>

            {/* Save & Instant Test Buttons */}
            <View style={[styles.modalFooterRow, { borderTopColor: palette.border }]}>
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  { backgroundColor: formType === 'prayer' ? '#D97706' : '#2563EB' },
                ]}
                onPress={handleSaveReminder}
              >
                <Text style={styles.saveBtnText}>
                  {editingReminderId ? 'Update Reminder' : 'Save Reminder'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 2: PERMISSION DENIED / PENDING EXPLANATION MODAL   */}
      {/* ======================================================== */}
      <Modal visible={isPermissionModalOpen} animationType="fade" transparent>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsPermissionModalOpen(false)}
        >
          <View
            style={[
              styles.permissionModalCard,
              { backgroundColor: palette.card, borderColor: palette.cardBorder },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.permissionIconCircle}>
              <Bell size={28} color="#D97706" />
            </View>

            <Text style={[styles.permissionModalTitle, { color: palette.textPrimary }]}>
              Stay Connected with God's Word
            </Text>

            <Text style={[styles.permissionModalBody, { color: palette.textSecondary }]}>
              Allow notifications on your device to receive:
            </Text>

            <View style={styles.benefitList}>
              <Text style={[styles.benefitItem, { color: palette.textPrimary }]}>
                • Daily Verse of the Day
              </Text>
              <Text style={[styles.benefitItem, { color: palette.textPrimary }]}>
                • Personalized Prayer Reminders
              </Text>
              <Text style={[styles.benefitItem, { color: palette.textPrimary }]}>
                • Daily Bible Reading & Study Prompts
              </Text>
              <Text style={[styles.benefitItem, { color: palette.textPrimary }]}>
                • Peaceful bedtime evening scriptures
              </Text>
            </View>

            <Text style={[styles.permissionFootnote, { color: '#EF4444' }]}>
              If you proceed without notifications, your reminder will be saved as pending until permission is granted in Android settings.
            </Text>

            <View style={styles.permissionModalButtons}>
              <TouchableOpacity
                style={[styles.allowModalBtn, { backgroundColor: '#D97706' }]}
                onPress={async () => {
                  triggerLightHaptic();
                  const granted = await requestDevicePermissions();
                  if (granted) {
                    await saveReminderData(true);
                  } else {
                    await openDeviceNotificationSettings();
                    await saveReminderData(false);
                  }
                }}
              >
                <Text style={styles.allowModalBtnText}>Enable Notifications</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.laterModalBtn}
                onPress={async () => {
                  triggerLightHaptic();
                  // Save reminder as disabled/pending per Section 14.D
                  await saveReminderData(false);
                }}
              >
                <Text style={[styles.laterModalBtnText, { color: palette.textSecondary }]}>
                  Save as Pending (Maybe Later)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  addIconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(217, 119, 6, 0.1)',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  permissionCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  permissionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  permissionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  permissionActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  permissionActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  permissionNoticeSub: {
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
  },
  masterSwitchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  masterSwitchTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  masterSwitchSub: {
    fontSize: 12,
    marginTop: 2,
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  quickAddBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  quickAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(5, 150, 105, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  feedbackBannerText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionActionText: {
    color: '#D97706',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyCardSub: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 14,
  },
  emptyAddBtn: {
    backgroundColor: '#D97706',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyAddBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  reminderCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  reminderCardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  destBadge: {
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  destBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  reminderCardTime: {
    fontSize: 13,
    marginTop: 4,
  },
  reminderCardMessage: {
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
  },
  cardActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardActionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  typeSwitcherRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  typeSwitcherPill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    alignItems: 'center',
  },
  typeSwitcherPillText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6B7280',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  templateScroll: {
    marginTop: 8,
    marginBottom: 4,
  },
  templateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  templateChipTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  inputField: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginTop: 6,
  },
  timeScroll: {
    marginTop: 8,
  },
  timePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 6,
  },
  timePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  repeatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  repeatPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  repeatPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleText: {
    fontSize: 14,
    fontWeight: '700',
  },
  destinationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  destinationPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  destinationPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  switchRowLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalFooterRow: {
    paddingTop: 16,
    marginTop: 10,
    borderTopWidth: 1,
  },
  saveBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  permissionModalCard: {
    width: '90%',
    alignSelf: 'center',
    marginVertical: 'auto',
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  permissionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(217, 119, 6, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  permissionModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  permissionModalBody: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  benefitList: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(156, 163, 175, 0.08)',
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    gap: 6,
  },
  benefitItem: {
    fontSize: 13,
    fontWeight: '600',
  },
  permissionFootnote: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 16,
  },
  permissionModalButtons: {
    width: '100%',
    gap: 10,
  },
  allowModalBtn: {
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  allowModalBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  laterModalBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  laterModalBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
