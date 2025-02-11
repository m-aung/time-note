import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { haptics } from '../utils/haptics';

interface AnimatedFABProps {
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  style?: ViewStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const AnimatedFAB = ({ onPress, icon, label, style }: AnimatedFABProps) => {
  const scale = useSharedValue(1);
  const elevation = useSharedValue(5);

  const handlePressIn = async () => {
    'worklet';
    scale.value = withSpring(0.95, { damping: 15 });
    elevation.value = withSpring(2);
    await haptics.light();
  };

  const handlePressOut = () => {
    'worklet';
    scale.value = withSpring(1, { damping: 15 });
    elevation.value = withSpring(5);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: interpolate(elevation.value, [2, 5], [0.15, 0.25]),
  }));

  return (
    <AnimatedTouchable
      style={[styles.fab, style, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Ionicons name={icon} size={24} color="#FFF" />
      <Text style={styles.fabText}>{label}</Text>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#007AFF',
    borderRadius: 28,
    height: 56,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 