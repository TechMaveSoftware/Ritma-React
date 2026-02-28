import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Provider } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CommonActions } from '@react-navigation/native';
import StorageUtility from '../../../utility/StorageUtility';
import ConstData from '../../../utility/ConstData';

import ApiMethod from '../../../api/ApiMethod';
import CustomProgress from '../../../compenents/CustomProgress';
import height from '../../../Units/height';
import width from '../../../Units/width';
import Fonts from '../../../utility/Fonts';
import ColorCode from '../../../utility/ColorCode';
import ToastUtility from '../../../utility/ToastUtility';
import NoticeSkeleton from '../../../compenents/NoticeSkeleton';

const HTML_REGEX = /<[^>]*>?/gm;

const NoticeTabScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  // const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : insets.top;
  const [noticeList, setNoticeList] = useState([]);
  const [showProgress, setShowProgress] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [visible, setVisible] = useState(false);
  const [notice, setNotice] = useState('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const handleViewMore = noticetext => {
    setVisible(true);
    setNotice(noticetext);
  };

  useEffect(() => {
    loadNoticeData();
  }, []);

  const loadNoticeData = (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setShowProgress(true);
    }

    ApiMethod.allNotices(
      pass => {
        setShowProgress(false);
        setRefreshing(false);
        console.log('Notice API Response:', pass);

        if (pass.status == 200 && pass.data) {
          setNoticeList(pass.data);
          setIsInitialLoading(false);
        } else {
          setNoticeList([]);
          setIsInitialLoading(false);
          ToastUtility.showToast(pass.message || 'No notices found');
        }
      },
      async fail => {
        setShowProgress(false);
        setRefreshing(false);
        console.log('Notice API Error:', fail);
        setNoticeList([]);
        setIsInitialLoading(false);

        if (fail.status == 401 || (fail.message && fail.message.includes('Unauthenticated'))) {
          await StorageUtility.logout();
          ToastUtility.showToast('Session expired. Please login again.');
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'AuthStack' }],
            }),
          );
        } else {
          ConstData.showErrorMsg(fail);
        }
      },
    );
  };

  const onRefresh = () => {
    loadNoticeData(true);
  };

  const groupNoticesByDate = () => {
    if (!noticeList || noticeList.length === 0) return [];

    const grouped = {};
    noticeList.forEach((item, index) => {
      // Use added_date from API response, fallback to created_at if needed
      const dateToUse = item.added_date || item.created_at;

      // Parse the date properly - handle "24 Jul 2025" format
      let parsedDate;
      if (dateToUse) {
        // Try to parse as ISO date first, then as "DD MMM YYYY" format
        parsedDate = moment(dateToUse, ['YYYY-MM-DDTHH:mm:ss.SSSSSSZ', 'DD MMM YYYY', moment.ISO_8601], true);
        if (!parsedDate.isValid()) {
          // If still invalid, try without strict parsing
          parsedDate = moment(dateToUse, ['YYYY-MM-DDTHH:mm:ss.SSSSSSZ', 'DD MMM YYYY']);
        }
      }

      const dateKey = parsedDate && parsedDate.isValid()
        ? parsedDate.format('DD/MM/YYYY')
        : 'Unknown Date';

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push({ ...item, originalIndex: index });
    });

    return Object.keys(grouped).map(date => ({
      date,
      notices: grouped[date],
    }));
  };

  const NoticeIcon = ({ priority = 'normal' }) => {
    const getIconColor = () => {
      switch (priority) {
        case 'urgent':
          return ColorCode.error || '#ef4444';
        case 'important':
          return ColorCode.warning || '#f59e0b';
        case 'success':
          return ColorCode.success || '#10b981';
        default:
          return ColorCode.primary;
      }
    };

    return (
      <View style={[styles.iconContainer, { backgroundColor: getIconColor() }]}>
        <Ionicons name="notifications" size={4 * width} color="#fff" />
      </View>
    );
  };

  const NoticeItem = ({ item, onViewMore }) => {
    const getPriority = notice => {
      if (!notice || typeof notice !== 'string') return 'normal';
      const text = notice.toLowerCase();
      if (text.includes('urgent') || text.includes('emergency'))
        return 'urgent';
      if (text.includes('important') || text.includes('attention'))
        return 'important';
      if (text.includes('success') || text.includes('completed'))
        return 'success';
      return 'normal';
    };

    const priority = getPriority(item.notice);

    // Format the date for display
    const formatDate = (dateString) => {
      if (!dateString) return '';

      // Parse the date properly - handle "24 Jul 2025" format
      const parsedDate = moment(dateString, ['YYYY-MM-DDTHH:mm:ss.SSSSSSZ', 'DD MMM YYYY', moment.ISO_8601], true);
      if (!parsedDate.isValid()) {
        // If still invalid, try without strict parsing
        const fallbackDate = moment(dateString, ['YYYY-MM-DDTHH:mm:ss.SSSSSSZ', 'DD MMM YYYY']);
        return fallbackDate.isValid() ? fallbackDate.format('DD/MM/YYYY') : dateString;
      }

      return parsedDate.format('DD/MM/YYYY');
    };

    const getStyles = () => {
      switch (priority) {
        case 'urgent':
          return {
            borderColor: '#fecaca',
            backgroundColor: 'rgba(254, 242, 242, 0.9)',
          };
        case 'important':
          return {
            borderColor: '#fed7aa',
            backgroundColor: 'rgba(255, 251, 235, 0.9)',
          };
        case 'success':
          return {
            borderColor: '#a7f3d0',
            backgroundColor: 'rgba(240, 253, 244, 0.9)',
          };
        default:
          return {
            borderColor: '#e0e7ff',
            backgroundColor: 'rgba(248, 250, 255, 0.9)',
          };
      }
    };

    return (
      <TouchableOpacity
        style={[styles.alertItem, getStyles()]}
        onPress={() => onViewMore(item.notice)}
        activeOpacity={0.8}>
        <NoticeIcon priority={priority} />
        <View style={styles.contentContainer}>
          <Text style={styles.noticeTitle}>Notice</Text>
          <Text numberOfLines={2} style={styles.noticeSubtitle}>
            {item.notice ? item.notice.replace(HTML_REGEX, '') : 'Notice text not available'}
          </Text>
          <Text style={styles.noticeDate}>
            {formatDate(item.added_date || item.created_at)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={4 * width} color="#9ca3af" />
      </TouchableOpacity>
    );
  };

  const DateSection = ({ date, children }) => (
    <View style={styles.dateSection}>
      <Text style={styles.dateHeader}>{date}</Text>
      {children}
    </View>
  );

  const groupedNotices = groupNoticesByDate();

  return (
    <Provider>

      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <LinearGradient
        colors={['#EBF7F8', '#EAF4F6', '#CCF0F7', '#CECBEA']}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>

        <SafeAreaView edges={['top']} style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          <View style={styles.header}>
            <Text style={styles.headerText}>All Notices</Text>
          </View>
        </SafeAreaView>


        <View style={{ flex: 1 }}>
          {/* Header */}

          <View style={{ flex: 1 }}>
            {/* Content */}
            {noticeList.length > 0 ? (
              <ScrollView
                style={styles.container}
                contentContainerStyle={{ paddingBottom: height * 10 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[ColorCode.primary]}
                    tintColor={ColorCode.primary}
                  />
                }>
                {groupedNotices.map((section, index) => (
                  <DateSection key={index} date={section.date}>
                    {section.notices.map((item, idx) => (
                      <NoticeItem
                        key={`${index}-${idx}`}
                        item={item}
                        onViewMore={handleViewMore}
                      />
                    ))}
                  </DateSection>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No Notices Found</Text>
              </View>
            )}
          </View>
          {isInitialLoading && (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#FCFCFC' }]}>
              <NoticeSkeleton />
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => setVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View
                style={{
                  flexDirection: 'row',
                  gap: width * 2,
                }}>
                <Image
                  source={require('../../../assets/images/messages.png')}
                  style={{
                    width: width * 6,
                    height: width * 6,
                    resizeMode: 'contain',
                  }}
                />
                <Text
                  style={{ fontSize: width * 3.8, fontFamily: Fonts.SemiBold }}>
                  Notice Details
                </Text>
              </View>
              <View
                style={{
                  height: 0.5,
                  backgroundColor: ColorCode.greyAAA,
                  width: '100%',
                  marginVertical: width * 2,
                }}
              />
              <Text style={{ fontSize: width * 3.6, fontFamily: Fonts.Regular }}>
                {notice ? notice.replace(HTML_REGEX, '') : 'Notice details not available'}
              </Text>
            </ScrollView>
            <TouchableOpacity
              onPress={() => setVisible(false)}
              style={styles.modalButton}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CustomProgress show={showProgress && !isInitialLoading} />
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 4 * width,
    paddingTop: 3 * width,
  },
  header: {
    width: '100%',
    height: Platform.OS === 'ios' ? 7 * height : 6 * height,
    // backgroundColor is handled by parent view now
    // backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    paddingHorizontal: 7 * width,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },

  headerText: {
    fontSize: 4.5 * width,
    fontFamily: Fonts.SemiBold,
    color: '#000',
  },
  dateSection: {
    marginBottom: 6 * width,
  },
  dateHeader: {
    fontSize: 3.8 * width,
    fontFamily: Fonts.Medium,
    color: '#374151',
    marginBottom: 3 * width,
    marginLeft: 1 * width,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4 * width,
    marginBottom: 2 * width,
    borderRadius: 3 * width,
    borderWidth: 1,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 8 * width,
    height: 8 * width,
    borderRadius: 4 * width,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 3 * width,
  },
  contentContainer: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 3.6 * width,
    fontFamily: Fonts.SemiBold,
    color: '#111827',
    marginBottom: 0.5 * width,
  },
  noticeSubtitle: {
    fontSize: 3.2 * width,
    fontFamily: Fonts.Regular,
    color: '#6b7280',
    lineHeight: 4.5 * width,
  },
  noticeDate: {
    fontSize: 2.8 * width,
    fontFamily: Fonts.Regular,
    color: '#9ca3af',
    marginTop: 1 * width,
  },
  noDataContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 4 * width,
    fontFamily: Fonts.Medium,
    color: ColorCode.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 85,
    height: height * 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },
  modalText: {
    fontSize: width * 3.4,
    color: '#000',
    textAlign: 'justify',
  },
  modalButton: {
    alignSelf: 'center',
    marginTop: 20,
    backgroundColor: '#EEF0F7',
    borderRadius: 10,
    paddingHorizontal: 5 * width,
    paddingVertical: 4 * width,
    width: '90%',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 3.2 * width,
    fontFamily: Fonts.Medium,
    color: '#000',
  },
});

export default NoticeTabScreen;
