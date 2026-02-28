import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import StorageUtility from '../utility/StorageUtility';
import ColorCode from '../utility/ColorCode';
import { Platform } from 'react-native';
import ServerPushNotificationAPI from './ServerPushNotificationAPI';

class AutoPushNotificationService {
  constructor() {
    this.isInitialized = false;
    this.deviceToken = null;
    this.userId = null;
  }

  // Initialize the service
  async initialize() {
    try {
      console.log('🚀 Initializing Auto Push Notification Service...');

      // Get user data
      const user = await StorageUtility.getUser();
      if (user && user.id) {
        this.userId = user.id;
        console.log('👤 User ID:', this.userId);
      }

      // Get device token
      if (Platform.OS === 'ios') {
        try {
          await messaging().registerDeviceForRemoteMessages();
        } catch (e) {
          console.log('⚠️ registerDeviceForRemoteMessages skipped or failed:', e.message);
        }
      }

      try {
        this.deviceToken = await messaging().getToken();
      } catch (tokenError) {
        if (tokenError.message.includes('unregistered') || tokenError.message.includes('NOT_AVAILABLE')) {
          console.log('ℹ️ Push notifications not available (likely on simulator)');
          return;
        }
        throw tokenError;
      }

      if (this.deviceToken) {
        console.log('📱 Device Token:', this.deviceToken);
        await StorageUtility.storeDeviceToken(this.deviceToken);

        // Send device token to server for push notifications
        await this.registerDeviceForPushNotifications();
      }

      // Set up listeners
      this.setupNotificationListeners();

      // Start periodic notification checking (disabled for now to prevent network errors)
      // this.startPeriodicNotificationCheck();

      this.isInitialized = true;
      console.log('✅ Auto Push Notification Service initialized successfully');

    } catch (error) {
      console.error('❌ Error initializing Auto Push Notification Service:', error);
    }
  }

  // Register device with server for push notifications
  async registerDeviceForPushNotifications() {
    try {
      console.log('📡 Registering device for push notifications...');

      const result = await ServerPushNotificationAPI.registerDevice();

      if (result.success) {
        console.log('✅ Device registered for push notifications');
      } else {
        console.log('❌ Failed to register device for push notifications:', result.error);
      }

    } catch (error) {
      console.error('❌ Error registering device for push notifications:', error);
    }
  }

  // Set up notification listeners
  setupNotificationListeners() {
    // Listen for token refresh
    messaging().onTokenRefresh(async (token) => {
      console.log('🔄 FCM Token refreshed:', token);
      this.deviceToken = token;
      await StorageUtility.storeDeviceToken(token);
      await this.registerDeviceForPushNotifications();
    });

    // Listen for foreground messages
    messaging().onMessage(async (remoteMessage) => {
      console.log('📱 Foreground message received:', remoteMessage);
      await this.handleIncomingNotification(remoteMessage);
    });

    // Listen for background/quit state messages
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('📱 App opened from background notification:', remoteMessage);
      this.handleNotificationNavigation(remoteMessage);
    });

    // Check if app was opened from a notification
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('📱 App opened from quit state notification:', remoteMessage);
          this.handleNotificationNavigation(remoteMessage);
        }
      });

    // Listen for background notifications (when app is closed)
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('📱 Background message received:', remoteMessage);

      // Display notification even when app is in background
      if (remoteMessage.notification) {
        await this.displayNotification(
          remoteMessage.notification.title || 'New Notification',
          remoteMessage.notification.body || 'You have a new notification',
          remoteMessage.data || {}
        );
      }
    });

    // Listen for notifee notification press events
    notifee.onForegroundEvent(({ type, detail }) => {
      console.log('🔔 Notifee foreground event:', type, detail);

      switch (type) {
        case 1: // EventType.PRESS
          console.log('📱 User pressed notification:', detail.notification);
          if (detail.notification && detail.notification.data) {
            this.handleNotificationNavigation({
              data: detail.notification.data,
              notification: detail.notification
            });
          }
          break;
        case 2: // EventType.DISMISSED
          console.log('📱 User dismissed notification');
          break;
      }
    });
  }

  // Handle incoming notifications
  // NOTE: Notification display is handled by Notification.js screen to prevent duplicates
  // This service only handles token management and other non-display functionality
  async handleIncomingNotification(remoteMessage) {
    try {
      console.log('🔔 [AutoPushNotificationService] Incoming notification received (display handled by Notification screen):', remoteMessage);

      if (remoteMessage.notification) {
        // Don't display notification here - it's handled by Notification.js screen
        // Only update notification badge
        await this.updateNotificationBadge(1);
      }

    } catch (error) {
      console.error('❌ Error handling incoming notification:', error);
    }
  }

  // Display notification
  async displayNotification(title, body, data = {}) {
    try {
      console.log('🔔 Displaying notification:', title, body);

      await notifee.displayNotification({
        title: title,
        body: body,
        data: data,
        android: {
          channelId: 'gce_education',
          smallIcon: 'ic_launcher',
          color: ColorCode.primary,
          pressAction: {
            id: 'default',
          },
          importance: 4,
          showTimestamp: true,
          timestamp: Date.now(),
        },
        ios: {
          foregroundPresentationOptions: {
            badge: true,
            sound: true,
            banner: true,
            list: true,
          },
        },
      });

    } catch (error) {
      console.error('❌ Error displaying notification:', error);
    }
  }

  // Handle notification navigation
  handleNotificationNavigation(remoteMessage) {
    try {
      console.log('🧭 AutoPushNotificationService: Handling notification navigation:', remoteMessage);

      // Import navigation service
      const { navigate } = require('../utility/NavigationService');

      // Wait a bit to ensure navigation is ready, then navigate to Notification screen
      setTimeout(() => {
        console.log('✅ Navigating to Notification screen');
        navigate('Notification', {
          course_name: '',
        });
      }, 300);
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

  // Test notification (for debugging)
  async testNotification() {
    try {
      console.log('🧪 Testing auto push notification...');

      await this.displayNotification(
        'Push Notification Test',
        'This is a test notification to verify the push notification system is working correctly.',
        {
          type: 'test',
          timestamp: Date.now().toString()
        }
      );

      console.log('✅ Test notification sent successfully');
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
    }
  }

  // Check if service is initialized
  isServiceReady() {
    return this.isInitialized && this.deviceToken;
  }

  // Get device token
  getDeviceToken() {
    return this.deviceToken;
  }

  // Start periodic notification checking
  startPeriodicNotificationCheck() {
    try {
      console.log('⏰ Starting periodic notification check...');

      // Check for new notifications every 5 minutes
      this.notificationInterval = setInterval(async () => {
        try {
          console.log('🔍 Checking for new notifications...');

          // Use your existing API method instead of fetch
          const ApiMethod = require('./ApiMethod').default;

          ApiMethod.getNotification(
            async (pass) => {
              if (pass.status == 200 && pass.data) {
                const notifications = pass.data;

                // Check if there are new notifications
                const storedNotifications = await StorageUtility.getNotifications();
                const newNotifications = notifications.filter(notification =>
                  !storedNotifications.some(stored => stored.id === notification.id)
                );

                if (newNotifications.length > 0) {
                  console.log('🔔 Found new notifications:', newNotifications.length);

                  // Display push notifications for new notifications
                  for (const notification of newNotifications) {
                    await this.displayNotification(
                      notification.title || 'New Notification',
                      notification.description || 'You have a new notification',
                      {
                        type: this.getNotificationType(notification.title),
                        notificationId: notification.id,
                        timestamp: Date.now().toString()
                      }
                    );
                  }

                  // Store new notifications
                  await StorageUtility.saveNotifications(notifications);
                }
              }
            },
            (fail) => {
              console.log('❌ Failed to fetch notifications:', fail);
            }
          );

        } catch (error) {
          console.error('❌ Error checking for new notifications:', error);
        }
      }, 5 * 60 * 1000); // Check every 5 minutes

    } catch (error) {
      console.error('❌ Error starting periodic notification check:', error);
    }
  }

  // Determine notification type based on title
  getNotificationType(title) {
    if (title.includes('Notice')) return 'notice';
    if (title.includes('Grade') || title.includes('Re-upload')) return 'grade';
    if (title.includes('Skill') || title.includes('Attendance')) return 'skill';
    if (title.includes('Chapter')) return 'chapter';
    if (title.includes('Assignment')) return 'assignment';
    if (title.includes('Quiz')) return 'quiz';
    return 'general';
  }

  // Stop periodic notification checking
  stopPeriodicNotificationCheck() {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
      console.log('⏰ Stopped periodic notification check');
    }
  }

  // Cleanup function
  cleanup() {
    this.stopPeriodicNotificationCheck();
    this.isInitialized = false;
    console.log('🧹 Auto Push Notification Service cleaned up');
  }
}

export default new AutoPushNotificationService(); 