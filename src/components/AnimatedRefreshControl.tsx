import React from 'react';
import { StyleSheet, RefreshControl } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
  useAnimatedProps,
} from 'react-native-reanimated';

interface AnimatedRefreshControlProps {
  refreshing: boolean;
  onRefresh: () => void;
  scrollY: Animated.SharedValue<number>;
}

const AnimatedRefreshControl = Animated.createAnimatedComponent(RefreshControl);

export const CustomRefreshControl: React.FC<AnimatedRefreshControlProps> = ({
  refreshing,
  onRefresh,
  scrollY,
}) => {
  const animatedProps = useAnimatedProps(() => {
    const scale = interpolate(
      scrollY.value,
      [-100, 0],
      [1.2, 1],
      { extrapolateRight: 'clamp' }
    );

    return {
      transform: [{ scale }],
    };
  });

  return (
    <AnimatedRefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor="#007AFF"
      title="Pull to refresh"
      titleColor="#666"
      animatedProps={animatedProps}
      progressViewOffset={8}
    />
  );
}; 