import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Persona } from '../types/persona';

interface PersonaHeaderProps {
  persona: Persona;
  onEdit: () => void;
}

export const PersonaHeader = ({ persona, onEdit }: PersonaHeaderProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {persona.image_url ? (
          <Image 
            source={{ uri: persona.image_url }} 
            style={styles.image}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="person" size={32} color="#666" />
          </View>
        )}
        <View style={styles.details}>
          <Text style={styles.name}>{persona.name}</Text>
          <Text style={styles.stats}>
            {persona.active_passes_count || 0} active • {persona.total_passes_count || 0} total
          </Text>
        </View>
        <TouchableOpacity onPress={onEdit} style={styles.editButton}>
          <Ionicons name="pencil" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  imagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  stats: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  editButton: {
    padding: 8,
  },
}); 