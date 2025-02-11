import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { TimePass } from '../types/persona';
import { useSettings } from '../store/settingsStore';
import { useNotificationHistory } from '../store/notificationHistoryStore';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const notifications = {
  async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  async showNotification(title: string, body: string) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: null,
    });
  },
};

export const initializeNotifications = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('time-pass', {
      name: 'Time Pass Notifications',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#007AFF',
    });
  }

  return true;
};

export const scheduleTimePassNotification = async (timePass: TimePass, personaName: string) => {
  const { notifications } = useSettings.getState();
  const { addNotification } = useNotificationHistory.getState();
  
  // Don't schedule if notifications are disabled
  if (!notifications.enabled) {
    return;
  }

  const expireDate = new Date(timePass.expireAt);
  const now = new Date();
  
  // Use reminder times from settings
  const notificationTimes = notifications.reminders.map(minutes => ({
    minutes,
    title: `${minutes} Minutes Left`,
    body: `${personaName}'s time pass "${timePass.label}" expires in ${minutes} minutes`,
  }));

  for (const notification of notificationTimes) {
    const triggerDate = new Date(expireDate.getTime() - notification.minutes * 60000);
    
    // Only schedule if the notification time is in the future
    if (triggerDate > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: { timePassId: timePass.id, personaId: timePass.personaId },
          sound: notifications.sound,
          vibrate: notifications.vibration ? [0, 250, 250, 250] : undefined,
        },
        trigger: {
          date: triggerDate,
          channelId: Platform.OS === 'android' ? 'time-pass' : undefined,
        },
      });
    }
  }

  // Add to notification history when scheduling
  await addNotification({
    timePassId: timePass.id,
    title: `New Time Pass Created`,
    body: `Time pass "${timePass.label}" has been created for ${personaName}`,
  });
};

export const cancelTimePassNotifications = async (timePassId: string) => {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
  
  for (const notification of scheduledNotifications) {
    if (notification.content.data?.timePassId === timePassId) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }
};

export const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
  const data = response.notification.request.content.data;
  
  if (data?.timePassId && data?.personaId) {
    // Navigate to the persona details screen
    return {
      screen: 'PersonaDetails',
      params: { id: data.personaId }
    };
  }
  
  return null;
}; 