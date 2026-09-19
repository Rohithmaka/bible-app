import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, BookOpen, Calendar, Heart, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBibleStore } from '../../store/useBibleStore';
import { SpiritualTheme } from '../../constants/spiritualTheme';

export default function TabsLayout() {
  const { themeMode } = useBibleStore();
  const isDark = themeMode === 'dark';
  const palette = isDark ? SpiritualTheme.dark : SpiritualTheme.light;
  const insets = useSafeAreaInsets();

  const bottomInset = Math.max(insets.bottom, Platform.OS === 'android' ? 6 : 4);
  const tabBarHeight = Platform.select({
    ios: 56 + bottomInset,
    android: 64 + bottomInset,
    default: 66,
  });

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.accentGreen,
        tabBarInactiveTintColor: palette.textMuted,
        tabBarStyle: {
          backgroundColor: palette.card,
          borderTopColor: palette.border,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: bottomInset,
          paddingTop: 6,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 1,
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bible"
        options={{
          title: 'Bible',
          tabBarIcon: ({ color, size }) => <BookOpen size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: 'Planner',
          tabBarIcon: ({ color, size }) => <Calendar size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="prayer"
        options={{
          title: 'Prayer',
          tabBarIcon: ({ color, size }) => <Heart size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={20} color={color} />,
        }}
      />

      {/* Hide unused legacy tab files if present */}
      <Tabs.Screen name="discover" options={{ href: null }} />
      <Tabs.Screen name="library" options={{ href: null }} />
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="rival" options={{ href: null }} />
      <Tabs.Screen name="tasks" options={{ href: null }} />
    </Tabs>
  );
}

