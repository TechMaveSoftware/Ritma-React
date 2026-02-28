import React, { Fragment, useEffect, useRef, useState } from 'react';
import {
    FlatList,
    Image,
    Linking,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
    RefreshControl,
} from 'react-native';
import { Provider } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import CustomProgress from '../../compenents/CustomProgress';
import CustomStatus from '../../compenents/CustomStatus';
import ImageView from '../../compenents/ImageView';
import Fonts from '../../utility/Fonts';
import StorageUtility from '../../utility/StorageUtility';
import ToastUtility from '../../utility/ToastUtility';
import Entypo from 'react-native-vector-icons/Entypo';
import ApiMethod from '../../api/ApiMethod';
import CustomSAView from '../../compenents/CustomSAView';
import ColorCode from '../../utility/ColorCode';
import ConstData from '../../utility/ConstData';
import CustomHeaderTablet from '../../compenents/CustomHeaderTablet';
import SyllabusDetailSkeletonTablet from '../../compenents/SyllabusDetailSkeletonTablet';

const screenWidth = Dimensions.get('window').width;
const width = screenWidth > 420 ? 420 / 100 : screenWidth / 100;
const height = Dimensions.get('window').height / 100;

const SyllabusDetailScreenTablet = ({ navigation, route }) => {
    const [user, setUser] = useState(null);
    const [showProgress, setShowProgress] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('Lessons'); // 'Lessons', 'Quiz Assignments', 'All Learnings'
    const [expandedQuizId, setExpandedQuizId] = useState(null);
    const [dataList, setDataList] = useState(route.params.dataList || []);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const hasLoadedOnceRef = useRef(false);
    const lastQuizRefreshRef = useRef(null);

    const selectedWeek = route.params.selectedWeek;

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            getUserDetail();
        });
        return unsubscribe;
    }, [navigation, route.params?.refreshFromQuiz]);

    const getUserDetail = async () => {
        var uu = await StorageUtility.getUser();
        setUser(uu);
        const refreshToken = route.params?.refreshFromQuiz;
        if (refreshToken && refreshToken !== lastQuizRefreshRef.current) {
            lastQuizRefreshRef.current = refreshToken;
            apiCall(true);
            return;
        }
        // Load once on focus lifecycle; avoid refetch every back navigation.
        if (!hasLoadedOnceRef.current) {
            apiCall(true);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        apiCall(true);
    };

    const apiCall = (isPullRefresh = false) => {
        if (!isPullRefresh) {
            setShowProgress(true);
        }
        const syllabusId = route.params.dataList[0]?.id;

        if (syllabusId) {
            ApiMethod.syllabusDetail(
                `syllabus_id=${syllabusId}`,
                pass => {
                    setShowProgress(false);
                    setRefreshing(false);
                    setIsInitialLoading(false);
                    hasLoadedOnceRef.current = true;
                    if (pass.status == 200) {
                        let filteredData = pass.data;
                        if (route.params.chapterName) {
                            filteredData = pass.data.filter(item => item.chapter_name === route.params.chapterName);
                        }
                        setDataList(filteredData);
                    }
                },
                fail => {
                    setShowProgress(false);
                    setRefreshing(false);
                    setIsInitialLoading(false);
                    hasLoadedOnceRef.current = true;
                    console.error('Syllabus detail fetch failed', fail);
                },
            );
        } else {
            setShowProgress(false);
            setRefreshing(false);
            setIsInitialLoading(false);
            hasLoadedOnceRef.current = true;
        }
    };

    const startQuiz = (quizItem) => {
        const quizData = quizItem.quiz_data;
        if (!quizData || !quizData.questions || quizData.questions.length === 0) {
            ToastUtility.showToast('Quiz data not found.');
            return;
        }

        navigation.navigate('OnlineQuiz', {
            data: {
                quiz: quizData,
                quiz_bank_id: quizItem.quiz_bank_id,
                syllabus_id: quizItem.syllabus_id,
            },
            post: {
                quiz_bank_id: quizItem.quiz_bank_id,
                syllabus_id: quizItem.syllabus_id,
                title: quizData.title,
            },
            totalAttempt: quizData.attempt_history?.length || 0,
        });
    };

    const toNumber = value => {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return value;
        }
        if (typeof value === 'string') {
            const parsed = parseFloat(value);
            return Number.isFinite(parsed) ? parsed : null;
        }
        return null;
    };

    const viewResult = (attempt, quizItem) => {
        const attemptId = attempt?.id || attempt?.attempt_id;
        if (!attemptId) {
            ToastUtility.showToast('Attempt ID not available.');
            return;
        }

        const quizData = quizItem.quiz_data;
        const questions = quizData?.questions || [];
        const questionCount = questions.length;
        const totalMarks = questions.reduce((acc, q) => acc + (toNumber(q.points) || 1), 0);

        setShowProgress(true);
        ApiMethod.quizResult(
            `attempt_id=${attemptId}`,
            pass => {
                setShowProgress(false);
                if (pass?.attempt_result) {
                    navigation.navigate('OnlineQuizResult', {
                        data: pass.attempt_result,
                        attemptId: attemptId,
                        quizTitle: quizData?.title,
                        quizData,
                        questionCount,
                        totalMarks,
                        resultPayload: pass.attempt_result,
                    });
                } else {
                    ToastUtility.showToast('No result data available.');
                }
            },
            fail => {
                setShowProgress(false);
                ToastUtility.showToast('Failed to load quiz result.');
            },
        );
    };

    return (
        <Provider>
            <SafeAreaView style={{ flex: 1, backgroundColor: ColorCode.white }}>
                <CustomStatus trans={true} isDark={true} color="#FFFFFF00" />
                <CustomSAView parentStyple={{ flex: 1 }} style={Styles.saView}>
                    <CustomHeaderTablet
                        text={route.params.subjectName ? `${route.params.subjectName} Syllabus Details` : 'Syllabus Details'}
                        customStyle={{ marginTop: 0 }}
                    />

                    <View style={Styles.contentContainer}>
                        {isInitialLoading ? (
                            <SyllabusDetailSkeletonTablet />
                        ) : (
                            <Fragment>
                                {/* Chapter Info Card */}
                                {dataList && dataList[0] && (
                                    <View style={[Styles.infoCard, { alignSelf: 'stretch' }]}>
                                        <Text style={Styles.infoCardTitle} numberOfLines={2}>{dataList[0].chapter_name}</Text>
                                        <Text style={Styles.infoCardSubTitle}>
                                            {dataList[0].main_topic || "Master the essential topics for this module."}
                                        </Text>
                                        <View style={Styles.infoMetaContainer}>
                                            <View style={[Styles.infoMetaChip, { backgroundColor: '#EBF5FF' }]}>
                                                <Feather name="calendar" size={width * 2.5} color="#007AFF" />
                                                <Text style={[Styles.infoMetaText, { color: '#000' }]}>{`Week: ${dataList[0].week_range_start ?? 1}-${dataList[0].week_range_end ?? 3}`}</Text>
                                            </View>
                                            <View style={[Styles.infoMetaChip, { backgroundColor: '#FFF4EB' }]}>
                                                <Feather name="clock" size={width * 2.5} color="#FF9500" />
                                                <Text style={[Styles.infoMetaText, { color: '#000' }]}>{`${dataList[0].estimated_duration || 60} Hours`}</Text>
                                            </View>
                                            <View style={[Styles.infoMetaChip, { backgroundColor: '#F5EBFF' }]}>
                                                <Image
                                                    source={require('../../assets/images/quizess.png')}
                                                    style={{ width: width * 3, height: width * 3, resizeMode: 'contain' }}
                                                />
                                                <Text style={[Styles.infoMetaText, { color: '#000' }]}>
                                                    {(() => {
                                                        const totalQuizzes = dataList.reduce((count, chapter) => {
                                                            const quizzes = chapter.syllabus_quizs || [];
                                                            return count + quizzes.length;
                                                        }, 0);
                                                        return `${totalQuizzes.toString().padStart(2, '0')} Quiz${totalQuizzes !== 1 ? 'zes' : ''}`;
                                                    })()}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                )}

                                {/* Segmented Control */}
                                <View style={Styles.segmentedContainer}>
                                    {['Lessons', 'Quiz Assignments', 'All Learnings'].map((tab) => (
                                        <TouchableOpacity
                                            key={tab}
                                            onPress={() => setActiveTab(tab)}
                                            style={[
                                                Styles.segmentedTab,
                                                activeTab === tab && Styles.activeSegmentedTab,
                                            ]}>
                                            <Text
                                                style={[
                                                    Styles.segmentedTabText,
                                                    activeTab === tab && Styles.activeSegmentedTabText,
                                                ]}>
                                                {tab}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* List of Details */}
                                <View style={{ flex: 1, width: '100%' }}>
                                    <FlatList
                                        data={
                                            activeTab === 'Lessons' ? (dataList[0]?.syllabus_lessions || []) :
                                                activeTab === 'Quiz Assignments' ? (dataList[0]?.syllabus_quizs || []) :
                                                    activeTab === 'All Learnings' ? (dataList[0] ? [dataList[0]] : []) :
                                                        dataList
                                        }
                                        keyExtractor={(item, index) => String(item.id || index)}
                                        style={{ width: '100%' }}
                                        contentContainerStyle={{ paddingBottom: 5 * height, alignItems: 'flex-start' }}
                                        refreshControl={
                                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                                        }
                                        renderItem={({ item }) => {
                                            if (activeTab === 'Lessons') {
                                                const weekStart = dataList[0]?.week_range_start;
                                                const weekEnd = dataList[0]?.week_range_end;
                                                const lessonWeekLabel =
                                                    weekStart !== undefined && weekStart !== null && weekEnd !== undefined && weekEnd !== null
                                                        ? `Week ${weekStart}-${weekEnd}`
                                                        : String(item.week ?? item.week_id ?? '');
                                                return (
                                                    <TouchableOpacity
                                                        style={Styles.lessonCard}
                                                        onPress={() =>
                                                            navigation.navigate('LessonContent', {
                                                                lesson: item,
                                                                syllabus_id: dataList[0]?.id,
                                                                week_label: lessonWeekLabel,
                                                            })
                                                        }
                                                    >
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={Styles.lessonTitle}>{item.title || item.name || item.chapter_name}</Text>
                                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: width * 1 }}>
                                                                <Text style={Styles.lessonWeekText}>{lessonWeekLabel}</Text>
                                                                {item.completion == 1 && (
                                                                    <View style={Styles.completedBadge}>
                                                                        <Text style={Styles.completedBadgeText}>Completed</Text>
                                                                    </View>
                                                                )}
                                                            </View>
                                                            <Text style={Styles.lessonWeekText} numberOfLines={1}>
                                                                {item.description ? item.description.replace(/<[^>]*>?/gm, '').substring(0, 50) + '...' : 'Learning Content'}
                                                            </Text>
                                                        </View>
                                                        <Ionicons name="chevron-forward" size={width * 4} color="#CCC" />
                                                    </TouchableOpacity>
                                                );
                                            } else if (activeTab === 'Quiz Assignments') {
                                                const isExpanded = expandedQuizId === item.id;
                                                const attempts = [...(item.quiz_data?.attempt_history || [])].sort((a, b) => {
                                                    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
                                                    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
                                                    return timeB - timeA;
                                                });
                                                const totalAllowed = 3;
                                                const attemptsUsed = attempts.length;

                                                return (
                                                    <View style={Styles.accordionCard}>
                                                        <TouchableOpacity
                                                            style={Styles.accordionHeader}
                                                            onPress={() => setExpandedQuizId(isExpanded ? null : item.id)}>
                                                            <View style={{ flex: 1, alignItems: 'flex-start' }}>
                                                                <Text style={Styles.lessonTitle} numberOfLines={2}>{item.quiz_data?.title || 'Quiz Assignment'}</Text>
                                                                <Text style={[Styles.attemptsText, { color: attemptsUsed >= totalAllowed ? '#FF3B30' : '#FF9500' }]}>
                                                                    {`${attemptsUsed} / ${totalAllowed} Attempts Used`}
                                                                </Text>
                                                            </View>
                                                            <Ionicons
                                                                name={isExpanded ? "chevron-up" : "chevron-down"}
                                                                size={width * 5}
                                                                color="#333"
                                                                style={{ marginLeft: width * 2 }}
                                                            />
                                                        </TouchableOpacity>

                                                        {isExpanded && (
                                                            <View style={Styles.expandedContent}>
                                                                <Text style={Styles.historyTitle}>Quiz Attempt History</Text>
                                                                {attempts.length > 0 ? (
                                                                    attempts.map((attempt, index) => (
                                                                        <View key={index} style={Styles.attemptRow}>
                                                                            <View style={{ flex: 1 }}>
                                                                                <Text style={Styles.attemptLabel}>{`Attempt ${attempts.length - index}`}</Text>
                                                                                <Text style={Styles.attemptDate}>
                                                                                    {new Date(attempt.created_at).toLocaleDateString() + ' • ' + new Date(attempt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                                </Text>
                                                                            </View>
                                                                            <View style={{ alignItems: 'flex-end', gap: width * 1 }}>
                                                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: width * 2 }}>
                                                                                    <TouchableOpacity
                                                                                        onPress={() => viewResult(attempt, item)}
                                                                                        style={Styles.resultBtn}>
                                                                                        <Text style={Styles.resultBtnText}>Result</Text>
                                                                                        <Ionicons name="chevron-forward" size={width * 3} color="#007AFF" />
                                                                                    </TouchableOpacity>
                                                                                    <View style={[Styles.statusBadge, { backgroundColor: attempt.percentage >= 70 ? '#EFFFF6' : '#FFECEC' }]}>
                                                                                        <Text style={[Styles.statusBadgeText, { color: attempt.percentage >= 70 ? '#008A3D' : '#FF3B30' }]}>
                                                                                            {attempt.percentage >= 70 ? 'Passed' : 'Failed'}
                                                                                        </Text>
                                                                                    </View>
                                                                                </View>
                                                                                <Text style={Styles.gradeText}>{`Grade: ${ConstData.getGradeValue(attempt.percentage)}`}</Text>
                                                                                <Text style={Styles.percentageText}>{`${Math.round(attempt.percentage)}%`}</Text>
                                                                            </View>
                                                                        </View>
                                                                    ))
                                                                ) : (
                                                                    <Text style={Styles.noHistoryText}>No attempts yet.</Text>
                                                                )}

                                                                {attemptsUsed < totalAllowed ? (
                                                                    <View style={Styles.warningBox}>
                                                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: height * 1 }}>
                                                                            <Ionicons name="warning" size={width * 4} color="#FF9500" />
                                                                            <Text style={Styles.warningText}>{` Only ${totalAllowed - attemptsUsed} attempt${totalAllowed - attemptsUsed > 1 ? 's' : ''} remaining`}</Text>
                                                                        </View>
                                                                        <Text style={Styles.allowedText}>{`Total attempts allowed: ${totalAllowed}`}</Text>
                                                                        <TouchableOpacity
                                                                            style={Styles.startQuizBtn}
                                                                            onPress={() => startQuiz(item)}>
                                                                            <Text style={Styles.startQuizBtnText}>
                                                                                {attemptsUsed > 0 ? 'Retake Quiz' : 'Start Final Quiz'}
                                                                            </Text>
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                ) : (
                                                                    <View style={[Styles.warningBox, { backgroundColor: '#F8F8F8', borderColor: '#EEE' }]}>
                                                                        <Text style={[Styles.allowedText, { textAlign: 'center' }]}>Maximum attempts reached for this quiz.</Text>
                                                                    </View>
                                                                )}
                                                            </View>
                                                        )}
                                                    </View>
                                                );
                                            } else {
                                                let activities = [];
                                                let points = [];
                                                try {
                                                    activities = item.learning_activities ? (typeof item.learning_activities === 'string' ? JSON.parse(item.learning_activities) : item.learning_activities) : [];
                                                    points = item.learning_points ? (typeof item.learning_points === 'string' ? JSON.parse(item.learning_points) : item.learning_points) : [];
                                                } catch (e) {
                                                    console.log('Error parsing learning data', e);
                                                }

                                                return (
                                                    <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                                                        {/* Learning Activities Section */}
                                                        <View style={[Styles.learningCard, { width: '48.5%' }]}>
                                                            <View style={Styles.learningHeader}>
                                                                <Text style={Styles.learningHeaderTitle}>Learning Activities</Text>
                                                            </View>
                                                            <View style={Styles.learningContent}>
                                                                {activities.map((act, idx) => (
                                                                    <View key={idx} style={Styles.learningItem}>
                                                                        <View style={Styles.checkCircle}>
                                                                            <Ionicons name="checkmark" size={width * 3} color="#008A3D" />
                                                                        </View>
                                                                        <Text style={Styles.learningItemText}>{act}</Text>
                                                                    </View>
                                                                ))}
                                                                {activities.length === 0 && <Text style={Styles.noDataText}>No activities listed.</Text>}
                                                            </View>
                                                        </View>

                                                        {/* Detailed Learning Points Section */}
                                                        <View style={[Styles.learningCard, { width: '48.5%' }]}>
                                                            <View style={Styles.learningHeader}>
                                                                <Text style={Styles.learningHeaderTitle}>Detailed Learning Points</Text>
                                                            </View>
                                                            <View style={Styles.learningContent}>
                                                                {points.map((pt, idx) => (
                                                                    <View key={idx} style={Styles.learningItem}>
                                                                        <View style={Styles.bookIconContainer}>
                                                                            <Ionicons name="document-text" size={width * 3.5} color="#007AFF" />
                                                                        </View>
                                                                        <Text style={Styles.learningItemText}>{pt}</Text>
                                                                    </View>
                                                                ))}
                                                                {points.length === 0 && <Text style={Styles.noDataText}>No learning points listed.</Text>}
                                                            </View>
                                                        </View>
                                                    </View>
                                                );
                                            }
                                        }}
                                    />
                                </View>
                            </Fragment>
                        )}
                    </View>
                </CustomSAView>
            </SafeAreaView>
            <CustomProgress show={showProgress && !isInitialLoading} />
        </Provider>
    );
};

const Styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: ColorCode.white },
    saView: { flex: 1, backgroundColor: ColorCode.transarent },
    header: {
        width: '100%',
        height: 6 * height,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 3 * width,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4 * height,
    },
    backBtn: {
        width: 10 * width,
        height: 10 * width,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 4.5 * width,
        fontFamily: Fonts.Bold,
        color: ColorCode.black,
    },
    contentContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'flex-start', // Enforce left alignment
        paddingHorizontal: 2.5 * width,
        paddingTop: 1.9 * height,
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        width: '100%', // Stretch to full width
        borderRadius: width * 3,
        padding: width * 4.75,
        marginBottom: height * 2.85,
        borderWidth: 1,
        borderColor: '#F0F0FF',
        ...ConstData.ELEVATION_STYLE,
    },
    infoCardTitle: {
        fontSize: width * 5,
        fontFamily: Fonts.Bold,
        color: '#1A1A1A',
        marginBottom: height * 0.5,
    },
    infoCardSubTitle: {
        fontSize: width * 3.5,
        fontFamily: Fonts.Regular,
        color: '#666',
        lineHeight: width * 5,
        marginBottom: height * 2,
    },
    infoMetaContainer: {
        flexDirection: 'row',
        gap: width * 3,
    },
    infoMetaChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: width * 3,
        paddingVertical: height * 0.8,
        borderRadius: width * 5,
        gap: width * 1.5,
    },
    infoMetaText: {
        fontSize: width * 2.8,
        fontFamily: Fonts.SemiBold,
    },
    segmentedContainer: {
        flexDirection: 'row',
        padding: width * 1,
        marginBottom: height * 2.85, // Reduced from 3 * height
        gap: width * 2,
        width: '100%',
    },
    segmentedTab: {
        flex: 1,
        paddingVertical: height * 1.14, // Reduced from 1.2 * height
        alignItems: 'center',
        borderRadius: width * 2,
        backgroundColor: '#F2F2F2',
    },
    activeSegmentedTab: {
        backgroundColor: '#007AFF',
        ...ConstData.ELEVATION_STYLE,
    },
    segmentedTabText: {
        fontSize: width * 3.06,
        fontFamily: Fonts.Medium,
        color: '#666',
    },
    activeSegmentedTabText: {
        color: '#FFF',
    },
    lessonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        width: '100%', // Stretch to full width
        padding: width * 3.8,
        borderRadius: width * 3,
        marginBottom: width * 2.85,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        ...ConstData.ELEVATION_STYLE,
    },
    lessonTitle: {
        fontSize: width * 3.8,
        fontFamily: Fonts.SemiBold,
        color: '#000',
        textAlign: 'left', // Explicitly left align text
    },
    lessonWeekText: {
        fontSize: width * 3.2,
        fontFamily: Fonts.Medium,
        color: '#999',
    },
    completedBadge: {
        backgroundColor: '#EFFFF6',
        paddingHorizontal: width * 2,
        paddingVertical: width * 0.5,
        borderRadius: width * 1,
        marginLeft: width * 2,
    },
    completedBadgeText: {
        fontSize: width * 2.8,
        color: '#008A3D',
        fontFamily: Fonts.Medium,
    },
    quizStartBtn: {
        backgroundColor: '#007AFF',
        paddingHorizontal: width * 4,
        paddingVertical: width * 1.5,
        borderRadius: width * 1.5,
    },
    quizStartBtnText: {
        color: '#FFF',
        fontSize: width * 3.2,
        fontFamily: Fonts.SemiBold,
    },
    accordionCard: {
        backgroundColor: '#FFF',
        width: '100%', // Stretch to full width
        alignSelf: 'stretch', // Changed from center
        borderRadius: width * 3,
        marginBottom: width * 2.85,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        overflow: 'hidden',
    },
    accordionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%', // Fill the card
        padding: width * 3.8,
    },
    attemptsText: {
        fontSize: width * 3.2,
        fontFamily: Fonts.Medium,
        marginTop: width * 0.5,
    },
    expandedContent: {
        paddingHorizontal: width * 3.8, // Reduced from 4 * width
        paddingBottom: width * 3.8, // Reduced from 4 * width
    },
    historyTitle: {
        fontSize: width * 3.5,
        fontFamily: Fonts.SemiBold,
        color: '#333',
        marginBottom: width * 3,
    },
    attemptRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: width * 2.5,
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
    },
    attemptLabel: {
        fontSize: width * 3.4,
        fontFamily: Fonts.SemiBold,
        color: '#333',
    },
    attemptDate: {
        fontSize: width * 3,
        fontFamily: Fonts.Regular,
        color: '#999',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: width * 2,
        paddingVertical: width * 0.5,
        borderRadius: width * 1,
    },
    statusBadgeText: {
        fontSize: width * 2.6,
        fontFamily: Fonts.Bold,
    },
    gradeText: {
        fontSize: width * 3,
        fontFamily: Fonts.SemiBold,
        color: '#333',
        marginTop: 2,
    },
    percentageText: {
        fontSize: width * 2.8,
        fontFamily: Fonts.Medium,
        color: '#666',
    },
    noHistoryText: {
        fontSize: width * 3.2,
        fontFamily: Fonts.Regular,
        color: '#999',
        textAlign: 'center',
        marginVertical: width * 2,
    },
    warningBox: {
        backgroundColor: '#FFF9F0',
        borderRadius: width * 2,
        padding: width * 4,
        marginTop: width * 2,
        borderWidth: 1,
        borderColor: '#FFECCF',
    },
    warningText: {
        fontSize: width * 3.2,
        fontFamily: Fonts.SemiBold,
        color: '#FF9500',
    },
    allowedText: {
        fontSize: width * 3,
        fontFamily: Fonts.Regular,
        color: '#A86F1D',
        marginBottom: width * 3,
    },
    startQuizBtn: {
        backgroundColor: '#007AFF',
        paddingVertical: width * 2.85, // Reduced from 3 * width
        borderRadius: width * 2,
        alignItems: 'center',
    },
    startQuizBtnText: {
        color: '#FFF',
        fontSize: width * 3.8,
        fontFamily: Fonts.SemiBold,
    },
    learningCard: {
        backgroundColor: '#FFF',
        borderRadius: width * 3,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        overflow: 'hidden',
    },
    learningHeader: {
        padding: width * 3.8, // Reduced from 4 * width
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    learningHeaderTitle: {
        fontSize: width * 4,
        fontFamily: Fonts.SemiBold,
        color: '#333',
    },
    learningContent: {
        padding: width * 3.8, // Reduced from 4 * width
    },
    learningItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: width * 4,
    },
    learningItemText: {
        flex: 1,
        fontSize: width * 3.6,
        fontFamily: Fonts.Regular,
        color: '#444',
        marginStart: width * 3,
        lineHeight: width * 5,
    },
    checkCircle: {
        width: width * 5,
        height: width * 5,
        borderRadius: width * 2.5,
        backgroundColor: '#EFFFF6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookIconContainer: {
        width: width * 7,
        height: width * 7,
        borderRadius: width * 1.5,
        backgroundColor: '#E6F2FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    noDataText: {
        fontSize: width * 3.2,
        fontFamily: Fonts.Regular,
        color: '#999',
        textAlign: 'center',
    },
    resultBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EBF5FF',
        paddingHorizontal: width * 2,
        paddingVertical: width * 0.5,
        borderRadius: width * 1,
    },
    resultBtnText: {
        fontSize: width * 2.8,
        fontFamily: Fonts.Bold,
        color: '#007AFF',
        marginRight: 2,
    },

});

export default SyllabusDetailScreenTablet;
