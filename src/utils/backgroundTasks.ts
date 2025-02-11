import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { supabase } from '../services/supabase';
import { useSettings } from '../store/settingsStore';

const BACKGROUND_FETCH_TASK = 'background-fetch';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const { notifications } = useSettings.getState();
    
    // Don't run the task if notifications are disabled
    if (!notifications.enabled) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const now = new Date().toISOString();
    
    // Update expired passes
    const { error } = await supabase
      .from('time_passes')
      .update({ is_active: false })
      .eq('is_active', true)
      .lt('expire_at', now);

    if (error) throw error;

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background task error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerBackgroundTask = async () => {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 15 * 60, // 15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch (error) {
    console.error('Task registration failed:', error);
  }
}; 