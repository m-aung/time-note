import { TimePassInput } from '@/types/timePass';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface TimePassFormProps {
  onSubmit: (data: { label: string; duration: number; category: TimePassInput['type'] }) => Promise<void>;
  isLoading: boolean;
  submitLabel: string;
}

export const TimePassForm = ({ onSubmit, isLoading, submitLabel }: TimePassFormProps) => {
  const [label, setLabel] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState<TimePassInput['type']>('other'); // Default category

  const handleSubmit = () => {
    const durationNumber = parseInt(duration, 10);
    if (!label.trim() || isNaN(durationNumber) || durationNumber <= 0) return;

    onSubmit({
      label: label.trim(),
      duration: durationNumber,
      category,
    });
  };

  const onEnterCategory = (text: string) => {
    setCategory(text as TimePassInput['type']);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Label</Text>
        <TextInput
          style={styles.input}
          value={label}
          onChangeText={setLabel}
          placeholder="Enter time pass label"
          editable={!isLoading}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Duration (minutes)</Text>
        <TextInput
          style={styles.input}
          value={duration}
          onChangeText={setDuration}
          placeholder="Enter duration in minutes"
          keyboardType="numeric"
          editable={!isLoading}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Category</Text>
        <TextInput
          style={styles.input}
          value={category}
          onChangeText={onEnterCategory}
          placeholder="Enter category"
          editable={!isLoading}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Creating...' : submitLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 