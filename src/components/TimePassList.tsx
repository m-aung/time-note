import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TimePass } from '../types/timePass';
import { format, isValid, parseISO } from 'date-fns';

interface TimePassListProps {
  passes: TimePass[];
  onTimePassPress: (id: string) => void;
  onAddPress: () => void;
  showAddButton: boolean;
}

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  const date = parseISO(dateString);
  return isValid(date) ? format(date, 'PPp') : 'Invalid date';
};

export const TimePassList = ({
  passes,
  onTimePassPress,
  onAddPress,
  showAddButton,
}: TimePassListProps) => {
  const getStatusEmoji = (status: string): string => {
    switch (status) {
      case 'active':
        return '▶️';
      case 'paused':
        return '⏸️';
      case 'completed':
        return '✅';
      case 'cancelled':
        return '❌';
      default:
        return '⚪️';
    }
  };

  const renderItem = ({ item }: { item: TimePass }) => {
    const startTime = formatDate(item.started_at);
    const endTime = formatDate(item.completed_at);
    const pauseTime = formatDate(item.paused_at);
    const expireTime = formatDate(item.expire_at);

    return (
      <TouchableOpacity
        style={styles.timePassItem}
        onPress={() => onTimePassPress(item.id)}
      >
        <View style={styles.timePassHeader}>
          <Text style={styles.timePassLabel}>{item.label}</Text>
          <Text style={styles.timePassType}>{item.type}</Text>
          <Text style={styles.timePassStatus}>
            {getStatusEmoji(item.status)}
          </Text>
        </View>

        <View style={styles.timePassDetails}>
          <Text style={styles.timePassDuration}>
            {item.duration} minutes
          </Text>
          <Text style={styles.timePassDate}>
            Started: {startTime}
          </Text>
          {item.status === 'completed' && <Text style={styles.timePassDate}>Completed: {endTime}</Text>}
          {item.status === 'paused' && <Text style={styles.timePassDate}>Paused: {pauseTime}</Text>}
          <Text style={styles.timePassDate}>Expires: {expireTime}</Text>
          <Text style={styles.timePassStatus}>Status: {item.status}</Text>
          {item.remaining_time !== undefined && (
            <Text style={styles.timePassDuration}>
              Remaining: {Math.max(0, Math.floor(item.remaining_time / 60))}m
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="time-outline" size={48} color="#666" />
      <Text style={styles.emptyText}>No time passes yet</Text>
      <Text style={styles.emptySubtext}>
        Add a time pass to start tracking time
      </Text>
      {showAddButton && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddPress}
        >
          <Text style={styles.addButtonText}>Add Time Pass</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <FlatList
      data={passes}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.container}
      ListEmptyComponent={renderEmptyState}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: 12,
  },
  timePassItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  timePassHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timePassLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  timePassType: {
    fontSize: 14,
    color: '#666',
  },
  timePassStatus: {
    fontSize: 16,
  },
  timePassDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timePassDuration: {
    fontSize: 14,
    color: '#666',
  },
  timePassDate: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 