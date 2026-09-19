import React from 'react';
import { View, Text, Platform } from 'react-native';
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
    ios: 62 + bottomInset,
    android: 68 + bottomInset,
    default: 70,
  });

  const TAB_COLORS = {
    home: { active: '#D97706', bg: isDark ? 'rgba(217, 119, 6, 0.22)' : 'rgba(217, 119, 6, 0.14)' },
    bible: { active: '#059669', bg: isDark ? 'rgba(5, 150, 105, 0.22)' : 'rgba(5, 150, 105, 0.14)' },
    planner: { active: '#4F46E5', bg: isDark ? 'rgba(79, 70, 229, 0.22)' : 'rgba(79, 70, 229, 0.14)' },
    prayer: { active: '#E11D48', bg: isDark ? 'rgba(225, 29, 72, 0.22)' : 'rgba(225, 29, 72, 0.14)' },
    profile: { active: '#7C3AED', bg: isDark ? 'rgba(124, 58, 237, 0.22)' : 'rgba(124, 58, 237, 0.14)' },
  };

  const inactiveColor = isDark ? '#9CA3AF' : '#6B7280';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: palette.card,
          borderTopColor: palette.border,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: bottomInset,
          paddingTop: 4,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 12,
                paddingVertical: 3,
                borderRadius: 14,
                backgroundColor: focused ? TAB_COLORS.home.bg : 'transparent',
              }}
            >
              <Home
                size={22}
                color={focused ? TAB_COLORS.home.active : inactiveColor}
                fill={focused ? TAB_COLORS.home.active : 'none'}
              />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 11,
                fontWeight: focused ? '800' : '600',
                color: focused ? TAB_COLORS.home.active : inactiveColor,
                marginTop: 2,
                marginBottom: 2,
              }}
            >
              Home
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="bible"
        options={{
          title: 'Bible',
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: 'center',
                justify: 'center',
                paddingHorizontal: 12,
                paddingVertical: 3,
                borderRadius: 14,
                backgroundColor: focused ? TAB_COLORS.bible.bg : 'transparent',
              }}
            >
              <BookOpen
                size={22}
                color={focused ? TAB_COLORS.bible.active : inactiveColor}
                fill={focused ? TAB_COLORS.bible.active : 'none'}
              />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 11,
                fontWeight: focused ? '800' : '600',
                color: focused ? TAB_COLORS.bible.active : inactiveColor,
                marginTop: 2,
                marginBottom: 2,
              }}
            >
              Bible
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: 'Planner',
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: 'center',
                justify: 'center',
                paddingHorizontal: 12,
                paddingVertical: 3,
                borderRadius: 14,
                backgroundColor: focused ? TAB_COLORS.planner.bg : 'transparent',
              }}
            >
              <Calendar
                size={22}
                color={focused ? TAB_COLORS.planner.active : inactiveColor}
                fill={focused ? TAB_COLORS.planner.active : 'none'}
              />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 11,
                fontWeight: focused ? '800' : '600',
                color: focused ? TAB_COLORS.planner.active : inactiveColor,
                marginTop: 2,
                marginBottom: 2,
              }}
            >
              Planner
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="prayer"
        options={{
          title: 'Prayer',
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: 'center',
                justify: 'center',
                paddingHorizontal: 12,
                paddingVertical: 3,
                borderRadius: 14,
                backgroundColor: focused ? TAB_COLORS.prayer.bg : 'transparent',
              }}
            >
              <Heart
                size={22}
                color={focused ? TAB_COLORS.prayer.active : inactiveColor}
                fill={focused ? TAB_COLORS.prayer.active : 'none'}
              />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 11,
                fontWeight: focused ? '800' : '600',
                color: focused ? TAB_COLORS.prayer.active : inactiveColor,
                marginTop: 2,
                marginBottom: 2,
              }}
            >
              Prayer
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                alignItems: 'center',
                justify: 'center',
                paddingHorizontal: 12,
                paddingVertical: 3,
                borderRadius: 14,
                backgroundColor: focused ? TAB_COLORS.profile.bg : 'transparent',
              }}
            >
              <User
                size={22}
                color={focused ? TAB_COLORS.profile.active : inactiveColor}
                fill={focused ? TAB_COLORS.profile.active : 'none'}
              />
            </View>
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 11,
                fontWeight: focused ? '800' : '600',
                color: focused ? TAB_COLORS.profile.active : inactiveColor,
                marginTop: 2,
                marginBottom: 2,
              }}
            >
              Profile
            </Text>
          ),
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


