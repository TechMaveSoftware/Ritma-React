import React, {useState} from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {ScrollView} from 'react-native';
import {Provider} from 'react-native-paper';
import Entypo from 'react-native-vector-icons/Entypo';
import ApiMethod from '../../../api/ApiMethod';
import CustomButton from '../../../compenents/CustomButton';
import CustomHeader from '../../../compenents/CustomHeader';
import CustomProgress from '../../../compenents/CustomProgress';
import CustomStatus from '../../../compenents/CustomStatus';
import height from '../../../Units/height';
import width from '../../../Units/width';
import ColorCode from '../../../utility/ColorCode';
import Fonts from '../../../utility/Fonts';
import ToastUtility from '../../../utility/ToastUtility';
import StorageUtility from '../../../utility/StorageUtility';

// ----- MOVE THIS COMPONENT OUTSIDE OF ChangePasswordScreen -----
const PasswordInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  visible,
  setVisible,
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputWrapper}>
      <View style={{flex: 1}}>
        <TextInput
          style={styles.textInput}
          placeholderTextColor="#A4A4A4"
          placeholder={placeholder}
          keyboardType="default"
          autoCapitalize="none"
          secureTextEntry={visible}
          value={value}
          onChangeText={onChangeText}
          autoCorrect={false}
          spellCheck={false}
          returnKeyType="next"
          enablesReturnKeyAutomatically={true}
        />
      </View>
      <TouchableOpacity
        onPress={() => setVisible(!visible)}
        style={styles.eyeButton}>
        <Entypo
          name={visible ? 'eye-with-line' : 'eye'}
          size={4.2 * width}
          color="#ADA4A5"
        />
      </TouchableOpacity>
    </View>
  </View>
);

const ChangePasswordScreen = ({navigation}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordVisible, setNewPasswordVisible] = useState(true);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(true);
  const [showProgress, setShowProgress] = useState(false);

  const validateInputs = () => {
    if (!newPassword.trim()) {
      ToastUtility.showToast('Please enter new password');
      return false;
    }
    if (newPassword.length < 6) {
      ToastUtility.showToast('New password must be at least 6 characters');
      return false;
    }
    if (!confirmPassword.trim()) {
      ToastUtility.showToast('Please confirm new password');
      return false;
    }
    if (newPassword !== confirmPassword) {
      ToastUtility.showToast('New passwords do not match');
      return false;
    }
    return true;
  };

  const changePassword = async () => {
    if (!validateInputs()) {
      return;
    }

    setShowProgress(true);

    try {
      const userData = await StorageUtility.getUser();
      const formData = new FormData();
      formData.append('email', userData.email);
      formData.append('password', newPassword.trim());

      ApiMethod.changePassword(
        formData,
        async pass => {
          setShowProgress(false);
          if (pass.status === 200) {
            ToastUtility.showToast(pass.message || 'Password changed successfully');
            navigation.goBack();
          } else {
            ToastUtility.showToast(pass.message || 'Failed to change password');
          }
        },
        fail => {
          setShowProgress(false);
          ToastUtility.showToast(fail.message || 'Some error occurred!');
        }
      );
    } catch (error) {
      setShowProgress(false);
      ToastUtility.showToast('Some error occurred!');
    }
  };

  return (
    <Provider>
      <View style={styles.container}>
        <CustomStatus trans={true} isDark={true} color="#FFFFFF" />
        <SafeAreaView style={{flex: 1}}>
          <View style={{flex: 1}}>
            <CustomHeader text={'Change Password'} customStyle={{marginTop: 0}} />
            <KeyboardAvoidingView
              style={{flex: 1}}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <ScrollView
                style={styles.scrollView}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{flexGrow: 1}}
              >
                <View style={styles.content}>
                  <Text style={styles.title}>Reset Password</Text>
                  <Text style={styles.subtitle}>
                    Enter your new password twice below to reset a new password.
                  </Text>
                  <PasswordInput
                    label="Enter new password"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    visible={newPasswordVisible}
                    setVisible={setNewPasswordVisible}
                  />
                  <PasswordInput
                    label="Re-enter new password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Re-enter new password"
                    visible={confirmPasswordVisible}
                    setVisible={setConfirmPasswordVisible}
                  />
                  <CustomButton
                    btnText="Reset Password"
                    colors={[ColorCode.primary, ColorCode.primary]}
                    enable={true}
                    btnStyle={styles.button}
                    btnTextStyle={styles.buttonText}
                    onPress={changePassword}
                  />
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </SafeAreaView>
        <CustomProgress show={showProgress} />
      </View>
    </Provider>
  );
};




const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 6 * width,
    paddingVertical: 4 * height,
    alignItems: 'center',
  },
  title: {
    fontSize: 6 * width,
    fontFamily: Fonts.SemiBold,
    color: '#000',
    marginBottom: 2 * height,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 3.8 * width,
    fontFamily: Fonts.Regular,
    color: '#4B4B4B',
    marginBottom: 4 * height,
    lineHeight: 5 * width,
    textAlign: 'center',
    width: '80%',
  },
  inputContainer: {
    marginBottom: 3 * height,
    width: '100%',
  },
  inputLabel: {
    fontSize: 4 * width,
    fontFamily: Fonts.SemiBold,
    color: '#000',
    marginBottom: 1 * height,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#9C9A9A',
    borderRadius: 3 * width,
    height: 7 * height,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 4 * width,
    color: '#000',
    fontSize: 3.6 * width,
    fontFamily: Fonts.Medium,
  },
  eyeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 3 * width,
    width: 8 * width,
    height: 8 * width,
  },
  button: {
    width: '100%',
    marginTop: 4 * height,
    marginBottom: 2 * height,
    elevation: 1 * width,
  },
  buttonText: {
    fontFamily: Fonts.Medium,
    fontSize: 4 * width,
  },
};

export default ChangePasswordScreen; 
