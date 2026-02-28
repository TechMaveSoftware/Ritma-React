import React, { useState } from 'react';
import {
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    Linking,
    StatusBar,
    Platform,
    Dimensions,
    Modal,
    RefreshControl,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { WebView } from 'react-native-webview';
import ColorCode from '../../../utility/ColorCode';
import Fonts from '../../../utility/Fonts';
import CustomStatus from '../../../compenents/CustomStatus';
import ApiMethod from '../../../api/ApiMethod';
import CustomProgress from '../../../compenents/CustomProgress';
import ToastUtility from '../../../utility/ToastUtility';
import YoutubePlayer from 'react-native-youtube-iframe';
import { getYouTubeVideoId } from '../../../utility/YouTubeUtility';

const screenWidth = Dimensions.get('window').width;
const width = screenWidth > 420 ? 420 / 100 : screenWidth / 100;
const height = Dimensions.get('window').height / 100;

const LessonContentScreenTablet = ({ navigation, route }) => {
    const { lesson, syllabus_id } = route.params;
    const insets = useSafeAreaInsets();
    const [showProgress, setShowProgress] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [lessonData, setLessonData] = useState(lesson);
    const [refreshing, setRefreshing] = useState(false);
    const [htmlContentHeight, setHtmlContentHeight] = useState(width * 20);

    const isCompleted = lessonData && lessonData.completion && lessonData.completion.completed == 1;

    const handlePlayVideo = () => {
        if (lessonData.video_link) {
            Linking.openURL(lessonData.video_link).catch(err =>
                console.error('An error occurred', err),
            );
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        ApiMethod.syllabusDetail(
            `syllabus_id=${syllabus_id}`,
            (pass) => {
                setRefreshing(false);
                if (pass && pass.status == 200 && pass.data) {
                    const updatedLesson = pass.data.find(item => item.id === lesson.id);
                    if (updatedLesson) {
                        setLessonData(updatedLesson);
                    }
                }
            },
            (fail) => {
                setRefreshing(false);
            }
        );
    };

    const handleMarkComplete = () => {
        setShowCompleteModal(false);
        // Wait for confirmation modal to close before showing progress
        setTimeout(() => {
            setShowProgress(true);

            const formData = new FormData();
            formData.append('syllabus_id', syllabus_id);
            formData.append('syllabus_lesson_id', lessonData.id);

            ApiMethod.completeSyllabusLesson(
                formData,
                (pass) => {
                    setShowProgress(false);
                    // Wait for progress modal to close before acting on response
                    setTimeout(() => {
                        if (pass && pass.status == 200) {
                            ToastUtility.showToast(pass.message || 'Lesson marked as completed');
                            navigation.goBack();
                        } else {
                            ToastUtility.showToast(pass && pass.message ? pass.message : 'Failed to mark lesson as completed');
                        }
                    }, 500);
                },
                (fail) => {
                    setShowProgress(false);
                    setTimeout(() => {
                        ToastUtility.showToast('Something went wrong');
                    }, 500);
                }
            );
        }, 500);
    };


    const unescapeHtml = (safe) => {
        if (!safe) return '';
        let str = safe;
        let prevStr;
        // Recursive unescape up to 3 times to handle double-encoding
        for (let i = 0; i < 3; i++) {
            prevStr = str;
            str = str
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#039;/g, "'")
                .replace(/&nbsp;/g, ' ')
                .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
                .replace(/&#x([0-9a-f]+);/gi, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
            if (str === prevStr) break;
        }
        return str;
    };

    const renderContent = (htmlContent) => {
        if (!htmlContent) return null;
        const normalizedContent = String(htmlContent).trim();
        const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(normalizedContent);
        const finalHtml = hasHtmlTags
            ? normalizedContent
            : normalizedContent.replace(/\n/g, '<br />');
        const preparedHtml = unescapeHtml(finalHtml);
        const htmlDocument = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  font-size: 16px;
                  line-height: 1.6;
                  word-break: break-word;
                }
                img, iframe, video {
                  max-width: 100% !important;
                  height: auto !important;
                }
              </style>
            </head>
            <body>${preparedHtml}</body>
          </html>
        `;
        const injectedJavaScript = `
          (function() {
            function postHeight() {
              var height = Math.max(
                document.body.scrollHeight,
                document.body.offsetHeight,
                document.documentElement.clientHeight,
                document.documentElement.scrollHeight,
                document.documentElement.offsetHeight
              );
              window.ReactNativeWebView.postMessage(String(height));
            }
            postHeight();
            setTimeout(postHeight, 150);
            setTimeout(postHeight, 400);
            window.addEventListener('load', postHeight);
          })();
          true;
        `;

        return (
            <WebView
                originWhitelist={['*']}
                source={{ html: htmlDocument }}
                style={{ width: '100%', height: Math.max(htmlContentHeight, width * 20), backgroundColor: 'transparent' }}
                onMessage={(event) => {
                    const nextHeight = Number(event.nativeEvent.data);
                    if (Number.isFinite(nextHeight) && nextHeight > 0) {
                        setHtmlContentHeight(nextHeight);
                    }
                }}
                injectedJavaScript={injectedJavaScript}
                javaScriptEnabled
                domStorageEnabled
                scrollEnabled={false}
            />
        );
    };

    const getLessonHtmlContent = (data) => {
        if (!data) return '';
        return (
            data.description ||
            data.content ||
            data.lesson_content ||
            data.details ||
            ''
        );
    };

    const getHeaderWeekText = () => {
        const lessonWeek = lesson?.week ?? lesson?.week_id;
        if (lessonWeek !== undefined && lessonWeek !== null && String(lessonWeek).trim() !== '') {
            return String(lessonWeek).startsWith('Week')
                ? String(lessonWeek)
                : `Week ${lessonWeek}`;
        }

        const passedWeekLabel = route.params?.week_label;
        if (passedWeekLabel) {
            return String(passedWeekLabel).startsWith('Week')
                ? String(passedWeekLabel)
                : `Week ${passedWeekLabel}`;
        }

        const weekStart = lesson?.week_range_start;
        const weekEnd = lesson?.week_range_end;
        if (weekStart !== undefined && weekStart !== null && weekEnd !== undefined && weekEnd !== null) {
            return `Week ${weekStart}-${weekEnd}`;
        }

        const fallbackWeek = lesson?.week ?? lesson?.week_id;
        if (fallbackWeek !== undefined && fallbackWeek !== null && String(fallbackWeek).trim() !== '') {
            return String(fallbackWeek).startsWith('Week')
                ? String(fallbackWeek)
                : `Week ${fallbackWeek}`;
        }

        return 'Week';
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#FFF' }}>
            <SafeAreaView style={{ backgroundColor: '#fff', flex: 1 }}>
                <CustomStatus trans={true} isDark={true} color="#FFFFFF00" />
                {/* Custom Header with Week info - matched to My Syllabus position */}
                <View style={styles.headerWrapper}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <AntDesign size={width * 5} color={'#000'} name="arrowleft" />
                        </TouchableOpacity>
                        <View style={styles.headerTitleContainer}>
                            <Text style={styles.headerWeekText}>{getHeaderWeekText()}</Text>
                            <Text style={styles.headerLessonText} numberOfLines={1}>{lesson.name}</Text>
                        </View>
                    </View>
                    <View style={styles.headerSeparator} />
                </View>

                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >

                    {lessonData.title ? <Text style={styles.lessonTitle}>{lessonData.title}</Text> : null}

                    <View style={styles.descriptionContainer}>
                        {renderContent(getLessonHtmlContent(lessonData))}
                    </View>

                    {lessonData.video_link && (
                        <View style={styles.videoCard}>
                            {getYouTubeVideoId(lessonData.video_link) ? (
                                <View style={{ width: '100%', borderRadius: width * 3, overflow: 'hidden' }}>
                                    <YoutubePlayer
                                        height={width * 75}
                                        play={false}
                                        videoId={getYouTubeVideoId(lessonData.video_link)}
                                    />
                                </View>
                            ) : (
                                <React.Fragment>
                                    <Text style={styles.videoCardTitle}>Video Url</Text>
                                    <Text style={styles.videoCardSubtitle}>
                                        This video is hosted on an external platform. Click the button below to watch it.
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.playBtn}
                                        onPress={handlePlayVideo}
                                    >
                                        <Text style={styles.playBtnText}>Play Video</Text>
                                    </TouchableOpacity>
                                </React.Fragment>
                            )}
                        </View>
                    )}
                </ScrollView>

                <View style={[styles.footer, Platform.OS === 'android' && { paddingBottom: width * 15 }]}>
                    <TouchableOpacity
                        style={[styles.completeBtn, isCompleted && { backgroundColor: '#A0A0A0' }]}
                        activeOpacity={0.7}
                        disabled={isCompleted}
                        onPress={() => {
                            setShowCompleteModal(true);
                        }}
                    >
                        <Text style={styles.completeBtnText}>
                            {isCompleted ? 'Completed' : 'Mark as Completed'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Confirmation Modal */}
                <Modal
                    transparent={true}
                    visible={showCompleteModal}
                    animationType="fade"
                    onRequestClose={() => setShowCompleteModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <View style={styles.warningIconContainer}>
                                <Ionicons name="warning-outline" size={width * 10} color="#FF9500" />
                            </View>
                            <Text style={styles.modalTitle}>Mark this as Completed ?</Text>
                            <Text style={styles.modalSubtitle}>Are you sure you want to mark as completed?</Text>

                            <View style={styles.modalActionRow}>
                                <TouchableOpacity
                                    style={styles.skipBtn}
                                    activeOpacity={0.7}
                                    onPress={() => setShowCompleteModal(false)}
                                >
                                    <Text style={styles.skipBtnText}>No, Skip It</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.confirmBtn}
                                    activeOpacity={0.7}
                                    onPress={handleMarkComplete}
                                >
                                    <Text style={styles.confirmBtnText}>Yes, Mark Completed</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>

            <CustomProgress show={showProgress} />
        </View>
    );
};

const styles = StyleSheet.create({
    headerWrapper: {
        backgroundColor: '#fff',
    },
    headerContent: {
        width: '94%',
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        marginTop: Platform.OS === 'ios' ? 0 : -5,
    },
    backButton: {
        paddingRight: width * 4,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerWeekText: {
        fontSize: width * 3,
        fontFamily: Fonts.Bold,
        color: '#007AFF',
        marginBottom: 2,
    },
    headerLessonText: {
        fontSize: width * 4.2,
        fontFamily: Fonts.Medium,
        fontWeight: 'bold', // Kept bold as per user latest manual edit
        color: '#000',
        textTransform: 'uppercase',
    },
    headerSeparator: {
        height: 1,
        width: '100%',
        backgroundColor: ColorCode.greyAAA,
    },
    content: {
        flex: 1,
        width: '80%',
        alignSelf: 'center',
        paddingTop: width * 3,
    },
    lessonTitle: {
        fontSize: width * 5,
        fontFamily: Fonts.Bold,
        color: '#333',
        marginBottom: width * 2,
        marginTop: width * 2,
        textAlign: 'center',
    },
    videoCard: {
        backgroundColor: '#000',
        borderRadius: width * 3,
        padding: 0,
        alignItems: 'center',
        marginTop: width * 2,
        marginBottom: width * 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        overflow: 'hidden',
    },
    videoCardTitle: {
        fontSize: width * 4,
        fontFamily: Fonts.SemiBold,
        color: '#333',
        marginBottom: width * 2,
    },
    videoCardSubtitle: {
        fontSize: width * 3,
        fontFamily: Fonts.Regular,
        color: '#666',
        textAlign: 'center',
        marginBottom: width * 4,
        lineHeight: width * 4,
    },
    playBtn: {
        backgroundColor: '#007AFF',
        borderRadius: width * 1,
        paddingHorizontal: width * 8,
        paddingVertical: width * 3,
    },
    playBtnText: {
        color: '#FFF',
        fontSize: width * 3,
        fontFamily: Fonts.SemiBold,
    },
    descriptionContainer: {
        marginTop: width * 2,
    },
    footer: {
        paddingVertical: width * 4,
        paddingHorizontal: '10%',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        backgroundColor: '#fff',
        zIndex: 10,
        elevation: 5,
    },
    completeBtn: {
        backgroundColor: '#00BD5B',
        borderRadius: width * 1.5,
        height: width * 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    completeBtnText: {
        color: '#FFF',
        fontSize: width * 3.2,
        fontFamily: Fonts.SemiBold,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '60%',
        backgroundColor: '#fff',
        borderRadius: width * 3,
        padding: width * 10,
        alignItems: 'center',
    },
    warningIconContainer: {
        width: width * 16,
        height: width * 16,
        borderRadius: width * 8,
        backgroundColor: '#FFF8F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: width * 5,
    },
    modalTitle: {
        fontSize: width * 4.5,
        fontFamily: Fonts.Bold,
        color: '#333',
        textAlign: 'center',
        marginBottom: width * 3,
    },
    modalSubtitle: {
        fontSize: width * 3,
        fontFamily: Fonts.Regular,
        color: '#666',
        textAlign: 'center',
        marginBottom: width * 8,
    },
    modalActionRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
    },
    skipBtn: {
        flex: 1,
        backgroundColor: '#F0F0F0',
        height: width * 9,
        borderRadius: width * 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: width * 3,
    },
    skipBtnText: {
        fontSize: width * 2.8,
        fontFamily: Fonts.SemiBold,
        color: '#333',
    },
    confirmBtn: {
        flex: 1,
        backgroundColor: '#00BD5B',
        height: width * 9,
        borderRadius: width * 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: width * 3,
    },
    confirmBtnText: {
        fontSize: width * 2.8,
        fontFamily: Fonts.SemiBold,
        color: '#fff',
        textAlign: 'center',
    },
});

export default LessonContentScreenTablet;
