import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTimePass } from '../store/timePassStore';
import { TimePassForm } from '../components/TimePassForm';
import { haptics } from '../utils/haptics';

export const AddTimePassScreen = () => {
  const router = useRouter();
  const { personaId } = useLocalSearchParams<{ personaId: string }>();
  const { addTimePass, isLoading, error } = useTimePass();

  const handleSubmit = async (data: {
    label: string;
    duration: number;
    category: string;
  }) => {
    try {
      await haptics.light();
      await addTimePass({
        ...data,
        personaId,
      });
      await haptics.success();
      router.back();
    } catch (error) {
      console.error('Add time pass error:', error);
      await haptics.error();
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add time pass');
    }
  };

  return (
    <View style={styles.container}>
      <TimePassForm
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isLoading={isLoading}
        error={error}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 