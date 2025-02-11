import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format, formatDistanceToNow } from 'date-fns';
import { TimePass } from '../types/timePass';
import { Ionicons } from '@expo/vector-icons';

interface TimePassDetailsProps {
  timePass: TimePass;
  onCancel: () => void;
  onClose: () => void;
}

export const TimePassDetails = ({ timePass, onCancel, onClose }: TimePassDetailsProps) => {
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

  const getCategoryIcon = () => {
    switch (timePass.category) {
      case 'entertainment':
        return '🎮';
      case 'education':
        return '📚';
      case 'exercise':
        return '🏃‍♂️';
      default:
        return '📝';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.title}>Time Pass Details</Text>
        <View style={styles.closeButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Label</Text>
          <View style={styles.labelContainer}>
            <Text style={styles.categoryIcon}>{getCategoryIcon()}</Text>
            <Text style={styles.value}>{timePass.label}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Status</Text>
          <Text style={[styles.status, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Duration</Text>
          <Text style={styles.value}>{timePass.duration} minutes</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Created</Text>
          <Text style={styles.value}>
            {format(new Date(timePass.createdAt), 'MMM d, h:mm a')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Expires</Text>
          <Text style={styles.value}>
            {format(new Date(timePass.expireAt), 'MMM d, h:mm a')}
            {' '}
            <Text style={styles.timeAgo}>
              ({formatDistanceToNow(new Date(timePass.expireAt), { addSuffix: true })})
            </Text>
          </Text>
        </View>

        {isActive && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
          >
            <Text style={styles.cancelText}>Cancel Time Pass</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
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
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  value: {
    fontSize: 16,
    color: '#000',
  },
  status: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeAgo: {
    color: '#666',
    fontSize: 14,
  },
  cancelButton: {
    backgroundColor: '#ff4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 