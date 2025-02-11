import { create } from 'zustand';
import { Persona, TimePass } from '../types/persona';
import { supabase } from '../services/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { scheduleTimePassNotification, cancelTimePassNotifications } from '../utils/notifications';
import { deleteImage, updateImage } from '../utils/storage';
import { validateTimePass, validatePersonaId } from '../utils/validation';

interface PersonaState {
  personas: Persona[];
  isLoading: boolean;
  error: string | null;
  selectedPersona: Persona | null;
  fetchPersonas: () => Promise<void>;
  addPersona: (name: string, imageUrl?: string) => Promise<Persona>;
  updatePersona: (id: string, updates: Partial<Persona>) => Promise<void>;
  deletePersona: (id: string) => Promise<void>;
  selectPersona: (persona: Persona | null) => void;
  addTimePass: (personaId: string, label: string, expireAt: string) => Promise<void>;
  updateTimePass: (passId: string, updates: Partial<TimePass>) => Promise<void>;
  deleteTimePass: (passId: string) => Promise<void>;
  subscribeToUpdates: () => void;
  unsubscribeFromUpdates: () => void;
}

export const usePersona = create<PersonaState>((set, get) => {
  let realtimeChannel: RealtimeChannel | null = null;

  return {
    personas: [],
    isLoading: false,
    error: null,
    selectedPersona: null,

    fetchPersonas: async () => {
      try {
        set({ isLoading: true, error: null });
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          throw new Error('User not authenticated');
        }

        // First fetch personas
        const { data: personasData, error: personasError } = await supabase
          .from('personas')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (personasError) throw personasError;

        if (!personasData) {
          set({ personas: [] });
          return;
        }

        // Then fetch time passes for each persona
        const personas = await Promise.all(
          personasData.map(async (persona) => {
            const { data: passes, error: passesError } = await supabase
              .from('time_passes')
              .select('*')
              .eq('persona_id', persona.id);

            if (passesError) throw passesError;

            return {
              ...persona,
              activePasses: passes?.filter(pass => pass.is_active) || [],
              expiredPasses: passes?.filter(pass => !pass.is_active) || [],
            };
          })
        );

        set({ personas });
      } catch (error) {
        console.error('Fetch personas error:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch personas',
          personas: [],
        });
      } finally {
        set({ isLoading: false });
      }
    },

    addPersona: async (name: string, imageUrl?: string) => {
      try {
        set({ isLoading: true, error: null });

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          throw new Error('User not authenticated');
        }

        // First, create the persona
        const { data: persona, error: personaError } = await supabase
          .from('personas')
          .insert({
            name,
            image_url: imageUrl,
            user_id: session.user.id,
          })
          .select('*')
          .single();

        if (personaError) {
          console.error('Error creating persona:', personaError);
          throw personaError;
        }

        if (!persona) {
          throw new Error('Failed to create persona');
        }

        // Create new persona object with empty passes arrays
        const newPersona: Persona = {
          ...persona,
          activePasses: [],
          expiredPasses: [],
        };

        // Update state
        set(state => ({
          personas: [newPersona, ...state.personas], // Add to beginning of array
          error: null,
        }));

        return newPersona;
      } catch (error) {
        console.error('Add persona error:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to add persona',
          isLoading: false,
        });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    selectPersona: (persona) => {
      set({ selectedPersona: persona });
    },

    updatePersona: async (id: string, updates: Partial<Persona>) => {
      try {
        set({ isLoading: true, error: null });

        const persona = get().personas.find(p => p.id === id);
        let imageUrl = updates.image_url;

        // Handle image update if needed
        if (updates.image_url && updates.image_url !== persona?.image_url) {
          imageUrl = await updateImage(persona?.image_url || null, updates.image_url);
        }

        const { data, error } = await supabase
          .from('personas')
          .update({
            name: updates.name,
            image_url: imageUrl,
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        set(state => ({
          personas: state.personas.map(p => 
            p.id === id 
              ? { ...p, ...data, activePasses: p.activePasses, expiredPasses: p.expiredPasses }
              : p
          ),
        }));
      } catch (error) {
        console.error('Update persona error:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to update persona' });
      } finally {
        set({ isLoading: false });
      }
    },

    deletePersona: async (id: string) => {
      try {
        set({ isLoading: true, error: null });

        // Get persona to delete its image
        const persona = get().personas.find(p => p.id === id);
        if (persona?.image_url) {
          await deleteImage(persona.image_url);
        }

        const { error } = await supabase
          .from('personas')
          .delete()
          .eq('id', id);

        if (error) throw error;

        set(state => ({
          personas: state.personas.filter(p => p.id !== id),
          selectedPersona: state.selectedPersona?.id === id ? null : state.selectedPersona,
        }));
      } catch (error) {
        console.error('Delete persona error:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to delete persona' });
      } finally {
        set({ isLoading: false });
      }
    },

    addTimePass: async (personaId: string, label: string, expireAt: string) => {
      try {
        set({ isLoading: true, error: null });

        // Validate inputs
        const personaIdError = validatePersonaId(personaId);
        if (personaIdError) {
          throw new Error(personaIdError);
        }

        const timePassError = validateTimePass(label, expireAt);
        if (timePassError) {
          throw new Error(timePassError);
        }

        // Check if persona exists
        const persona = get().personas.find(p => p.id === personaId);
        if (!persona) {
          throw new Error('Persona not found');
        }

        const now = new Date();
        const expireDate = new Date(expireAt);
        const is_active = expireDate > now;

        // Create time pass
        const { data, error } = await supabase
          .from('time_passes')
          .insert({
            persona_id: personaId,
            label: label.trim(),
            expire_at: expireAt,
            is_active,
          })
          .select('*')
          .single();

        if (error) {
          // Handle specific database errors
          switch (error.code) {
            case '23503': // Foreign key violation
              throw new Error('Invalid persona selected');
            case '23505': // Unique violation
              throw new Error('A time pass with this label already exists');
            default:
              console.error('Add time pass error:', error);
              throw error;
          }
        }

        if (!data) {
          throw new Error('Failed to create time pass');
        }

        // Schedule notification
        try {
          await scheduleTimePassNotification(data, persona.name);
        } catch (notificationError) {
          console.error('Failed to schedule notification:', notificationError);
          // Continue even if notification scheduling fails
        }

        // Update state
        set(state => ({
          personas: state.personas.map(p => {
            if (p.id === personaId) {
              return {
                ...p,
                activePasses: is_active ? [...p.activePasses, data] : p.activePasses,
                expiredPasses: !is_active ? [...p.expiredPasses, data] : p.expiredPasses,
              };
            }
            return p;
          }),
          error: null,
        }));

        return data;
      } catch (error) {
        console.error('Add time pass error:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to add time pass',
          isLoading: false,
        });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    updateTimePass: async (passId: string, updates: Partial<TimePass>) => {
      try {
        set({ isLoading: true, error: null });

        // Calculate is_active if expire_at is being updated
        const updatesWithActive = { ...updates };
        if (updates.expire_at) {
          const now = new Date();
          const expireDate = new Date(updates.expire_at);
          updatesWithActive.is_active = expireDate > now;
        }

        const { data, error } = await supabase
          .from('time_passes')
          .update(updatesWithActive)
          .eq('id', passId)
          .select()
          .single();

        if (error) throw error;

        set(state => ({
          personas: state.personas.map(p => {
            // Remove from both arrays first
            const filteredActive = p.activePasses.filter(pass => pass.id !== passId);
            const filteredExpired = p.expiredPasses.filter(pass => pass.id !== passId);

            // Add to appropriate array based on is_active status
            if (data.is_active) {
              filteredActive.push(data);
            } else {
              filteredExpired.push(data);
            }

            return {
              ...p,
              activePasses: filteredActive,
              expiredPasses: filteredExpired,
            };
          }),
        }));
      } catch (error) {
        console.error('Update time pass error:', error);
        set({ error: error instanceof Error ? error.message : 'Failed to update time pass' });
      } finally {
        set({ isLoading: false });
      }
    },

    deleteTimePass: async (passId: string) => {
      try {
        set({ isLoading: true, error: null });

        const { error } = await supabase
          .from('time_passes')
          .delete()
          .eq('id', passId);

        if (error) throw error;

        // Cancel notifications for the deleted time pass
        await cancelTimePassNotifications(passId);

        set(state => ({
          personas: state.personas.map(p => ({
            ...p,
            activePasses: p.activePasses.filter(pass => pass.id !== passId),
            expiredPasses: p.expiredPasses.filter(pass => pass.id !== passId),
          })),
        }));
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Failed to delete time pass' });
      } finally {
        set({ isLoading: false });
      }
    },

    subscribeToUpdates: () => {
      if (realtimeChannel) return;

      realtimeChannel = supabase
        .channel('persona-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'personas',
          },
          async (payload) => {
            console.log('Persona change received:', payload);
            await get().fetchPersonas();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'time_passes',
          },
          async (payload) => {
            console.log('Time pass change received:', payload);
            await get().fetchPersonas();
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status);
        });
    },

    unsubscribeFromUpdates: () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
        realtimeChannel = null;
      }
    },
  };
}); 