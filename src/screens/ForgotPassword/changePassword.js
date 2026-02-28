import React, {Fragment, useEffect, useState} from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
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

const ChangePasswordScreen = ({navigation, route}) => {
  let email = route.params.email;
  const [password, setPassword] = useState(''); //12345
  const [rePassword, setRePassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [rePasswordVisible, setRePasswordVisible] = useState(true);

  const [showProgress, setShowProgress] = useState(false);

  const checkpwd = () => {
    if (password === '' || password === null || password === undefined) {
      ToastUtility.showToast('Please enter password');
    } else if (
      rePassword === '' ||
      rePassword === null ||
      rePassword === undefined
    ) {
      ToastUtility.showToast('please enter re-password');
    } else if (password !== rePassword) {
      ToastUtility.showToast('Password Mismatched');
    } else {
      changePassword();
    }
  };

  const changePassword = () => {
    setShowProgress(true);
    var formData = new FormData();
    formData.append('email', email.trim());
    formData.append('password', password.trim());
    ApiMethod.changePassword(
      formData,
      async pass => {
        console.log('changePassword', pass);
        if (pass.status == 200) {
          navigation.navigate('Login');
          ToastUtility.showToast(pass.message);
        } else {
          setShowProgress(false);
          ToastUtility.showToast('Please check password');
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
          <CustomHeader text={'Change Your Password'} customStyle={{marginTop: 0}} />
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
                    fontSize: 6 * width,
                    fontFamily: Fonts.SemiBold,
                    marginTop: 5 * height,
                  }}>{`Reset Password`}</Text>

                <Text
                  style={{
                    fontSize: 3.8 * width,
                    fontFamily: Fonts.Regular,
                    marginTop: 1 * height,
                    color: '#4B4B4B',
                    width: '80%',
                  }}>
                  {'Enter new password twice below to reset a new password'}
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
                    marginTop: 2 * height,
                  }}>
                  {'Enter new password'}
                </Text>

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
                      fontSize: 3.6 * width,
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
                <Text
                  style={{
                    fontSize: 4 * width,
                    fontFamily: Fonts.SemiBold,
                    color: '#000000',
                    marginTop: 2 * height,
                  }}>
                  {'Re-enter new password'}
                </Text>

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
                      fontSize: 3.6 * width,
                      fontFamily: Fonts.Medium,
                    }}
                    placeholderTextColor="#A4A4A4"
                    placeholder="Re-enter Password"
                    numberOfLines={1}
                    keyboardType="default"
                    autoCapitalize="none"
                    secureTextEntry={rePasswordVisible}
                    value={rePassword}
                    onChangeText={y => setRePassword(y)}
                  />
                  <TouchableOpacity
                    onPress={() => setRePasswordVisible(!rePasswordVisible)}
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginEnd: 3 * width,
                      width: 8 * width,
                      height: 8 * width,
                    }}>
                    <Entypo
                      name={rePasswordVisible ? 'eye-with-line' : 'eye'}
                      size={4.2 * width}
                      color="#ADA4A5"
                    />
                  </TouchableOpacity>
                </View>
                <CustomButton
                  btnText="Reset Password"
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
                    checkpwd();
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

export default ChangePasswordScreen;
