import React from 'react';
import { StyleSheet, Animated as RNAnimated } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { haptics } from '../utils/haptics';

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete?: () => void;
}

const SWIPE_THRESHOLD = -75;

export const SwipeableRow = ({ children, onDelete }: SwipeableRowProps) => {
  const translateX = useSharedValue(0);
  const rowHeight = useSharedValue(64); // Default height
  const opacity = useSharedValue(1);

  const handleDelete = async () => {
    if (!onDelete) return;
    await haptics.light();
    rowHeight.value = withTiming(0);
    opacity.value = withTiming(0, {}, (finished) => {
      if (finished) {
        runOnJS(onDelete)();
      }
    });
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      const newTranslateX = context.startX + event.translationX;
      translateX.value = Math.min(0, newTranslateX);
    },
    onEnd: () => {
      if (translateX.value < SWIPE_THRESHOLD) {
        translateX.value = withSpring(-100);
        runOnJS(handleDelete)();
      } else {
        translateX.value = withSpring(0);
      }
    },
  });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    height: rowHeight.value,
    opacity: opacity.value,
  }));

  const deleteButtonStyle = useAnimatedStyle(() => {
    const opacity = Math.min(1, -translateX.value / SWIPE_THRESHOLD);
    return {
      opacity,
      transform: [{ scale: opacity }],
    };
  });

  return (
    <RNAnimated.View style={styles.container}>
      <Animated.View style={[styles.deleteButton, deleteButtonStyle]} />
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={rowStyle}>{children}</Animated.View>
      </PanGestureHandler>
    </RNAnimated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  deleteButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 75,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
}); 