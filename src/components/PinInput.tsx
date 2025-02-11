import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface PinInputProps {
  onSubmit: (pin: string) => void;
  onCancel?: () => void;
  error?: string | null;
  mode?: 'verify' | 'setup' | 'change';
}

export const PinInput: React.FC<PinInputProps> = ({
  onSubmit,
  onCancel,
  error,
  mode = 'verify',
}) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>(mode === 'setup' ? 'enter' : 'confirm');

  const handleSubmit = () => {
    if (mode === 'setup' && step === 'enter') {
      setStep('confirm');
      return;
    }

    if (mode === 'setup' && pin !== confirmPin) {
      setPin('');
      setConfirmPin('');
      setStep('enter');
      return;
    }

    onSubmit(pin);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>
          {mode === 'setup'
            ? step === 'enter'
              ? 'Enter New PIN'
              : 'Confirm PIN'
            : mode === 'verify'
            ? 'Enter PIN'
            : 'Change PIN'}
        </Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <TextInput
          style={styles.input}
          value={step === 'enter' ? pin : confirmPin}
          onChangeText={step === 'enter' ? setPin : setConfirmPin}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
          placeholder="Enter 6-digit PIN"
          autoFocus
        />

        <View style={styles.buttonContainer}>
          {onCancel && (
            <TouchableOpacity style={styles.button} onPress={onCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
          >
            <Text style={[styles.buttonText, styles.submitButtonText]}>
              {mode === 'setup' && step === 'enter' ? 'Next' : 'Submit'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  error: {
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 16,
    marginHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  submitButtonText: {
    color: '#fff',
  },
}); 