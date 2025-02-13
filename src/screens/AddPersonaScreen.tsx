import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { PersonaForm } from '../components/PersonaForm';
import { usePersona } from '../store/personaStore';
import { haptics } from '../utils/haptics';

export const AddPersonaScreen = () => {
  const router = useRouter();
  const { addPersona, isLoading } = usePersona();

  const handleSubmit = async (data: { name: string }) => {
    try {
      await haptics.light();
      await addPersona(data.name); // TODO: add image 
      await haptics.success();
      router.back();
    } catch (error) {
      console.error('Add persona error:', error);
      await haptics.error();
    }
  };

  return (
    <View style={styles.container}>
      <PersonaForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel="Create Persona"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
}); 