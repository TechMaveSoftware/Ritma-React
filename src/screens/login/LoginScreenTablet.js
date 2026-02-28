import React, { useEffect, useState } from 'react';
import {
    Linking,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Dimensions,
    StyleSheet,
    Alert,
    Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Provider } from 'react-native-paper';
import Entypo from 'react-native-vector-icons/Entypo';
import ApiMethod from '../../api/ApiMethod';
import CustomButton from '../../compenents/CustomButton';
import CustomProgress from '../../compenents/CustomProgress';
import ColorCode from '../../utility/ColorCode';
import ConstData from '../../utility/ConstData';
import Fonts from '../../utility/Fonts';
import StorageUtility from '../../utility/StorageUtility';
import EnhancedPushNotificationService from '../../api/EnhancedPushNotificationService';
import ToastUtility from '../../utility/ToastUtility';
import VersionCheck from 'react-native-version-check';
import Feather from 'react-native-vector-icons/Feather';
import CustomStatus from '../../compenents/CustomStatus';
import CustomSAView from '../../compenents/CustomSAView';
import LinearGradient from 'react-native-linear-gradient';

const screenWidth = Dimensions.get('window').width;
const width = screenWidth > 420 ? 420 / 100 : screenWidth / 100;
const height = Dimensions.get('window').height / 100;

const LoginScreenTablet = ({ navigation }) => {
    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(true);
    const [showProgress, setShowProgress] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    const toggleCheckbox = () => {
        const newCheckedState = !isChecked;
        setIsChecked(newCheckedState);
        if (!newCheckedState) {
            StorageUtility.clearSavedCredentials();
        }
    };

    useEffect(() => {
        setShowProgress(false);
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
                        'Update Available',
                        'A new version is available. Please update your app to use latest features',
                        [
                            {
                                text: 'Update',
                                onPress: () => {
                                    Linking.openURL(res.storeUrl);
                                },
                            },
                        ],
                    );
                }
            });
        }, 1500);
    }, []);

    const login = () => {
        if (userName.trim() == '') {
            ToastUtility.showToast('Enter Username');
        } else if (password.trim() == '') {
            ToastUtility.showToast('Enter Password');
        } else {
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
                    if (pass.userDetail && pass.userDetail.email) {
                        await StorageUtility.storeLoginEmail(pass.userDetail.email);
                    } else if (userName.trim()) {
                        await StorageUtility.storeLoginEmail(userName.trim());
                    }

                    if (pass.userDetail) {
                        await handleLoginSuccess(pass.userDetail, pass.profile_image);
                    } else {
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
            var data = { ...userData };
            if (profileImage) {
                data.proile_image = profileImage;
            }
            await StorageUtility.storeUser(data);
            if (isChecked) {
                await StorageUtility.storeLoginEmail(userName.trim());
            }

            // Initialize enhanced push notifications after successful login
            try {
                await EnhancedPushNotificationService.initialize();
            } catch (error) {
                console.error('❌ Error initializing enhanced push notifications after login:', error);
            }

            await StorageUtility.setSession(true);
            navigation.navigate('Waiting');
        } catch (error) {
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
                    await StorageUtility.storeUser(data);
                    if (isChecked) {
                        await StorageUtility.storeLoginEmail(userName.trim());
                    }

                    // Initialize enhanced push notifications after successful login
                    try {
                        await EnhancedPushNotificationService.initialize();
                    } catch (error) {
                        console.error('❌ Error initializing enhanced push notifications after login:', error);
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
        <Provider>
            <View style={styles.mainContainer}>
                <CustomStatus trans={true} isDark={true} color="#FFFFFF00" />
                <CustomSAView parentStyple={{ flex: 1 }} style={styles.saView}>
                    <KeyboardAwareScrollView
                        contentContainerStyle={styles.scrollContent}
                        extraScrollHeight={Platform.OS === 'ios' ? 20 : 0}
                        enableOnAndroid={true}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.fullCanvas}>
                            <LinearGradient
                                colors={['#0087ED', '#0087ED']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.heroSection}>
                                <Text style={styles.brandTitle}>Welcome to Ritma Edtech</Text>
                                <Text style={styles.heroHeading}>
                                    Your learning hub to access courses, track progress, and stay organized.
                                </Text>
                            </LinearGradient>

                            <View style={styles.formCard}>
                                <Text style={styles.formCardTitle}>Login Account</Text>

                                <TextInput
                                    style={styles.lineInput}
                                    placeholderTextColor="#8A8A8A"
                                    placeholder="Enter Email"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={userName}
                                    onChangeText={setUserName}
                                />

                                <View style={styles.passwordRow}>
                                    <TextInput
                                        style={styles.passwordLineInput}
                                        placeholderTextColor="#8A8A8A"
                                        placeholder="Password"
                                        autoCapitalize="none"
                                        secureTextEntry={passwordVisible}
                                        value={password}
                                        onChangeText={setPassword}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setPasswordVisible(!passwordVisible)}
                                        style={styles.eyeIcon}>
                                        <Entypo
                                            name={passwordVisible ? 'eye-with-line' : 'eye'}
                                            size={3.2 * width}
                                            color="#7A7A7A"
                                        />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity onPress={() => navigation.navigate('Forgot')}>
                                    <Text style={styles.forgotText}> forgot password ?</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={styles.rememberMeContainer}
                                    onPress={toggleCheckbox}>
                                    <View style={[styles.checkbox, isChecked && styles.checkboxActive]}>
                                        {isChecked && <Feather name="check" size={width * 2.2} color="white" />}
                                    </View>
                                    <Text style={styles.rememberMeText}>Remember Me</Text>
                                </TouchableOpacity>

                                <CustomButton
                                    btnText="LOG IN"
                                    colors={['#0087ED', '#0087ED']}
                                    enable={true}
                                    btnStyle={styles.loginBtn}
                                    btnTextStyle={styles.loginBtnText}
                                    onPress={login}
                                />
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </CustomSAView>
            </View>
            <CustomProgress show={showProgress} />
        </Provider>
    );
};

export default LoginScreenTablet;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#DDE3ED',
    },
    saView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingVertical: 0,
    },
    fullCanvas: {
        width: '100%',
        minHeight: '100%',
        backgroundColor: '#DDE3ED',
    },
    heroSection: {
        height: 36 * height,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6 * width,
    },
    brandTitle: {
        color: '#FFFFFF',
        fontSize: 7 * width,
        fontFamily: Fonts.Bold,
        textAlign: 'center',
    },
    heroHeading: {
        color: '#FFFFFF',
        fontSize: 2.2 * width,
        fontFamily: Fonts.Medium,
        marginTop: 1.2 * height,
        textAlign: 'center',
        lineHeight: 3.1 * width,
    },
    formCard: {
        marginTop: -5 * height,
        marginHorizontal: 14 * width,
        borderRadius: 3 * width,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 4.5 * width,
        paddingTop: 3.2 * height,
        paddingBottom: 3.2 * height,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 6,
    },
    formCardTitle: {
        color: '#202020',
        fontSize: 3.8 * width,
        fontFamily: Fonts.SemiBold,
        textAlign: 'center',
        marginBottom: 2.5 * height,
    },
    lineInput: {
        width: '100%',
        height: 5.2 * height,
        color: '#000000',
        fontSize: 2.6 * width,
        fontFamily: Fonts.Medium,
        borderBottomWidth: 1,
        borderBottomColor: '#B9B9B9',
        marginBottom: 1.8 * height,
    },
    passwordRow: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#B9B9B9',
        marginBottom: 1.1 * height,
    },
    passwordLineInput: {
        flex: 1,
        height: 5.2 * height,
        color: '#000000',
        fontSize: 2.6 * width,
        fontFamily: Fonts.Medium,
    },
    forgotText: {
        fontSize: 2.9 * width,
        fontFamily: Fonts.Medium,
        color: '#0087ED',
        marginBottom: 1.6 * height,
    },
    eyeIcon: {
        paddingHorizontal: 1.5 * width,
    },
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2.2 * height,
    },
    checkbox: {
        width: width * 2.8,
        height: width * 2.8,
        borderRadius: width * 0.6,
        borderWidth: 1,
        borderColor: '#0087ED',
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActive: {
        backgroundColor: '#0087ED',
    },
    rememberMeText: {
        marginLeft: width * 1.5,
        fontSize: width * 2.1,
        fontFamily: Fonts.Medium,
        color: '#333',
    },
    loginBtn: {
        width: '100%',
        height: 5.2 * height,
        borderRadius: 4 * width,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginBtnText: {
        fontFamily: Fonts.Medium,
        fontSize: 2.3 * width,
        letterSpacing: 0.5,
    },
});
