import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Provider} from 'react-native-paper';
import ApiMethod from '../../api/ApiMethod';
import CustomButton from '../../compenents/CustomButton';
import CustomProgress from '../../compenents/CustomProgress';
import CustomStatus from '../../compenents/CustomStatus';
import CustomSAView from '../../compenents/CustomSAView';
import CustomHeaderTablet from '../../compenents/CustomHeaderTablet';
import Fonts from '../../utility/Fonts';
import ToastUtility from '../../utility/ToastUtility';
import ColorCode from '../../utility/ColorCode';
import Dimensions from 'react-native/Libraries/Utilities/Dimensions';
import {useFocusEffect} from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;
const width = screenWidth > 420 ? 420 / 100 : screenWidth / 100;
const height = Dimensions.get('window').height / 100;

const VerifyOtpTablet = ({navigation, route}) => {
  const email = route.params?.email || '';
  const [otp, setOtp] = useState('');
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
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    return () => {
      setShowProgress(false);
    };
  }, []);

  const verifyOtp = () => {
    if (!otp.trim()) {
      ToastUtility.showToast('Please enter valid OTP');
      return;
    }

    setShowProgress(true);
    const formData = new FormData();
    formData.append('email', email.trim());
    formData.append('otp', otp.trim());

    ApiMethod.verifyOtp(
      formData,
      pass => {
        setShowProgress(false);
        if (pass.status == 200) {
          navigation.navigate('ChangePassword', {email});
          ToastUtility.showToast(pass.message || 'OTP verified successfully');
        } else {
          ToastUtility.showToast(pass.message || 'Invalid OTP. Please try again.');
        }
      },
      fail => {
        setShowProgress(false);
        ToastUtility.showToast('Some Error Occurred! Please try again.');
      },
    );
  };

  const handleResend = () => {
    setTimer(30);
    setIsResendDisabled(true);
    setShowProgress(true);

    const formData = new FormData();
    formData.append('email', email.trim());

    ApiMethod.resendOtp(
      formData,
      pass => {
        setShowProgress(false);
        if (pass.status == 200) {
          ToastUtility.showToast(pass.message || 'OTP has been sent successfully');
        } else {
          ToastUtility.showToast(pass.message || 'Failed to resend OTP');
        }
      },
      fail => {
        setShowProgress(false);
        ToastUtility.showToast('Some Error Occurred!');
      },
    );
  };

  return (
    <Provider>
      <View style={styles.mainContainer}>
        <CustomStatus trans={true} isDark={true} color="#FFFFFF00" />
        <CustomSAView parentStyple={{flex: 1}} style={styles.saView}>
          <CustomHeaderTablet text="Verify OTP" />

          <KeyboardAwareScrollView
            contentContainerStyle={styles.scrollContent}
            extraScrollHeight={Platform.OS === 'ios' ? 20 : 0}
            enableOnAndroid={true}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.contentCard}>
              <Text style={styles.heading}>Authentication Code</Text>
              <Text style={styles.subHeading}>
                {`Enter 6-digit code we just texted to your Email ${email}`}
              </Text>

              <TextInput
                style={styles.textInput}
                placeholderTextColor="#A4A4A4"
                placeholder="Enter OTP"
                maxLength={6}
                keyboardType="number-pad"
                autoCapitalize="none"
                value={otp}
                onChangeText={setOtp}
              />

              <CustomButton
                btnText="Verify"
                colors={['#1B94EF', '#1B94EF']}
                enable={true}
                btnStyle={styles.verifyBtn}
                btnTextStyle={styles.verifyBtnText}
                onPress={verifyOtp}
              />

              <View style={styles.resendRow}>
                <Text style={styles.resendLabel}>Did not receive the code?</Text>
                <TouchableOpacity disabled={isResendDisabled} onPress={handleResend}>
                  <Text style={[styles.resendText, isResendDisabled && {color: ColorCode.grey888}]}>
                    {isResendDisabled ? `Resend (${timer}s)` : 'Resend'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAwareScrollView>
        </CustomSAView>
      </View>
      <CustomProgress show={showProgress} />
    </Provider>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  saView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 4 * height,
  },
  contentCard: {
    width: '100%',
    maxWidth: 620,
    paddingHorizontal: 4 * width,
  },
  heading: {
    color: '#000000',
    fontSize: 5.2 * width,
    fontFamily: Fonts.SemiBold,
    marginTop: 2 * height,
  },
  subHeading: {
    color: '#4B4B4B',
    fontSize: 2.5 * width,
    fontFamily: Fonts.Regular,
    marginTop: 1 * height,
    marginBottom: 3 * height,
  },
  textInput: {
    width: '100%',
    height: 6.8 * height,
    color: '#000000',
    paddingHorizontal: 3 * width,
    fontSize: 2.8 * width,
    fontFamily: Fonts.Medium,
    borderRadius: 2.5 * width,
    borderColor: '#C9C9C9',
    borderWidth: 1,
  },
  verifyBtn: {
    width: '100%',
    marginTop: 4 * height,
    marginBottom: 2 * height,
  },
  verifyBtnText: {
    fontFamily: Fonts.Medium,
    fontSize: 3 * width,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: width * 1,
  },
  resendLabel: {
    fontSize: 2.8 * width,
    fontFamily: Fonts.Medium,
    color: ColorCode.grey888,
  },
  resendText: {
    fontSize: 2.8 * width,
    fontFamily: Fonts.SemiBold,
    color: '#000000',
  },
});

export default VerifyOtpTablet;
