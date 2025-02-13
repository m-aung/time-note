import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTimePass } from '../store/timePassStore';
import { CountdownTimer } from '../components/CountdownTimer';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorView } from '../components/ErrorView';
import { getCategoryIcon } from '../utils/icons';
import { haptics } from '../utils/haptics';

export const TimePassDetailsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { 
    passes, 
    isLoading, 
    error,
    pauseTimePass,
    resumeTimePass,
    cancelTimePass
  } = useTimePass();

  const timePass = passes.find(p => p.id === id);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorView
        error={error}
        onRetry={() => router.back()}
      />
    );
  }

  if (!timePass) {
    return (
      <ErrorView
        error="Time pass not found"
        onRetry={() => router.back()}
      />
    );
  }

  const handlePause = async () => {
    try {
      await haptics.light();
      await pauseTimePass(id);
      await haptics.success();
    } catch (error) {
      console.error('Pause error:', error);
      await haptics.error();
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to pause time pass');
    }
  };

  const handleResume = async () => {
    try {
      await haptics.light();
      await resumeTimePass(id);
      await haptics.success();
    } catch (error) {
      console.error('Resume error:', error);
      await haptics.error();
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to resume time pass');
    }
  };

  const handleCancel = async () => {
    Alert.alert(
      'Cancel Time Pass',
      'Are you sure you want to cancel this time pass? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await haptics.light();
              await cancelTimePass(id);
              await haptics.success();
              router.back();
            } catch (error) {
              console.error('Cancel error:', error);
              await haptics.error();
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to cancel time pass');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.categoryIcon}>
          {getCategoryIcon(timePass.type)}
        </Text>
        <Text style={styles.label}>{timePass.label}</Text>
      </View>

      <View style={styles.timerContainer}>
        <CountdownTimer expireAt={timePass.expire_at} />
      </View>

      <View style={styles.details}>
        <Text style={styles.detailText}>
          Duration: {timePass.duration} minutes
        </Text>
        <Text style={styles.detailText}>
          Category: {timePass.type}
        </Text>
      </View>

      <View style={styles.actions}>
        {timePass.status === 'active' ? (
          <View>
          <TouchableOpacity 
            style={[styles.button, styles.pauseButton]} 
            onPress={handlePause}
          >
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
          </View>
        ) : timePass.status === 'paused' ? (
          <View>
          <TouchableOpacity 
            style={[styles.button, styles.resumeButton]} 
            onPress={handleResume}
          >
            <Text style={styles.buttonText}>Resume</Text>
          </TouchableOpacity>
          </View>
        ) : null}

        {(timePass.status === 'active' || timePass.status === 'paused') && (
          <View>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={handleCancel}
          >
            <Text style={[styles.buttonText, styles.cancelButtonText]}>
              Cancel
            </Text>
          </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  categoryIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  label: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  details: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
  },
  detailText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  actions: {
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#007AFF',
  },
  resumeButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#ff4444',
  },
}); 