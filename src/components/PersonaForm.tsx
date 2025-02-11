import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
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
  initialData?: Persona;
  submitLabel?: string;
}

export const PersonaForm = ({ 
  onSubmit, 
  onCancel, 
  initialData,
  submitLabel = 'Create Persona'
}: PersonaFormProps) => {
  const [name, setName] = useState(initialData?.name || '');
  const [image, setImage] = useState<string | null>(initialData?.image_url || null);
  const [isLoading, setIsLoading] = useState(false);

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

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to make this work!',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const handleImagePick = async () => {
    try {
      await haptics.light();
      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
        await haptics.success();
      }
    } catch (error) {
      console.error('Error picking image:', error);
      await haptics.error();
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSubmit = async () => {
    try {
      await haptics.light();
      
      const error = validatePersona(name, image || undefined);
      if (error) {
        Alert.alert('Validation Error', error);
        return;
      }

      setIsLoading(true);
      await onSubmit(name, image || undefined);
      await haptics.success();
    } catch (error) {
      console.error('Form submit error:', error);
      await haptics.error();
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to submit form');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.imageButton}
        onPress={handleImagePick}
      >
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="camera" size={32} color="#666" />
            <Text style={styles.imageText}>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter persona name"
        autoCapitalize="words"
        maxLength={50}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <Animated.View style={animatedStyle}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              (!name.trim() || isLoading) && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={!name.trim() || isLoading}
          >
            {isLoading ? (
              <LoadingSpinner color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>{submitLabel}</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  imageButton: {
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
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    color: '#666',
    marginTop: 8,
    fontSize: 14,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#666',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
}); 