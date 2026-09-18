import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Play, Pause, Volume2, X } from 'lucide-react-native';
import { useBibleStore } from '../store/useBibleStore';
import { BIBLE_BOOKS, Verse } from '../data/bibleData';

interface AudioPlayerBarProps {
  verses: Verse[];
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({ verses }) => {
  const {
    activeBookId,
    activeChapter,
    isAudioPlaying,
    playbackSpeed,
    audioVerseIndex,
    setAudioPlaying,
    setPlaybackSpeed,
    setAudioVerseIndex,
  } = useBibleStore();

  const currentBook = BIBLE_BOOKS.find(b => b.id === activeBookId);
  const timerRef = useRef<any>(null);

  // Simulated Verse Audio Sync
  useEffect(() => {
    if (isAudioPlaying && verses.length > 0) {
      if (audioVerseIndex === null) {
        setAudioVerseIndex(0);
      }

      const durationPerVerse = Math.floor(4000 / playbackSpeed);

      timerRef.current = setInterval(() => {
        const currentIndex = useBibleStore.getState().audioVerseIndex ?? 0;
        if (currentIndex < verses.length - 1) {
          setAudioVerseIndex(currentIndex + 1);
        } else {
          setAudioPlaying(false);
          setAudioVerseIndex(0);
        }
      }, durationPerVerse);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAudioPlaying, verses, playbackSpeed]);

  const cycleSpeed = () => {
    if (playbackSpeed === 1.0) setPlaybackSpeed(1.25);
    else if (playbackSpeed === 1.25) setPlaybackSpeed(1.5);
    else setPlaybackSpeed(1.0);
  };

  const closePlayer = () => {
    setAudioPlaying(false);
    setAudioVerseIndex(null);
  };

  const currentVerse = audioVerseIndex !== null && verses[audioVerseIndex] ? verses[audioVerseIndex] : null;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Volume2 size={20} color="#D4AF37" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.titleText}>
              {currentBook?.name} {activeChapter}{currentVerse ? `:${currentVerse.verse}` : ''} Audio Reader
            </Text>
            <Text style={styles.subtitleText} numberOfLines={1}>
              {currentVerse ? currentVerse.text : 'Tap Play to start listening'}
            </Text>
          </View>
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity onPress={cycleSpeed} style={styles.speedButton}>
            <Text style={styles.speedText}>{playbackSpeed}x</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setAudioPlaying(!isAudioPlaying)}
            style={styles.playButton}
          >
            {isAudioPlaying ? (
              <Pause size={22} color="#FFFFFF" />
            ) : (
              <Play size={22} color="#FFFFFF" style={{ marginLeft: 2 }} />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={closePlayer} style={styles.closeButton}>
            <X size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 100,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  titleText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  subtitleText: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  speedButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  speedText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
  },
  playButton: {
    backgroundColor: '#D4AF37',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    padding: 6,
  },
});
