import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';
import { useStore, getLocalDateString } from '../store/useStore';
import { PixelRival } from '../components/PixelRival';
import { getRivalXPOnTask, isDoneBefore6PM } from '../engine/xpEngine';
import { Trophy, ShieldAlert, Award, Skull, ArrowRight, ShieldCheck } from 'lucide-react-native';

export default function BattleResultScreen() {
  const router = useRouter();
  const store = useStore();
  
  const dailyBattle = store.dailyBattle;
  const rival = store.rival;
  const tasks = store.tasks;
  const history = store.battleHistory;

  const flashAnim = useRef(new Animated.Value(0)).current;

  // Retrieve the latest resolved result from history or current battle
  const resolvedBattle = history[0] || {
    result: 'rival',
    playerXP: 0,
    rivalXP: 300,
    cleanDay: false,
    date: getLocalDateString(),
  };

  const isWin = resolvedBattle.result === 'player';

  // Trigger flash entry animation on mount
  useEffect(() => {
    Animated.sequence([
      Animated.timing(flashAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(flashAnim, {
        toValue: 0.15,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isWin]);

  const handleNextDay = () => {
    // Start next day
    const nextDate = getLocalDateString();
    store.startNewDay(nextDate);
    // Back to Arena
    router.replace('/(tabs)');
  };

  // Build task breakdown details
  const breakdownList = Object.keys(dailyBattle?.tasks || {}).map((taskId) => {
    const tConfig = tasks.find(t => t.id === taskId);
    const tState = dailyBattle?.tasks[taskId];
    
    const name = tConfig?.name || 'Unknown Task';
    const baseXP = tState?.baseXP || 0;
    const completedAt = tState?.completedAt || null;
    const rivalXP = tState?.rivalXPAccrued || 0;
    
    // Check if completed before 6PM
    const dayStartTime = dailyBattle ? new Date(dailyBattle.date).setHours(0,0,0,0) : 0;
    const isEarly = completedAt ? isDoneBefore6PM(completedAt, dayStartTime) : false;

    let timeText = 'Not Completed';
    if (completedAt) {
      const d = new Date(completedAt);
      timeText = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    return {
      name,
      baseXP,
      rivalXP,
      isEarly,
      timeText,
      completed: completedAt !== null,
    };
  });

  // Sort breakdown list for Loss state (ranked by biggest bleed)
  if (!isWin) {
    breakdownList.sort((a, b) => b.rivalXP - a.rivalXP);
  }

  // Flash color depending on win/loss
  const flashBgColor = isWin ? '#4FC3F7' : '#FF4655';

  return (
    <SafeAreaView className="flex-1 bg-background justify-between">
      {/* Visual Flash Effect */}
      <Animated.View
        style={[
          styles.flashEffect,
          {
            backgroundColor: flashBgColor,
            opacity: flashAnim,
          },
        ]}
      />

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        {/* Results Banner */}
        <View className="items-center my-6">
          <Text className="text-muted font-pixel text-[8px] tracking-widest uppercase mb-1">Daily Battle Summary</Text>
          <Text className="text-white font-pixel text-xs tracking-wider mb-2">{resolvedBattle.date}</Text>
          
          <View
            className={`px-5 py-4 rounded-xl border-2 mt-2 items-center ${
              isWin ? 'bg-win/10 border-win' : 'bg-loss/10 border-loss'
            }`}
          >
            {isWin ? (
              <Trophy size={40} color="#69FF6E" />
            ) : (
              <Skull size={40} color="#FF4655" />
            )}
            
            <Text className={`font-pixel text-sm mt-3 tracking-widest text-center uppercase leading-6 ${
              isWin ? 'text-win' : 'text-loss'
            }`}>
              {isWin
                ? `YOU WIN!\n+${Math.round(resolvedBattle.playerXP - resolvedBattle.rivalXP)} XP ADVANTAGE`
                : `RIVAL WINS!\n${rival.name} +1 LEVEL`}
            </Text>
          </View>
        </View>

        {/* Rival animation result view */}
        <View className="items-center justify-center bg-card border border-border p-6 rounded-2xl mb-6 relative">
          <PixelRival
            spriteId={rival.spriteId}
            evolutionForm={rival.evolutionForm}
            animationState={isWin ? 'lose' : 'win'}
            size={110}
          />
          <Text className="text-white font-pixel text-xs mt-3 uppercase tracking-wider">
            {rival.name} Status
          </Text>
          
          {/* Level Drop / Gain Indicator */}
          <Text className={`font-pixel text-[9px] mt-1.5 ${isWin ? 'text-win' : 'text-rival'}`}>
            {isWin
              ? `Lv.${rival.level + 1} → Lv.${rival.level} (LEVEL DECREASE)`
              : `Lv.${rival.level - 1} → Lv.${rival.level} (LEVEL INCREASE)`}
          </Text>

          {/* Sassy Result Taunt */}
          <View className="bg-background/80 border border-border p-4 rounded-xl mt-4 w-full">
            <Text className="text-white font-sans text-xs italic text-center leading-5 px-1.5">
              {isWin
                ? `"Not bad. Don't get comfortable, I will double my training tomorrow."`
                : `"I won. Again. Same time tomorrow or are you giving up?"`}
            </Text>
          </View>
        </View>

        {/* Task Breakdown list */}
        <View className="bg-card border border-border p-5 rounded-2xl mb-12">
          <Text className="text-white font-pixel text-[10px] uppercase mb-4 tracking-wider">
            {isWin ? "TASK COMPLETION SPEEDS" : "XP BLEED SOURCES (RANKED)"}
          </Text>
          
          {breakdownList.length === 0 ? (
            <Text className="text-muted font-sans text-xs text-center py-2">No tasks logged for this battle.</Text>
          ) : (
            <View className="gap-3.5">
              {breakdownList.map((item) => (
                <View
                  key={item.name}
                  className="bg-background border border-border/40 p-3.5 rounded-xl flex-row justify-between items-center"
                >
                  <View className="flex-1 mr-2">
                    <Text className="text-white font-sans text-sm font-semibold truncate">{item.name}</Text>
                    <View className="flex-row items-center space-x-1.5 mt-0.5">
                      <Text className="text-gold font-sans text-[11px]">+{item.baseXP}XP</Text>
                      <Text className="text-muted font-sans text-[11px]">•</Text>
                      <Text className="text-muted font-sans text-[11px]">{item.timeText}</Text>
                    </View>
                  </View>

                  <View className="items-end">
                    {/* Status Badge */}
                    {item.completed ? (
                      <View className="flex-row items-center space-x-1">
                        {item.isEarly ? (
                          <ShieldCheck size={14} color="#69FF6E" />
                        ) : (
                          <ShieldAlert size={14} color="#FFB74D" />
                        )}
                        <Text
                          className={`font-pixel text-[7px] ml-0.5 ${
                            item.isEarly ? 'text-win' : 'text-gold'
                          }`}
                        >
                          {item.isEarly ? 'EARLY (DONE)' : 'LATE (DONE)'}
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-rival font-pixel text-[7px]">BLEED FAILURE</Text>
                    )}
                    
                    {/* Bleed XP amount */}
                    <Text className="text-rival font-sans text-xs mt-1">
                      +{Math.round(item.rivalXP)} XP Lost
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

      </ScrollView>

      {/* Footer CTA */}
      <View className="px-6 pb-8 bg-background border-t border-border/20 pt-4">
        <TouchableOpacity
          onPress={handleNextDay}
          activeOpacity={0.8}
          className="bg-player py-5 rounded-xl flex-row justify-center items-center border-b-4 border-cyan-800"
        >
          <Text className="text-background font-pixel text-sm tracking-widest uppercase font-bold">
            {isWin ? "SEE YOU TOMORROW" : "TOMORROW I'LL BE READY"}
          </Text>
          <ArrowRight size={18} color="#0A0A0F" className="ml-2" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flashEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    pointerEvents: 'none',
  },
});
