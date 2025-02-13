import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { usePersona } from '../store/personaStore';
import { PersonaForm } from '../components/PersonaForm';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorView } from '../components/ErrorView';
import { haptics } from '../utils/haptics';

export const EditPersonaScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { personas, updatePersona, isLoading, error } = usePersona();

  const persona = personas.find(p => p.id === id);

  if (!persona) {
    return (
      <ErrorView
        error="Persona not found"
        onRetry={() => router.back()}
      />
    );
  }

  const handleSubmit = async ({name}:{name: string}, imageUri?: string) => {
    try {
      await haptics.light();
      await updatePersona(id, { 
        name, 
        image_url: imageUri 
      });
      await haptics.success();
      router.back();
    } catch (error) {
      console.error('Edit persona error:', error);
      await haptics.error();
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update persona');
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <PersonaForm
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        isLoading={isLoading}
        error={error}
        initialData={persona.name}
        submitLabel="Save"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 