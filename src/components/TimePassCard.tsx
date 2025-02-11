import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TimePass } from '../types/timePass';
import { CountdownTimer } from './CountdownTimer';
import { getCategoryIcon } from '../utils/icons';

interface TimePassCardProps {
  timePass: TimePass;
  onPress: () => void;
}

export const TimePassCard = ({ timePass, onPress }: TimePassCardProps) => {
  const isActive = timePass.status === 'active';
  const isExpired = new Date(timePass.expireAt) < new Date();
  const isCancelled = timePass.status === 'cancelled';

  const getStatusColor = () => {
    if (isCancelled) return '#ff4444';
    if (isExpired) return '#666';
    return '#4CAF50';
  };

  const getStatusText = () => {
    if (isCancelled) return 'Cancelled';
    if (isExpired) return 'Expired';
    return 'Active';
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container,
        !isActive && styles.inactiveContainer
      ]} 
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          <Text style={styles.categoryIcon}>
            {getCategoryIcon(timePass.category)}
          </Text>
          <Text style={styles.label}>{timePass.label}</Text>
        </View>
        <Text style={[styles.status, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>

      {isActive && (
        <View style={styles.timerContainer}>
          <CountdownTimer expireAt={timePass.expireAt} />
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.duration}>
          {timePass.duration} minutes
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inactiveContainer: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    flex: 1,
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  footer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duration: {
    color: '#666',
    fontSize: 14,
  },
}); 