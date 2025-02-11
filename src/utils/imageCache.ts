import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Platform } from 'react-native';

const CACHE_FOLDER = `${FileSystem.cacheDirectory}persona-images/`;
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB

interface CacheMetadata {
  uri: string;
  timestamp: number;
  size: number;
}

export const ensureCacheDirectory = async () => {
  const dirInfo = await FileSystem.getInfoAsync(CACHE_FOLDER);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_FOLDER, { intermediates: true });
  }
};

const getCacheKey = (uri: string): string => {
  // Create a unique filename based on the URI
  const hash = uri.split('').reduce((hash, char) => {
    return ((hash << 5) - hash) + char.charCodeAt(0) | 0;
  }, 0);
  return `${Math.abs(hash)}.jpg`;
};

const getMetadataPath = (cacheKey: string): string => {
  return `${CACHE_FOLDER}${cacheKey}.meta`;
};

const cleanCache = async () => {
  try {
    const files = await FileSystem.readDirectoryAsync(CACHE_FOLDER);
    const now = Date.now();
    let totalSize = 0;

    // Get all metadata and calculate total size
    const metadataPromises = files
      .filter(file => file.endsWith('.meta'))
      .map(async file => {
        const path = `${CACHE_FOLDER}${file}`;
        const content = await FileSystem.readAsStringAsync(path);
        return { path, metadata: JSON.parse(content) as CacheMetadata };
      });

    const metadataResults = await Promise.all(metadataPromises);
    
    // Sort by timestamp (oldest first)
    metadataResults.sort((a, b) => a.metadata.timestamp - b.metadata.timestamp);

    // Remove expired or excess files
    for (const { path, metadata } of metadataResults) {
      const imagePath = path.replace('.meta', '');
      const isExpired = now - metadata.timestamp > MAX_CACHE_AGE;
      totalSize += metadata.size;

      if (isExpired || totalSize > MAX_CACHE_SIZE) {
        await Promise.all([
          FileSystem.deleteAsync(imagePath, { idempotent: true }),
          FileSystem.deleteAsync(path, { idempotent: true }),
        ]);
        totalSize -= metadata.size;
      }
    }
  } catch (error) {
    console.error('Error cleaning cache:', error);
  }
};

export const getCachedImage = async (uri: string): Promise<string | null> => {
  try {
    const cacheKey = getCacheKey(uri);
    const cachePath = `${CACHE_FOLDER}${cacheKey}`;
    const metadataPath = getMetadataPath(cacheKey);

    const [fileInfo, metadataInfo] = await Promise.all([
      FileSystem.getInfoAsync(cachePath),
      FileSystem.getInfoAsync(metadataPath),
    ]);

    if (!fileInfo.exists || !metadataInfo.exists) return null;

    const metadataStr = await FileSystem.readAsStringAsync(metadataPath);
    const metadata: CacheMetadata = JSON.parse(metadataStr);

    if (Date.now() - metadata.timestamp > MAX_CACHE_AGE) {
      await Promise.all([
        FileSystem.deleteAsync(cachePath, { idempotent: true }),
        FileSystem.deleteAsync(metadataPath, { idempotent: true }),
      ]);
      return null;
    }

    return cachePath;
  } catch (error) {
    console.error('Error getting cached image:', error);
    return null;
  }
};

export const cacheImage = async (uri: string): Promise<string> => {
  try {
    await ensureCacheDirectory();
    const cacheKey = getCacheKey(uri);
    const cachePath = `${CACHE_FOLDER}${cacheKey}`;
    const metadataPath = getMetadataPath(cacheKey);

    // Optimize and save image
    const result = await manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }],
      { compress: 0.8, format: SaveFormat.JPEG }
    );

    if (Platform.OS === 'web') {
      // Handle web platform differently if needed
      return result.uri;
    }

    await FileSystem.copyAsync({
      from: result.uri,
      to: cachePath,
    });

    const fileInfo = await FileSystem.getInfoAsync(cachePath);
    const metadata: CacheMetadata = {
      uri,
      timestamp: Date.now(),
      size: fileInfo.size || 0,
    };

    await FileSystem.writeAsStringAsync(
      metadataPath,
      JSON.stringify(metadata)
    );

    // Clean cache in background
    cleanCache().catch(console.error);

    return cachePath;
  } catch (error) {
    console.error('Error caching image:', error);
    throw error;
  }
};

export const clearImageCache = async () => {
  try {
    await FileSystem.deleteAsync(CACHE_FOLDER, { idempotent: true });
    await ensureCacheDirectory();
  } catch (error) {
    console.error('Error clearing image cache:', error);
    throw error;
  }
}; 