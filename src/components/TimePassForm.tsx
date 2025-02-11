import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';

interface TimePassFormProps {
  onSubmit: (data: {
    label: string;
    duration: number;
    category: string;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
}

const CATEGORIES = [
  { label: 'Entertainment', value: 'entertainment' },
  { label: 'Education', value: 'education' },
  { label: 'Exercise', value: 'exercise' },
  { label: 'Other', value: 'other' },
];

const DURATIONS = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
  { label: '4 hours', value: 240 },
];

export const TimePassForm = ({ 
  onSubmit, 
  onCancel, 
  isLoading, 
  error 
}: TimePassFormProps) => {
  const [label, setLabel] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [category, setCategory] = useState<string>('entertainment');

  const handleSubmit = async () => {
    await onSubmit({
      label,
      duration,
      category,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.title}>New Time Pass</Text>
        <TouchableOpacity 
          onPress={handleSubmit}
          disabled={isLoading || !label.trim()}
          style={[
            styles.headerButton,
            (!label.trim() || isLoading) && styles.headerButtonDisabled
          ]}
        >
          <Text style={[
            styles.submitText,
            (!label.trim() || isLoading) && styles.submitTextDisabled
          ]}>
            {isLoading ? 'Creating...' : 'Create'}
          </Text>
        </TouchableOpacity>
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Label</Text>
          <TextInput
            style={styles.input}
            value={label}
            onChangeText={setLabel}
            placeholder="What are you doing?"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category</Text>
          <RNPickerSelect
            onValueChange={value => setCategory(value)}
            items={CATEGORIES}
            value={category}
            style={pickerSelectStyles}
            disabled={isLoading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Duration</Text>
          <RNPickerSelect
            onValueChange={value => setDuration(value)}
            items={DURATIONS}
            value={duration}
            style={pickerSelectStyles}
            disabled={isLoading}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerButton: {
    padding: 8,
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  submitText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitTextDisabled: {
    color: '#999',
  },
  form: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  inputAndroid: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
}); 