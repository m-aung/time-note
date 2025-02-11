import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '../src/store/authStore';
import { LoadingSpinner } from '../src/components/LoadingSpinner';

export default function RootLayout() {
  const { initializeAuth, isLoading } = useAuth();

  useEffect(() => {
    initializeAuth();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
    </Stack>
  );
} 