import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useBibleStore } from '../store/useBibleStore';
import { X, Save, Trash2, Edit3 } from 'lucide-react-native';

export default function NoteEditorModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    bookId: string;
    bookName: string;
    chapter: string;
    verse: string;
    verseText: string;
  }>();

  const { notes, saveNote, deleteNote, themeMode } = useBibleStore();

  const bookId = params.bookId || 'JHN';
  const bookName = params.bookName || 'John';
  const chapter = parseInt(params.chapter || '3', 10);
  const verse = parseInt(params.verse || '16', 10);
  const verseText = params.verseText || '';

  const verseKey = `${bookId}:${chapter}:${verse}`;
  const existingNote = notes[verseKey];

  const [content, setContent] = useState(existingNote?.content || '');

  const isDark = themeMode === 'dark';
  const bgColor = isDark ? '#0F172A' : '#F8FAFC';
  const textColor = isDark ? '#F8FAFC' : '#0F172A';
  const cardBg = isDark ? '#1E293B' : '#FFFFFF';
  const borderColor = isDark ? '#334155' : '#E2E8F0';

  const handleSave = () => {
    if (!content.trim()) {
      Alert.alert('Empty Note', 'Please enter some text before saving.');
      return;
    }
    saveNote(bookId, bookName, chapter, verse, verseText, content.trim());
    router.back();
  };

  const handleDelete = () => {
    deleteNote(verseKey);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: bgColor }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderColor }]}>
        <View style={styles.titleRow}>
          <Edit3 size={20} color="#4F46E5" style={{ marginRight: 8 }} />
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Study Note ({bookName} {chapter}:{verse})
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <X size={22} color={isDark ? '#94A3B8' : '#64748B'} />
        </TouchableOpacity>
      </View>

      {/* Scripture Card Reference */}
      <View style={styles.bodyPadding}>
        <View style={[styles.verseQuoteCard, { backgroundColor: cardBg, borderColor }]}>
          <Text style={styles.verseQuoteRef}>
            {bookName} {chapter}:{verse}
          </Text>
          <Text style={[styles.verseQuoteText, { color: isDark ? '#CBD5E1' : '#475569' }]}>
            "{verseText}"
          </Text>
        </View>

        {/* Note Text Editor */}
        <Text style={[styles.inputLabel, { color: textColor }]}>Your Personal Thoughts & Reflections:</Text>
        <TextInput
          style={[
            styles.textInput,
            { backgroundColor: cardBg, color: textColor, borderColor },
          ]}
          multiline
          placeholder="Write your study notes, insights, or personal prayer here..."
          placeholderTextColor="#94A3B8"
          value={content}
          onChangeText={setContent}
          textAlignVertical="top"
        />

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          {existingNote && (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
              <Trash2 size={18} color="#EF4444" style={{ marginRight: 6 }} />
              <Text style={styles.deleteText}>Delete Note</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Save size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.saveText}>Save Note</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  bodyPadding: {
    flex: 1,
    padding: 20,
  },
  verseQuoteCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
    marginBottom: 20,
  },
  verseQuoteRef: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 4,
  },
  verseQuoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    minHeight: 180,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
  },
  deleteText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 14,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    backgroundColor: '#4F46E5',
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
