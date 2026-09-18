import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';
import { Task } from '../../engine/xpEngine';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  BookOpen,
  Dumbbell,
  Heart,
  BrainCircuit,
  Briefcase,
  Layers,
  Edit2
} from 'lucide-react-native';

const CATEGORIES = [
  { id: 'study', label: 'Study', icon: BookOpen, color: '#FFB74D', bg: 'bg-orange-500/10' },
  { id: 'physical', label: 'Workout', icon: Dumbbell, color: '#81C784', bg: 'bg-green-500/10' },
  { id: 'health', label: 'Health', icon: Heart, color: '#E57373', bg: 'bg-red-500/10' },
  { id: 'mindset', label: 'Mindset', icon: BrainCircuit, color: '#BA68C8', bg: 'bg-purple-500/10' },
  { id: 'work', label: 'Work', icon: Briefcase, color: '#64B5F6', bg: 'bg-blue-500/10' },
  { id: 'custom', label: 'Custom', icon: Layers, color: '#A1887F', bg: 'bg-stone-500/10' },
] as const;

export default function TasksScreen() {
  const router = useRouter();
  const store = useStore();
  const tasks = store.tasks;

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Task['category']>('study');
  const [baseXP, setBaseXP] = useState('200');
  const [checkoffType, setCheckoffType] = useState<Task['checkoffType']>('single');
  const [counterTarget, setCounterTarget] = useState('8');

  const handleAddTask = () => {
    if (!name.trim()) return;
    const xp = parseInt(baseXP) || 100;
    const target = checkoffType === 'counter' ? parseInt(counterTarget) || 8 : undefined;

    store.addTask({
      name: name.trim(),
      category,
      baseXP: Math.max(50, Math.min(xp, 600)),
      checkoffType,
      counterTarget: target,
    });

    setName('');
    setBaseXP('200');
    setCheckoffType('single');
    setCounterTarget('8');
    setShowAddForm(false);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newTasks = [...tasks];
    const temp = newTasks[index];
    newTasks[index] = newTasks[index - 1];
    newTasks[index - 1] = temp;
    store.reorderTasks(newTasks);
  };

  const handleMoveDown = (index: number) => {
    if (index === tasks.length - 1) return;
    const newTasks = [...tasks];
    const temp = newTasks[index];
    newTasks[index] = newTasks[index + 1];
    newTasks[index + 1] = temp;
    store.reorderTasks(newTasks);
  };

  const handleToggleActive = (id: string, currentActive: boolean) => {
    store.updateTask(id, { isActive: !currentActive });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 border-b border-border bg-card/10 flex-row justify-between items-center">
        <Text className="text-white text-base font-pixel">TASK LIST CRUD</Text>
        <TouchableOpacity
          onPress={() => setShowAddForm(!showAddForm)}
          className="bg-player px-3 py-2 rounded-lg border-b-2 border-cyan-800"
        >
          <Text className="text-background font-pixel text-[8px] font-bold">
            {showAddForm ? 'CLOSE' : 'ADD NEW'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        {/* Inline Add Task Form */}
        {showAddForm && (
          <View className="bg-card border border-player/50 p-5 rounded-2xl mb-6 shadow-xl">
            <Text className="text-player font-pixel text-[9px] mb-3 uppercase tracking-wider">CREATE A TASK</Text>
            
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Task name (e.g. Code in React Native)"
              placeholderTextColor="#8E8E9F"
              className="bg-background text-white font-sans border border-border rounded-xl px-4 py-3 text-sm mb-4"
            />

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

            {/* Checkoff type selector */}
            <View className="flex-row gap-4 mb-4">
              <View className="flex-1">
                <Text className="text-muted font-pixel text-[8px] mb-2 uppercase">Checkoff Mode</Text>
                <View className="flex-row gap-2 bg-background p-1 rounded-xl border border-border">
                  <TouchableOpacity
                    onPress={() => setCheckoffType('single')}
                    className={`flex-1 py-2 rounded-lg items-center ${
                      checkoffType === 'single' ? 'bg-card' : ''
                    }`}
                  >
                    <Text className={`font-sans text-xs ${checkoffType === 'single' ? 'text-player font-bold' : 'text-muted'}`}>
                      Single Tap
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setCheckoffType('counter')}
                    className={`flex-1 py-2 rounded-lg items-center ${
                      checkoffType === 'counter' ? 'bg-card' : ''
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

            {/* Base XP input */}
            <View className="mb-5">
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

            <TouchableOpacity
              onPress={handleAddTask}
              className="bg-player py-4 rounded-xl items-center border-b-4 border-cyan-800"
            >
              <Text className="text-background font-pixel text-xs tracking-widest uppercase font-bold">
                Add Task
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Existing Tasks List */}
        <Text className="text-white font-pixel text-xs tracking-wider mb-4 uppercase">YOUR REGISTERED TASKS</Text>
        
        {tasks.length === 0 ? (
          <View className="bg-card border border-border p-8 rounded-2xl items-center">
            <Text className="text-muted font-sans text-xs text-center">
              No tasks configured yet. Click "ADD NEW" above to start training.
            </Text>
          </View>
        ) : (
          <View className="gap-3.5 mb-16">
            {tasks.map((task, idx) => {
              const cat = CATEGORIES.find(c => c.id === task.category) || CATEGORIES[5];
              const CatIcon = cat.icon;

              return (
                <View
                  key={task.id}
                  className={`bg-card border p-4 rounded-2xl flex-row justify-between items-center ${
                    task.isActive ? 'border-border' : 'border-border/30 opacity-40'
                  }`}
                >
                  {/* Left task details */}
                  <View className="flex-1 mr-2">
                    <View className="flex-row items-center mb-1">
                      <View className={`p-1.5 rounded-lg mr-2 ${cat.bg}`}>
                        <CatIcon size={14} color={cat.color} />
                      </View>
                      <Text className="text-white font-sans text-sm font-semibold truncate">
                        {task.name}
                      </Text>
                    </View>
                    <View className="flex-row items-center space-x-2">
                      <Text className="text-gold font-pixel text-[8px]">+{task.baseXP}XP</Text>
                      <Text className="text-muted font-sans text-[11px]">•</Text>
                      <Text className="text-muted font-sans text-xs capitalize">{task.category}</Text>
                      {task.checkoffType === 'counter' && (
                        <>
                          <Text className="text-muted font-sans text-[11px]">•</Text>
                          <Text className="text-player font-sans text-xs">Target: {task.counterTarget}</Text>
                        </>
                      )}
                    </View>
                  </View>

                  {/* Actions Column */}
                  <View className="flex-row items-center space-x-2.5">
                    {/* Reorder Arrows */}
                    <View className="gap-1.5">
                      <TouchableOpacity
                        onPress={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        className={`p-1 rounded bg-background border border-border ${idx === 0 ? 'opacity-30' : ''}`}
                      >
                        <ChevronUp size={12} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleMoveDown(idx)}
                        disabled={idx === tasks.length - 1}
                        className={`p-1 rounded bg-background border border-border ${idx === tasks.length - 1 ? 'opacity-30' : ''}`}
                      >
                        <ChevronDown size={12} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>

                    {/* Edit button */}
                    <TouchableOpacity
                      onPress={() => router.push(`/task-detail/${task.id}`)}
                      className="p-2.5 rounded-lg bg-background border border-border"
                    >
                      <Edit2 size={13} color="#4FC3F7" />
                    </TouchableOpacity>

                    {/* Toggle Active Switch */}
                    <TouchableOpacity
                      onPress={() => handleToggleActive(task.id, task.isActive)}
                      className={`px-3 py-2.5 rounded-lg border ${
                        task.isActive ? 'bg-win/10 border-win' : 'bg-border/20 border-transparent'
                      }`}
                    >
                      <Text className={`font-pixel text-[7px] ${task.isActive ? 'text-win font-bold' : 'text-muted'}`}>
                        {task.isActive ? 'ACTIVE' : 'MUTED'}
                      </Text>
                    </TouchableOpacity>

                    {/* Delete */}
                    <TouchableOpacity
                      onPress={() => store.deleteTask(task.id)}
                      className="p-2.5 rounded-lg bg-background border border-border"
                    >
                      <Trash2 size={13} color="#FF4655" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
