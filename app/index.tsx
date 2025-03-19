import { Link } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { checkNotificationListenerPermission, requestNotificationListenerPermission } from './notificationService';

// Import the notification service to register the headless task
import './notificationService';

export default function home() {
  // State to track Android notification permission status
  const [androidPermission, setAndroidPermission] = useState('unknown');
  
  // Check Android permission status on component mount
  useEffect(() => {
    checkAndroidPermission();
  }, []);

  // Function to check Android notification listener permission
  const checkAndroidPermission = async () => {
    const status = await checkNotificationListenerPermission();
    setAndroidPermission(status);
  };
  
  // Function for requesting Expo notification permissions
  const askExpoPermission = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // Only ask if permissions have not already been determined
    if (existingStatus !== 'granted') {
      // Request permission
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    
    // Configure notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
    
    alert('Notification permissions granted!');
  }

  // Function for requesting Android notification listener permission
  const askAndroidPermission = () => {
    requestNotificationListenerPermission();
    // After requesting permission, we should check the status again after a delay
    setTimeout(checkAndroidPermission, 1000);
  };

  return(
    <View style={styles.container}>
      <Text style={styles.title}>Notification App</Text>
      
      <View style={styles.permissionStatus}>
        <Text>Android Notification Access: {androidPermission}</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button mode='contained' onPress={askExpoPermission} style={styles.button}>
          Request Expo Permissions
        </Button>
        
        <Button mode='contained' onPress={askAndroidPermission} style={styles.button}>
          Enable Android Notification Access
        </Button>
      </View>
      
      <Link href='/user' style={styles.link}>Go to Notifications</Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'lightblue',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center'
  },
  permissionStatus: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center'
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 30
  },
  button: { 
    marginVertical: 10
  },
  link: {
    marginTop: 20,
    fontSize: 18,
    color: '#0066cc',
    textDecorationLine: 'underline'
  }
})