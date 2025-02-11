import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorViewProps {
  error: string | null;
  onRetry: () => void;
}

export const ErrorView = ({ error, onRetry }: ErrorViewProps) => {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={48} color="#ff4444" />
      <Text style={styles.errorText}>{error || 'Something went wrong'}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  errorText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 