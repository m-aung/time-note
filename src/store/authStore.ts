import { create } from 'zustand';
import { AuthState, User } from '../types/auth';
import { supabase } from '../services/supabase';
import { handleAuthError } from '../utils/errorHandling';
import { Session } from '@supabase/supabase-js';

interface AuthStore extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  initializeAuth: () => Promise<() => void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export const useAuth = create<AuthStore>((set, get) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,

  setUser: (user) => set({ user }),

  initializeAuth: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      set({ 
        session,
        user: session?.user ?? null,
        isLoading: false 
      });

      // Store the unsubscribe function but don't return it
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          set({ 
            session,
            user: session?.user ?? null,
          });
        }
      );

      // Clean up subscription when component unmounts
      return () => subscription.unsubscribe();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to initialize auth',
        isLoading: false 
      });
      return () => {};
    }
  },

  signIn: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      
      console.log('Starting sign in process for:', { email });
      
      // Check if session exists
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      console.log('Existing session:', existingSession);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase auth error:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
        throw error;
      }

      if (!data?.user) {
        console.error('No user data returned from sign in');
        throw new Error('No user data returned');
      }

      console.log('Sign in successful:', {
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at
      });

      set({ 
        session: data.session as Session,
        user: data.user as User,
        error: null,
      });
    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = handleAuthError(error);
      set({ 
        error: errorMessage,
        user: null,
        session: null,
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      
      console.log('Signing up with:', { email });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'yourapp://',
          data: {
            email_confirmed_at: new Date().toISOString(), // Auto-confirm for testing
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        throw error;
      }

      if (!data?.user) {
        throw new Error('No user data returned');
      }

      console.log('Sign up successful:', data.user);

      // For testing, we'll automatically sign in after signup
      await get().signIn(email, password);

      set({ 
        user: data.user as User,
        error: null,
      });
    } catch (error) {
      console.error('Sign up error:', error);
      const errorMessage = handleAuthError(error);
      set({ 
        error: errorMessage,
        user: null,
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      set({ user: null, session: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to sign out' });
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (email) => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'yourapp://reset-password',
      });

      if (error) throw error;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred',
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: get().user?.email || '',
        password: currentPassword,
      });

      if (signInError) throw new Error('Current password is incorrect');

      // Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to change password',
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAccount: async () => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase.auth.admin.deleteUser(
        get().user?.id as string
      );

      if (error) throw error;
      
      // Sign out after successful deletion
      await get().signOut();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete account',
      });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
})); 