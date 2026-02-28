import React, {Fragment, useEffect, useState} from 'react';
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import LinearGradient from 'react-native-linear-gradient';
import {Provider} from 'react-native-paper';
import Entypo from 'react-native-vector-icons/Entypo';
import ApiMethod from '../../api/ApiMethod';
import CustomButton from '../../compenents/CustomButton';
import CustomProgress from '../../compenents/CustomProgress';
import ImageView from '../../compenents/ImageView';
import height from '../../Units/height';
import width from '../../Units/width';
import ColorCode from '../../utility/ColorCode';
import ConstData from '../../utility/ConstData';
import Fonts from '../../utility/Fonts';
import StorageUtility from '../../utility/StorageUtility';
import ToastUtility from '../../utility/ToastUtility';
import CustomHeader from '../../compenents/CustomHeader';
import CustomStatus from '../../compenents/CustomStatus';
import CustomSAView from '../../compenents/CustomSAView';
import {useFocusEffect} from '@react-navigation/native';
// import VersionCheck from 'react-native-version-check';

const VerifyOtpScreen = ({navigation, route}) => {
  let email = route.params.email;
  const [OTP, setOTP] = useState(''); //abhishek@techmavesoftware.com
  const [showProgress, setShowProgress] = useState(false);
  const [timer, setTimer] = useState(30);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      setTimer(30);
      setIsResendDisabled(true);
      return undefined;
    }, []),
  );

  useEffect(() => {
    // Timer countdown effect
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsResendDisabled(false);
    }

    return () => clearInterval(interval);
  }, [timer]);

  // Cleanup effect for loading state and navigation
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Prevent default action
      if (showProgress) {
        e.preventDefault();
        setShowProgress(false);
        // Allow navigation after a short delay
        setTimeout(() => {
          navigation.dispatch(e.data.action);
        }, 100);
      }
    });

    return unsubscribe;
  }, [navigation, showProgress]);

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      setShowProgress(false);
    };
  }, []);

  const verifyOtp = () => {
    if (OTP === '' || OTP === null || OTP === undefined) {
      ToastUtility.showToast('Please enter valid OTP');
      return;
    }
    
    setShowProgress(true);
    var formData = new FormData();
    formData.append('email', email.trim());
    formData.append('otp', OTP.trim());
    
    console.log('Verifying OTP:', OTP.trim(), 'for email:', email.trim());
    
    ApiMethod.verifyOtp(
      formData,
      async pass => {
        console.log('verify OTP response:', pass);
        setShowProgress(false);
        
        if (pass.status == 200) {
          navigation.navigate('ChangePassword', {email: email});
          ToastUtility.showToast(pass.message || 'OTP verified successfully');
        } else {
          ToastUtility.showToast(pass.message || 'Invalid OTP. Please try again.');
        }
      },
      fail => {
        console.log('OTP verification failed:', fail);
        setShowProgress(false);
        ToastUtility.showToast('Some Error Occurred! Please try again.');
      },
    );
  };

  const handleResend = () => {
    // Start the timer for 30 seconds
    setTimer(30);
    // Disable the resend button
    setIsResendDisabled(true);

    // Implement the API call to resend OTP
    setShowProgress(true);
    var formData = new FormData();
    formData.append('email', email.trim());

    ApiMethod.resendOtp(
      formData,
      async pass => {
        console.log('resend OTP', pass);
        setShowProgress(false);
        if (pass.status == 200) {
          ToastUtility.showToast(
            pass.message || 'OTP has been sent successfully',
          );
        } else {
          ToastUtility.showToast(pass.message || 'Failed to resend OTP');
        }
      },
      fail => {
        console.log(fail);
        setShowProgress(false);
        ToastUtility.showToast('Some Error Occurred!');
      },
    );
  };

  return (
    <Provider>
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        <CustomStatus trans={true} isDark={true} color="#FFFFFF00" />
        <CustomSAView parentStyple={{flex: 1}} style={{flex: 1, backgroundColor: '#fff'}}>
          <CustomHeader text={'Verify OTP'} customStyle={{marginTop: 0}} />
          <KeyboardAwareScrollView style={{flex: 1, width: '100%'}}>
            <View
              style={{
                // flex: 1,
                width: '100%',
                height: 100 * height,
                alignItems: 'center',
              }}>
              <View style={{width: '90%'}}>
                <Text
                  style={{
                    color: '#000000',
                    fontSize: 5.5 * width,
                    fontFamily: Fonts.SemiBold,
                    marginTop: 6 * height,
                  }}>{`Authentication Code`}</Text>
                <Text
                  style={{
                    fontSize: 3.6 * width,
                    fontFamily: Fonts.Regular,
                    marginTop: 1 * height,
                    color: '#4B4B4B',
                  }}>
                  {`Enter 6-digit code we just texted to your Email ${email}`}
                </Text>
              </View>

              <View
                style={{
                  marginTop: 2 * height,
                  width: '100%',
                  paddingHorizontal: 4 * width,
                }}>
                <TextInput
                  style={{
                    width: '100%',
                    height: 7 * height,
                    color: '#000000',
                    paddingHorizontal: 4 * width,
                    marginTop: 1 * height,
                    fontSize: 3.6 * width,
                    fontFamily: Fonts.Medium,
                    borderRadius: 3 * width,
                    borderColor: '#9C9A9A',
                    borderWidth: 1,
                  }}
                  placeholderTextColor="#A4A4A4"
                  placeholder="Enter OTP"
                  maxLength={6}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                  value={OTP}
                  onChangeText={y => setOTP(y)}
                />

                <CustomButton
                  btnText="Verify"
                  colors={['#1B94EF', '#1B94EF']}
                  enable={true}
                  btnStyle={{
                    width: '100%',
                    marginTop: 4 * height,
                    marginBottom: 2 * height,
                    elevation: 1 * width,
                  }}
                  btnTextStyle={{
                    //fontWeight: '700',
                    fontFamily: Fonts.Medium,
                    fontSize: 4 * width,
                  }}
                  onPress={() => {
                    verifyOtp();
                  }}
                />
                <View
                  style={{
                    flexDirection: 'row',
                    gap: width * 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{
                      fontSize: 3.7 * width,
                      fontFamily: Fonts.Medium,
                      color: ColorCode.grey888,
                    }}>
                    Did not receive the code?
                  </Text>
                  <TouchableOpacity
                    disabled={isResendDisabled}
                    onPress={handleResend}>
                    <Text
                      style={{
                        fontSize: 3.7 * width,
                        fontFamily: Fonts.SemiBold,
                        color: isResendDisabled ? ColorCode.grey888 : '#000',
                      }}>
                      {isResendDisabled ? `Resend (${timer}s)` : 'Resend'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAwareScrollView>
        </CustomSAView>
        <CustomProgress show={showProgress} />
      </View>
    </Provider>
  );
};

export default VerifyOtpScreen;
