import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface CustomRefreshControlProps {
  refreshing: boolean;
  progress: Animated.SharedValue<number>;
}

export const CustomRefreshControl = ({ refreshing, progress }: CustomRefreshControlProps) => {
  const spinnerStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      progress.value,
      [0, 1],
      [0, 360]
    );

    const scale = interpolate(
      progress.value,
      [0, 1],
      [0.8, 1]
    );

    return {
      transform: [
        { rotate: `${rotate}deg` },
        { scale: refreshing ? withSpring(1) : scale },
      ],
      opacity: interpolate(progress.value, [0, 0.5, 1], [0, 0.5, 1]),
    };
  });

  return (
    <Animated.View style={[styles.container, spinnerStyle]}>
      <Ionicons name="refresh" size={24} color="#007AFF" />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 