import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="sign-in" 
        options={{ 
          title: 'Sign In',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="sign-up" 
        options={{ 
          title: 'Sign Up',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="verify-email" 
        options={{ 
          title: 'Verify Email',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="forgot-password" 
        options={{ 
          title: 'Forgot Password',
          headerShown: false,
        }} 
      />
    </Stack>
  );
} 