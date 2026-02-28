import React, { Fragment, useEffect, useState, useCallback, useRef } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Modal as ReactModal,
  StatusBar,
  RefreshControl,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Modal, Provider } from 'react-native-paper';
import CustomStatus from '../../../compenents/CustomStatus';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import ImageView from '../../../compenents/ImageView';
import height from '../../../Units/height';
import width from '../../../Units/width';
import Fonts, { Light } from '../../../utility/Fonts';
import ConstData from '../../../utility/ConstData';
import CustomProgress from '../../../compenents/CustomProgress';
import ApiMethod from '../../../api/ApiMethod';
import StorageUtility from '../../../utility/StorageUtility';
import FastImage from 'react-native-fast-image';
import VersionCheck from 'react-native-version-check';
import { Dropdown } from 'react-native-element-dropdown';
import { BarChart } from 'react-native-gifted-charts';
import ToastUtility from '../../../utility/ToastUtility';
import moment, { min } from 'moment';
import GradePopup from '../../../compenents/GradePopup';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import WeeklyAttendancePopup from '../../../compenents/WeeklyAttendancePopup';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import notifee from '@notifee/react-native';
import ColorCode from '../../../utility/ColorCode';
import BackgroundTimer from 'react-native-background-timer';
import CustomSAView from '../../../compenents/CustomSAView';
import HomeSkeleton from '../../../compenents/HomeSkeleton';

const waitingTime = 5 * 60 * 1000; // 5 min
const clockinInterval = 60 * 60 * 1000; // 1 hour

const HomeTabScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState(null);
  const [homeData, setHomeData] = useState(null);

  const [clockInData, setClockInData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [weekPopupData, setWeekPopupData] = useState(null);
  const [weekPopupPos, setWeekPopupPos] = useState(0);
  const [weekPopupData1, setWeekPopupData1] = useState(null);
  const [showProgress, setShowProgress] = useState(false);
  const [showWeekPopup, setShowWeekPopup] = useState(false);
  const [showWeekPopup1, setShowWeekPopup1] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [adminomment, setAdminComment] = useState('');
  const [showUploadDocument, setShowUploadDocument] = useState(false);
  const [showVerifyingDoc, setShowVerifyingDoc] = useState(false);
  const [isOldUser, setOldUser] = useState(false);
  const [appAccessEnable, setAppAccessEnable] = useState(true);
  const [enableClinicalTrial, setEnableClinicalTrial] = useState(true);
  const [enableClinicalTrialBtn, setEnableClinicalTrialBtn] = useState(true);

  const [showGrades, setShowGrades] = useState(false);
  const googleGraphLable = ['', '', 'F', 'D', 'C', 'B', 'A'];
  const [showFloatingPopup, setShowFloatingPopup] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const lastFetchedRef = React.useRef(0);
  const hasLoadedProfileRef = React.useRef(false);
  const homeDataCallRef = React.useRef(() => { });

  var fixDMY = moment('29-01-2025 00:00:00', 'DD-MM-yyyy HH:mm:ss');



  let timerRef = React.useRef(null);

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  useEffect(() => {
    // const unsubscribe = navigation.addListener('focus', () => {
    //   // The screen is focused Call any action
    //   getUserDetail();
    // });
    //  notifee.onForegroundEvent(({type, detail}) => {
    //   console.log('============onForegroundEvent============');
    //    console.log('detail.notification', detail);
    //    if (detail.notification.id == '654321') {
    //     //  directClockout();
    //    } else if (detail.notification.id == '123456') {
    //     // console.log('notification.data', detail.notification.data);
    //     // var data = detail.notification.data;
    //     // var timeStamp = data.timeStamp;
    //     // console.log('Future timeStamp', timeStamp);
    //     // var current = moment().valueOf();
    //     // console.log('current timeStamp', current);
    //     // if (current >= timeStamp) {
    //     //   notifee.cancelAllNotifications();
    //     //   directClockout();
    //     // }
    //     //  BackgroundTimer.runBackgroundTimer(() => {
    //     //    notifee.cancelDisplayedNotification('123456');
    //     //    directClockout();
    //     //    //    // scheduleClockoutNotif();
    //     //    console.log('============onForegroundEvent Timeout11============');
    //     //  }, ConstData.ScheduleTime);
    //      switch (type) {
    //        case EventType.DISMISSED:
    //         //  if (timer != null) {
    //            // clearInterval(timer);
    //            //  BackgroundTimer.stopBackgroundTimer();
    //            //  directClockout();
    //         //  }
    //          console.log('User dismissed notification', detail.notification);
    //          break;
    //        case EventType.PRESS:
    //          // clearInterval(timer);
    //          //  BackgroundTimer.stopBackgroundTimer();
    //          console.log('User pressed notification', detail.notification);
    //          break;
    //      }
    //    }
    //  });
    getUserDetail({ showLoader: true, runProfileCheck: true });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (lastFetchedRef.current === 0) {
        return;
      }

      const now = Date.now();
      if (now - lastFetchedRef.current > 60 * 1000) {
        homeDataCallRef.current({ showLoader: false });
      }
    }, []),
  );

  const getUserDetail = async ({ showLoader = true, runProfileCheck = false } = {}) => {
    try {
      const uu = await StorageUtility.getUser();
      if (uu) {
        setUser(uu);
      }
    } catch (error) {
      if (__DEV__) {
        console.log('Failed to load user from storage', error);
      }
    }

    homeDataCall({ showLoader, runProfileCheck });
  };

  const homeDataCall = ({
    isRetry = false,
    showLoader = true,
    runProfileCheck = false,
  } = {}) => {
    if (!isRetry) {
      setRetryCount(0);
    }

    if (showLoader) {
      setShowProgress(true);
    }

    ApiMethod.getHomeData(
      pass => {
        if (showLoader) {
          setShowProgress(false);
        }

        if (pass.status == 200) {
          setRetryCount(0);
          setHomeData(pass);

          if (isInitialLoading) {
            setIsInitialLoading(false);
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }).start();
          }

          if (pass.clock_in) {
            setClockInData(pass.clock_in);
          } else {
            ConstData.cancelTriggerNotif();
            setClockInData(null);
          }

          const attendanceSource = pass.attendance || {};
          const tempDateObj = {};
          Object.keys(attendanceSource).forEach(item => {
            const attendanceValue = attendanceSource[item];
            const isPresent = attendanceValue == '1';
            const isAbsent = attendanceValue == '0';

            tempDateObj[item] = {
              disableTouchEvent: false,
              customStyles: {
                container: {
                  backgroundColor: isPresent
                    ? '#16763E'
                    : isAbsent
                      ? '#FF0000'
                      : 'transparent',
                  borderRadius: 9 * width,
                  width: 9 * width,
                  height: 9 * width,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
                text: {
                  color: isPresent || isAbsent ? '#FFFFFF' : '#000000',
                  fontFamily: Fonts.SemiBold,
                },
              },
            };
          });
          setAttendanceData(tempDateObj);

          let totalAttendedMinutes = 0;
          if (pass.attended_time) {
            const t1 = pass.attended_time.split(':');
            if (t1.length > 1) {
              totalAttendedMinutes = Number(t1[0]) * 60 + Number(t1[1]);
            } else {
              totalAttendedMinutes = Number(t1[0]) * 60;
            }
          }

          const allowedMinute = 20 * 60;
          const clinicalData = pass.clinical || {};
          const maxClinicalMinutes =
            Number(clinicalData.total_time || 0) * 60;
          const completedClinicalminutes = Number(
            clinicalData.completed || 0,
          );

          setEnableClinicalTrial(totalAttendedMinutes >= allowedMinute);
          setEnableClinicalTrialBtn(
            completedClinicalminutes < maxClinicalMinutes,
          );

          if (pass.video_watch_percent !== undefined) {
            ConstData.VideoPercentage = Number(pass.video_watch_percent);
          }

          lastFetchedRef.current = Date.now();

          if (runProfileCheck || !hasLoadedProfileRef.current) {
            getProfile({ showLoader: false });
          }
          if (isInitialLoading) {
            setIsInitialLoading(false);
          }
        } else {
          if (!homeData) {
            setHomeData(null);
            setClockInData(null);
            setAttendanceData(null);
          }
          const errorMsg =
            pass.message || 'Failed to load home data. Please try again.';
          ToastUtility.showToast(errorMsg);
          if (isInitialLoading) {
            setIsInitialLoading(false);
          }
        }
      },
      async fail => {
        if (showLoader) {
          setShowProgress(false);
        }

        if (isInitialLoading) {
          setIsInitialLoading(false);
        }

        const failStatus = fail?.status;
        const failMessage = fail?.message || '';

        if (failStatus == 404 && failMessage.includes('User not found')) {
          setHomeData(null);
          setClockInData(null);
          setAttendanceData(null);
          await StorageUtility.logout();
          ToastUtility.showToast('User not found. Please Re-Login');
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'AuthStack' }],
            }),
          );
          return;
        }

        if (
          failStatus == 401 ||
          (failMessage && failMessage.includes('Unauthenticated'))
        ) {
          const session = await StorageUtility.getSession();
          const storedUser = await StorageUtility.getUser();
          const token = await StorageUtility.getJWTToken();
          const hasCachedData = !!homeData;

          if (session === '1' && storedUser && token) {
            if (!isRetry && retryCount < 1) {
              setRetryCount(prev => prev + 1);
              setTimeout(() => {
                homeDataCall({
                  isRetry: true,
                  showLoader,
                  runProfileCheck,
                });
              }, 500);
              return;
            }

            if (!hasCachedData) {
              setHomeData(null);
              setClockInData(null);
              setAttendanceData(null);
            }

            ToastUtility.showToast(
              'Failed to load data. Please pull to refresh or try again later.',
            );
            return;
          } else {
            setHomeData(null);
            setClockInData(null);
            setAttendanceData(null);
            ToastUtility.showToast('Session expired. Please login again.');
            await StorageUtility.logout();
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'AuthStack' }],
              }),
            );
            return;
          }
        }

        if (!homeData) {
          setHomeData(null);
          setClockInData(null);
          setAttendanceData(null);
        }

        const errorMsg =
          failMessage || 'Failed to load home data. Please try again.';
        ToastUtility.showToast(errorMsg);
      },
    );
  };
  homeDataCallRef.current = homeDataCall;

  const getProfile = ({ showLoader = true } = {}) => {
    if (showLoader) {
      setShowProgress(true);
    }
    ApiMethod.getProfile(
      async pass => {
        if (showLoader) {
          setShowProgress(false);
        }
        if (__DEV__) {
          console.log('profile data ********* ', pass);
        }
        if (pass.status == 200) {
          // var data = pass.data;

          ConstData.DocSkipDate = moment(`${pass.data.doc_skip_date} 00:00:00`);
          fixDMY = moment(`${pass.data.doc_skip_date} 00:00:00`);

          // var uc = moment(pass.data.created_at);
          var uc = moment();

          if (__DEV__) {
            console.log('uc', uc.format('DD-MM-yyyy'));
            console.log('fixDMY', fixDMY.format('DD-MM-yyyy'));
          }

          setOldUser(uc <= fixDMY);

          var d = await StorageUtility.checkSkipDoc();
          var d1 = await StorageUtility.checkSkipDocVerify();

          // pass.data.is_doc_uploaded = 1;
          // pass.data.is_verified_doc = 0

          // console.log('=-=--is_verified_doc=-=-', pass.data.is_verified_doc);
          setAppAccessEnable(pass.data.app_access_enable == '1');

          if (pass.data.is_verified_doc == '1') {
            checkVersioUpdate();
          } else if (
            pass.data.is_doc_uploaded == '1' &&
            pass.data.is_verified_doc == '0'
          ) {
            if (
              d1 != moment().format('DD-MM-yyyy') ||
              pass.data.app_access_enable == '0'
            ) {
              setShowVerifyingDoc(true);
            } else {
              checkVersioUpdate();
            }
          } else if (pass.data.is_doc_uploaded == '0') {
            if (
              d != moment().format('DD-MM-yyyy') ||
              pass.data.app_access_enable == '0'
            ) {
              setShowUploadDocument(true);
            } else {
              checkVersioUpdate();
            }
          }


          hasLoadedProfileRef.current = true;
        }
      },
      fail => {
        if (__DEV__) {
          console.log(fail);
        }
        if (showLoader) {
          setShowProgress(false);
        }
        // ToastUtility.showToast('Some Error Occurred.');
      },
    );
  };

  const checkVersioUpdate = () => {
    setTimeout(() => {
      VersionCheck.needUpdate().then(async res => {
        if (__DEV__) {
          console.log(res); // true
        }
        if (res && res.isNeeded) {
          Alert.alert(
            'Update Avalable',
            'A new version is available. Please update your app to use latest features',
            [
              {
                text: 'Update',
                onPress: () => {
                  Linking.openURL(res.storeUrl); // open store if update is needed.
                },
              },
            ],
          );
        }
      });
    }, 1000);
  };

  const convertMinutesToHours = () => {
    var time = homeData?.clinical?.completed;
    var Hours = Math.floor(time / 60);
    var minutes = time % 60;

    if (__DEV__) {
      console.log('clinical hours breakdown', { Hours, minutes });
    }
    var time = `${Hours < 10 ? '0' + Hours : Hours}:${minutes < 10 ? '0' + minutes : minutes
      } `;
    return time;
  };


  const getGradeValue = grade => {
    if (grade == 'A') {
      return 6; //return 100;
    } else if (grade == 'B') {
      return 5; //return 90;
    } else if (grade == 'C') {
      return 4; //return 80;
    } else if (grade == 'D') {
      return 3; //return 70;
    } else if (grade == 'F') {
      return 2; //return 60;
      // } else if (grade == 'F') {
      //   return 50;
    } else {
      return 1; //return 50;
    }
  };

  const clockout = () => {
    Alert.alert('Attention!', 'Are you sure you want to clock out?', [
      {
        text: 'Cancel',
        // onPress: () => {},
      },
      {
        text: 'Clock Out',
        onPress: () => {
          setShowProgress(true);
          ApiMethod.clockOut(
            { end_time: moment().format('HH:mm') },
            async pass => {
              setShowProgress(false);
              if (pass.status) {
                ConstData.cancelTriggerNotif();
                ToastUtility.showToast('Clocked Out');
                // setShowAutoClockout(false);
                homeDataCall();
              } else {
                ToastUtility.showToast(pass.msg);
              }
            },
            async fail => {
              if (__DEV__) {
                console.log('clockout error', fail);
              }
              setShowProgress(false);
              // notifee.cancelTriggerNotification('123456').then(() => {
              //   console.log('All notification cancelled.');
              // });
              if (
                fail.status == 404 &&
                fail.message.includes('User not found')
              ) {
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
        },
      },
    ]);
  };

  const clockin = () => {
    Alert.alert('Attention!', 'Are you sure you want to clock in?', [
      {
        text: 'Cancel',
        // onPress: () => {},
      },
      {
        text: 'Clock In',
        onPress: () => {
          setShowProgress(true);
          ApiMethod.clockIn(
            { start_time: moment().format('HH:mm') },
            async pass => {
              setShowProgress(false);
              if (pass.status) {
                ToastUtility.showToast('Clocked In');
                ConstData.scheduleHourlyNotif();
                // ConstData.scheduleHourlyNotifFCM();
                homeDataCall();
              } else {
                ToastUtility.showToast(pass.msg);
              }
              // ConstData.scheduleHourlyNotifFCM();
            },
            async fail => {
              if (__DEV__) {
                console.log('clockin error', fail);
              }
              setShowProgress(false);

              if (
                fail.status == 404 &&
                fail.message.includes('User not found')
              ) {
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
        },
      },
    ]);
  };

  const getWeeklyOnlineData = week => {
    if (__DEV__) {
      console.log('weekly attendance week', week);
    }
    setWeekPopupPos(week);
    setShowProgress(true);
    ApiMethod.weeklyOnlineAttendance(
      `${week} `,
      async pass => {
        setShowProgress(false);
        if (__DEV__) {
          console.log('weekly attendance response', pass);
        }
        if (pass.status) {
          setWeekPopupData1([
            ...pass.data,
            pass.main_data && {
              time: pass.main_data.pending_hours,
              title: 'Pending Hours',
            },
            pass.main_data && {
              time: pass.main_data.total_hours,
              title: 'Total Assigned Hours',
            },
          ]);

          setShowWeekPopup1(true);
        }
      },
      async fail => {
        ConstData.showErrorMsg(fail);
        if (__DEV__) {
          console.log('weekly attendance error', fail);
        }
        setShowProgress(false);
      },
    );
  };



  const capitalize = word => {
    return word.replace(word.charAt(0), word.charAt(0).toUpperCase());
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return moment(dateString).format('DD MMM, YYYY');
  };

  // Helper function to format time
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return moment(timeString, 'HH:mm:ss').format('hh:mm A');
  };

  // Helper function to format time range
  const formatTimeRange = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';
    const start = moment(startTime, 'HH:mm:ss').format('hh:mm A');
    const end = moment(endTime, 'HH:mm:ss').format('hh:mm A');
    return `${start} - ${end} `;
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    homeDataCallRef.current({ showLoader: false });
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, []);

  return (
    <Provider>
      <CustomStatus trans={true} isDark={true} color={ColorCode.primary} />
      <CustomSAView
        parentStyple={{ flex: 1 }}
        style={{ flex: 1, backgroundColor: ColorCode.primary }}>
        {isInitialLoading ? (
          <HomeSkeleton />
        ) : (
          <Animated.View style={{ flex: 1, backgroundColor: ColorCode.primary, opacity: fadeAnim }}>
            <View
              style={{
                width: '100%',
                height: 10 * height,
                backgroundColor: ColorCode.primary,
                paddingHorizontal: 6 * width,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <View
                style={{
                  color: '#000000',
                  // fontSize: 4 * width,
                  fontFamily: Fonts.SemiBold,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    gap: width * 1,
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 4 * width,
                      fontFamily: Fonts.SemiBold,
                    }}>
                    {'Hello,'}
                  </Text>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 4 * width,
                      fontFamily: Fonts.SemiBold,
                    }}>
                    {`${user?.name?.split(' ')[0] || 'User'}👋`}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 3.2 * width,
                      fontFamily: Fonts.Regular,
                    }}>
                    Stay on Track with Your Learning
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: width * 2,
                }}>


                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('Notification', {
                      course_name: homeData?.course_name,
                    })
                  }
                  style={{
                    height: 6 * height,
                    width: 6 * height,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {/* Icon wrapper */}
                  <View style={{ position: 'relative' }}>
                    <EvilIcons name="bell" size={8 * width} color="#fff" />

                    {homeData?.unread_notification > 0 && (
                      <View
                        style={{
                          position: 'absolute',
                          top: -width * 1,
                          right: -width * 1,
                          backgroundColor: '#FF0000',
                          borderRadius: (width * 5.5) / 2,
                          minWidth: width * 5.5,
                          height: width * 5.5,
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingHorizontal: width * 1.5,
                          zIndex: 10,
                          borderWidth: 1.5,
                          borderColor: ColorCode.primary,
                        }}
                      >
                        <Text
                          style={{
                            color: '#fff',
                            fontSize: width * 2.4,
                            fontFamily: Fonts.SemiBold,
                            lineHeight: width * 3,
                          }}
                        >
                          {homeData.unread_notification}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>


              </View>

            </View>
            {/*  Today class container  */}
            <View
              style={{
                paddingHorizontal: 6 * width,
                backgroundColor: ColorCode.primary,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: '#fff',
                  fontSize: 4 * width,
                  fontFamily: Fonts.SemiBold, 
                }}>
                Today's Class
              </Text>
              <TouchableOpacity
                // onPress={() => navigation.navigate('VirtualSyllabus')}
                onPress={() => navigation.navigate('MySyllabus')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: width * 1,
                }}>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 3.4 * width,
                    fontFamily: Fonts.Medium,
                  }}>
                  Open schedule
                </Text>
                <MaterialIcons
                  name="arrow-forward-ios"
                  size={14}
                  color={'#fff'}
                />
              </TouchableOpacity>
            </View>
            {/*  Today's Class container  */}
            {homeData?.class && (
              <View
                style={{
                  backgroundColor: ColorCode.primary,
                  paddingHorizontal: width * 5,
                }}>
                <View
                  style={{
                    padding: width * 4,
                    backgroundColor: '#fff',
                    marginBottom: width * 4,
                    marginTop: width * 2,
                    borderRadius: width * 2,
                    width: '100%',
                  }}>
                  <Text
                    style={{
                      color: '#000',
                      fontSize: 3.8 * width,
                      fontFamily: Fonts.SemiBold,
                    }}>
                    {homeData?.class?.name || 'No Class Today'}
                  </Text>
                  <View
                    style={{
                      marginTop: width * 2,
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: width * 2,
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        paddingHorizontal: width * 0.5,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          flex: 1,
                          minWidth: '48%',
                          maxWidth: '50%',
                          marginRight: width * 2,
                          flexWrap: 'wrap',
                        }}>
                        <AntDesign name="calendar" size={16} color="#000" />
                        <Text
                          style={{
                            color: '#000',
                            fontSize: 3 * width,
                            fontFamily: Fonts.SemiBold,
                            marginLeft: width * 1,
                            flexShrink: 0,
                          }}
                          maxFontSizeMultiplier={1.1}>
                          Start Date :
                        </Text>
                        <Text
                          style={{
                            color: '#000',
                            fontSize: 3 * width,
                            fontFamily: Fonts.Regular,
                            marginLeft: width * 0.5,
                            flex: 1,
                            flexShrink: 1,
                          }}
                          numberOfLines={1}
                          adjustsFontSizeToFit={true}
                          minimumFontScale={0.65}
                          maxFontSizeMultiplier={1.1}>
                          {formatDate(homeData?.class?.start_date)}
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          flex: 1,
                          minWidth: '48%',
                          maxWidth: '50%',
                          flexWrap: 'wrap',
                        }}>
                        <AntDesign name="clockcircleo" size={16} color="#000" />
                        <Text
                          style={{
                            color: '#000',
                            fontSize: 3 * width,
                            fontFamily: Fonts.SemiBold,
                            marginLeft: width * 1,
                            flexShrink: 0,
                          }}
                          maxFontSizeMultiplier={1.1}>
                          Start Time :
                        </Text>
                        <Text
                          style={{
                            color: '#000',
                            fontSize: 3 * width,
                            fontFamily: Fonts.Regular,
                            marginLeft: width * 0.5,
                            flex: 1,
                            flexShrink: 1,
                          }}
                          numberOfLines={1}
                          adjustsFontSizeToFit={true}
                          minimumFontScale={0.65}
                          maxFontSizeMultiplier={1.1}>
                          {formatTime(homeData?.class?.start_time)}
                        </Text>
                      </View>
                    </View>
                    {homeData?.class?.end_date && (
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          flexWrap: 'wrap',
                          paddingHorizontal: width * 0.5,
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            flex: 1,
                            minWidth: '48%',
                            maxWidth: '50%',
                            marginRight: width * 2,
                            flexWrap: 'wrap',
                          }}>
                          <AntDesign name="calendar" size={16} color="#000" />
                          <Text
                            style={{
                              color: '#000',
                              fontSize: 3 * width,
                              fontFamily: Fonts.SemiBold,
                              marginLeft: width * 1,
                              flexShrink: 0,
                            }}
                            maxFontSizeMultiplier={1.1}>
                            End Date :
                          </Text>
                          <Text
                            style={{
                              color: '#000',
                              fontSize: 3 * width,
                              fontFamily: Fonts.Regular,
                              marginLeft: width * 0.5,
                              flex: 1,
                              flexShrink: 1,
                            }}
                            numberOfLines={1}
                            adjustsFontSizeToFit={true}
                            minimumFontScale={0.65}
                            maxFontSizeMultiplier={1.1}>
                            {formatDate(homeData?.class?.end_date)}
                          </Text>
                        </View>
                        {homeData?.class?.end_time && (
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              flex: 1,
                              minWidth: '48%',
                              maxWidth: '50%',
                              flexWrap: 'wrap',
                            }}>
                            <AntDesign name="clockcircleo" size={16} color="#000" />
                            <Text
                              style={{
                                color: '#000',
                                fontSize: 3 * width,
                                fontFamily: Fonts.SemiBold,
                                marginLeft: width * 1,
                                flexShrink: 0,
                              }}
                              maxFontSizeMultiplier={1.1}>
                              End Time :
                            </Text>
                            <Text
                              style={{
                                color: '#000',
                                fontSize: 3 * width,
                                fontFamily: Fonts.Regular,
                                marginLeft: width * 0.5,
                                flex: 1,
                                flexShrink: 1,
                              }}
                              numberOfLines={1}
                              adjustsFontSizeToFit={true}
                              minimumFontScale={0.65}
                              maxFontSizeMultiplier={1.1}>
                              {formatTime(homeData?.class?.end_time)}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + (height * 10) }}
              style={{
                backgroundColor: '#FFFFFF',
                flex: 1,
                // marginTop: 1 * width,
              }}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[ColorCode.primary]}
                  tintColor={ColorCode.primary}
                />
              }>
              <View style={{ flex: 1 }}>
                {homeData && (
                  <View
                    style={{
                      width: '100%',
                      // paddingVertical: 2 * width
                    }}>
                    <View
                      style={{
                        flex: 1,
                        width: '100%',
                        // marginTop: 1 * width,
                        backgroundColor: '#FFFFFF',
                        paddingHorizontal: 5 * width,
                        // flexDirection: 'row',
                        // justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>

                      <View
                        style={{
                          flex: 1,
                          height: 1 * width,
                          backgroundColor: '#F5F5F5',
                        }}
                      />
                      <View
                        style={{
                          width: '100%',
                          marginTop: 3 * width,
                          marginBottom: 3 * width,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          // backgroundColor: '#ada',
                        }}>
                        <TouchableOpacity
                          onPress={() => {
                            if (user.type == 'online') {
                              navigation.navigate('MySyllabus');
                            } else if (user.type == 'virtual') {
                              navigation.navigate('VirtualSyllabus');
                            } else {
                              navigation.navigate('MySyllabus');
                            }
                          }}
                          style={[
                            Styles.halfRoundShape,
                            {
                              backgroundColor: '#FAFDF5',
                              borderWidth: 1,
                              borderColor: '#B9ECBD80',
                            },
                          ]}>
                          <Image
                            source={require('../../../assets/images/mysyllabushome.png')}
                            style={{
                              width: '30%',
                              height: '30%',
                              resizeMode: 'contain',
                            }}
                          />
                          <Text
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            style={Styles.circleText2}>
                            {'My Syllabus'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate('MyProgress', {
                              course_name: homeData?.course_name,
                              quiz: homeData.quiz_assignment_count,
                            })
                          }
                          style={[
                            Styles.halfRoundShape,
                            {
                              backgroundColor: '#FFFEF2',
                              borderWidth: 1,
                              borderColor: '#EEDE6A80',
                            },
                          ]}>
                          <Image
                            source={require('../../../assets/images/myprogresshome.png')}
                            style={{
                              width: '30%',
                              height: '30%',
                              resizeMode: 'contain',
                            }}
                          />

                          <Text
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            style={Styles.circleText2}>
                            {'My Progress'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => navigation.navigate('MyClassCourses')}
                          style={[
                            Styles.halfRoundShape,
                            {
                              backgroundColor: '#FFF3F7,',
                              borderWidth: 1,
                              borderColor: '#F6A4C080',
                            },
                          ]}>
                          <Image
                            source={require('../../../assets/images/myclasshome.png')}
                            style={{
                              width: '30%',
                              height: '30%',
                              resizeMode: 'contain',
                            }}
                          />

                          <Text
                            style={Styles.circleText2}
                            numberOfLines={1}
                            adjustsFontSizeToFit>
                            {'My Class'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View
                      style={[
                        {
                          width: '92%',
                          paddingHorizontal: 4 * width,
                          paddingVertical: 2 * width,
                          backgroundColor: 'white',
                          alignSelf: 'center',
                          borderRadius: height * 1,
                        },
                        ConstData.ELEVATION_STYLE,
                      ]}>
                      <View
                        style={{
                          width: '100%',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}>
                        <Text
                          style={{
                            color: '#000000',
                            fontSize: 3.8 * width,
                            fontFamily: Fonts.SemiBold,
                            paddingHorizontal: 1 * width,
                          }}>{`Assignments`}</Text>

                        <TouchableOpacity
                          onPress={() => {
                            navigation.navigate('PendingAssignment', { type: 1 });
                          }}
                          style={{
                            height: 4 * height,
                            width: 4 * height,
                            padding: width * 1,
                            backgroundColor: ColorCode.primary,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 2 * width,
                          }}>
                          <Feather
                            name={'arrow-up-right'}
                            size={5 * width}
                            color={'#fff'}
                          />
                        </TouchableOpacity>
                      </View>

                      <View
                        style={[
                          {
                            width: '100%',
                            // height: 25 * height,
                            marginVertical: 2 * width,
                            backgroundColor: '#F7F5FF',
                            borderRadius: 2 * width,
                            padding: 3 * width,
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderRadius: height * 1,
                          },
                        ]}>
                        <View
                          style={{
                            // flexDirection: 'row',
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}>
                          <Text
                            style={{
                              color: '#000',
                              fontSize: 5.5 * width,
                              fontFamily: Fonts.SemiBold,
                              marginTop: 1 * width,
                            }}>{`${homeData.assignment_counts.total_assignment} `}</Text>
                          <Text
                            style={{
                              color: '#000000',
                              fontSize: 3.8 * width,
                              fontFamily: Fonts.SemiBold,
                              textAlign: 'center',
                            }}>{`Total`}</Text>
                        </View>
                        <View
                          style={{
                            // flexDirection: 'row',
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}>
                          <Text
                            style={{
                              color: '#16763E',
                              fontSize: 5.5 * width,
                              fontFamily: Fonts.SemiBold,
                              marginTop: 1 * width,
                            }}>{`${homeData.assignment_counts.submitted_assignment} `}</Text>
                          <Text
                            style={{
                              color: '#000000',
                              fontSize: 3.8 * width,
                              fontFamily: Fonts.SemiBold,
                              textAlign: 'center',
                            }}>{`Uploaded`}</Text>
                        </View>
                        <View
                          style={{
                            // flexDirection: 'row',
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}>
                          <Text
                            style={{
                              color: '#FDC83D',
                              fontSize: 5.5 * width,
                              fontFamily: Fonts.SemiBold,
                              marginTop: 1 * width,
                            }}>{`${Number(homeData.assignment_counts.pending_assignment) >=
                              0
                              ? homeData.assignment_counts.pending_assignment
                              : 0
                              } `}</Text>
                          <Text
                            style={{
                              color: '#000000',
                              fontSize: 3.8 * width,
                              fontFamily: Fonts.SemiBold,
                              textAlign: 'center',
                            }}>{`Pending`}</Text>
                        </View>
                      </View>
                    </View>

                    <View
                      style={[
                        {
                          width: '100%',
                          paddingHorizontal: 4 * width,
                          paddingVertical: 2 * width,
                          backgroundColor: '#fff',
                          width: '92%',
                          alignSelf: 'center',
                          marginTop: width * 4,
                          borderRadius: height * 1,
                        },
                        ConstData.ELEVATION_STYLE,
                      ]}>
                      <Text
                        style={{
                          color: '#000000',
                          fontSize: 4 * width,
                          fontFamily: Fonts.SemiBold,
                          paddingHorizontal: 1 * width,
                        }}>{`Quiz`}</Text>

                      <View
                        style={[
                          {
                            width: '100%',
                            // height: 25 * height,
                            marginVertical: 3 * width,
                            borderRadius: 2 * width,
                            padding: 3 * width,
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#F7F5FF',
                          },
                        ]}>
                        <View
                          style={{
                            // flexDirection: 'row',
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}>
                          <Text
                            style={{
                              color: '#000',
                              fontSize: 5.5 * width,
                              fontFamily: Fonts.SemiBold,
                              marginTop: 1 * width,
                            }}>{`${homeData.quiz_assignment_count.total_assignment} `}</Text>
                          <Text
                            style={{
                              color: '#000000',
                              fontSize: 3.8 * width,
                              fontFamily: Fonts.SemiBold,
                              textAlign: 'center',
                            }}>{`Total`}</Text>
                        </View>

                        <View
                          style={{
                            // flexDirection: 'row',
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}>
                          <Text
                            style={{
                              color: '#16763E',
                              fontSize: 5.5 * width,
                              fontFamily: Fonts.SemiBold,
                              marginTop: 1 * width,
                            }}>{`${homeData.quiz_assignment_count.submitted_assignment} `}</Text>
                          <Text
                            style={{
                              color: '#000000',
                              fontSize: 3.8 * width,
                              fontFamily: Fonts.SemiBold,
                              textAlign: 'center',
                            }}>{`Uploaded`}</Text>
                        </View>

                        <View
                          style={{
                            // flexDirection: 'row',
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}>
                          <Text
                            style={{
                              color: '#FDC83D',
                              fontSize: 5.5 * width,
                              fontFamily: Fonts.SemiBold,
                              marginTop: 1 * width,
                            }}>{`${Number(
                              homeData.quiz_assignment_count.pending_assignment,
                            ) >= 0
                              ? homeData.quiz_assignment_count.pending_assignment
                              : 0
                              } `}</Text>
                          <Text
                            style={{
                              color: '#000000',
                              fontSize: 3.8 * width,
                              fontFamily: Fonts.SemiBold,
                              textAlign: 'center',
                            }}>{`Pending`}</Text>
                        </View>
                      </View>
                    </View>

                    {/*{user?.type != 'online' && ( */}
                    <View
                      style={{
                        width: '100%',
                        paddingHorizontal: 4 * width,
                        paddingVertical: 2 * width,
                        marginTop: width * 2,
                      }}>
                      <View
                        style={{
                          width: '100%',
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingVertical: 3 * width,
                          paddingHorizontal: 1 * width,
                        }}>
                        <Text
                          style={{
                            color: '#000000',
                            fontSize: 4 * width,
                            fontFamily: Fonts.SemiBold,
                          }}>{`Attendance`}</Text>

                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <View
                            style={{
                              width: 4 * width,
                              height: 4 * width,
                              borderRadius: 2 * width,
                              backgroundColor: '#16763E',
                            }}
                          />
                          <Text
                            style={{
                              color: '#000000',
                              fontSize: 3.4 * width,
                              fontFamily: Fonts.Regular,
                              paddingHorizontal: 2 * width,
                            }}>{`Present`}</Text>
                          <View
                            style={{
                              width: 4 * width,
                              height: 4 * width,
                              borderRadius: 2 * width,
                              backgroundColor: '#FF0000',
                              marginStart: 4 * width,
                            }}
                          />
                          <Text
                            style={{
                              color: '#000000',
                              fontSize: 3.4 * width,
                              fontFamily: Fonts.Regular,
                              paddingHorizontal: 2 * width,
                            }}>{`Absent`}</Text>
                        </View>
                      </View>

                      <Calendar
                        style={{
                          borderWidth: 1,
                          borderColor: ColorCode.placeholder1,
                          borderRadius: width * 2,
                          marginTop: width * 2,
                        }}
                        // onDayPress={day => {
                        //   // console.log(day.dateString);
                        //   //setSelected(day.dateString);
                        // }}
                        // hideExtraDays={true}
                        // minDate={'2024-05-1'}
                        // maxDate={'2024-05-25'}
                        disableTouchEvent={true}
                        disabledDaysIndexes={[0]}
                        disableAllTouchEventsForDisabledDays={true}
                        disableAllTouchEventsForInactiveDays={true}
                        markedDates={attendanceData}
                        markingType={'custom'}
                        theme={{
                          textDayHeaderFontFamily: Fonts.SemiBold,
                          textSectionTitleDisabledColor: '#b6c1cd',
                          dayTextColor: '#000000',
                          backgroundColor: '#ffffff',
                          calendarBackground: '#ffffff',
                          textSectionTitleColor: '#16763E',
                          // selectedDayBackgroundColor: '#00adf5',
                          selectedDayTextColor: '#ffffff',
                          todayTextColor: '#000000',
                          // dayTextColor: '#2d4150',
                          textDisabledColor: '#b6c1cd',
                          arrowColor: '#16763E',
                          monthTextColor: '#000000',
                          textMonthFontSize: 4 * width,
                          textMonthFontFamily: Fonts.SemiBold,
                          textDayFontSize: 4 * width,
                          textDayStyle: { textAlignVertical: 'center' },
                        }}
                      />


                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          </Animated.View>
        )}
      </CustomSAView>
      <CustomProgress show={showProgress && !isInitialLoading} />

      <GradePopup
        show={showGrades}
        setShowGrades={b => setShowGrades(b)}
        onDismiss={() => {
          setShowGrades(false);
        }}
      />

      <WeeklyAttendancePopup
        data={weekPopupData}
        dataArr={weekPopupData?.attendance_data}
        week={weekPopupData?.week}
        show={showWeekPopup}
        isOnlineUser={user?.type == 'online'}
        //onClosePopup={b => setShowGrades(b)}
        onDismiss={() => {
          setWeekPopupData(null);
          setShowWeekPopup(false);
        }}
      />

      <Modal
        visible={showWeekPopup1}
        onDismiss={() => {
          setShowWeekPopup1(false);
          setWeekPopupData1([]);
        }}>
        <View
          style={{
            width: '94%',
            padding: 3 * width,
            alignSelf: 'center',
            borderRadius: 2 * width,
            backgroundColor: ColorCode.white,
            alignItems: 'center',
          }}>
          <View
            style={{
              width: '100%',
              marginVertical: 1 * width,
              paddingHorizontal: 2 * width,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text
              style={{
                color: '#000000',
                fontSize: 4 * width,
                fontFamily: Fonts.SemiBold,
              }}>{`Week ${weekPopupPos} Attendance`}</Text>
            <TouchableOpacity
              onPress={() => {
                setShowWeekPopup1(false);
                setWeekPopupData1([]);
              }}>
              <Ionicons name="close" size={6 * width} color={ColorCode.red} />
            </TouchableOpacity>
          </View>

          <View
            style={{
              // width: '100%',
              alignSelf: 'center',
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginTop: 2 * width,
            }}>
            {weekPopupData1?.map((item, index) => {
              return (
                <View
                  key={index}
                  style={{
                    width: '47%',
                    padding: 2 * width,
                    marginHorizontal: 1 * width,
                    marginVertical: 1 * width,
                    borderWidth: 1,
                    borderColor: ColorCode.greyDDD,
                    borderRadius: 2 * width,
                  }}>
                  <Text
                    style={{
                      color: ColorCode.grey888,
                      fontSize: 3 * width,
                      fontFamily: Fonts.Regular,
                    }}>{`${item.title} `}</Text>
                  <Text
                    style={{
                      color: '#000000',
                      fontSize: 3.4 * width,
                      fontFamily: Fonts.Medium,
                    }}>{`${item.time} `}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showComment}
        onDismiss={() => {
          setAdminComment('');
          setShowComment(false);
        }}
        contentContainerStyle={{
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View
          style={{
            width: '80%',
            // height: '80%',
            alignSelf: 'center',
            borderRadius: 2 * width,
            backgroundColor: '#FFFFFF',
          }}>
          <Text
            style={{
              color: '#16763E',
              fontSize: 4 * width,
              fontFamily: Fonts.SemiBold,
              paddingVertical: 4 * width,
              paddingHorizontal: 5 * width,
            }}>{`Comment`}</Text>
          <View
            style={{ height: 1, width: '100%', backgroundColor: '#BCBCBC' }}
          />
          <Text
            style={{
              color: '#000000',
              fontSize: 3.4 * width,
              fontFamily: Fonts.Regular,
              paddingVertical: 4 * width,
              paddingHorizontal: 5 * width,
            }}>{`${adminomment} `}</Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            setAdminComment('');
            setShowComment(false);
          }}
          style={{
            marginTop: width * 5,
            alignSelf: 'center',
            backgroundColor: '#ffffff',
            borderRadius: 2 * width,
          }}>
          <Text
            style={{
              paddingHorizontal: width * 3.5,
              paddingVertical: width * 2,
              color: '#000000',
              fontSize: 13,
            }}>
            Close
          </Text>
        </TouchableOpacity>
      </Modal>


    </Provider>
  );
};

const Styles = StyleSheet.create({
  circle: {
    width: 8 * width,
    height: 8 * width,
    borderRadius: 2 * height,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleText: {
    color: '#000000',
    fontSize: 3 * width,
    fontFamily: Fonts.Medium,
    marginStart: 1 * width,
  },
  clockInOutText: {
    color: '#F6F6F6',
    fontSize: 3.6 * width,
    fontFamily: Fonts.Medium,
  },
  circleText2: {
    color: '#000000',
    fontSize: 3.6 * width,
    fontFamily: Fonts.SemiBold,
    marginTop: width * 3,
    flexShrink: 1,
  },
  headerText: {
    color: '#000000',
    fontSize: 4.4 * width,
    fontFamily: Fonts.SemiBold,
    // marginTop: 2 * width,
  },
  courseText: {
    flex: 1,
    color: '#000000',
    fontSize: 4 * width,
    fontFamily: Fonts.SemiBold,
  },
  courseText1: {
    flex: 1,
    color: '#16763E',
    fontSize: 4 * width,
    fontFamily: Fonts.SemiBold,
  },
  halfRoundShape: {
    width: '32%',
    height: 13 * height,
    backgroundColor: '#FCF2E2',
    borderRadius: 3 * width,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseRoundShape: {
    width: '100%',
    // height: '100%',
    // flex: 1,
    // height: 9 * height,
    marginTop: 2 * width,
    backgroundColor: '#FFFFFF',
    borderRadius: 3 * width,
    alignItems: 'center',
    justifyContent: 'center',
    // flexDirection: 'row',
  },
});

export default HomeTabScreen;
