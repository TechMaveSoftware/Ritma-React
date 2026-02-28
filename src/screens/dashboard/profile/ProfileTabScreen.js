import React, { Fragment, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ImageBackground,
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import width from '../../../Units/width';
import ConstData from '../../../utility/ConstData';
import Fonts from '../../../utility/Fonts';
import ToastUtility from '../../../utility/ToastUtility';
import StorageUtility from '../../../utility/StorageUtility';
import ApiMethod from '../../../api/ApiMethod';
import FastImage from 'react-native-fast-image';
import CustomProgress from '../../../compenents/CustomProgress';
import { CommonActions } from '@react-navigation/native';
import ColorCode from '../../../utility/ColorCode';
import Custom_ImagePicker from '../../../compenents/Custom_ImagePicker';
import CustomHeader from '../../../compenents/CustomHeader';

const ProfileTabScreen = ({ navigation }) => {
  const [userData, setUser] = useState(null);
  const [classname, setClassName] = useState('');

  const [showPicker, setShowPicker] = useState(false);

  const [showProgress, setShowProgress] = useState(false);

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
          data.proile_image = pass.proile_image;

          setClassName(data.class);
          setUser(data);
          await StorageUtility.storeUser(data);
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
        // if (pass.status) {
        getProfile();
        // }
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

  const onLogoutPress = () => {
    Alert.alert('Warning!', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        // style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: async () => {
          await StorageUtility.logout();
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'AuthStack' }],
            }),
          );
        },
      },
    ]);
  };

  const deleteAccount = () => {
    Alert.alert('Warning!', 'Are you sure you want to delete your account?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: async () => {
          setTimeout(() => {
            setShowProgress(false);
            Alert.alert(
              'Success!',
              'Your request has been submitted. Our team will contact you soon.',
            );
          }, 2000);
          setShowProgress(true);
        },
      },
    ]);
  };

  return (
    <Provider>
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <CustomStatus trans={true} isDark={true} color="#FFFFFF" />
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            <CustomHeader text={'Edit Profile'} customStyle={{ marginTop: 0 }} />

            {userData && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: height * 10 }}
                style={{ flex: 1, width: '100%' }}>
                <View
                  style={{
                    flex: 1,
                    width: '100%',
                    backgroundColor: '#FFFFFF',
                    paddingVertical: 3 * width,
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      width: 30 * width,
                      height: 30 * width,
                      borderRadius: 20 * width,
                      backgroundColor: '#F1F1F1',
                      marginTop: 2 * width,
                      padding: 1,
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
                    <TouchableOpacity
                      onPress={() => {
                        setShowPicker(true);
                      }}
                      style={{
                        width: 8 * width,
                        height: 8 * width,
                        position: 'absolute',
                        right: 1 * width,
                        bottom: 1 * width,
                        backgroundColor: ColorCode.primary,
                        borderRadius: 5 * width,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      {/* <Ionicons
                      name="edit"
                      size={5 * width}
                      color={ColorCode.white}
                    /> */}
                      <Feather
                        name="edit-3"
                        size={4 * width}
                        color={ColorCode.white}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text
                    style={{
                      color: '#000000',
                      fontFamily: Fonts.SemiBold,
                      fontSize: 4 * width,
                      marginTop: 3 * width,
                    }}>
                    {userData?.name}
                  </Text>

                  <View
                    style={[
                      {
                        width: '90%',
                        paddingHorizontal: 4 * width,
                        backgroundColor: '#FFFFFF',
                        paddingVertical: 1 * height,
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderRadius: 1 * width,
                        marginTop: 2 * height,
                      },
                      ConstData.ELEVATION_STYLE,
                    ]}>
                    <Feather
                      name="user"
                      size={6 * width}
                      color={ColorCode.primary}
                    />
                    <View
                      style={{
                        flex: 1,
                        paddingHorizontal: 4 * width,
                        paddingVertical: 1 * width,
                      }}>
                      <Text
                        style={{
                          color: '#868686',
                          fontSize: 3 * width,
                          fontFamily: Fonts.Medium,
                        }}>
                        Name
                      </Text>
                      <Text
                        style={{
                          color: '#000000',
                          fontSize: 3.4 * width,
                          fontFamily: Fonts.Medium,
                        }}>
                        {userData?.name}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('EditProfileScreen')}
                      style={{
                        padding: 1 * width,
                      }}>
                      <Feather
                        name="edit-3"
                        size={4 * width}
                        color={ColorCode.primary}
                      />
                    </TouchableOpacity>
                  </View>

                  <View
                    style={[
                      {
                        width: '90%',
                        paddingHorizontal: 4 * width,
                        backgroundColor: '#FFFFFF',
                        paddingVertical: 1 * height,
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderRadius: 1 * width,
                        marginTop: 2 * height,
                      },
                      ConstData.ELEVATION_STYLE,
                    ]}>
                    <Feather
                      name="book"
                      size={6 * width}
                      color={ColorCode.primary}
                    />
                    <View
                      style={{
                        flex: 1,
                        paddingHorizontal: 4 * width,
                        paddingVertical: 1 * width,
                      }}>
                      <Text
                        style={{
                          color: '#868686',
                          fontSize: 3 * width,
                          fontFamily: Fonts.Medium,
                        }}>
                        Class
                      </Text>
                      <Text
                        style={{
                          color: '#000000',
                          fontSize: 3.4 * width,
                          fontFamily: Fonts.Medium,
                        }}>
                        {classname ? classname : 'N/A'}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      {
                        width: '90%',
                        paddingHorizontal: 4 * width,
                        backgroundColor: '#FFFFFF',
                        paddingVertical: 1 * height,
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderRadius: 1 * width,
                        marginTop: 2 * height,
                      },
                      ConstData.ELEVATION_STYLE,
                    ]}>
                    <Feather
                      name="phone-call"
                      size={6 * width}
                      color={ColorCode.primary}
                    />
                    <View
                      style={{
                        flex: 1,
                        paddingHorizontal: 4 * width,
                        paddingVertical: 1 * width,
                      }}>
                      <Text
                        style={{
                          color: '#868686',
                          fontSize: 3 * width,
                          fontFamily: Fonts.Medium,
                        }}>
                        Number
                      </Text>
                      <Text
                        style={{
                          color: '#000000',
                          fontSize: 3.4 * width,
                          fontFamily: Fonts.Medium,
                        }}>
                        {userData?.mobile}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('EditProfileScreen')}
                      style={{
                        padding: 1 * width,
                      }}>
                      <Feather
                        name="edit-3"
                        size={4 * width}
                        color={ColorCode.primary}
                      />
                    </TouchableOpacity>
                  </View>

                  <View
                    style={[
                      {
                        width: '90%',
                        paddingHorizontal: 4 * width,
                        backgroundColor: '#FFFFFF',
                        paddingVertical: 1 * height,
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderRadius: 1 * width,
                        marginTop: 2 * height,
                      },
                      ConstData.ELEVATION_STYLE,
                    ]}>
                    <Feather
                      name="mail"
                      size={6 * width}
                      color={ColorCode.primary}
                    />
                    <View
                      style={{
                        flex: 1,
                        paddingHorizontal: 4 * width,
                        paddingVertical: 1 * width,
                      }}>
                      <Text
                        style={{
                          color: '#868686',
                          fontSize: 3 * width,
                          fontFamily: Fonts.Medium,
                        }}>
                        Email
                      </Text>
                      <Text
                        style={{
                          color: '#000000',
                          fontSize: 3.4 * width,
                          fontFamily: Fonts.Medium,
                        }}>
                        {userData?.email}
                      </Text>
                    </View>
                  </View>

                  {/* <View
              style={{
                width: '88%',
                flexDirection: 'row',
                paddingVertical: 1 * height,
                marginTop: 2 * height,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <TouchableOpacity
                onPress={() => {
                  onLogoutPress();
                }}
                style={{
                  flexDirection: 'row',
                  paddingVertical: 1 * height,
                  alignItems: 'center',
                }}>
                <MaterialCommunityIcons
                  name={'logout'}
                  size={6 * width}
                  color="#E92020"
                />
                <Text
                  style={{
                    textAlignVertical: 'center',
                    color: '#E92020',
                    fontSize: 4 * width,
                    fontFamily: Fonts.Medium,
                    paddingHorizontal: 2 * width,
                  }}>
                  LOGOUT
                </Text>
              </TouchableOpacity>

              {Platform.OS == 'ios' && (
                <TouchableOpacity
                  onPress={() => {
                    deleteAccount();
                  }}
                  style={{
                    flexDirection: 'row',
                    paddingVertical: 1 * height,
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      textAlignVertical: 'center',
                      color: '#121212',
                      fontSize: 4 * width,
                      fontFamily: Fonts.Regular,
                      paddingHorizontal: 2 * width,
                    }}>
                    Delete Account
                  </Text>
                </TouchableOpacity>
              )}
            </View> */}
                </View>
              </ScrollView>
            )}
          </View>
        </SafeAreaView>
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
});

export default ProfileTabScreen;
