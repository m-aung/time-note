import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../store/authStore';
import { useRouter } from 'expo-router';

export const VerifyEmailScreen = () => {
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { checkEmailVerification, sendVerificationEmail } = useAuth();

  useEffect(() => {
    verifyEmail();
  }, []);

  const verifyEmail = async () => {
    try {
      setVerifying(true);
      const isVerified = await checkEmailVerification();
      if (isVerified) {
        router.replace('/(app)/dashboard');
      } else {
        setError('Email verification is pending. Please check your email and click the verification link.');
      }
    } catch (err) {
      setError('An error occurred during verification.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setVerifying(true);
      await sendVerificationEmail();
      setError('Verification email has been resent. Please check your inbox.');
    } catch (err) {
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Email Verification</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      <TouchableOpacity 
        style={styles.button}
        onPress={handleResendVerification}
      >
        <Text style={styles.buttonText}>Resend Verification Email</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.linkButton}
        onPress={() => router.replace('/(auth)/welcome')}
      >
        <Text style={styles.linkText}>Back to Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 16,
    padding: 8,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
}); 