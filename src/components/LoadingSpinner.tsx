import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingSpinnerProps {
  color?: string;
  size?: number | 'small' | 'large';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  color = '#007AFF',
  size = 'large'
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 