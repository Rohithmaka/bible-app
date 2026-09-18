import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useBibleStore } from '../store/useBibleStore';
import { useSpiritualStore } from '../store/useSpiritualStore';
import { SpiritualTheme } from '../constants/spiritualTheme';
import { Sparkles, Heart, Plus, ChevronLeft, X, CheckCircle2 } from 'lucide-react-native';

export default function StoriesScreen() {
  const router = useRouter();
  const { themeMode } = useBibleStore();
  const { storiesOfFaith, addStoryOfFaith, reactToStory } = useSpiritualStore();

  const isDark = themeMode === 'dark';
  const palette = isDark ? SpiritualTheme.dark : SpiritualTheme.light;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [prayingFor, setPrayingFor] = useState('');
  const [whatHappened, setWhatHappened] = useState('');
  const [whatILearned, setWhatILearned] = useState('');
  const [relatedScripture, setRelatedScripture] = useState('');
  const [category, setCategory] = useState('Answered Prayer');

  const handleSaveStory = () => {
    if (!title.trim() || !story.trim()) return;
    addStoryOfFaith({
      title: title.trim(),
      story: story.trim(),
      prayingFor: prayingFor.trim() || 'Guidance and breakthrough',
      whatHappened: whatHappened.trim() || 'God provided unexpectedly.',
      whatILearned: whatILearned.trim() || 'Faith flourishes in the waiting.',
      relatedScripture: relatedScripture.trim() || 'Proverbs 3:5-6',
      category,
      authorName: 'Believer',
      isAnonymous: false,
    });
    setTitle('');
    setStory('');
    setIsAddModalOpen(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      {/* Header */}
      <View style={{ paddingTop: 56, paddingHorizontal: 20, paddingBottom: 14, backgroundColor: palette.card, borderBottomWidth: 1, borderBottomColor: palette.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <ChevronLeft size={22} color={palette.textPrimary} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: palette.textPrimary }}>Back</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 18, fontWeight: '800', color: palette.textPrimary }}>Stories of Faith</Text>

        <TouchableOpacity onPress={() => setIsAddModalOpen(true)} style={{ backgroundColor: palette.accentGreen, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFFFFF' }}>+ Share Story</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}>
        {storiesOfFaith.map((item) => (
          <View key={item.id} style={{ backgroundColor: palette.card, borderRadius: 20, borderWidth: 1, borderColor: palette.cardBorder, padding: 20, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: palette.accentGold, textTransform: 'uppercase', letterSpacing: 1 }}>
                {item.category}
              </Text>
              <Text style={{ fontSize: 12, color: palette.textMuted }}>{item.authorName}</Text>
            </View>

            <Text style={{ fontSize: 18, fontWeight: '800', color: palette.textPrimary, marginBottom: 8 }}>
              {item.title}
            </Text>

            <Text style={{ fontSize: 15, color: palette.textPrimary, lineHeight: 22, marginBottom: 14 }}>
              {item.story}
            </Text>

            {item.whatHappened ? (
              <View style={{ backgroundColor: palette.accentGreenLight, borderRadius: 12, padding: 12, marginBottom: 10 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.accentGreen, textTransform: 'uppercase', marginBottom: 2 }}>
                  What Happened:
                </Text>
                <Text style={{ fontSize: 13, color: palette.textPrimary }}>{item.whatHappened}</Text>
              </View>
            ) : null}

            {item.whatILearned ? (
              <View style={{ backgroundColor: palette.inputBg, borderRadius: 12, padding: 12, marginBottom: 12 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: palette.accentGold, textTransform: 'uppercase', marginBottom: 2 }}>
                  What I Learned:
                </Text>
                <Text style={{ fontSize: 13, color: palette.textPrimary, fontStyle: 'italic' }}>"{item.whatILearned}"</Text>
              </View>
            ) : null}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: palette.border }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: palette.accentGreen }}>
                📖 {item.relatedScripture}
              </Text>

              <TouchableOpacity
                onPress={() => reactToStory(item.id)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: item.userReacted ? palette.accentGoldLight : palette.inputBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
              >
                <Heart size={14} color={item.userReacted ? palette.accentGold : palette.textSecondary} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: item.userReacted ? palette.accentGold : palette.textSecondary }}>
                  Amen ({item.iPrayedCount})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Share Story Modal */}
      <Modal visible={isAddModalOpen} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: palette.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: palette.textPrimary }}>Share Story of Faith</Text>
              <TouchableOpacity onPress={() => setIsAddModalOpen(false)}>
                <X size={20} color={palette.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                placeholder="Story Title"
                placeholderTextColor={palette.textMuted}
                value={title}
                onChangeText={setTitle}
                style={[styles.input, { backgroundColor: palette.inputBg, color: palette.textPrimary, borderColor: palette.border }]}
              />

              <TextInput
                placeholder="Tell your story of God's faithfulness..."
                placeholderTextColor={palette.textMuted}
                value={story}
                onChangeText={setStory}
                multiline
                numberOfLines={4}
                style={[styles.input, { backgroundColor: palette.inputBg, color: palette.textPrimary, borderColor: palette.border, height: 90, textAlignVertical: 'top' }]}
              />

              <TextInput
                placeholder="What were you praying for?"
                placeholderTextColor={palette.textMuted}
                value={prayingFor}
                onChangeText={setPrayingFor}
                style={[styles.input, { backgroundColor: palette.inputBg, color: palette.textPrimary, borderColor: palette.border }]}
              />

              <TextInput
                placeholder="What happened?"
                placeholderTextColor={palette.textMuted}
                value={whatHappened}
                onChangeText={setWhatHappened}
                style={[styles.input, { backgroundColor: palette.inputBg, color: palette.textPrimary, borderColor: palette.border }]}
              />

              <TextInput
                placeholder="What did you learn?"
                placeholderTextColor={palette.textMuted}
                value={whatILearned}
                onChangeText={setWhatILearned}
                style={[styles.input, { backgroundColor: palette.inputBg, color: palette.textPrimary, borderColor: palette.border }]}
              />

              <TouchableOpacity onPress={handleSaveStory} style={{ backgroundColor: palette.accentGreen, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 10, marginBottom: 20 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>Publish Story</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },
});
