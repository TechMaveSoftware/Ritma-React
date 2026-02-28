import ApiMethod from './ApiMethod';
import PostCall from './PostCall';
import StorageUtility from '../utility/StorageUtility';
import { Platform } from 'react-native';

export default {
  // Send push notification to current user
  sendPushNotification: async (title, body, data = {}) => {
    try {
      const user = await StorageUtility.getUser();
      const deviceToken = await StorageUtility.getDeviceToken();

      if (!user || !deviceToken) {
        console.log('❌ User or device token not available');
        return { success: false, error: 'User or device token not available' };
      }

      const formData = new FormData();
      formData.append('user-id', user.id);
      formData.append('device-token', deviceToken);
      formData.append('title', title);
      formData.append('body', body);
      formData.append('platform', Platform.OS);

      if (data) {
        formData.append('data', JSON.stringify(data));
      }

      return new Promise((resolve, reject) => {
        PostCall.Post(
          'send-push-notification',
          formData,
          (response) => {
            console.log('✅ Push notification sent successfully:', response);
            resolve({ success: true, data: response });
          },
          (error) => {
            console.error('❌ Error sending push notification:', error);
            resolve({ success: false, error: error.message });
          }
        );
      });
    } catch (error) {
      console.error('❌ Error in sendPushNotification:', error);
      return { success: false, error: error.message };
    }
  },

  // Send assignment notification
  sendAssignmentNotification: async (assignmentTitle, courseName) => {
    return await this.sendPushNotification(
      'New Assignment Available',
      `New assignment "${assignmentTitle}" has been added to ${courseName}`,
      {
        type: 'assignment',
        assignmentTitle: assignmentTitle,
        courseName: courseName,
        timestamp: Date.now().toString()
      }
    );
  },

  // Send quiz notification
  sendQuizNotification: async (quizTitle, courseName) => {
    return await this.sendPushNotification(
      'New Quiz Available',
      `New quiz "${quizTitle}" is now available in ${courseName}`,
      {
        type: 'quiz',
        quizTitle: quizTitle,
        courseName: courseName,
        timestamp: Date.now().toString()
      }
    );
  },

  // Send general notification
  sendGeneralNotification: async (title, message) => {
    return await this.sendPushNotification(
      title,
      message,
      {
        type: 'general',
        timestamp: Date.now().toString()
      }
    );
  },

  // Register device for push notifications
  registerDevice: async () => {
    try {
      const user = await StorageUtility.getUser();
      const deviceToken = await StorageUtility.getDeviceToken();

      if (!user || !user.id || !deviceToken) {
        console.log('❌ User ID or device token not available for registration:', {
          hasUser: !!user,
          userId: user?.id,
          hasToken: !!deviceToken
        });
        return { success: false, error: 'User ID or device token not available' };
      }

      console.log('📡 Sending registration to server for user:', user.id);
      const formData = new FormData();
      // Send both hyphenated and underscored versions to be safe
      formData.append('user-id', user.id);
      formData.append('user_id', user.id);
      formData.append('userId', user.id);

      formData.append('device-token', deviceToken);
      formData.append('device_token', deviceToken);

      formData.append('platform', Platform.OS);
      formData.append('device_type', Platform.OS);
      formData.append('device-type', Platform.OS);

      // Add capitalized versions as some backends require "iOS" or "Android"
      const capitalizedOS = Platform.OS === 'ios' ? 'iOS' : 'Android';
      formData.append('Platform', capitalizedOS);
      formData.append('DeviceType', capitalizedOS);

      const deviceId = await StorageUtility.getDeviceId();
      if (deviceId) {
        formData.append('device_id', deviceId);
        formData.append('device-id', deviceId);
      }

      formData.append('app-version', '1.0.0');
      formData.append('app_version', '1.0.0');

      return new Promise((resolve, reject) => {
        PostCall.Post(
          'register-device',
          formData,
          (response) => {
            console.log('✅ Device registered successfully:', response);
            resolve({ success: true, data: response });
          },
          (error) => {
            console.error('❌ Server registration failed:', error);
            // Provide full detail in the error result
            const errorMsg = typeof error === 'object' ? JSON.stringify(error) : error;
            resolve({ success: false, error: errorMsg });
          }
        );
      });
    } catch (error) {
      console.error('❌ Error in registerDevice:', error);
      return { success: false, error: error.message };
    }
  },

  // Sync token via profile if dedicated registration fails
  syncTokenViaProfile: async () => {
    try {
      const user = await StorageUtility.getUser();
      const deviceToken = await StorageUtility.getDeviceToken();

      if (!user || !deviceToken) {
        console.log('ℹ️ Sync via profile skipped: user or token missing');
        return { success: false, error: 'User or device token not available' };
      }

      console.log('📡 Synchronizing token via editprofile...');
      const formData = new FormData();
      formData.append('name', user.name || '');
      formData.append('mobile', user.mobile || '');
      formData.append('dial_code', user.dial_code || '+1');

      // Send robust token keys
      formData.append('device-token', deviceToken);
      formData.append('device_token', deviceToken);

      // Also send user ID just in case it's required here
      formData.append('user-id', user.id);
      formData.append('user_id', user.id);

      return new Promise((resolve) => {
        PostCall.Post(
          'editprofile',
          formData,
          (response) => {
            console.log('✅ Token synchronized via profile:', response);
            resolve({ success: true, data: response });
          },
          (error) => {
            console.error('❌ Token sync via profile failed:', error);
            resolve({ success: false, error });
          }
        );
      });
    } catch (error) {
      console.error('❌ Error in syncTokenViaProfile:', error);
      return { success: false, error: error.message };
    }
  },

  // Unregister device from push notifications
  unregisterDevice: async () => {
    try {
      const user = await StorageUtility.getUser();
      const deviceToken = await StorageUtility.getDeviceToken();

      if (!user || !deviceToken) {
        console.log('❌ User or device token not available for unregistration');
        return { success: false, error: 'User or device token not available' };
      }

      const formData = new FormData();
      formData.append('user-id', user.id);
      formData.append('device-token', deviceToken);

      return new Promise((resolve, reject) => {
        PostCall.Post(
          'unregister-device',
          formData,
          (response) => {
            console.log('✅ Device unregistered successfully:', response);
            resolve({ success: true, data: response });
          },
          (error) => {
            console.error('❌ Error unregistering device:', error);
            resolve({ success: false, error: error.message });
          }
        );
      });
    } catch (error) {
      console.error('❌ Error in unregisterDevice:', error);
      return { success: false, error: error.message };
    }
  }
}; 