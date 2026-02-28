import React, {useState} from 'react';
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
import Entypo from 'react-native-vector-icons/Entypo';
import ApiMethod from '../../api/ApiMethod';
import CustomButton from '../../compenents/CustomButton';
import CustomProgress from '../../compenents/CustomProgress';
import CustomStatus from '../../compenents/CustomStatus';
import CustomSAView from '../../compenents/CustomSAView';
import CustomHeaderTablet from '../../compenents/CustomHeaderTablet';
import Fonts from '../../utility/Fonts';
import ToastUtility from '../../utility/ToastUtility';
import Dimensions from 'react-native/Libraries/Utilities/Dimensions';

const screenWidth = Dimensions.get('window').width;
const width = screenWidth > 420 ? 420 / 100 : screenWidth / 100;
const height = Dimensions.get('window').height / 100;

const ChangePasswordTablet = ({navigation, route}) => {
  const email = route.params?.email || '';
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [rePasswordVisible, setRePasswordVisible] = useState(true);
  const [showProgress, setShowProgress] = useState(false);

  const checkpwd = () => {
    if (!password.trim()) {
      ToastUtility.showToast('Please enter password');
    } else if (!rePassword.trim()) {
      ToastUtility.showToast('please enter re-password');
    } else if (password !== rePassword) {
      ToastUtility.showToast('Password Mismatched');
    } else {
      changePassword();
    }
  };

  const changePassword = () => {
    setShowProgress(true);
    const formData = new FormData();
    formData.append('email', email.trim());
    formData.append('password', password.trim());

    ApiMethod.changePassword(
      formData,
      pass => {
        setShowProgress(false);
        if (pass.status == 200) {
          navigation.navigate('Login');
          ToastUtility.showToast(pass.message);
        } else {
          ToastUtility.showToast('Please check password');
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
        <CustomStatus trans={false} isDark={true} color="#FFFFFF" />
        <CustomSAView parentStyple={{flex: 1}} style={styles.saView}>
          <CustomHeaderTablet text="Change Your Password" />

          <KeyboardAwareScrollView
            contentContainerStyle={styles.scrollContent}
            extraScrollHeight={Platform.OS === 'ios' ? 20 : 0}
            enableOnAndroid={true}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.contentCard}>
              <Text style={styles.heading}>Reset Password</Text>
              <Text style={styles.subHeading}>
                Enter new password twice below to reset a new password
              </Text>

              <Text style={styles.label}>Enter new password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholderTextColor="#A4A4A4"
                  placeholder="Enter Password"
                  keyboardType="default"
                  autoCapitalize="none"
                  secureTextEntry={passwordVisible}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  style={styles.eyeButton}>
                  <Entypo
                    name={passwordVisible ? 'eye-with-line' : 'eye'}
                    size={4.2 * width}
                    color="#ADA4A5"
                  />
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, {marginTop: 2 * height}]}>Re-enter new password</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  placeholderTextColor="#A4A4A4"
                  placeholder="Re-enter Password"
                  keyboardType="default"
                  autoCapitalize="none"
                  secureTextEntry={rePasswordVisible}
                  value={rePassword}
                  onChangeText={setRePassword}
                />
                <TouchableOpacity
                  onPress={() => setRePasswordVisible(!rePasswordVisible)}
                  style={styles.eyeButton}>
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
                btnStyle={styles.resetBtn}
                btnTextStyle={styles.resetBtnText}
                onPress={checkpwd}
              />
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
    fontSize: 5.4 * width,
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
  label: {
    color: '#000000',
    fontSize: 3.2 * width,
    fontFamily: Fonts.SemiBold,
    marginBottom: 1.2 * height,
  },
  inputWrapper: {
    width: '100%',
    height: 6.8 * height,
    borderRadius: 2.5 * width,
    borderColor: '#C9C9C9',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    height: '100%',
    color: '#000000',
    paddingHorizontal: 3 * width,
    fontSize: 2.8 * width,
    fontFamily: Fonts.Medium,
  },
  eyeButton: {
    width: 8 * width,
    height: 8 * width,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 2 * width,
  },
  resetBtn: {
    width: '100%',
    marginTop: 4 * height,
    marginBottom: 2 * height,
  },
  resetBtnText: {
    fontFamily: Fonts.Medium,
    fontSize: 3 * width,
  },
});

export default ChangePasswordTablet;
