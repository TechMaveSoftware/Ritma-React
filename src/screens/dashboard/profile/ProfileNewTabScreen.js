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
} from 'react-native';
import { Provider } from 'react-native-paper';
import CustomStatus from '../../../compenents/CustomStatus';
import Feather from 'react-native-vector-icons/Feather';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import width from '../../../Units/width';
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
import Icon from 'react-native-vector-icons/MaterialIcons';
import height from '../../../Units/height';

const ProfileNewTabScreen = ({ navigation }) => {
  const [userData, setUser] = useState(null);
  const [classname, setClassName] = useState('');
  const [showProgress, setShowProgress] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    setShowProgress(false);
    const unsubscribe = navigation.addListener('focus', () => {
      // The screen is focused Call any action
      getUserDetail();
      getProfile();
    });

    return unsubscribe;
  }, [navigation]);

  const getUserDetail = async () => {
    var uu = await StorageUtility.getUser();
    console.log(uu);
    setUser(uu);
    // var path = await StorageUtility.getProfilePath();
    // setUserPath(path);

    // getProfile();
  };

  const getProfile = () => {
    ApiMethod.getProfile(
      async pass => {
        console.log('profile data ********* ', pass.data.class);
        setShowProgress(false);
        if (pass.status == 200) {
          var data = pass.data;
          setClassName(data.class);
        }
      },

      async fail => {
        console.log(fail);
        setShowProgress(false);
        setNoticeList([]);

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
    console.log(`Pressed: ${item}`);
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

  const MenuItem = ({
    iconName,
    iconLibrary = 'MaterialIcons',
    title,
    onPress,
  }) => (
    <TouchableOpacity style={Styles.menuItem} onPress={onPress}>
      <View style={Styles.menuItemLeft}>
        <View style={Styles.iconContainer}>
          {iconLibrary === 'Feather' ? (
            <Feather name={iconName} size={20} color="#6c757d" />
          ) : (
            <Icon name={iconName} size={20} color="#6c757d" />
          )}
        </View>
        <Text style={Styles.menuItemText}>{title}</Text>
      </View>
      <Icon name="keyboard-arrow-right" size={24} color="#adb5bd" />
    </TouchableOpacity>
  );

  return (
    <Provider>
      <CustomStatus trans={true} isDark={true} color="#FFFFFF" />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              width: '100%',
              height: 7 * height,
              backgroundColor: '#FFFFFF',
              paddingHorizontal: 6 * width,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: '#000000',
                fontFamily: Fonts.SemiBold,
                fontSize: 4.5 * width,
              }}>
              {'Your Profile'}
            </Text>
          </View>

          <View
            style={{
              width: '100%',
              height: 0.5 * width,
              backgroundColor: '#F5F5F5',
            }}
          />

          {userData && (
            <ScrollView style={Styles.scrollView}>
              {/* Profile Header */}
              <View style={Styles.profileHeader}>
                <View style={Styles.profileInfo}>
                  <View
                    style={{
                      width: 18 * width,
                      height: 18 * width,
                      borderRadius: 20 * width,
                      backgroundColor: '#F1F1F1',
                      marginTop: 2 * width,
                      borderWidth: 5,
                      borderColor: '#EDF2F7',
                    }}>
                    <FastImage
                      source={
                        userData.proile_image
                          ? { uri: userData.proile_image }
                          : require('../../../assets/images/welcome_img.png')
                      }
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 20 * width,
                        backgroundColor: '#F1F1F1',
                      }}
                    />
                  </View>
                  <View style={Styles.profileDetails}>
                    <Text style={Styles.profileName}>
                      Hi, I'm {userData?.name}
                    </Text>
                    <Text style={Styles.profileEmail}>{userData?.email}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate('ProfileScreen');
                    }}
                    style={Styles.editButton}>
                    <Feather name="edit" size={20} color="#6c757d" />
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
                    onPress={() => {
                      navigation.navigate('Document');
                    }}
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
              <TouchableOpacity
                style={Styles.logoutButton}
                onPress={onLogoutPress}>
                <Feather name="log-out" size={18} color="#dc3545" />
                <Text style={Styles.logoutText}>Logout</Text>
              </TouchableOpacity>

              <Text
                style={{
                  textAlign: 'center',
                  color: ColorCode.greyAAA,
                  fontSize: 3.2 * width,
                  fontFamily: Fonts.Medium,
                  marginTop: width * 6,
                  marginBottom: width * 10,
                }}>
                {`App Version ${VersionCheck.getCurrentVersion()}`}
              </Text>
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
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
  headerText: {
    color: '#000000',
    fontSize: 4.4 * width,
    fontFamily: Fonts.SemiBold,
    // marginTop: 2 * width,
  },

  headerText1: {
    color: '#000000',
    fontSize: 3.8 * width,
    fontFamily: Fonts.Medium,
    // marginTop: 2 * width,
  },
  weekText: {
    color: '#000000',
    fontSize: 3.4 * width,
    fontFamily: Fonts.Medium,
    marginStart: 3 * width,
    flex: 1,
  },
  weekText1: {
    color: '#000000',
    fontSize: 3.4 * width,
    fontFamily: Fonts.Regular,
    marginTop: 1 * width,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: width * 5,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: width * 5,
    marginBottom: width * 4,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: width * 15,
    height: width * 15,
    borderRadius: height * 8,
    backgroundColor: '#6c757d',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: width * 3,
  },
  avatarText: {
    fontSize: width * 4,
    color: 'white',
  },
  profileDetails: {
    flex: 1,
    marginLeft: width * 2,
  },
  profileName: {
    fontSize: width * 4.2,
    fontWeight: '600',
    color: '#212529',
    marginBottom: width * 1,
  },
  profileEmail: {
    fontSize: width * 3.5,
    color: '#6c757d',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: width * 4,
  },
  sectionTitle: {
    fontSize: width * 3.4,
    fontWeight: '600',
    color: '#000',
    marginBottom: width * 4,
  },
  menuContainer: {
    paddingVertical: width * 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 3,
    paddingVertical: width * 3,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: width * 5,
    height: width * 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: width * 3,
  },
  menuItemText: {
    fontSize: width * 3.6,
    color: '#666',
    flex: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: width * 2,
    marginTop: width * 4,
  },
  logoutText: {
    fontSize: width * 3.6,
    color: '#dc3545',
    fontWeight: '500',
    marginLeft: width * 2,
  },
});

export default ProfileNewTabScreen;
