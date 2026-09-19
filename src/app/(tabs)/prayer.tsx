import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, Platform, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useBibleStore } from '../../store/useBibleStore';
import { useSpiritualStore, PrayerCategory } from '../../store/useSpiritualStore';
import { SpiritualTheme } from '../../constants/spiritualTheme';
import { triggerLightHaptic, triggerMediumHaptic, triggerSuccessHaptic } from '../../services/mobileHaptics';
import { 
  subscribeToCloudCommunityPrayers, 
  publishCommunityPrayerToCloud, 
  incrementCloudIPrayedCount 
} from '../../services/cloudSyncService';
import {
  subscribeToSupabaseCommunityPrayers,
  publishCommunityPrayerToSupabase,
  incrementSupabaseIPrayedCount,
} from '../../services/supabaseSyncService';
import { Heart, Plus, Lock, Globe, X, Users, ShieldAlert, UserPlus, UserCheck, Flag, Hand } from 'lucide-react-native';

export default function PrayerScreen() {
  const router = useRouter();
  const { themeMode } = useBibleStore();
  const isDark = themeMode === 'dark';
  const palette = isDark ? SpiritualTheme.dark : SpiritualTheme.light;

  const [activeTab, setActiveTab] = useState<'MY_PRAYERS' | 'COMMUNITY'>('MY_PRAYERS');
  const [feedFilter, setFeedFilter] = useState<'GLOBAL' | 'FOLLOWING'>('GLOBAL');

  // Stores
  const {
    privatePrayers,
    communityPrayers,
    followedUserIds,
    addPrivatePrayer,
    markPrayerAnswered,
    addCommunityPrayer,
    incrementIPrayed,
    reactStandingWithYou,
    reactSupport,
    toggleFollowUser,
    reportPrayerRequest,
  } = useSpiritualStore();

  // Cloud Real-Time Listener (Supabase + Firebase Fallback)
  useEffect(() => {
    const unsubscribeSupabase = subscribeToSupabaseCommunityPrayers((supabasePrayers) => {
      if (supabasePrayers.length > 0) {
        useSpiritualStore.setState({ communityPrayers: supabasePrayers });
      }
    });

    const unsubscribeFirebase = subscribeToCloudCommunityPrayers((cloudPrayers) => {
      if (cloudPrayers.length > 0) {
        useSpiritualStore.setState({ communityPrayers: cloudPrayers });
      }
    });

    return () => {
      unsubscribeSupabase();
      unsubscribeFirebase();
    };
  }, []);

  // Modals state
  const [isAddPrivateOpen, setIsAddPrivateOpen] = useState(false);
  const [isAddCommunityOpen, setIsAddCommunityOpen] = useState(false);
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [targetPrayerId, setTargetPrayerId] = useState<string | null>(null);

  // Form fields
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<PrayerCategory>('family');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [answerNote, setAnswerNote] = useState('');

  // Handle incoming scripture parameters from "Pray About This" action
  const searchParams = useLocalSearchParams();

  useEffect(() => {
    if (searchParams.scriptureRef || searchParams.action === 'create') {
      const ref = searchParams.scriptureRef as string;
      const text = searchParams.scriptureText as string;
      if (ref) {
        setNewTitle(`Prayer for ${ref}`);
        setNewContent(`"${text || ''}"\n\nPlease pray for...`);
      }
      setActiveTab('COMMUNITY');
      setIsAddCommunityOpen(true);
    }
  }, [searchParams.scriptureRef, searchParams.scriptureText, searchParams.action]);

  // Handlers
  const handleSavePrivate = () => {
    if (!newTitle.trim()) return;
    triggerSuccessHaptic();
    addPrivatePrayer({
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
    });
    setNewTitle('');
    setNewContent('');
    setIsAddPrivateOpen(false);
  };

  const handleSaveCommunity = async () => {
    if (!newTitle.trim() || !newContent.trim()) return;
    triggerSuccessHaptic();
    const payload = {
      authorName: isAnonymous ? 'Anonymous' : 'Believer',
      isAnonymous,
      title: newTitle.trim(),
      burdenText: newContent.trim(),
      category: newCategory,
    };
    addCommunityPrayer(payload);
    await publishCommunityPrayerToSupabase(payload);
    await publishCommunityPrayerToCloud(payload);
    setNewTitle('');
    setNewContent('');
    setIsAddCommunityOpen(false);
  };

  const handleConfirmAnswered = () => {
    if (!targetPrayerId) return;
    triggerSuccessHaptic();
    markPrayerAnswered(targetPrayerId, answerNote.trim());
    setAnswerNote('');
    setTargetPrayerId(null);
    setIsAnswerModalOpen(false);
  };

  const handlePrayNow = (id: string) => {
    triggerMediumHaptic();
    incrementIPrayed(id);
    incrementSupabaseIPrayedCount(id);
    incrementCloudIPrayedCount(id);
    router.push({ pathname: '/pray-now' as any, params: { id } });
  };

  const handleStandingWithYou = (id: string) => {
    triggerLightHaptic();
    reactStandingWithYou(id);
  };

  const handleSupport = (id: string) => {
    triggerLightHaptic();
    reactSupport(id);
  };

  const handleReport = (id: string) => {
    triggerLightHaptic();
    Alert.alert('Report Prayer Request', 'Is this request sensitive or inappropriate for a Christian community?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report to Moderation',
        style: 'destructive',
        onPress: () => {
          reportPrayerRequest(id, 'User reported content');
          Alert.alert('Reported', 'Thank you. Our moderation panel will review this request.');
        },
      },
    ]);
  };

  const displayedCommunityPrayers = communityPrayers.filter((p) => {
    if (p.isReported) return false;
    if (feedFilter === 'FOLLOWING') {
      return p.authorId ? followedUserIds.includes(p.authorId) : true;
    }
    return true;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }} edges={['top', 'left', 'right']}>
      {/* Header Bar */}
      <View style={{ paddingTop: 12, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: palette.card, borderBottomWidth: 1, borderBottomColor: palette.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: palette.accentGreen, textTransform: 'uppercase', letterSpacing: 1.2 }}>
              Prayer & Intercession
            </Text>
            <Text style={{ fontSize: 24, fontWeight: '800', color: palette.textPrimary, marginTop: 1 }}>
              Prayer Center
            </Text>
          </View>

          {/* Quick Access Badges */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => {
                triggerLightHaptic();
                router.push('/prayer-circles' as any);
              }}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(200, 150, 62, 0.12)', justifyContent: 'center', alignItems: 'center' }}
            >
              <Users size={18} color="#C8963E" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                triggerLightHaptic();
                router.push('/admin-panel' as any);
              }}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(46, 79, 64, 0.12)', justifyContent: 'center', alignItems: 'center' }}
            >
              <ShieldAlert size={18} color="#2E4F40" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={{ flexDirection: 'row', backgroundColor: palette.inputBg, borderRadius: 12, padding: 4, marginTop: 12 }}>
          <TouchableOpacity
            onPress={() => {
              triggerLightHaptic();
              setActiveTab('MY_PRAYERS');
            }}
            style={[
              styles.tabBtn,
              { backgroundColor: activeTab === 'MY_PRAYERS' ? palette.accentGreen : 'transparent' },
            ]}
          >
            <Lock size={14} color={activeTab === 'MY_PRAYERS' ? '#FFFFFF' : palette.textSecondary} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: activeTab === 'MY_PRAYERS' ? '#FFFFFF' : palette.textSecondary }}>
              My Journal ({privatePrayers.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              triggerLightHaptic();
              setActiveTab('COMMUNITY');
            }}
            style={[
              styles.tabBtn,
              { backgroundColor: activeTab === 'COMMUNITY' ? palette.accentGreen : 'transparent' },
            ]}
          >
            <Globe size={14} color={activeTab === 'COMMUNITY' ? '#FFFFFF' : palette.textSecondary} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: activeTab === 'COMMUNITY' ? '#FFFFFF' : palette.textSecondary }}>
              Community Burdens
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content Body */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'MY_PRAYERS' ? (
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: palette.textPrimary }}>
                Private Prayer Journal
              </Text>
              <TouchableOpacity
                onPress={() => {
                  triggerLightHaptic();
                  setIsAddPrivateOpen(true);
                }}
                style={{ backgroundColor: palette.accentGreen, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                <Plus size={16} color="#FFFFFF" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>New Prayer</Text>
              </TouchableOpacity>
            </View>

            {privatePrayers.length === 0 ? (
              <View style={{ padding: 30, alignItems: 'center' }}>
                <Heart size={36} color={palette.textMuted} />
                <Text style={{ fontSize: 15, fontWeight: '600', color: palette.textSecondary, marginTop: 12 }}>
                  Your private prayer journal is empty.
                </Text>
                <Text style={{ fontSize: 13, color: palette.textMuted, textAlign: 'center', marginTop: 4 }}>
                  Bring your personal burdens, gratitude, and intentions to God in prayer.
                </Text>
              </View>
            ) : (
              privatePrayers.map((prayer) => (
                <View
                  key={prayer.id}
                  style={{
                    backgroundColor: palette.card,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: prayer.status === 'answered' ? palette.accentGreen : palette.cardBorder,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <View style={{ backgroundColor: palette.accentGreenLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: palette.accentGreen, textTransform: 'uppercase' }}>
                        {prayer.category}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: prayer.status === 'answered' ? palette.accentGreen : palette.accentGold,
                      }}
                    >
                      {prayer.status === 'answered' ? '✓ Answered' : '• Praying'}
                    </Text>
                  </View>

                  <Text style={{ fontSize: 16, fontWeight: '700', color: palette.textPrimary, marginBottom: 4 }}>
                    {prayer.title}
                  </Text>
                  <Text style={{ fontSize: 14, color: palette.textSecondary, lineHeight: 20, marginBottom: 12 }}>
                    {prayer.content}
                  </Text>

                  {prayer.status === 'answered' && prayer.answerNote ? (
                    <View style={{ backgroundColor: palette.accentGreenLight, borderRadius: 10, padding: 10, marginBottom: 10 }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: palette.accentGreen, marginBottom: 2 }}>
                        God's Answer / Outcome:
                      </Text>
                      <Text style={{ fontSize: 13, color: palette.textPrimary }}>
                        {prayer.answerNote}
                      </Text>
                    </View>
                  ) : null}

                  {prayer.status !== 'answered' && (
                    <TouchableOpacity
                      onPress={() => {
                        triggerLightHaptic();
                        setTargetPrayerId(prayer.id);
                        setIsAnswerModalOpen(true);
                      }}
                      style={{
                        backgroundColor: palette.accentGoldLight,
                        paddingVertical: 8,
                        borderRadius: 8,
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '700', color: palette.accentGold }}>
                        Mark Prayer Answered 🙌
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        ) : (
          /* COMMUNITY PRAYER REQUESTS */
          <View>
            {/* Filter Pills & Share Action */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity
                  onPress={() => setFeedFilter('GLOBAL')}
                  style={[styles.filterChip, feedFilter === 'GLOBAL' && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, feedFilter === 'GLOBAL' && styles.filterChipTextActive]}>
                    Global Feed
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setFeedFilter('FOLLOWING')}
                  style={[styles.filterChip, feedFilter === 'FOLLOWING' && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, feedFilter === 'FOLLOWING' && styles.filterChipTextActive]}>
                    Following
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => {
                  triggerLightHaptic();
                  setIsAddCommunityOpen(true);
                }}
                style={{ backgroundColor: palette.accentGreen, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}
              >
                <Plus size={16} color="#FFFFFF" />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>Share Burden</Text>
              </TouchableOpacity>
            </View>

            {displayedCommunityPrayers.map((cPrayer) => {
              const authorId = cPrayer.authorId || `author-${cPrayer.authorName}`;
              const isFollowingAuthor = followedUserIds.includes(authorId);

              return (
                <View
                  key={cPrayer.id}
                  style={{
                    backgroundColor: palette.card,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: palette.cardBorder,
                    padding: 18,
                    marginBottom: 14,
                  }}
                >
                  {/* Card Header: Author, Follow, Category, Report */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: palette.textPrimary }}>
                        {cPrayer.isAnonymous ? 'Anonymous Believer' : cPrayer.authorName}
                      </Text>

                      {!cPrayer.isAnonymous && (
                        <TouchableOpacity
                          onPress={() => {
                            triggerLightHaptic();
                            toggleFollowUser(authorId);
                          }}
                          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isFollowingAuthor ? 'rgba(46, 79, 64, 0.08)' : 'transparent', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}
                        >
                          {isFollowingAuthor ? (
                            <UserCheck size={13} color="#2E4F40" />
                          ) : (
                            <UserPlus size={13} color="#7A828A" />
                          )}
                          <Text style={{ fontSize: 11, fontWeight: '600', color: isFollowingAuthor ? '#2E4F40' : '#7A828A', marginLeft: 3 }}>
                            {isFollowingAuthor ? 'Following' : 'Follow'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ backgroundColor: palette.inputBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: palette.textMuted }}>
                          {cPrayer.category}
                        </Text>
                      </View>

                      <TouchableOpacity onPress={() => handleReport(cPrayer.id)}>
                        <Flag size={14} color="#7A828A" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={{ fontSize: 16, fontWeight: '700', color: palette.textPrimary, marginBottom: 6 }}>
                    {cPrayer.title}
                  </Text>
                  <Text style={{ fontSize: 14, color: palette.textSecondary, lineHeight: 21, marginBottom: 14 }}>
                    {cPrayer.burdenText}
                  </Text>

                  {/* Updates */}
                  {cPrayer.updates.length > 0 && (
                    <View style={{ backgroundColor: palette.inputBg, borderRadius: 10, padding: 10, marginBottom: 12 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: palette.accentGreen, textTransform: 'uppercase', marginBottom: 4 }}>
                        Update from Author:
                      </Text>
                      {cPrayer.updates.map((u) => (
                        <Text key={u.id} style={{ fontSize: 13, color: palette.textPrimary }}>
                          • {u.text}
                        </Text>
                      ))}
                    </View>
                  )}

                  {/* 3-Reaction Bar */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: palette.border }}>
                    {/* Reaction 1: I Prayed */}
                    <TouchableOpacity
                      onPress={() => handlePrayNow(cPrayer.id)}
                      activeOpacity={0.8}
                      style={[
                        styles.reactionBtn,
                        { backgroundColor: cPrayer.userHasPrayed ? 'rgba(200, 150, 62, 0.15)' : palette.inputBg },
                      ]}
                    >
                      <Text style={{ fontSize: 12 }}>🙏</Text>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: cPrayer.userHasPrayed ? palette.accentGold : palette.textSecondary }}>
                        {cPrayer.prayerCount} Prayed
                      </Text>
                    </TouchableOpacity>

                    {/* Reaction 2: Standing With You */}
                    <TouchableOpacity
                      onPress={() => handleStandingWithYou(cPrayer.id)}
                      activeOpacity={0.8}
                      style={[
                        styles.reactionBtn,
                        { backgroundColor: cPrayer.userStandingWithYou ? 'rgba(46, 79, 64, 0.15)' : palette.inputBg },
                      ]}
                    >
                      <Hand size={13} color={cPrayer.userStandingWithYou ? palette.accentGreen : palette.textSecondary} />
                      <Text style={{ fontSize: 12, fontWeight: '700', color: cPrayer.userStandingWithYou ? palette.accentGreen : palette.textSecondary }}>
                        {cPrayer.standingCount || 0} Standing
                      </Text>
                    </TouchableOpacity>

                    {/* Reaction 3: Support */}
                    <TouchableOpacity
                      onPress={() => handleSupport(cPrayer.id)}
                      activeOpacity={0.8}
                      style={[
                        styles.reactionBtn,
                        { backgroundColor: cPrayer.userSupported ? 'rgba(217, 83, 79, 0.12)' : palette.inputBg },
                      ]}
                    >
                      <Heart size={13} color={cPrayer.userSupported ? '#D9534F' : palette.textSecondary} />
                      <Text style={{ fontSize: 12, fontWeight: '700', color: cPrayer.userSupported ? '#D9534F' : palette.textSecondary }}>
                        {cPrayer.supportCount || 0} Support
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Add Private Prayer Modal */}
      <Modal visible={isAddPrivateOpen} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: palette.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: palette.textPrimary }}>New Private Prayer</Text>
              <TouchableOpacity onPress={() => setIsAddPrivateOpen(false)}>
                <X size={20} color={palette.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Prayer Title / Burden"
              placeholderTextColor={palette.textMuted}
              value={newTitle}
              onChangeText={setNewTitle}
              style={[styles.input, { backgroundColor: palette.inputBg, color: palette.textPrimary, borderColor: palette.border }]}
            />

            <TextInput
              placeholder="Write your private prayer or intention..."
              placeholderTextColor={palette.textMuted}
              value={newContent}
              onChangeText={setNewContent}
              multiline
              numberOfLines={4}
              style={[styles.input, { backgroundColor: palette.inputBg, color: palette.textPrimary, borderColor: palette.border, height: 100, textAlignVertical: 'top' }]}
            />

            <TouchableOpacity onPress={handleSavePrivate} style={{ backgroundColor: palette.accentGreen, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>Save Private Prayer</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Community Prayer Modal */}
      <Modal visible={isAddCommunityOpen} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: palette.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: palette.textPrimary }}>Ask Community for Prayer</Text>
              <TouchableOpacity onPress={() => setIsAddCommunityOpen(false)}>
                <X size={20} color={palette.textSecondary} />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Short Title of Your Burden"
              placeholderTextColor={palette.textMuted}
              value={newTitle}
              onChangeText={setNewTitle}
              style={[styles.input, { backgroundColor: palette.inputBg, color: palette.textPrimary, borderColor: palette.border }]}
            />

            <TextInput
              placeholder="Describe what you are asking God for..."
              placeholderTextColor={palette.textMuted}
              value={newContent}
              onChangeText={setNewContent}
              multiline
              numberOfLines={4}
              style={[styles.input, { backgroundColor: palette.inputBg, color: palette.textPrimary, borderColor: palette.border, height: 100, textAlignVertical: 'top' }]}
            />

            <TouchableOpacity
              onPress={() => setIsAnonymous(!isAnonymous)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}
            >
              <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: palette.accentGreen, backgroundColor: isAnonymous ? palette.accentGreen : 'transparent', alignItems: 'center', justifyContent: 'center' }} />
              <Text style={{ fontSize: 14, color: palette.textPrimary }}>Post Anonymously</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSaveCommunity} style={{ backgroundColor: palette.accentGreen, paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>Share Request</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Answered Prayer Note Modal */}
      <Modal visible={isAnswerModalOpen} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: palette.card, borderRadius: 20, width: '85%', padding: 24, borderWidth: 1, borderColor: palette.cardBorder }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: palette.textPrimary, marginBottom: 6 }}>
              Prayer Answered 🙌
            </Text>
            <Text style={{ fontSize: 13, color: palette.textSecondary, marginBottom: 14 }}>
              What happened? Record God's goodness and how He answered your prayer:
            </Text>

            <TextInput
              placeholder="Describe the answer or outcome..."
              placeholderTextColor={palette.textMuted}
              value={answerNote}
              onChangeText={setAnswerNote}
              multiline
              numberOfLines={3}
              style={[styles.input, { backgroundColor: palette.inputBg, color: palette.textPrimary, borderColor: palette.border, height: 80, textAlignVertical: 'top' }]}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity onPress={() => setIsAnswerModalOpen(false)} style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: palette.inputBg, alignItems: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: palette.textSecondary }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleConfirmAnswered} style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: palette.accentGreen, alignItems: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>Record Answer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFEAE1',
  },
  filterChipActive: {
    backgroundColor: '#2E4F40',
    borderColor: '#2E4F40',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7A828A',
  },
  filterChipTextActive: {
    color: '#FAF7F2',
    fontWeight: '700',
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },
});
