import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthForm } from '../components/AuthForm';
import { useAuth } from '../store/authStore';
import { AuthFormType } from '../types/auth';
import { useRouter } from 'expo-router';
import { validateEmail, validatePassword } from '../utils/validation';
import { debugSupabase } from '../utils/debugSupabase';
import { handleAuthError } from '../utils/errorHandling';

export const WelcomeScreen = () => {
  const [formType, setFormType] = useState<AuthFormType>('signin');
  const { signIn, signUp, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorText, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setError(null);
      
      // Add debug info
      await debugSupabase();
      
      // Validate inputs
      const emailError = validateEmail(email);
      const passwordError = validatePassword(password);
      
      if (emailError) {
        setError(emailError);
        return;
      }
      
      if (passwordError) {
        setError(passwordError);
        return;
      }

      // Trim and lowercase email
      const normalizedEmail = email.trim().toLowerCase();

      console.log('Submitting with:', {
        type: formType,
        email: normalizedEmail,
        passwordLength: password.length
      });

      if (formType === 'signin') {
        await signIn(normalizedEmail, password);
      } else {
        await signUp(normalizedEmail, password);
      }
    } catch (error) {
      console.error('Form submission error:', {
        error: error instanceof Error ? {
          message: error.message,
          name: error.name,
          stack: error.stack
        } : error
      });

      setError(handleAuthError(error));
    }
  };

  const toggleForm = () => {
    setFormType(current => current === 'signin' ? 'signup' : 'signin');
    setEmail('');
    setPassword('');
    setError(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>
        {formType === 'signin' ? 'Sign in to continue' : 'Create your account'}
      </Text>
      
      {errorText && (
        <Text style={styles.errorText}>{errorText}</Text>
      )}
      
      <AuthForm 
        type={formType}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        email={email}
        password={password}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
      />

      <TouchableOpacity onPress={toggleForm} style={styles.toggleButton}>
        <Text style={styles.toggleText}>
          {formType === 'signin' 
            ? "Don't have an account? Sign up" 
            : 'Already have an account? Sign in'}
        </Text>
      </TouchableOpacity>

      {formType === 'signin' && (
        <TouchableOpacity 
          onPress={() => router.push('/(auth)/forgot-password')}
          style={styles.forgotButton}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>
      )}
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
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  toggleButton: {
    marginTop: 16,
    padding: 8,
  },
  toggleText: {
    color: '#007AFF',
    fontSize: 14,
  },
  errorText: {
    color: '#ff4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  forgotButton: {
    marginTop: 8,
    padding: 8,
  },
  forgotText: {
    color: '#666',
    fontSize: 14,
  },
}); 