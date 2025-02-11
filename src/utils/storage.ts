import { supabase } from '../services/supabase';
import { validateImage } from './validation';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { getCachedImage, cacheImage } from './imageCache';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const compressImage = async (uri: string): Promise<string> => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }], // Resize to max width of 1024px
      {
        compress: 0.8, // 80% quality
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );
    return result.uri;
  } catch (error) {
    console.error('Image compression error:', error);
    // Return original URI if compression fails
    return uri;
  }
};

export type ProgressCallback = (progress: number) => void;

export const uploadImage = async (
  uri: string,
  onProgress?: ProgressCallback
): Promise<string> => {
  if (!validateImage(uri)) {
    throw new Error('Invalid image format');
  }

  let retries = 0;
  let lastError: Error | null = null;

  while (retries < MAX_RETRIES) {
    try {
      // Check cache first
      const cachedUri = await getCachedImage(uri);
      const sourceUri = cachedUri || await compressImage(uri);
      
      // Cache the compressed image if not already cached
      if (!cachedUri) {
        await cacheImage(sourceUri);
      }

      const response = await fetch(sourceUri);
      const blob = await response.blob();

      if (blob.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }

      const filename = `persona-${Date.now()}-${retries}.jpg`;
      
      // Upload with progress tracking
      const { data, error } = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            onProgress(event.loaded / event.total);
          }
        };
        
        xhr.onload = async () => {
          if (xhr.status === 200) {
            const result = await supabase.storage
              .from('persona-images')
              .upload(filename, blob, {
                contentType: 'image/jpeg',
                cacheControl: '3600',
                upsert: false
              });
            resolve(result);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        };
        
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.open('POST', `${supabase.storage.url}/object/persona-images/${filename}`);
        xhr.send(blob);
      });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('persona-images')
        .getPublicUrl(filename);

      return publicUrl;
    } catch (error) {
      console.error(`Upload attempt ${retries + 1} failed:`, error);
      lastError = error instanceof Error ? error : new Error('Upload failed');
      retries++;
      
      if (retries < MAX_RETRIES) {
        await wait(RETRY_DELAY * retries);
        continue;
      }
      break;
    }
  }

  throw lastError || new Error('Failed to upload image after multiple attempts');
};

export const deleteImage = async (imageUrl: string) => {
  let retries = 0;
  let lastError: Error | null = null;

  while (retries < MAX_RETRIES) {
    try {
      const filename = imageUrl.split('/').pop();
      if (!filename) return;

      const { error } = await supabase.storage
        .from('persona-images')
        .remove([filename]);

      if (error) {
        throw error;
      }
      return;
    } catch (error) {
      console.error(`Delete attempt ${retries + 1} failed:`, error);
      lastError = error instanceof Error ? error : new Error('Delete failed');
      retries++;
      
      if (retries < MAX_RETRIES) {
        await wait(RETRY_DELAY * retries);
        continue;
      }
      break;
    }
  }

  throw lastError || new Error('Failed to delete image after multiple attempts');
};

export const updateImage = async (oldImageUrl: string | null, newImageUri: string): Promise<string> => {
  try {
    // Delete old image if it exists
    if (oldImageUrl) {
      await deleteImage(oldImageUrl).catch(error => {
        // Log but don't fail if old image deletion fails
        console.error('Failed to delete old image:', error);
      });
    }

    // Upload new image
    return await uploadImage(newImageUri);
  } catch (error) {
    console.error('Image update error:', error);
    throw new Error('Failed to update image');
  }
}; 