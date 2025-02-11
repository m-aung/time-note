import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PersonaCard } from './PersonaCard';
import { AddPersonaButton } from './AddPersonaButton';
import { Persona } from '../types/persona';

interface PersonaListProps {
  personas: Persona[];
  onPersonaPress: (id: string) => void;
  onAddPress: () => void;
  showAddButton?: boolean;
}

export const PersonaList = ({ 
  personas, 
  onPersonaPress, 
  onAddPress,
  showAddButton = true,
}: PersonaListProps) => {
  return (
    <View style={styles.container}>
      {personas.map(persona => (
        <PersonaCard
          key={persona.id}
          persona={persona}
          onPress={() => onPersonaPress(persona.id)}
        />
      ))}
      {showAddButton && personas.length === 0 && (
        <AddPersonaButton onPress={onAddPress} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
}); 