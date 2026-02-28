import React, { Fragment, useEffect, useState } from 'react';
import {
    Image,
    ImageBackground,
    Linking,
    Platform,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
    Dimensions,
} from 'react-native';
import { Provider } from 'react-native-paper';
import CustomStatus from '../../../compenents/CustomStatus';
import Feather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/MaterialIcons';

const screenWidth = Dimensions.get('window').width;
const width = screenWidth > 420 ? 420 / 100 : screenWidth / 100;
const height = Dimensions.get('window').height / 100;

import ConstData from '../../../utility/ConstData';
import Fonts from '../../../utility/Fonts';
import ToastUtility from '../../../utility/ToastUtility';
import StorageUtility from '../../../utility/StorageUtility';
import ApiMethod from '../../../api/ApiMethod';
import FastImage from 'react-native-fast-image';
import CustomProgress from '../../../compenents/CustomProgress';
import CustomLogoutModal from '../../../compenents/CustomLogoutModal';
import { CommonActions } from '@react-navigation/native';
import VersionCheck from 'react-native-version-check';
import ColorCode from '../../../utility/ColorCode';

const ProfileNewTabScreenTablet = ({ navigation }) => {
    const [userData, setUser] = useState(null);
    const [classname, setClassName] = useState('');
    const [showProgress, setShowProgress] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    useEffect(() => {
        setShowProgress(false);
        const unsubscribe = navigation.addListener('focus', () => {
            getUserDetail();
            getProfile();
        });

        return unsubscribe;
    }, [navigation]);

    const getUserDetail = async () => {
        var uu = await StorageUtility.getUser();
        setUser(uu);
    };

    const getProfile = () => {
        ApiMethod.getProfile(
            async pass => {
                setShowProgress(false);
                if (pass.status == 200) {
                    var data = pass.data;
                    setClassName(data.class);
                }
            },
            async fail => {
                setShowProgress(false);
                if (fail.status == 404 && fail.message.includes('User not found')) {
                    await StorageUtility.logout();
                    ToastUtility.showToast('User not found. Please Re-Login');
                    navigation.dispatch(
                        CommonActions.reset({
                            index: 0,
                            routes: [{ name: 'AuthStack' }],
                        }),
                    );
                }
            },
        );
    };

    const onLogoutPress = () => {
        setShowLogoutModal(true);
    };

    const handleConfirmLogout = async () => {
        setShowLogoutModal(false);
        await StorageUtility.logout();
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'AuthStack' }],
            }),
        );
    };


    const handleMenuPress = item => {
        if (item === 'Change Password') {
            navigation.navigate('ProfileChangePassword');
        }
    };

    const openLegalLink = type => {
        setShowProgress(true);
        ApiMethod.termsAndPrivacy(
            async pass => {
                setShowProgress(false);
                const payload = pass?.data || pass || {};
                const privacyUrl = payload?.privacy || pass?.privacy;
                const termsUrl = payload?.terms || pass?.terms;
                const targetUrl = type === 'privacy' ? privacyUrl : termsUrl;

                if (!targetUrl) {
                    ToastUtility.showToast('Link not available right now.');
                    return;
                }

                try {
                    await Linking.openURL(targetUrl);
                } catch (error) {
                    ToastUtility.showToast('Could not open link.');
                }
            },
            fail => {
                setShowProgress(false);
                ToastUtility.showToast('Unable to load link. Please try again.');
            },
        );
    };

    const MenuItem = ({ iconName, iconLibrary = 'MaterialIcons', title, onPress }) => (
        <TouchableOpacity style={Styles.menuItem} onPress={onPress}>
            <View style={Styles.menuItemLeft}>
                <View style={Styles.iconContainer}>
                    {iconLibrary === 'Feather' ? (
                        <Feather name={iconName} size={4 * width} color="#6c757d" />
                    ) : (
                        <Icon name={iconName} size={4 * width} color="#6c757d" />
                    )}
                </View>
                <Text style={Styles.menuItemText}>{title}</Text>
            </View>
            <Icon name="keyboard-arrow-right" size={4.5 * width} color="#adb5bd" />
        </TouchableOpacity>
    );

    return (
        <Provider>
            <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
                <CustomStatus trans={true} isDark={true} color="#FFFFFF" />
                <SafeAreaView style={{ flex: 1 }}>
                    <View style={{ flex: 1 }}>
                        {/* Standardized Header */}
                        <View style={Styles.header}>
                            <Text style={Styles.headerText}>Your Profile</Text>
                        </View>

                        <View style={{ width: '100%', height: 0.2 * width, backgroundColor: '#F5F5F5' }} />

                        {userData && (
                            <ScrollView style={Styles.scrollView} showsVerticalScrollIndicator={false}>
                                {/* Profile Header */}
                                <View style={Styles.profileHeader}>
                                    <View style={Styles.profileInfo}>
                                        <View style={Styles.avatarContainer}>
                                            <FastImage
                                                source={
                                                    userData.proile_image
                                                        ? { uri: userData.proile_image }
                                                        : require('../../../assets/images/welcome_img.png')
                                                }
                                                style={Styles.avatarImage}
                                            />
                                        </View>
                                        <View style={Styles.profileDetails}>
                                            <Text style={Styles.profileName}>Hi, I'm {userData?.name}</Text>
                                            <Text style={Styles.profileEmail}>{userData?.email}</Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => navigation.navigate('ProfileScreen')}
                                            style={Styles.editButton}>
                                            <Feather name="edit" size={4 * width} color="#6c757d" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Support & Information Section */}
                                <View style={Styles.section}>
                                    <Text style={Styles.sectionTitle}>Support & Information</Text>
                                    <View style={Styles.menuContainer}>
                                        <MenuItem
                                            iconName="folder"
                                            title="Documents"
                                            onPress={() => navigation.navigate('Document')}
                                        />
                                        <MenuItem
                                            iconName="schedule"
                                            title="Subject Schedule"
                                            onPress={() => navigation.navigate('MySyllabus')}
                                        />
                                        <MenuItem
                                            iconName="security"
                                            title="Privacy Policy"
                                            onPress={() => openLegalLink('privacy')}
                                        />
                                        <MenuItem
                                            iconName="description"
                                            title="Terms & Conditions"
                                            onPress={() => openLegalLink('terms')}
                                        />
                                    </View>
                                </View>

                                {/* Account Management Section */}
                                <View style={Styles.section}>
                                    <Text style={Styles.sectionTitle}>Account Management</Text>
                                    <View style={Styles.menuContainer}>
                                        <MenuItem
                                            iconName="lock"
                                            title="Change Password"
                                            onPress={() => handleMenuPress('Change Password')}
                                        />
                                    </View>
                                </View>

                                {/* Logout Button */}
                                <TouchableOpacity style={Styles.logoutButton} onPress={onLogoutPress}>
                                    <Feather name="log-out" size={4 * width} color="#dc3545" />
                                    <Text style={Styles.logoutText}>Logout</Text>
                                </TouchableOpacity>


                                <Text style={Styles.versionText}>
                                    {`App Version ${VersionCheck.getCurrentVersion()}`}
                                </Text>
                            </ScrollView>
                        )}
                    </View>
                </SafeAreaView>
            </View>
            <CustomLogoutModal
                visible={showLogoutModal}
                onCancel={() => setShowLogoutModal(false)}
                onConfirm={handleConfirmLogout}
            />
            <CustomProgress show={showProgress} />
        </Provider>
    );
};

const Styles = StyleSheet.create({
    header: {
        width: '100%',
        height: 5 * height,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 6 * width,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerText: {
        fontSize: 4.5 * width,
        fontFamily: Fonts.SemiBold,
        color: '#000000',
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: width * 6,
    },
    profileHeader: {
        paddingVertical: width * 5,
        marginBottom: width * 2,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 18 * width,
        height: 18 * width,
        borderRadius: 10 * width,
        backgroundColor: '#F1F1F1',
        borderWidth: 5,
        borderColor: '#EDF2F7',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10 * width,
        backgroundColor: '#F1F1F1',
    },
    profileDetails: {
        flex: 1,
        marginLeft: width * 5,
    },
    profileName: {
        fontSize: width * 4.2,
        fontWeight: '600',
        color: '#212529',
        marginBottom: width * 0.5,
        fontFamily: Fonts.SemiBold,
    },
    profileEmail: {
        fontSize: width * 3.2,
        color: '#6c757d',
        fontFamily: Fonts.Regular,
    },
    editButton: {
        width: 8 * width,
        height: 8 * width,
        borderRadius: 4 * width,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8F9FA',
    },
    section: {
        marginBottom: width * 4,
    },
    sectionTitle: {
        fontSize: width * 3.6,
        fontWeight: '600',
        color: '#000',
        marginBottom: width * 3,
        fontFamily: Fonts.SemiBold,
    },
    menuContainer: {
        paddingVertical: width * 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: width * 4,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f9fa',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: width * 6,
        height: width * 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: width * 4,
    },
    menuItemText: {
        fontSize: width * 3.4,
        color: '#666',
        flex: 1,
        fontFamily: Fonts.Medium,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: width * 3,
        marginTop: width * 6,
    },
    logoutText: {
        fontSize: width * 3.6,
        color: '#dc3545',
        fontWeight: '500',
        marginLeft: width * 2,
        fontFamily: Fonts.Medium,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: width * 3,
    },
    deleteText: {
        color: '#dc3545',
        fontSize: 3.2 * width,
        fontFamily: Fonts.Regular,
    },
    versionText: {
        color: ColorCode.greyAAA,
        fontSize: 2.8 * width,
        fontFamily: Fonts.Medium,
        marginTop: width * 6,
        marginBottom: width * 10,
        textAlign: 'center',
    },
});

export default ProfileNewTabScreenTablet;
