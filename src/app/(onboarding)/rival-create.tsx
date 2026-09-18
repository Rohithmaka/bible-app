import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import { useStore, RivalState } from '../../store/useStore';
import { PixelRival } from '../../components/PixelRival';
import { ArrowRight, MessageSquare, AlertCircle } from 'lucide-react-native';

const SUGGESTED_NAMES = ["SHADOW", "ECHO", "RIVAL", "GHOST", "NEMESIS", "CLONE"];

const SPRITE_OPTIONS = [
  { id: 'warrior', name: 'Warrior', desc: 'Rival clad in heavy pixelated plate armor.' },
  { id: 'scholar', name: 'Scholar', desc: 'A scholarly wizard using dark grid logic.' },
  { id: 'shadow', name: 'Shadow', desc: 'A dark purple form with glaring crimson eyes.' },
  { id: 'phantom', name: 'Phantom', desc: 'A cyan floating specter bound to your tasks.' },
  { id: 'glitch', name: 'Glitch', desc: 'A hyper-colored entity composed of corrupted cells.' },
  { id: 'clone', name: 'Clone', desc: 'A reflection mirror of your own design.' },
] as const;

const PERSONALITY_OPTIONS = [
  { id: 'ruthless', name: 'Ruthless', desc: 'Laser-focused on the XP gap. Cruel and blunt.' },
  { id: 'silent', name: 'Silent', desc: 'Only states numerical stats. Cold, pure data.' },
  { id: 'mentor', name: 'Mentor', desc: 'Tough-love reframer. Guides your productivity.' },
  { id: 'chaotic', name: 'Chaotic', desc: 'Unpredictable, shifting, bizarre taunts.' },
] as const;

const FREQUENCY_OPTIONS = [
  { id: 'aggressive', name: 'Aggressive', desc: 'Constant alerts' },
  { id: 'balanced', name: 'Balanced', desc: 'Midday updates' },
  { id: 'minimal', name: 'Minimal', desc: 'End-of-day summary' },
] as const;

export default function RivalCreateScreen() {
  const router = useRouter();
  const updateRival = useStore((state) => state.updateRival);

  const [name, setName] = useState('SHADOW');
  const [selectedSprite, setSelectedSprite] = useState<RivalState['spriteId']>('warrior');
  const [selectedPersonality, setSelectedPersonality] = useState<RivalState['personality']>('ruthless');
  const [selectedFreq, setSelectedFreq] = useState<RivalState['tauntFrequency']>('balanced');

  const handleNext = () => {
    if (!name.trim()) return;
    
    updateRival({
      name: name.trim().toUpperCase(),
      spriteId: selectedSprite,
      personality: selectedPersonality,
      tauntFrequency: selectedFreq,
      level: 1,
      evolutionForm: 0,
      totalXP: 0
    });

    router.push('/(onboarding)/task-setup');
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="mb-6 mt-2">
            <Text className="text-muted font-pixel text-[10px] tracking-widest mb-1 uppercase">Step 2 of 4</Text>
            <Text className="text-white text-2xl font-pixel leading-8 tracking-tight">DESIGN YOUR RIVAL</Text>
          </View>

          {/* Large Live Preview */}
          <View className="items-center justify-center bg-card border border-border p-6 rounded-2xl mb-6 relative overflow-hidden">
            <View className="absolute top-2 left-3 bg-rival/10 border border-rival/20 px-2 py-1 rounded">
              <Text className="text-rival font-pixel text-[8px]">LIVE SPRITE PREVIEW</Text>
            </View>
            <PixelRival
              spriteId={selectedSprite}
              evolutionForm={0}
              animationState="idle"
              size={128}
            />
            <Text className="text-white font-pixel text-sm mt-3 tracking-wide">{name.trim().toUpperCase()}</Text>
            <Text className="text-muted font-sans text-xs mt-1">Level 1 Rival</Text>
          </View>

          {/* Rival Name Input */}
          <View className="mb-6">
            <Text className="text-player font-pixel text-xs tracking-wider mb-2 uppercase">Name Your Rival</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              maxLength={12}
              placeholder="ENTER NAME..."
              placeholderTextColor="#8E8E9F"
              className="bg-card text-white font-pixel border border-border rounded-xl px-4 py-4 text-sm tracking-widest uppercase mb-3"
            />
            {/* suggestions */}
            <View className="flex-row flex-wrap gap-2">
              {SUGGESTED_NAMES.map((sug) => (
                <TouchableOpacity
                  key={sug}
                  onPress={() => setName(sug)}
                  className={`px-3 py-1.5 rounded-lg border ${
                    name === sug ? 'bg-rival/20 border-rival' : 'bg-card border-border'
                  }`}
                >
                  <Text className={`font-pixel text-[8px] ${name === sug ? 'text-rival' : 'text-muted'}`}>
                    {sug}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sprite Picker */}
          <View className="mb-6">
            <Text className="text-player font-pixel text-xs tracking-wider mb-2 uppercase">Choose Sprite Pack</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
              <View className="flex-row gap-3">
                {SPRITE_OPTIONS.map((sprite) => (
                  <TouchableOpacity
                    key={sprite.id}
                    onPress={() => setSelectedSprite(sprite.id)}
                    className={`w-32 bg-card p-3 rounded-xl border items-center justify-between ${
                      selectedSprite === sprite.id ? 'border-rival bg-rival/5' : 'border-border'
                    }`}
                  >
                    <PixelRival
                      spriteId={sprite.id}
                      evolutionForm={0}
                      animationState="idle"
                      size={64}
                    />
                    <Text className={`font-pixel text-[9px] text-center mt-2 ${selectedSprite === sprite.id ? 'text-rival' : 'text-white'}`}>
                      {sprite.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Personality Picker */}
          <View className="mb-6">
            <Text className="text-player font-pixel text-xs tracking-wider mb-2 uppercase">AI Taunt Personality</Text>
            <View className="grid grid-cols-2 gap-3 flex-row flex-wrap">
              {PERSONALITY_OPTIONS.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setSelectedPersonality(p.id)}
                  style={styles.personalityCard}
                  className={`bg-card p-3.5 rounded-xl border ${
                    selectedPersonality === p.id ? 'border-rival bg-rival/5' : 'border-border'
                  }`}
                >
                  <Text className={`font-pixel text-[10px] mb-1 ${selectedPersonality === p.id ? 'text-rival' : 'text-white'}`}>
                    {p.name}
                  </Text>
                  <Text className="text-muted font-sans text-xs leading-4">{p.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Taunt Frequency */}
          <View className="mb-8">
            <Text className="text-player font-pixel text-xs tracking-wider mb-2 uppercase">Taunt Frequency</Text>
            <View className="flex-row gap-3">
              {FREQUENCY_OPTIONS.map((f) => (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => setSelectedFreq(f.id)}
                  className={`flex-1 bg-card p-3 rounded-xl border items-center ${
                    selectedFreq === f.id ? 'border-rival bg-rival/5' : 'border-border'
                  }`}
                >
                  <Text className={`font-pixel text-[9px] mb-1 ${selectedFreq === f.id ? 'text-rival' : 'text-white'}`}>
                    {f.name}
                  </Text>
                  <Text className="text-muted font-sans text-[10px] text-center">{f.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action CTA */}
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.8}
            className="bg-rival py-5 rounded-xl flex-row justify-center items-center mb-12 border-b-4 border-red-800"
          >
            <Text className="text-white font-pixel text-sm tracking-widest uppercase">
              Lock In Rival
            </Text>
            <ArrowRight size={18} color="#FFFFFF" className="ml-2" />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  personalityCard: {
    width: '47%',
    minHeight: 85,
  }
});
