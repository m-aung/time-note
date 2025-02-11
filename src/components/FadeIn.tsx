import React, { useEffect } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

interface FadeInProps extends ViewProps {
  delay?: number;
  duration?: number;
  children: React.ReactNode;
}

export const FadeIn = ({ 
  children, 
  delay = 0, 
  duration = 300, 
  style, 
  ...props 
}: FadeInProps) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[style, animatedStyle]} {...props}>
      {children}
    </Animated.View>
  );
}; 