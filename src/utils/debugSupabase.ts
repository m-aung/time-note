import { supabase } from '../services/supabase';
import Constants from 'expo-constants';

export const debugSupabase = async () => {
  console.log('=== Supabase Debug Info ===');
  
  // Check configuration
  const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
  const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;
  
  console.log('Configuration:', {
    url: supabaseUrl ? 'Set' : 'Missing',
    key: supabaseAnonKey ? 'Set' : 'Missing',
    urlLength: supabaseUrl?.length,
    keyLength: supabaseAnonKey?.length,
  });

  try {
    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('Current Session:', {
      exists: !!session,
      error: sessionError ? {
        message: sessionError.message,
        name: sessionError.name
      } : null
    });

    // Check if we can connect to Supabase
    const { data, error } = await supabase.from('_test_connection_').select('*').limit(1);
    
    console.log('Connection Test:', {
      success: !error,
      error: error ? {
        message: error.message,
        code: error.code,
        details: error.details
      } : null
    });

  } catch (error) {
    console.error('Debug Error:', error);
  }

  console.log('========================');
}; 