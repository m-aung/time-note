import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { haptics } from '../utils/haptics';

interface FABProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
  style?: ViewStyle;
}

export const FAB = ({ 
  icon, 
  onPress, 
  color = '#007AFF',
  style 
}: FABProps) => {
  const handlePress = async () => {
    await haptics.light();
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: color }, style]}
      onPress={handlePress}
    >
      <Ionicons name={icon} size={24} color="#fff" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
}); 