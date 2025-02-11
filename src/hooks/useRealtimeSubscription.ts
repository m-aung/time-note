import { useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export const useRealtimeSubscription = (
  channel: string,
  event: 'INSERT' | 'UPDATE' | 'DELETE',
  schema: string,
  table: string,
  callback: (payload: any) => void,
  filter?: string
) => {
  useEffect(() => {
    let subscription: RealtimeChannel;

    const setupSubscription = async () => {
      subscription = supabase.channel(channel)
        .on(
          'postgres_changes',
          {
            event,
            schema,
            table,
            filter,
          },
          callback
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [channel, event, schema, table, callback, filter]);
}; 