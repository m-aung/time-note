import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

interface LoadingOverlayProps {
  visible: boolean;
}

export const LoadingOverlay = ({ visible }: LoadingOverlayProps) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 