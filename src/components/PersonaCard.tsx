import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Persona } from '../types/persona';
import { CountdownTimer } from './CountdownTimer';

interface PersonaCardProps {
  persona: Persona;
  onPress: () => void;
}

export const PersonaCard = ({ persona, onPress }: PersonaCardProps) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.content}>
        {persona.image_url ? (
          <Image 
            source={{ uri: persona.image_url }} 
            style={styles.image}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="person" size={24} color="#666" />
          </View>
        )}
        <View style={styles.details}>
          <Text style={styles.name}>{persona.name}</Text>
          <Text style={styles.stats}>
            {persona.active_passes_count || 0} active • {persona.total_passes_count || 0} total
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  imagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  stats: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
}); 