import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput
} from 'react-native';
import { useStore, RivalState } from '../../store/useStore';
import { PixelRival } from '../../components/PixelRival';
import { Edit3, Check, Trophy, HeartCrack, Sparkles, MessageSquare } from 'lucide-react-native';

const PERSONALITY_OPTIONS = [
  { id: 'ruthless', name: 'Ruthless', desc: 'Cruel, competitive, references tasks.' },
  { id: 'silent', name: 'Silent', desc: 'States numerical stats only. Cold logic.' },
  { id: 'mentor', name: 'Mentor', desc: 'Tough love. Reframes as lessons.' },
  { id: 'chaotic', name: 'Chaotic', desc: 'Unpredictable, shifting, wild taunts.' },
] as const;

const FREQUENCY_OPTIONS = [
  { id: 'aggressive', name: 'Aggressive' },
  { id: 'balanced', name: 'Balanced' },
  { id: 'minimal', name: 'Minimal' },
] as const;

export default function RivalScreen() {
  const store = useStore();
  const rival = store.rival;
  const history = store.battleHistory;

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(rival.name);
  const [personality, setPersonality] = useState(rival.personality);
  const [tauntFreq, setTauntFreq] = useState(rival.tauntFrequency);

  const handleSave = () => {
    if (!name.trim()) return;
    store.updateRival({
      name: name.trim().toUpperCase(),
      personality,
      tauntFrequency: tauntFreq,
    });
    setIsEditing(false);
  };

  // Level bar percentage calculation (max level = 50)
  const levelPercent = (rival.level / 50) * 100;

  // Generate last 7 days history blocks
  const last7Days = [...history].slice(0, 7).reverse();
  // Fill empty slots if history is less than 7 days
  const paddingSlots = 7 - last7Days.length;
  const historyBlocks = [...Array(paddingSlots).fill(null), ...last7Days];

  // Career stats
  const totalDaysWonByRival = history.filter(h => h.result === 'rival').length;

  // Evolution label
  const evolutionLabels = ["BASE FORM", "POWERED-UP FORM (LV.30+)", "DEGRADED FORM (LV.1-3)"];

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 border-b border-border bg-card/10 flex-row justify-between items-center">
        <Text className="text-white text-base font-pixel">RIVAL PROFILE</Text>
        <TouchableOpacity
          onPress={() => {
            if (isEditing) {
              handleSave();
            } else {
              setName(rival.name);
              setPersonality(rival.personality);
              setTauntFreq(rival.tauntFrequency);
              setIsEditing(true);
            }
          }}
          className={`${isEditing ? 'bg-win border-green-800' : 'bg-player border-cyan-800'} px-3 py-2 rounded-lg border-b-2`}
        >
          <Text className="text-background font-pixel text-[8px] font-bold">
            {isEditing ? 'SAVE' : 'EDIT'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        
        {/* Large Sprite Card */}
        <View className="items-center justify-center bg-card border border-border p-6 rounded-2xl mb-6 relative overflow-hidden">
          <View className="absolute top-3 left-4 bg-rival/10 border border-rival/20 px-2.5 py-1 rounded-lg">
            <Text className="text-rival font-pixel text-[8px] tracking-wider">
              {evolutionLabels[rival.evolutionForm]}
            </Text>
          </View>

          <PixelRival
            spriteId={rival.spriteId}
            evolutionForm={rival.evolutionForm}
            animationState="idle"
            size={160}
          />
          
          <Text className="text-white text-xl font-pixel mt-4 tracking-wider">{rival.name}</Text>
          <Text className="text-muted font-pixel text-[9px] uppercase mt-1 tracking-widest">
            {rival.spriteId} RIVAL
          </Text>
        </View>

        {/* Level Progression Tracker */}
        <View className="bg-card border border-border p-5 rounded-2xl mb-6">
          <View className="flex-row justify-between items-end mb-2">
            <Text className="text-white font-pixel text-[10px] uppercase">Rival Level</Text>
            <Text className="text-rival font-pixel text-xs">LV.{rival.level} <Text className="text-muted text-[8px]">/ 50</Text></Text>
          </View>
          
          {/* Level Progress bar */}
          <View className="h-4 bg-background border border-border rounded-md overflow-hidden">
            <View style={{ width: `${levelPercent}%` }} className="bg-rival h-full" />
          </View>
          <Text className="text-muted font-sans text-xs mt-2 leading-4">
            Level increases each day you lose, and decreases each day you win. Maxes at level 50.
          </Text>
        </View>

        {/* Edit Form Area */}
        {isEditing ? (
          <View className="bg-card border border-player/50 p-5 rounded-2xl mb-6 shadow-xl">
            <Text className="text-player font-pixel text-[10px] mb-3 uppercase tracking-wider">UPDATE RIVAL PARAMETERS</Text>
            
            {/* Edit Name */}
            <Text className="text-muted font-pixel text-[8px] mb-2 uppercase">Rename Rival</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              maxLength={12}
              className="bg-background text-white font-pixel border border-border rounded-xl px-4 py-3 text-xs tracking-widest uppercase mb-4"
            />

            {/* Edit Personality */}
            <Text className="text-muted font-pixel text-[8px] mb-2 uppercase">AI Taunt Mode</Text>
            <View className="gap-2.5 mb-4">
              {PERSONALITY_OPTIONS.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setPersonality(p.id)}
                  className={`bg-background p-3 rounded-xl border flex-row justify-between items-center ${
                    personality === p.id ? 'border-player bg-player/5' : 'border-border'
                  }`}
                >
                  <View className="flex-1">
                    <Text className={`font-pixel text-[9px] mb-0.5 ${personality === p.id ? 'text-player' : 'text-white'}`}>
                      {p.name}
                    </Text>
                    <Text className="text-muted font-sans text-[11px]">{p.desc}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Edit Taunt Frequency */}
            <Text className="text-muted font-pixel text-[8px] mb-2 uppercase">Taunt Frequency</Text>
            <View className="flex-row gap-2 bg-background p-1 rounded-xl border border-border">
              {FREQUENCY_OPTIONS.map((f) => (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => setTauntFreq(f.id)}
                  className={`flex-1 py-2 rounded-lg items-center ${
                    tauntFreq === f.id ? 'bg-card' : ''
                  }`}
                >
                  <Text className={`font-sans text-xs ${tauntFreq === f.id ? 'text-player font-bold' : 'text-muted'}`}>
                    {f.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        {/* Last 7 Days Battle Log Grid */}
        <View className="bg-card border border-border p-5 rounded-2xl mb-6">
          <Text className="text-white font-pixel text-[10px] uppercase mb-4 tracking-wider">7-DAY RECORD HISTORY</Text>
          
          <View className="flex-row justify-between">
            {historyBlocks.map((day, idx) => {
              if (day === null) {
                return (
                  <View key={`empty-${idx}`} className="items-center">
                    <View className="w-9 h-9 rounded-lg bg-background border border-border border-dashed items-center justify-center" />
                    <Text className="text-muted font-sans text-[9px] mt-1.5">-</Text>
                  </View>
                );
              }
              const isRivalWin = day.result === 'rival';
              return (
                <View key={day.date} className="items-center">
                  <View
                    className={`w-9 h-9 rounded-lg items-center justify-center border ${
                      isRivalWin ? 'bg-rival/10 border-rival' : 'bg-win/10 border-win'
                    }`}
                  >
                    {isRivalWin ? (
                      <HeartCrack size={16} color="#FF4655" />
                    ) : (
                      <Trophy size={16} color="#69FF6E" />
                    )}
                  </View>
                  <Text className={`font-pixel text-[6px] mt-1.5 ${isRivalWin ? 'text-rival' : 'text-win'}`}>
                    {isRivalWin ? 'L' : 'W'}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Rival Career Statistics */}
        <View className="bg-card border border-border p-5 rounded-2xl mb-12">
          <Text className="text-white font-pixel text-[10px] uppercase mb-4 tracking-wider">CAREER STATISTICS</Text>
          
          <View className="gap-3">
            <View className="flex-row justify-between border-b border-border/40 pb-2">
              <Text className="text-muted font-sans text-xs">Total Days Won by Rival</Text>
              <Text className="text-rival font-pixel text-[10px]">{totalDaysWonByRival} Wins</Text>
            </View>
            <View className="flex-row justify-between border-b border-border/40 pb-2">
              <Text className="text-muted font-sans text-xs">Total Accumulative Rival XP</Text>
              <Text className="text-rival font-pixel text-[10px]">{Math.round(rival.totalXP)} XP</Text>
            </View>
            <View className="flex-row justify-between border-b border-border/40 pb-2">
              <Text className="text-muted font-sans text-xs">Taunt Behavior Preset</Text>
              <Text className="text-white font-sans text-xs capitalize">{rival.personality}</Text>
            </View>
            <View className="flex-row justify-between pb-1">
              <Text className="text-muted font-sans text-xs">Taunt Frequency Settings</Text>
              <Text className="text-white font-sans text-xs capitalize">{rival.tauntFrequency}</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
