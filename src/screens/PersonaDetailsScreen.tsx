import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { usePersona } from '../store/personaStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Ionicons } from '@expo/vector-icons';
import { TimePassList } from '../components/TimePassList';
import { haptics } from '../utils/haptics';
import { useRouter, useLocalSearchParams } from 'expo-router';

export const PersonaDetailsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { personas, isLoading, error, fetchPersonas, deletePersona } = usePersona();
  const [refreshing, setRefreshing] = useState(false);

  if (!params.id) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Invalid persona ID</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const persona = personas.find(p => p.id === params.id);

  useEffect(() => {
    if (!persona) {
      fetchPersonas();
    }
  }, [params.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPersonas();
    setRefreshing(false);
  };

  const handleDelete = async () => {
    await haptics.warning();
    Alert.alert(
      'Delete Persona',
      'Are you sure you want to delete this persona? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await haptics.heavy();
            try {
              await deletePersona(params.id);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete persona');
            }
          },
        },
      ],
    );
  };

  if (isLoading && !persona) {
    return <LoadingSpinner />;
  }

  if (!persona) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error || 'Persona not found'}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchPersonas}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>{persona.name}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => router.push('/(app)/add-time-pass', { personaId: params.id })}
            style={styles.headerButton}
          >
            <Ionicons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            style={styles.headerButton}
          >
            <Ionicons name="trash-outline" size={24} color="#ff4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
      >
        <TimePassList
          activePasses={persona.activePasses}
          expiredPasses={persona.expiredPasses}
          onPassPress={(passId) => {
            // Handle time pass press
          }}
        />
      </ScrollView>
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
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 