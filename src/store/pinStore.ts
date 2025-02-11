import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

interface PinState {
  isEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  lastAttempt: number;
  attemptCount: number;
}

interface PinStore extends PinState {
  setupPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  changePin: (currentPin: string, newPin: string) => Promise<void>;
  disablePin: (pin: string) => Promise<void>;
  initializePin: () => Promise<void>;
  resetAttempts: () => void;
}

const PIN_KEY = 'app_pin';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 300000; // 5 minutes in milliseconds

export const usePin = create<PinStore>((set, get) => ({
  isEnabled: false,
  isLoading: false,
  error: null,
  lastAttempt: 0,
  attemptCount: 0,

  initializePin: async () => {
    try {
      set({ isLoading: true });
      const hasPin = await SecureStore.getItemAsync(PIN_KEY);
      set({ isEnabled: !!hasPin });
    } catch (error) {
      set({ error: 'Failed to initialize PIN' });
    } finally {
      set({ isLoading: false });
    }
  },

  setupPin: async (pin: string) => {
    try {
      set({ isLoading: true, error: null });
      await SecureStore.setItemAsync(PIN_KEY, pin);
      set({ isEnabled: true });
    } catch (error) {
      set({ error: 'Failed to set up PIN' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  verifyPin: async (pin: string) => {
    try {
      const { lastAttempt, attemptCount } = get();
      const now = Date.now();

      // Check if user is locked out
      if (attemptCount >= MAX_ATTEMPTS && now - lastAttempt < LOCKOUT_DURATION) {
        const remainingTime = Math.ceil((LOCKOUT_DURATION - (now - lastAttempt)) / 1000);
        throw new Error(`Too many attempts. Try again in ${remainingTime} seconds`);
      }

      const storedPin = await SecureStore.getItemAsync(PIN_KEY);
      const isValid = storedPin === pin;

      if (!isValid) {
        set({
          attemptCount: attemptCount + 1,
          lastAttempt: now,
        });
        throw new Error(`Invalid PIN. ${MAX_ATTEMPTS - (attemptCount + 1)} attempts remaining`);
      }

      // Reset attempts on successful verification
      get().resetAttempts();
      return true;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Verification failed' });
      return false;
    }
  },

  changePin: async (currentPin: string, newPin: string) => {
    try {
      set({ isLoading: true, error: null });
      const isValid = await get().verifyPin(currentPin);
      if (!isValid) {
        throw new Error('Current PIN is incorrect');
      }
      await SecureStore.setItemAsync(PIN_KEY, newPin);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to change PIN' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  disablePin: async (pin: string) => {
    try {
      set({ isLoading: true, error: null });
      const isValid = await get().verifyPin(pin);
      if (!isValid) {
        throw new Error('Invalid PIN');
      }
      await SecureStore.deleteItemAsync(PIN_KEY);
      set({ isEnabled: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to disable PIN' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  resetAttempts: () => {
    set({
      attemptCount: 0,
      lastAttempt: 0,
      error: null,
    });
  },
})); 