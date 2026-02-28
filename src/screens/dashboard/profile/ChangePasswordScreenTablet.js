import React, { useState } from 'react';
import {
    SafeAreaView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Platform,
    KeyboardAvoidingView,
    Dimensions,
    ScrollView,
    StyleSheet
} from 'react-native';
import { Provider } from 'react-native-paper';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ApiMethod from '../../../api/ApiMethod';
import CustomButton from '../../../compenents/CustomButton';
import CustomProgress from '../../../compenents/CustomProgress';
import CustomStatus from '../../../compenents/CustomStatus';
import CustomSAView from '../../../compenents/CustomSAView';
import ColorCode from '../../../utility/ColorCode';
import Fonts from '../../../utility/Fonts';
import ToastUtility from '../../../utility/ToastUtility';
import StorageUtility from '../../../utility/StorageUtility';
import CustomHeaderTablet from '../../../compenents/CustomHeaderTablet';

const screenWidth = Dimensions.get('window').width;
const width = screenWidth > 420 ? 420 / 100 : screenWidth / 100;
const height = Dimensions.get('window').height / 100;

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
            <View style={{ flex: 1 }}>
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

const ChangePasswordScreenTablet = ({ navigation }) => {
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
            <View style={styles.mainContainer}>
                <CustomStatus trans={true} isDark={true} color="#FFFFFF00" />
                <CustomSAView parentStyple={{ flex: 1 }} style={styles.saView}>
                    <CustomHeaderTablet text="Change Password" />

                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    >
                        <ScrollView
                            style={styles.scrollView}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ flexGrow: 1 }}
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
                    <CustomProgress show={showProgress} />
                </CustomSAView>
            </View>
        </Provider>
    );
};

export default ChangePasswordScreenTablet;

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: ColorCode.white },
    saView: { flex: 1, backgroundColor: ColorCode.transarent },
    header: {
        width: '100%',
        height: 4.5 * height,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 6 * width,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backBtn: { width: 10 * width, height: 10 * width, justifyContent: 'center' },
    headerTitle: {
        fontSize: 3.5 * width,
        fontFamily: Fonts.SemiBold,
        color: '#000000',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 2.5 * width,
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
        width: '95%',
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
        height: 5 * height, // Reduced height
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
        height: 5.5 * height, // Reduced height for button
        justifyContent: 'center',
    },
    buttonText: {
        fontFamily: Fonts.Medium,
        fontSize: 4 * width,
    },
});
