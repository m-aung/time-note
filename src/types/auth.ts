import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export type AuthFormType = 'signin' | 'signup';

export type User = SupabaseUser;

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
} 