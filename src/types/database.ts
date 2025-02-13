export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          persona_id: string;
          label: string;
          duration: number;
          type: 'entertainment' | 'education' | 'exercise' | 'other';
          status: 'active' | 'paused' | 'expired' | 'completed' | 'cancelled';
          started_at: string;
          completed_at: string | null;
          paused_at: string | null;
          expire_at: string;
          remaining_time: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          persona_id: string;
          label: string;
          duration: number;
          type?: 'entertainment' | 'education' | 'exercise' | 'other';
          status?: 'active' | 'paused' | 'expired' | 'completed' | 'cancelled';
          started_at?: string;
          completed_at?: string | null;
          paused_at?: string | null;
          expire_at: string;
          remaining_time?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          persona_id?: string;
          label?: string;
          duration?: number;
          type?: 'entertainment' | 'education' | 'exercise' | 'other';
          status?: 'active' | 'paused' | 'expired' | 'completed' | 'cancelled';
          started_at?: string;
          completed_at?: string | null;
          paused_at?: string | null;
          expire_at?: string;
          remaining_time?: number | null;
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