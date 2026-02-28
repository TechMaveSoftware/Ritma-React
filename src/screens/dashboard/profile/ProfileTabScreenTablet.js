import React, { useEffect, useState } from 'react';
import {
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
} from 'react-native';
import { Provider } from 'react-native-paper';
import CustomStatus from '../../../compenents/CustomStatus';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomSAView from '../../../compenents/CustomSAView';
import { CommonActions } from '@react-navigation/native';
import ColorCode from '../../../utility/ColorCode';
import Fonts from '../../../utility/Fonts';
import ToastUtility from '../../../utility/ToastUtility';
import StorageUtility from '../../../utility/StorageUtility';
import ApiMethod from '../../../api/ApiMethod';
import FastImage from 'react-native-fast-image';
import CustomProgress from '../../../compenents/CustomProgress';
import Custom_ImagePicker from '../../../compenents/Custom_ImagePicker';
import ConstData from '../../../utility/ConstData';

const screenWidth = Dimensions.get('window').width;
const width = screenWidth > 420 ? 420 / 100 : screenWidth / 100;
const height = Dimensions.get('window').height / 100;

const ProfileTabScreenTablet = ({ navigation }) => {
    const [userData, setUser] = useState(null);
    const [classname, setClassName] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const [showProgress, setShowProgress] = useState(false);

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
        console.log(uu);
        setUser(uu);
    };

    const getProfile = () => {
        ApiMethod.getProfile(
            async pass => {
                console.log('profile data ********* ', pass.data.class);
                setShowProgress(false);
                if (pass.status == 200) {
                    var data = pass.data;
                    data.proile_image = pass.proile_image;

                    setClassName(data.class);
                    setUser(data);
                    await StorageUtility.storeUser(data);
                }
            },
            async fail => {
                console.log(fail);
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

    const updatePicture = path => {
        setShowProgress(true);
        const formData = new FormData();
        formData.append('photo', {
            uri: Platform.OS === 'android' ? path : path.replace('file://', ''),
            type: 'image/*',
            name: `Profile_${Date.now()}.jpg`,
        });

        ApiMethod.editprofilepic(
            formData,
            async pass => {
                console.log('profile data ********* ', pass);
                setShowProgress(false);
                ToastUtility.showToast('Success');
                getProfile();
            },
            async fail => {
                console.log(fail);
                ToastUtility.showToast('fail');
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

    return (
        <Provider>
            <View style={styles.mainContainer}>
                <CustomStatus trans={true} isDark={true} color="#FFFFFF00" />
                <CustomSAView parentStyple={{ flex: 1 }} style={styles.saView}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backBtn}>
                            <Ionicons
                                name="chevron-back"
                                size={6 * width}
                                color={ColorCode.black}
                            />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Edit Profile</Text>
                        <View style={{ width: 10 * width }} />
                    </View>
                    <View style={{ width: '100%', height: 0.1 * height, backgroundColor: '#E5E5E5' }} />

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: height * 10 }}
                        style={styles.contentContainer}>
                        {userData && (
                            <View style={styles.content}>
                                {/* Profile Image */}
                                <View style={styles.imageWrapper}>
                                    <View style={styles.imageContainer}>
                                        <FastImage
                                            source={
                                                userData.proile_image
                                                    ? { uri: userData.proile_image }
                                                    : require('../../../assets/images/welcome_img.png')
                                            }
                                            style={styles.profileImage}
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowPicker(true)}
                                            style={styles.cameraButton}>
                                            <Feather
                                                name="edit-3"
                                                size={4.5 * width}
                                                color={ColorCode.white}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.userName}>{userData?.name}</Text>
                                </View>

                                {/* Name Section */}
                                <View style={[styles.infoCard, ConstData.ELEVATION_STYLE]}>
                                    <Feather name="user" size={5 * width} color={ColorCode.primary} />
                                    <View style={styles.infoTextContainer}>
                                        <Text style={styles.infoLabel}>Name</Text>
                                        <Text style={styles.infoValue}>{userData?.name}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('EditProfileScreen')}
                                        style={styles.editIcon}>
                                        <Feather name="edit-3" size={4 * width} color={ColorCode.primary} />
                                    </TouchableOpacity>
                                </View>

                                {/* Class Section */}
                                <View style={[styles.infoCard, ConstData.ELEVATION_STYLE]}>
                                    <Feather name="book" size={5 * width} color={ColorCode.primary} />
                                    <View style={styles.infoTextContainer}>
                                        <Text style={styles.infoLabel}>Class</Text>
                                        <Text style={styles.infoValue}>{classname ? classname : 'N/A'}</Text>
                                    </View>
                                </View>

                                {/* Mobile Section */}
                                <View style={[styles.infoCard, ConstData.ELEVATION_STYLE]}>
                                    <Feather name="phone-call" size={5 * width} color={ColorCode.primary} />
                                    <View style={styles.infoTextContainer}>
                                        <Text style={styles.infoLabel}>Number</Text>
                                        <Text style={styles.infoValue}>{userData?.mobile}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('EditProfileScreen')}
                                        style={styles.editIcon}>
                                        <Feather name="edit-3" size={4 * width} color={ColorCode.primary} />
                                    </TouchableOpacity>
                                </View>

                                {/* Email Section */}
                                <View style={[styles.infoCard, ConstData.ELEVATION_STYLE]}>
                                    <Feather name="mail" size={5 * width} color={ColorCode.primary} />
                                    <View style={styles.infoTextContainer}>
                                        <Text style={styles.infoLabel}>Email</Text>
                                        <Text style={styles.infoValue}>{userData?.email}</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </CustomSAView>
            </View>

            <Custom_ImagePicker
                visibility={showPicker}
                setVisibility={setShowPicker}
                limit={1}
                enableDocumentPicker={false}
                selectedImagePath={path => {
                    console.log(path);
                    updatePicture(path);
                }}
            />

            <CustomProgress show={showProgress} />
        </Provider>
    );
};

export default ProfileTabScreenTablet;

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
    contentContainer: {
        flex: 1,
        backgroundColor: '#FCFCFC',
    },
    content: {
        alignItems: 'center',
        paddingVertical: 3 * width,
    },
    imageWrapper: {
        alignItems: 'center',
        marginBottom: 4 * width,
    },
    imageContainer: {
        width: 30 * width,
        height: 30 * width,
        position: 'relative',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 20 * width,
        backgroundColor: '#F1F1F1',
        borderWidth: 1.5 * width,
        borderColor: '#FFFFFF',
    },
    cameraButton: {
        width: 9 * width,
        height: 9 * width,
        position: 'absolute',
        right: 1 * width,
        bottom: 1 * width,
        backgroundColor: ColorCode.primary,
        borderRadius: 5 * width,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    userName: {
        color: '#000000',
        fontFamily: Fonts.SemiBold,
        fontSize: 4.5 * width,
        marginTop: 3 * width,
    },
    infoCard: {
        width: '90%',
        paddingHorizontal: 4 * width, // Reduced horizontal padding
        backgroundColor: '#FFFFFF',
        paddingVertical: 1.5 * height, // Reduced vertical padding
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 2 * width,
        marginTop: 1.5 * height,
    },
    infoTextContainer: {
        flex: 1,
        paddingHorizontal: 3 * width,
    },
    infoLabel: {
        color: '#868686',
        fontSize: 2.8 * width,
        fontFamily: Fonts.Medium,
    },
    infoValue: {
        color: '#000000',
        fontSize: 3.4 * width,
        fontFamily: Fonts.Medium,
        marginTop: 0.3 * height,
    },
    editIcon: {
        padding: 1 * width,
    },
});
