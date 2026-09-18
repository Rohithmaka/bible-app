import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Platform, Alert } from 'react-native';
import { useBibleStore, ThemeMode, BibleTranslation } from '../../store/useBibleStore';
import { Sun, Moon, Coffee, Type, BookOpen, Volume2, ShieldCheck, RefreshCw, Check } from 'lucide-react-native';

export default function SettingsScreen() {
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

        {/* App Info & Data Options */}
        <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor }]}>
          <TouchableOpacity onPress={handleResetData} style={styles.resetRow}>
            <RefreshCw size={18} color="#EF4444" style={{ marginRight: 10 }} />
            <Text style={styles.resetText}>Reset Preferences to Default</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
});
