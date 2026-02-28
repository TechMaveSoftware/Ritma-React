import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Platform,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Provider } from 'react-native-paper';
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

const ForgetPasswordTablet = ({ navigation }) => {
    const [userName, setUserName] = useState('');
    const [showProgress, setShowProgress] = useState(false);

    useEffect(() => {
        setShowProgress(false);
    }, []);

    const forgotPwd = () => {
        if (userName.trim() === '') {
            ToastUtility.showToast('Please enter registered email');
            return;
        }

        setShowProgress(true);
        const formData = new FormData();
        formData.append('email', userName.trim());

        ApiMethod.forgotPassword(
            formData,
            async pass => {
                setShowProgress(false);
                if (pass.status == 200) {
                    navigation.navigate('VerifyOtp', { email: userName.trim() });
                    ToastUtility.showToast(pass.message);
                } else {
                    ToastUtility.showToast('Please enter registered email');
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
                <CustomSAView parentStyple={{ flex: 1 }} style={styles.saView}>
                    <CustomHeaderTablet text="Forgot Password" />

                    <KeyboardAwareScrollView
                        contentContainerStyle={styles.scrollContent}
                        extraScrollHeight={Platform.OS === 'ios' ? 20 : 0}
                        enableOnAndroid={true}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.contentCard}>
                            <Text style={styles.heading}>Let's reset your password</Text>
                            <Text style={styles.subHeading}>
                                Please enter your registered email for reset password
                            </Text>

                            <Text style={styles.label}>Email Address</Text>
                            <TextInput
                                style={styles.textInput}
                                placeholderTextColor="#A4A4A4"
                                placeholder="Enter Email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={userName}
                                onChangeText={setUserName}
                            />

                            <CustomButton
                                btnText="Next"
                                colors={['#1B94EF', '#1B94EF']}
                                enable={true}
                                btnStyle={styles.nextBtn}
                                btnTextStyle={styles.nextBtnText}
                                onPress={forgotPwd}
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
        marginBottom: 4 * height,
    },
    label: {
        color: '#000000',
        fontSize: 3.2 * width,
        fontFamily: Fonts.SemiBold,
        marginBottom: 1.2 * height,
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
    nextBtn: {
        width: '100%',
        marginTop: 4 * height,
        marginBottom: 2 * height,
    },
    nextBtnText: {
        fontFamily: Fonts.Medium,
        fontSize: 3 * width,
    },
});

export default ForgetPasswordTablet;
