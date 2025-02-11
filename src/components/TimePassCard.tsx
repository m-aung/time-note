import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, isValid } from 'date-fns';
import { TimePass } from '../types/timePass';

interface TimePassCardProps {
  timePass: TimePass;
  onPress: () => void;
}

export const TimePassCard = ({ timePass, onPress }: TimePassCardProps) => {
  const expireDate = new Date(timePass.expireAt);
  const isExpired = isValid(expireDate) && expireDate < new Date();

  const formatExpireDate = () => {
    if (!isValid(expireDate)) {
      return 'Invalid date';
    }
    try {
      return format(expireDate, 'MMM d, h:mm a');
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, isExpired && styles.expired]} 
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={styles.label}>{timePass.label}</Text>
        <View style={[styles.status, isExpired && styles.expiredStatus]}>
          <Text style={styles.statusText}>
            {isExpired ? 'Expired' : 'Active'}
          </Text>
        </View>
      </View>

      <View style={styles.timeInfo}>
        <Ionicons name="time-outline" size={16} color="#666" />
        <Text style={styles.timeText}>
          Expires {formatExpireDate()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  expired: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  status: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  expiredStatus: {
    backgroundColor: '#FF3B30',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: '#666',
    marginLeft: 4,
    fontSize: 14,
  },
}); 