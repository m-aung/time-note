import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TimePass } from '../types/persona';
import { formatDistanceToNow } from 'date-fns';

interface TimePassListProps {
  activePasses: TimePass[];
  expiredPasses: TimePass[];
  onPassPress: (passId: string) => void;
}

export const TimePassList = ({ activePasses, expiredPasses, onPassPress }: TimePassListProps) => {
  const renderPass = (pass: TimePass) => (
    <TouchableOpacity
      key={pass.id}
      style={[styles.passItem, !pass.isActive && styles.expiredPass]}
      onPress={() => onPassPress(pass.id)}
    >
      <View style={styles.passContent}>
        <Text style={styles.passLabel}>{pass.label}</Text>
        <Text style={styles.passExpiry}>
          {pass.isActive 
            ? `Expires ${formatDistanceToNow(new Date(pass.expire_at), { addSuffix: true })}`
            : `Expired ${formatDistanceToNow(new Date(pass.expire_at), { addSuffix: true })}`
          }
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {activePasses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Passes</Text>
          {activePasses.map(renderPass)}
        </View>
      )}

      {expiredPasses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expired Passes</Text>
          {expiredPasses.map(renderPass)}
        </View>
      )}

      {activePasses.length === 0 && expiredPasses.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No time passes yet</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  passItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  expiredPass: {
    borderLeftColor: '#999',
    opacity: 0.8,
  },
  passContent: {
    flex: 1,
  },
  passLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  passExpiry: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 