import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSettings } from '../store/settingsStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export const NotificationSettingsScreen = () => {
  const router = useRouter();
  const { notifications, isLoading, loadSettings, updateNotificationSettings } = useSettings();

  useEffect(() => {
    loadSettings();
  }, []);

  const handleToggleEnabled = (value: boolean) => {
    updateNotificationSettings({ enabled: value });
  };

  const handleToggleSound = (value: boolean) => {
    updateNotificationSettings({ sound: value });
  };

  const handleToggleVibration = (value: boolean) => {
    updateNotificationSettings({ vibration: value });
  };

  const handleUpdateReminders = (minutes: number, enabled: boolean) => {
    const updatedReminders = enabled
      ? [...notifications.reminders, minutes].sort((a, b) => a - b)
      : notifications.reminders.filter(m => m !== minutes);
    updateNotificationSettings({ reminders: updatedReminders });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Enable Notifications</Text>
            <Switch
              value={notifications.enabled}
              onValueChange={handleToggleEnabled}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Sound</Text>
            <Switch
              value={notifications.sound}
              onValueChange={handleToggleSound}
              disabled={!notifications.enabled}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Vibration</Text>
            <Switch
              value={notifications.vibration}
              onValueChange={handleToggleVibration}
              disabled={!notifications.enabled}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminder Times</Text>
          {[5, 15, 30, 60].map(minutes => (
            <View key={minutes} style={styles.settingItem}>
              <Text style={styles.settingLabel}>{minutes} minutes before</Text>
              <Switch
                value={notifications.reminders.includes(minutes)}
                onValueChange={(enabled) => handleUpdateReminders(minutes, enabled)}
                disabled={!notifications.enabled}
              />
            </View>
          ))}
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
  },
}); 