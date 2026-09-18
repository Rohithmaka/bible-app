import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';
import { Task } from '../../engine/xpEngine';
import { BookOpen, Dumbbell, Heart, BrainCircuit, Briefcase, Layers, ArrowLeft, Save } from 'lucide-react-native';

const CATEGORIES = [
  { id: 'study', label: 'Study', icon: BookOpen, color: '#FFB74D' },
  { id: 'physical', label: 'Workout', icon: Dumbbell, color: '#81C784' },
  { id: 'health', label: 'Health', icon: Heart, color: '#E57373' },
  { id: 'mindset', label: 'Mindset', icon: BrainCircuit, color: '#BA68C8' },
  { id: 'work', label: 'Work', icon: Briefcase, color: '#64B5F6' },
  { id: 'custom', label: 'Custom', icon: Layers, color: '#A1887F' },
] as const;

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const store = useStore();

  const task = store.tasks.find((t) => t.id === id);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<Task['category']>('study');
  const [baseXP, setBaseXP] = useState('200');
  const [checkoffType, setCheckoffType] = useState<Task['checkoffType']>('single');
  const [counterTarget, setCounterTarget] = useState('8');

  // Load task details on mount
  useEffect(() => {
    if (task) {
      setName(task.name);
      setCategory(task.category);
      setBaseXP(task.baseXP.toString());
      setCheckoffType(task.checkoffType);
      setCounterTarget(task.counterTarget ? task.counterTarget.toString() : '8');
    }
  }, [task]);

  if (!task) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center px-6">
        <Text className="text-white font-pixel text-xs text-center mb-4">TASK NOT FOUND</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-card px-4 py-2 border border-border rounded-xl"
        >
          <Text className="text-player font-pixel text-[10px]">GO BACK</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleSave = () => {
    if (!name.trim()) return;
    const xp = parseInt(baseXP) || 100;
    const target = checkoffType === 'counter' ? parseInt(counterTarget) || 8 : undefined;

    store.updateTask(task.id, {
      name: name.trim(),
      category,
      baseXP: Math.max(50, Math.min(xp, 600)),
      checkoffType,
      counterTarget: target,
    });

    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 border-b border-border bg-card/10 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-white text-sm font-pixel">EDIT TASK</Text>
        <TouchableOpacity
          onPress={handleSave}
          className="bg-win px-3 py-2 rounded-lg border-b-2 border-green-800 flex-row items-center space-x-1"
        >
          <Save size={12} color="#0A0A0F" />
          <Text className="text-background font-pixel text-[8px] font-bold ml-1">SAVE</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        {/* Form Body */}
        <View className="bg-card border border-border p-5 rounded-2xl mb-8">
          <Text className="text-player font-pixel text-[9px] mb-3 uppercase tracking-wider">TASK ATTRIBUTES</Text>
          
          {/* Name */}
          <Text className="text-muted font-pixel text-[8px] mb-2 uppercase">Task Title</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            className="bg-background text-white font-sans border border-border rounded-xl px-4 py-3 text-sm mb-4"
          />

          {/* Category */}
          <Text className="text-muted font-pixel text-[8px] mb-2 uppercase">Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
            <View className="flex-row gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setCategory(cat.id)}
                    className={`px-3 py-2 rounded-xl border flex-row items-center space-x-1.5 ${
                      category === cat.id ? 'bg-player/10 border-player' : 'bg-background border-border'
                    }`}
                  >
                    <Icon size={12} color={category === cat.id ? '#4FC3F7' : '#8E8E9F'} />
                    <Text className={`font-sans text-xs ${category === cat.id ? 'text-player' : 'text-muted'}`}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Checkoff Type */}
          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <Text className="text-muted font-pixel text-[8px] mb-2 uppercase">Checkoff Mode</Text>
              <View className="flex-row gap-2 bg-background p-1 rounded-xl border border-border">
                <TouchableOpacity
                  onPress={() => setCheckoffType('single')}
                  className={`flex-1 py-2 rounded-lg items-center ${
                    checkoffType === 'single' ? 'bg-background' : ''
                  }`}
                >
                  <Text className={`font-sans text-xs ${checkoffType === 'single' ? 'text-player font-bold' : 'text-muted'}`}>
                    Single Tap
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setCheckoffType('counter')}
                  className={`flex-1 py-2 rounded-lg items-center ${
                    checkoffType === 'counter' ? 'bg-background' : ''
                  }`}
                >
                  <Text className={`font-sans text-xs ${checkoffType === 'counter' ? 'text-player font-bold' : 'text-muted'}`}>
                    Counter
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {checkoffType === 'counter' && (
              <View className="w-24">
                <Text className="text-muted font-pixel text-[8px] mb-2 uppercase">Target</Text>
                <TextInput
                  value={counterTarget}
                  onChangeText={setCounterTarget}
                  keyboardType="number-pad"
                  className="bg-background text-white font-pixel border border-border rounded-xl px-3 py-2 text-center text-xs"
                />
              </View>
            )}
          </View>

          {/* Base XP */}
          <View className="mb-4">
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-muted font-pixel text-[8px] uppercase">Base XP (50 - 600)</Text>
              <Text className="text-player font-pixel text-[9px]">{baseXP} XP</Text>
            </View>
            <TextInput
              value={baseXP}
              onChangeText={(val) => setBaseXP(val.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              className="bg-background text-white font-pixel border border-border rounded-xl px-4 py-3 text-sm"
            />
          </View>
        </View>

        {/* Delete Quick Option */}
        <TouchableOpacity
          onPress={() => {
            store.deleteTask(task.id);
            router.back();
          }}
          className="bg-rival/10 border border-rival py-4 rounded-xl items-center justify-center mb-12"
        >
          <Text className="text-rival font-pixel text-xs tracking-wider uppercase font-bold">
            Delete Task
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
