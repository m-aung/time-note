import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../store/authStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { linking } from '../utils/linking';

// Import screens
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { AddPersonaScreen } from '../screens/AddPersonaScreen';
import { PersonaDetailsScreen } from '../screens/PersonaDetailsScreen';
import { AddTimePassScreen } from '../screens/AddTimePassScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { NotificationSettingsScreen } from '../screens/NotificationSettingsScreen';
import { NotificationHistoryScreen } from '../screens/NotificationHistoryScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Authenticated stack
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="AddPersona" component={AddPersonaScreen} />
            <Stack.Screen name="PersonaDetails" component={PersonaDetailsScreen} />
            <Stack.Screen name="AddTimePass" component={AddTimePassScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
            <Stack.Screen name="NotificationHistory" component={NotificationHistoryScreen} />
          </>
        ) : (
          // Non-authenticated stack
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 