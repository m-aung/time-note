import AsyncStorage from '@react-native-async-storage/async-storage';

export const cache = {
  async set(key: string, value: any, expiresIn?: number) {
    const item = {
      value,
      timestamp: Date.now(),
      expiresIn,
    };
    try {
      await AsyncStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  async get<T>(key: string): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(key);
      if (!item) return null;

      const { value, timestamp, expiresIn } = JSON.parse(item);
      
      if (expiresIn && Date.now() - timestamp > expiresIn) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return value as T;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  async remove(key: string) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  },

  async clear() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  },
}; 