import { View, Text, StyleSheet, ScrollView } from 'react-native';
import * as Notifications from 'expo-notifications';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function User() {
  const [notifications, setNotifications] = useState([]);
  const notificationListener = useRef();
  const responseListener = useRef();

  // Load saved notifications when component mounts
  useEffect(() => {
    loadSavedNotifications();

    // Set up notification listeners
    registerForNotifications();

    // Clean up listeners when component unmounts
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // Load previously saved notifications from AsyncStorage
  const loadSavedNotifications = async () => {
    try {
      const savedNotifications = await AsyncStorage.getItem('notifications');
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  // Save notifications to AsyncStorage
  const saveNotifications = async (notifs) => {
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(notifs));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  };

  // Register for notification listeners
  const registerForNotifications = () => {
    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      const newNotification = {
        id: Date.now().toString(),
        title: notification.request.content.title || 'No Title',
        body: notification.request.content.body || 'No Content',
        data: notification.request.content.data,
        date: new Date().toLocaleString()
      };
      
      const updatedNotifications = [...notifications, newNotification];
      setNotifications(updatedNotifications);
      saveNotifications(updatedNotifications);
    });

    // This listener is fired whenever a user taps on or interacts with a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const newNotification = {
        id: Date.now().toString(),
        title: response.notification.request.content.title || 'No Title',
        body: response.notification.request.content.body || 'No Content',
        data: response.notification.request.content.data,
        date: new Date().toLocaleString(),
        userInteraction: true
      };
      
      const updatedNotifications = [...notifications, newNotification];
      setNotifications(updatedNotifications);
      saveNotifications(updatedNotifications);
    });
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
    saveNotifications([]);
  };

  // Send a test notification
  const sendTestNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Notification",
        body: "This is a test notification",
        data: { data: "Test data" },
      },
      trigger: null, // null means send immediately
    });
  };

  return(
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      
      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={sendTestNotification} style={styles.button}>
          Send Test Notification
        </Button>
        <Button mode="outlined" onPress={clearNotifications} style={styles.button}>
          Clear All
        </Button>
      </View>

      <ScrollView style={styles.notificationList}>
        {notifications.length === 0 ? (
          <Text style={styles.emptyText}>No notifications received yet</Text>
        ) : (
          notifications.map((notification) => (
            <View key={notification.id} style={styles.notificationItem}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationBody}>{notification.body}</Text>
              <Text style={styles.notificationDate}>{notification.date}</Text>
              {notification.data && (
                <Text style={styles.notificationData}>
                  Data: {JSON.stringify(notification.data)}
                </Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'lightpink',
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 16,
    textAlign: 'center'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    margin: 5,
  },
  notificationList: {
    flex: 1,
    width: '100%',
  },
  notificationItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  notificationBody: {
    fontSize: 16,
    marginBottom: 8,
  },
  notificationDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  notificationData: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#666',
  }
})