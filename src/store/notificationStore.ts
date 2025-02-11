import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  securityAlerts: boolean;
  newsUpdates: boolean;
}

interface NotificationStore {
  settings: NotificationSettings;
  isLoading: boolean;
  error: string | null;
  initializeSettings: () => Promise<void>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  securityAlerts: true,
  newsUpdates: false,
};

export const useNotifications = create<NotificationStore>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoading: false,
  error: null,

  initializeSettings: async () => {
    try {
      set({ isLoading: true });
      const storedSettings = await AsyncStorage.getItem('notificationSettings');
      if (storedSettings) {
        set({ settings: JSON.parse(storedSettings) });
      }
    } catch (error) {
      set({ error: 'Failed to load notification settings' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateSettings: async (newSettings: Partial<NotificationSettings>) => {
    try {
      set({ isLoading: true });
      const updatedSettings = {
        ...get().settings,
        ...newSettings,
      };
      await AsyncStorage.setItem(
        'notificationSettings',
        JSON.stringify(updatedSettings)
      );
      set({ settings: updatedSettings });
    } catch (error) {
      set({ error: 'Failed to update notification settings' });
    } finally {
      set({ isLoading: false });
    }
  },
})); 