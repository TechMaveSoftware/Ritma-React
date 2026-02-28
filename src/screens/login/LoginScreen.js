import React, { useEffect, useState } from 'react';
import {
  Linking,
  SafeAreaView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Provider } from 'react-native-paper';
import Entypo from 'react-native-vector-icons/Entypo';
import ApiMethod from '../../api/ApiMethod';
import CustomButton from '../../compenents/CustomButton';
import CustomProgress from '../../compenents/CustomProgress';
import height from '../../Units/height';
import width from '../../Units/width';
import ColorCode from '../../utility/ColorCode';
import ConstData from '../../utility/ConstData';
import Fonts from '../../utility/Fonts';
import StorageUtility from '../../utility/StorageUtility';
import ToastUtility from '../../utility/ToastUtility';
import VersionCheck from 'react-native-version-check';
import Feather from 'react-native-vector-icons/Feather';

import EnhancedPushNotificationService from '../../api/EnhancedPushNotificationService';

const LoginScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(true);

  const [showProgress, setShowProgress] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  const toggleCheckbox = () => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);

    // If user unchecks Remember Me, clear saved credentials
    if (!newCheckedState) {
      StorageUtility.clearSavedCredentials();
    }
  };

  useEffect(() => {
    setShowProgress(false);

    // Prefill credentials if Remember Me was used
    (async () => {
      const savedEmail = await StorageUtility.getLoginEmail();
      const savedPass = await StorageUtility.getPassword();
      if (savedEmail && savedEmail.trim() !== '' && savedPass && savedPass.trim() !== '') {
        setUserName(savedEmail);
        setPassword(savedPass);
        setIsChecked(true);
      }
    })();

    setTimeout(() => {
      VersionCheck.needUpdate().then(async res => {
        if (res.isNeeded) {
          Alert.alert(
            'Update Avalable',
            'A new version is available. Please update your app to use latest features',
            [
              {
                text: 'Update',
                onPress: () => {
                  Linking.openURL(res.storeUrl); // open store if update is needed.
                },
              },
            ],
          );
        }
      });
    }, 1500);
  }, []);

  const login = () => {
    // ConstData.scheduleHourlyNotif();
    // return;
    if (userName.trim() == '') {
      ToastUtility.showToast('Enter Username');
    } else if (password.trim() == '') {
      ToastUtility.showToast('Enter Password');
    } else {
      // Save or clear credentials based on Remember Me
      if (isChecked) {
        StorageUtility.storeLoginEmail(userName.trim());
        StorageUtility.storePassword(password.trim());
      } else {
        StorageUtility.clearSavedCredentials();
      }
      tpLogin();
    }
  };

  const tpLogin = async () => {
    setShowProgress(true);
    var formData = new FormData();
    formData.append('email', userName.trim());
    formData.append('password', password.trim());

    // Robust device parameters for the backend
    const deviceToken = await StorageUtility.getDeviceToken();
    formData.append('device-token', deviceToken);
    formData.append('device_token', deviceToken);

    formData.append('platform', Platform.OS);
    formData.append('device_type', Platform.OS);
    formData.append('device-type', Platform.OS);

    const capitalizedOS = Platform.OS === 'ios' ? 'iOS' : 'Android';
    formData.append('Platform', capitalizedOS);
    formData.append('DeviceType', capitalizedOS);

    const deviceId = await StorageUtility.getDeviceId();
    if (deviceId) {
      formData.append('device_id', deviceId);
      formData.append('device-id', deviceId);
    }

    ApiMethod.login(
      formData,
      async pass => {
        if (pass.access_token) {
          await StorageUtility.storeJWTToken(pass.access_token);

          // Store email immediately from login response for token refresh scenarios
          if (pass.userDetail && pass.userDetail.email) {
            await StorageUtility.storeLoginEmail(pass.userDetail.email);
          } else if (userName.trim()) {
            // Fallback to the email used for login
            await StorageUtility.storeLoginEmail(userName.trim());
          }

          // Check if userDetail is available in login response (preferred)
          if (pass.userDetail) {
            await handleLoginSuccess(pass.userDetail, pass.profile_image);
          } else {
            // Fallback to get-profile if userDetail not in login response
            getProfile();
          }
        } else {
          setShowProgress(false);
          if (pass.response) {
            ToastUtility.showToast(ConstData.getErrorMsg(pass.response));
          } else {
            ToastUtility.showToast(pass.message);
          }
        }
      },
      fail => {
        setShowProgress(false);
        ToastUtility.showToast('Some Error Occurred!');
      },
    );
  };

  const handleLoginSuccess = async (userData, profileImage) => {
    setShowProgress(false);

    try {
      // Prepare user data
      var data = { ...userData };
      if (profileImage) {
        data.proile_image = profileImage;
      }

      // Store the full user profile data
      await StorageUtility.storeUser(data);

      // If Remember Me is checked, also store the email separately for login screen
      if (isChecked) {
        await StorageUtility.storeLoginEmail(userName.trim());
      }

      // Initialize auto push notifications after successful login
      try {
        await EnhancedPushNotificationService.initialize();
      } catch (error) {
        console.error('❌ Error initializing push notifications after login:', error);
      }

      await StorageUtility.setSession(true);
      navigation.navigate('Waiting');
    } catch (error) {
      console.error('Error handling login success:', error);
      setShowProgress(false);
      ToastUtility.showToast('Error processing login. Please try again.');
    }
  };

  const getProfile = () => {
    setShowProgress(true);

    ApiMethod.getProfile(
      async pass => {
        setShowProgress(false);
        if (pass.status == 200) {
          var data = pass.data;
          data.proile_image = pass.proile_image;

          // Store the full user profile data
          await StorageUtility.storeUser(data);

          // If Remember Me is checked, also store the email separately for login screen
          if (isChecked) {
            await StorageUtility.storeLoginEmail(userName.trim());
          }

          // Initialize auto push notifications after successful login
          try {
            await EnhancedPushNotificationService.initialize();
          } catch (error) {
            console.error('❌ Error initializing push notifications after login:', error);
          }

          await StorageUtility.setSession(true);
          navigation.navigate('Waiting');
        }
      },
      fail => {
        setShowProgress(false);
        ToastUtility.showToast('Some Error Occurred.');
      },
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar
        animated={true}
        translucent={true}
        backgroundColor="#FFFFFF00"
        barStyle={'dark-content'} // : 'dark-content'
        showHideTransition={'fade'}
      />
      <KeyboardAwareScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{ flexGrow: 1 }}
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 0}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled">
        <View
          style={{
            flex: 1,
            width: '100%',
            alignItems: 'center',
            paddingBottom: 5 * height,
          }}>
          <View style={{ width: '90%' }}>
            <Text
              style={{
                color: '#000000',
                fontSize: 7 * width,
                fontFamily: Fonts.Medium,
                marginTop: 12 * height,
              }}>{`Login`}</Text>

            <Text
              style={{
                fontSize: 3.6 * width,
                fontFamily: Fonts.Medium,
                marginTop: 0 * height,
                color: ColorCode.grey888,
              }}>
              {'Welcome back to the app'}
            </Text>
          </View>

          <View
            style={{
              marginTop: 5 * height,
              width: '100%',
              paddingHorizontal: 6 * width,
            }}>
            <Text
              style={{
                fontSize: 4 * width,
                fontFamily: Fonts.SemiBold,
                color: '#000000',
              }}>
              {'Email'}
            </Text>

            <TextInput
              style={{
                width: '100%',
                height: 7 * height,
                color: '#000000',
                paddingHorizontal: 4 * width,
                marginTop: 1 * height,
                fontSize: 3.4 * width,
                fontFamily: Fonts.Medium,
                borderRadius: 3 * width,
                borderColor: '#9C9A9A',
                borderWidth: 1,
              }}
              placeholderTextColor="#A4A4A4"
              placeholder=" Enter Email"
              numberOfLines={1}
              keyboardType="email-address"
              autoCapitalize="none"
              value={userName}
              onChangeText={y => setUserName(y)}
            />

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: height * 1,
              }}>
              <Text
                style={{
                  fontSize: 4 * width,
                  fontFamily: Fonts.SemiBold,
                  color: '#000000',
                  marginTop: 2 * height,
                }}>
                {'Password'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('Forgot');
                }}
                style={{ margin: 1 * width, marginTop: 2 * height }}>
                <Text
                  style={{
                    fontSize: 2.9 * width,
                    fontFamily: Fonts.Medium,
                    color: ColorCode.grey888,
                  }}>
                  {'Forgot password?'}
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                width: '100%',
                height: 7 * height,
                marginTop: 1 * height,
                borderRadius: 3 * width,
                borderColor: '#9C9A9A',
                borderWidth: 1,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <TextInput
                style={{
                  //width: '100%',
                  flex: 1,
                  height: 7 * height,
                  paddingHorizontal: 4 * width,
                  color: '#000000',
                  fontSize: 3.4 * width,
                  fontFamily: Fonts.Medium,
                }}
                placeholderTextColor="#A4A4A4"
                placeholder="Enter Password"
                numberOfLines={1}
                keyboardType="default"
                autoCapitalize="none"
                secureTextEntry={passwordVisible}
                value={password}
                onChangeText={y => setPassword(y)}
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginEnd: 3 * width,
                  width: 8 * width,
                  height: 8 * width,
                }}>
                <Entypo
                  name={passwordVisible ? 'eye-with-line' : 'eye'}
                  size={4.2 * width}
                  color="#ADA4A5"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: height * 4,
              }}
              onPress={toggleCheckbox}>
              <View
                style={[
                  {
                    width: width * 5,
                    height: width * 5,
                    borderRadius: height * 0.5,
                    borderWidth: 1,
                    borderColor: ColorCode.primary,
                    backgroundColor: 'white',
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                  isChecked && { backgroundColor: ColorCode.primary },
                ]}>
                {isChecked && <Feather name="check" size={14} color="white" />}
              </View>
              <Text
                style={{
                  marginLeft: width * 2,
                  fontSize: width * 3.6,
                  fontFamily: Fonts.Medium,
                  color: '#333',
                }}>
                Remember Me
              </Text>
            </TouchableOpacity>

            <CustomButton
              btnText="Login"
              colors={['#1B94EF', '#1B94EF']}
              enable={true}
              btnStyle={{
                width: '100%',
                marginTop: 5 * height,
                marginBottom: 2 * height,
                elevation: 1 * width,
              }}
              btnTextStyle={{
                //fontWeight: '700',
                fontFamily: Fonts.Medium,
                fontSize: 4 * width,
              }}
              onPress={() => {
                login();
                // navigation.navigate('Intro');
              }}
            />
          </View>
        </View>
        {/* */}
      </KeyboardAwareScrollView>
      <CustomProgress show={showProgress} />
    </SafeAreaView>
  );
};

export default LoginScreen;
