import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useBibleStore } from '../store/useBibleStore';
import { useSpiritualStore } from '../store/useSpiritualStore';
import { BIBLE_BOOKS, getChapterVerses } from '../data/bibleData';
import { SpiritualTheme, ScriptureTypography, isTeluguScript } from '../constants/spiritualTheme';
import { triggerSuccessHaptic, triggerLightHaptic } from '../services/mobileHaptics';
import { X, Sparkles } from 'lucide-react-native';

export default function StudyWorkspaceScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams();

  const { themeMode } = useBibleStore();
  const { saveBibleStudy } = useSpiritualStore();

  const isDark = themeMode === 'dark';
  const palette = isDark ? SpiritualTheme.dark : SpiritualTheme.light;

  const bookId = (searchParams.bookId as string) || 'PRO';
  const chapter = searchParams.chapter ? parseInt(searchParams.chapter as string, 10) : 3;
  const verseNum = searchParams.verse ? parseInt(searchParams.verse as string, 10) : 5;

  const book = BIBLE_BOOKS.find((b) => b.id === bookId) || BIBLE_BOOKS[0];
  const verses = getChapterVerses(book.id, chapter);
  const targetVerse = verses.find((v) => v.verse === verseNum) || verses[0] || { verse: 1, text: 'Trust in the Lord with all your heart...' };

  const verseKey = `${book.id}:${chapter}:${targetVerse.verse}`;

  // 6-step form state
  const [observations, setObservations] = useState('');
  const [interpretation, setInterpretation] = useState('');
  const [personalReflection, setPersonalReflection] = useState('');
  const [application, setApplication] = useState('');
  const [prayer, setPrayer] = useState('');
  const [tags, setTags] = useState<string[]>(['Faith', 'Trust']);

  const handleSaveStudy = () => {
    triggerSuccessHaptic();
    saveBibleStudy({
      verseKey,
      bookName: book.name,
      chapter,
      verse: targetVerse.verse,
      passageText: targetVerse.text,
      observations: observations.trim() || 'Noted key words and commands.',
      interpretation: interpretation.trim() || 'Solomon calls for total reliance on God.',
      personalReflection: personalReflection.trim() || 'I need to surrender my anxiety over control.',
      application: application.trim() || 'Pray over decisions before acting today.',
      prayer: prayer.trim() || 'Lord, give me faith to trust Your direction.',
      tags,
    });
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            paddingTop: 12,
            paddingHorizontal: 20,
            paddingBottom: 16,
            backgroundColor: palette.card,
            borderBottomWidth: 1,
            borderBottomColor: palette.border,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Sparkles size={20} color={palette.accentGreen} />
            <Text style={{ fontSize: 18, fontWeight: '800', color: palette.textPrimary }}>
              Structured Bible Study
            </Text>
          </View>

          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <X size={22} color={palette.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. SCRIPTURE PASSAGE */}
          <View style={{ backgroundColor: palette.card, borderRadius: 16, borderWidth: 1, borderColor: palette.cardBorder, padding: 18, marginBottom: 20 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: palette.accentGold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              1. Selected Scripture ({book.name} {chapter}:{targetVerse.verse})
            </Text>
            <Text
              style={{
                fontFamily: isTeluguScript(targetVerse.text)
                  ? (Platform.OS === 'android' ? 'Mandali-Bold' : 'Mandali')
                  : ScriptureTypography.fontFamilySerif,
                fontWeight: isTeluguScript(targetVerse.text) ? '700' : '400',
                fontStyle: isTeluguScript(targetVerse.text) ? 'normal' : 'italic',
                fontSize: 17,
                lineHeight: 26,
                color: palette.textPrimary,
              }}
            >
              "{targetVerse.text}"
            </Text>
          </View>

          {/* 2. WHAT DOES IT SAY? */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: palette.textPrimary }]}>2. What Does It Say? (Observations)</Text>
            <Text style={[styles.sublabel, { color: palette.textSecondary }]}>Note key words, commands, promises, or repeating themes.</Text>
            <TextInput
              placeholder="e.g. Command: Trust in the LORD; Condition: with all your heart..."
              placeholderTextColor={palette.textMuted}
              value={observations}
              onChangeText={setObservations}
              multiline
              style={[styles.textInput, { backgroundColor: palette.card, color: palette.textPrimary, borderColor: palette.cardBorder }]}
            />
          </View>

          {/* 3. WHAT DOES IT MEAN? */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: palette.textPrimary }]}>3. What Does It Mean? (Interpretation & Context)</Text>
            <Text style={[styles.sublabel, { color: palette.textSecondary }]}>What was the author communicating to the original hearers?</Text>
            <TextInput
              placeholder="e.g. Solomon emphasizes surrendering intellectual self-reliance..."
              placeholderTextColor={palette.textMuted}
              value={interpretation}
              onChangeText={setInterpretation}
              multiline
              style={[styles.textInput, { backgroundColor: palette.card, color: palette.textPrimary, borderColor: palette.cardBorder }]}
            />
          </View>

          {/* 4. WHAT DOES IT MEAN TO ME? */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: palette.textPrimary }]}>4. What Does It Mean To Me? (Personal Reflection)</Text>
            <Text style={[styles.sublabel, { color: palette.textSecondary }]}>How does this timeless truth speak to your current life season?</Text>
            <TextInput
              placeholder="e.g. I tend to try to solve problems on my own before coming to God in prayer..."
              placeholderTextColor={palette.textMuted}
              value={personalReflection}
              onChangeText={setPersonalReflection}
              multiline
              style={[styles.textInput, { backgroundColor: palette.card, color: palette.textPrimary, borderColor: palette.cardBorder }]}
            />
          </View>

          {/* 5. WHAT SHOULD I DO? */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: palette.textPrimary }]}>5. What Should I Do? (Practical Application)</Text>
            <Text style={[styles.sublabel, { color: palette.textSecondary }]}>What specific action will you take today in response?</Text>
            <TextInput
              placeholder="e.g. Pause and pray over my work decisions today before reacting..."
              placeholderTextColor={palette.textMuted}
              value={application}
              onChangeText={setApplication}
              multiline
              style={[styles.textInput, { backgroundColor: palette.card, color: palette.textPrimary, borderColor: palette.cardBorder }]}
            />
          </View>

          {/* 6. PRAYER */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: palette.textPrimary }]}>6. Prayer</Text>
            <Text style={[styles.sublabel, { color: palette.textSecondary }]}>Write a prayer surrendering this truth to God.</Text>
            <TextInput
              placeholder="e.g. Father, grant me the heart to trust Your leading completely..."
              placeholderTextColor={palette.textMuted}
              value={prayer}
              onChangeText={setPrayer}
              multiline
              style={[styles.textInput, { backgroundColor: palette.card, color: palette.textPrimary, borderColor: palette.cardBorder }]}
            />
          </View>

          {/* Save CTA */}
          <TouchableOpacity
            onPress={handleSaveStudy}
            activeOpacity={0.85}
            style={{ backgroundColor: palette.accentGreen, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 10 }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>Save to My Bible Studies</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  sublabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  textInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    height: 90,
    textAlignVertical: 'top',
  },
});
