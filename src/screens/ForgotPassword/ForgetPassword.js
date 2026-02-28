import React, {Fragment, useEffect, useState} from 'react';
import {
  Text,
  TextInput,
  View,
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
// import VersionCheck from 'react-native-version-check';

const ForgetPasswordScreen = ({navigation}) => {
  const [userName, setUserName] = useState(''); //abhishek@techmavesoftware.com

  const [showProgress, setShowProgress] = useState(false);

  // Cleanup effect to stop loader when component mounts
  useEffect(() => {
    setShowProgress(false);
  }, []);

  const forgotPwd = () => {
    setShowProgress(true);
    var formData = new FormData();
    formData.append('email', userName.trim());
    ApiMethod.forgotPassword(
      formData,
      async pass => {
        console.log('forget password', pass);
        console.log('Full API response:', JSON.stringify(pass, null, 2));
        
        // Try logging OTP from different possible locations in the response
        if (pass.otp) {
          console.log('OTP sent to email (top-level):', pass.otp);
        }
        if (pass.data && pass.data.otp) {
          console.log('OTP sent to email (nested data):', pass.data.otp);
        }
        if (pass.data && pass.data.data && pass.data.data.otp) {
          console.log('OTP sent to email (deep nested data+++++++++++++++++):', pass.data.data.otp);
        }
        
        // Check if OTP is in the message or any other field
        if (pass.message && pass.message.includes('OTP')) {
          console.log('OTP mentioned in message:', pass.message);
        }
        
        if (pass.status == 200) {
          setShowProgress(false);
          navigation.navigate('VerifyOtp', {email: userName});
          ToastUtility.showToast(pass.message);
        } else {
          setShowProgress(false);
          ToastUtility.showToast('Please enter registered email');
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
          <CustomHeader text={'Forgot Password'} customStyle={{marginTop: 0}} />
          <KeyboardAwareScrollView style={{flex: 1, width: '100%'}}>
            <View
              style={{
                // flex: 1,
                width: '100%',
                height: 100 * height,
                alignItems: 'center',
              }}>
              <View style={{width: '90%', marginTop: height * 4}}>
                <Text
                  style={{
                    fontSize: 6 * width,
                    fontFamily: Fonts.SemiBold,
                    marginTop: 2 * height,
                    color: '#000',
                  }}>
                  Let's reset your password
                </Text>
                <Text
                  style={{
                    fontSize: 3.2 * width,
                    fontFamily: Fonts.Regular,
                    marginTop: 1 * height,
                    color: '#4B4B4B',
                    width: '90%',
                  }}>
                  {'Please enter your registered email for reset password'}
                </Text>
              </View>

              <View
                style={{
                  marginTop: 4 * height,
                  width: '100%',
                  paddingHorizontal: 6 * width,
                }}>
                <Text
                  style={{
                    fontSize: 4 * width,
                    fontFamily: Fonts.SemiBold,
                    color: '#000000',
                  }}>
                  {'Email Address'}
                </Text>

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
                  placeholder=" Enter Email"
                  numberOfLines={1}
                  keyboardType="default"
                  autoCapitalize="none"
                  value={userName}
                  onChangeText={y => setUserName(y)}
                />
                <CustomButton
                  btnText="Next"
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
                    forgotPwd();
                  }}
                />
              </View>
            </View>
          </KeyboardAwareScrollView>
        </CustomSAView>
        <CustomProgress show={showProgress} />
      </View>
    </Provider>
  );
};

export default ForgetPasswordScreen;
