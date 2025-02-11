import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { PersonaForm } from '../components/PersonaForm';
import { usePersona } from '../store/personaStore';
import { haptics } from '../utils/haptics';

export const AddPersonaScreen = () => {
  const router = useRouter();
  const { addPersona, isLoading, error } = usePersona();

  const handleSubmit = async (name: string, imageUri?: string) => {
    try {
      await haptics.light();
      await addPersona({ name, image_url: imageUri });
      await haptics.success();
      router.back();
    } catch (error) {
      console.error('Add persona error:', error);
      await haptics.error();
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to add persona');
    }
  };

  return (
    <View style={styles.container}>
      <PersonaForm
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
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