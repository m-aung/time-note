import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  SectionList,
  TextInput,
} from 'react-native';
import { NotificationHistoryItem, useNotificationHistory } from '../store/notificationHistoryStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow, format, isToday, isYesterday, isSameWeek, isSameYear } from 'date-fns';
import { SwipeableNotification } from '../components/SwipeableNotification';
import Animated, { 
  FadeIn, 
  FadeOut, 
  Layout,
  SlideInRight,
  SlideOutLeft,
  useSharedValue,
  withSpring,
  withTiming,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { CustomRefreshControl } from '../components/AnimatedRefreshControl';
import { haptics } from '../utils/haptics';
import { useRouter } from 'expo-router';
interface GroupedNotifications {
  title: string;
  data: NotificationHistoryItem[];
}

type FilterType = 'all' | 'unread' | 'read';

export const NotificationHistoryScreen = () => {
  const router = useRouter();
  const { 
    history, 
    isLoading, 
    error, 
    fetchHistory, 
    markAsRead, 
    markAllAsRead,
    clearHistory,
    deleteNotification,
  } = useNotificationHistory();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchBarHeight = useSharedValue(0);
  const filterMenuHeight = useSharedValue(0);
  const scrollY = useSharedValue(0);

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClearHistory = async () => {
    await haptics.warning();
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all notifications? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            await haptics.heavy();
            clearHistory();
          },
        },
      ],
    );
  };

  const groupNotifications = (notifications: NotificationHistoryItem[]): GroupedNotifications[] => {
    const groups: { [key: string]: NotificationHistoryItem[] } = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.createdAt);
      let groupTitle: string;

      if (isToday(date)) {
        groupTitle = 'Today';
      } else if (isYesterday(date)) {
        groupTitle = 'Yesterday';
      } else if (isSameWeek(date, new Date())) {
        groupTitle = format(date, 'EEEE'); // Day name
      } else if (isSameYear(date, new Date())) {
        groupTitle = format(date, 'MMMM d'); // Month and day
      } else {
        groupTitle = format(date, 'MMMM d, yyyy');
      }

      if (!groups[groupTitle]) {
        groups[groupTitle] = [];
      }
      groups[groupTitle].push(notification);
    });

    return Object.entries(groups).map(([title, data]) => ({
      title,
      data,
    }));
  };

  const filterNotifications = (notifications: NotificationHistoryItem[]) => {
    return notifications.filter(notification => {
      const matchesSearch = searchQuery === '' || 
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.body.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = filterType === 'all' ||
        (filterType === 'unread' && !notification.readAt) ||
        (filterType === 'read' && notification.readAt);

      return matchesSearch && matchesFilter;
    });
  };

  const renderNotification = ({ item }) => (
    <SwipeableNotification
      notification={item}
      onRead={markAsRead}
      onDelete={(id) => {
        Alert.alert(
          'Delete Notification',
          'Are you sure you want to delete this notification?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Delete', 
              style: 'destructive',
              onPress: () => deleteNotification(id),
            },
          ],
        );
      }}
    />
  );

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const FilterMenu = () => (
    <View style={styles.filterMenu}>
      <TouchableOpacity
        style={[styles.filterOption, filterType === 'all' && styles.filterOptionActive]}
        onPress={() => setFilterType('all')}
      >
        <Text style={[styles.filterText, filterType === 'all' && styles.filterTextActive]}>
          All
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterOption, filterType === 'unread' && styles.filterOptionActive]}
        onPress={() => setFilterType('unread')}
      >
        <Text style={[styles.filterText, filterType === 'unread' && styles.filterTextActive]}>
          Unread
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterOption, filterType === 'read' && styles.filterOptionActive]}
        onPress={() => setFilterType('read')}
      >
        <Text style={[styles.filterText, filterType === 'read' && styles.filterTextActive]}>
          Read
        </Text>
      </TouchableOpacity>
    </View>
  );

  const toggleSearchBar = async () => {
    await haptics.light();
    searchBarHeight.value = withSpring(
      showSearch ? 0 : 56,
      { damping: 15 }
    );
    setShowSearch(!showSearch);
  };

  const toggleFilterMenu = async () => {
    await haptics.light();
    filterMenuHeight.value = withSpring(
      showFilterMenu ? 0 : 48,
      { damping: 15 }
    );
    setShowFilterMenu(!showFilterMenu);
  };

  const searchBarStyle = useAnimatedStyle(() => ({
    height: searchBarHeight.value,
    opacity: interpolate(
      searchBarHeight.value,
      [0, 56],
      [0, 1]
    ),
  }));

  const filterMenuStyle = useAnimatedStyle(() => ({
    height: filterMenuHeight.value,
    opacity: interpolate(
      filterMenuHeight.value,
      [0, 48],
      [0, 1]
    ),
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={toggleSearchBar}
            style={styles.headerButton}
          >
            <Ionicons 
              name={showSearch ? "close" : "search"} 
              size={24} 
              color="#000" 
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleClearHistory}
            style={styles.headerButton}
          >
            <Ionicons name="trash-outline" size={24} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.View style={[styles.searchContainer, searchBarStyle]}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notifications..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={toggleFilterMenu}
        >
          <Ionicons 
            name="filter" 
            size={20} 
            color={filterType !== 'all' ? '#007AFF' : '#666'} 
          />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.filterMenu, filterMenuStyle]}>
        <FilterMenu />
      </Animated.View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <SectionList
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        sections={groupNotifications(filterNotifications(history))}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeIn.delay(index * 50).springify()}
            exiting={FadeOut.duration(200)}
            layout={Layout.springify()}
          >
            <SwipeableNotification
              notification={item}
              onRead={markAsRead}
              onDelete={(id) => {
                Alert.alert(
                  'Delete Notification',
                  'Are you sure you want to delete this notification?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                      text: 'Delete', 
                      style: 'destructive',
                      onPress: () => deleteNotification(id),
                    },
                  ],
                );
              }}
            />
          </Animated.View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Animated.View
            entering={SlideInRight}
            exiting={SlideOutLeft}
            layout={Layout.springify()}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
          </Animated.View>
        )}
        keyExtractor={item => item.id}
        refreshControl={
          <CustomRefreshControl
            refreshing={isLoading}
            onRefresh={fetchHistory}
            scrollY={scrollY}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No notifications yet
            </Text>
          </View>
        }
        ListHeaderComponent={
          history.length > 0 && !isLoading ? (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={markAllAsRead}
            >
              <Text style={styles.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
          ) : null
        }
        stickySectionHeadersEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
    width: 40,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  notificationItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadItem: {
    backgroundColor: '#f8f9ff',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  notificationTime: {
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
  errorText: {
    color: '#ff4444',
    padding: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  markAllButton: {
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginBottom: 16,
  },
  markAllText: {
    color: '#007AFF',
    fontSize: 16,
  },
  sectionHeader: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  searchContainer: {
    overflow: 'hidden',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 36,
    fontSize: 16,
  },
  filterButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  filterMenu: {
    overflow: 'hidden',
  },
  filterOption: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterOptionActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
}); 