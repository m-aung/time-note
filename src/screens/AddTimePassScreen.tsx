import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  Alert,
} from 'react-native';
import { RootStackScreenProps } from '../types/navigation';
import { useTimePass } from '../store/timePassStore';
import { usePersona } from '../store/personaStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { haptics } from '../utils/haptics';

export const AddTimePassScreen = ({ 
  navigation, 
  route 
}: RootStackScreenProps<'AddTimePass'>) => {
  const { personaId } = route.params;
  const { personas } = usePersona();
  const { addTimePass, isLoading } = useTimePass();
  
  const [label, setLabel] = useState('');
  const [expireDate, setExpireDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const persona = personas.find(p => p.id === personaId);

  const handleSubmit = async () => {
    if (!label.trim()) {
      Alert.alert('Error', 'Please enter a label for the time pass');
      return;
    }

    if (expireDate <= new Date()) {
      Alert.alert('Error', 'Expiration date must be in the future');
      return;
    }

    try {
      await haptics.light();
      await addTimePass({
        label: label.trim(),
        expire_at: expireDate.toISOString(),
        persona_id: personaId,
        status: 'active',
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to create time pass'
      );
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setExpireDate(selectedDate);
    }
  };

  if (!persona) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Persona not found</Text>
      </View>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView 
      style={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Time Pass</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>For {persona.name}</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Label</Text>
          <TextInput
            style={styles.input}
            value={label}
            onChangeText={setLabel}
            placeholder="Enter time pass label"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Expires At</Text>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {format(expireDate, 'PPp')}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={expireDate}
            mode="datetime"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Create Time Pass</Text>
        </TouchableOpacity>
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
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
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#000',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
  },
}); 