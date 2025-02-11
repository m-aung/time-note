import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useNotifications } from '../store/notificationStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useRouter } from 'expo-router';

export const NotificationsScreen = () => {
  const router = useRouter();
  const { settings, isLoading, updateSettings, initializeSettings } = useNotifications();

  useEffect(() => {
    initializeSettings();
  }, []);

  const toggleSetting = (key: keyof typeof settings) => {
    updateSettings({ [key]: !settings[key] });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General</Text>
          
          <View style={styles.option}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionLabel}>Email Notifications</Text>
              <Text style={styles.optionDescription}>
                Receive notifications via email
              </Text>
            </View>
            <Switch
              value={settings.emailNotifications}
              onValueChange={() => toggleSetting('emailNotifications')}
            />
          </View>

          <View style={styles.option}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionLabel}>Push Notifications</Text>
              <Text style={styles.optionDescription}>
                Receive push notifications on your device
              </Text>
            </View>
            <Switch
              value={settings.pushNotifications}
              onValueChange={() => toggleSetting('pushNotifications')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alerts</Text>
          
          <View style={styles.option}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionLabel}>Security Alerts</Text>
              <Text style={styles.optionDescription}>
                Get notified about security-related events
              </Text>
            </View>
            <Switch
              value={settings.securityAlerts}
              onValueChange={() => toggleSetting('securityAlerts')}
            />
          </View>

          <View style={styles.option}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionLabel}>News & Updates</Text>
              <Text style={styles.optionDescription}>
                Receive news and feature updates
              </Text>
            </View>
            <Switch
              value={settings.newsUpdates}
              onValueChange={() => toggleSetting('newsUpdates')}
            />
          </View>
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    marginRight: 16,
  },
  backText: {
    fontSize: 24,
    color: '#007AFF',
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
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
  },
  optionInfo: {
    flex: 1,
    marginRight: 16,
  },
  optionLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
}); 