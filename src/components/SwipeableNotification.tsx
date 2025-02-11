import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { formatDistanceToNow } from 'date-fns';
import { NotificationHistoryItem } from '../store/notificationHistoryStore';
import { haptics } from '../utils/haptics';

interface SwipeableNotificationProps {
  notification: NotificationHistoryItem;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export const SwipeableNotification = ({ 
  notification, 
  onRead, 
  onDelete 
}: SwipeableNotificationProps) => {
  const swipeableRef = useRef<Swipeable>(null);

  const handleRead = async () => {
    await haptics.light();
    swipeableRef.current?.close();
    onRead(notification.id);
  };

  const handleDelete = async () => {
    await haptics.medium();
    swipeableRef.current?.close();
    onDelete(notification.id);
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.rightActions}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <RectButton
            style={[styles.rightAction, styles.deleteAction]}
            onPress={handleDelete}
          >
            <Text style={styles.actionText}>Delete</Text>
          </RectButton>
        </Animated.View>
      </View>
    );
  };

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.leftActions}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <RectButton
            style={[styles.leftAction, styles.readAction]}
            onPress={handleRead}
          >
            <Text style={styles.actionText}>
              {notification.readAt ? 'Unread' : 'Read'}
            </Text>
          </RectButton>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      leftThreshold={80}
      rightThreshold={80}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      onSwipeableOpen={async () => {
        await haptics.light();
      }}
    >
      <View style={[
        styles.container,
        !notification.readAt && styles.unreadContainer
      ]}>
        <View style={styles.content}>
          <Text style={styles.title}>{notification.title}</Text>
          <Text style={styles.body}>{notification.body}</Text>
          <Text style={styles.time}>
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </Text>
        </View>
        {!notification.readAt && (
          <View style={styles.unreadDot} />
        )}
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  unreadContainer: {
    backgroundColor: '#f8f9ff',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  rightActions: {
    width: 80,
    flexDirection: 'row',
  },
  leftActions: {
    width: 80,
    flexDirection: 'row',
  },
  rightAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteAction: {
    backgroundColor: '#ff4444',
  },
  readAction: {
    backgroundColor: '#007AFF',
  },
  actionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
}); 