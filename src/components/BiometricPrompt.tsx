import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useBiometric } from '../store/biometricStore';

interface BiometricPromptProps {
  isVisible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export const BiometricPrompt: React.FC<BiometricPromptProps> = ({
  isVisible,
  onSuccess,
  onCancel,
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { authenticateWithBiometric } = useBiometric();

  useEffect(() => {
    if (isVisible && !isAuthenticating) {
      handleAuthentication();
    }
  }, [isVisible]);

  const handleAuthentication = async () => {
    try {
      setIsAuthenticating(true);
      const success = await authenticateWithBiometric();
      if (success) {
        onSuccess();
      } else {
        onCancel();
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.container}>
        <View style={styles.prompt}>
          <Text style={styles.title}>Authentication Required</Text>
          <Text style={styles.message}>
            Please authenticate to continue
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleAuthentication}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  prompt: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    padding: 12,
    marginLeft: 8,
  },
  buttonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  cancelText: {
    color: '#ff4444',
  },
}); 