import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { usePersona } from '../store/personaStore';
import { useTimePass } from '../store/timePassStore';
import { PersonaHeader } from '../components/PersonaHeader';
import { TimePassList } from '../components/TimePassList';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorView } from '../components/ErrorView';
import { FAB } from '../components/FAB';

export const PersonaDetailsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { personas, isLoading: personaLoading, error: personaError } = usePersona();
  const { passes, isLoading: passesLoading, error: passesError, fetchPasses } = useTimePass();

  const persona = personas.find(p => p.id === id);
  const personaPasses = passes.filter(p => p.personaId === id);
  const activePasses = personaPasses.filter(p => p.status === 'active');
  const expiredPasses = personaPasses.filter(p => p.status !== 'active');

  useEffect(() => {
    if (id) {
      fetchPasses(id);
    }
  }, [id]);

  if (personaLoading || passesLoading) {
    return <LoadingSpinner />;
  }

  if (personaError || passesError) {
    return (
      <ErrorView
        error={personaError || passesError}
        onRetry={() => fetchPasses(id)}
      />
    );
  }

  if (!persona) {
    return (
      <ErrorView
        error="Persona not found"
        onRetry={() => router.back()}
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={() => (
          <PersonaHeader
            persona={persona}
            onEdit={() => router.push(`/(app)/persona/${id}/edit`)}
          />
        )}
        data={[]}
        renderItem={null}
        ListEmptyComponent={() => (
          <TimePassList
            activePasses={activePasses}
            expiredPasses={expiredPasses}
            onPassPress={(passId) => router.push(`/(app)/time-pass/${passId}`)}
          />
        )}
      />
      <FAB
        icon="add"
        onPress={() => router.push(`/(app)/persona/${id}/add-time-pass`)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
}); 