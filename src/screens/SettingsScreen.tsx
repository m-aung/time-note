import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../store/authStore';
import { useNotificationHistory } from '../store/notificationHistoryStore';
import { NotificationBadge } from '../components/NotificationBadge';
import { useRouter } from 'expo-router';
import { haptics } from '../utils/haptics';

export const SettingsScreen = () => {
  const router = useRouter();
  const { signOut, isLoading } = useAuth();
  const { unreadCount } = useNotificationHistory();

  const handleSignOut = async () => {
    try {
      await haptics.warning();
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: async () => {
              await haptics.light();
              await signOut();
              router.replace('/(auth)');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Sign out error:', error);
      await haptics.error();
    }
  };

  const settingsOptions = [
    {
      title: 'Account',
      items: [
        {
          label: 'Edit Profile',
          onPress: () => router.push('/(app)/profile'),
          icon: '👤',
        },
        {
          label: 'Change Password',
          onPress: () => router.push('/(app)/change-password'),
          icon: '🔒',
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          label: 'Notifications',
          onPress: () => router.push('/(app)/notifications'),
          icon: '🔔',
        },
        {
          label: 'Privacy',
          onPress: () => router.push('/(app)/privacy'),
          icon: '🔐',
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          label: 'Notification Settings',
          onPress: () => router.push('/(app)/notification-settings'),
          icon: '⚙️',
        },
        {
          label: 'Notification History',
          onPress: () => router.push('/(app)/notification-history'),
          icon: '🔔',
          badge: unreadCount,
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {settingsOptions.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={styles.option}
                onPress={item.onPress}
              >
                <View style={styles.optionLeft}>
                  <Text style={styles.optionIcon}>{item.icon}</Text>
                  <Text style={styles.optionLabel}>{item.label}</Text>
                </View>
                {item.badge > 0 && (
                  <NotificationBadge count={item.badge} size="small" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <TouchableOpacity 
          style={styles.signOutButton} 
          onPress={handleSignOut}
          disabled={isLoading}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  optionLabel: {
    fontSize: 16,
    color: '#000',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  signOutButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 