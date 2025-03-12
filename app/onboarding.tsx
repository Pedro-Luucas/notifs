import React from 'react';
import { StyleSheet, View, Image, Platform, Linking } from 'react-native';
import { Button, Text, Surface, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

export default function OnboardingScreen() {
  const theme = useTheme();

  const requestNotificationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        // For Android, we need to direct users to the system settings
        // as BIND_NOTIFICATION_LISTENER_SERVICE requires special permission
        if (Device.isDevice) {
          // Open notification listener settings
          await Linking.openSettings();
          // After returning from settings, we can check if permission was granted
          // or provide additional guidance
          
          // Note: In a real app, you would implement a way to verify if permission was granted
          // This might involve checking if your service can access notifications
        } else {
          alert('Cannot request notification permissions on an emulator. Please use a real device.');
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        alert('Failed to open settings. Please enable notification access manually.');
      }
    } else {
      // For iOS, we would use a different approach
      // This is just a placeholder as the requirement is for Android
      alert('This feature is currently only supported on Android devices.');
    }
  };

  const proceedToApp = () => {
    // Navigate to the main app tabs
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.card}>
        <Image 
          source={require('../assets/images/icon.png')} 
          style={styles.image} 
          resizeMode="contain"
        />
        <Text variant="headlineMedium" style={styles.title}>
          Welcome to Notification Listener
        </Text>
        <Text variant="bodyLarge" style={styles.description}>
          This app allows you to capture and display notifications from your device.
          To get started, we need permission to access your notifications.
        </Text>
        
        <Button 
          mode="contained" 
          onPress={requestNotificationPermission}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          Grant Notification Access
        </Button>
        
        <Text variant="bodyMedium" style={styles.instructionText}>
          You'll be directed to system settings where you need to enable access for this app.
        </Text>
        
        <Button 
          mode="outlined" 
          onPress={proceedToApp}
          style={[styles.button, styles.secondaryButton]}
        >
          Continue to App
        </Button>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    padding: 24,
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  description: {
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    marginVertical: 8,
    width: '100%',
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    paddingVertical: 4,
  },
  secondaryButton: {
    marginTop: 16,
  },
  instructionText: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});