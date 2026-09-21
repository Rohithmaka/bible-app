import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { hasCompletedOnboarding, initializeUserSession } from '../services/authService';
import { useSpiritualStore } from '../store/useSpiritualStore';

export default function EntryPoint() {
  const [loading, setLoading] = useState(true);
  const [targetRoute, setTargetRoute] = useState<'/(tabs)' | '/login'>('/(tabs)');
  const { user } = useSpiritualStore();

  useEffect(() => {
    async function determineRoute() {
      try {
        await initializeUserSession();
        const isUserOnboarded = hasCompletedOnboarding() || user.onboarded;

        if (isUserOnboarded) {
          setTargetRoute('/(tabs)');
        } else {
          setTargetRoute('/login');
        }
      } catch (e) {
        setTargetRoute('/login');
      } finally {
        setLoading(false);
      }
    }

    determineRoute();
  }, [user.onboarded]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#121417', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return <Redirect href={targetRoute as any} />;
}

