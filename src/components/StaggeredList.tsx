import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';

interface StaggeredListProps {
  index: number;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const StaggeredList = ({ index, children, style }: StaggeredListProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withDelay(
        index * 100,
        withSpring(1, { damping: 15 })
      ),
      transform: [
        {
          translateY: withDelay(
            index * 100,
            withSpring(0, { damping: 15 })
          ),
        },
        {
          scale: withDelay(
            index * 100,
            withSpring(1, { damping: 15 })
          ),
        },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        animatedStyle,
        { opacity: 0, transform: [{ translateY: 50 }, { scale: 0.8 }] },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
}); 