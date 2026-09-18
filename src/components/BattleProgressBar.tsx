import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BattleProgressBarProps {
  playerXP: number;
  rivalXP: number;
  rivalName: string;
}

export const BattleProgressBar: React.FC<BattleProgressBarProps> = ({
  playerXP,
  rivalXP,
  rivalName
}) => {
  const total = playerXP + rivalXP;
  
  // Calculate dividing ratio (default to 50% if both are 0)
  const playerRatio = total === 0 ? 50 : (playerXP / total) * 100;
  const rivalRatio = 100 - playerRatio;

  return (
    <View className="w-full bg-card p-4 rounded-xl border border-border">
      {/* XP Numbers Row */}
      <View className="flex-row justify-between items-end mb-2.5">
        <View>
          <Text className="text-[8px] font-pixel text-player mb-1 uppercase tracking-wider">YOUR POWER</Text>
          <Text className="text-sm font-pixel text-player">{Math.round(playerXP)} <Text className="text-[10px] text-player/80">XP</Text></Text>
        </View>
        
        {/* Dynamic center indicator */}
        <View className="items-center">
          <Text className="text-[8px] font-pixel text-gold animate-pulse tracking-widest">VS</Text>
        </View>

        <View className="items-end">
          <Text className="text-[8px] font-pixel text-rival mb-1 uppercase tracking-wider">{rivalName}'s POWER</Text>
          <Text className="text-sm font-pixel text-rival">{Math.round(rivalXP)} <Text className="text-[10px] text-rival/80">XP</Text></Text>
        </View>
      </View>

      {/* Split Bar Container */}
      <View style={styles.barContainer} className="bg-background border border-border">
        {/* Player portion (Blue) */}
        {playerRatio > 0 && (
          <View
            style={{ width: `${playerRatio}%` }}
            className="bg-player h-full"
          />
        )}
        
        {/* Rival portion (Red) */}
        {rivalRatio > 0 && (
          <View
            style={{ width: `${rivalRatio}%` }}
            className="bg-rival h-full"
          />
        )}

        {/* Tug of war divider mark */}
        {total > 0 && playerRatio > 0 && rivalRatio > 0 && (
          <View
            style={[styles.divider, { left: `${playerRatio}%` }]}
            className="bg-white"
          />
        )}
      </View>

      {/* Live tracking indicator */}
      <View className="flex-row justify-between mt-2">
        <Text className="text-[7px] font-pixel text-muted">STABLE LOCK</Text>
        <Text className="text-[7px] font-pixel text-rival animate-pulse">● LIVE BLEED DRAIN</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    height: 24,
    borderRadius: 6,
    overflow: 'hidden',
    flexDirection: 'row',
    position: 'relative',
  },
  divider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    zIndex: 10,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  }
});
