import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { haptics } from '../utils/haptics';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = async () => {
    await haptics.light();
    this.setState({ hasError: false, error: null });
  };

  handleSupport = async () => {
    await haptics.light();
    await Linking.openURL('mailto:support@yourapp.com');
  };

  isEnvironmentError = (error: Error): boolean => {
    return error.message.includes('environment variables') ||
           error.message.includes('Supabase') ||
           error.message.includes('.env');
  };

  render() {
    if (this.state.hasError) {
      const isEnvError = this.state.error && this.isEnvironmentError(this.state.error);

      return (
        <View style={styles.container}>
          <Ionicons 
            name={isEnvError ? "construct-outline" : "alert-circle-outline"} 
            size={48} 
            color="#FF3B30" 
          />
          <Text style={styles.title}>
            {isEnvError ? 'Configuration Error' : 'Oops! Something went wrong'}
          </Text>
          <Text style={styles.message}>
            {isEnvError 
              ? 'There seems to be a problem with the app configuration. Please make sure all environment variables are set correctly.'
              : this.state.error?.message || 'An unexpected error occurred'
            }
          </Text>
          {isEnvError ? (
            <TouchableOpacity style={styles.button} onPress={this.handleSupport}>
              <Text style={styles.buttonText}>Contact Support</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 