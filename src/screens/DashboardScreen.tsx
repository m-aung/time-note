import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { usePersona } from '../store/personaStore';
import { useTimePass } from '../store/timePassStore';
import { PersonaList } from '../components/PersonaList';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorView } from '../components/ErrorView';

export const DashboardScreen = () => {
  const router = useRouter();
  const { personas, isLoading: personasLoading, error: personasError, fetchPersonas } = usePersona();
  const { isLoading: passesLoading, error: passesError, fetchPasses } = useTimePass();
  const [refreshing, setRefreshing] = React.useState(false);

  const loadData = useCallback(async () => {
    try {
      await fetchPersonas();
    } catch (error) {
      console.error('Dashboard load error:', error);
    }
  }, [fetchPersonas]);

  // Initial data load
  useEffect(() => {
    loadData();
  }, []);

  // Load passes after personas are loaded
  useEffect(() => {
    const loadPasses = async () => {
      if (personas.length > 0) {
        try {
          await Promise.all(personas.map(persona => fetchPasses(persona.id)));
        } catch (error) {
          console.error('Load passes error:', error);
        }
      }
    };
    loadPasses();
  }, [personas]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Only show loading on initial load
  if ((personasLoading || passesLoading) && !refreshing && personas.length === 0) {
    return <LoadingSpinner />;
  }

  if (personasError || passesError) {
    return (
      <ErrorView
        error={personasError || passesError}
        onRetry={loadData}
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={personas}
        renderItem={({ item: persona }) => (
          <PersonaList
            personas={[persona]}
            onPersonaPress={(id) => router.push(`/(app)/persona/${id}`)}
            onAddPress={() => router.push('/(app)/add-persona')}
            showAddButton={personas.length === 0}
          />
        )}
        keyExtractor={item => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.list}
        ListEmptyComponent={() => (
          <PersonaList
            personas={[]}
            onPersonaPress={() => {}}
            onAddPress={() => router.push('/(app)/add-persona')}
            showAddButton={true}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
}); 