import { Stack } from 'expo-router';
import { useAuth } from '../../src/store/authStore';
import { Redirect } from 'expo-router';

export default function AuthLayout() {
  const { user } = useAuth();

  if (user) {
    return <Redirect href="/dashboard" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" options={{ title: 'Welcome' }} />
      <Stack.Screen name="forgot-password" options={{ title: 'Forgot Password' }} />
    </Stack>
  );
} 