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
    Dimensions,
    Platform,
} from 'react-native';
import { Provider } from 'react-native-paper';
import CustomProgress from '../../compenents/CustomProgress';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fonts from '../../utility/Fonts';
import ApiMethod from '../../api/ApiMethod';
import ColorCode from '../../utility/ColorCode';
import CustomStatus from '../../compenents/CustomStatus';
import CustomSAView from '../../compenents/CustomSAView';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import StorageUtility from '../../utility/StorageUtility';

const screenWidth = Dimensions.get('window').width;
const width = (screenWidth > 420 ? 420 : screenWidth) * 0.01;
const height = Dimensions.get('window').height / 100;

const NotificationScreenTablet = ({ navigation, route }) => {
    const course_name = route.params?.course_name || '';
    const [noticeList, setNoticeList] = useState([]);
    const [showProgress, setShowProgress] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [emptyMessage, setEmptyMessage] = useState('No Data Found');
    const pushNotificationCleanupRef = useRef(null);

    useEffect(() => {
        getNotificationList();

        setupPushNotifications().then(cleanup => {
            pushNotificationCleanupRef.current = cleanup;
        }).catch(error => {
            console.error('❌ Error setting up push notifications:', error);
        });

        const periodicCleanup = setupPeriodicNotificationCheck();

        return () => {
            if (pushNotificationCleanupRef.current) {
                pushNotificationCleanupRef.current();
                pushNotificationCleanupRef.current = null;
            }
            periodicCleanup();
        };
    }, []);

    const getNotificationList = () => {
        setShowProgress(true);
        ApiMethod.getNotification(
            pass => {
                setShowProgress(false);
                if (pass.status == 200) {
                    setNoticeList(pass.data);
                    readNotifications(pass.data);
                    if (isInitialLoad) {
                        setIsInitialLoad(false);
                    }
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

    const setupPushNotifications = async () => {
        try {
            const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
                getNotificationList();
            });
            const unsubscribeNotifee = notifee.onForegroundEvent(({ type, detail }) => {
                if (type === 1 && detail.notification?.data) {
                    handleNotificationNavigation(detail.notification);
                }
            });
            return () => {
                unsubscribeForeground();
                unsubscribeNotifee();
            };
        } catch (error) {
            console.error('Error setting up notifications:', error);
            return () => { };
        }
    };

    const handleNotificationNavigation = (notification) => {
        const data = notification.data;
        if (data) {
            switch (data.type) {
                case 'assignment':
                    navigation.navigate('PendingAssignment', { type: 1 });
                    break;
                case 'quiz':
                    navigation.navigate('MyProgress', { course_name: course_name, quiz: data.quiz || 0 });
                    break;
                case 'notice':
                    navigation.navigate('TabStack', { screen: 'Notice' });
                    break;
                case 'grade':
                    navigation.navigate('TabStack', { screen: 'My Grades' });
                    break;
                default:
                    getNotificationList();
                    break;
            }
        }
    };

    const setupPeriodicNotificationCheck = () => {
        const interval = setInterval(() => {
            if (!isInitialLoad) {
                getNotificationList();
            }
        }, 30000);
        return () => clearInterval(interval);
    };

    const readNotifications = items => {
        const formData = new FormData();
        let count = 0;
        var filtered = items.filter(d => d.status == 0);
        if (filtered.length > 0) {
            filtered.forEach(item => {
                if (item.status == 0 && count <= 30) {
                    formData.append('notification_id[]', item.id);
                    count += 1;
                }
            });
            ApiMethod.readNotification(
                formData,
                pass => {
                    if (pass.status == '200') {
                        getNotificationList();
                    }
                },
                fail => { },
            );
        }
    };

    const handleOpenUrl = async url => {
        const encodedUrl = encodeURI(url);
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
                } else if (item.title.includes('Grade') || item.title.includes('Re-upload')) {
                    navigation.navigate('TabStack', { screen: 'My Grades' });
                } else if (item.title.includes('Skill') || item.title.includes('Attendance')) {
                    navigation.navigate('MyProgress', { course_name: course_name });
                } else if (item.title.includes('Chapter')) {
                    navigation.navigate('AssignmentList', { course_name: course_name });
                }
            }}
            style={styles.notificationCard}>
            <View style={styles.cardHeader}>
                <View style={styles.titleContainer}>
                    <View style={[styles.statusDot, { backgroundColor: '#D0D0D0' }]} />
                    <Text style={styles.notificationTitle} numberOfLines={1}>{item.title}</Text>
                </View>
                <Text style={styles.timeText}>{moment(item.created_at).fromNow()}</Text>
            </View>

            <Text style={styles.notificationDesc}>{item.description}</Text>

            <View style={styles.footerRow}>
                {item.google_form_url != null && (
                    <TouchableOpacity
                        onPress={() => handleOpenUrl(item.google_form_url)}
                        style={styles.actionButton}>
                        <Text style={styles.actionText}>Open Form</Text>
                        <Ionicons name="arrow-forward-outline" size={3 * width} color="#16763E" />
                    </TouchableOpacity>
                )}
                {item.google_doc_url != null && (
                    <TouchableOpacity
                        onPress={() => handleOpenUrl(item.google_doc_url)}
                        style={[styles.actionButton, { marginLeft: 2 * width }]}>
                        <Text style={styles.actionText}>Open Doc</Text>
                        <Ionicons name="arrow-forward-outline" size={3 * width} color="#16763E" />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <Provider>
            <View style={styles.mainContainer}>
                <CustomStatus trans={true} isDark={true} color="#FFFFFF00" />
                <CustomSAView parentStyple={{ flex: 1 }} style={styles.saView}>
                    <View
                        style={{
                            width: '100%',
                            height: 6 * height,
                            backgroundColor: '#FFFFFF',
                            paddingHorizontal: 3 * width,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottomWidth: 1,
                            borderBottomColor: '#E2E8F0',
                        }}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={{
                                width: 8 * width,
                                height: 8 * width,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                            <Ionicons
                                name="chevron-back"
                                size={6 * width}
                                color={'#000'}
                            />
                        </TouchableOpacity>
                        <Text
                            style={{
                                fontSize: 3.5 * width,
                                fontFamily: Fonts.SemiBold,
                                color: '#000000',
                            }}>
                            {'Notifications'}
                        </Text>
                        <View style={{ width: 10 * width }} />
                    </View>

                    <View style={styles.content}>
                        <FlatList
                            data={noticeList}
                            renderItem={renderItem}
                            keyExtractor={item => item.id.toString()}
                            contentContainerStyle={[styles.listContent, { flexGrow: 1 }]}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={() => (
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontFamily: Fonts.Medium, fontSize: width * 3, color: '#2E70E8' }}>
                                        {emptyMessage}
                                    </Text>
                                </View>
                            )}
                        />
                    </View>
                </CustomSAView>
            </View>
            <CustomProgress show={showProgress} />
        </Provider>
    );
};

export default NotificationScreenTablet;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    saView: {
        flex: 1,
    },
    header: {
        width: '100%',
        height: 6 * height,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 4 * width,
    },
    backBtn: {
        width: 8 * width,
        height: 8 * width,
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 3.5 * width,
        fontFamily: Fonts.Bold,
        color: '#000',
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#E5E5E5',
    },
    content: {
        flex: 1,
        paddingVertical: 2.5 * width,
        paddingHorizontal: 3.5 * width,
        backgroundColor: '#F9F9F9',
    },
    listContent: {
        // width: '95%',
        paddingVertical: 3 * height,
    },
    notificationCard: {
        backgroundColor: '#fff',
        borderRadius: 2 * width,
        padding: 3 * width,
        marginBottom: 2 * height,
        borderWidth: 1,
        borderColor: '#F0F0F0',
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
        marginBottom: 1 * height,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    statusDot: {
        width: 1.2 * width,
        height: 1.2 * width,
        borderRadius: 0.6 * width,
        marginRight: 1.5 * width,
    },
    notificationTitle: {
        fontSize: 3.2 * width,
        fontFamily: Fonts.SemiBold,
        color: '#000',
        flex: 1,
    },
    timeText: {
        fontSize: 2.5 * width,
        color: ColorCode.primary,
        fontFamily: Fonts.Medium,
    },
    notificationDesc: {
        fontSize: 2.8 * width,
        color: '#706767',
        fontFamily: Fonts.Regular,
        lineHeight: 2.5 * width,
    },
    footerRow: {
        flexDirection: 'row',
        marginTop: 1.5 * height,
        justifyContent: 'flex-end',
    },
    actionButton: {
        backgroundColor: '#D1FFE4',
        paddingHorizontal: 2 * width,
        paddingVertical: 0.8 * height,
        borderRadius: 4 * width,
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionText: {
        fontFamily: Fonts.Medium,
        fontSize: 1.6 * width,
        color: '#666',
        marginRight: 1 * width,
    },
});
