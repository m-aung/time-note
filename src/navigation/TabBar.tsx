import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { NotificationBadge } from '../components/NotificationBadge';
import { useNotificationHistory } from '../store/notificationHistoryStore';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { haptics } from '../utils/haptics';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const TabBar = ({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const { unreadCount } = useNotificationHistory();

  const handlePress = async (routeName: string, index: number) => {
    await haptics.light();
    navigation.navigate(routeName);
  };

  const TabButton = ({ 
    routeName, 
    icon, 
    label, 
    index 
  }: { 
    routeName: string;
    icon: string;
    label: string;
    index: number;
  }) => {
    const active = state.index === index;

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: withSpring(active ? 1.1 : 1) }],
    }));

    return (
      <AnimatedTouchable 
        onPress={() => handlePress(routeName, index)}
        style={[styles.tab, animatedStyle]}
      >
        <Ionicons 
          name={active ? icon : `${icon}-outline`}
          size={24} 
          color={active ? '#007AFF' : '#666'} 
        />
        <Text style={[styles.tabText, { color: active ? '#007AFF' : '#666' }]}>
          {label}
        </Text>
        {active && <View style={styles.activeIndicator} />}
        {routeName === 'Settings' && unreadCount > 0 && (
          <NotificationBadge
            count={unreadCount}
            size="small"
            style={styles.badge}
          />
        )}
      </AnimatedTouchable>
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 20 }]}>
      <TabButton routeName="Dashboard" icon="home" label="Dashboard" index={0} />
      <TabButton routeName="PersonaList" icon="people" label="Personas" index={1} />
      <TabButton routeName="Settings" icon="settings" label="Settings" index={2} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  tab: {
    alignItems: 'center',
    padding: 8,
    minWidth: 64,
    position: 'relative',
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#007AFF',
  },
}); 