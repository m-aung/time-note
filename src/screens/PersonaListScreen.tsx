import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePersona } from '../store/personaStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { haptics } from '../utils/haptics';
import { Persona } from '../types/persona';
import { RootStackScreenProps } from '../types/navigation';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { SharedImage } from '../components/SharedImage';
import { FadeIn } from '../components/FadeIn';
import { SlideIn } from '../components/SlideIn';
import { SwipeableRow } from '../components/SwipeableRow';
import { AnimatedFAB } from '../components/AnimatedFAB';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { CustomRefreshControl } from '../components/CustomRefreshControl';
import { StaggeredList } from '../components/StaggeredList';
import { useRouter } from 'expo-router';
import { PersonaCard } from '../components/PersonaCard';
import { AddPersonaButton } from '../components/AddPersonaButton';
import { ErrorView } from '../components/ErrorView';

export const PersonaListScreen = () => {
  const router = useRouter();
  const { personas, isLoading, error, fetchPersonas, deletePersona } = usePersona();
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useSharedValue(0);
  const fabVisible = useSharedValue(1);
  const refreshProgress = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const delta = event.contentOffset.y - scrollY.value;
      scrollY.value = event.contentOffset.y;
      
      if (delta > 0) {
        fabVisible.value = withSpring(0);
      } else {
        fabVisible.value = withSpring(1);
      }
    },
  });

  const fabStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: fabVisible.value },
      { translateY: interpolate(fabVisible.value, [0, 1], [100, 0]) },
    ],
    opacity: fabVisible.value,
  }));

  useEffect(() => {
    fetchPersonas();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPersonas();
    setRefreshing(false);
  };

  const handleAdd = () => {
    router.push('/add-persona');
  };

  const handleEdit = (persona: Persona) => {
    router.push(`/persona/${persona.id}`);
  };

  const handleDelete = async (persona: Persona) => {
    try {
      await haptics.light();
      Alert.alert(
        'Delete Persona',
        `Are you sure you want to delete "${persona.name}"? This will also delete all associated time passes.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deletePersona(persona.id);
                await haptics.success();
              } catch (error) {
                console.error('Delete persona error:', error);
                await haptics.error();
                Alert.alert('Error', 'Failed to delete persona');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Handle delete error:', error);
      await haptics.error();
      Alert.alert('Error', 'Failed to process delete request');
    }
  };

  const renderItem = ({ item: persona, index }: { item: Persona; index: number }) => (
    <StaggeredList index={index}>
      <SwipeableRow onDelete={() => handleDelete(persona)}>
        <View style={styles.personaItem}>
          <TouchableOpacity
            style={styles.personaContent}
            onPress={() => handleEdit(persona)}
          >
            <SharedImage
              id={`persona.${persona.id}.image`}
              uri={persona.image_url}
              style={styles.personaImage}
              placeholder={
                <View style={[styles.personaImage, styles.personaImagePlaceholder]}>
                  <Ionicons name="person" size={24} color="#666" />
                </View>
              }
            />
            <View style={styles.personaInfo}>
              <Text style={styles.personaName}>{persona.name}</Text>
              <Text style={styles.personaStats}>
                {persona.activePasses.length} active • {persona.expiredPasses.length} expired
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </SwipeableRow>
    </StaggeredList>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorView
        error={error}
        onRetry={fetchPersonas}
      />
    );
  }

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={isLoading && !refreshing} />
      <FadeIn>
        <View style={styles.header}>
          <Text style={styles.title}>Personas</Text>
        </View>
      </FadeIn>

      <FlatList
        data={personas}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <PersonaCard
            persona={item}
            onPress={() => router.push(`/persona/${item.id}`)}
          />
        )}
        contentContainerStyle={styles.list}
        ListFooterComponent={() => (
          <AddPersonaButton
            onPress={() => router.push('/add-persona')}
          />
        )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  personaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
  },
  personaContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  personaImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  personaImagePlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  personaInfo: {
    marginLeft: 12,
    flex: 1,
  },
  personaName: {
    fontSize: 16,
    fontWeight: '600',
  },
  personaStats: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
}); 