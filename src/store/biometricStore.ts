import { create } from 'zustand';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface BiometricState {
  isEnabled: boolean;
  isAvailable: boolean;
  isLoading: boolean;
  error: string | null;
  lastAuthTime: number | null;
}

interface BiometricStore extends BiometricState {
  checkBiometricAvailability: () => Promise<void>;
  toggleBiometric: () => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
  initializeBiometric: () => Promise<void>;
  updateLastAuthTime: (time: number) => void;
}

export const useBiometric = create<BiometricStore>((set, get) => ({
  isEnabled: false,
  isAvailable: false,
  isLoading: false,
  error: null,
  lastAuthTime: null,

  initializeBiometric: async () => {
    try {
      set({ isLoading: true });
      const storedValue = await AsyncStorage.getItem('biometricEnabled');
      const lastAuthTime = await AsyncStorage.getItem('lastAuthTime');
      
      set({ 
        isEnabled: storedValue === 'true',
        lastAuthTime: lastAuthTime ? parseInt(lastAuthTime) : null,
      });
      
      await get().checkBiometricAvailability();
    } catch (error) {
      set({ error: 'Failed to initialize biometric settings' });
    } finally {
      set({ isLoading: false });
    }
  },

  checkBiometricAvailability: async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      set({ isAvailable: hasHardware && isEnrolled });
    } catch (error) {
      set({ isAvailable: false });
    }
  },

  toggleBiometric: async () => {
    try {
      set({ isLoading: true });
      const newState = !get().isEnabled;
      
      if (newState) {
        const success = await get().authenticateWithBiometric();
        if (!success) {
          throw new Error('Biometric authentication failed');
        }
      }

      await AsyncStorage.setItem('biometricEnabled', String(newState));
      set({ isEnabled: newState });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to toggle biometric' });
    } finally {
      set({ isLoading: false });
    }
  },

  authenticateWithBiometric: async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to continue',
        fallbackLabel: 'Use passcode',
      });

      if (result.success) {
        const currentTime = Date.now();
        get().updateLastAuthTime(currentTime);
      }

      return result.success;
    } catch (error) {
      set({ error: 'Authentication failed' });
      return false;
    }
  },

  updateLastAuthTime: async (time: number) => {
    try {
      await AsyncStorage.setItem('lastAuthTime', time.toString());
      set({ lastAuthTime: time });
    } catch (error) {
      console.error('Failed to update last auth time:', error);
    }
  },
})); 