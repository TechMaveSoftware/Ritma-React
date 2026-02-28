import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Provider } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomProgress from '../../../compenents/CustomProgress';
import CustomSAView from '../../../compenents/CustomSAView';
import HeaderWithBack from '../../../compenents/HeaderWithBack';
import height from '../../../Units/height';
import width from '../../../Units/width';
import Fonts from '../../../utility/Fonts';
import ColorCode from '../../../utility/ColorCode';
import ConstData from '../../../utility/ConstData';
import ApiMethod from '../../../api/ApiMethod';
import ToastUtility from '../../../utility/ToastUtility';

const AllQuiz = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [showProgress, setShowProgress] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [selectedTab, setSelectedTab] = useState('all'); // 'all' or 'completed'
  const [quizList, setQuizList] = useState([]);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    uploaded: 0,
    pending: 0,
  });

  // Get the ID from route params
  const { id, syllabusItem, quizData: initialQuizData } = route.params || {};

  console.log('AllQuiz Screen - Route params:', route.params);
  console.log('AllQuiz Screen - ID received:', id);

  useEffect(() => {
    console.log('AllQuiz Screen - useEffect triggered, params:', route.params);

    if (initialQuizData && initialQuizData.questions) {
      console.log('AllQuiz Screen - Populating from initial quiz data');
      hydrateFromQuiz(initialQuizData);
      return;
    } else if (id) {
      fetchQuizData();
    } else {
      setQuizList([]);
      setStats({
        totalAssignments: 0,
        uploaded: 0,
        pending: 0,
      });
    }
  }, [id, initialQuizData]);

  const hydrateFromQuiz = quizPayload => {
    const normalizedQuiz =
      quizPayload?.quizes?.questions && Array.isArray(quizPayload.quizes.questions)
        ? quizPayload.quizes
        : quizPayload;

    if (!normalizedQuiz || !Array.isArray(normalizedQuiz.questions)) {
      console.log('AllQuiz Screen - Quiz payload missing questions');
      setQuizList([]);
      setStats({
        totalAssignments: 0,
        uploaded: 0,
        pending: 0,
      });
      return;
    }

    setQuizData({ quizes: normalizedQuiz });

    const weekLabel =
      syllabusItem?.week_label ||
      (syllabusItem?.week ? `Week ${syllabusItem.week}` : 'Week 1');
    const dayLabel =
      syllabusItem?.day_label ||
      (syllabusItem?.day ? syllabusItem.day : 'Day 1');

    setQuizList([
      {
        id: normalizedQuiz.id,
        title: normalizedQuiz.title || quizPayload?.title || 'Quiz',
        week: weekLabel,
        day: dayLabel,
        questionCount: normalizedQuiz.questions.length,
        subject: normalizedQuiz.quiz_type || 'General',
        isCompleted: false,
        quizPayload: normalizedQuiz,
      },
    ]);

    const attemptCount =
      Array.isArray(quizPayload?.submit_status) && quizPayload.submit_status.length
        ? quizPayload.submit_status.length
        : Array.isArray(quizPayload?.attempt_history)
          ? quizPayload.attempt_history.length
          : 0;

    setStats({
      totalAssignments: 1,
      uploaded: attemptCount,
      pending: Math.max(0, 1 - attemptCount),
    });
  };

  const fetchQuizData = () => {
    setShowProgress(true);
    console.log('Fetching quiz data for ID:', id);

    ApiMethod.quizQuestions(
      `id=${id}`,
      pass => {
        setShowProgress(false);
        console.log('Quiz API Response:', JSON.stringify(pass));
        console.log('Quiz API Response Status:', pass.status);
        console.log('Quiz API Response Data:', pass.data);

        if (pass.status === 200) {
          setQuizData(pass);

          console.log('Processing quiz data from API response:', pass);

          if (pass.quizes && pass.quizes.questions && Array.isArray(pass.quizes.questions)) {
            hydrateFromQuiz(pass);
          } else {
            console.log('No valid quiz data found in API response');
            setQuizList([]);
            setStats({
              totalAssignments: 0,
              uploaded: 0,
              pending: 0,
            });
          }
        } else {
          console.log('API returned non-200 status');
          setQuizList([]);
          setStats({
            totalAssignments: 0,
            uploaded: 0,
            pending: 0,
          });
        }
      },
      fail => {
        setShowProgress(false);
        console.log('Quiz API Error:', fail);
        setQuizList([]);
        setStats({
          totalAssignments: 0,
          uploaded: 0,
          pending: 0,
        });
        ToastUtility.showToast('Error fetching quiz data');
      },
    );
  };

  const renderStatsCard = (value, label, color) => (
    <View style={[styles.statsCard, ConstData.ELEVATION_STYLE]}>
      <Text style={[styles.statsValue, { color }]}>{value}</Text>
      <Text style={styles.statsLabel}>{label}</Text>
    </View>
  );

  const renderQuizItem = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.quizCard, ConstData.ELEVATION_STYLE]}
      onPress={() => {
        // Create proper quiz data structure for OnlineQuizScreen
        const responseQuiz =
          item?.quizPayload ||
          quizData?.quizes ||
          initialQuizData ||
          {};
        if (responseQuiz?.id && responseQuiz?.questions) {
          const syllabusQuizEntry =
            (syllabusItem?.syllabus_quizs || []).find(
              q => q.quiz_bank_id === responseQuiz.id || q.id === id,
            ) || (syllabusItem?.syllabus_quizs || [])[0] || null;

          const derivedQuizBankId =
            syllabusQuizEntry?.quiz_bank_id ||
            responseQuiz?.quiz_bank_id ||
            responseQuiz?.id ||
            id;

          const stepQuizId =
            syllabusQuizEntry?.id || responseQuiz?.step_quiz_id || id;

          const mechanismId =
            syllabusQuizEntry?.mechanism_id ||
            syllabusItem?.mechanism_id ||
            responseQuiz?.mechanism_id ||
            1;

          const stepId =
            syllabusQuizEntry?.step_id ||
            syllabusItem?.step_id ||
            responseQuiz?.step_id ||
            1;

          const quizDataForNavigation = {
            id: responseQuiz.id,
            quiz: {
              id: responseQuiz.id,
              quiz_type: responseQuiz.quiz_type,
              title: responseQuiz.title,
              questions: responseQuiz.questions,
            },
            quiz_bank_id: derivedQuizBankId,
          };

          console.log('Navigating with quiz data from quiz item:', quizDataForNavigation);
          navigation.navigate('OnlineQuiz', {
            data: quizDataForNavigation,
            totalAttempt: 0,
            post: {
              mechanism_id: mechanismId,
              step_id: stepId,
              step_quiz_id: stepQuizId,
              quiz_bank_id: derivedQuizBankId,
            },
          });
        } else {
          console.log('No valid quiz data available for navigation');
          ToastUtility.showToast('No quiz data available');
        }
      }}>
      <View style={styles.quizIcon}>
        <View style={styles.iconContainer}>
          <View style={[styles.bubble, { backgroundColor: '#4A90E2' }]}>
            <Text style={styles.bubbleText}>?</Text>
          </View>
          <View style={[styles.bubble, { backgroundColor: '#4A90E2' }]}>
            <Text style={styles.bubbleText}>?</Text>
          </View>
          <View style={[styles.bubble, { backgroundColor: '#FF6B35' }]}>
            <Text style={styles.bubbleText}>?</Text>
          </View>
        </View>
      </View>

      <View style={styles.quizContent}>
        <Text style={styles.quizTitle}>{item.title}</Text>
        <Text style={styles.quizDetails}>
          {item.week}, {item.day}
        </Text>
        <Text style={styles.quizDetails}>
          | <Text style={styles.questionCount}>{item.questionCount} Questions</Text>
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color={ColorCode.primary} />
    </TouchableOpacity>
  );

  const filteredQuizList = selectedTab === 'all'
    ? quizList
    : quizList.filter(quiz => quiz.isCompleted);

  console.log('Current quizList:', quizList);
  console.log('Filtered quizList:', filteredQuizList);
  console.log('Selected tab:', selectedTab);

  return (
    <Provider>
      <StatusBar
        animated={true}
        translucent={true}
        backgroundColor="#FFFFFF00"
        barStyle={'dark-content'}
        showHideTransition={'fade'}
      />
      <SafeAreaView style={styles.container} edges={['top']}>
        <CustomSAView
          parentStyple={{ flex: 1, backgroundColor: ColorCode.transarent }}
          style={{ flex: 1, backgroundColor: ColorCode.transarent }}>

          <HeaderWithBack
            title="All Quiz"
            backgroundColor={ColorCode.white}
            textColor={ColorCode.black}
            onBackPress={() => navigation.goBack()}
          />

          <View style={styles.content}>
            {/* Statistics Cards */}
            <View style={styles.statsContainer}>
              {renderStatsCard(stats.totalAssignments, 'Total Assignments', '#0EBD5B')}
              {renderStatsCard(stats.uploaded, 'Uploaded', '#FF6B35')}
              {renderStatsCard(stats.pending, 'Pending', '#FF0000')}
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
                onPress={() => setSelectedTab('all')}>
                <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>
                  All Quiz's
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, selectedTab === 'completed' && styles.activeTab]}
                onPress={() => setSelectedTab('completed')}>
                <Text style={[styles.tabText, selectedTab === 'completed' && styles.activeTabText]}>
                  Completed Quiz's
                </Text>
              </TouchableOpacity>
            </View>

            {/* Quiz Section Header */}
            <Text style={styles.sectionTitle}>Quizzes</Text>

            {/* Quiz List */}
            {filteredQuizList.length > 0 ? (
              <FlatList
                data={filteredQuizList}
                renderItem={renderQuizItem}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.quizList, { paddingBottom: insets.bottom + (height * 2) }]}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No quizzes available</Text>
                <Text style={styles.emptySubText}>Quiz list is empty</Text>
              </View>
            )}


          </View>
        </CustomSAView>
      </SafeAreaView>
      <CustomProgress show={showProgress} />
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: width * 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: height * 2,
    marginBottom: height * 3,
  },
  statsCard: {
    flex: 1,
    backgroundColor: ColorCode.white,
    borderRadius: width * 2,
    padding: width * 3,
    marginHorizontal: width * 1,
    alignItems: 'center',
  },
  statsValue: {
    fontSize: width * 5,
    fontFamily: Fonts.Bold,
    marginBottom: width * 1,
  },
  statsLabel: {
    fontSize: width * 3.2,
    fontFamily: Fonts.Regular,
    color: ColorCode.black,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: ColorCode.white,
    borderRadius: width * 2,
    padding: width * 1,
    marginBottom: height * 2,
  },
  tab: {
    flex: 1,
    paddingVertical: width * 2,
    alignItems: 'center',
    borderRadius: width * 1.5,
  },
  activeTab: {
    backgroundColor: ColorCode.primary,
  },
  tabText: {
    fontSize: width * 3.6,
    fontFamily: Fonts.Medium,
    color: ColorCode.grey888,
  },
  activeTabText: {
    color: ColorCode.white,
  },
  sectionTitle: {
    fontSize: width * 4.2,
    fontFamily: Fonts.Bold,
    color: ColorCode.black,
    marginBottom: height * 2,
  },
  quizList: {
    paddingBottom: height * 2,
  },
  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ColorCode.white,
    borderRadius: width * 2,
    padding: width * 4,
    marginBottom: width * 3,
  },
  quizIcon: {
    width: width * 12,
    height: width * 12,
    backgroundColor: '#E8F4FD',
    borderRadius: width * 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: width * 3,
  },
  iconContainer: {
    flexDirection: 'row',
    gap: width * 0.8,
  },
  bubble: {
    width: width * 3.5,
    height: width * 3.5,
    borderRadius: width * 1.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleText: {
    color: ColorCode.white,
    fontSize: width * 2.5,
    fontFamily: Fonts.Bold,
  },
  quizContent: {
    flex: 1,
  },
  quizTitle: {
    fontSize: width * 4,
    fontFamily: Fonts.Bold,
    color: ColorCode.black,
    marginBottom: width * 1,
  },
  quizDetails: {
    fontSize: width * 3.2,
    fontFamily: Fonts.Regular,
    color: ColorCode.grey888,
  },
  questionCount: {
    color: '#0EBD5B',
    fontFamily: Fonts.Medium,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 4,
  },
  emptyText: {
    fontSize: width * 4,
    fontFamily: Fonts.Bold,
    color: ColorCode.black,
    marginBottom: width * 2,
  },
  emptySubText: {
    fontSize: width * 3.2,
    fontFamily: Fonts.Regular,
    color: ColorCode.grey888,
  },
});

export default AllQuiz;
