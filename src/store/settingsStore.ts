import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationSettings {
  enabled: boolean;
  reminders: number[]; // minutes before expiration
  sound: boolean;
  vibration: boolean;
}

interface SettingsState {
  notifications: NotificationSettings;
  isLoading: boolean;
  error: string | null;
  loadSettings: () => Promise<void>;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  reminders: [5, 15, 30], // default reminder times
  sound: true,
  vibration: true,
};

export const useSettings = create<SettingsState>((set, get) => ({
  notifications: DEFAULT_SETTINGS,
  isLoading: false,
  error: null,

  loadSettings: async () => {
    try {
      set({ isLoading: true, error: null });
      const stored = await AsyncStorage.getItem('notification_settings');
      if (stored) {
        set({ notifications: JSON.parse(stored) });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to load settings' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateNotificationSettings: async (settings: Partial<NotificationSettings>) => {
    try {
      set({ isLoading: true, error: null });
      const current = get().notifications;
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem('notification_settings', JSON.stringify(updated));
      set({ notifications: updated });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update settings' });
    } finally {
      set({ isLoading: false });
    }
  },
})); 