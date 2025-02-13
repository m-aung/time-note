import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TimePassForm } from '../components/TimePassForm';
import { useTimePass } from '../store/timePassStore';
import { haptics } from '../utils/haptics';
import { TimePassInput } from '@/types/timePass';

export const AddTimePassScreen = () => {
  const router = useRouter();
  const { id: personaId } = useLocalSearchParams<{ id: string }>();
  const { addTimePass, isLoading } = useTimePass();

  const handleSubmit = async (data: { label: string; duration: number; category: TimePassInput['type'] }) => {
    if (!personaId) {
      Alert.alert('Error', 'Persona ID is required');
      return;
    }

    try {
      await haptics.light();
      await addTimePass({
        ...data,
        persona_id: personaId,
        status: 'active',
        created_at: new Date().toISOString(),
        type: data.category || 'other',
        expire_at: new Date(data.duration).toISOString(),
      });
      await haptics.success();
      router.back();
    } catch (error) {
      console.error('Add time pass error:', error);
      await haptics.error();
    }
  };

  return (
    <View style={styles.container}>
      <TimePassForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel="Create Time Pass"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
}); 