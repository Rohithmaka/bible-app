import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import Svg, { Rect, G, Path } from 'react-native-svg';

interface PixelRivalProps {
  spriteId: 'warrior' | 'scholar' | 'shadow' | 'phantom' | 'glitch' | 'clone';
  evolutionForm: 0 | 1 | 2; // 0=base, 1=powered, 2=degraded
  animationState: 'idle' | 'taunt' | 'win' | 'lose';
  size?: number;
}

// 16x16 Pixel grids for each sprite class
// Each number maps to a color in the palette
// 0 = Transparent
// 1 = Skin / Highlight
// 2 = Main Color (armor/robe/body)
// 3 = Accent Color (sword/details/eyes)
// 4 = Outline / Dark shading

const SPRITE_GRIDS: Record<string, number[][]> = {
  warrior: [
    [0,0,0,0,4,4,4,4,4,0,0,0,0,0,0,0],
    [0,0,0,4,2,2,2,2,2,4,0,0,0,0,0,0],
    [0,0,4,2,2,2,2,2,2,2,4,0,3,0,0,0],
    [0,0,4,2,1,1,1,1,1,2,4,0,3,0,0,0],
    [0,4,1,1,4,1,1,4,1,1,4,4,3,4,0,0],
    [0,4,1,1,1,1,1,1,1,1,4,2,3,2,4,0],
    [0,0,4,4,4,4,4,4,4,4,4,2,3,2,4,0],
    [0,0,0,4,2,2,2,2,2,4,2,2,3,2,2,4],
    [0,0,4,2,2,2,2,2,2,2,4,4,4,4,4,4],
    [0,4,2,2,2,2,2,2,2,2,2,4,0,0,0,0],
    [0,4,2,4,2,2,2,2,2,4,2,4,0,0,0,0],
    [4,2,2,4,2,2,2,2,2,4,2,2,4,0,0,0],
    [4,2,4,0,4,4,4,4,4,0,4,2,4,0,0,0],
    [0,4,0,0,4,2,4,2,4,0,0,4,0,0,0,0],
    [0,0,0,0,4,2,4,2,4,0,0,0,0,0,0,0],
    [0,0,0,0,4,4,0,4,4,0,0,0,0,0,0,0]
  ],
  scholar: [
    [0,0,0,0,4,4,4,4,4,0,0,0,0,0,0,0],
    [0,0,0,4,3,3,3,3,3,4,0,0,0,0,0,0],
    [0,0,0,4,2,2,2,2,2,4,0,0,0,0,0,0],
    [0,0,4,2,1,1,1,1,1,2,4,0,0,0,0,0],
    [0,0,4,3,4,1,3,1,4,3,4,0,0,0,0,0],
    [0,0,4,1,1,1,1,1,1,1,4,0,0,0,0,0],
    [0,0,0,4,4,4,4,4,4,4,0,0,0,0,0,0],
    [0,0,0,4,2,2,2,2,2,4,0,0,0,0,0,0],
    [0,0,4,2,2,2,2,2,2,2,4,0,4,4,4,0],
    [0,4,2,2,2,2,2,2,2,2,2,4,4,1,4,0],
    [0,4,2,2,2,2,2,2,2,2,2,4,4,1,4,0],
    [0,4,2,4,2,2,2,2,2,4,2,4,4,4,4,0],
    [0,0,4,0,4,4,4,4,4,0,4,0,0,0,0,0],
    [0,0,0,0,4,2,4,2,4,0,0,0,0,0,0,0],
    [0,0,0,0,4,2,4,2,4,0,0,0,0,0,0,0],
    [0,0,0,0,4,4,0,4,4,0,0,0,0,0,0,0]
  ],
  shadow: [
    [0,0,0,0,0,4,4,4,4,0,0,0,0,0,0,0],
    [0,0,0,0,4,2,2,2,2,4,0,0,0,0,0,0],
    [0,0,0,4,2,2,2,2,2,2,4,0,0,0,0,0],
    [0,0,0,4,2,3,2,2,3,2,4,0,0,0,0,0],
    [0,0,4,2,2,3,2,2,3,2,2,4,0,0,0,0],
    [0,0,4,2,2,2,2,2,2,2,2,4,0,0,0,0],
    [0,0,0,4,2,2,2,2,2,2,4,0,0,0,0,0],
    [0,0,4,2,2,2,2,2,2,2,2,4,0,0,0,0],
    [0,4,2,2,2,2,2,2,2,2,2,2,4,0,0,0],
    [4,2,2,2,2,2,2,2,2,2,2,2,2,4,0,0],
    [4,2,2,4,2,2,2,2,2,4,2,2,2,4,0],
    [0,4,4,0,4,2,2,2,4,0,4,2,2,4,0],
    [0,0,0,0,4,2,2,2,4,0,0,4,4,0,0],
    [0,0,0,0,4,2,4,2,4,0,0,0,0,0,0,0],
    [0,0,0,0,4,2,4,2,4,0,0,0,0,0,0,0],
    [0,0,0,0,4,4,0,4,4,0,0,0,0,0,0,0]
  ],
  phantom: [
    [0,0,0,0,4,4,4,4,4,0,0,0,0,0,0,0],
    [0,0,0,4,2,2,2,2,2,4,0,0,0,0,0,0],
    [0,0,4,2,2,2,2,2,2,2,4,0,0,0,0,0],
    [0,4,2,2,2,2,2,2,2,2,2,4,0,0,0,0],
    [0,4,2,3,3,2,2,3,3,2,2,4,0,0,0,0],
    [0,4,2,3,3,2,2,3,3,2,2,4,0,0,0,0],
    [0,4,2,2,2,2,2,2,2,2,2,4,0,0,0,0],
    [0,4,2,2,2,1,1,2,2,2,2,4,0,0,0,0],
    [0,0,4,2,2,2,2,2,2,2,4,0,0,0,0,0],
    [0,0,0,4,2,2,2,2,2,4,0,0,0,0,0,0],
    [0,0,4,2,2,2,2,2,2,2,4,0,0,0,0,0],
    [0,4,2,2,2,2,2,2,2,2,2,4,0,0,0,0],
    [0,4,2,4,2,4,2,4,2,4,2,4,0,0,0,0],
    [0,4,2,4,2,4,2,4,2,4,2,4,0,0,0,0],
    [0,0,4,0,4,0,4,0,4,0,4,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  ],
  glitch: [
    [0,4,4,0,0,4,4,0,0,4,4,0,0,4,4,0],
    [4,2,2,4,4,3,3,4,4,2,2,4,4,3,3,4],
    [4,2,2,2,3,3,3,3,2,2,2,2,3,3,3,4],
    [0,4,2,1,1,1,3,3,1,1,1,2,4,4,0,0],
    [0,4,2,1,4,1,1,4,1,1,2,4,0,0,0,0],
    [0,4,2,2,2,2,2,2,2,2,2,4,4,4,0,0],
    [4,3,3,4,4,4,4,4,4,4,3,3,2,2,4,0],
    [4,3,3,3,2,2,2,2,3,3,3,2,2,2,4,0],
    [0,4,3,3,2,2,2,2,3,3,3,4,4,4,0,0],
    [0,0,4,4,2,2,2,2,4,4,4,0,0,0,0,0],
    [0,0,4,2,2,2,2,2,2,4,0,0,0,0,0,0],
    [0,4,2,2,4,4,4,4,2,2,4,0,0,0,0,0],
    [0,4,2,4,0,0,0,0,4,2,4,0,0,0,0,0],
    [0,4,4,0,0,0,0,0,0,4,4,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
  ],
  clone: [
    [0,0,0,0,4,4,4,4,4,0,0,0,0,0,0,0],
    [0,0,0,4,2,2,2,2,2,4,0,0,0,0,0,0],
    [0,0,4,2,2,2,2,2,2,2,4,0,0,0,0,0],
    [0,0,4,2,1,1,1,1,1,2,4,0,0,0,0,0],
    [0,4,1,1,3,1,1,3,1,1,4,0,0,0,0,0],
    [0,4,1,1,1,1,1,1,1,1,4,0,0,0,0,0],
    [0,0,4,4,4,4,4,4,4,4,4,0,0,0,0,0],
    [0,0,0,4,2,2,2,2,2,4,0,0,0,0,0],
    [0,0,4,2,2,2,2,2,2,2,4,0,0,0,0,0],
    [0,4,2,2,2,2,2,2,2,2,2,4,0,0,0,0],
    [0,4,2,4,2,2,2,2,2,4,2,4,0,0,0,0],
    [4,2,2,4,2,2,2,2,2,4,2,2,4,0,0,0],
    [4,2,4,0,4,4,4,4,4,0,4,2,4,0,0,0],
    [0,4,0,0,4,2,4,2,4,0,0,4,0,0,0,0],
    [0,0,0,0,4,2,4,2,4,0,0,0,0,0,0,0],
    [0,0,0,0,4,4,0,4,4,0,0,0,0,0,0,0]
  ]
};

// Color palettes based on class & evolution form
// Forms: 0=base, 1=powered (bright/glowing), 2=degraded (dull/washed out)
const COLOR_PALETTES: Record<string, Record<number, string[]>> = {
  warrior: {
    0: ['transparent', '#FFD29D', '#FF4655', '#FFD700', '#1A1A26'], // base red
    1: ['transparent', '#FFE3C3', '#FF6E7B', '#FFF066', '#2D1B22'], // powered gold armor
    2: ['transparent', '#D2B48C', '#B22222', '#CD7F32', '#3E2723'], // degraded rusted armor
  },
  scholar: {
    0: ['transparent', '#FFE0BD', '#4FC3F7', '#FF8F00', '#1A1C29'], // base blue
    1: ['transparent', '#FFF0DF', '#81D4FA', '#FFB74D', '#1B2A3E'], // powered purple/cyan
    2: ['transparent', '#D2B48C', '#37474F', '#8D6E63', '#2C3539'], // degraded dark gray robe
  },
  shadow: {
    0: ['transparent', '#2C1D4D', '#1A0B2E', '#FF0055', '#0B0214'], // dark purple silhouette, red eyes
    1: ['transparent', '#4A148C', '#311B92', '#FF1744', '#000000'], // intense purple flame, glowing eyes
    2: ['transparent', '#5D4037', '#3E2723', '#FF8A80', '#1E1B1B'], // faded mud brown
  },
  phantom: {
    0: ['transparent', '#E0F7FA', '#B2EBF2', '#00E5FF', '#1E3E43'], // floating cyan ghost
    1: ['transparent', '#E0F2F1', '#80CBC4', '#00BFA5', '#0A2B26'], // emerald fire ghost
    2: ['transparent', '#ECEFF1', '#CFD8DC', '#B0BEC5', '#37474F'], // concrete grey ghost
  },
  glitch: {
    0: ['transparent', '#39FF14', '#FF007F', '#00FFFF', '#121212'], // neon green, pink, cyan
    1: ['transparent', '#FF00FF', '#00FFFF', '#FFFF00', '#000000'], // hyper-cyan pink glitch
    2: ['transparent', '#78909C', '#546E7A', '#37474F', '#212121'], // corrupted grey static
  },
  clone: {
    0: ['transparent', '#ECEFF1', '#90A4AE', '#4FC3F7', '#263238'], // chrome steel silver
    1: ['transparent', '#ECEFF1', '#CFD8DC', '#E0F7FA', '#0A1A2E'], // bright glowing mirror blue
    2: ['transparent', '#B0BEC5', '#78909C', '#546E7A', '#1C2833'], // rusted tin clone
  }
};

export const PixelRival: React.FC<PixelRivalProps> = ({
  spriteId,
  evolutionForm,
  animationState,
  size = 120
}) => {
  const [floatAnim] = useState(() => new Animated.Value(0));
  const [shakeAnim] = useState(() => new Animated.Value(0));
  const [jumpAnim] = useState(() => new Animated.Value(0));
  const [opacityAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    // Reset animations
    floatAnim.setValue(0);
    shakeAnim.setValue(0);
    jumpAnim.setValue(0);
    opacityAnim.setValue(1);

    let animation: Animated.CompositeAnimation | null = null;

    if (animationState === 'idle') {
      // 1. Idle: Gentle floating breathing animation (loop)
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -6,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    } else if (animationState === 'taunt') {
      // 2. Taunt: Fast horizontal shaking + scale pulse + color glow (simulated by overlay)
      const shakeSequence = [];
      for (let i = 0; i < 6; i++) {
        shakeSequence.push(
          Animated.timing(shakeAnim, {
            toValue: i % 2 === 0 ? 8 : -8,
            duration: 75,
            useNativeDriver: true,
          })
        );
      }
      shakeSequence.push(
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        })
      );

      animation = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.sequence(shakeSequence),
            Animated.sequence([
              Animated.timing(floatAnim, { toValue: -15, duration: 200, useNativeDriver: true }),
              Animated.timing(floatAnim, { toValue: 0, duration: 250, useNativeDriver: true })
            ])
          ]),
          Animated.delay(800)
        ])
      );
      animation.start();
    } else if (animationState === 'win') {
      // 3. Win: High vertical jump/victory bounce (loop)
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(jumpAnim, {
            toValue: -25,
            duration: 300,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(jumpAnim, {
            toValue: 0,
            duration: 250,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(jumpAnim, {
            toValue: -8,
            duration: 150,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(jumpAnim, {
            toValue: 0,
            duration: 150,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(600)
        ])
      );
      animation.start();
    } else if (animationState === 'lose') {
      // 4. Lose: Slumped, slightly faded, slowly sinking
      animation = Animated.parallel([
        Animated.timing(floatAnim, {
          toValue: 12,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.65,
          duration: 1000,
          useNativeDriver: true,
        })
      ]);
      animation.start();
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [animationState]);

  const grid = SPRITE_GRIDS[spriteId] || SPRITE_GRIDS.warrior;
  const palette = COLOR_PALETTES[spriteId]?.[evolutionForm] || COLOR_PALETTES.warrior[0];

  // Combine translations
  const translateY = Animated.add(floatAnim, jumpAnim);
  const translateX = shakeAnim;

  // Compute cell rendering variables
  const pixelSize = size / 16;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Dynamic Red Glow Shadow for aggressive taunting */}
      {animationState === 'taunt' && (
        <View style={[styles.glow, { width: size, height: size, borderRadius: size / 2 }]} />
      )}
      
      <Animated.View
        style={{
          width: size,
          height: size,
          transform: [
            { translateX },
            { translateY },
            { scaleY: animationState === 'lose' ? 0.85 : 1 }
          ],
          opacity: opacityAnim
        }}
      >
        <Svg width={size} height={size} viewBox="0 0 16 16">
          {/* Render Powered Up Crown/Aura if Evolution Form is 1 */}
          {evolutionForm === 1 && (
            <G>
              {/* Gold dynamic crown spikes on top */}
              <Rect x="5" y="0" width="1" height="1" fill="#FFD700" />
              <Rect x="7" y="0" width="2" height="1" fill="#FFD700" />
              <Rect x="10" y="0" width="1" height="1" fill="#FFD700" />
              <Rect x="6" y="1" width="4" height="1" fill="#FF8F00" />
            </G>
          )}

          {/* Render Degraded Crack lines if Evolution Form is 2 */}
          {grid.map((row, y) =>
            row.map((cell, x) => {
              if (cell === 0) return null;
              let fill = palette[cell] || 'transparent';
              
              // If degraded, add a crack texture (slightly darken some pixels)
              if (evolutionForm === 2 && cell !== 4 && (x + y) % 5 === 0) {
                fill = '#555555';
              }
              
              return (
                <Rect
                  key={`${x}-${y}`}
                  x={x}
                  y={y}
                  width="1"
                  height="1"
                  fill={fill}
                />
              );
            })
          )}
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    backgroundColor: '#FF4655',
    opacity: 0.15,
    transform: [{ scale: 1.15 }],
    shadowColor: '#FF4655',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  }
});
