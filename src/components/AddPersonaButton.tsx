import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AddPersonaButtonProps {
  onPress: () => void;
}

export const AddPersonaButton = ({ onPress }: AddPersonaButtonProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
      <Text style={styles.text}>Add New Persona</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    gap: 8,
  },
  text: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 