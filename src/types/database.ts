export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      personas: {
        Row: {
          id: string;
          name: string;
          image_url: string | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          image_url?: string | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          image_url?: string | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      time_passes: {
        Row: {
          id: string;
          label: string;
          expire_at: string;
          persona_id: string;
          status: 'active' | 'expired' | 'paused';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          label: string;
          expire_at: string;
          persona_id: string;
          status?: 'active' | 'expired' | 'paused';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          label?: string;
          expire_at?: string;
          persona_id?: string;
          status?: 'active' | 'expired' | 'paused';
          created_at?: string;
          updated_at?: string;
        };
      };
      notification_history: {
        Row: {
          id: string;
          user_id: string;
          time_pass_id: string | null;
          title: string;
          body: string;
          created_at: string;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          time_pass_id?: string | null;
          title: string;
          body: string;
          created_at?: string;
          read_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          time_pass_id?: string | null;
          title?: string;
          body?: string;
          created_at?: string;
          read_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      handle_time_pass_expiration: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
      handle_updated_at: {
        Args: Record<PropertyKey, never>;
        Returns: unknown;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
} 