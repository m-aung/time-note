import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkConnection } from './network';
import { notifications } from './notifications';
import { create } from 'zustand';

interface QueueItem {
  id: string;
  operation: string;
  data: any;
  timestamp: number;
  retries: number;
}

interface QueueState {
  items: QueueItem[];
  isProcessing: boolean;
  lastError: string | null;
  setItems: (items: QueueItem[]) => void;
  setProcessing: (isProcessing: boolean) => void;
  setLastError: (error: string | null) => void;
}

export const useQueue = create<QueueState>((set) => ({
  items: [],
  isProcessing: false,
  lastError: null,
  setItems: (items) => set({ items }),
  setProcessing: (isProcessing) => set({ isProcessing }),
  setLastError: (lastError) => set({ lastError }),
}));

const QUEUE_STORAGE_KEY = 'offline_queue';
const MAX_RETRIES = 3;

export const queue = {
  async add(operation: string, data: any) {
    try {
      const queueItems = await this.getAll();
      const newItem: QueueItem = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        operation,
        data,
        timestamp: Date.now(),
        retries: 0,
      };
      
      const updatedItems = [...queueItems, newItem];
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(updatedItems));
      useQueue.getState().setItems(updatedItems);
      
      await notifications.showNotification(
        'Operation Queued',
        'Your changes will be saved when you\'re back online'
      );
      
      return newItem.id;
    } catch (error) {
      console.error('Queue add error:', error);
      useQueue.getState().setLastError('Failed to add item to queue');
    }
  },

  async remove(id: string) {
    try {
      const queueItems = await this.getAll();
      const filteredItems = queueItems.filter(item => item.id !== id);
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(filteredItems));
      useQueue.getState().setItems(filteredItems);
    } catch (error) {
      console.error('Queue remove error:', error);
      useQueue.getState().setLastError('Failed to remove item from queue');
    }
  },

  async getAll(): Promise<QueueItem[]> {
    try {
      const items = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      const queueItems = items ? JSON.parse(items) : [];
      useQueue.getState().setItems(queueItems);
      return queueItems;
    } catch (error) {
      console.error('Queue getAll error:', error);
      useQueue.getState().setLastError('Failed to get queue items');
      return [];
    }
  },

  async process(
    handlers: { [key: string]: (data: any) => Promise<any> }
  ): Promise<void> {
    const { setProcessing, setLastError } = useQueue.getState();

    if (!await checkConnection()) {
      return;
    }

    const items = await this.getAll();
    if (items.length === 0) return;

    setProcessing(true);
    let processedCount = 0;
    let failedCount = 0;

    for (const item of items) {
      try {
        const handler = handlers[item.operation];
        if (!handler) {
          console.warn(`No handler found for operation: ${item.operation}`);
          await this.remove(item.id);
          continue;
        }

        await handler(item.data);
        await this.remove(item.id);
        processedCount++;
      } catch (error) {
        console.error(`Error processing queue item ${item.id}:`, error);
        failedCount++;
        
        if (item.retries >= MAX_RETRIES) {
          await this.remove(item.id);
          await notifications.showNotification(
            'Operation Failed',
            'Some changes could not be saved after multiple attempts'
          );
          continue;
        }

        const updatedItems = items.map(i => 
          i.id === item.id 
            ? { ...i, retries: i.retries + 1 }
            : i
        );
        await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(updatedItems));
        useQueue.getState().setItems(updatedItems);
      }
    }

    if (processedCount > 0) {
      await notifications.showNotification(
        'Changes Synced',
        `Successfully processed ${processedCount} queued operations`
      );
    }

    if (failedCount > 0) {
      setLastError(`Failed to process ${failedCount} operations`);
    } else {
      setLastError(null);
    }

    setProcessing(false);
  },

  async clear() {
    try {
      await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
      useQueue.getState().setItems([]);
    } catch (error) {
      console.error('Queue clear error:', error);
      useQueue.getState().setLastError('Failed to clear queue');
    }
  },
}; 