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
  SafeAreaView,
} from 'react-native';
import { Modal, Provider } from 'react-native-paper';
import CustomStatus from '../../../compenents/CustomStatus';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import ImageView from '../../../compenents/ImageView';
import height from '../../../Units/height';
// import width from '../../../Units/width';
const { width: screenWidth } = Dimensions.get('window');
// Clamp the width to avoid overly large scaling on tablets (treat max width as 500 for scaling units)
const width = (screenWidth > 420 ? 420 : screenWidth) * 0.01;
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
import HomeSkeletonTablet from '../../../compenents/HomeSkeletonTablet';

const waitingTime = 5 * 60 * 1000; // 5 min
const clockinInterval = 60 * 60 * 1000; // 1 hour

const HomeTabScreenTablet = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [homeData, setHomeData] = useState(null);
  // const [totalHours, setTotalHours] = useState("");
  // const [pendingHours, setPeningHours] = useState("");
  // const [completedHours, setCompletedHours] = useState("");
  // const [gradeData, setGradeData] = useState(null);
  const [clockInData, setClockInData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [weekPopupData, setWeekPopupData] = useState(null);
  const [weekPopupPos, setWeekPopupPos] = useState(0);
  const [weekPopupData1, setWeekPopupData1] = useState(null);
  // const [googleGraph, setGoogleGraph] = useState([]);
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
  // const [showAutoClockout, setShowAutoClockout] = useState(false);

  // const currentYear = new Date().getFullYear();
  // const years = Array.from({length: 2}, (_, index) => ({
  //   label: `${currentYear - index}`,
  //   value: currentYear - index,
  // }));

  // const [selectedYear, setSelectedYear] = useState(currentYear);

  // const [visible, setVisible] = useState(null);
  // const [attendance, setAttendance] = useState(true);
  // const [assignment, setAssignment] = useState(true);
  // const [showSkillGraph, setShowSkillGraph] = useState(false);
  // const [graphData, setGraphData] = useState([]);
  // const [skillGraphData, setSkillkGraphData] = useState([]);
  // const [googleGraphData, setGoogleGraphData] = useState([]);
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

  // const handleYearChange = year => {
  //   console.log('years**********************************************', year);
  //   setSelectedYear(year.value);
  //   // Call your API or perform any other actions here
  //   apiCall(year.value);
  // };

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

          // if (
          //   pass.data.is_verified_doc == '1' ||
          //   pass.data.app_access_enable == '1'
          // ) {
          //   checkVersioUpdate();
          // } else if (
          //   pass.data.is_verified_doc == '0' &&
          //   pass.data.app_access_enable == '0' &&
          //   moment().format('DD-MM-yyyy') == d
          // ) {
          //   checkVersioUpdate();
          // } else if (pass.data.is_verified_doc == '0') {
          //   if (pass.data.is_doc_uploaded == '0') {
          //     setShowUploadDocument(true);
          //   } else {
          //     setShowVerifyingDoc(true);
          //   }
          // }

          // if (pass.data.is_verified_doc == '0') {
          //   if (pass.data.app_access_enable == '0') {
          //     if (pass.data.is_doc_uploaded == '0') {
          //       setShowUploadDocument(true);
          //     } else {
          //       setShowVerifyingDoc(true);
          //     }
          //   } else {
          //     checkVersioUpdate();
          //   }
          // } else {
          //   checkVersioUpdate();
          // }

          // setShowVerifyingDoc(true);
          // if (uc > fixDMY && pass.data.is_verified_doc == '0') {
          //   if (pass.data.is_doc_uploaded == '0') {
          //     setShowUploadDocument(true);
          //   } else {
          //     setShowVerifyingDoc(true);
          //   }
          // } else if (
          //   moment().format('DD-MM-yyyy') != d &&
          //   pass.data.is_verified_doc == '0'
          // ) {
          //   if (pass.data.is_doc_uploaded == '0') {
          //     setShowUploadDocument(true);
          //   } else {
          //     setShowVerifyingDoc(true);
          //   }
          // } else {
          //   checkVersioUpdate();
          // }

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
      }`;
    return time;
  };

  // const checkimeOutSetting = () => {
  //   BackgroundTimer.runBackgroundTimer(() => {
  //     //    // notifee.cancelDisplayedNotification('123456');
  //     //    directClockout();
  //     //    // scheduleClockoutNotif();
  //        console.log('============onForegroundEvent Timeout11============');
  //   }, 1 * 10 * 60 * 1000);

  //   switch (type) {
  //     case EventType.DISMISSED:
  //       if (timer != null) {
  //         // clearInterval(timer);
  //         BackgroundTimer.stopBackgroundTimer();
  //         directClockout();
  //       }
  //       console.log('User dismissed notification', detail.notification);
  //       break;
  //     case EventType.PRESS:
  //       // clearInterval(timer);
  //       BackgroundTimer.stopBackgroundTimer();
  //       console.log('User pressed notification', detail.notification);
  //       break;
  //   }
  // };

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

  // const directClockout = () => {
  //   setShowProgress(true);
  //   ApiMethod.clockOut(
  //     {end_time: moment().format('HH:mm')},
  //     async pass => {
  //       setShowProgress(false);
  //       if (pass.status) {
  //         notifee.cancelAllNotifications().then(() => {
  //           console.log('All notification cancelled.');
  //         });
  //         BackgroundTimer.stopBackgroundTimer();
  //         ToastUtility.showToast('Clocked Out');
  //         homeDataCall();
  //         ConstData.showNormalNotification('You have been clocked out.');
  //       } else {
  //         ToastUtility.showToast(pass.msg);
  //       }
  //     },
  //     async fail => {
  //       notifee.cancelTriggerNotification('123456').then(() => {
  //         console.log('All notification cancelled.');
  //       });
  //       console.log(fail);
  //       setShowProgress(false);

  //       if (fail.status == 404 && fail.message.includes('User not found')) {
  //         await StorageUtility.logout();
  //         ToastUtility.showToast('User not found. Please Re-Login');
  //         navigation.dispatch(
  //           CommonActions.reset({
  //             index: 0,
  //             routes: [{name: 'AuthStack'}],
  //           }),
  //         );
  //       }
  //     },
  //   );
  // };

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
      `${week}`,
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

  // async function onDisplayNotification() {
  //   // Request permissions (required for iOS)
  //   await notifee.requestPermission();

  //   // Create a channel (required for Android)
  //   const channelId = await notifee.createChannel({
  //     id: 'gce_education',
  //     name: 'GCE-Education',
  //   });

  //   var date = moment();
  //   // date = date.add(1, 'hour');
  //   date = date.add(15, 'minute');
  //   date = date.set('second', 0);

  //   console.log('date', date);

  //   var timeStampPass = date.valueOf();

  //   console.log('date - time', moment(date).format('DD-MM-yyyy - HH:mm:ss'));
  //   console.log('timeStampPass', timeStampPass);

  //   const trigger: IntervalTrigger = {
  //     type: TriggerType.INTERVAL,
  //     interval: 16,
  //     timeUnit: TimeUnit.MINUTES,
  //   };

  //   // await notifee.cancelTriggerNotification('123456');

  //   //code that will be called every 3 seconds
  //   // notifee
  //   //   .displayNotification({
  //   //     id: '123456',
  //   //     title: 'GCE-Education',
  //   //     body: 'Clocked In in a Start',
  //   //     android: {
  //   //       channelId,
  //   //       smallIcon: 'ic_notification', // optional, defaults to 'ic_launcher'.
  //   //       color: ColorCode.primary,
  //   //       // pressAction is needed if you want the notification to open the app when pressed
  //   //       pressAction: {
  //   //         id: 'mark-as-read',
  //   //       },
  //   //     },
  //   //   })
  //   //   .then(notificationId => {
  //   //     console.log('showed==>>  ' + notificationId);
  //   //     ToastUtility.showToast('showed==>>  ' + notificationId);
  //   //   });
  //     // BackgroundTimer.runBackgroundTimer(() => {}, 60*1000);

  //   notifee
  //     .displayNotification({
  //       id: '123456',
  //       title: 'GCE-Education',
  //       body: 'Clocked In in a Start',
  //       android: {
  //         channelId,
  //         smallIcon: 'ic_notification', // optional, defaults to 'ic_launcher'.
  //         color: ColorCode.primary,
  //         // pressAction is needed if you want the notification to open the app when pressed
  //         pressAction: {
  //           id: 'mark-as-read',
  //         },
  //       },
  //     })
  //     .then(notificationId => {
  //       console.log('showed==>>  ' + notificationId);
  //       ToastUtility.showToast('showed==>>  ' + notificationId);
  //     });

  //   // Display a notification
  //   // await notifee
  //   //   .createTriggerNotification(
  //   //     {
  //   //       id: '1234567',
  //   //       title: 'GCE-Education',
  //   //       body: 'Clocked In in a course',
  //   //       android: {
  //   //         channelId: channelId,
  //   //         smallIcon: 'ic_notification', // optional, defaults to 'ic_launcher'.
  //   //         color: ColorCode.primary,
  //   //         // pressAction is needed if you want the notification to open the app when pressed
  //   //         pressAction: {
  //   //           id: 'mark-as-read',
  //   //         },
  //   //       },
  //   //     },
  //   //     trigger,
  //   //   );

  //   // var all = await notifee.getTriggerNotifications();
  //   // await notifee.cancelAllNotifications();
  //   // console.log('all', all);
  // }

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
    return `${start} - ${end}`;
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
      <SafeAreaView style={{ flex: 0, backgroundColor: ColorCode.primary }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: ColorCode.white }}>
        <View style={{ flex: 1, backgroundColor: ColorCode.primary }}>
          {isInitialLoading ? (
            <HomeSkeletonTablet />
          ) : (
            <Animated.View style={{ flex: 1, backgroundColor: ColorCode.primary, opacity: fadeAnim }}>
              <View
                style={{
                  width: '100%',
                  paddingVertical: 2.5 * width,
                  backgroundColor: ColorCode.primary,
                  paddingHorizontal: 2.5 * width,
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
                        fontSize: 3.5 * width, // Increased from 3
                        fontFamily: Fonts.SemiBold,
                      }}>
                      {'Hello,'}
                    </Text>
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 3.5 * width, // Increased from 3
                        fontFamily: Fonts.SemiBold,
                      }}>
                      {`${user?.name?.split(' ')[0] || 'User'}👋`}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <Text
                      style={{
                        color: '#fff',
                        fontSize: 2.6 * width, // Increased from 2.2
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
                  {/* <TouchableOpacity
                onPress={() => navigation.navigate('NotificationTest')}
                style={{
                  height: 6 * height,
                  width: 6 * height,
                  padding: width * 2,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 3 * height,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                }}>
                <Ionicons name="notifications-outline" size={8 * width} color="#fff" />
              </TouchableOpacity> */}

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

                  {/*
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                <FastImage
                  source={
                    user && user.proile_image
                      ? {uri: user.proile_image}
                      : require('../../../assets/images/tab_profile.png')
                  }
                  style={{
                    height: 6 * height,
                    width: 6 * height,
                    borderRadius: 4 * height,
                    backgroundColor: '#DADADA',
                    resizeMode:
                      user && user.upload_profile ? 'cover' : 'contain',
                    padding: 2 * height,
                  }}
                />
              </TouchableOpacity>
            */}
                </View>

              </View>
              {/*  Today class container  */}
              <View
                style={{
                  paddingHorizontal: 2.5 * width,
                  backgroundColor: ColorCode.primary,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 3.5 * width, // Increased from 3
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
                      fontSize: 2.8 * width, // Increased from 2.4
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
                        fontSize: 3.4 * width, // Increased from 3
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
                            flexWrap: 'wrap',
                          }}>
                          <AntDesign name="calendar" size={3 * width} color="#000" />
                          <Text
                            style={{
                              color: '#000',
                              fontSize: 2.6 * width, // Increased from 2.2
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
                              fontSize: 2.6 * width, // Increased from 2.2
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
                          <AntDesign name="clockcircleo" size={3 * width} color="#000" />
                          <Text
                            style={{
                              color: '#000',
                              fontSize: 2.6 * width, // Increased from 2.2
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
                              fontSize: 2.6 * width, // Increased from 2.2
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
                            <AntDesign name="calendar" size={3 * width} color="#000" />
                            <Text
                              style={{
                                color: '#000',
                                fontSize: 2.6 * width, // Increased from 2.2
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
                                fontSize: 2.6 * width, // Increased from 2.2
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
                              <AntDesign name="clockcircleo" size={3 * width} color="#000" />
                              <Text
                                style={{
                                  color: '#000',
                                  fontSize: 2.6 * width, // Increased from 2.2
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
                                  fontSize: 2.6 * width, // Increased from 2.2
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
                contentContainerStyle={{ paddingBottom: height * 10 }}
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
                        paddingHorizontal: 2.5 * width,
                        // flexDirection: 'row',
                        // justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      {/* <View
                style={{
                  width: '100%',
                  height: 25 * height,
                  marginTop: 4 * width,
                  // backgroundColor: '#ada',
                }}>
                <FastImage
                  source={require('../../../assets/images/banner1.png')}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 4 * width,
                    resizeMode: 'cover',
                  }}
                />
              </View> */}
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
                            Styles.navContainer,
                            {
                              backgroundColor: '#b7e1ba',
                              borderColor: '#22C55E20',
                            },
                          ]}>
                          <View style={[Styles.iconCircle, { backgroundColor: '#22C55E' }]}>
                            <Image
                              source={require('../../../assets/images/book.png')}
                              style={Styles.navIcon}
                            />
                          </View>
                          <Text
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            style={Styles.navText}>
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
                            Styles.navContainer,
                            {
                              backgroundColor: '#eeb6f6',
                              borderColor: '#A855F720',
                            },
                          ]}>
                          <View style={[Styles.iconCircle, { backgroundColor: '#A855F7' }]}>
                            <Image
                              source={require('../../../assets/images/progress.png')}
                              style={Styles.navIcon}
                            />
                          </View>

                          <Text
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            style={Styles.navText}>
                            {'My Progress'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => navigation.navigate('MyClassCourses')}
                          style={[
                            Styles.navContainer,
                            {
                              backgroundColor: '#f2d9b2',
                              borderColor: '#F9731620',
                            },
                          ]}>
                          <View style={[Styles.iconCircle, { backgroundColor: '#F97316' }]}>
                            <Image
                              source={require('../../../assets/images/cap.png')}
                              style={Styles.navIcon}
                            />
                          </View>

                          <Text
                            style={Styles.navText}
                            numberOfLines={1}
                            adjustsFontSizeToFit>
                            {'My Class'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingHorizontal: 4 * width,
                        marginTop: width * 3,
                      }}>
                      {/* Quiz Container */}
                      <View
                        style={[
                          Styles.sideContainer,
                          ConstData.ELEVATION_STYLE,
                        ]}>
                        <Text style={Styles.sideHeader}>{'Quiz'}</Text>
                        <View style={Styles.statsCard}>
                          <View style={Styles.statItem}>
                            <Text style={Styles.statNumber}>
                              {String(homeData.quiz_assignment_count.total_assignment).padStart(2, '0')}
                            </Text>
                            <Text style={Styles.statLabel}>{'Total'}</Text>
                          </View>
                          <View style={Styles.statItem}>
                            <Text style={[Styles.statNumber, { color: '#22C55E' }]}>
                              {String(homeData.quiz_assignment_count.submitted_assignment).padStart(2, '0')}
                            </Text>
                            <Text style={Styles.statLabel}>{'Uploaded'}</Text>
                          </View>
                          <View style={Styles.statItem}>
                            <Text style={[Styles.statNumber, { color: '#F97316' }]}>
                              {String(Math.max(0, homeData.quiz_assignment_count.pending_assignment)).padStart(2, '0')}
                            </Text>
                            <Text style={Styles.statLabel}>{'Pending'}</Text>
                          </View>
                        </View>
                      </View>

                      {/* Assignments Container */}
                      <View
                        style={[
                          Styles.sideContainer,
                          ConstData.ELEVATION_STYLE,
                        ]}>
                        <View style={Styles.sideHeaderRow}>
                          <Text style={Styles.sideHeader}>{'Assignments'}</Text>
                          <TouchableOpacity
                            onPress={() => navigation.navigate('PendingAssignment', { type: 1 })}
                            style={Styles.arrowBtn}>
                            <Feather name={'arrow-up-right'} size={2.5 * width} color={'#fff'} />
                          </TouchableOpacity>
                        </View>
                        <View style={Styles.statsCard}>
                          <View style={Styles.statItem}>
                            <Text style={Styles.statNumber}>
                              {String(homeData.assignment_counts.total_assignment).padStart(2, '0')}
                            </Text>
                            <Text style={Styles.statLabel}>{'Total'}</Text>
                          </View>
                          <View style={Styles.statItem}>
                            <Text style={[Styles.statNumber, { color: '#22C55E' }]}>
                              {String(homeData.assignment_counts.submitted_assignment).padStart(2, '0')}
                            </Text>
                            <Text style={Styles.statLabel}>{'Uploaded'}</Text>
                          </View>
                          <View style={Styles.statItem}>
                            <Text style={[Styles.statNumber, { color: '#F97316' }]}>
                              {String(Math.max(0, homeData.assignment_counts.pending_assignment)).padStart(2, '0')}
                            </Text>
                            <Text style={Styles.statLabel}>{'Pending'}</Text>
                          </View>
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
                            fontSize: 3.2 * width, // Reduced from 4
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
                          width: '100%',
                          // height: 50 * height, // Removed fixed height to avoid empty space
                          paddingBottom: width * 1,
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
                          textMonthFontSize: 5 * width,
                          textMonthFontFamily: Fonts.SemiBold,
                          textDayHeaderFontSize: 3 * width, // Slightly reduced to prevent truncation
                          textDayFontSize: 4 * width,
                          textDayStyle: { textAlignVertical: 'center' },
                          'stylesheet.calendar.header': {
                            dayHeader: {
                              marginTop: 2,
                              marginBottom: 7,
                              width: 8 * width, // Ensure wide enough container for headers
                              textAlign: 'center',
                              fontSize: 3 * width,
                              fontFamily: Fonts.SemiBold,
                              color: '#16763E',
                            },
                          },
                        }}
                      />


                    </View>
                    {/* )} */}
                    {/* <View
                style={{
                  flex: 1,
                  width: '100%',
                  backgroundColor: '#FFFFFF',
                  paddingHorizontal: 2.5 * width,
                  paddingVertical: 3 * width,
                }}>
                <Text style={Styles.headerText}>{'My Syllabus'}</Text>

                {homeData?.course_name ? (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('AssignmentList', {
                        course_name: homeData?.course_name,
                      })
                    }
                    style={[
                      Styles.courseRoundShape,
                      ConstData.ELEVATION_STYLE,
                    ]}>
                    <FastImage
                      source={
                        homeData?.course_image
                          ? {uri: homeData.course_image}
                          : require('../../../assets/images/course_img.png')
                      }
                      style={{
                        width: '100%',
                        height: 24 * height,
                        backgroundColor: '#ada',
                        resizeMode: 'cover',
                        borderTopLeftRadius: 3 * width,
                        borderTopRightRadius: 3 * width,
                      }}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('AssignmentList', {
                          course_name: homeData?.course_name,
                        })
                      }
                      style={{
                        width: '100%',
                        height: 7 * height,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingHorizontal: 2.5 * width,
                        flexDirection: 'row',
                      }}>
                      <Text style={Styles.courseText} numberOfLines={2}>
                        {`${homeData?.course_name}`}
                      </Text>
                      <AntDesign
                        name="arrowright"
                        size={5 * width}
                        color="#16763E"
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ) : (
                  <View style={Styles.courseRoundShape}>
                    <Text style={Styles.courseText}>{`No Course Found`}</Text>
                  </View>
                )}
              </View> */}
                    {/* <View
                style={{flex: 1, height: 1 * width, backgroundColor: '#F5F5F5'}}
              /> */}
                    {/* <View
                style={{
                  // height: 2 * height,
                  paddingVertical: 3 * width,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  // alignSelf: 'flex-end',
                  // marginRight: width * 3,
                  paddingHorizontal: 4 * width,
                }}>
                <Text style={Styles.headerText}>{'My Progress'}</Text>

                <TouchableOpacity
                  onPress={() => {
                    setShowGrades(true);
                  }}>
                  <Text
                    style={{
                      color: '#000000',
                      fontSize: 3.4 * width,
                      fontFamily: Fonts.Medium,
                      // marginTop: 1 * width,
                      paddingHorizontal: 2 * width,
                      paddingVertical: 1 * width,
                      textDecorationLine: 'underline',
                      textDecorationColor: '#008A3D',
                    }}>
                    {'View Grading Table'}
                  </Text>
                </TouchableOpacity>
              </View> */}
                    {/* <View
                style={{
                  flex: 1,
                  width: '100%',
                  alignItems: 'center',
                  // backgroundColor: '#F0F9F3',
                }}> */}
                    {/* <View style={{flex: 1, width: '100%'}}>
                  <View
                    style={{
                      flex: 1,
                      // backgroundColor: '#FFF',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text
                      style={{
                        fontFamily: Fonts.SemiBold,
                        fontSize: 4 * width,
                        color: '#000',
                        // height: 5 * width,
                        marginBottom: 3 * width,
                      }}>
                      Google Assignment Graph
                    </Text>
                    <BarChart
                      width={80 * width}
                      height={25 * height}
                      barWidth={6 * width}
                      data={googleGraphData}
                      // rotateLabel={true}
                      // xAxisLabelsVerticalShift={80}
                      // labelsExtraHeight={5 * width}
                      // labelWidth={80}
                      showYAxisIndices
                      yAxisLabelTexts={googleGraphLable}
                      // yAxisIndicesWidth={6}
                      // xAxisLabelTexts={[`${homeData?.course_name}`]}
                      noOfSections={6}
                      maxValue={6}
                      hideRules
                      initialSpacing={3 * width}
                      xAxisType={'solid'}
                      xAxisColor={'#000'}
                      yAxisTextStyle={{color: '#000'}}
                      xAxisLabelTextStyle={{
                        color: '#000000',
                        textAlign: 'center',
                        fontFamily: Fonts.Regular,
                        fontSize: 3 * width,
                      }}
                    />
                  </View>
                </View> */}
                    {/* <View
                  style={{
                    flex: 1,
                    width: '100%',
                    height: 1 * width,
                    backgroundColor: '#F6F6F6',
                    marginVertical: 3 * width,
                  }}
                /> */}
                    {/* {showSkillGraph ? (
                  <View style={{flex: 1, width: '100%'}}>
                    <View
                      style={{
                        flex: 1,
                        // backgroundColor: '#FFF',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text
                        style={{
                          fontFamily: Fonts.SemiBold,
                          fontSize: 4 * width,
                          color: '#000',
                          // height: 5 * width,
                          marginBottom: 2 * width,
                        }}>
                        Skill Graph
                      </Text>
                      <BarChart
                        width={80 * width}
                        height={22 * height}
                        barWidth={60 * width}
                        data={skillGraphData}
                        showYAxisIndices
                        yAxisIndicesWidth={5}
                        xAxisLabelTexts={[`${homeData?.course_name}`]}
                        noOfSections={4}
                        maxValue={100}
                        hideRules
                        initialSpacing={12 * width}
                        xAxisType={'solid'}
                        xAxisColor={'#000'}
                        yAxisTextStyle={{color: '#000'}}
                        xAxisLabelTextStyle={{
                          color: '#000000',
                          textAlign: 'center',
                          fontFamily: Fonts.Regular,
                          fontSize: 3 * width,
                        }}
                      />
                    </View>
                  </View>
                ) : (
                  <View style={{alignSelf: 'center'}}>
                    <Text
                      style={{
                        color: '#008A3D',
                        fontSize: 4 * width,
                        paddingVertical: height * 5,
                        fontFamily: Fonts.Medium,
                      }}>
                      No Skill Data Found
                    </Text>
                  </View>
                )} */}
                    {/* <View
                  style={{
                    flex: 1,
                    width: '100%',
                    height: 1 * width,
                    backgroundColor: '#F6F6F6',
                    marginVertical: 3 * width,
                  }}
                /> */}
                    {/* {(assignment === true || attendance === true) && (
                  <View
                    style={{
                      width: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                      marginTop: 2 * width,
                    }}>
                    <View
                      style={{
                        width: 5 * width,
                        height: 5 * width,
                        backgroundColor: '#CE9B37',
                      }}
                    />
                    <Text
                      style={{
                        fontFamily: Fonts.Medium,
                        fontSize: 3.4 * width,
                        color: '#000',
                        height: 5 * width,
                        marginStart: 3 * width,
                      }}>
                      Assignment
                    </Text>

                    <View
                      style={{
                        width: 5 * width,
                        height: 5 * width,
                        backgroundColor: '#15793E',
                        marginStart: 10 * width,
                      }}
                    />
                    <Text
                      style={{
                        fontFamily: Fonts.Medium,
                        fontSize: 3.4 * width,
                        color: '#000',
                        height: 5 * width,
                        marginStart: 3 * width,
                      }}>
                      Attendance
                    </Text>
                  </View>
                )} */}
                    {/* {assignment === false && attendance === false ? (
                  <View
                    style={{
                      alignSelf: 'center',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Text
                      style={{
                        color: '#008A3D',
                        fontSize: 4 * width,
                        fontFamily: Fonts.Medium,
                        paddingVertical: height * 5,
                      }}>
                      No Assignments/Attendance Found
                    </Text>
                  </View>
                ) : (
                  <View style={{flex: 1, width: '95%'}}>
                    <BarChart
                      data={graphData}
                      // width={85 * width}
                      height={30 * height}
                      barWidth={2.6 * width}
                      initialSpacing={1}
                      endSpacing={1}
                      spacing={4 * width}
                      barBorderRadius={0}
                      hideRules
                      // showGradient
                      // isThreeD={true}
                      yAxisThickness={0}
                      xAxisThickness={0}
                      // xAxisType={ruleTypes.SOLID}
                      // xAxisColor={'#000'}
                      // hideYAxisText={true}
                      // hideAxesAndRules={true}
                      // yAxisTextStyle={{color: '#000'}}
                      // stepValue={1000}
                      // maxValue={6000}
                      // noOfSections={7}
                      // yAxisLabelTexts={['0', '5', '10', '15', '20', '25', '30', '35']}
                      labelWidth={6 * width}
                      yAxisTextStyle={{
                        color: '#000000',
                        // textAlign: 'center',
                        fontFamily: Fonts.Regular,
                        fontSize: 3.5 * width,
                      }}
                      xAxisLabelTextStyle={{
                        color: '#000000',
                        // textAlign: 'center',
                        fontFamily: Fonts.Regular,
                        fontSize: 3 * width,
                      }}
                    />
                  </View>
                )} */}
                    {/* </View> */}
                    <View style={{ width: '100%', height: 16 * width }} />
                  </View>
                )}
              </ScrollView>
              {/*
      
      */}
            </Animated.View>
          )}
        </View>
      </SafeAreaView>

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
                    }}>{`${item.title}`}</Text>
                  <Text
                    style={{
                      color: '#000000',
                      fontSize: 3.4 * width,
                      fontFamily: Fonts.Medium,
                    }}>{`${item.time}`}</Text>
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
            }}>{`${adminomment}`}</Text>
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

      {/* <Modal
        visible={showAutoClockout}
        // onDismiss={() => {
        //   setShowAutoClockout(false);
        // }}
        dismissable={false}
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
            paddingVertical: 4 * width,
          }}>
          <Text
            style={{
              color: '#16763E',
              fontSize: 4 * width,
              fontFamily: Fonts.SemiBold,
              paddingBottom: 3 * width,
              paddingHorizontal: 5 * width,
            }}>{`Attention!`}</Text>
          <View
            style={{
              height: 1,
              width: '100%',
              backgroundColor: '#BCBCBC',
            }}
          />
          <Text
            style={{
              color: '#000000',
              fontSize: 3.6 * width,
              fontFamily: Fonts.Medium,
              paddingVertical: 4 * width,
              paddingHorizontal: 5 * width,
              textAlign: 'center',
            }}>{`Are you still want to stay Clocked In`}</Text>

          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'space-between',
              paddingHorizontal: 5 * width,
            }}>
            <TouchableOpacity
              onPress={() => clockout()}
              style={{
                width: '46%',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#d69c37',
                borderRadius: 2 * width,
              }}>
              <Text style={[Styles.clockInOutText]}>{'Clock Out'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowAutoClockout(false);
              }}
              style={{
                width: '46%',
                height: 5.5 * height,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#16763E',
                borderRadius: 2 * width,
              }}>
              <Text style={[Styles.clockInOutText]}>{'Yes'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> */}
      {/* <CustomProgress show={showProgress} /> */}
    </Provider >
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
    fontSize: 2.8 * width, // Reduced from 3.6
    fontFamily: Fonts.SemiBold,
    marginTop: width * 2, // Reduced from 3
    flexShrink: 1,
  },
  headerText: {
    color: '#000000',
    fontSize: 3.5 * width, // Reduced from 4.4
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
  navContainer: {
    width: '31.5%',
    height: 38 * width, // Increased height for better proportions
    borderRadius: 4 * width,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  iconCircle: {
    width: 14 * width, // Circle size
    height: 14 * width,
    borderRadius: 7 * width,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: width * 3,
  },
  navIcon: {
    width: '55%',
    height: '55%',
    resizeMode: 'contain',
    tintColor: '#FFFFFF', // Ensures icons are white inside the circles
  },
  navText: {
    color: '#1E293B', // Darker slate color for text
    fontSize: 3 * width,
    fontFamily: Fonts.Bold,
    textAlign: 'center',
    paddingHorizontal: width,
  },
  sideContainer: {
    width: '48.5%',
    backgroundColor: 'white',
    borderRadius: 3 * width,
    padding: 3.5 * width,
  },
  sideHeader: {
    color: '#000000',
    fontSize: 4 * width,
    fontFamily: Fonts.SemiBold,
  },
  sideHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrowBtn: {
    height: 6.5 * width,
    width: 6.5 * width,
    backgroundColor: ColorCode.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 1.5 * width,
  },
  statsCard: {
    marginTop: 3 * width,
    backgroundColor: '#F8FAFF',
    borderRadius: 2 * width,
    padding: 4 * width,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    color: '#000000',
    fontSize: 6 * width,
    fontFamily: Fonts.Bold,
  },
  statLabel: {
    color: '#64748B',
    fontSize: 2.2 * width,
    fontFamily: Fonts.SemiBold,
    marginTop: 0.5 * width,
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

export default HomeTabScreenTablet;
