import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface NotificationBadgeProps {
  count: number;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  count, 
  size = 'medium' 
}) => {
  if (count === 0) return null;

  return (
    <View style={[
      styles.badge,
      size === 'small' && styles.smallBadge,
    ]}>
      <Text style={[
        styles.text,
        size === 'small' && styles.smallText,
      ]}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#ff3b30',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  smallBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  smallText: {
    fontSize: 12,
  },
}); 