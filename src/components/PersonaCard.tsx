import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Persona } from '../types/persona';
import { CountdownTimer } from './CountdownTimer';

interface PersonaCardProps {
  persona: Persona;
  onPress: (persona: Persona) => void;
}

export const PersonaCard: React.FC<PersonaCardProps> = ({ persona, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(persona)}
    >
      <View style={styles.header}>
        {persona.imageUrl ? (
          <Image 
            source={{ uri: persona.imageUrl }} 
            style={styles.avatar}
          />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {persona.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.name}>{persona.name}</Text>
      </View>

      <View style={styles.passesContainer}>
        {persona.activePasses.length > 0 ? (
          persona.activePasses.map(pass => (
            <View key={pass.id} style={styles.passItem}>
              <Text style={styles.passLabel}>{pass.label}</Text>
              <CountdownTimer 
                expireAt={pass.expireAt}
                style={styles.timer}
              />
            </View>
          ))
        ) : (
          <Text style={styles.noPassesText}>No active time passes</Text>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.statsText}>
          Active: {persona.activePasses.length} | 
          Expired: {persona.expiredPasses.length}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  passesContainer: {
    marginBottom: 12,
  },
  passItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  passLabel: {
    fontSize: 16,
    color: '#333',
  },
  timer: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  noPassesText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  statsText: {
    color: '#666',
    fontSize: 14,
  },
}); 