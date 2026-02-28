import AsyncStorage from '@react-native-async-storage/async-storage';
import ToastUtility from './ToastUtility';

export default {
  storeDeviceId: async deviceId => {
    // ToastUtility.showToast(JSON.stringify(user));
    try {
      console.log('Saving Device Id', deviceId);
      await AsyncStorage.setItem('device_id', deviceId);
      console.log('Saved device Id');
    } catch (e) {
      console.log('storeUser Storage error', e);
    }
  },
  getDeviceId: async () => {
    try {
      const user = await AsyncStorage.getItem('device_id');
      if (user) {
        return user;
      } else {
        return null;
      }
      // return user != null ? JSON.parse(user) : null;
    } catch (e) {
      console.log('getUser Storage error', e);
      return null;
    }
  },
  storeDeviceToken: async deviceId => {
    try {
      console.log('💾 Saving device_token to AsyncStorage:', deviceId);
      await AsyncStorage.setItem('device_token', deviceId);
      console.log('✅ Device token saved successfully to AsyncStorage');
    } catch (e) {
      console.error('❌ Device token storage error:', e);
    }
  },
  getDeviceToken: async () => {
    try {
      console.log('🔍 Retrieving device_token from AsyncStorage...');
      const user = await AsyncStorage.getItem('device_token');
      if (user) {
        console.log('📱 Device token retrieved from AsyncStorage:', user);
        return user;
      } else {
        console.log('❌ No device token found in AsyncStorage');
        return '';
      }
    } catch (e) {
      console.error('❌ Device token retrieval error:', e);
      return '';
    }
  },
  storeSkipDoc: async value => {
    try {
      console.log('Saving storeSkipDoc', value);
      await AsyncStorage.setItem('skip_doc_upload', value);
      console.log('Saved storeSkipDoc');
    } catch (e) {
      console.log('storeSkipDoc Storage error', e);
    }
  },
  checkSkipDoc: async () => {
    try {
      const value = await AsyncStorage.getItem('skip_doc_upload');
      if (value) {
        console.log('get storeSkipDoc', value);
        return value;
      } else {
        return '';
      }
    } catch (e) {
      console.log('checkSkipDoc Storage error', e);
      return '';
    }
  },
  storeSkipDocVerify: async value => {
    try {
      console.log('Saving storeSkipDocVerify', value);
      await AsyncStorage.setItem('skip_doc_verify', value);
      console.log('Saved storeSkipDocVerify');
    } catch (e) {
      console.log('storeSkipDocVerify Storage error', e);
    }
  },
  checkSkipDocVerify: async () => {
    try {
      const value = await AsyncStorage.getItem('skip_doc_verify');
      if (value) {
        console.log('get checkSkipDocVerify', value);
        return value;
      } else {
        return '';
      }
    } catch (e) {
      console.log('checkSkipDoc Storage error', e);
      return '';
    }
  },
  storeJWTToken: async deviceId => {
    try {
      console.log('Saving jwt_token', deviceId);
      await AsyncStorage.setItem('jwt_token', deviceId);
      console.log('Saved jwt_token');
    } catch (e) {
      console.log('jwt_token Storage error', e);
    }
  },
  getJWTToken: async () => {
    try {
      const user = await AsyncStorage.getItem('jwt_token');
      if (user) {
        return user;
      } else {
        return null;
      }
      // return user != null ? JSON.parse(user) : null;
    } catch (e) {
      console.log('jwt_token Storage error', e);
      return null;
    }
  },
  storeProfilePath: async deviceId => {
    try {
      console.log('Saving profile_path', deviceId);
      await AsyncStorage.setItem('profile_path', deviceId);
      console.log('Saved profile_path');
    } catch (e) {
      console.log('profile_path Storage error', e);
    }
  },
  getProfilePath: async () => {
    try {
      const user = await AsyncStorage.getItem('profile_path');
      if (user) {
        return user;
      } else {
        return '';
      }
      // return user != null ? JSON.parse(user) : null;
    } catch (e) {
      console.log('profile_path Storage error', e);
      return '';
    }
  },
  storeUserType: async deviceId => {
    try {
      console.log('Saving user_type', deviceId);
      await AsyncStorage.setItem('user_type', `${deviceId}`);
      console.log('Saved user_type');
    } catch (e) {
      console.log('user_type Storage error', e);
    }
  },
  getUserType: async () => {
    try {
      const user = await AsyncStorage.getItem('user_type');
      if (user) {
        return user;
      } else {
        return '';
      }
      // return user != null ? JSON.parse(user) : null;
    } catch (e) {
      console.log('user_type Storage error', e);
      return '';
    }
  },
  storeUser: async user => {
    // ToastUtility.showToast(JSON.stringify(user));
    try {
      const jsonValue = JSON.stringify(user);
      console.log('Saving User', jsonValue);
      await AsyncStorage.setItem('user', jsonValue);
      console.log('Saved User');
    } catch (e) {
      console.log('storeUser Storage error', e);
    }
  },
  storePassword: async password => {
    try {
      console.log('Saving password', password);
      await AsyncStorage.setItem('user_password', password);
      console.log('Saved User password');
    } catch (e) {
      console.log('storeUser password Storage error', e);
    }
  },
  getUser: async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const jsonValue = JSON.parse(user);
        return jsonValue;
      } else {
        return null;
      }
      // return user != null ? JSON.parse(user) : null;
    } catch (e) {
      console.log('getUser Storage error', e);
      return null;
    }
  },
  getPassword: async () => {
    try {
      const pass = await AsyncStorage.getItem('user_password');
      return pass;
    } catch (e) {
      console.log('getUser pass Storage error', e);
      return '';
    }
  },

  storeLoginEmail: async email => {
    try {
      console.log('Saving login email', email);
      await AsyncStorage.setItem('login_email', email);
      console.log('Saved login email');
    } catch (e) {
      console.log('storeLoginEmail Storage error', e);
    }
  },

  getLoginEmail: async () => {
    try {
      const email = await AsyncStorage.getItem('login_email');
      return email;
    } catch (e) {
      console.log('getLoginEmail Storage error', e);
      return '';
    }
  },

  clearSavedCredentials: async () => {
    try {
      await AsyncStorage.removeItem('user_password');
      await AsyncStorage.removeItem('login_email');
      console.log('Cleared saved credentials');
    } catch (e) {
      console.log('clearSavedCredentials Storage error', e);
    }
  },

  setShowIntro: async () => {
    try {
      await AsyncStorage.setItem('show_intro', '1');
      console.log('Saved User Intro');
    } catch (e) {
      console.log('Storage error Intro', e);
    }
  },
  getShowIntro: async () => {
    try {
      const pass = await AsyncStorage.getItem('show_intro');
      return pass;
    } catch (e) {
      console.log('getUser pass Storage error', e);
      return '0';
    }
  },

  setSession: async () => {
    try {
      await AsyncStorage.setItem('session', '1');
      console.log('Saved User Intro');
    } catch (e) {
      console.log('Storage error Intro', e);
    }
  },
  getSession: async () => {
    try {
      const pass = await AsyncStorage.getItem('session');
      return pass;
    } catch (e) {
      console.log('getUser pass Storage error', e);
      return '0';
    }
  },

  saveNotifications: async data => {
    try {
      console.log('Data', data);

      var notif1 = await AsyncStorage.getItem('notif_list');
      console.log('notif getItem', notif1);

      let notif;
      if (notif1) {
        console.log('notif getItem-11');
        notif = JSON.parse(notif1);
        // notif.push(data);
      } else {
        console.log('notif getItem-22');
        notif = [];
        // notif.push(data);
      }
      notif.push(data);

      await AsyncStorage.setItem('notif_list', JSON.stringify(notif));
      console.log('Saved Notification Intro');

      var notifCount = await AsyncStorage.getItem('notif_count');
      console.log('notif_count getItem', notifCount);

      let count = 0;
      if (notifCount) {
        count = Number(notifCount) + 1;
      } else {
        count = 1;
      }
      await AsyncStorage.setItem('notif_count', `${count}`);
      console.log('Saved Notification Count');
    } catch (e) {
      console.log('Storage error Intro', e);
    }
  },

  getNotifications: async () => {
    try {
      const pass = await AsyncStorage.getItem('notif_list');
      console.log('notif getItem', pass);
      if (pass) {
        return JSON.parse(pass);
      } else {
        return JSON.parse('[]');
      }
    } catch (e) {
      console.log('getNotifications pass Storage error', e);
      return JSON.parse('[]');
    }
  },

  setNotifCount: async count => {
    await AsyncStorage.setItem('notif_count', `${count}`);
    console.log('Saved Notification Count');
  },

  getNotifCount: async () => {
    try {
      const pass = await AsyncStorage.getItem('notif_count');
      console.log('notif_count getItem', pass);
      if (pass) {
        return pass;
      } else {
        return '0';
      }
    } catch (e) {
      console.log('getNotifCount pass Storage error', e);
      return JSON.parse('[]');
    }
  },

  setUploadDocPopup: async () => {
    try {
      await AsyncStorage.setItem('uploa_doc_popup', '1');
      console.log('Saved uploa_doc_popup');
    } catch (e) {
      console.log('Storage error uploa_doc_popup', e);
    }
  },
  getUploadDocPopup: async () => {
    try {
      const pass = await AsyncStorage.getItem('uploa_doc_popup');
      return pass;
    } catch (e) {
      console.log('uploa_doc_popup Storage error', e);
      return '0';
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('user_type');
      // await AsyncStorage.removeItem('session');
      await AsyncStorage.removeItem('jwt_token');
      await AsyncStorage.removeItem('skip_doc_upload');
      await AsyncStorage.removeItem('skip_doc_verify');
      // Don't remove password and login_email here - let them persist for "Remember Me" functionality
      // await AsyncStorage.removeItem('user_password');
      // await AsyncStorage.removeItem('login_email');

      console.log('getlogoutUser Storage Empty');
    } catch (e) {
      console.log('getlogoutUser Storage error', e);
    }
  },
};
