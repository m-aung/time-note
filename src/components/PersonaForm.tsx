import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from './LoadingSpinner';
import { validatePersona } from '../utils/validation';
import { haptics } from '../utils/haptics';
import { Persona } from '../types/persona';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface PersonaFormProps {
  onSubmit: (name: string, imageUri?: string) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  error: string | null;
  initialData?: {
    name: string;
    image_url?: string;
  };
  submitLabel?: string;
}

export const PersonaForm = ({ 
  onSubmit, 
  onCancel, 
  isLoading, 
  error,
  initialData,
  submitLabel = 'Create',
}: PersonaFormProps) => {
  const [name, setName] = useState(initialData?.name ?? '');
  const [imageUri, setImageUri] = useState<string | undefined>(initialData?.image_url);

  // Add scale animation for buttons
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleImagePick = async () => {
    try {
      await haptics.light();
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant access to your photo library to add an image.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        await haptics.success();
      }
    } catch (error) {
      console.error('Image picker error:', error);
      await haptics.error();
    }
  };

  const handleSubmit = async () => {
    const validationError = validatePersona(name, imageUri);
    if (validationError) {
      Alert.alert('Error', validationError);
      return;
    }
    await onSubmit(name, imageUri);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {initialData ? 'Edit Persona' : 'New Persona'}
        </Text>
        <TouchableOpacity 
          onPress={handleSubmit}
          disabled={isLoading || !name.trim()}
          style={[
            styles.headerButton,
            (!name.trim() || isLoading) && styles.headerButtonDisabled
          ]}
        >
          <Text style={[
            styles.submitText,
            (!name.trim() || isLoading) && styles.submitTextDisabled
          ]}>
            {isLoading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      <View style={styles.form}>
        <TouchableOpacity 
          style={styles.imageContainer}
          onPress={handleImagePick}
        >
          {imageUri ? (
            <Image 
              source={{ uri: imageUri }} 
              style={styles.image}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera" size={32} color="#666" />
              <Text style={styles.imagePlaceholderText}>
                Add Photo
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter persona name"
            autoCapitalize="words"
            editable={!isLoading}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerButton: {
    padding: 8,
  },
  headerButtonDisabled: {
    opacity: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  submitText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  submitTextDisabled: {
    color: '#999',
  },
  form: {
    padding: 16,
  },
  imageContainer: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
}); 