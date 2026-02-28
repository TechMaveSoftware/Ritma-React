/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import ColorCode from './src/utility/ColorCode';

// Initialize Firebase if not already initialized
// On iOS, Firebase is initialized in AppDelegate.swift
// On Android, React Native Firebase auto-initializes from google-services.json
// This check ensures Firebase is ready before we use it
try {
  if (!firebase.apps.length) {
    console.warn('⚠️ Firebase not initialized yet. This should not happen if native initialization is correct.');
    // Only try to initialize if not already initialized (mainly for Android fallback)
    firebase.initializeApp();
  } else {
    console.log('✅ Firebase is already initialized');
  }
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  // Don't throw - let the app continue and handle the error when Firebase is actually used
}

// Register background handler - MUST be called before AppRegistry.registerComponent
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📱 Background message received in index.js:', remoteMessage);

  try {
    // Create notification channel if it doesn't exist
    const channelId = await notifee.createChannel({
      id: 'gce_education',
      name: 'GCE-Education',
      sound: 'default',
      importance: 4, // High importance
      vibration: true,
      vibrationPattern: [300, 500],
    });

    // Extract title and body from either notification or data block
    const notification = remoteMessage.notification || {};
    const data = remoteMessage.data || {};

    const title = notification.title || data.title || data.notification_title || data.nt_title || data.subject || '';
    const body = notification.body || data.body || data.notification_body || data.description || data.message || data.text || data.content || data.nt_body || '';

    // Skip creating noisy placeholder notifications when payload has no content.
    if (!title && !body) {
      console.log('ℹ️ Skipping background notification display: no title/body in payload');
      return;
    }

    // Display notification
    await notifee.displayNotification({
      title: title,
      body: body,
      data: data,
      android: {
        channelId: channelId,
        smallIcon: 'ic_launcher',
        color: ColorCode.primary,
        pressAction: {
          id: 'default',
        },
        importance: 4,
        showTimestamp: true,
        timestamp: Date.now(),
        sound: 'default',
        vibrationPattern: [300, 500],
      },
      ios: {
        foregroundPresentationOptions: {
          badge: true,
          sound: true,
          banner: true,
          list: true,
        },
        sound: 'default',
      },
    });

    console.log('✅ Background notification displayed successfully');
  } catch (error) {
    console.error('❌ Error displaying background notification:', error);
  }
});

AppRegistry.registerComponent(appName, () => App);
