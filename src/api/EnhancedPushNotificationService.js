import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import StorageUtility from '../utility/StorageUtility';
import ColorCode from '../utility/ColorCode';
import { Platform, PermissionsAndroid } from 'react-native';
import ServerPushNotificationAPI from './ServerPushNotificationAPI';

class EnhancedPushNotificationService {
  constructor() {
    this.isInitialized = false;
    this.deviceToken = null;
    this.userId = null;
    this.notificationListeners = [];
    this.backgroundMessageHandler = null;
    this.displayedNotificationIds = new Set(); // Track displayed notifications to prevent duplicates
  }

  // Initialize the complete push notification system
  async initialize() {
    try {
      console.log('🚀 Initializing Enhanced Push Notification Service...');

      // Step 1: Request permissions
      await this.requestPermissions();

      // Step 2: Create notification channels
      await this.createNotificationChannels();

      // Step 3: Get user data
      await this.setupUserData();

      // Step 4: Get and store device token
      await this.setupDeviceToken();

      // Step 5: Set up all notification listeners
      await this.setupNotificationListeners();

      // Step 6: Set up background message handler
      await this.setupBackgroundMessageHandler();

      this.isInitialized = true;
      console.log('✅ Enhanced Push Notification Service initialized successfully');

      return true;
    } catch (error) {
      console.error('❌ Error initializing Enhanced Push Notification Service:', error);
      return false;
    }
  }

  // Request notification permissions
  async requestPermissions() {
    try {
      console.log('🔐 Requesting notification permissions...');

      if (Platform.OS === 'ios') {
        try {
          const authStatus = await messaging().requestPermission({
            alert: true,
            announcement: false,
            badge: true,
            carPlay: false,
            criticalAlert: false,
            provisional: false,
            sound: true,
          });

          const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

          if (enabled) {
            console.log('✅ iOS notification permissions granted');
            try {
              await messaging().registerDeviceForRemoteMessages();
            } catch (regError) {
              console.log('⚠️ registerDeviceForRemoteMessages failed:', regError.message);
            }
          } else {
            console.log('❌ iOS notification permissions denied');
          }
        } catch (authError) {
          if (authError.message.includes('unregistered')) {
            console.log('ℹ️ requestPermission skipped: device not registered (likely simulator)');
          } else {
            console.error('❌ Error in iOS requestPermission:', authError);
          }
        }
      } else if (Platform.OS === 'android') {
        // For Android 13+ (API level 33+)
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Notification Permission',
              message: 'This app needs notification permission to send you important updates.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('✅ Android notification permissions granted');
          } else {
            console.log('❌ Android notification permissions denied');
          }
        }
        await messaging().registerDeviceForRemoteMessages();
      }
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
    }
  }

  // Create notification channels for Android
  async createNotificationChannels() {
    try {
      if (Platform.OS === 'android') {
        console.log('📱 Creating notification channels...');

        // Main notification channel
        await notifee.createChannel({
          id: 'gce_education',
          name: 'GCE Education',
          sound: 'default',
          importance: AndroidImportance.HIGH,
          vibration: true,
          vibrationPattern: [300, 500],
          lights: true,
          lightColor: ColorCode.primary,
        });

        // Assignment notifications channel
        await notifee.createChannel({
          id: 'assignments',
          name: 'Assignments',
          sound: 'default',
          importance: AndroidImportance.HIGH,
          vibration: true,
          vibrationPattern: [300, 500],
        });

        // Quiz notifications channel
        await notifee.createChannel({
          id: 'quizzes',
          name: 'Quizzes',
          sound: 'default',
          importance: AndroidImportance.HIGH,
          vibration: true,
          vibrationPattern: [300, 500],
        });

        // General notifications channel
        await notifee.createChannel({
          id: 'general',
          name: 'General',
          sound: 'default',
          importance: AndroidImportance.DEFAULT,
          vibration: true,
        });

        console.log('✅ Notification channels created successfully');
      }
    } catch (error) {
      console.error('❌ Error creating notification channels:', error);
    }
  }

  // Setup user data
  async setupUserData() {
    try {
      const user = await StorageUtility.getUser();
      if (user && user.id) {
        this.userId = user.id;
        console.log('👤 User ID set:', this.userId);
      } else {
        console.log('⚠️ No user data available');
      }
    } catch (error) {
      console.error('❌ Error setting up user data:', error);
    }
  }

  // Setup device token
  async setupDeviceToken() {
    try {
      console.log('📱 Getting device token...');

      try {
        console.log('📱 Registering for remote messages...');
        await messaging().registerDeviceForRemoteMessages();
        this.deviceToken = await messaging().getToken();
      } catch (tokenError) {
        const errorMsg = tokenError?.message || '';
        if (
          errorMsg.includes('unregistered') ||
          errorMsg.includes('NOT_AVAILABLE') ||
          errorMsg.includes('aps-environment')
        ) {
          console.log('ℹ️ Push notifications not available (likely on simulator):', errorMsg);
          return;
        }
        throw tokenError;
      }

      if (this.deviceToken) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📱 FCM DEVICE TOKEN (Copy for testing):');
        console.log(this.deviceToken);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        await StorageUtility.storeDeviceToken(this.deviceToken);

        // Register device with server
        await this.registerDeviceWithServer();
      } else {
        console.log('❌ No device token received');
      }
    } catch (error) {
      console.error('❌ Error in setupDeviceToken:', error);
    }
  }

  // Register device with server
  async registerDeviceWithServer() {
    try {
      console.log('📡 Registering device with server...');

      const result = await ServerPushNotificationAPI.registerDevice();

      if (result.success) {
        console.log('✅ Device registered with server successfully');
      } else {
        console.log('❌ Failed to register device with server:', result.error);

        // Log the full detail for simpler debugging
        if (typeof result.error === 'string' && result.error.includes('{')) {
          console.log('🔍 Server Error Detail:', result.error);
        }

        // Trigger fallback sync via profile for ANY failure (including 422, 404, etc.)
        console.log('🔄 Attempting fallback synchronization via profile...');
        await ServerPushNotificationAPI.syncTokenViaProfile();
      }
    } catch (error) {
      const errorMsg = error?.message || '';
      if (errorMsg.includes('aps-environment')) {
        console.log('ℹ️ Registration skipped: missing entitlement (likely simulator)');
      } else {
        console.error('❌ Error registering device with server:', error);
      }
    }
  }

  // Setup all notification listeners
  async setupNotificationListeners() {
    try {
      console.log('🔔 Setting up notification listeners...');

      // 1. Token refresh listener
      const tokenRefreshListener = messaging().onTokenRefresh(async (token) => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔄 FCM TOKEN REFRESHED (Copy for testing):');
        console.log(token);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        this.deviceToken = token;
        await StorageUtility.storeDeviceToken(token);
        await this.registerDeviceWithServer();
      });
      this.notificationListeners.push(tokenRefreshListener);

      // 2. Foreground message listener
      const foregroundListener = messaging().onMessage(async (remoteMessage) => {
        console.log('📱 [EnhancedPushNotificationService] Foreground message received:', remoteMessage);
        console.log('📱 [EnhancedPushNotificationService] Has notification?', !!remoteMessage.notification);
        console.log('📱 [EnhancedPushNotificationService] Message data:', remoteMessage.data);
        await this.handleForegroundNotification(remoteMessage);
      });
      this.notificationListeners.push(foregroundListener);
      console.log('✅ [EnhancedPushNotificationService] Foreground listener registered');

      // 3. Background/quit state message listener
      const backgroundListener = messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log('📱 App opened from background notification:', remoteMessage);
        this.handleNotificationNavigation(remoteMessage);
      });
      this.notificationListeners.push(backgroundListener);

      // 4. Check if app was opened from notification
      const initialNotification = await messaging().getInitialNotification();
      if (initialNotification) {
        console.log('📱 App opened from quit state notification:', initialNotification);
        this.handleNotificationNavigation(initialNotification);
      }

      // 5. Notifee foreground event listener
      const notifeeListener = notifee.onForegroundEvent(({ type, detail }) => {
        console.log('🔔 Notifee foreground event:', type, detail);

        switch (type) {
          case EventType.PRESS:
            console.log('📱 [EnhancedPushNotificationService] User pressed notification:', detail.notification);
            if (this.backgroundMessageHandler) {
              this.backgroundMessageHandler(detail.notification);
            }
            break;

          case EventType.DISMISSED:
            console.log('📱 [EnhancedPushNotificationService] User dismissed notification');
            break;

          case EventType.ACTION_PRESS:
            console.log('📱 [EnhancedPushNotificationService] User pressed action button:', detail.pressAction?.id);
            break;
        }
      });
      this.notificationListeners.push(notifeeListener);

      console.log('✅ Notification listeners set up successfully');
    } catch (error) {
      console.error('❌ Error setting up notification listeners:', error);
    }
  }

  // Setup background message handler
  // NOTE: Background message handler must be set up in index.js before app starts
  // This method is kept for reference but the actual handler is in index.js
  async setupBackgroundMessageHandler() {
    try {
      console.log('🔄 Background message handler should be set up in index.js');
      console.log('✅ Background message handler is configured in index.js');
      // Background message handler is set up in index.js to ensure it's registered
      // before the app starts, which is required by React Native Firebase
    } catch (error) {
      console.error('❌ Error in setupBackgroundMessageHandler:', error);
    }
  }

  // Handle foreground notifications
  // Display notification globally (works even when Notification screen is not mounted)
  async handleForegroundNotification(remoteMessage) {
    try {
      console.log('🔔 [EnhancedPushNotificationService] Handling foreground notification:', remoteMessage.messageId);

      // Extract title and body from either notification or data block
      const notification = remoteMessage.notification || {};
      const data = remoteMessage.data || {};

      const title = notification.title || data.title || data.notification_title || data.nt_title || data.subject || '';
      const body = notification.body || data.body || data.notification_body || data.description || data.message || data.text || data.content || data.nt_body || '';

      if (!title && !body) {
        console.log('ℹ️ [EnhancedPushNotificationService] Skipping foreground notification: no title/body in payload');
        return;
      }

      // Prevent duplicates using messageId
      const notificationId = remoteMessage.messageId ||
        `${title}_${body}_${Date.now()}`;

      if (this.displayedNotificationIds.has(notificationId)) {
        console.log('⚠️ [EnhancedPushNotificationService] Duplicate detected, skipping');
        return;
      }

      this.displayedNotificationIds.add(notificationId);
      console.log('✅ [EnhancedPushNotificationService] Displaying notification:', title);

      // Display notification
      await this.displayNotification(
        title,
        body,
        data,
        this.getChannelId(data?.type)
      );

      // Clean up after 5 minutes
      setTimeout(() => {
        this.displayedNotificationIds.delete(notificationId);
      }, 5 * 60 * 1000);

      // Update notification badge
      await this.updateNotificationBadge(1);
    } catch (error) {
      console.error('❌ Error handling foreground notification:', error);
    }
  }

  // Display notification
  async displayNotification(title, body, data = {}, channelId = 'gce_education') {
    try {
      console.log('🔔 Displaying notification:', title, body);

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
          importance: AndroidImportance.HIGH,
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

      console.log('✅ Notification displayed successfully');
    } catch (error) {
      console.error('❌ Error displaying notification:', error);
    }
  }

  // Get channel ID based on notification type
  getChannelId(type) {
    switch (type) {
      case 'assignment':
        return 'assignments';
      case 'quiz':
        return 'quizzes';
      default:
        return 'general';
    }
  }

  // Handle notification navigation
  handleNotificationNavigation(remoteMessage) {
    try {
      console.log('🧭 EnhancedPushNotificationService: Handling notification navigation:', remoteMessage);

      // Import navigation service
      const { navigationRef } = require('../utility/NavigationService');
      const { CommonActions } = require('@react-navigation/native');

      // Keep retrying until navigation is ready, then force open Notification screen.
      const navigateToNotification = () => {
        if (navigationRef.isReady()) {
          console.log('✅ Navigating to Notification screen');
          navigationRef.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [
                { name: 'TabStack' },
                { name: 'Notification', params: { course_name: '' } },
              ],
            }),
          );
        } else {
          setTimeout(navigateToNotification, 500);
        }
      };

      setTimeout(navigateToNotification, 300);
    } catch (error) {
      console.error('❌ Error handling notification navigation:', error);
    }
  }

  // Update notification badge count
  async updateNotificationBadge(increment = 1) {
    try {
      const currentCount = await StorageUtility.getNotifCount();
      const newCount = Math.max(0, Number(currentCount || 0) + increment);
      await StorageUtility.setNotifCount(newCount);
      console.log('🔢 Updated notification badge count:', newCount);
    } catch (error) {
      console.error('❌ Error updating notification badge:', error);
    }
  }

  // Test notification
  async testNotification() {
    try {
      console.log('🧪 Testing enhanced push notification...');

      await this.displayNotification(
        'Push Notification Test',
        'This is a test notification to verify the enhanced push notification system is working correctly.',
        {
          type: 'test',
          timestamp: Date.now().toString()
        },
        'general'
      );

      console.log('✅ Test notification sent successfully');
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
    }
  }

  // Send notification to specific user
  async sendNotificationToUser(userId, title, body, data = {}) {
    try {
      console.log('📤 Sending notification to user:', userId);

      const result = await ServerPushNotificationAPI.sendPushNotification(title, body, {
        ...data,
        targetUserId: userId
      });

      if (result.success) {
        console.log('✅ Notification sent to user successfully');
      } else {
        console.log('❌ Failed to send notification to user:', result.error);
      }

      return result;
    } catch (error) {
      console.error('❌ Error sending notification to user:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if service is ready
  isServiceReady() {
    return this.isInitialized && this.deviceToken;
  }

  // Get device token
  getDeviceToken() {
    return this.deviceToken;
  }

  // Get user ID
  getUserId() {
    return this.userId;
  }

  // Cleanup function
  cleanup() {
    try {
      console.log('🧹 Cleaning up Enhanced Push Notification Service...');

      // Remove all listeners
      this.notificationListeners.forEach(listener => {
        if (typeof listener === 'function') {
          listener();
        }
      });

      this.notificationListeners = [];
      this.isInitialized = false;

      console.log('✅ Enhanced Push Notification Service cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up Enhanced Push Notification Service:', error);
    }
  }
}

export default new EnhancedPushNotificationService(); 
