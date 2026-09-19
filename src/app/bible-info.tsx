import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TRANSLATION_CATALOG, TranslationLicenseInfo } from '../engine/translationCatalog';
import { SpiritualTheme } from '../constants/spiritualTheme';
import { useBibleStore } from '../store/useBibleStore';
import { ChevronLeft, ShieldCheck, ExternalLink, Globe, BookOpen, AlertCircle } from 'lucide-react-native';

export default function BibleInfoScreen() {
  const router = useRouter();
  const { themeMode } = useBibleStore();
  const isDark = themeMode === 'dark';
  const palette = isDark ? SpiritualTheme.dark : SpiritualTheme.light;

  const handleOpenUrl = (url: string) => {
    if (url) {
      Linking.openURL(url).catch((err) => console.warn('Cannot open URL:', err));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: (palette as any).border || palette.cardBorder }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color={palette.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: palette.textPrimary }]}>Bible Licensing & Info</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <View style={[styles.banner, { backgroundColor: (palette as any).cardBg || palette.card, borderColor: (palette as any).border || palette.cardBorder }]}>
          <ShieldCheck size={28} color="#D97706" />
          <View style={styles.bannerTextContainer}>
            <Text style={[styles.bannerTitle, { color: palette.textPrimary }]}>Verified Legal Compliance</Text>
            <Text style={[styles.bannerDescription, { color: palette.textSecondary }]}>
              ALTER is strictly committed to respecting scripture copyright and licensing laws. All activated translations are either in the Public Domain or used under verified open licenses (e.g. Creative Commons BY-SA 4.0).
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          Active Translation Catalog ({TRANSLATION_CATALOG.length})
        </Text>

        {TRANSLATION_CATALOG.map((item: TranslationLicenseInfo) => (
          <View key={item.translationId} style={[styles.card, { backgroundColor: (palette as any).cardBg || palette.card, borderColor: (palette as any).border || palette.cardBorder }]}>
            <View style={styles.cardHeader}>
              <View style={styles.badgeRow}>
                <View style={styles.abbrBadge}>
                  <Text style={styles.abbrText}>{item.abbreviation}</Text>
                </View>
                <View style={[styles.licenseBadge, item.licenseType.includes('CC') ? styles.ccBadge : styles.pdBadge]}>
                  <Text style={styles.licenseBadgeText}>{item.licenseType}</Text>
                </View>
              </View>

              <Text style={[styles.translationName, { color: palette.textPrimary }]}>{item.fullName}</Text>
              <Text style={[styles.languageText, { color: palette.textSecondary }]}>
                {item.languageName} • {item.countryRegion || 'Global'}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: palette.border }]} />

            <View style={styles.cardBody}>
              <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>Copyright Holder</Text>
              <Text style={[styles.fieldValue, { color: palette.textPrimary }]}>{item.copyrightHolder}</Text>

              <Text style={[styles.fieldLabel, { color: palette.textSecondary, marginTop: 8 }]}>Copyright Notice</Text>
              <Text style={[styles.noticeText, { color: palette.textPrimary, backgroundColor: isDark ? '#1F2937' : '#F9FAFB' }]}>
                {item.copyrightNotice}
              </Text>

              <View style={styles.linkRow}>
                {item.sourceUrl ? (
                  <TouchableOpacity style={styles.linkButton} onPress={() => handleOpenUrl(item.sourceUrl)}>
                    <Globe size={14} color="#D97706" />
                    <Text style={styles.linkText}>Official Source</Text>
                    <ExternalLink size={12} color="#D97706" />
                  </TouchableOpacity>
                ) : null}

                {item.licenseUrl ? (
                  <TouchableOpacity style={styles.linkButton} onPress={() => handleOpenUrl(item.licenseUrl)}>
                    <BookOpen size={14} color="#D97706" />
                    <Text style={styles.linkText}>License Terms</Text>
                    <ExternalLink size={12} color="#D97706" />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
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
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
  },
  banner: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: 'flex-start',
    gap: 12,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  bannerDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  cardHeader: {
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  abbrBadge: {
    backgroundColor: '#D97706',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  abbrText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  licenseBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pdBadge: {
    backgroundColor: '#059669',
  },
  ccBadge: {
    backgroundColor: '#2563EB',
  },
  licenseBadgeText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  translationName: {
    fontSize: 17,
    fontWeight: '700',
  },
  languageText: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  cardBody: {},
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    padding: 10,
    borderRadius: 8,
    fontStyle: 'italic',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 14,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  linkText: {
    color: '#D97706',
    fontWeight: '600',
    fontSize: 13,
  },
});
