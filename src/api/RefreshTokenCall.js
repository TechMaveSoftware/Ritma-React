import { CommonActions } from '@react-navigation/native';
import axios from 'axios';
import ConstData from '../utility/ConstData';
import StorageUtility from '../utility/StorageUtility';
import ToastUtility from '../utility/ToastUtility';
import GetCall from './GetCall';
import PostCall from './PostCall';
import { navigationRef } from '../utility/NavigationService';

// const axios = require('axios');
const instance = axios.create({
  baseURL: ConstData.Base_Path,
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(async request => {
  console.log('Api Method', '=========POST =========');
  console.log('Starting Request', request.url);

  var token = await StorageUtility.getJWTToken();
  console.log('JWT TOKEN=>', token);

  request.headers.Authorization = `Bearer ${token}`;

  console.log('Headers', request.headers);
  return request;
});

instance.interceptors.response.use(response => {
  console.log('Response Status:', response.status);
  return response;
});

const RefreshEndPoint = 'refresh-token';

// Global timer reference to prevent multiple timers
let logoutTimer = null;

// Function to handle auto-logout when status is 0
const handleAutoLogout = async () => {
  try {
    console.log('🔄 Auto-logout triggered - User status is 0');

    // Clear any existing timer
    if (logoutTimer) {
      clearTimeout(logoutTimer);
      logoutTimer = null;
    }

    // Show notification to user
    ToastUtility.showToast('Your account has been deactivated. Logging out in 30 seconds...');

    // Set 30-second timer before logout
    logoutTimer = setTimeout(async () => {
      try {
        console.log('🚪 Executing auto-logout...');

        // Clear storage
        await StorageUtility.logout();

        // Navigate to AuthStack
        if (navigationRef.isReady()) {
          navigationRef.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'AuthStack' }],
            }),
          );
        } else {
          // If navigation not ready, try again after short delay
          setTimeout(() => {
            if (navigationRef.isReady()) {
              navigationRef.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'AuthStack' }],
                }),
              );
            }
          }, 500);
        }

        ToastUtility.showToast('You have been logged out');
        console.log('✅ Auto-logout completed');
      } catch (error) {
        console.error('❌ Error during auto-logout:', error);
      } finally {
        logoutTimer = null;
      }
    }, 30000); // 30 seconds = 30000 milliseconds

    console.log('⏱️ Auto-logout timer set for 30 seconds');
  } catch (error) {
    console.error('❌ Error setting up auto-logout:', error);
  }
};

// Function to check user status in response and trigger auto-logout if needed
const checkUserStatus = (responseData) => {
  try {
    if (!responseData || typeof responseData !== 'object') {
      return false;
    }

    // Check if response contains user data with status field
    // The response might have user data at different levels depending on API structure
    let userData = null;

    // Priority 1: Check for nested user objects
    if (responseData.user) {
      userData = responseData.user;
    } else if (responseData.userDetail) {
      userData = responseData.userDetail;
    } else if (responseData.data) {
      // Priority 2: Check inside data object
      if (responseData.data.user) {
        userData = responseData.data.user;
      } else if (responseData.data.userDetail) {
        userData = responseData.data.userDetail;
      } else if (typeof responseData.data === 'object' && 'status' in responseData.data) {
        // If the response data itself has status (like in the image description)
        userData = responseData.data;
      }
    }

    // Priority 3: Check if status is at top level of response (along with access_token)
    // This handles cases where refresh token returns user data directly in response
    if (!userData && 'status' in responseData) {
      // Use top-level status if response contains user-related fields
      // The refresh token API might return user data directly in the response
      if ('mobile' in responseData ||
        'email' in responseData ||
        'class' in responseData ||
        'photo' in responseData ||
        'course' in responseData) {
        userData = responseData;
      }
    }

    // Check status if userData found
    if (userData && 'status' in userData) {
      const status = userData.status;
      console.log('📊 User status check:', status);

      // Check if status is 0 (could be number 0 or string "0")
      if (status === 0 || status === '0') {
        console.log('⚠️ User status is 0 - triggering auto-logout');
        handleAutoLogout();
        return true; // Status is 0
      } else {
        // If status is not 0, clear any existing logout timer
        if (logoutTimer) {
          clearTimeout(logoutTimer);
          logoutTimer = null;
          console.log('✅ User status is active, cleared logout timer');
        }
      }
    }

    return false; // Status is not 0 or status not found
  } catch (error) {
    console.error('❌ Error checking user status:', error);
    return false;
  }
};

export default {
  refreshPostToken: async (endpoint, data, pass, fail, params = null) => {
    console.log('Api EndPoint', RefreshEndPoint);

    if (params != null) {
      endpoint = endpoint + params;
    }
    var user = await StorageUtility.getUser();
    let post = { email: user.email };

    instance
      .post(RefreshEndPoint, post)
      .then(async function (response) {
        // Check user status in response - this will trigger auto-logout if status is 0
        checkUserStatus(response.data);

        // pass(response.data);
        if (response.data.access_token) {
          await StorageUtility.storeJWTToken(response.data.access_token);
          PostCall.Post(endpoint, data, pass, fail, params);
        } else {
          // if (
          //   response.data.status == 404 &&
          //   response.data.message.includes('User not found')
          // ) {
          // await StorageUtility.logout();
          // ToastUtility.showToast('post no user');
          fail(response.data);
          // nav.replace('AuthStack');
          // nav.dispatch(
          //   CommonActions.reset({
          //     index: 0,
          //     routes: [{name: 'AuthStack'}],
          //   }),
          // );
          // }
        }
      })
      .catch(function (error) {
        console.log(RefreshEndPoint, 'Error:->', error);
        fail(error);
      });
  },

  refreshGetToken: async (endpoint, pass, fail, params = null) => {
    console.log('Api EndPoint', RefreshEndPoint);

    var user = await StorageUtility.getUser();
    let post = { email: user.email };
    // let post = {email: 'xyz@yopmail.com'};

    instance
      .post(RefreshEndPoint, post)
      .then(async function (response) {
        // Check user status in response - this will trigger auto-logout if status is 0
        checkUserStatus(response.data);

        if (response.data.access_token) {
          await StorageUtility.storeJWTToken(response.data.access_token);
          GetCall.Get(endpoint, pass, fail, params);
        } else {
          // if (
          //   response.data.status == 404 &&
          //   response.data.message.includes('User not found')
          // ) {
          // await StorageUtility.logout();
          fail(response.data);
          // nav.replace('AuthStack');
          // ToastUtility.showToast('get no user');
          // nav.dispatch(
          //   CommonActions.reset({
          //     index: 0,
          //     routes: [{name: 'AuthStack'}],
          //   }),
          // );
          // }
        }
        // pass(response.data);
        // if(response.status == 200){
        //   GetCall.Get(endpoint, pass, fail, params);
        // }
      })
      .catch(function (error) {
        console.log(RefreshEndPoint, 'Error:->', error);
        fail(error);
      });
  },
};
