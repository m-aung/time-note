import React from 'react';
import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Dashboard',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="add-persona" 
        options={{ 
          title: 'Add Persona',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="persona/[id]" 
        options={{ 
          title: 'Persona Details',
        }} 
      />
      <Stack.Screen 
        name="persona/[id]/edit" 
        options={{ 
          title: 'Edit Persona',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="persona/[id]/add-time-pass" 
        options={{ 
          title: 'Add Time Pass',
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="time-pass/[id]" 
        options={{ 
          title: 'Time Pass Details',
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          title: 'Settings',
        }} 
      />
    </Stack>
  );
} 