import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';
import { PixelRival } from '../../components/PixelRival';
import { Check, CheckCircle2, ArrowRight } from 'lucide-react-native';

interface FakeTask {
  id: string;
  name: string;
  baseXP: number;
  completed: boolean;
  rivalXPAccrued: number;
}

export default function TutorialScreen() {
  const router = useRouter();
  const rivalName = useStore((state) => state.rival.name);
  const rivalSprite = useStore((state) => state.rival.spriteId);

  const [playerXP, setPlayerXP] = useState(120);
  const [rivalXP, setRivalXP] = useState(380);
  const [phase, setPhase] = useState(0); // 0 = start, 1 = completed first task, 2 = all done instruction
  
  const [fakeTasks, setFakeTasks] = useState<FakeTask[]>([
    { id: '1', name: "Study coding patterns", baseXP: 400, completed: false, rivalXPAccrued: 180 },
    { id: '2', name: "Work out (30 mins)", baseXP: 300, completed: false, rivalXPAccrued: 120 },
    { id: '3', name: "Drink 8 glasses of water", baseXP: 200, completed: false, rivalXPAccrued: 80 },
  ]);

  const [tickingRivalXP, setTickingRivalXP] = useState(380);

  // Simulate real-time ticking of rival XP during Phase 0 to feel urgent
  useEffect(() => {
    if (phase > 0) return;
    
    const interval = setInterval(() => {
      setTickingRivalXP((prev) => {
        // Ticks up slowly
        const next = prev + 1;
        // Update the incomplete tasks rival XP accrued slightly
        setFakeTasks((tasks) => 
          tasks.map(t => !t.completed ? { ...t, rivalXPAccrued: t.rivalXPAccrued + 0.3 } : t)
        );
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  // Total rival XP is a sum of task accrued
  useEffect(() => {
    const sum = fakeTasks.reduce((acc, t) => acc + t.rivalXPAccrued, 0);
    setRivalXP(Math.round(sum));
  }, [fakeTasks]);

  const handleCompleteTask = (id: string) => {
    if (phase > 0) return;

    setFakeTasks((tasks) =>
      tasks.map((t) => {
        if (t.id === id) {
          // Complete task
          const playerGain = t.baseXP;
          setPlayerXP((p) => p + playerGain);
          setPhase(1);
          return { ...t, completed: true };
        }
        return t;
      })
    );
  };

  const handleFinishTutorial = () => {
    router.replace('/(tabs)');
  };

  const maxTotalXP = 900;
  const playerPercent = Math.min(100, (playerXP / maxTotalXP) * 100);
  const rivalPercent = Math.min(100, (rivalXP / maxTotalXP) * 100);

  return (
    <SafeAreaView className="flex-1 bg-background justify-between p-6">
      {/* Top Header info */}
      <View className="mt-2">
        <Text className="text-muted font-pixel text-[10px] tracking-widest uppercase text-center mb-1">Step 4 of 4: Battle Training</Text>
        <Text className="text-white text-base font-pixel text-center">HOW THE BATTLE WORKS</Text>
      </View>

      {/* Arena Stage */}
      <View className="items-center justify-center my-4">
        {/* Animated Rival */}
        <PixelRival
          spriteId={rivalSprite}
          evolutionForm={0}
          animationState={phase === 0 ? 'taunt' : 'lose'}
          size={110}
        />
        <Text className="text-rival font-pixel text-xs mt-2 tracking-wide uppercase">
          {rivalName} — Lv. 5 (TUTORIAL)
        </Text>
        
        {/* Real-time taunt bubble */}
        <View className="bg-card border border-border px-4 py-3 rounded-xl mt-4 w-full">
          <Text className="text-white font-sans text-xs italic text-center">
            {phase === 0
              ? `\"Look at that gap! I'm gaining XP on those tasks every second you sit there.\"`
              : `\"Ugh! You stopped the bleed on that task. Not bad, but can you do it under pressure?\"`}
          </Text>
        </View>
      </View>

      {/* Battle Bar */}
      <View className="mb-6">
        <View className="flex-row justify-between mb-1.5 px-1">
          <Text className="text-player font-pixel text-[10px]">YOU: {playerXP} XP</Text>
          <Text className="text-rival font-pixel text-[10px]">{rivalName}: {rivalXP} XP</Text>
        </View>
        
        {/* Progress tracks */}
        <View className="h-6 bg-card border border-border rounded-lg overflow-hidden flex-row">
          <View style={{ width: `${playerPercent}%` }} className="bg-player h-full transition-all duration-300" />
          <View className="flex-1 bg-card h-full" />
          <View style={{ width: `${rivalPercent}%` }} className="bg-rival h-full transition-all duration-300" />
        </View>
      </View>

      {/* Prompt Instructions */}
      <View className="bg-card border border-player/30 p-4 rounded-xl mb-4">
        <Text className="text-gold font-pixel text-[9px] mb-1.5 uppercase tracking-wider">
          {phase === 0 ? "⚠️ YOUR TASK IS BLEEDING!" : "✅ DRAIN STOPPED!"}
        </Text>
        <Text className="text-white font-sans text-sm leading-5">
          {phase === 0
            ? "Your rival is winning by 260+ XP! Tap any card's DONE button to lock in your XP and stop the rival's progress."
            : "Look! Tapping that task instantly awarded you full XP, and locked the rival's drain. That locked XP stays fixed."}
        </Text>
      </View>

      {/* Tasks List */}
      <View className="gap-2.5 mb-6">
        {fakeTasks.map((t) => (
          <View
            key={t.id}
            className={`bg-card border p-3.5 rounded-xl flex-row justify-between items-center ${
              t.completed ? 'border-win/30 opacity-60' : 'border-border'
            }`}
          >
            <View>
              <Text className={`font-sans text-sm font-semibold ${t.completed ? 'text-win line-through' : 'text-white'}`}>
                {t.name}
              </Text>
              <View className="flex-row items-center space-x-1.5 mt-1">
                <Text className="text-gold font-sans text-xs">+{t.baseXP} base XP</Text>
                {!t.completed && (
                  <Text className="text-rival font-sans text-xs">
                    • Rival accrued: {Math.round(t.rivalXPAccrued)} XP
                  </Text>
                )}
              </View>
            </View>

            {t.completed ? (
              <View className="bg-win/15 px-3 py-2 rounded-lg border border-win flex-row items-center space-x-1">
                <Check size={14} color="#69FF6E" />
                <Text className="text-win font-pixel text-[8px]">DONE</Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => handleCompleteTask(t.id)}
                disabled={phase > 0}
                className="bg-player px-4 py-2.5 rounded-lg border-b-2 border-cyan-800"
              >
                <Text className="text-background font-pixel text-[8px] tracking-wider uppercase font-bold">
                  DONE
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* CTA bottom buttons */}
      <View className="pb-4">
        {phase > 0 ? (
          <TouchableOpacity
            onPress={handleFinishTutorial}
            activeOpacity={0.8}
            className="bg-win py-5 rounded-xl flex-row justify-center items-center border-b-4 border-green-800"
          >
            <Text className="text-background font-pixel text-sm tracking-widest uppercase">
              I'm Ready
            </Text>
            <ArrowRight size={18} color="#0A0A0F" className="ml-2" />
          </TouchableOpacity>
        ) : (
          <View className="py-5 border border-dashed border-border rounded-xl items-center bg-card/20">
            <Text className="text-muted font-pixel text-[9px] uppercase tracking-widest">TAP A TASK TO LEARN XP DYNAMICS</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
