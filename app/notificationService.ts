import { AppRegistry, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a safe wrapper for the notification listener
// This prevents crashes when the native module is not available
let RNAndroidNotificationListener: any = {
  getPermissionStatus: async () => 'unavailable',
  requestPermission: () => console.warn('Notification listener not available'),
};

let RNAndroidNotificationListenerHeadlessJsName = 'unavailable';

// Only try to import the module on Android platform
if (Platform.OS === 'android') {
  try {
    // Dynamically import the module
    const NotificationListenerModule = require('react-native-android-notification-listener');
    
    // Verify the module is properly loaded and has the expected methods
    if (NotificationListenerModule && 
        (typeof NotificationListenerModule.getPermissionStatus === 'function' || 
         (NotificationListenerModule.default && typeof NotificationListenerModule.default.getPermissionStatus === 'function'))) {
      
      RNAndroidNotificationListener = NotificationListenerModule.default || NotificationListenerModule;
      RNAndroidNotificationListenerHeadlessJsName = NotificationListenerModule.RNAndroidNotificationListenerHeadlessJsName;
      console.log('Successfully loaded notification listener module');
    } else {
      console.warn('Notification listener module loaded but missing expected methods');
    }
  } catch (error) {
    console.warn('Failed to load react-native-android-notification-listener:', error);
  }
}

// Interface for the notification data structure
export interface AndroidNotification {
  time: string;
  app: string;
  title: string;
  titleBig?: string;
  text: string;
  subText?: string;
  summaryText?: string;
  bigText?: string;
  audioContentsURI?: string;
  imageBackgroundURI?: string;
  extraInfoText?: string;
  groupedMessages?: Array<{
    title: string;
    text: string;
  }>;
  icon?: string; // base64
  image?: string; // base64
}

// Interface for our stored notification format
export interface StoredNotification {
  id: string;
  title: string;
  body: string;
  app: string;
  time: string;
  data: Record<string, any>;
  userInteraction?: boolean;
}

// Check if the user has permission
export const checkNotificationListenerPermission = async (): Promise<string> => {
  try {
    // Only check on Android platform
    if (Platform.OS !== 'android') {
      return 'not_supported';
    }
    
    // Verify the module is properly loaded before calling methods
    if (!RNAndroidNotificationListener || typeof RNAndroidNotificationListener.getPermissionStatus !== 'function') {
      console.warn('Notification listener module not properly initialized');
      return 'module_not_available';
    }
    
    const status = await RNAndroidNotificationListener.getPermissionStatus();
    return status; // Result can be 'authorized', 'denied' or 'unknown'
  } catch (error) {
    console.error('Error checking notification permission:', error);
    return 'error';
  }
};

// Open Android settings so the user can enable the notification listener
export const requestNotificationListenerPermission = (): void => {
  try {
    // Only request on Android platform
    if (Platform.OS !== 'android') {
      console.warn('Notification listener permissions only available on Android');
      return;
    }
    
    // Verify the module is properly loaded
    if (!RNAndroidNotificationListener) {
      console.warn('Notification listener module not available');
      alert('Notification listener not available. Please make sure the app is properly installed.');
      return;
    }
    
    if (typeof RNAndroidNotificationListener.requestPermission === 'function') {
      RNAndroidNotificationListener.requestPermission();
    } else {
      console.warn('Notification listener requestPermission method not available');
      alert('Notification listener functionality is not available. Please check app permissions manually in Settings.');
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    alert('An error occurred while requesting notification permissions. Please try again.');
  }
};

// Store a notification in AsyncStorage
export const storeNotification = async (notification: AndroidNotification): Promise<void> => {
  try {
    // Get existing notifications
    const existingNotificationsJson = await AsyncStorage.getItem('notifications');
    const existingNotifications: StoredNotification[] = existingNotificationsJson 
      ? JSON.parse(existingNotificationsJson) 
      : [];
    
    // Create a new notification object
    const newNotification: StoredNotification = {
      id: Date.now().toString(),
      title: notification.title || notification.titleBig || 'No Title',
      body: notification.text || notification.bigText || 'No Content',
      app: notification.app || 'Unknown App',
      time: notification.time || new Date().toLocaleString(),
      data: {
        ...notification,
        // Don't store large base64 strings in AsyncStorage
        icon: notification.icon ? 'base64_data_available' : undefined,
        image: notification.image ? 'base64_data_available' : undefined,
      }
    };
    
    // Add to existing notifications
    const updatedNotifications = [...existingNotifications, newNotification];
    
    // Save to AsyncStorage
    await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  } catch (error) {
    console.error('Failed to store notification:', error);
  }
};

/**
 * Headless task for processing notifications
 * This runs in the background even when the app is closed
 */
const headlessNotificationListener = async ({ notification }: { notification: string }): Promise<void> => {
  if (notification) {
    try {
      // Parse the notification JSON string
      const parsedNotification: AndroidNotification = JSON.parse(notification);
      
      // Store the notification
      await storeNotification(parsedNotification);
      
      console.log('Notification received and stored:', parsedNotification.title);
    } catch (error) {
      console.error('Error processing notification in headless task:', error);
    }
  }
};

// Register the headless task only if the module is available
if (Platform.OS === 'android' && RNAndroidNotificationListenerHeadlessJsName !== 'unavailable') {
  try {
    AppRegistry.registerHeadlessTask(
      RNAndroidNotificationListenerHeadlessJsName,
      () => headlessNotificationListener
    );
    console.log('Notification listener headless task registered successfully');
  } catch (error) {
    console.error('Failed to register notification listener headless task:', error);
  }
}