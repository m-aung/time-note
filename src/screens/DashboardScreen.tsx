import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Text,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePersona } from '../store/personaStore';
import { useTimePass } from '../store/timePassStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PersonaCard } from '../components/PersonaCard';
import { TimePassCard } from '../components/TimePassCard';
import { Ionicons } from '@expo/vector-icons';
import { haptics } from '../utils/haptics';
import { PersonaList } from '../components/PersonaList';

export const DashboardScreen = () => {
  const router = useRouter();
  const { personas, isLoading: personasLoading, error: personasError, fetchPersonas } = usePersona();
  const { 
    timePasses, 
    isLoading: timePassesLoading, 
    error: timePassesError,
    fetchTimePasses,
    subscribeToChanges,
    unsubscribeFromChanges
  } = useTimePass();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPersonas();
    fetchTimePasses();
    const unsubscribe = subscribeToChanges();

    return () => {
      unsubscribe();
      unsubscribeFromChanges();
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchPersonas(),
      fetchTimePasses()
    ]);
    setRefreshing(false);
  };

  const handleAddTimePass = async (personaId: string) => {
    await haptics.light();
    router.push('/(app)/add-time-pass', { personaId });
  };

  const handlePersonaPress = (id: string) => {
    router.push({
      pathname: '/(app)/persona-details',
      params: { id }
    });
  };

  const renderTimePass = ({ item: timePass }) => (
    <TimePassCard
      timePass={timePass}
      onPress={() => handlePersonaPress(timePass.persona_id)}
    />
  );

  const renderPersonaSection = ({ item: persona }) => {
    const personaTimePasses = timePasses.filter(pass => pass.persona_id === persona.id);
    const activeTimePasses = personaTimePasses.filter(pass => pass.status === 'active');

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TouchableOpacity 
            style={styles.sectionTitleContainer}
            onPress={() => handlePersonaPress(persona.id)}
          >
            <Text style={styles.sectionTitle}>{persona.name}</Text>
            <Text style={styles.passCount}>
              {activeTimePasses.length} active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleAddTimePass(persona.id)}
            style={styles.addButton}
          >
            <Ionicons name="add-circle" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={activeTimePasses}
          renderItem={renderTimePass}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.passList}
          ListEmptyComponent={
            <View style={styles.emptyPassContainer}>
              <Text style={styles.emptyPassText}>No active time passes</Text>
              <TouchableOpacity 
                onPress={() => handleAddTimePass(persona.id)}
                style={styles.emptyAddButton}
              >
                <Text style={styles.emptyAddButtonText}>Add Time Pass</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </View>
    );
  };

  if ((personasLoading || timePassesLoading) && !refreshing) {
    return <LoadingSpinner />;
  }

  const error = personasError || timePassesError;

  return (
    <View style={styles.container}>
      <PersonaList
        personas={personas}
        onAddPersona={() => router.push('/(app)/add-persona')}
        onPersonaPress={handlePersonaPress}
        error={error}
        onRetry={handleRefresh}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 8,
  },
  list: {
    padding: 16,
  },
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
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  passCount: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    padding: 8,
  },
  passList: {
    paddingHorizontal: 16,
  },
  emptyPassContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    width: 200,
  },
  emptyPassText: {
    color: '#666',
    marginBottom: 8,
  },
  emptyAddButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyAddButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
}); 