import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { cache } from '../utils/cache';
import { retry } from '../utils/retry';
import { queue } from '../utils/queue';
import { useNetwork } from '../utils/network';
import { TimePass, TimePassInput } from '../types/timePass';
import { validateTimePass } from '../utils/validation';

type TimePass = Database['public']['Tables']['time_passes']['Row'];
type TimePassInsert = Database['public']['Tables']['time_passes']['Insert'];
type TimePassUpdate = Database['public']['Tables']['time_passes']['Update'];

interface TimePassState {
  passes: TimePass[];
  isLoading: boolean;
  error: string | null;
  fetchPasses: (personaId: string) => Promise<void>;
  addTimePass: (data: TimePassInput) => Promise<void>;
  updateTimePass: (id: string, data: Partial<TimePass>) => Promise<void>;
  deleteTimePass: (id: string) => Promise<void>;
  pauseTimePass: (id: string) => Promise<void>;
  resumeTimePass: (id: string) => Promise<void>;
  subscribeToChanges: (personaId?: string) => () => void;
  unsubscribeFromChanges: () => void;
  cancelPass: (id: string) => Promise<void>;
}

const CACHE_KEYS = {
  timePasses: 'time_passes',
  timePass: (id: string) => `time_pass_${id}`,
};

const CACHE_EXPIRY = 1000 * 60 * 5; // 5 minutes

const shouldRetryOperation = (error: any) => {
  // Retry on network errors or specific Supabase errors
  if (error?.message?.includes('network')) return true;
  if (error?.code === '20') return true; // Connection error
  if (error?.code === '40') return true; // Rate limit error
  return false;
};

const retryOptions = {
  maxAttempts: 3,
  delay: 1000,
  backoff: 2,
  shouldRetry: shouldRetryOperation,
};

const QUEUE_OPERATIONS = {
  ADD_TIME_PASS: 'ADD_TIME_PASS',
  UPDATE_TIME_PASS: 'UPDATE_TIME_PASS',
  DELETE_TIME_PASS: 'DELETE_TIME_PASS',
} as const;

export const useTimePass = create<TimePassState>((set, get) => ({
  passes: [],
  isLoading: false,
  error: null,

  fetchPasses: async (personaId: string) => {
    try {
      set({ isLoading: true, error: null });

      const cacheKey = personaId 
        ? `${CACHE_KEYS.timePasses}_${personaId}`
        : CACHE_KEYS.timePasses;
      
      const cachedData = await cache.get<TimePass[]>(cacheKey);
      if (cachedData) {
        set({ passes: cachedData });
      }

      const timePasses = await retry(async () => {
        let query = supabase
          .from('time_passes')
          .select('*')
          .eq('persona_id', personaId)
          .order('created_at', { ascending: false });

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }, retryOptions);

      set({ passes: timePasses });
      await cache.set(cacheKey, timePasses, CACHE_EXPIRY);
    } catch (error) {
      console.error('Fetch time passes error:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch time passes' });
    } finally {
      set({ isLoading: false });
    }
  },

  addTimePass: async (data) => {
    try {
      const validationError = validateTimePass(data);
      if (validationError) {
        throw new Error(validationError);
      }

      set({ isLoading: true, error: null });
      
      const expireAt = new Date(Date.now() + data.duration * 60000).toISOString();
      
      const { data: timePass, error } = await supabase
        .from('time_passes')
        .insert([{
          ...data,
          status: 'active',
          createdAt: new Date().toISOString(),
          expireAt,
        }])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        passes: [...state.passes, timePass],
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add time pass',
        isLoading: false,
      });
      throw error;
    }
  },

  updateTimePass: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('time_passes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from update');

      set(state => ({
        passes: state.passes.map(pass => 
          pass.id === id ? data : pass
        )
      }));

      return data;
    } catch (error) {
      console.error('Update time pass error:', error);
      throw error instanceof Error ? error : new Error('Failed to update time pass');
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTimePass: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase
        .from('time_passes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        passes: state.passes.filter(pass => pass.id !== id)
      }));
    } catch (error) {
      console.error('Delete time pass error:', error);
      throw error instanceof Error ? error : new Error('Failed to delete time pass');
    } finally {
      set({ isLoading: false });
    }
  },

  pauseTimePass: async (id) => {
    await get().updateTimePass(id, { status: 'paused' });
  },

  resumeTimePass: async (id) => {
    await get().updateTimePass(id, { status: 'active' });
  },

  subscribeToChanges: (personaId?: string) => {
    const channel = supabase.channel(`time_passes_${personaId || 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_passes',
          filter: personaId ? `persona_id=eq.${personaId}` : undefined,
        },
        (payload: RealtimePostgresChangesPayload<TimePass>) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          switch (eventType) {
            case 'INSERT':
              set(state => ({
                passes: [newRecord, ...state.passes]
              }));
              break;

            case 'UPDATE':
              set(state => ({
                passes: state.passes.map(pass =>
                  pass.id === newRecord.id ? newRecord : pass
                )
              }));
              break;

            case 'DELETE':
              set(state => ({
                passes: state.passes.filter(pass =>
                  pass.id !== oldRecord.id
                )
              }));
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  unsubscribeFromChanges: () => {
    const channels = supabase.getChannels();
    channels.forEach(channel => {
      if (channel.topic.startsWith('time_passes_')) {
        supabase.removeChannel(channel);
      }
    });
  },

  cancelPass: async (id) => {
    // Implementation of cancelPass method
  },
}));

// Process queue when app comes online
useNetwork.subscribe(
  (state) => state.isConnected,
  async (isConnected) => {
    if (isConnected) {
      await queue.process({
        [QUEUE_OPERATIONS.ADD_TIME_PASS]: async (data: TimePassInsert) => {
          await useTimePass.getState().addTimePass(data);
        },
        [QUEUE_OPERATIONS.UPDATE_TIME_PASS]: async ({ id, data }: { id: string; data: TimePassUpdate }) => {
          await useTimePass.getState().updateTimePass(id, data);
        },
        [QUEUE_OPERATIONS.DELETE_TIME_PASS]: async (id: string) => {
          await useTimePass.getState().deleteTimePass(id);
        },
      });
    }
  }
); 