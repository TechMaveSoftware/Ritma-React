import React, { Fragment, useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FlatList,
  Image,
  Linking,

  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Provider } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import CustomProgress from '../../compenents/CustomProgress';
import CustomStatus from '../../compenents/CustomStatus';
import ImageView from '../../compenents/ImageView';
import height from '../../Units/height';
import width from '../../Units/width';
import Fonts from '../../utility/Fonts';
import StorageUtility from '../../utility/StorageUtility';
import ToastUtility from '../../utility/ToastUtility';
import Entypo from 'react-native-vector-icons/Entypo';
import ApiMethod from '../../api/ApiMethod';
import CustomSAView from '../../compenents/CustomSAView';
import ColorCode from '../../utility/ColorCode';
import ConstData from '../../utility/ConstData';
import CustomHeader from '../../compenents/CustomHeader';
import SyllabusDetailSkeleton from '../../compenents/SyllabusDetailSkeleton';

const dayMap = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

const SyllabusDetailScreen = ({ navigation, route }) => {
  const [selectedChapter, setSelectedChapter] = useState(route.params.day);
  const [className, setClassName] = useState(route.params.className);
  const [selectedWeek, setSelectedWeek] = useState(route.params.selectedWeek);
  const [selectedIndex, setSelectedIndex] = useState(
    route.params.selectedIndex,
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleIndex, setModalVisibleIndex] = useState(-1);
  const [markDonePopup, setMarkDonePopup] = useState(false);
  const [selectedGoogleAssgn, setSelectedGoogleAssgn] = useState(null);
  const [user, setUser] = useState(null);
  const [virtualClassCalendar, setVirtualClassCalendar] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedQuizMap, setExpandedQuizMap] = useState({});
  const [activeTab, setActiveTab] = useState('Lessons'); // 'Lessons', 'Quiz', 'Learnings'
  const [expandedQuizId, setExpandedQuizId] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const hasLoadedOnceRef = useRef(false);
  const lastQuizRefreshRef = useRef(null);

  const [dataList, setDataList] = useState(route.params.dataList);

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
            // Filter logic if needed, although tablet does it.
            // Keeping it consistent with tablet if parameters exist, but route.params might not change here.
            // The table version logic:
            // if (route.params.chapterName) {
            //     filteredData = pass.data.filter(item => item.chapter_name === route.params.chapterName);
            // }
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
  // const dataList = route.params.dataList;
  console.log('dataList', JSON.stringify(dataList));

  // const [dayWiseItem, setDayWiseItem] = useState(route.params.dayWiseItem);
  // console.log(
  //   '***************selected day',
  //   route.params.dataList.google_doc_url,
  // );
  // const [docUrl, setDocUrl] = useState(route.params.dataList.google_doc_url);
  // const [allChapterList, setAllChapterList] = useState(
  //   route.params.allChapterList,
  // );

  // const [chapterList, setChapterList] = useState(route.params.chapterList);
  // const [chapterDayWise, setChapterDayWise] = useState(
  //   route.params.chapterDayWise,
  // );

  // console.log('dayWiseItem', dayWiseItem);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // The screen is focused Call any action
      getUserDetail();
    });
    return unsubscribe;
  }, [navigation, route.params?.refreshFromQuiz]);

  const getUserDetail = async () => {
    var uu = await StorageUtility.getUser();
    // console.log(uu);
    setUser(uu);

    if (uu.type == 'virtual') {
      setVirtualClassCalendar(1);
      // ToastUtility.showToast('Virtual');
    } else {
      setVirtualClassCalendar(2);
      // ToastUtility.showToast('In Person');
    }

    // console.log(
    //   '***************allChapterList**************',
    //   dataList.google_doc_url,
    // );
    // setDocUrl();
    // let t1 = [];
    // allChapterList.map(item => {
    //   if (dayMap[selectedChapter] == item.day) {
    //     t1.push(item);
    //   }
    // });
    // // console.log('***************chapter**************', t1);
    // setAllChapterList(t1);

    // var path = await StorageUtility.getProfilePath();
    // setUserPath(path);

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



  // handling links openning ///
  const handleOpenUrl = async url => {
    const encodedUrl = encodeURI(url);
    // console.log(`Opening URL: ${encodedUrl}`);
    try {
      await Linking.openURL(encodedUrl);
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  const getUploadedAssignment = assignmentId => {
    if (!assignmentId) {
      ToastUtility.showToast('Assignment ID not available.');
      return;
    }
    console.log('getUploadedAssignment - using assignment_id:', assignmentId);
    navigation.navigate('UploadedDoc', { assignmentId: assignmentId });
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

  let quizShow = false;
  let assignmentShow = false;
  const itemData = {
    id: 1,
    step_id: 1,
    quiz_bank_id: 85,
    is_locked: false,
    attempt_history: [],
    quiz: {
      id: 85,
      title: 'CNA Chapter 1 Video/Quiz',
      quiz_type: 'Quiz',
      questions: [
        {
          id: 1903,
          quiz_bank_id: 85,
          question_text:
            'In which of the following healthcare settingsdoes a nursing assistant likely work?',
          points: 1,
          question_type: 'MCQ',
          options: [
            {
              id: 2070,
              question_id: 1903,
              option_text: 'Emergency dental office',
              is_correct: 0,
            },
            {
              id: 2071,
              question_id: 1903,
              option_text: 'Long-term care facility',
              is_correct: 1,
            },
            {
              id: 2072,
              question_id: 1903,
              option_text: 'Senior citizen center',
              is_correct: 0,
            },
            {
              id: 2073,
              question_id: 1903,
              option_text: 'Dialysis center',
              is_correct: 0,
            },
          ],
        },
        {
          id: 1904,
          quiz_bank_id: 85,
          question_text:
            'Which of the following statements is true ofassisted living?',
          points: 1,
          question_type: 'MCQ',
          options: [
            {
              id: 2074,
              question_id: 1904,
              option_text:
                'This care is given 24 hours a day by a nursing assistant who lives with the person who needs the care.',
              is_correct: 0,
            },
            {
              id: 2075,
              question_id: 1904,
              option_text: 'This care is provided by hospice volunteers.',
              is_correct: 0,
            },
            {
              id: 2076,
              question_id: 1904,
              option_text:
                'This care is given in an independent-living facility with some support services.',
              is_correct: 1,
            },
            {
              id: 2077,
              question_id: 1904,
              option_text:
                'This care is given in a person’s home forsix weeks following surgery.',
              is_correct: 0,
            },
          ],
        },
        {
          id: 1905,
          quiz_bank_id: 85,
          question_text: 'For whom are nursing assistants responsible?',
          points: 1,
          question_type: 'MCQ',
          options: [
            {
              id: 2078,
              question_id: 1905,
              option_text: 'All residents',
              is_correct: 1,
            },
            {
              id: 2079,
              question_id: 1905,
              option_text: 'Visitors who are in an NA’s assigned unit',
              is_correct: 0,
            },
            {
              id: 2080,
              question_id: 1905,
              option_text:
                'Another term for the kind of care provided at a skilled nursing facility',
              is_correct: 0,
            },
            {
              id: 2081,
              question_id: 1905,
              option_text:
                'A medical assistance program partially funded by the state',
              is_correct: 0,
            },
          ],
        },
        {
          id: 1906,
          quiz_bank_id: 85,
          question_text: 'Medicaid is',
          points: 1,
          question_type: 'MCQ',
          options: [
            {
              id: 2082,
              question_id: 1906,
              option_text: 'Private insurance provided by employers',
              is_correct: 0,
            },
            {
              id: 2083,
              question_id: 1906,
              option_text:
                'The portion of Medicare used to pay for prescriptions',
              is_correct: 0,
            },
            {
              id: 2084,
              question_id: 1906,
              option_text:
                'Another term for the kind of care provided at a skilled nursing facility',
              is_correct: 0,
            },
            {
              id: 2085,
              question_id: 1906,
              option_text:
                'A medical assistance program partially funded by the state',
              is_correct: 1,
            },
          ],
        },
        {
          id: 1907,
          quiz_bank_id: 85,
          question_text:
            'Generally speaking, in a facility’s chain of command,the charge nurse reports directly to',
          points: 1,
          question_type: 'MCQ',
          options: [
            {
              id: 2086,
              question_id: 1907,
              option_text: 'The administrator',
              is_correct: 0,
            },
            {
              id: 2087,
              question_id: 1907,
              option_text: 'The resident’s spouse or family members',
              is_correct: 0,
            },
            {
              id: 2088,
              question_id: 1907,
              option_text: 'The occupational therapist',
              is_correct: 0,
            },
            {
              id: 2089,
              question_id: 1907,
              option_text: 'The nursing supervisor',
              is_correct: 1,
            },
          ],
        },
        {
          id: 1908,
          quiz_bank_id: 85,
          question_text: 'The term scope of practice refers to',
          points: 1,
          question_type: 'MCQ',
          options: [
            {
              id: 2090,
              question_id: 1908,
              option_text: 'The order in which an NA’s tasks are performed',
              is_correct: 0,
            },
            {
              id: 2091,
              question_id: 1908,
              option_text:
                'The tasks healthcare providers are legally allowed to do',
              is_correct: 1,
            },
            {
              id: 2092,
              question_id: 1908,
              option_text: 'All care given in a hospital setting',
              is_correct: 0,
            },
            {
              id: 2093,
              question_id: 1908,
              option_text:
                'The number of times a skill must be practiced before being performed on a resident',
              is_correct: 0,
            },
          ],
        },
        {
          id: 1909,
          quiz_bank_id: 85,
          question_text:
            'Which of the following is an example of anursing assistant acting in an unprofessionalmanner?',
          points: 1,
          question_type: 'MCQ',
          options: [
            {
              id: 2094,
              question_id: 1909,
              option_text:
                'The NA reports suspected family abuse of a resident to his supervisor.',
              is_correct: 0,
            },
            {
              id: 2095,
              question_id: 1909,
              option_text:
                'The NA calls in sick as soon as the NA begins to experience symptoms of illness.',
              is_correct: 0,
            },
            {
              id: 2096,
              question_id: 1909,
              option_text:
                'The NA answers a call light but then takes a personal phone call in front of the resident.',
              is_correct: 1,
            },
            {
              id: 2097,
              question_id: 1909,
              option_text:
                'The NA documents temperature incorrectly but then corrects his error properly on a resident’s chart.',
              is_correct: 0,
            },
          ],
        },
        {
          id: 1910,
          quiz_bank_id: 85,
          question_text:
            'Which of the following is true of a resident’srights regarding her personal possessions?',
          points: 1,
          question_type: 'MCQ',
          options: [
            {
              id: 2098,
              question_id: 1910,
              option_text:
                'Anything that a resident brings with her into a facility, including money, becomes the facility’s property.',
              is_correct: 0,
            },
            {
              id: 2099,
              question_id: 1910,
              option_text:
                'Because care facilities provide for all needs, residents may not bring personal possessions with them.',
              is_correct: 0,
            },
            {
              id: 2100,
              question_id: 1910,
              option_text:
                'A resident may bring her personal possessions with her, but she is solely responsible for her possessions.',
              is_correct: 0,
            },
            {
              id: 2101,
              question_id: 1910,
              option_text:
                'The resident has the right to expect that her personal possessions will not be taken or used without permission.',
              is_correct: 1,
            },
          ],
        },
        {
          id: 1911,
          quiz_bank_id: 85,
          question_text:
            'Which of the following is true of convertingfrom standard to military time?',
          points: 1,
          question_type: 'MCQ',
          options: [
            {
              id: 2102,
              question_id: 1911,
              option_text:
                'The NA must add 12 to the hour to convert to military time.',
              is_correct: 1,
            },
            {
              id: 2103,
              question_id: 1911,
              option_text:
                'The NA must add 12 to the minutes to convert to military time.',
              is_correct: 0,
            },
            {
              id: 2104,
              question_id: 1911,
              option_text:
                'The NA must add 10 to the hour to convert to military time.',
              is_correct: 0,
            },
            {
              id: 2105,
              question_id: 1911,
              option_text:
                'Converting to military time is only necessary at VA hospitals.',
              is_correct: 0,
            },
          ],
        },
        {
          id: 1912,
          quiz_bank_id: 85,
          question_text: 'Which of the following is true of incident reports?',
          points: 1,
          question_type: 'MCQ',
          options: [
            {
              id: 2106,
              question_id: 1912,
              option_text:
                'Incident reports should always contain a combination of facts, opinions, and eyewitness accounts.',
              is_correct: 0,
            },
            {
              id: 2107,
              question_id: 1912,
              option_text:
                'Incident reports should only be completed at the resident’s request because of privacy issues.',
              is_correct: 0,
            },
            {
              id: 2108,
              question_id: 1912,
              option_text:
                'Incident reports should only be completed by doctors after they have assessed the resident’s condition.',
              is_correct: 0,
            },
            {
              id: 2109,
              question_id: 1912,
              option_text:
                'Incident reports should contain the facts of the incident and the actions taken to give care.',
              is_correct: 1,
            },
          ],
        },
      ],
    },
  };
  return (
    <Provider>
      <SafeAreaView style={{ backgroundColor: '#fff', flex: 1 }}>
        <CustomStatus trans={true} isDark={true} color="#FFFFFF00" />
        <CustomHeader
          text={`${route.params.subjectName || " "} Syllabus Details`}
          customStyle={{ marginTop: -5, paddingVertical: 5 }}
        />
        <CustomSAView
          parentStyple={{
            flex: 1,
            backgroundColor: ColorCode.transarent,
          }}
          style={{
            flex: 1,
            width: 100 * width,
            backgroundColor: ColorCode.transarent,
            alignItems: 'center',
          }}>
          {isInitialLoading ? (
            <SyllabusDetailSkeleton />
          ) : (
            <Fragment>
              {/* Chapter Info Card */}
              {route.params.dataList[0] && (
                <View style={Styles.infoCard}>
                  <Text style={Styles.infoCardTitle}>{route.params.dataList[0].chapter_name}</Text>
                  <Text style={Styles.infoCardSubTitle}>
                    {route.params.dataList[0].main_topic || "Master the essential topics for this module."}
                  </Text>
                  <View style={Styles.infoMetaContainer}>
                    <View style={[Styles.infoMetaChip, { backgroundColor: '#EBF5FF' }]}>
                      <Feather name="calendar" size={width * 3.5} color="#007AFF" />
                      <Text style={[Styles.infoMetaText, { color: '#000' }]}>{`Week: ${route.params.dataList[0].week_range_start ?? 1}-${route.params.dataList[0].week_range_end ?? 3}`}</Text>
                    </View>
                    <View style={[Styles.infoMetaChip, { backgroundColor: '#FFF4EB' }]}>
                      <Feather name="clock" size={width * 3.5} color="#FF9500" />
                      <Text style={[Styles.infoMetaText, { color: '#000' }]}>{`${route.params.dataList[0].estimated_duration || 60} Hours`}</Text>
                    </View>
                    <View style={[Styles.infoMetaChip, { backgroundColor: '#F5EBFF' }]}>
                      <Image
                        source={require('../../assets/images/quizess.png')}
                        style={{ width: width * 4, height: width * 4, resizeMode: 'contain' }}
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

              <View style={{ flex: 1, width: '100%' }}>
                {/* <View
              style={{
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 2 * width,
              }}>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginVertical: 2 * width,
                }}>
                
              </View>
            </View> */}
                <FlatList
                  data={
                    activeTab === 'Lessons' ? (dataList[0]?.syllabus_lessions || []) :
                      activeTab === 'Quiz Assignments' ? (dataList[0]?.syllabus_quizs || []) :
                        activeTab === 'All Learnings' ? (dataList[0] ? [dataList[0]] : []) :
                          dataList
                  }
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
                          <Ionicons name="chevron-forward" size={width * 5} color="#CCC" />
                        </TouchableOpacity>
                      );
                    } else if (activeTab === 'Quiz Assignments') {
                      const isExpanded = expandedQuizId === item.id;
                      const attempts = [...(item.quiz_data?.attempt_history || [])].sort((a, b) => {
                        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
                        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
                        return timeB - timeA;
                      });
                      const totalAllowed = 3; // Static fallback or dynamic if available
                      const attemptsUsed = attempts.length;


                      return (
                        <View style={Styles.accordionCard}>
                          <TouchableOpacity
                            style={Styles.accordionHeader}
                            onPress={() => setExpandedQuizId(isExpanded ? null : item.id)}>
                            <View style={{ flex: 1 }}>
                              <Text style={Styles.lessonTitle}>{item.quiz_data?.title || 'Quiz Assignment'}</Text>
                              <Text style={[Styles.attemptsText, { color: attemptsUsed >= totalAllowed ? '#FF3B30' : '#FF9500' }]}>
                                {`${attemptsUsed} / ${totalAllowed} Attempts Used`}
                              </Text>
                            </View>
                            <Ionicons
                              name={isExpanded ? "chevron-up" : "chevron-down"}
                              size={width * 5}
                              color="#333"
                            />
                          </TouchableOpacity>

                          {isExpanded && (
                            <View style={Styles.expandedContent}>
                              <Text style={Styles.historyTitle}>Quiz Attempt History</Text>
                              {attempts.length > 0 ? (
                                attempts.map((attempt, index) => (
                                  <View key={index} style={Styles.attemptRow}>
                                    <View style={{ flex: 1 }}>
                                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <Text style={Styles.attemptLabel}>{`Attempt ${attempts.length - index}`}</Text>
                                        <TouchableOpacity
                                          onPress={() => viewResult(attempt, item)}
                                          style={Styles.resultBtn}>
                                          <Text style={Styles.resultBtnText}>Result</Text>
                                          <Ionicons name="chevron-forward" size={width * 3} color="#007AFF" />
                                        </TouchableOpacity>
                                      </View>
                                      <Text style={Styles.attemptDate}>
                                        {new Date(attempt.created_at).toLocaleDateString() + ' • ' + new Date(attempt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end', marginLeft: width * 4 }}>
                                      <View style={[Styles.statusBadge, { backgroundColor: attempt.percentage >= 70 ? '#EFFFF6' : '#FFECEC' }]}>
                                        <Text style={[Styles.statusBadgeText, { color: attempt.percentage >= 70 ? '#008A3D' : '#FF3B30' }]}>
                                          {attempt.percentage >= 70 ? 'Passed' : 'Failed'}
                                        </Text>
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
                        <View style={{ width: '92%', alignSelf: 'center' }}>
                          {/* Learning Activities Section */}
                          <View style={Styles.learningCard}>
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
                          <View style={[Styles.learningCard, { marginTop: width * 4 }]}>
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
        </CustomSAView>
        <Modal animationType="fade" transparent={true} visible={modalVisible}>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.7)',
            }}>
            <View
              style={{
                width: width * 90,
                height: height * 38,
                backgroundColor: '#ffffff',
                borderRadius: width * 3,
                paddingHorizontal: width * 3,
                paddingVertical: width * 3,
              }}>
              <Text
                style={{
                  textAlign: 'center',
                  color: '#000000',
                  fontSize: width * 3.5,
                  marginBottom: width * 4,
                }}>
                Documents Links
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisibleIndex(-1);
                  setModalVisible(!modalVisible);
                }}
                style={{
                  width: width * 8,
                  height: width * 8,
                  // backgroundColor: 'blue',
                  position: 'absolute',
                  top: width * 0.1,
                  right: width * 0.1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Entypo name="cross" size={width * 5} color="#000000" />
              </TouchableOpacity>
              <ScrollView
                style={{
                  height: height * 30,
                  // backgroundColor: '#157',
                }}>
                {modalVisibleIndex != -1 &&
                  dataList[modalVisibleIndex].google_doc_url.map(
                    (item1, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => {
                          if (item1.submitted == 0) {
                            setSelectedGoogleAssgn(item1);
                            setMarkDonePopup(true);
                            setModalVisible(!modalVisible);
                            // handleOpenUrl(item1.google_doc_url);
                          } else {
                            ToastUtility.showToast('Already Completed');
                          }
                        }}
                        style={{
                          backgroundColor:
                            item1.submitted == 1 ? '#16763E' : '#D1FFE4',
                          paddingHorizontal: 3 * width,
                          paddingVertical: 3 * width,
                          borderRadius: 2 * width,
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginVertical: width * 2,
                        }}>
                        <Text
                          style={{
                            fontFamily: Fonts.Medium,
                            fontSize: 3.2 * width,
                            color: item1.submitted == 1 ? '#FFFFFF' : '#666666',
                            marginHorizontal: 1 * width,
                          }}>
                          {item1.title ? item1.title : 'Doc'}
                        </Text>
                        <Ionicons
                          name={
                            item1.submitted == 1
                              ? 'checkmark-done'
                              : 'arrow-forward-outline'
                          }
                          size={5 * width}
                          color={item1.submitted == 1 ? '#D1FFE4' : '#16763E'}
                        />
                      </TouchableOpacity>
                    ),
                  )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="fade"
          transparent={true}
          visible={markDonePopup}
          onRequestClose={() => {
            setMarkDonePopup(false);
          }}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.7)',
            }}>
            {selectedGoogleAssgn && (
              <View
                style={{
                  width: width * 80,
                  // height: height * 38,
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  borderRadius: width * 3,
                  paddingHorizontal: width * 3,
                  paddingVertical: width * 3,
                }}>
                <Text
                  style={{
                    textAlign: 'center',
                    color: '#000000',
                    fontSize: width * 3.5,
                    marginBottom: width * 4,
                  }}>
                  Select Action
                </Text>

                <View style={{ flexDirection: 'row' }}>
                  <TouchableOpacity
                    onPress={() => {
                      setMarkDonePopup(false);
                      setModalVisible(false);
                      markDoneGoogleAssignment(selectedGoogleAssgn);

                      // handleOpenUrl(item1.google_doc_url);
                    }}
                    style={{
                      flex: 1,
                      height: 5 * height,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#16763E',
                      borderRadius: 2 * width,
                      marginEnd: 2 * width,
                    }}>
                    <Text
                      style={{
                        textAlign: 'center',
                        color: '#FFFFFF',
                        fontSize: width * 3.5,
                      }}>
                      Mark As Done
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setMarkDonePopup(false);
                      handleOpenUrl(selectedGoogleAssgn.google_doc_url);
                      setSelectedGoogleAssgn(null);
                    }}
                    style={{
                      flex: 1,
                      height: 5 * height,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#D1FFE4',
                      borderRadius: 2 * width,
                      marginStart: 2 * width,
                    }}>
                    <Text
                      style={{
                        textAlign: 'center',
                        color: '#000000',
                        fontSize: width * 3.5,
                      }}>
                      Open Assignment
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setMarkDonePopup(false);
                  }}
                  style={{
                    width: 20 * width,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 2 * width,
                    marginTop: 4 * width,
                  }}>
                  <Text
                    style={{
                      textAlign: 'center',
                      color: '#FF0012',
                      fontSize: width * 3.5,
                    }}>
                    Close
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Modal>
      </SafeAreaView>
      <CustomProgress show={showProgress && !isInitialLoading} />
    </Provider>
  );
};

const Styles = StyleSheet.create({
  // New Styles
  infoCard: {
    width: '92%',
    backgroundColor: '#fff',
    borderRadius: width * 3,
    padding: width * 4,
    marginTop: height * 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  infoCardTitle: {
    fontSize: width * 4.8,
    fontFamily: Fonts.SemiBold,
    color: '#000',
  },
  infoCardSubTitle: {
    fontSize: width * 3.4,
    fontFamily: Fonts.Regular,
    color: '#666',
    marginTop: width * 1,
    lineHeight: width * 4.5,
  },
  infoMetaContainer: {
    flexDirection: 'row',
    marginTop: width * 4,
    gap: width * 2,
    flexWrap: 'wrap',
  },
  infoMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 3,
    paddingVertical: width * 1.5,
    borderRadius: width * 2,
    gap: width * 1.5,
  },
  infoMetaText: {
    fontSize: width * 3.2,
    fontFamily: Fonts.Medium,
  },
  segmentedContainer: {
    flexDirection: 'row',
    width: '92%',
    padding: width * 1,
    marginTop: height * 2.5,
    marginBottom: height * 1.5,
    alignSelf: 'center',
    gap: width * 2,
  },
  segmentedTab: {
    flex: 1,
    paddingVertical: width * 2.5,
    alignItems: 'center',
    borderRadius: width * 2,
    backgroundColor: '#F2F2F2',
  },
  activeSegmentedTab: {
    backgroundColor: '#007AFF', // ColorCode.primary usually
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
    width: '92%',
    alignSelf: 'center',
    padding: width * 4,
    borderRadius: width * 3,
    marginBottom: width * 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  lessonTitle: {
    fontSize: width * 3.8,
    fontFamily: Fonts.SemiBold,
    color: '#000',
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
    width: '92%',
    alignSelf: 'center',
    borderRadius: width * 3,
    marginBottom: width * 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: width * 4,
  },
  attemptsText: {
    fontSize: width * 3.2,
    fontFamily: Fonts.Medium,
    marginTop: width * 0.5,
  },
  expandedContent: {
    paddingHorizontal: width * 4,
    paddingBottom: width * 4,
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
    paddingVertical: width * 3,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  resultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FF',
    paddingHorizontal: width * 2,
    paddingVertical: width * 0.8,
    borderRadius: width * 1.5,
  },
  resultBtnText: {
    fontSize: width * 2.8,
    fontFamily: Fonts.Bold,
    color: '#007AFF',
    marginRight: 2,
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
    paddingVertical: width * 3,
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
    padding: width * 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  learningHeaderTitle: {
    fontSize: width * 4,
    fontFamily: Fonts.SemiBold,
    color: '#333',
  },
  learningContent: {
    padding: width * 4,
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
  // Existing Styles
  circle: {
    width: 6 * height,
    height: 6 * height,
    borderRadius: 5 * height,
    backgroundColor: '#16763E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleText: {
    color: '#000000',
    fontSize: 4 * width,
    fontFamily: Fonts.Medium,
    marginStart: 2 * width,
  },
  headerText: {
    color: '#000000',
    fontSize: 4.4 * width,
    fontFamily: Fonts.SemiBold,
  },
});
export default SyllabusDetailScreen;
