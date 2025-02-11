import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { useAuth } from '../store/authStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useBiometric } from '../store/biometricStore';
import { usePin } from '../store/pinStore';
import { PinInput } from '../components/PinInput';
import { useRouter } from 'expo-router';

export const PrivacyScreen = () => {
  const router = useRouter();
  const { user, isLoading, deleteAccount } = useAuth();
  const { isAvailable, isEnabled, toggleBiometric, isLoading: biometricLoading } = useBiometric();
  const { isEnabled: isPinEnabled, setupPin, changePin, disablePin, error: pinError } = usePin();
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showPinChange, setShowPinChange] = useState(false);
  const [showPinDisable, setShowPinDisable] = useState(false);

  useEffect(() => {
    useBiometric.getState().initializeBiometric();
  }, []);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              // Navigation will be handled by auth state change
            } catch (error) {
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
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
        <Text style={styles.title}>Privacy</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Privacy</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>

          <TouchableOpacity 
            style={styles.button}
            onPress={() => router.push('/(auth)/change-password')}
          >
            <Text style={styles.buttonText}>Change Password</Text>
          </TouchableOpacity>

          {isAvailable && (
            <View style={styles.option}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionLabel}>Biometric Authentication</Text>
                <Text style={styles.optionDescription}>
                  Use fingerprint or face recognition to secure your account
                </Text>
              </View>
              <Switch
                value={isEnabled}
                onValueChange={toggleBiometric}
                disabled={biometricLoading}
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PIN Security</Text>
          
          {!showPinSetup && !showPinChange && !showPinDisable ? (
            <>
              {!isPinEnabled ? (
                <TouchableOpacity 
                  style={styles.button}
                  onPress={() => setShowPinSetup(true)}
                >
                  <Text style={styles.buttonText}>Set up PIN</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity 
                    style={styles.button}
                    onPress={() => setShowPinChange(true)}
                  >
                    <Text style={styles.buttonText}>Change PIN</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.button, styles.dangerButton]}
                    onPress={() => setShowPinDisable(true)}
                  >
                    <Text style={[styles.buttonText, styles.dangerText]}>
                      Disable PIN
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          ) : showPinSetup ? (
            <PinInput
              mode="setup"
              onSubmit={async (pin) => {
                await setupPin(pin);
                setShowPinSetup(false);
              }}
              onCancel={() => setShowPinSetup(false)}
              error={pinError}
            />
          ) : showPinChange ? (
            <PinInput
              mode="change"
              onSubmit={async (pin) => {
                await changePin(pin, pin);
                setShowPinChange(false);
              }}
              onCancel={() => setShowPinChange(false)}
              error={pinError}
            />
          ) : (
            <PinInput
              mode="verify"
              onSubmit={async (pin) => {
                await disablePin(pin);
                setShowPinDisable(false);
              }}
              onCancel={() => setShowPinDisable(false)}
              error={pinError}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={() => Alert.alert('Coming Soon', 'This feature will be available soon.')}
          >
            <Text style={styles.buttonText}>Export My Data</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.dangerButton]}
            onPress={handleDeleteAccount}
          >
            <Text style={[styles.buttonText, styles.dangerText]}>
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => Alert.alert('Privacy Policy', 'Opens privacy policy in browser')}
          >
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => Alert.alert('Terms of Service', 'Opens terms of service in browser')}
          >
            <Text style={styles.linkText}>Terms of Service</Text>
          </TouchableOpacity>
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
  infoCard: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#000',
  },
  button: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    marginTop: 8,
    backgroundColor: '#FFF5F5',
  },
  dangerText: {
    color: '#ff4444',
  },
  linkButton: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 16,
    color: '#000',
  },
}); 