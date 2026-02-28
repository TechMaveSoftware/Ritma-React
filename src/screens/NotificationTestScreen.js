import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import ColorCode from '../utility/ColorCode';
import Fonts from '../utility/Fonts';
import width from '../Units/width';
import height from '../Units/height';
import EnhancedPushNotificationService from '../api/EnhancedPushNotificationService';
import StorageUtility from '../utility/StorageUtility';
import ToastUtility from '../utility/ToastUtility';
import CustomHeader from '../compenents/CustomHeader';

const NotificationTestScreen = ({ navigation }) => {
  const [deviceToken, setDeviceToken] = useState('');
  const [userId, setUserId] = useState('');
  const [isServiceReady, setIsServiceReady] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    loadTestData();
  }, []);

  const loadTestData = async () => {
    try {
      // Get device token
      const token = await StorageUtility.getDeviceToken();
      setDeviceToken(token || 'Not available');

      // Get user data
      const user = await StorageUtility.getUser();
      setUserId(user?.id || 'Not available');

      // Check service status
      setIsServiceReady(EnhancedPushNotificationService.isServiceReady());

      // Get notification count
      const count = await StorageUtility.getNotifCount();
      setNotificationCount(Number(count) || 0);
    } catch (error) {
      console.error('Error loading test data:', error);
    }
  };

  const testLocalNotification = async () => {
    try {
      console.log('🧪 Testing local notification...');

      await EnhancedPushNotificationService.testNotification();
      ToastUtility.showToast('Test notification sent successfully!');

      // Update notification count
      const newCount = notificationCount + 1;
      setNotificationCount(newCount);
      await StorageUtility.setNotifCount(newCount);

    } catch (error) {
      console.error('Error testing local notification:', error);
      ToastUtility.showToast('Error sending test notification');
    }
  };

  const testAssignmentNotification = async () => {
    try {
      console.log('📚 Testing assignment notification...');

      await EnhancedPushNotificationService.displayNotification(
        'New Assignment Available',
        'A new assignment "React Native Basics" has been added to your course.',
        {
          type: 'assignment',
          target_screen: 'AssignmentDetail',
          target_id: 'assignment_123',
          assignment_title: 'React Native Basics',
          course_name: 'Mobile Development',
          due_date: '2024-01-15T23:59:59Z'
        },
        'assignments'
      );

      ToastUtility.showToast('Assignment notification sent!');

    } catch (error) {
      console.error('Error testing assignment notification:', error);
      ToastUtility.showToast('Error sending assignment notification');
    }
  };

  const testQuizNotification = async () => {
    try {
      console.log('📝 Testing quiz notification...');

      await EnhancedPushNotificationService.displayNotification(
        'New Quiz Available',
        'A new quiz "JavaScript Fundamentals" is now available.',
        {
          type: 'quiz',
          target_screen: 'QuizDetail',
          target_id: 'quiz_456',
          quiz_title: 'JavaScript Fundamentals',
          course_name: 'Programming Basics',
          duration: '30'
        },
        'quizzes'
      );

      ToastUtility.showToast('Quiz notification sent!');

    } catch (error) {
      console.error('Error testing quiz notification:', error);
      ToastUtility.showToast('Error sending quiz notification');
    }
  };

  const testNoticeNotification = async () => {
    try {
      console.log('📢 Testing notice notification...');

      await EnhancedPushNotificationService.displayNotification(
        'Important Notice',
        'There will be a maintenance break tomorrow from 2-4 AM.',
        {
          type: 'notice',
          target_screen: 'NoticeDetail',
          target_id: 'notice_789',
          notice_title: 'System Maintenance',
          priority: 'high'
        },
        'general'
      );

      ToastUtility.showToast('Notice notification sent!');

    } catch (error) {
      console.error('Error testing notice notification:', error);
      ToastUtility.showToast('Error sending notice notification');
    }
  };

  const testGradeNotification = async () => {
    try {
      console.log('📊 Testing grade notification...');

      await EnhancedPushNotificationService.displayNotification(
        'Grade Updated',
        'Your grade for "React Native Basics" assignment has been updated.',
        {
          type: 'grade',
          target_screen: 'GradeDetail',
          target_id: 'grade_101',
          assignment_title: 'React Native Basics',
          grade: 'A',
          score: '95'
        },
        'general'
      );

      ToastUtility.showToast('Grade notification sent!');

    } catch (error) {
      console.error('Error testing grade notification:', error);
      ToastUtility.showToast('Error sending grade notification');
    }
  };

  const resetNotificationCount = async () => {
    try {
      await StorageUtility.setNotifCount(0);
      setNotificationCount(0);
      ToastUtility.showToast('Notification count reset!');
    } catch (error) {
      console.error('Error resetting notification count:', error);
      ToastUtility.showToast('Error resetting notification count');
    }
  };

  const checkServiceStatus = async () => {
    try {
      const ready = EnhancedPushNotificationService.isServiceReady();
      const token = EnhancedPushNotificationService.getDeviceToken();
      const user = EnhancedPushNotificationService.getUserId();

      Alert.alert(
        'Service Status',
        `Service Ready: ${ready ? 'Yes' : 'No'}\n` +
        `Device Token: ${token ? 'Available' : 'Not available'}\n` +
        `User ID: ${user || 'Not available'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error checking service status:', error);
      ToastUtility.showToast('Error checking service status');
    }
  };

  const reinitializeService = async () => {
    try {
      console.log('🔄 Reinitializing push notification service...');

      const success = await EnhancedPushNotificationService.initialize();

      if (success) {
        setIsServiceReady(true);
        ToastUtility.showToast('Service reinitialized successfully!');
        loadTestData(); // Reload data
      } else {
        ToastUtility.showToast('Failed to reinitialize service');
      }
    } catch (error) {
      console.error('Error reinitializing service:', error);
      ToastUtility.showToast('Error reinitializing service');
    }
  };

  const TestButton = ({ title, onPress, color = ColorCode.primary }) => (
    <TouchableOpacity
      style={[styles.testButton, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  const InfoCard = ({ title, value, color = ColorCode.grey888 }) => (
    <View style={styles.infoCard}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={[styles.infoValue, { color }]}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Push Notification Test"
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Push Notification Test</Text>
          <Text style={styles.headerSubtitle}>
            Test and verify push notification functionality
          </Text>
        </View>

        {/* Service Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Status</Text>
          <View style={styles.statusContainer}>
            <InfoCard
              title="Service Ready"
              value={isServiceReady ? '✅ Yes' : '❌ No'}
              color={isServiceReady ? ColorCode.green : ColorCode.red}
            />
            <InfoCard
              title="Device Token"
              value={deviceToken ? '✅ Available' : '❌ Not available'}
              color={deviceToken ? ColorCode.green : ColorCode.red}
            />
            <InfoCard
              title="User ID"
              value={userId || 'Not available'}
            />
            <InfoCard
              title="Notification Count"
              value={notificationCount.toString()}
            />
          </View>
        </View>

        {/* Service Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Actions</Text>
          <TestButton
            title="Check Service Status"
            onPress={checkServiceStatus}
            color={ColorCode.blue}
          />
          <TestButton
            title="Reinitialize Service"
            onPress={reinitializeService}
            color={ColorCode.orange}
          />
          <TestButton
            title="Reset Notification Count"
            onPress={resetNotificationCount}
            color={ColorCode.grey888}
          />
        </View>

        {/* Test Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Notifications</Text>
          <TestButton
            title="Test Local Notification"
            onPress={testLocalNotification}
          />
          <TestButton
            title="Test Assignment Notification"
            onPress={testAssignmentNotification}
            color={ColorCode.green}
          />
          <TestButton
            title="Test Quiz Notification"
            onPress={testQuizNotification}
            color={ColorCode.blue}
          />
          <TestButton
            title="Test Notice Notification"
            onPress={testNoticeNotification}
            color={ColorCode.orange}
          />
          <TestButton
            title="Test Grade Notification"
            onPress={testGradeNotification}
            color={ColorCode.purple}
          />
        </View>

        {/* Device Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Information</Text>
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceInfoText}>
              <Text style={styles.bold}>Platform:</Text> {Platform.OS}
            </Text>
            <Text style={styles.deviceInfoText}>
              <Text style={styles.bold}>Platform Version:</Text> {Platform.Version}
            </Text>
            <Text style={styles.deviceInfoText}>
              <Text style={styles.bold}>Device Token:</Text>
            </Text>
            <Text style={styles.tokenText}>{deviceToken}</Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <View style={styles.instructions}>
            <Text style={styles.instructionText}>
              • Use "Test Local Notification" to verify basic functionality
            </Text>
            <Text style={styles.instructionText}>
              • Test specific notification types to verify channel setup
            </Text>
            <Text style={styles.instructionText}>
              • Check service status if notifications aren't working
            </Text>
            <Text style={styles.instructionText}>
              • Reinitialize service if there are issues
            </Text>
            <Text style={styles.instructionText}>
              • Notifications should work in foreground, background, and quit states
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorCode.white,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 4 * width,
    backgroundColor: ColorCode.primary,
  },
  headerTitle: {
    fontSize: 6 * width,
    fontFamily: Fonts.Bold,
    color: ColorCode.white,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 3.5 * width,
    fontFamily: Fonts.Regular,
    color: ColorCode.white,
    textAlign: 'center',
    marginTop: 1 * width,
    opacity: 0.9,
  },
  section: {
    padding: 4 * width,
    borderBottomWidth: 1,
    borderBottomColor: ColorCode.greyeee,
  },
  sectionTitle: {
    fontSize: 4.5 * width,
    fontFamily: Fonts.Bold,
    color: ColorCode.textBlack,
    marginBottom: 3 * width,
  },
  statusContainer: {
    gap: 2 * width,
  },
  infoCard: {
    backgroundColor: ColorCode.greyf8f8,
    padding: 3 * width,
    borderRadius: 2 * width,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 3.5 * width,
    fontFamily: Fonts.Medium,
    color: ColorCode.textBlack,
  },
  infoValue: {
    fontSize: 3.5 * width,
    fontFamily: Fonts.Regular,
  },
  testButton: {
    backgroundColor: ColorCode.primary,
    padding: 3 * width,
    borderRadius: 2 * width,
    marginBottom: 2 * width,
    alignItems: 'center',
  },
  buttonText: {
    color: ColorCode.white,
    fontSize: 4 * width,
    fontFamily: Fonts.Medium,
  },
  deviceInfo: {
    backgroundColor: ColorCode.greyf8f8,
    padding: 3 * width,
    borderRadius: 2 * width,
  },
  deviceInfoText: {
    fontSize: 3.5 * width,
    fontFamily: Fonts.Regular,
    color: ColorCode.textBlack,
    marginBottom: 1 * width,
  },
  bold: {
    fontFamily: Fonts.Bold,
  },
  tokenText: {
    fontSize: 3 * width,
    fontFamily: Fonts.Regular,
    color: ColorCode.grey888,
    marginTop: 1 * width,
    padding: 2 * width,
    backgroundColor: ColorCode.white,
    borderRadius: 1 * width,
  },
  instructions: {
    backgroundColor: ColorCode.greyf8f8,
    padding: 3 * width,
    borderRadius: 2 * width,
  },
  instructionText: {
    fontSize: 3.5 * width,
    fontFamily: Fonts.Regular,
    color: ColorCode.textBlack,
    marginBottom: 1 * width,
    lineHeight: 5 * width,
  },
});

export default NotificationTestScreen; 