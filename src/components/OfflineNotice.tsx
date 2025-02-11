import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetwork } from '../utils/network';

export const OfflineNotice = () => {
  const { isConnected } = useNetwork();
  const insets = useSafeAreaInsets();

  if (isConnected) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.text}>No Internet Connection</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FF3B30',
    padding: 8,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 