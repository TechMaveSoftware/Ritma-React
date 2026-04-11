/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { enableScreens } from 'react-native-screens';
enableScreens();
import React, { useEffect, useRef } from 'react';
import { Alert, Dimensions, Image, Platform, Text, useColorScheme, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DefaultTheme, Provider } from 'react-native-paper';
import { CommonActions, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { navigationRef } from './src/utility/NavigationService';
import ColorCode from './src/utility/ColorCode';
import AndroidSplashScreen from './src/screens/splash/AndroidSplashScreen';
import WelcomeScreen from './src/screens/welcome/WelcomeScreen';
import WelcomeScreenTablet from './src/screens/welcome/WelcomeScreenTablet';
import StorageUtility from './src/utility/StorageUtility';
import LoginScreen from './src/screens/login/LoginScreen';
import LoginScreenTablet from './src/screens/login/LoginScreenTablet';
import SignupScreen from './src/screens/signup/SignupScreen';
import LinearGradient from 'react-native-linear-gradient';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import height from './src/Units/height';
import width from './src/Units/width';
import Fonts from './src/utility/Fonts';
import HomeTabScreen from './src/screens/dashboard/home/HomeTabScreen';
import HomeTabScreenTablet from './src/screens/dashboard/home/HomeTabScreenTablet';
import AssignmentTabScreen from './src/screens/dashboard/assignments/AssignmentTabScreen';
import AssignmentTabScreenTablet from './src/screens/dashboard/assignments/AssignmentTabScreenTablet';
import ProfileTabScreen from './src/screens/dashboard/profile/ProfileTabScreen';
import ProfileNewTabScreen from './src/screens/dashboard/profile/ProfileNewTabScreen';
import NoticeTabScreen from './src/screens/dashboard/notice/NoticeTabScreen';
import MyProgressScreen from './src/screens/my_progress/MyProgressScreen';
import MyProgressScreenTablet from './src/screens/my_progress/MyProgressScreenTablet';
import MySyllabusScreen from './src/screens/my_syllabus/MySyllabusScreen';
import MySyllabusScreenTablet from './src/screens/my_syllabus/MySyllabusScreenTablet';
import UploadAssignment1Screen from './src/screens/upload_assignment1/UploadAssignment1Screen';
import UploadAssignment1Tablet from './src/screens/upload_assignment1/UploadAssignment1Tablet';
import UploadAssignmentListScreen from './src/screens/upload_assignment/UploadAssignmentListScreen';
import SyllabusDetailScreen from './src/screens/SylabusDetail/SyllabusDetailScreen';
import SyllabusDetailScreenTablet from './src/screens/SylabusDetail/SyllabusDetailScreenTablet';
import NotificationScreen from './src/screens/Notification/Notification';
import NotificationScreenTablet from './src/screens/Notification/NotificationScreenTablet';
import ForgetPasswordScreen from './src/screens/ForgotPassword/ForgetPassword';
import ForgetPasswordTablet from './src/screens/ForgotPassword/ForgetPasswordTablet';
import VerifyOtpScreen from './src/screens/ForgotPassword/verifyOtp';
import VerifyOtpTablet from './src/screens/ForgotPassword/verifyOtpTablet';
import ForgotPasswordChangeScreen from './src/screens/ForgotPassword/changePassword';
import ForgotPasswordChangeTablet from './src/screens/ForgotPassword/changePasswordTablet';
import DocumentScreen from './src/screens/documents/DocumentScreen';
import DocumentScreenTablet from './src/screens/documents/DocumentScreenTablet';
import MyClassScreen from './src/screens/my_class/MyClassScreen';
import MyClassScreenTablet from './src/screens/my_class/MyClassScreenTablet';
import ViewUploadedAssignmentScreen from './src/screens/dashboard/assignments/ViewUploadedAssignmentScreen';
import ViewUploadedAssignmentScreenTablet from './src/screens/dashboard/assignments/ViewUploadedAssignmentScreenTablet';
import UploadedDocScreen from './src/screens/dashboard/assignments/UploadedDocScreen';
import ReUploadAssignmentScreen from './src/screens/upload_assignment1/ReUploadAssignmentScreen';
import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid } from 'react-native';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PendingAssignmentScreen from './src/screens/PendingAssignment/PendingAssignmentScreen';
import PendingAssignmentTablet from './src/screens/PendingAssignment/PendingAssignmentTablet';
import CourseAssignmentsScreen from './src/screens/PendingAssignment/CourseAssignmentsScreen';
import CourseAssignmentsScreenTablet from './src/screens/PendingAssignment/CourseAssignmentsScreenTablet';
import ToastUtility from './src/utility/ToastUtility';
import ConstData from './src/utility/ConstData';
import EnhancedPushNotificationService from './src/api/EnhancedPushNotificationService';
import OnlineSyllabusScreen from './src/screens/online_student/online_syllabus/OnlineSyllabusScreen';
import OnlineSyllabusDetailScreen from './src/screens/online_student/online_syllabus_detail/OnlineSyllabusDetailScreen';
import OnlineQuizScreen from './src/screens/online_student/online_quiz/OnlineQuizScreen';
import OnlineQuizTablet from './src/screens/online_student/online_quiz/OnlineQuizTablet';
import OnlineQuizResultScreen from './src/screens/online_student/online_quiz_result/OnlineQuizResultScreen';
import OnlineQuizResultTablet from './src/screens/online_student/online_quiz_result/OnlineQuizResultTablet';
import OnlineQuizAtemptsScreen from './src/screens/online_student/online_quiz_attempts/OnlineQuizAtemptsScreen';
import OnlineQuizAtemptsTablet from './src/screens/online_student/online_quiz_attempts/OnlineQuizAtemptsTablet';
import DiscussionForumScreen from './src/screens/online_student/discussion_forum/DiscussionForumScreen';
import DiscussionDetailScreen from './src/screens/online_student/discussion_detail/DiscussionDetailScreen';
import ScheduleOneToOneScreen from './src/screens/online_student/schedule_one_on_one/ScheduleOneToOneScreen';
import AllQuizDataScreen from './src/screens/online_student/all_quiz_data/AllQuizDataScreen';
import AllQuiz from './src/screens/online_student/all_quiz_data/AllQuiz';
import NotificationTestScreen from './src/screens/NotificationTestScreen';
import QuizAssignmentScreen from './src/screens/quiz_assignment/QuizAssignmentScreen';
import ScheduleVirtualOneToOneScreen from './src/screens/schedule_virtual_1to1/ScheduleVirtualOneToOneScreen';
import VirtualSyllabusScreen from './src/screens/online_student/online_syllabus/VirtualSyllabusScreen';
import ScheduleClinicalOneToOneScreen from './src/screens/schedule_clinical_sessions/ScheduleClinicalOneToOneScreen';
import MyClassCourses from './src/screens/my_class/MyClassCourses';
import MyClassCoursesTablet from './src/screens/my_class/MyClassCoursesTablet';
import Policy from './src/screens/Termandpolicy/Policy';
import Term from './src/screens/Termandpolicy/Term';
import CompletedScreen from './src/screens/online_student/all_quiz_data/CompletedScreen';
import CompletedScreenTablet from './src/screens/online_student/all_quiz_data/CompletedScreenTablet';
import NoticeTabScreenTablet from './src/screens/dashboard/notice/NoticeTabScreenTablet';
import ProfileNewTabScreenTablet from './src/screens/dashboard/profile/ProfileNewTabScreenTablet';
import ProfileTabScreenTablet from './src/screens/dashboard/profile/ProfileTabScreenTablet';
import AsignmentUpload from './src/screens/dashboard/assignments/AsignmentUpload';
import AsignmentUploadTablet from './src/screens/dashboard/assignments/AsignmentUploadTablet';
import EditProfileScreen from './src/screens/dashboard/profile/EditProfileScreen';
import ChangePasswordScreen from './src/screens/dashboard/profile/ChangePasswordScreen';
import PolicyTablet from './src/screens/Termandpolicy/PolicyTablet';
import TermTablet from './src/screens/Termandpolicy/TermTablet';
import ChangePasswordScreenTablet from './src/screens/dashboard/profile/ChangePasswordScreenTablet';
import EditProfileScreenTablet from './src/screens/dashboard/profile/EditProfileScreenTablet';
import LessonContentScreen from './src/screens/SylabusDetail/LessonContent/LessonContentScreen';
import LessonContentScreenTablet from './src/screens/SylabusDetail/LessonContent/LessonContentScreenTablet';

const AuthNav = createNativeStackNavigator();
const AuthStack = () => {
  return (
    <AuthNav.Navigator>
      {Platform.OS == 'android' && (
        <AuthNav.Screen
          name="Splash"
          component={AndroidSplashScreen}
          options={{ headerShown: false }}
        />
      )}
      <AuthNav.Screen
        name="Waiting"
        component={WaitingScreen}
        options={{ headerShown: false }}
      />
      <AuthNav.Screen
        name="Intro"
        component={isTabletDevice() ? WelcomeScreenTablet : WelcomeScreen}
        options={{ headerShown: false }}
      />
      <AuthNav.Screen
        name="Login"
        component={isTabletDevice() ? LoginScreenTablet : LoginScreen}
        options={{ headerShown: false }}
      />
      <AuthNav.Screen
        name="Signup"
        component={SignupScreen}
        options={{ headerShown: false }}
      />
      <AuthNav.Screen
        name="Forgot"
        component={isTabletDevice() ? ForgetPasswordTablet : ForgetPasswordScreen}
        options={{ headerShown: false }}
      />
      <AuthNav.Screen
        name="VerifyOtp"
        component={isTabletDevice() ? VerifyOtpTablet : VerifyOtpScreen}
        options={{ headerShown: false }}
      />
      <AuthNav.Screen
        name="ChangePassword"
        component={isTabletDevice() ? ForgotPasswordChangeTablet : ForgotPasswordChangeScreen}
        options={{ headerShown: false }}
      />
    </AuthNav.Navigator>
  );
};

const TMBottomNav = createBottomTabNavigator();
function TabStack() {
  const insets = useSafeAreaInsets();
  return (
    <TMBottomNav.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: ColorCode.primary,
        tabBarInactiveTintColor: '#4D4D4D',
        backgroundColor: '#dad',
        // tabBarBackground:{()=> {return backgroundColor:'#dad'}},
        tabBarStyle: {
          backgroundColor: ColorCode.white,
          height: (Platform.OS === 'ios' ? 12 * height : 8 * height) + (Platform.OS === 'android' ? (insets.bottom > 0 ? insets.bottom : 0) : 0),
          paddingTop: width * 2,
          paddingBottom: (Platform.OS === 'ios' ? width * 5 : width * 1) + (Platform.OS === 'android' ? (insets.bottom > 0 ? insets.bottom : 0) : 0),
          paddingHorizontal: width * 2,

          // ✅ ADD THESE TWO LINES
          marginTop: Platform.OS === 'ios' ? 10 : 0,
          marginBottom: Platform.OS === 'ios' ? -10 : 0,
          bottom: 0,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          position: 'absolute',
          borderTopLeftRadius: width * 3,
          borderTopRightRadius: width * 3,
        },
        tabBarLabel: ({ focused, color }) => {
          return (
            <Text
              style={{
                color: color,
                fontSize: focused ? 3 * width : 2.8 * width,
                fontWeight: focused ? '600' : '400',
                fontFamily: focused ? Fonts.SemiBold : Fonts.Regular,
                marginTop: width * 0.3,
                marginBottom: 0,
                includeFontPadding: false,
                textAlignVertical: 'top',
                lineHeight: Platform.OS === 'ios' ? 4 * width : 3.5 * width,
                height: Platform.OS === 'ios' ? 4 * width : 3.5 * width,
              }}
              numberOfLines={1}>
              {route.name}
            </Text>
          );
        },
        tabBarIcon: ({ focused, color, size }) => {
          let icon;
          if (route.name === 'Home') {
            icon = require('./src/assets/images/tab1.png');
          } else if (route.name === 'My Grades') {
            icon = require('./src/assets/images/tab2.png');
          } else if (route.name === 'Notice') {
            icon = require('./src/assets/images/tab3.png');
          } else if (route.name === 'Profile') {
            icon = require('./src/assets/images/tab4.png');
          }
          return (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: width * 0.3,
                marginBottom: width * 0.5,
              }}>
              <Image
                source={icon}
                style={{
                  tintColor: color,
                  width: focused ? 6.5 * width : 6 * width,
                  height: focused ? 6.5 * width : 6 * width,
                  resizeMode: 'contain',
                }}
              />
            </View>
          );
        },
        tabBarBackground: () => (
          <View
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: width * 3,
              borderTopRightRadius: width * 3,
            }}
          />
        ),
        tabBarItemStyle: {
          paddingVertical: 0,
          paddingHorizontal: width * 1,
          justifyContent: 'flex-start',
          alignItems: 'center',
          flex: 1,
        },
      })}>
      <TMBottomNav.Screen
        name="Home"
        component={HomeTabScreen}
        options={{ headerShown: false }}
      />
      <TMBottomNav.Screen
        name="My Grades"
        component={AssignmentTabScreen}
        options={{ headerShown: false }}
      />
      <TMBottomNav.Screen
        name="Notice"
        component={NoticeTabScreen}
        options={{ headerShown: false }}
      />
      <TMBottomNav.Screen
        name="Profile"
        component={ProfileNewTabScreen}
        options={{ headerShown: false }}
      />
    </TMBottomNav.Navigator>
  );
}

// Very conservative tablet detection - only for actual tablets, not large phones
const isTabletDevice = () => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // For iOS, use Platform.isPad which is the most reliable
  if (Platform.OS === 'ios') {
    return Platform.isPad || screenWidth >= 768;
  }

  // For Android, use a higher threshold to avoid large phones
  // Only consider it a tablet if smallest dimension is >= 600dp
  const minDimension = Math.min(screenWidth, screenHeight);
  return minDimension >= 600;
};

// Separate Tablet TabStack - completely isolated from mobile
const TabletBottomNav = createBottomTabNavigator();
function TabletTabStack() {
  return (
    <TabletBottomNav.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: ColorCode.primary,
        tabBarInactiveTintColor: '#4D4D4D',
        headerShown: false,
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: {
          backgroundColor: ColorCode.white,
          height: Platform.OS === 'ios' ? 12 * height : 11 * height,
          paddingTop: width * 1,
          paddingBottom: Platform.OS === 'ios' ? width * 3 : width * 1.5,
          borderTopWidth: 0,
          elevation: 20, // Increased elevation for better visibility
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          // Removed Position absolute and border radius to match standard look
        },
        tabBarLabel: ({ focused, color }) => {
          return (
            <Text
              style={{
                color: color,
                fontSize: focused ? 2.2 * width : 2 * width, // Reduced from 2.6/2.4
                fontWeight: focused ? '600' : '400',
                fontFamily: focused ? Fonts.SemiBold : Fonts.Regular,
                marginTop: width * 1, // Reduced margin
                includeFontPadding: false,
                textAlign: 'center',
              }}>
              {route.name}
            </Text>
          );
        },
        tabBarIcon: ({ focused, color, size }) => {
          let icon;
          if (route.name === 'Home') {
            icon = require('./src/assets/images/tab1.png');
          } else if (route.name === 'My Grades') {
            icon = require('./src/assets/images/tab2.png');
          } else if (route.name === 'Notice') {
            icon = require('./src/assets/images/tab3.png');
          } else if (route.name === 'Profile') {
            icon = require('./src/assets/images/tab4.png');
          }
          const iconSize = focused ? 4 * width : 3.5 * width; // Reduced from 5.5/5

          return (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: width * 0.5,
              }}>
              <Image
                source={icon}
                style={{
                  tintColor: color,
                  width: iconSize,
                  height: iconSize,
                  resizeMode: 'contain',
                }}
              />
            </View>
          );
        },
        tabBarItemStyle: {
          paddingVertical: width * 0.5,
          paddingHorizontal: 0, // Allow full spread
          alignItems: 'center',
          justifyContent: 'center',
        },
      })}>
      <TabletBottomNav.Screen
        name="Home"
        component={HomeTabScreenTablet}
        options={{ headerShown: false }}
      />
      <TabletBottomNav.Screen
        name="My Grades"
        component={AssignmentTabScreenTablet}
        options={{ headerShown: false }}
      />
      <TabletBottomNav.Screen
        name="Notice"
        component={NoticeTabScreenTablet}
        options={{ headerShown: false }}
      />
      <TabletBottomNav.Screen
        name="Profile"
        component={ProfileNewTabScreenTablet}
        options={{ headerShown: false }}
      />
    </TabletBottomNav.Navigator>
  );
}

// Wrapper that only switches for actual tablets - mobile stays unchanged
function AdaptiveTabStack() {
  const tablet = isTabletDevice();
  // Only use tablet stack for actual tablets, otherwise use original mobile stack
  if (tablet) {
    return <TabletTabStack />;
  }
  // Return original TabStack unchanged for all mobile devices
  return <TabStack />;
}

const WaitingScreen = ({ navigation }: { navigation: any }) => {
  useEffect(() => {
    console.log(Platform.OS);

    updateScreen();
  }, []);

  const updateScreen = async () => {
    try {
      const uu = await StorageUtility.getUser();
      // const ut = await StorageUtility.getUserType();

      if (uu) {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'TabStack' }],
          }),
        );
      } else {
        const intro = await StorageUtility.getShowIntro();
        if (intro == '1') {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            }),
          );
        } else {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'Intro' }],
            }),
          );
        }
      }
    } catch (error) {
      console.error('❌ Error in WaitingScreen updateScreen:', error);
      // Default to showing intro screen if there's an error
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Intro' }],
        }),
      );
    }
  };

  return <View style={{ flex: 1 }} />;
};

const MainNav = createNativeStackNavigator();
const MainStack = () => {
  return (
    <MainNav.Navigator>
      <MainNav.Screen
        name="AuthStack"
        component={AuthStack}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="TabStack"
        component={AdaptiveTabStack}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="AssignmentList"
        component={UploadAssignmentListScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="viewUploadedDocs"
        component={isTabletDevice() ? ViewUploadedAssignmentScreenTablet : ViewUploadedAssignmentScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="UploadedDoc"
        component={UploadedDocScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="UploadAssignment"
        component={isTabletDevice() ? UploadAssignment1Tablet : UploadAssignment1Screen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="ReUploadAssignment"
        component={ReUploadAssignmentScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="MyProgress"
        component={isTabletDevice() ? MyProgressScreenTablet : MyProgressScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="ProfileScreen"
        component={isTabletDevice() ? ProfileTabScreenTablet : ProfileTabScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="MySyllabus"
        component={isTabletDevice() ? MySyllabusScreenTablet : MySyllabusScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="OnlineSyllabus"
        component={OnlineSyllabusScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="VirtualSyllabus"
        component={VirtualSyllabusScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="OnlineSyllabusDetail"
        component={OnlineSyllabusDetailScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="OnlineQuiz"
        component={isTabletDevice() ? OnlineQuizTablet : OnlineQuizScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="OnlineQuizAttempts"
        component={isTabletDevice() ? OnlineQuizAtemptsTablet : OnlineQuizAtemptsScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="OnlineQuizResult"
        component={isTabletDevice() ? OnlineQuizResultTablet : OnlineQuizResultScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="DiscussionForum"
        component={DiscussionForumScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="DiscussionDetail"
        component={DiscussionDetailScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="AllQuizData"
        component={AllQuizDataScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="AllQuiz"
        component={AllQuiz}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="Calendar"
        component={ScheduleOneToOneScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="SyllabusDetail"
        component={isTabletDevice() ? SyllabusDetailScreenTablet : SyllabusDetailScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="QuizAssignment"
        component={QuizAssignmentScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="ScheduleVirtual1to1"
        component={ScheduleVirtualOneToOneScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="ScheduleClinical"
        component={ScheduleClinicalOneToOneScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="Notification"
        component={isTabletDevice() ? NotificationScreenTablet : NotificationScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="MyClass"
        component={isTabletDevice() ? MyClassScreenTablet : MyClassScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="MyClassCourses"
        component={isTabletDevice() ? MyClassCoursesTablet : MyClassCourses}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="PendingAssignment"
        component={isTabletDevice() ? PendingAssignmentTablet : PendingAssignmentScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="CourseAssignments"
        component={isTabletDevice() ? CourseAssignmentsScreenTablet : CourseAssignmentsScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="Document"
        component={isTabletDevice() ? DocumentScreenTablet : DocumentScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="Policy"
        component={isTabletDevice() ? PolicyTablet : Policy}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="Term"
        component={isTabletDevice() ? TermTablet : Term}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="CompletedScreen"
        component={CompletedScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="CompletedScreenTablet"
        component={CompletedScreenTablet}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="EditProfileScreen"
        component={isTabletDevice() ? EditProfileScreenTablet : EditProfileScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="ProfileChangePassword"
        component={isTabletDevice() ? ChangePasswordScreenTablet : ChangePasswordScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="AsignmentUpload"
        component={isTabletDevice() ? AsignmentUploadTablet : AsignmentUpload}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="NotificationTest"
        component={NotificationTestScreen}
        options={{ headerShown: false }}
      />
      <MainNav.Screen
        name="LessonContent"
        component={isTabletDevice() ? LessonContentScreenTablet : LessonContentScreen}
        options={{ headerShown: false }}
      />
    </MainNav.Navigator>
  );
};


function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const hasHandledInitialNotificationRef = useRef(false);
  const LAST_HANDLED_LAUNCH_NOTIFICATION_KEY = '@last_handled_launch_notification_key';

  const buildLaunchNotificationKey = (payload: any, source: 'fcm' | 'notifee') => {
    if (!payload) return null;

    const messageId =
      payload?.messageId ||
      payload?.notification?.id ||
      payload?.data?.message_id ||
      payload?.data?.notification_id ||
      payload?.data?.id;

    if (messageId) {
      return `${source}:${String(messageId)}`;
    }

    const title = payload?.notification?.title || payload?.data?.title || '';
    const body = payload?.notification?.body || payload?.data?.body || '';
    const sentTime = payload?.sentTime || payload?.data?.sent_time || '';
    const dataString = JSON.stringify(payload?.data || {});

    if (!title && !body && dataString === '{}') {
      return null;
    }

    return `${source}:${sentTime}:${title}:${body}:${dataString}`;
  };

  const shouldHandleInitialNotification = async (
    payload: any,
    source: 'fcm' | 'notifee',
  ) => {
    const launchKey = buildLaunchNotificationKey(payload, source);
    if (!launchKey) {
      return false;
    }

    const lastHandled = await AsyncStorage.getItem(
      LAST_HANDLED_LAUNCH_NOTIFICATION_KEY,
    );
    if (lastHandled === launchKey) {
      console.log('🔕 Skipping duplicate initial notification on reload:', launchKey);
      return false;
    }

    await AsyncStorage.setItem(LAST_HANDLED_LAUNCH_NOTIFICATION_KEY, launchKey);
    return true;
  };

  useEffect(() => {
    // Delay initialization to ensure Firebase is ready and app navigation can proceed
    // This prevents blocking the app startup
    const timer = setTimeout(async () => {
      await initializeEnhancedPushNotifications();
      await setupGlobalPushNotifications();
    }, 1000); // Wait 1 second for Firebase to be fully initialized

    return () => clearTimeout(timer);
  }, []);

  // Initialize enhanced push notifications
  async function initializeEnhancedPushNotifications() {
    try {
      console.log(' Initializing enhanced push notification system...');

      // Initialize the enhanced push notification service
      const success = await EnhancedPushNotificationService.initialize();

      if (success) {
        console.log(' Enhanced push notification system initialized successfully');
      } else {
        console.log(' Failed to initialize enhanced push notification system');
      }
    } catch (error) {
      console.error(' Error initializing enhanced push notifications:', error);
      // Don't block the app - just log the error
      // The app should continue to work even if push notifications fail to initialize
    }
  };

  // Set up global push notification handling
  async function setupGlobalPushNotifications() {
    try {
      console.log('🔔 Setting up global push notification system...');

      // Request permissions
      await requestUserPermission();

      // Create notification channel for Android
      await notifee.createChannel({
        id: 'gce_education',
        name: 'GCE-Education',
        sound: 'default',
        importance: 4, // High importance
        vibration: true,
        vibrationPattern: [300, 500],
      });
      // Listen for background/quit state messages
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('📱 App opened from background notification:', remoteMessage);
        handleGlobalNotificationNavigation(remoteMessage);
      });

      // Check if app was opened from a notification
      messaging()
        .getInitialNotification()
        .then(async remoteMessage => {
          if (
            remoteMessage &&
            !hasHandledInitialNotificationRef.current &&
            (await shouldHandleInitialNotification(remoteMessage, 'fcm'))
          ) {
            hasHandledInitialNotificationRef.current = true;
            console.log('📱 App opened from quit state notification:', remoteMessage);
            handleGlobalNotificationNavigation(remoteMessage);
          }
        });

      notifee.getInitialNotification().then(async initialNotification => {
        const notifeePayload = initialNotification?.notification
          ? {
            data: initialNotification.notification.data || {},
            notification: initialNotification.notification,
            pressAction: initialNotification.pressAction,
          }
          : null;

        if (
          notifeePayload &&
          !hasHandledInitialNotificationRef.current &&
          (await shouldHandleInitialNotification(notifeePayload, 'notifee'))
        ) {
          hasHandledInitialNotificationRef.current = true;
          console.log('📱 App opened from quit state (notifee):', initialNotification);
          handleGlobalNotificationNavigation(notifeePayload);
        }
      });

      // Listen for notifee notification press events
      const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
        console.log('🔔 Notifee foreground event:', type, detail);

        switch (type) {
          case EventType.PRESS:
          case EventType.ACTION_PRESS:
            console.log('📱 User pressed notification:', detail.notification);
            if (detail.notification && detail.notification.data) {
              handleGlobalNotificationNavigation({
                data: detail.notification.data,
                notification: detail.notification
              });
            }
            break;
          case EventType.DISMISSED:
            console.log('📱 User dismissed notification');
            break;
        }
      });

      // Cleanup function
      return () => {
        // unsubscribeForeground(); // Commented out as listener is now in EnhancedPushNotificationService
        unsubscribeNotifee();
      };
    } catch (error) {
      const errorMsg = (error as any)?.message || '';
      if (errorMsg.includes('aps-environment')) {
        console.log('ℹ️ Push setup partially skipped: missing entitlement (likely simulator)');
      } else {
        console.error(' Error setting up global push notifications:', error);
      }
    }
  };

  // Display global notification
  async function displayGlobalNotification(title: string, body: string, data: any = {}) {
    try {
      console.log('🔔 Displaying global notification:', title, body);

      await notifee.displayNotification({
        title: title,
        body: body,
        data: data,
        android: {
          channelId: 'gce_education',
          smallIcon: 'ic_notification',
          color: ColorCode.primary,
          pressAction: {
            id: 'default',
          },
          importance: 4,
          showTimestamp: true,
          timestamp: Date.now(),
        },
        ios: {
          foregroundPresentationOptions: {
            badge: true,
            sound: true,
            banner: true,
            list: true,
          },
        },
      });
    } catch (error) {
      console.error(' Error displaying global notification:', error);
    }
  };

  // Handle global notification navigation
  async function handleGlobalNotificationNavigation(remoteMessage: any) {
    try {
      console.log(' Handling global notification navigation:', remoteMessage);

      // Import navigation service
      // Wait a bit to ensure navigation is ready, or use isReady check
      const checkNavigationReady = () => {
        if (navigationRef.isReady()) {
          console.log(' Navigating to Notification screen');
          navigationRef.dispatch(
            CommonActions.reset({
              index: 1,
              routes: [
                { name: 'TabStack' },
                { name: 'Notification', params: { course_name: '' } },
              ],
            }),
          );
        } else {
          console.log(' Navigation not ready, retrying...');
          setTimeout(checkNavigationReady, 500);
        }
      };

      setTimeout(checkNavigationReady, 300);
    } catch (error) {
      console.error(' Error handling global notification navigation:', error);
    }
  };

  // Test push notification (using enhanced service)
  async function testAutoPushNotification() {
    try {
      console.log(' Testing enhanced push notification...');
      // Enhanced service doesn't have testNotification, but we can log status
      console.log('Enhanced service initialized:', EnhancedPushNotificationService.isInitialized);
    } catch (error) {
      console.error(' Error checking push notification status:', error);
    }
  };

  async function requestUserPermission() {
    if (Platform.OS == 'ios') {
      const authStatus = await messaging().requestPermission({
        alert: true,
      });
      console.log('Authorization status:', authStatus);

      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        // Register the device with FCM
        await messaging().registerDeviceForRemoteMessages();
        checkToken();
      }
    } else if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          console.log('Android notification permission:', granted);
        } catch (err) {
          console.warn('Error requesting Android notification permission:', err);
        }
      }
      await messaging().registerDeviceForRemoteMessages();
      checkToken();
    }
  }

  async function checkToken() {
    try {
      console.log('🔑 === APP STARTUP TOKEN CHECK ===');
      console.log('📱 Platform:', Platform.OS);

     

      const fcmToken = await messaging().getToken();
      console.log('📱 FCM Token received:', fcmToken);

      if (fcmToken) {
        console.log('Storing FCM token in AsyncStorage...');
        await StorageUtility.storeDeviceToken(fcmToken);
        console.log(' FCM token stored successfully');
      } else {
        console.log(' No FCM token received');
      }

      // Restore token refresh listener
      messaging().onTokenRefresh(async token => {
        console.log('🔄 FCM Token refreshed:', token);
        await StorageUtility.storeDeviceToken(token);
      });

      console.log('🔑 === END TOKEN CHECK ===');

    } catch (error) {
      console.error('❌ Error in checkToken:', error);
    }
  };

  async function onDisplayNotification(data: any) {
    console.log('Message received', data);
    const title = data.title || data.notification_title || data.nt_title || '';
    const body = data.body || data.notification_body || data.message || data.nt_body || '';

    if (!title && !body) {
      console.log('ℹ️ Skipping local display notification: no title/body in payload');
      return;
    }

    await displayGlobalNotification(
      title,
      body,
      {}
    );
  }

  const getTheme = () => ({
    ...DefaultTheme,
    dark: isDarkMode,
    colors: {
      ...DefaultTheme.colors,
      primary: ColorCode.primary, //'#0285FB',
      accent: ColorCode.accent, //'#0285FB',
      error: ColorCode.red, //'#ED1C24',
    },
  });



  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider theme={getTheme()}>
          <NavigationContainer ref={navigationRef}>
            <MainStack />
          </NavigationContainer>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
