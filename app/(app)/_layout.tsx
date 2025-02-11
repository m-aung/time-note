import { Stack } from 'expo-router';
import { useAuth } from '../../src/store/authStore';
import { Redirect } from 'expo-router';

export default function AppLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/welcome" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" options={{ title: 'Dashboard' }} />
      <Stack.Screen name="add-persona" options={{ title: 'Add Persona' }} />
      <Stack.Screen name="persona-details" options={{ title: 'Persona Details' }} />
      <Stack.Screen name="add-time-pass" options={{ title: 'Add Time Pass' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="notification-settings" options={{ title: 'Notification Settings' }} />
      <Stack.Screen name="notification-history" options={{ title: 'Notification History' }} />
    </Stack>
  );
} 