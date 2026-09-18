import { useEffect } from 'react';
import { View, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useBibleStore } from '../store/useBibleStore';

const queryClient = new QueryClient();

export default function RootLayout() {
  const { themeMode } = useBibleStore();
  const isDark = themeMode === 'dark';

  const outerBg = isDark ? '#0A0C0E' : '#E8E2D7';
  const innerBg = isDark ? '#121417' : '#FAF7F2';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        
        {/* Outer Desktop Background Container */}
        <View style={{ flex: 1, backgroundColor: outerBg, alignItems: 'center', justifyContent: 'center' }}>
          
          {/* Inner Mobile Device Frame (Max Width 480px) */}
          <View
            style={{
              flex: 1,
              width: '100%',
              maxWidth: 480,
              backgroundColor: innerBg,
              ...(Platform.OS === 'web' && {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 24,
                borderLeftWidth: 1,
                borderRightWidth: 1,
                borderColor: isDark ? '#262A31' : '#E2D8C9',
              }),
            }}
          >
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="study-workspace"
                options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="morning-journey"
                options={{ presentation: 'fullScreenModal', animation: 'fade' }}
              />
              <Stack.Screen
                name="evening-journey"
                options={{ presentation: 'fullScreenModal', animation: 'fade' }}
              />
              <Stack.Screen
                name="pray-now"
                options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="stories"
                options={{ presentation: 'card', animation: 'slide_from_right' }}
              />
              <Stack.Screen
                name="memory-practice"
                options={{ presentation: 'card', animation: 'slide_from_right' }}
              />
              <Stack.Screen
                name="onboarding-flow"
                options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
              />
            </Stack>
          </View>
        </View>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
