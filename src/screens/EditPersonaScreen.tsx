import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PersonaForm } from '../components/PersonaForm';
import { usePersona } from '../store/personaStore';
import { useRouter } from 'expo-router';
import { haptics } from '../utils/haptics';
import { SharedImage } from '../components/SharedImage';

export const EditPersonaScreen = () => {
  const router = useRouter();
  const { id } = router.params as { id: string };
  const { personas, updatePersona } = usePersona();
  const persona = personas.find(p => p.id === id);

  const handleSubmit = async (name: string, imageUri?: string) => {
    try {
      await haptics.light();
      await updatePersona(id, {
        name,
        image_url: imageUri,
      });
      await haptics.success();
      router.back();
    } catch (error) {
      console.error('Update persona error:', error);
      await haptics.error();
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update persona'
      );
    }
  };

  if (!persona) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <SharedImage
        id={`persona.${persona.id}.image`}
        uri={persona.image_url}
        style={styles.headerImage}
        placeholder={
          <View style={[styles.headerImage, styles.headerImagePlaceholder]}>
            <Ionicons name="person" size={48} color="#666" />
          </View>
        }
      />

      <PersonaForm
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
        initialData={persona}
        submitLabel="Update Persona"
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginVertical: 24,
  },
  headerImagePlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 