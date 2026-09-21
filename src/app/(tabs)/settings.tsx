import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Platform, Alert, Modal } from 'react-native';
import { useBibleStore, ThemeMode, BibleTranslation } from '../../store/useBibleStore';
import { Sun, Moon, Coffee, Type, BookOpen, Volume2, ShieldCheck, RefreshCw, Check, ChevronRight, X } from 'lucide-react-native';

export default function SettingsScreen() {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const {
    themeMode,
    setThemeMode,
    fontSize,
    setFontSize,
    translation,
    setTranslation,
    playbackSpeed,
    setPlaybackSpeed,
  } = useBibleStore();

  const isDark = themeMode === 'dark';
  const bgColor = isDark ? '#0F172A' : '#F8FAFC';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const borderColor = isDark ? '#334155' : '#E2E8F0';

  const handleResetData = () => {
    Alert.alert(
      'Reset Local Data',
      'Are you sure you want to reset reader preferences to defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setThemeMode('light');
            setFontSize('md');
            setTranslation('KJV');
            setPlaybackSpeed(1.0);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.headerArea}>
        <Text style={[styles.pageTitle, { color: textColor }]}>App Settings</Text>
        <Text style={styles.pageSub}>Customize your Bible reading experience</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Reader Theme Presets */}
        <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.sectionHeader}>
            <Sun size={20} color="#4F46E5" style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { color: textColor }]}>Reader Theme</Text>
          </View>

          <View style={styles.themeOptionsRow}>
            <TouchableOpacity
              onPress={() => setThemeMode('light')}
              style={[
                styles.themeCard,
                { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
                themeMode === 'light' && styles.themeCardActive,
              ]}
            >
              <Sun size={22} color="#F59E0B" />
              <Text style={styles.themeTextLight}>Holy Light</Text>
              {themeMode === 'light' && <Check size={16} color="#4F46E5" />}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setThemeMode('dark')}
              style={[
                styles.themeCard,
                { backgroundColor: '#0F172A', borderColor: '#334155' },
                themeMode === 'dark' && styles.themeCardActive,
              ]}
            >
              <Moon size={22} color="#94A3B8" />
              <Text style={styles.themeTextDark}>Sanctuary Dark</Text>
              {themeMode === 'dark' && <Check size={16} color="#818CF8" />}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setThemeMode('sepia')}
              style={[
                styles.themeCard,
                { backgroundColor: '#FDFBF7', borderColor: '#E6CCB2' },
                themeMode === 'sepia' && styles.themeCardActive,
              ]}
            >
              <Coffee size={22} color="#9C6644" />
              <Text style={styles.themeTextSepia}>Warm Sepia</Text>
              {themeMode === 'sepia' && <Check size={16} color="#9C6644" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Font Size Selector */}
        <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.sectionHeader}>
            <Type size={20} color="#4F46E5" style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { color: textColor }]}>Text Size</Text>
          </View>

          <View style={styles.fontSizeGrid}>
            {(['sm', 'md', 'lg', 'xl'] as const).map((size) => {
              const labels = { sm: 'Small (15px)', md: 'Medium (17px)', lg: 'Large (20px)', xl: 'Extra Large (24px)' };
              const isActive = fontSize === size;
              return (
                <TouchableOpacity
                  key={size}
                  onPress={() => setFontSize(size)}
                  style={[
                    styles.fontSizeBtn,
                    { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' },
                    isActive && styles.fontSizeBtnActive,
                  ]}
                >
                  <Text style={[styles.fontSizeLabel, { color: textColor }, isActive && { color: '#FFFFFF' }]}>
                    {labels[size]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Bible Translation Picker */}
        <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.sectionHeader}>
            <BookOpen size={20} color="#4F46E5" style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { color: textColor }]}>Translation</Text>
          </View>

          <View style={styles.transList}>
            <TouchableOpacity
              onPress={() => setTranslation('KJV')}
              style={[
                styles.transRow,
                { borderColor },
                translation === 'KJV' && styles.transRowActive,
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.transTitle, { color: textColor }]}>King James Version (KJV)</Text>
                <Text style={styles.transSub}>Classic traditional English translation</Text>
              </View>
              {translation === 'KJV' && <Check size={18} color="#4F46E5" />}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTranslation('WEB')}
              style={[
                styles.transRow,
                { borderColor },
                translation === 'WEB' && styles.transRowActive,
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.transTitle, { color: textColor }]}>World English Bible (WEB)</Text>
                <Text style={styles.transSub}>Modern public-domain English translation</Text>
              </View>
              {translation === 'WEB' && <Check size={18} color="#4F46E5" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy & Trust Center */}
        <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.sectionHeader}>
            <ShieldCheck size={20} color="#10B981" style={{ marginRight: 8 }} />
            <Text style={[styles.sectionTitle, { color: textColor }]}>Privacy & Trust</Text>
          </View>

          <TouchableOpacity
            onPress={() => setIsPrivacyModalOpen(true)}
            style={[styles.privacyRow, { borderColor }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.transTitle, { color: textColor }]}>Privacy & Community Rules</Text>
              <Text style={styles.transSub}>How your data is protected & community guidelines</Text>
            </View>
            <ChevronRight size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* App Info & Data Options */}
        <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor }]}>
          <TouchableOpacity onPress={handleResetData} style={styles.resetRow}>
            <RefreshCw size={18} color="#EF4444" style={{ marginRight: 10 }} />
            <Text style={styles.resetText}>Reset Preferences to Default</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Privacy Rules Modal */}
      <Modal
        visible={isPrivacyModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPrivacyModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: cardBg, borderColor }]}>
            <View style={[styles.modalHeader, { borderColor }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ShieldCheck size={22} color="#10B981" style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: textColor }]}>Privacy & Community Rules</Text>
              </View>
              <TouchableOpacity onPress={() => setIsPrivacyModalOpen(false)} style={styles.closeBtn}>
                <X size={20} color={textColor} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Privacy Item 1 */}
              <View style={[styles.ruleCard, { borderColor, backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                <Text style={styles.ruleIcon}>🛡️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.ruleTitle, { color: textColor }]}>Your Devotionals Are Private</Text>
                  <Text style={styles.ruleDesc}>
                    Your personal study notes, private prayer journal, and bookmarks belong only to you. We never share them with other users.
                  </Text>
                </View>
              </View>

              {/* Privacy Item 2 */}
              <View style={[styles.ruleCard, { borderColor, backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                <Text style={styles.ruleIcon}>👤</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.ruleTitle, { color: textColor }]}>Anonymous by Design</Text>
                  <Text style={styles.ruleDesc}>
                    You do not need to create an account, type your real name, or give a password. You can use the app completely as a guest.
                  </Text>
                </View>
              </View>

              {/* Privacy Item 3 */}
              <View style={[styles.ruleCard, { borderColor, backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                <Text style={styles.ruleIcon}>🚫</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.ruleTitle, { color: textColor }]}>Zero Ads & No Data Selling</Text>
                  <Text style={styles.ruleDesc}>
                    We will never sell your spiritual reflections, reading habits, or identity to advertising brokers or third parties.
                  </Text>
                </View>
              </View>

              {/* Privacy Item 4 */}
              <View style={[styles.ruleCard, { borderColor, backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                <Text style={styles.ruleIcon}>🤝</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.ruleTitle, { color: textColor }]}>Community Fellowship Rules</Text>
                  <Text style={styles.ruleDesc}>
                    Public prayer burdens must be reverent and respectful. Inappropriate, hateful, or commercial content is strictly prohibited and will be removed immediately.
                  </Text>
                </View>
              </View>

              {/* Privacy Item 5 */}
              <View style={[styles.ruleCard, { borderColor, backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                <Text style={styles.ruleIcon}>🗑️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.ruleTitle, { color: textColor }]}>Data Deletion Rights</Text>
                  <Text style={styles.ruleDesc}>
                    You can clear all local storage anytime using "Reset Preferences", or email support to permanently delete any cloud records.
                  </Text>
                </View>
              </View>

              {/* Contact Box */}
              <View style={[styles.contactBox, { backgroundColor: isDark ? 'rgba(79, 70, 229, 0.12)' : 'rgba(79, 70, 229, 0.06)' }]}>
                <Text style={[styles.contactTitle, { color: '#4F46E5' }]}>Official Privacy & Support Contact</Text>
                <Text style={[styles.contactEmail, { color: textColor }]}>selabibleapp@gmail.com</Text>
                <Text style={styles.contactSub}>Questions or data requests will be answered within 48 hours.</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 36 : 0,
  },
  headerArea: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
  },
  pageSub: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  sectionCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  themeOptionsRow: {
    gap: 10,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  themeCardActive: {
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  themeTextLight: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    marginLeft: 12,
  },
  themeTextDark: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    flex: 1,
    marginLeft: 12,
  },
  themeTextSepia: {
    fontSize: 14,
    fontWeight: '700',
    color: '#432818',
    flex: 1,
    marginLeft: 12,
  },
  fontSizeGrid: {
    gap: 8,
  },
  fontSizeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  fontSizeBtnActive: {
    backgroundColor: '#4F46E5',
  },
  fontSizeLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  transList: {
    gap: 10,
  },
  transRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  transRowActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  transTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  transSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  resetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  resetText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: '85%',
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
  },
  modalScroll: {
    padding: 20,
    gap: 12,
  },
  ruleCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'flex-start',
    gap: 12,
  },
  ruleIcon: {
    fontSize: 22,
    marginTop: 2,
  },
  ruleTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  ruleDesc: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 19,
  },
  contactBox: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  contactTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  contactEmail: {
    fontSize: 16,
    fontWeight: '800',
  },
  contactSub: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 2,
  },
});
