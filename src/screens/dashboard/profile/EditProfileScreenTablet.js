import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Dimensions,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { Provider } from 'react-native-paper';
import CustomStatus from '../../../compenents/CustomStatus';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomProgress from '../../../compenents/CustomProgress';
import CustomSAView from '../../../compenents/CustomSAView';
import { CommonActions } from '@react-navigation/native';
import ColorCode from '../../../utility/ColorCode';
import Fonts from '../../../utility/Fonts';
import ToastUtility from '../../../utility/ToastUtility';
import StorageUtility from '../../../utility/StorageUtility';
import ApiMethod from '../../../api/ApiMethod';
import ConstData from '../../../utility/ConstData';
import CustomHeaderTablet from '../../../compenents/CustomHeaderTablet';

const screenWidth = Dimensions.get('window').width;
const width = screenWidth > 420 ? 420 / 100 : screenWidth / 100;
const height = Dimensions.get('window').height / 100;

const EditProfileScreenTablet = ({ navigation }) => {
    const [userData, setUserData] = useState(null);
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [dialCode, setDialCode] = useState('+1');
    const [showProgress, setShowProgress] = useState(false);

    useEffect(() => {
        getUserDetail();
    }, []);

    const getUserDetail = async () => {
        const user = await StorageUtility.getUser();
        if (user) {
            setUserData(user);
            setName(user.name || '');
            setMobile(user.mobile || '');
            setDialCode(user.dial_code || '+1');
        }
    };

    const validateForm = () => {
        if (!name.trim()) {
            ToastUtility.showToast('Please enter your name');
            return false;
        }
        if (!mobile.trim()) {
            ToastUtility.showToast('Please enter your mobile number');
            return false;
        }
        if (mobile.length < 10) {
            ToastUtility.showToast('Please enter a valid mobile number');
            return false;
        }
        return true;
    };

    const updateProfile = () => {
        if (!validateForm()) {
            return;
        }

        setShowProgress(true);
        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('dial_code', dialCode);
        formData.append('mobile', mobile.trim());

        ApiMethod.editprofile(
            formData,
            async pass => {
                console.log('Profile update response:', pass);
                setShowProgress(false);

                if (pass.status === true) {
                    ToastUtility.showToast('Profile updated successfully');

                    // Update local user data
                    const updatedUser = { ...userData, name: name.trim(), mobile: mobile.trim(), dial_code: dialCode };
                    await StorageUtility.storeUser(updatedUser);

                    // Navigate back
                    navigation.goBack();
                } else {
                    ToastUtility.showToast(pass.message || 'Failed to update profile');
                }
            },
            async fail => {
                console.log('Profile update failed:', fail);
                setShowProgress(false);

                if (fail.status === 404 && fail.message?.includes('User not found')) {
                    await StorageUtility.logout();
                    ToastUtility.showToast('User not found. Please Re-Login');
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'AuthStack' }],
                        }),
                    );
                } else {
                    ToastUtility.showToast(fail.message || 'Failed to update profile');
                }
            },
        );
    };

    return (
        <Provider>
            <View style={styles.mainContainer}>
                <CustomStatus trans={true} isDark={true} color="#FFFFFF00" />
                <CustomSAView parentStyple={{ flex: 1 }} style={styles.saView}>
                    <CustomHeaderTablet text="Edit Profile" />

                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    >
                        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                            {/* Name Input */}
                            <View style={styles.inputContainer}>
                                <View style={styles.inputHeader}>
                                    <Feather name="user" size={4.5 * width} color={ColorCode.primary} />
                                    <Text style={styles.inputLabel}>Name</Text>
                                </View>
                                <TextInput
                                    style={styles.textInput}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Enter your name"
                                    placeholderTextColor="#868686"
                                    maxLength={50}
                                />
                            </View>

                            {/* Mobile Number Input */}
                            <View style={styles.inputContainer}>
                                <View style={styles.inputHeader}>
                                    <Feather name="phone" size={4.5 * width} color={ColorCode.primary} />
                                    <Text style={styles.inputLabel}>Mobile Number</Text>
                                </View>
                                <TextInput
                                    style={styles.textInput}
                                    value={mobile}
                                    onChangeText={setMobile}
                                    placeholder="Enter mobile number"
                                    placeholderTextColor="#868686"
                                    keyboardType="phone-pad"
                                    maxLength={15}
                                />
                            </View>

                            {/* Update Button */}
                            <TouchableOpacity
                                style={styles.updateButton}
                                onPress={updateProfile}
                                activeOpacity={0.8}>
                                <Text style={styles.updateButtonText}>Update Profile</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </CustomSAView>
            </View>
            <CustomProgress show={showProgress} />
        </Provider>
    );
};

export default EditProfileScreenTablet;

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
    container: {
        flex: 1,
        paddingHorizontal: 2.5 * width,
        paddingTop: 4 * width,
    },
    inputContainer: {
        marginBottom: 4 * width,
    },
    inputHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 1.5 * width,
    },
    inputLabel: {
        color: '#000000',
        fontSize: 3.5 * width,
        fontFamily: Fonts.Medium,
        marginLeft: 2 * width,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 2 * width, // Slightly more rounded
        paddingHorizontal: 3 * width,
        paddingVertical: 2.5 * width, // Standard padding
        height: 5 * height, // Fixed height matching other inputs
        fontSize: 3.4 * width,
        fontFamily: Fonts.Regular,
        color: '#000000',
        backgroundColor: '#FFFFFF',
    },
    updateButton: {
        backgroundColor: ColorCode.primary,
        borderRadius: 2 * width,
        paddingVertical: 1.5 * height, // Adjusted vertical padding
        alignItems: 'center',
        marginTop: 4 * width,
        height: 5.5 * height, // Fixed height for consistency
        justifyContent: 'center',
        ...ConstData.ELEVATION_STYLE,
    },
    updateButtonText: {
        color: '#FFFFFF',
        fontSize: 3.8 * width,
        fontFamily: Fonts.SemiBold,
    },
});
