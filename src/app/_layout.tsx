import { useEffect } from 'react';
import { View, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { useBibleStore } from '../store/useBibleStore';
import { initNotificationChannels, setupNotificationListeners } from '../services/reminderNotificationService';
import { initializeUserSession } from '../services/authService';

const queryClient = new QueryClient();

export default function RootLayout() {
  const router = useRouter();
  const { themeMode } = useBibleStore();
  const isDark = themeMode === 'dark';

  const [fontsLoaded] = useFonts({
    'Mandali': require('../../assets/fonts/Mandali.ttf'),
    'Mandali-Bold': require('../../assets/fonts/Mandali-Bold.ttf'),
    'Mandali-Regular': require('../../assets/fonts/Mandali-Regular.ttf'),
  });

  useEffect(() => {
    // 1. Initialize anonymous / cloud auth session
    initializeUserSession();

    // 2. Initialize notification channels & deep link listeners
    initNotificationChannels();
    const unsubscribe = setupNotificationListeners((route) => {
      try {
        router.push(route as any);
      } catch (e) {
        console.warn('Deep link navigation error:', e);
      }
    });

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const linkId = 'mandali-google-font';
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=Mandali&display=swap';
        document.head.appendChild(link);
      }
    }

    return () => unsubscribe();
  }, []);

  const outerBg = isDark ? '#0A0C0E' : '#E8E2D7';
  const innerBg = isDark ? '#121417' : '#FAF7F2';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider style={{ flex: 1 }}>
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
                <Stack.Screen
                  name="reminders"
                  options={{ presentation: 'card', animation: 'slide_from_right' }}
                />
              </Stack>
            </View>
          </View>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

