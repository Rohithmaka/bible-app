import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  Alert,
  Share,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Users, PlusCircle, Key, ShieldCheck, User, Share2, X } from 'lucide-react-native';
import { useSpiritualStore, PrayerCircle } from '../store/useSpiritualStore';
import { triggerLightHaptic, triggerSuccessHaptic } from '../services/mobileHaptics';

export default function PrayerCirclesScreen() {
  const router = useRouter();
  const { prayerCircles, createPrayerCircle, joinCircleByCode } = useSpiritualStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  // Form states
  const [circleName, setCircleName] = useState('');
  const [category, setCategory] = useState<'family' | 'church' | 'friends' | 'small-group' | 'other'>('family');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [inviteCodeInput, setInviteCodeInput] = useState('');

  const handleCreate = () => {
    if (!circleName.trim()) {
      Alert.alert('Required Field', 'Please enter a name for your prayer circle.');
      return;
    }
    const created = createPrayerCircle(circleName.trim(), category, description.trim(), isPrivate);
    triggerSuccessHaptic();
    setIsCreateModalOpen(false);
    setCircleName('');
    setDescription('');
    Alert.alert('Circle Created! 🎉', `Share Invite Code: ${created.inviteCode}`);
  };

  const handleJoin = () => {
    if (!inviteCodeInput.trim()) return;
    const success = joinCircleByCode(inviteCodeInput.trim());
    if (success) {
      triggerSuccessHaptic();
      setIsJoinModalOpen(false);
      setInviteCodeInput('');
      Alert.alert('Joined Circle!', 'You have joined the prayer circle successfully.');
    } else {
      Alert.alert('Invalid Code', 'Circle code not found. Please check and try again.');
    }
  };

  const handleShareCode = async (circle: PrayerCircle) => {
    triggerLightHaptic();
    try {
      await Share.share({
        message: `Join our private Prayer Circle "${circle.name}" on the Holy Bible & Prayer App! Use Invite Code: ${circle.inviteCode}`,
      });
    } catch (e) {
      console.log('Share canceled');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Prayer Circles',
          headerStyle: { backgroundColor: '#FAF7F2' },
          headerTintColor: '#121417',
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner Header */}
        <View style={styles.bannerCard}>
          <View style={styles.iconCircle}>
            <Users size={26} color="#C8963E" />
          </View>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>Private Prayer Circles</Text>
            <Text style={styles.bannerSubtitle}>
              Pray together in trusted circles with family, your church, or small group.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.primaryBtn]}
            activeOpacity={0.8}
            onPress={() => {
              triggerLightHaptic();
              setIsCreateModalOpen(true);
            }}
          >
            <PlusCircle size={20} color="#FAF7F2" />
            <Text style={styles.primaryBtnText}>Create Circle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.secondaryBtn]}
            activeOpacity={0.8}
            onPress={() => {
              triggerLightHaptic();
              setIsJoinModalOpen(true);
            }}
          >
            <Key size={18} color="#2E4F40" />
            <Text style={styles.secondaryBtnText}>Join via Code</Text>
          </TouchableOpacity>
        </View>

        {/* Circles List */}
        <Text style={styles.sectionHeader}>Your Active Circles ({prayerCircles.length})</Text>

        {prayerCircles.map((circle) => (
          <View key={circle.id} style={styles.circleCard}>
            <View style={styles.circleHeaderRow}>
              <View style={styles.tagBadge}>
                <ShieldCheck size={13} color="#2E4F40" />
                <Text style={styles.tagText}>{circle.category.toUpperCase()}</Text>
              </View>
              <Text style={styles.memberCountText}>
                <User size={12} color="#7A828A" /> {circle.memberCount} Members
              </Text>
            </View>

            <Text style={styles.circleTitle}>{circle.name}</Text>
            <Text style={styles.circleDesc}>{circle.description || 'Shared prayer request circle.'}</Text>

            <View style={styles.inviteBox}>
              <View>
                <Text style={styles.inviteLabel}>INVITE CODE</Text>
                <Text style={styles.inviteCode}>{circle.inviteCode}</Text>
              </View>

              <TouchableOpacity
                style={styles.shareBtn}
                onPress={() => handleShareCode(circle)}
              >
                <Share2 size={16} color="#2E4F40" />
                <Text style={styles.shareBtnText}>Share Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal: Create Circle */}
      <Modal visible={isCreateModalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Prayer Circle</Text>
              <TouchableOpacity onPress={() => setIsCreateModalOpen(false)}>
                <X size={24} color="#121417" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Circle Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Grace Family Prayer"
              value={circleName}
              onChangeText={setCircleName}
              placeholderTextColor="#7A828A"
            />

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.catRow}>
              {(['family', 'church', 'friends', 'small-group', 'other'] as const).map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catChip, category === cat && styles.catChipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.catChipText, category === cat && styles.catChipTextActive]}>
                    {cat.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, { height: 70 }]}
              placeholder="Brief description of this circle's purpose..."
              value={description}
              onChangeText={setDescription}
              multiline
              placeholderTextColor="#7A828A"
            />

            <TouchableOpacity style={styles.submitModalBtn} onPress={handleCreate}>
              <Text style={styles.submitModalBtnText}>Create Circle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: Join Circle */}
      <Modal visible={isJoinModalOpen} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Join via Invite Code</Text>
              <TouchableOpacity onPress={() => setIsJoinModalOpen(false)}>
                <X size={24} color="#121417" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Invite Code</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. GRACE-FAM-2026"
              value={inviteCodeInput}
              onChangeText={setInviteCodeInput}
              autoCapitalize="characters"
              placeholderTextColor="#7A828A"
            />

            <TouchableOpacity style={styles.submitModalBtn} onPress={handleJoin}>
              <Text style={styles.submitModalBtnText}>Join Circle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  scrollContent: {
    padding: 18,
    gap: 16,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEAE1',
    gap: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(200, 150, 62, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#121417',
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#7A828A',
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtn: {
    backgroundColor: '#2E4F40',
  },
  primaryBtnText: {
    color: '#FAF7F2',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2E4F40',
  },
  secondaryBtnText: {
    color: '#2E4F40',
    fontWeight: '700',
    fontSize: 14,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#121417',
    marginTop: 6,
  },
  circleCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFEAE1',
    gap: 8,
  },
  circleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(46, 79, 64, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E4F40',
  },
  memberCountText: {
    fontSize: 12,
    color: '#7A828A',
  },
  circleTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#121417',
  },
  circleDesc: {
    fontSize: 13,
    color: '#4A525A',
    lineHeight: 18,
  },
  inviteBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAF7F2',
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  inviteLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7A828A',
  },
  inviteCode: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2E4F40',
    letterSpacing: 1,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EFEAE1',
  },
  shareBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E4F40',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#121417',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#121417',
    marginTop: 4,
  },
  textInput: {
    backgroundColor: '#FAF7F2',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#121417',
    borderWidth: 1,
    borderColor: '#EFEAE1',
  },
  catRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FAF7F2',
    borderWidth: 1,
    borderColor: '#EFEAE1',
  },
  catChipActive: {
    backgroundColor: '#2E4F40',
    borderColor: '#2E4F40',
  },
  catChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7A828A',
  },
  catChipTextActive: {
    color: '#FAF7F2',
  },
  submitModalBtn: {
    backgroundColor: '#2E4F40',
    height: 46,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitModalBtnText: {
    color: '#FAF7F2',
    fontWeight: '700',
    fontSize: 15,
  },
});
