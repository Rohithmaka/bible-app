import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ShieldAlert, CheckCircle2, User, Check, Trash2 } from 'lucide-react-native';
import { useSpiritualStore } from '../store/useSpiritualStore';
import { triggerLightHaptic, triggerSuccessHaptic } from '../services/mobileHaptics';

export default function AdminPanelScreen() {
  const router = useRouter();
  const { communityPrayers, approveFlaggedPrayer, deleteFlaggedPrayer } = useSpiritualStore();

  const flaggedPrayers = communityPrayers.filter((p) => p.isReported);

  const handleApprove = (id: string) => {
    triggerSuccessHaptic();
    approveFlaggedPrayer(id);
    Alert.alert('Approved', 'Prayer request approved and unflagged.');
  };

  const handleDelete = (id: string) => {
    triggerLightHaptic();
    Alert.alert('Confirm Delete', 'Are you sure you want to remove this prayer request from the platform?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteFlaggedPrayer(id);
          triggerSuccessHaptic();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Safety & Moderation Panel',
          headerStyle: { backgroundColor: '#FAF7F2' },
          headerTintColor: '#121417',
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={styles.adminBanner}>
          <ShieldAlert size={32} color="#C8963E" />
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>Admin Safety Queue</Text>
            <Text style={styles.bannerDesc}>
              Review reported burdens, detect sensitive content, and maintain a safe, reverent community environment.
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{flaggedPrayers.length}</Text>
            <Text style={styles.statLabel}>Pending Review</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNum}>{communityPrayers.length}</Text>
            <Text style={styles.statLabel}>Total Requests</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNum}>100%</Text>
            <Text style={styles.statLabel}>Safe Status</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Reported Queue ({flaggedPrayers.length})</Text>

        {flaggedPrayers.length === 0 ? (
          <View style={styles.emptyCard}>
            <CheckCircle2 size={44} color="#2E4F40" />
            <Text style={styles.emptyTitle}>Moderation Queue Clear!</Text>
            <Text style={styles.emptyDesc}>No reported or flagged prayer requests at this time.</Text>
          </View>
        ) : (
          flaggedPrayers.map((prayer) => (
            <View key={prayer.id} style={styles.flagCard}>
              <View style={styles.flagHeader}>
                <View style={styles.authorBadge}>
                  <User size={13} color="#7A828A" />
                  <Text style={styles.authorName}>{prayer.authorName}</Text>
                </View>

                <View style={styles.reasonBadge}>
                  <Text style={styles.reasonText}>{prayer.reportReason || 'Flagged for Review'}</Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>{prayer.title}</Text>
              <Text style={styles.cardText}>{prayer.burdenText}</Text>

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(prayer.id)}>
                  <Check size={16} color="#FAF7F2" />
                  <Text style={styles.approveBtnText}>Approve</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(prayer.id)}>
                  <Trash2 size={16} color="#D9534F" />
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEAE1',
    gap: 14,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#121417',
  },
  bannerDesc: {
    fontSize: 12,
    color: '#7A828A',
    lineHeight: 17,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEAE1',
    alignItems: 'center',
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2E4F40',
  },
  statLabel: {
    fontSize: 11,
    color: '#7A828A',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#121417',
    marginTop: 6,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEAE1',
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#121417',
  },
  emptyDesc: {
    fontSize: 13,
    color: '#7A828A',
    textAlign: 'center',
  },
  flagCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(217, 83, 79, 0.3)',
    gap: 10,
  },
  flagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#121417',
  },
  reasonBadge: {
    backgroundColor: 'rgba(217, 83, 79, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  reasonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D9534F',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#121417',
  },
  cardText: {
    fontSize: 13,
    color: '#4A525A',
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    backgroundColor: '#2E4F40',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  approveBtnText: {
    color: '#FAF7F2',
    fontWeight: '700',
    fontSize: 13,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9534F',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  deleteBtnText: {
    color: '#D9534F',
    fontWeight: '700',
    fontSize: 13,
  },
});
