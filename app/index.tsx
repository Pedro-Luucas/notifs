import { Link } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import * as Notifications from 'expo-notifications';
import React from 'react';

export default function home() {
  
  const askPermission = async () => {
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

  return(
    <View style={styles.container}>
      <Text>home</Text>
      <Link href='/user'>GOTOUSER</Link>
      <Button mode='contained' onPress={askPermission}>permiso</Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'lightblue',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
})