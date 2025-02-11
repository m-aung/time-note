import { create } from 'zustand';
import { supabase } from '../services/supabase';

export interface NotificationHistoryItem {
  id: string;
  timePassId: string;
  title: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

interface NotificationHistoryState {
  history: NotificationHistoryItem[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchHistory: () => Promise<void>;
  addNotification: (notification: Omit<NotificationHistoryItem, 'id' | 'createdAt' | 'readAt'>) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearHistory: () => Promise<void>;
}

export const useNotificationHistory = create<NotificationHistoryState>((set, get) => ({
  history: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchHistory: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('notification_history')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const history = data.map(item => ({
        id: item.id,
        timePassId: item.time_pass_id,
        title: item.title,
        body: item.body,
        createdAt: item.created_at,
        readAt: item.read_at,
      }));

      const unreadCount = history.filter(item => !item.readAt).length;

      set({ history, unreadCount });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch notification history' });
    } finally {
      set({ isLoading: false });
    }
  },

  addNotification: async (notification) => {
    try {
      set({ isLoading: true, error: null });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('notification_history')
        .insert({
          time_pass_id: notification.timePassId,
          title: notification.title,
          body: notification.body,
          user_id: session.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        history: [
          {
            id: data.id,
            timePassId: data.time_pass_id,
            title: data.title,
            body: data.body,
            createdAt: data.created_at,
            readAt: data.read_at,
          },
          ...state.history,
        ],
        unreadCount: state.unreadCount + 1,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add notification' });
    } finally {
      set({ isLoading: false });
    }
  },

  markAsRead: async (notificationId) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase
        .from('notification_history')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      set(state => ({
        history: state.history.map(item =>
          item.id === notificationId
            ? { ...item, readAt: new Date().toISOString() }
            : item
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to mark notification as read' });
    } finally {
      set({ isLoading: false });
    }
  },

  markAllAsRead: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('notification_history')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', session.user.id)
        .is('read_at', null);

      if (error) throw error;

      set(state => ({
        history: state.history.map(item => ({
          ...item,
          readAt: item.readAt || new Date().toISOString(),
        })),
        unreadCount: 0,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to mark all notifications as read' });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase
        .from('notification_history')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      set(state => {
        const wasUnread = state.history.find(item => item.id === notificationId)?.readAt === null;
        return {
          history: state.history.filter(item => item.id !== notificationId),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
        };
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete notification' });
    } finally {
      set({ isLoading: false });
    }
  },

  clearHistory: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('notification_history')
        .delete()
        .eq('user_id', session.user.id);

      if (error) throw error;

      set({ history: [], unreadCount: 0 });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to clear notification history' });
    } finally {
      set({ isLoading: false });
    }
  },
})); 