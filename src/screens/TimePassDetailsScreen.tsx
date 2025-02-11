import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { TimePassDetails } from '../components/TimePassDetails';
import { useTimePass } from '../store/timePassStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { haptics } from '../utils/haptics';

export const TimePassDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { passes, isLoading, updateTimePass } = useTimePass();

  if (!params.id) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Invalid time pass ID</Text>
      </View>
    );
  }

  const timePass = passes.find(p => p.id === params.id);

  const handleCancel = async () => {
    try {
      await haptics.warning();
      Alert.alert(
        'Cancel Time Pass',
        'Are you sure you want to cancel this time pass?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes',
            style: 'destructive',
            onPress: async () => {
              await haptics.heavy();
              await updateTimePass(params.id, { status: 'cancelled' });
              router.back();
            },
          },
        ],
      );
    } catch (error) {
      console.error('Cancel time pass error:', error);
      Alert.alert('Error', 'Failed to cancel time pass');
    }
  };

  if (isLoading || !timePass) {
    return <LoadingSpinner />;
  }

  return (
    <TimePassDetails
      timePass={timePass}
      onCancel={handleCancel}
      onClose={() => router.back()}
    />
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
  },
}); 