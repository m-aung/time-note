import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePersona } from '../store/personaStore';
import { PersonaList } from '../components/PersonaList';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorView } from '../components/ErrorView';
import { FAB } from '../components/FAB';
import { haptics } from '../utils/haptics';

export const DashboardScreen = () => {
  const router = useRouter();
  const { personas, isLoading, error, fetchPersonas } = usePersona();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPersonas();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPersonas();
    setRefreshing(false);
  };

  const handleAddPersona = async () => {
    await haptics.light();
    router.push('/add-persona');
  };

  const handlePersonaPress = async (id: string) => {
    await haptics.light();
    router.push(`/persona/${id}`);
  };

  if (isLoading && !refreshing) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorView
        error={error}
        onRetry={fetchPersonas}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        <PersonaList
          personas={personas}
          onPersonaPress={handlePersonaPress}
          onAddPress={handleAddPersona}
          showAddButton={personas.length === 0}
        />
      </ScrollView>

      {personas.length > 0 && (
        <FAB
          icon="add"
          onPress={handleAddPersona}
          color="#007AFF"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flexGrow: 1,
    padding: 16,
  },
}); 