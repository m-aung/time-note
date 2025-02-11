import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, AppState, AppStateStatus } from 'react-native';
import { useBiometric } from '../store/biometricStore';
import { usePin } from '../store/pinStore';
import { BiometricPrompt } from './BiometricPrompt';
import { PinInput } from './PinInput';
import { LoadingSpinner } from './LoadingSpinner';

export const AppLock = ({ children }: { children: React.ReactNode }) => {
  const [isLocked, setIsLocked] = useState(true);
  const [showBiometric, setShowBiometric] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const { isEnabled: isBiometricEnabled, isLoading: biometricLoading, initializeBiometric } = useBiometric();
  const { isEnabled: isPinEnabled, isLoading: pinLoading, verifyPin, initializePin } = usePin();
  const appState = useRef(AppState.currentState);
  const backgroundTimeRef = useRef<number>(0);
  const LOCK_TIMEOUT = 5000; // Lock after 5 seconds in background

  useEffect(() => {
    initializeBiometric();
    initializePin();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [isBiometricEnabled, isPinEnabled]);

  useEffect(() => {
    if (isLocked) {
      if (isBiometricEnabled) {
        setShowBiometric(true);
      } else if (isPinEnabled) {
        setShowPin(true);
      } else {
        setIsLocked(false);
      }
    }
  }, [isLocked, isBiometricEnabled, isPinEnabled]);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (!isBiometricEnabled && !isPinEnabled) return;

    if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
      backgroundTimeRef.current = Date.now();
    } else if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      const backgroundTime = Date.now() - backgroundTimeRef.current;
      if (backgroundTime > LOCK_TIMEOUT) {
        setIsLocked(true);
      }
    }

    appState.current = nextAppState;
  };

  const handleBiometricSuccess = () => {
    setIsLocked(false);
    setShowBiometric(false);
  };

  const handleBiometricCancel = () => {
    setShowBiometric(false);
    if (isPinEnabled) {
      setShowPin(true);
    }
  };

  const handlePinSubmit = async (pin: string) => {
    const isValid = await verifyPin(pin);
    if (isValid) {
      setIsLocked(false);
      setShowPin(false);
    }
  };

  if (biometricLoading || pinLoading) {
    return <LoadingSpinner />;
  }

  if (isLocked) {
    return (
      <View style={styles.container}>
        {showBiometric && (
          <BiometricPrompt
            isVisible={showBiometric}
            onSuccess={handleBiometricSuccess}
            onCancel={handleBiometricCancel}
          />
        )}
        {showPin && (
          <PinInput
            onSubmit={handlePinSubmit}
            mode="verify"
          />
        )}
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
}); 