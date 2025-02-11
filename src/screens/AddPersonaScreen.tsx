import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { PersonaForm } from '../components/PersonaForm';
import { usePersona } from '../store/personaStore';
import { haptics } from '../utils/haptics';

export const AddPersonaScreen = () => {
  const router = useRouter();
  const { addPersona, isLoading } = usePersona();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (name: string, imageUri?: string) => {
    try {
      setError(null);
      await addPersona({ name, imageUri });
      await haptics.success();
      router.back();
    } catch (error) {
      console.error('Add persona error:', error);
      setError(error instanceof Error ? error.message : 'Failed to add persona');
      await haptics.error();
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <PersonaForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
        error={error}
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