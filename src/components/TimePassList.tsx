import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TimePass } from '../types/timePass';
import { TimePassCard } from './TimePassCard';

interface TimePassListProps {
  activePasses: TimePass[];
  expiredPasses: TimePass[];
  onPassPress: (id: string) => void;
}

export const TimePassList = ({ 
  activePasses, 
  expiredPasses, 
  onPassPress 
}: TimePassListProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Passes</Text>
        {activePasses.length === 0 ? (
          <Text style={styles.emptyText}>No active time passes</Text>
        ) : (
          activePasses.map(pass => (
            <TimePassCard
              key={pass.id}
              timePass={pass}
              onPress={() => onPassPress(pass.id)}
            />
          ))
        )}
      </View>

      {expiredPasses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Past Passes</Text>
          {expiredPasses.map(pass => (
            <TimePassCard
              key={pass.id}
              timePass={pass}
              onPress={() => onPassPress(pass.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#000',
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 24,
  },
}); 