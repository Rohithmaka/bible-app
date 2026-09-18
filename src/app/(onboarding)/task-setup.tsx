import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import { useStore, PRESET_TASKS } from '../../store/useStore';
import { Task } from '../../engine/xpEngine';
import {
  Plus,
  Trash2,
  ArrowRight,
  BookOpen,
  Dumbbell,
  Heart,
  BrainCircuit,
  Briefcase,
  Layers
} from 'lucide-react-native';

const CATEGORIES = [
  { id: 'study', label: 'Study', icon: BookOpen, color: '#FFB74D' },
  { id: 'physical', label: 'Workout', icon: Dumbbell, color: '#81C784' },
  { id: 'health', label: 'Health', icon: Heart, color: '#E57373' },
  { id: 'mindset', label: 'Mindset', icon: BrainCircuit, color: '#BA68C8' },
  { id: 'work', label: 'Work', icon: Briefcase, color: '#64B5F6' },
  { id: 'custom', label: 'Custom', icon: Layers, color: '#A1887F' },
] as const;

export default function TaskSetupScreen() {
  const router = useRouter();
  const tasks = useStore((state) => state.tasks);
  const addTask = useStore((state) => state.addTask);
  const deleteTask = useStore((state) => state.deleteTask);
  const startNewDay = useStore((state) => state.startNewDay);
  const setOnboarded = useStore((state) => state.setOnboarded);

  // Custom task form state
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<Task['category']>('study');
  const [customXP, setCustomXP] = useState('200');
  const [showCustomForm, setShowCustomForm] = useState(false);

  const handleAddPreset = (preset: typeof PRESET_TASKS[number]) => {
    addTask({
      name: preset.name,
      category: preset.category as Task['category'],
      baseXP: preset.baseXP,
      checkoffType: preset.checkoffType as Task['checkoffType'],
      counterTarget: preset.counterTarget,
    });
  };

  const handleAddCustom = () => {
    if (!customName.trim()) return;
    const baseXP = parseInt(customXP) || 100;
    
    addTask({
      name: customName.trim(),
      category: customCategory,
      baseXP: Math.max(50, Math.min(baseXP, 600)),
      checkoffType: 'single',
    });

    setCustomName('');
    setCustomXP('200');
    setShowCustomForm(false);
  };

  const handleStart = () => {
    if (tasks.length < 2) return;
    
    // Set onboarding to active
    setOnboarded(true);
    
    // Initialize day 1 battle
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    startNewDay(dateStr);
    
    // Navigate to tutorial screen
    router.push('/(onboarding)/tutorial');
  };

  const totalMaxXP = tasks.reduce((sum, t) => sum + t.baseXP, 0);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6 mt-2">
          <Text className="text-muted font-pixel text-[10px] tracking-widest mb-1 uppercase">Step 3 of 4</Text>
          <Text className="text-white text-2xl font-pixel leading-8 tracking-tight">SET YOUR GOALS</Text>
          <Text className="text-muted font-sans text-xs mt-1.5 leading-5">
            Select what you will train in today. Your rival gains XP relative to these targets as you delay.
          </Text>
        </View>

        {/* Preset Library Section */}
        <View className="mb-6 bg-card border border-border p-5 rounded-2xl">
          <Text className="text-player font-pixel text-xs tracking-wider mb-3 uppercase">PRE-BUILT TASK LIBRARY</Text>
          <View className="flex-row flex-wrap gap-2.5">
            {PRESET_TASKS.map((preset) => {
              const alreadyAdded = tasks.some(t => t.name === preset.name);
              return (
                <TouchableOpacity
                  key={preset.name}
                  onPress={() => !alreadyAdded && handleAddPreset(preset)}
                  disabled={alreadyAdded}
                  className={`px-3 py-2 rounded-xl border flex-row items-center space-x-1.5 ${
                    alreadyAdded
                      ? 'bg-border/30 border-transparent opacity-40'
                      : 'bg-background border-border hover:border-player'
                  }`}
                >
                  <Text className="text-white font-sans text-xs tracking-wide">
                    {preset.name}
                  </Text>
                  <Text className="text-gold font-pixel text-[8px] ml-1">+{preset.baseXP}XP</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Custom Task Toggle/Form */}
        <View className="mb-6">
          {!showCustomForm ? (
            <TouchableOpacity
              onPress={() => setShowCustomForm(true)}
              className="bg-card/50 border border-dashed border-border py-4 rounded-xl items-center justify-center flex-row space-x-2"
            >
              <Plus size={16} color="#4FC3F7" />
              <Text className="text-player font-pixel text-xs tracking-wide">Add Custom Task</Text>
            </TouchableOpacity>
          ) : (
            <View className="bg-card border border-player/50 p-5 rounded-2xl">
              <Text className="text-player font-pixel text-[10px] mb-3 uppercase">NEW CUSTOM TASK</Text>
              
              <TextInput
                value={customName}
                onChangeText={setCustomName}
                placeholder="TASK NAME (e.g. Study Chemistry)"
                placeholderTextColor="#8E8E9F"
                className="bg-background text-white font-sans border border-border rounded-xl px-4 py-3 text-sm mb-4"
              />

              {/* Category selector */}
              <Text className="text-muted font-pixel text-[8px] mb-2 uppercase">Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                <View className="flex-row gap-2">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => setCustomCategory(cat.id)}
                        className={`px-3 py-2 rounded-xl border flex-row items-center space-x-1.5 ${
                          customCategory === cat.id ? 'bg-player/10 border-player' : 'bg-background border-border'
                        }`}
                      >
                        <Icon size={12} color={customCategory === cat.id ? '#4FC3F7' : '#8E8E9F'} />
                        <Text className={`font-sans text-xs ${customCategory === cat.id ? 'text-player' : 'text-muted'}`}>
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Base XP Slider Input */}
              <View className="mb-4">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-muted font-pixel text-[8px] uppercase">Base XP (50 - 600)</Text>
                  <Text className="text-player font-pixel text-[10px]">{customXP} XP</Text>
                </View>
                <TextInput
                  value={customXP}
                  onChangeText={(val) => setCustomXP(val.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  className="bg-background text-white font-pixel border border-border rounded-xl px-4 py-3 text-sm"
                />
              </View>

              {/* Buttons */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setShowCustomForm(false)}
                  className="flex-1 bg-border/20 py-3 rounded-xl border border-transparent items-center"
                >
                  <Text className="text-muted font-sans text-xs">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAddCustom}
                  className="flex-1 bg-player py-3 rounded-xl items-center"
                >
                  <Text className="text-background font-pixel text-[10px] tracking-widest uppercase">Add Task</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Selected Tasks List */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-white font-pixel text-xs tracking-wider uppercase">YOUR TRAINING TASK LIST</Text>
            <Text className="text-gold font-pixel text-[9px]">{tasks.length} Added</Text>
          </View>

          {tasks.length === 0 ? (
            <View className="bg-card/20 border border-border/40 p-8 rounded-2xl items-center">
              <Text className="text-muted font-sans text-xs text-center">No tasks added yet. Choose from library or add custom above.</Text>
            </View>
          ) : (
            <View className="gap-2.5">
              {tasks.map((task) => {
                const cat = CATEGORIES.find(c => c.id === task.category) || CATEGORIES[5];
                const CatIcon = cat.icon;
                return (
                  <View
                    key={task.id}
                    className="bg-card border border-border p-4 rounded-xl flex-row justify-between items-center"
                  >
                    <View className="flex-row items-center space-x-3">
                      <View className="p-2 rounded-lg bg-background border border-border">
                        <CatIcon size={16} color={cat.color} />
                      </View>
                      <View>
                        <Text className="text-white font-sans text-sm font-semibold">{task.name}</Text>
                        <Text className="text-muted font-sans text-xs capitalize">{task.category}</Text>
                      </View>
                    </View>
                    <View className="flex-row items-center space-x-4">
                      <Text className="text-gold font-pixel text-[9px]">+{task.baseXP} XP</Text>
                      <TouchableOpacity onPress={() => deleteTask(task.id)} className="p-1">
                        <Trash2 size={16} color="#FF4655" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Max XP Counter Card */}
        {tasks.length > 0 && (
          <View className="bg-card border border-gold/20 p-4 rounded-xl mb-8 flex-row justify-between items-center">
            <Text className="text-white font-sans text-xs">Today's Maximum XP Limit:</Text>
            <Text className="text-gold font-pixel text-xs tracking-wider">+{totalMaxXP} XP</Text>
          </View>
        )}

        {/* Action CTA */}
        <TouchableOpacity
          onPress={handleStart}
          disabled={tasks.length < 2}
          activeOpacity={0.8}
          className={`py-5 rounded-xl flex-row justify-center items-center mb-12 border-b-4 ${
            tasks.length >= 2
              ? 'bg-rival border-red-800'
              : 'bg-muted/30 border-transparent opacity-50'
          }`}
        >
          <Text className="text-white font-pixel text-sm tracking-widest uppercase">
            Start Day 1
          </Text>
          <ArrowRight size={18} color="#FFFFFF" className="ml-2" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
