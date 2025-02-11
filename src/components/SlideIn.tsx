import React, { useEffect } from 'react';
import { ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

type Direction = 'left' | 'right' | 'up' | 'down';

interface SlideInProps extends ViewProps {
  direction?: Direction;
  delay?: number;
  duration?: number;
  children: React.ReactNode;
}

export const SlideIn = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 300,
  style,
  ...props
}: SlideInProps) => {
  const translateX = useSharedValue(direction === 'left' ? -100 : direction === 'right' ? 100 : 0);
  const translateY = useSharedValue(direction === 'up' ? 100 : direction === 'down' ? -100 : 0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration }));
    translateX.value = withDelay(delay, withSpring(0));
    translateY.value = withDelay(delay, withSpring(0));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Animated.View style={[style, animatedStyle]} {...props}>
      {children}
    </Animated.View>
  );
}; 