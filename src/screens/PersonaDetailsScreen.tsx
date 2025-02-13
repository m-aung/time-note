import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { usePersona } from '../store/personaStore';
import { useTimePass } from '../store/timePassStore';
import { TimePassList } from '../components/TimePassList';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorView } from '../components/ErrorView';
import { FAB } from '../components/FAB';
import { haptics } from '../utils/haptics';

export const PersonaDetailsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { personas, isLoading: personaLoading } = usePersona();
  const { passes, isLoading: passesLoading, error, fetchPasses } = useTimePass();

  const persona = personas.find(p => p.id === id);
  const personaPasses = passes.filter(pass => pass.persona_id === id);

  const handleAddTimePass = async () => {
    await haptics.light();
    router.push(`/persona/${id}/add-time-pass`);
  };

  const handleEditPersona = async () => {
    await haptics.light();
    router.push(`/persona/${id}/edit`);
  };

  const handleTimePassPress = async (passId: string) => {
    await haptics.light();
    router.push(`/time-pass/${passId}`);
  };

  if (personaLoading || passesLoading) {
    return <LoadingSpinner />;
  }

  if (!persona) {
    return (
      <ErrorView
        error="Persona not found"
        onRetry={() => router.back()}
      />
    );
  }

  if (error) {
    return (
      <ErrorView
        error={error}
        onRetry={() => fetchPasses(id)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{persona.name}</Text>
          <Text style={styles.category}>{persona.type ?? persona.category}</Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{personaPasses.length}</Text>
            <Text style={styles.statLabel}>Time Passes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {personaPasses.filter(pass => pass.status === 'active').length}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {personaPasses.filter(pass => pass.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <TimePassList
          passes={personaPasses}
          onTimePassPress={handleTimePassPress}
          onAddPress={handleAddTimePass}
          showAddButton={personaPasses.length === 0}
        />
      </ScrollView>

      <View style={styles.fabContainer}>
        <FAB
          icon="pencil"
          onPress={handleEditPersona}
          color="#666"
          style={styles.editFab}
        />
        <FAB
          icon="add"
          onPress={handleAddTimePass}
          color="#007AFF"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    color: '#666',
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    gap: 16,
  },
  editFab: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
}); 