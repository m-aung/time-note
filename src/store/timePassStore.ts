import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { cache } from '../utils/cache';
import { retry } from '../utils/retry';
import { queue } from '../utils/queue';
import { useNetwork } from '../utils/network';
import { validateTimePass } from '../utils/validation';
import { TimePass, TimePassInput } from '../types/timePass';

// Define base types from database
type TimePassBase = Database['public']['Tables']['time_passes']['Row'];
type TimePassInsert = Database['public']['Tables']['time_passes']['Insert'];
type TimePassUpdate = Database['public']['Tables']['time_passes']['Update'];

// Remove the duplicate TimePass interface since we're importing it from types/timePass.ts

interface TimePassState {
  passes: TimePass[];
  isLoading: boolean;
  error: string | null;
  fetchPasses: (personaId: string) => Promise<void>;
  addTimePass: (data: TimePassInput) => Promise<TimePass>;
  updateTimePass: (id: string, data: Partial<TimePass>) => Promise<void>;
  deleteTimePass: (id: string) => Promise<void>;
  pauseTimePass: (id: string) => Promise<void>;
  resumeTimePass: (id: string) => Promise<void>;
  completeTimePass: (id: string) => Promise<void>;
  cancelTimePass: (id: string) => Promise<void>;
  subscribeToChanges: (personaId?: string) => () => void;
  unsubscribeFromChanges: () => void;
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

const formatDateForDB = (date: Date): string => {
  return date.toISOString();
};

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
          .eq('persona_id', personaId as any)
          .order('created_at', { ascending: false });

        const { data, error } = await query;
        if (error) throw error;
        return (data ?? []) as unknown as TimePass[];
      }, retryOptions);

      set({ passes: timePasses, });
      await cache.set(cacheKey, timePasses, CACHE_EXPIRY);
    } catch (error) {
      console.error('Fetch time passes error:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch time passes' });
    } finally {
      set({ isLoading: false });
    }
  },

  addTimePass: async (data: TimePassInput) => {
    try {
      set({ isLoading: true, error: null });
      
      // Check if user is authenticated
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('User must be authenticated');
      }
      
      const now = new Date();
      const formattedData: TimePassInsert = {
        persona_id: data.persona_id,
        label: data.label,
        duration: data.duration,
        type: data.type,
        status: 'active',
        started_at: formatDateForDB(now),
        expire_at: formatDateForDB(new Date(now.getTime() + data.duration * 60000)),
        remaining_time: data.duration * 60, // Convert minutes to seconds
      };

      const { data: newPass, error } = await supabase
        .from('time_passes')
        .insert(formattedData as any)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      set(state => ({
        passes: [...state.passes, newPass as unknown as TimePass],
      }));

      return newPass as unknown as TimePass;
    } catch (error) {
      console.error('Add time pass error:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to add time pass' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTimePass: async (id: string, updates: Partial<TimePass>) => {
    try {
      set({ isLoading: true, error: null });

      const updatedData = {
        ...updates,
        updated_at: formatDateForDB(new Date()),
      };

      const { data, error } = await supabase
        .from('time_passes')
        .update(updatedData as any)
        .eq('id', id as any)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        passes: state.passes.map(pass => 
          pass.id === id ? { ...pass, ...(data as unknown as TimePass) } : pass
        ),
      }));
    } catch (error) {
      console.error('Update time pass error:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to update time pass' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTimePass: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      set(state => ({
        passes: state.passes.filter(pass => pass.id !== id),
        error: null,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete time pass' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  pauseTimePass: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const pass = get().passes.find(p => p.id === id);
      if (!pass) throw new Error('Time pass not found');

      await get().updateTimePass(id, {
        status: 'paused' as const,
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to pause time pass' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  resumeTimePass: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const pass = get().passes.find(p => p.id === id);
      if (!pass) throw new Error('Time pass not found');

      await get().updateTimePass(id, {
        status: 'active' as const,
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to resume time pass' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  completeTimePass: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const pass = get().passes.find(p => p.id === id);
      if (!pass) throw new Error('Time pass not found');

      await get().updateTimePass(id, {
        status: 'expired' as const,
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to complete time pass' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  cancelTimePass: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const pass = get().passes.find(p => p.id === id);
      if (!pass) throw new Error('Time pass not found');

      await get().updateTimePass(id, {
        status: 'expired' as const,
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to cancel time pass' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
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
}));

// Process queue when app comes online
useNetwork.subscribe((state) => {
  if (state.isConnected) {
    queue.process({
      [QUEUE_OPERATIONS.ADD_TIME_PASS]: async (data: TimePassInput) => {
        await useTimePass.getState().addTimePass(data);
      },
      [QUEUE_OPERATIONS.UPDATE_TIME_PASS]: async ({ id, data }: { id: string; data: Partial<TimePass> }) => {
        await useTimePass.getState().updateTimePass(id, data);
      },
      [QUEUE_OPERATIONS.DELETE_TIME_PASS]: async (id: string) => {
        await useTimePass.getState().deleteTimePass(id);
      },
    });
  }
}); 