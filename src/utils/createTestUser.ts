import { supabase } from '../services/supabase';

export const createTestUser = async () => {
  const testEmail = 'test@example.com';
  const testPassword = 'password123';

  try {
    // First, try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (signInData.user) {
      console.log('Test user already exists:', signInData.user);
      return { email: testEmail, password: testPassword };
    }

    // If sign in fails, create new user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          email_confirmed_at: new Date().toISOString(), // Auto-confirm for testing
        }
      }
    });

    if (signUpError) throw signUpError;

    console.log('Test user created:', signUpData.user);
    return { email: testEmail, password: testPassword };
  } catch (error) {
    console.error('Error creating test user:', error);
    throw error;
  }
}; 