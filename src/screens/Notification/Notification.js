import moment from 'moment';
import React, { Fragment, useEffect, useState, useRef } from 'react';
import {
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Provider } from 'react-native-paper';
import CustomProgress from '../../compenents/CustomProgress';
import CustomStatus from '../../compenents/CustomStatus';
import Ionicons from 'react-native-vector-icons/Ionicons';
import height from '../../Units/height';
import width from '../../Units/width';
import Fonts from '../../utility/Fonts';
import ApiMethod from '../../api/ApiMethod';
import ColorCode from '../../utility/ColorCode';
import CustomHeader from '../../compenents/CustomHeader';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import StorageUtility from '../../utility/StorageUtility';

const NotificationScreen = ({ navigation, route }) => {
  const course_name = route.params?.course_name || '';
  const [noticeList, setNoticeList] = useState([]);
  const [showProgress, setShowProgress] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [emptyMessage, setEmptyMessage] = useState('No Data Found');
  const pushNotificationCleanupRef = useRef(null);
  const displayedNotificationIds = useRef(new Set()); // Track displayed notifications to prevent duplicates

  useEffect(() => {
    getNotificationList();

    // Set up push notifications and capture cleanup function in ref
    setupPushNotifications().then(cleanup => {
      pushNotificationCleanupRef.current = cleanup;
    }).catch(error => {
      console.error('❌ Error setting up push notifications:', error);
    });

    // Set up periodic notification checking
    const periodicCleanup = setupPeriodicNotificationCheck();

    // Cleanup function - clean up both push notifications and periodic checking
    return () => {
      if (pushNotificationCleanupRef.current) {
        pushNotificationCleanupRef.current();
        pushNotificationCleanupRef.current = null;
      }
      periodicCleanup();
    };
  }, []);

  // Initialize stored notifications on first load
  useEffect(() => {
    const initializeStoredNotifications = async () => {
      try {
        // Get current notifications and store them as baseline
        const currentNotifications = await StorageUtility.getNotifications();
        if (currentNotifications.length === 0) {
          // If no stored notifications, initialize with empty array
          await StorageUtility.saveNotifications([]);
        }
      } catch (error) {
        console.error('❌ Error initializing stored notifications:', error);
      }
    };

    initializeStoredNotifications();
  }, []);

  const getNotificationList = () => {
    setShowProgress(true);
    ApiMethod.getNotification(
      pass => {
        setShowProgress(false);
        // console.log('pass ghdsgdsfhjgdfsfghkdfsfghk', pass.data);
        if (pass.status == 200) {
          setNoticeList(pass.data);
          readNotifications(pass.data);

          // Check for new notifications and display push notifications
          checkForNewNotifications(pass.data);

          // Mark initial load as complete after first load
          if (isInitialLoad) {
            setIsInitialLoad(false);
          }

          setShowProgress(false);
        } else {
          if (pass.message) {
            setEmptyMessage(pass.message);
          }
          setNoticeList([]);
        }
      },
      fail => {
        setShowProgress(false);
      },
    );
  };

  // Set up push notification listeners - SIMPLIFIED
  const setupPushNotifications = async () => {
    try {
      console.log('🔔 Setting up notification listeners in Notification screen...');

      // Listen for foreground messages - Only refresh list, don't display (EnhancedPushNotificationService handles display)
      const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
        console.log('📱 [Notification Screen] FCM message received, refreshing list...');
        // Don't display here - EnhancedPushNotificationService handles it globally
        // Just refresh the notification list
        getNotificationList();
      });

      console.log('✅ [Notification Screen] Foreground listener registered');

      // Handle notification press
      const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
        if (type === 1 && detail.notification?.data) {
          handleNotificationNavigation({
            data: detail.notification.data,
            notification: detail.notification
          });
        }
      });

      // Return cleanup
      return () => {
        unsubscribeForeground();
        unsubscribeNotifee();
      };
    } catch (error) {
      console.error('Error setting up notifications:', error);
      return () => { };
    }
  };

  // Handle notification navigation
  const handleNotificationNavigation = (remoteMessage) => {
    try {
      const data = remoteMessage.data;
      if (data) {
        switch (data.type) {
          case 'assignment':
            navigation.navigate('PendingAssignment', { type: 1 });
            break;
          case 'quiz':
            navigation.navigate('MyProgress', {
              course_name: course_name,
              quiz: data.quiz || 0
            });
            break;
          case 'notice':
            navigation.navigate('Notice');
            break;
          case 'grade':
            navigation.navigate('My Grades');
            break;
          case 'skill':
          case 'attendance':
            navigation.navigate('MyProgress', { course_name: course_name });
            break;
          case 'chapter':
            navigation.navigate('AssignmentList', { course_name: course_name });
            break;
          default:
            // Stay on notification screen and refresh
            getNotificationList();
            break;
        }
      }
    } catch (error) {
      console.error('❌ Error handling notification navigation:', error);
    }
  };

  // Display push notification (simplified - channel created globally)
  const displayPushNotification = async (notification) => {
    try {
      await notifee.displayNotification({
        title: notification.title || 'New Notification',
        body: notification.description || 'You have a new notification',
        data: {
          type: getNotificationType(notification.title),
          notificationId: notification.id,
        },
        android: {
          channelId: 'gce_education', // Channel created globally
          smallIcon: 'ic_launcher',
          color: ColorCode.primary,
          pressAction: { id: 'default' },
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
      console.error('Error displaying notification:', error);
    }
  };

  // Determine notification type based on title
  const getNotificationType = (title) => {
    if (title.includes('Notice')) return 'notice';
    if (title.includes('Grade') || title.includes('Re-upload')) return 'grade';
    if (title.includes('Skill') || title.includes('Attendance')) return 'skill';
    if (title.includes('Chapter')) return 'chapter';
    if (title.includes('Assignment')) return 'assignment';
    if (title.includes('Quiz')) return 'quiz';
    return 'general';
  };

  // Test function - simplified (channel already exists globally)
  const testPushNotification = async () => {
    try {
      await notifee.displayNotification({
        title: 'Test Notification',
        body: 'This is a test notification',
        data: { type: 'test' },
        android: {
          channelId: 'gce_education', // Channel created globally
          smallIcon: 'ic_launcher',
          color: ColorCode.primary,
          pressAction: { id: 'default' },
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
      console.error('Error sending test notification:', error);
    }
  };

  // Set up periodic notification checking
  const setupPeriodicNotificationCheck = () => {
    // Check for new notifications every 30 seconds when screen is active
    const interval = setInterval(() => {
      // Only check for new notifications if not in initial load
      if (!isInitialLoad) {
        getNotificationList();
      }
    }, 30000); // 30 seconds

    // Cleanup interval when component unmounts
    return () => clearInterval(interval);
  };

  /// post request for read notification //
  const readNotifications = items => {
    const formData = new FormData();
    let count = 0;
    var filtered = items.filter(d => d.status == 0);
    console.log('******filtered id*******', filtered);
    if (filtered.length > 0) {
      filtered.forEach(item => {
        if (item.status == 0 && count <= 30) {
          formData.append('notification_id[]', item.id);
          count += 1;
        }
        console.log('******unread notification id*******', item);
      });

      // if (formData.length > 0) {
      ApiMethod.readNotification(
        formData,
        pass => {
          setShowProgress(false);
          if (pass.status == '200') {
            console.log('************TRUE************', pass);
            getNotificationList();
          } else {
            setShowProgress(false);
            console.log('************FALSE************', pass);
          }
        },
        fail => {
          setShowProgress(false);
        },
      );
      // }
    }
  };

  // Check for new notifications and display push notifications
  const checkForNewNotifications = async (newNotifications) => {
    try {
      // Get previously stored notifications
      const storedNotifications = await StorageUtility.getNotifications();
      const storedIds = storedNotifications.map(n => n.id);

      // Find new notifications
      const newNotificationsList = newNotifications.filter(notification =>
        !storedIds.includes(notification.id)
      );

      console.log('🔍 Found new notifications:', newNotificationsList.length);

      // NOTE: We don't display notifications from API polling to prevent duplicates
      // Push notifications already handle real-time notification display
      // API polling only updates the notification list in the UI
      if (newNotificationsList.length > 0) {
        if (isInitialLoad) {
          console.log('📱 [Notification Screen] Initial load - storing notifications without displaying');
        } else {
          console.log('📱 [Notification Screen] New notifications found via API polling - list updated (notifications already displayed via push)');
        }
      }

      // Store all current notifications for future comparison
      await StorageUtility.saveNotifications(newNotifications);

    } catch (error) {
      console.error('❌ Error checking for new notifications:', error);
    }
  };

  // opening urls //
  const handleOpenUrl = async url => {
    const encodedUrl = encodeURI(url);
    // console.log(`Opening URL: ${encodedUrl}`);
    try {
      await Linking.openURL(encodedUrl);
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        if (item.title.includes('Notice')) {
          navigation.navigate('TabStack', { screen: 'Notice' });
        } else if (
          item.title.includes('Grade') ||
          item.title.includes('Re-upload')
        ) {
          navigation.navigate('TabStack', { screen: 'My Grades' });
        } else if (
          item.title.includes('Skill') ||
          item.title.includes('Attendance')
        ) {
          navigation.navigate('MyProgress', { course_name: course_name });
        } else if (item.title.includes('Chapter')) {
          navigation.navigate('AssignmentList', { course_name: course_name });
        }
      }}
      style={styles.boxView}>
      <View style={styles.cardHeader}>
        <View style={styles.titleRow}>
          <View style={[styles.circle, { backgroundColor: item.status == 0 ? '#D0D0D0' : '#D0D0D0' }]} />
          <Text style={styles.headingText} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
        <Text style={styles.timeText}>
          {moment(item.created_at).fromNow()}
        </Text>
      </View>

      <Text style={styles.mainText}>
        {item.description}
      </Text>

      <View style={styles.footerRow}>
        {item.google_form_url != null && (
          <TouchableOpacity
            onPress={() => handleOpenUrl(item.google_form_url)}
            style={styles.actionButton}>
            <Text style={styles.actionText}>Open Form</Text>
            <Ionicons
              name="arrow-forward-outline"
              size={4 * width}
              color="#16763E"
            />
          </TouchableOpacity>
        )}

        {item.google_doc_url != null && (
          <TouchableOpacity
            onPress={() => handleOpenUrl(item.google_doc_url)}
            style={[styles.actionButton, { marginStart: 2 * width }]}>
            <Text style={styles.actionText}>Open Doc</Text>
            <Ionicons
              name="arrow-forward-outline"
              size={4 * width}
              color="#16763E"
            />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Provider>
      <Fragment>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <CustomStatus trans={true} isDark={true} color="#FFFFFF00" />
          <CustomHeader text={'Notifications'} customStyle={{ marginTop: 0 }} />

          {/* Test button for push notifications - COMMENTED OUT */}
          {/* <TouchableOpacity
            onPress={() => {
              const EnhancedPushNotificationService = require('../../api/EnhancedPushNotificationService').default;
              EnhancedPushNotificationService.testNotification();
            }}
            style={{
              position: 'absolute',
              top: 60,
              right: 20,
              backgroundColor: ColorCode.primary,
              paddingHorizontal: 15,
              paddingVertical: 8,
              borderRadius: 20,
              zIndex: 1000,
            }}>
            <Text style={{
              color: '#fff',
              fontSize: 12,
              fontFamily: Fonts.Medium,
            }}>
              Test Push
            </Text>
          </TouchableOpacity> */}

          <View
            style={{
              flex: 1,
              width: '100%',
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              paddingTop: height * 1, // Reduced padding as CustomHeader is now outside
            }}>
            <FlatList
              data={noticeList}
              renderItem={renderItem}
              keyExtractor={item => item.id.toString()}
              style={{ flex: 1, width: '100%' }}
              contentContainerStyle={{
                flexGrow: 1,
                paddingHorizontal: width * 4,
                paddingBottom: height * 2,
              }}
              ListEmptyComponent={() => (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: Fonts.Medium, fontSize: width * 4, color: '#2E70E8' }}>
                    {emptyMessage}
                  </Text>
                </View>
              )}
            />
          </View>
        </SafeAreaView>
      </Fragment>
      <CustomProgress show={showProgress} />
    </Provider>
  );
};

const styles = StyleSheet.create({
  boxView: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F0F0F0',
    borderWidth: 1,
    borderRadius: width * 3,
    width: width * 92,
    padding: width * 4,
    marginBottom: height * 2.5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 1.5,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  circle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: width * 2,
  },
  headingText: {
    color: '#000000',
    fontSize: width * 4,
    fontFamily: Fonts.SemiBold,
    flex: 1,
  },
  timeText: {
    fontSize: width * 2.5,
    color: ColorCode.primary,
    fontFamily: Fonts.Medium,
  },
  mainText: {
    color: '#706767',
    fontSize: width * 3.4,
    fontFamily: Fonts.Regular,
    lineHeight: width * 4.5,
  },
  footerRow: {
    flexDirection: 'row',
    marginTop: height * 2,
    justifyContent: 'flex-end',
  },
  actionButton: {
    backgroundColor: '#D1FFE4',
    paddingHorizontal: 3 * width,
    paddingVertical: 1 * width,
    borderRadius: 4 * width,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontFamily: Fonts.Medium,
    fontSize: width * 3,
    color: '#666666',
    marginHorizontal: 1 * width,
  },
});

export default NotificationScreen;
