import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthFormType } from '../types/auth';

interface AuthFormProps {
  type: AuthFormType;
  onSubmit: () => void;
  isLoading: boolean;
  email: string;
  password: string;
  onEmailChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  type,
  onSubmit,
  isLoading,
  email,
  password,
  onEmailChange,
  onPasswordChange,
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={onEmailChange}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={onPasswordChange}
        secureTextEntry
      />
      <TouchableOpacity 
        style={styles.button}
        onPress={onSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {type === 'signin' ? 'Sign In' : 'Sign Up'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 