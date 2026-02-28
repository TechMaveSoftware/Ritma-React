

// Using submitted_date from API when available, fallback to created_at for both assigned and submitted dates 

import React, { Fragment, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Linking,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Modal, Provider } from 'react-native-paper';
import CustomStatus from '../../../compenents/CustomStatus';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ImageView from '../../../compenents/ImageView';
import { Dimensions } from 'react-native';
// import width from '../../../Units/width';
import Fonts from '../../../utility/Fonts';
// import height from '../../../Units/height';

const screenWidth = Dimensions.get('window').width;
const width = screenWidth > 420 ? 420 / 100 : screenWidth / 100;
const height = Dimensions.get('window').height / 100;
import ApiMethod from '../../../api/ApiMethod';
import CustomProgress from '../../../compenents/CustomProgress';
import moment from 'moment';
import Entypo from 'react-native-vector-icons/Entypo';
import Feather from 'react-native-vector-icons/Feather';
import GradePopup from '../../../compenents/GradePopupTablet';
import ToastUtility from '../../../utility/ToastUtility';
import StorageUtility from '../../../utility/StorageUtility';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import ColorCode from '../../../utility/ColorCode';
import ConstData from '../../../utility/ConstData';
import AssignmentSkeleton from '../../../compenents/AssignmentSkeleton';
import LinearGradient from 'react-native-linear-gradient';

const AssignmentTabScreenTablet = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [chapterList, setChapterList] = useState([]);
  const [googleGradeList, setGoogleGradeList] = useState([]);
  const [attemptList, setAttemptList] = useState([]);
  const [quizData, setQuizData] = useState([]);
  const [assignmentData, setAssignmentData] = useState([]);
  const [selectedTab, setSelectedTab11] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [showGrades, setShowGrades] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      getUserDetail();
    }, []),
  );

  useEffect(() => {
    fetch(selectedTab);
  }, [selectedTab]);

  const fetch = selectedTab => {
    if (selectedTab == 3) {
      apiOnlineCall();
    } else if (selectedTab == 1) {
      apiOnlineCall(); // Use the same API call to get assignment data
    } else {
      apiCall();
    }
  };

  const getUserDetail = async () => {
    var uu = await StorageUtility.getUser();
    console.log(uu);
    setUser(uu);
    setSelectedTab11(3);
    fetch(3);
  };

  const apiCall = () => {
    setShowProgress(true);
    ApiMethod.myAssignments(
      pass => {
        setShowProgress(false);
        console.log('pass@@@@@@@@@@@@@@@@@@', pass.data);
        if (pass.status == 200) {
          setChapterList(pass.data);
          setIsInitialLoading(false);
        } else {
          setChapterList([]);
        }
      },
      fail => {
        setShowProgress(false);
        setChapterList([]);
        setIsInitialLoading(false);
      },
    );
  };

  const apiGoogleCall = () => {
    setShowProgress(true);
    ApiMethod.gradeData(
      pass => {
        setShowProgress(false);
        console.log('pass@@@@@@@@@@@@@@', JSON.stringify(pass.data));
        if (pass.status == 200) {
          setGoogleGradeList(pass.data.google);
          setIsInitialLoading(false);
        } else {
          setGoogleGradeList([]);
        }
      },
      fail => {
        setShowProgress(false);
        setGoogleGradeList([]);
        setIsInitialLoading(false);
      },
    );
  };

  const apiOnlineCall = () => {
    setShowProgress(true);
    console.log('Calling gradeData API...');
    ApiMethod.gradeData(
      pass => {
        if (pass.status == 200) {
          setAttemptList(pass.data);
          // Set quiz and assignment data from the API response
          if (pass.data && pass.data.quiz) {
            console.log('Quiz data found:', pass.data.quiz);

            // Deduplicate quiz attempts by quiz_name, keeping only the highest percentage
            const highestAttemptsMap = new Map();
            pass.data.quiz.forEach(item => {
              const quizName = item.quiz_name || 'Unnamed Quiz';
              const currentScore = parseFloat(item.percentage) || 0;
              const existingItem = highestAttemptsMap.get(quizName);

              if (!existingItem || currentScore > (parseFloat(existingItem.percentage) || 0)) {
                highestAttemptsMap.set(quizName, item);
              }
            });

            const deduplicatedQuizzes = Array.from(highestAttemptsMap.values());
            console.log('Deduplicated Quiz data (Highest Attempts):', deduplicatedQuizzes);
            setQuizData(deduplicatedQuizzes);
          } else {
            console.log('No quiz data in response');
            setQuizData([]);
          }

          if (pass.data && pass.data.assignment) {
            console.log('Assignment data found:', pass.data.assignment);
            // Log each assignment item to check for assignment_id
            pass.data.assignment.forEach((item, index) => {
              console.log(`Assignment ${index} - id:`, item.id, 'assignment_id:', item.assignment_id);
            });
            setAssignmentData(pass.data.assignment);
          } else {
            console.log('No assignment data in response');
            setAssignmentData([]);
          }
          setShowProgress(false);
          setIsInitialLoading(false);
        } else {
          console.log('API returned non-200 status');
          setAttemptList([]);
          setQuizData([]);
          setAssignmentData([]);
          setShowProgress(false);
          setIsInitialLoading(false);
        }
      },
      fail => {
        setShowProgress(false);
        console.log('API call failed:', fail);
        setAttemptList([]);
        setQuizData([]);
        setAssignmentData([]);
        setIsInitialLoading(false);
      },
    );
  };



  // Helper function to format quiz data for display
  const formatQuizData = (quizItem) => {
    // Use submitted_date from API if available, otherwise fallback to created_at
    const submittedDate = quizItem.submitted_date ||
      quizItem.submitted_at ||
      quizItem.created_at;

    // Use assigned_date from API if available, otherwise fallback to created_at
    const assignedDate = quizItem.assigned_date ||
      quizItem.assigned_at ||
      quizItem.created_at;

    return {
      quiz_name: quizItem.quiz_name,
      correct_answers_count: quizItem.correct_answers_count,
      total_questions: quizItem.total_questions,
      percentage: quizItem.percentage,
      assigned_date: moment(assignedDate).format('YYYY-MM-DD'),
      submitted_date: moment(submittedDate).format('YYYY-MM-DD'),
      grade: ConstData.getGradeValue(quizItem.percentage),
      grade_percent: quizItem.percentage,
      total_points: quizItem.total_points,
      created_at: quizItem.created_at,
      attempt_id: quizItem.attempt_id || quizItem.id,
    };
  };

  // Helper function to format assignment data for display
  const formatAssignmentData = (assignmentItem) => {
    // Get assignment name from syllabus.chapter_name or fallback
    const assignmentName = assignmentItem.assignment_title ||
      assignmentItem.syllabus?.chapter_name ||
      assignmentItem.assignment_name ||
      'Assignment';

    // If grade is already provided as a string (e.g., "A"), use it directly
    // Otherwise calculate from percentage
    let gradeValue = assignmentItem.grade;
    let gradePercent = assignmentItem.percentage || 0;

    // If grade is provided but not percentage, estimate percentage based on grade
    if (gradeValue && !gradePercent) {
      const gradeMap = { 'A+': 95, 'A': 85, 'B': 75, 'C': 65, 'D': 55, 'F': 45 };
      gradePercent = gradeMap[gradeValue] || 0;
    } else if (gradeValue && gradePercent) {
      // Both exist, use provided grade
      gradeValue = assignmentItem.grade;
    } else if (!gradeValue && gradePercent) {
      // Only percentage exists, calculate grade
      gradeValue = ConstData.getGradeValue(gradePercent);
    } else {
      // Neither exists, default to F
      gradeValue = 'F';
      gradePercent = 0;
    }

    // Use submitted_date from API if available, otherwise fallback to created_at
    const submittedDate = assignmentItem.submitted_date ||
      assignmentItem.submitted_at ||
      assignmentItem.created_at;

    // Use assigned_date from API if available, otherwise fallback to created_at
    const assignedDate = assignmentItem.assigned_date ||
      assignmentItem.assigned_at ||
      assignmentItem.created_at;

    // Extract assignment_id - check multiple possible locations
    const assignmentId = assignmentItem.assignment_id ||
      assignmentItem.syllabus?.assignment_id ||
      null;

    console.log('formatAssignmentData - assignmentItem:', assignmentItem);
    console.log('formatAssignmentData - extracted assignment_id:', assignmentId);

    return {
      quiz_name: assignmentName,
      correct_answers_count: assignmentItem.correct_answers_count || 0,
      total_questions: assignmentItem.total_questions || 0,
      percentage: gradePercent,
      assigned_date: moment(assignedDate).format('YYYY-MM-DD'),
      submitted_date: moment(submittedDate).format('YYYY-MM-DD'),
      grade: gradeValue,
      grade_percent: gradePercent,
      total_points: assignmentItem.total_points || '0',
      created_at: assignmentItem.created_at,
      attempt_id: assignmentItem.attempt_id || assignmentItem.id || null,
      assignment_id: assignmentId,
      file: assignmentItem.file || assignmentItem.assignment_file || null,
    };
  };

  const [uploadedDocs, setUploadedDocs] = useState([]);

  const getUploadedAssignment = (assignmentId) => {
    setShowProgress(true);
    // API expects parameter name 'id' but we pass assignment_id value (not the item.id)
    console.log('Assignment ID for uploaded docs (assignment_id value):', assignmentId);
    ApiMethod.uploadedDocs(
      `id=${assignmentId}`,
      pass => {
        setShowProgress(false);
        console.log('===getting uploaded docs===', pass.base_url);
        if (pass.status == 200) {
          console.log('===getting uploaded docs', pass.data[0]);
          setUploadedDocs(pass.data);
          navigation.navigate('viewUploadedDocs', {
            baseUrl: pass.base_url,
            uploadedDocs: pass.data,
          });
        } else {
          setUploadedDocs([]);
          setShowProgress(false);
        }
      },
      async fail => {
        console.log(fail);
        setShowProgress(false);
        setUploadedDocs([]);

        if (fail.status == 404 && fail.message.includes('User not found')) {
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
  };

  // Mock data for fallback (keeping for reference)
  const DataList = [
    {
      quiz_name: 'Math Quiz - Algebra Basics',
      correct_answers_count: 8,
      total_questions: 10,
      percentage: 80,
      assigned_date: '2025-01-27',
      submitted_date: '2025-04-27',
      grade: 'A',
      grade_percent: 80,
    },
    {
      quiz_name: 'Science Quiz - Physics Fundamentals',
      correct_answers_count: 6,
      total_questions: 10,
      percentage: 60,
      assigned_date: '2025-02-15',
      submitted_date: '2025-05-10',
      grade: 'B',
      grade_percent: 60,
    },
    {
      quiz_name: 'History Quiz - World War II',
      correct_answers_count: 9,
      total_questions: 10,
      percentage: 90,
      assigned_date: '2025-03-05',
      submitted_date: '2025-05-20',
      grade: 'A',
      grade_percent: 90,
    },
    {
      quiz_name: 'English Grammar Quiz',
      correct_answers_count: 7,
      total_questions: 10,
      percentage: 70,
      assigned_date: '2025-01-10',
      submitted_date: '2025-04-15',
      grade: 'B',
      grade_percent: 70,
    },
    {
      quiz_name: 'Computer Basics Quiz',
      correct_answers_count: 10,
      total_questions: 10,
      percentage: 100,
      assigned_date: '2025-02-20',
      submitted_date: '2025-05-05',
      grade: 'A+',
      grade_percent: 100,
    },
  ];

  const handleOpenUrl = async url => {
    const encodedUrl = encodeURI(url);
    console.log(`Opening URL: ${encodedUrl}`);
    try {
      await Linking.openURL(encodedUrl);
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  // Get the appropriate data based on selected tab
  const getCurrentData = () => {
    if (selectedTab == 3) {
      return quizData.map(formatQuizData);
    } else if (selectedTab == 1) {
      return assignmentData.map(formatAssignmentData);
    }
    return [];
  };

  return (
    <Provider>
      <CustomStatus trans={true} isDark={true} color="#FFFFFF" />
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flex: 1 }}>
            <View
              style={{
                width: '100%',
                height: 4.5 * height,
                backgroundColor: '#FFFFFF',
                paddingHorizontal: 6 * width,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: '#000000',
                  fontFamily: Fonts.SemiBold,
                  fontSize: 3.5 * width,
                }}>
                {'My Grades'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowGrades(true)}
                style={{
                  paddingHorizontal: 4 * width,
                  paddingVertical: 2 * width,
                }}>
                <Text
                  style={{
                    color: '#000000',
                    fontFamily: Fonts.Medium,
                    fontSize: 2.6 * width,
                    textDecorationLine: 'underline',
                  }}>
                  View Grading Table
                </Text>
              </TouchableOpacity>
            </View>
            <LinearGradient
              colors={['#EBF7F8', '#EAF4F6', '#CCF0F7', '#CECBEA']}
              style={{ flex: 1 }}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}>
              {user && (
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      width: '100%',
                      justifyContent: 'space-between',
                      flexDirection: 'row',
                      padding: width * 1.5,
                      backgroundColor: '#e8eafa',
                      width: '94%',
                      alignSelf: 'center',
                      borderRadius: height * 2,
                      gap: width * 4,
                      marginTop: width * 2,
                    }}>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor:
                          selectedTab == 3 ? ColorCode.primary : '#e8eafa',
                        paddingVertical: width * 2.6,
                        borderRadius: height * 1,
                      }}
                      onPress={() => {
                        setSelectedTab11(3);
                      }}>
                      <Text
                        style={{
                          color: selectedTab == 3 ? '#FFFFFF' : '#000000',
                          fontSize: 2.8 * width,
                          fontFamily: Fonts.Medium,
                        }}>
                        {'Quiz Grades'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: width * 1.6,
                        borderRadius: height * 1,
                        backgroundColor:
                          selectedTab == 1 ? ColorCode.primary : '#EAEBF9AD',
                      }}
                      onPress={() => {
                        setSelectedTab11(1);
                      }}>
                      <Text
                        style={{
                          color: selectedTab == 1 ? '#FFFFFF' : '#000000',
                          fontSize: 2.8 * width,
                          fontFamily: Fonts.Medium,
                        }}>
                        {'Assignment Grades'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {selectedTab == 3 ? (
                    <View
                      style={{
                        flex: 1,
                        width: '100%',
                        paddingVertical: 3 * width,
                      }}>
                      {isInitialLoading ? (
                        <AssignmentSkeleton />
                      ) : quizData.length > 0 ? (
                        <FlatList
                          data={quizData.map(formatQuizData)}
                          style={{ width: '100%', paddingHorizontal: 5 * width }}
                          contentContainerStyle={{ paddingBottom: height * 10 }}
                          renderItem={({ item, index }) => {
                            console.log('Rendering quiz item:', item);
                            return (
                              <View style={styles.card}>
                                <Text style={styles.title}>
                                  {item.quiz_name}
                                </Text>

                                <View style={styles.row}>
                                  <FontAwesome
                                    name="calendar"
                                    size={16}
                                    color="#555"
                                  />
                                  <Text style={styles.label}>
                                    {' '}
                                    Assigned On :
                                  </Text>
                                  <Text style={styles.date}>
                                    {moment(item.assigned_date).format(
                                      'MMM DD, YYYY',
                                    )}
                                  </Text>
                                </View>

                                <View style={styles.row}>
                                  <FontAwesome
                                    name="calendar"
                                    size={16}
                                    color="#555"
                                  />
                                  <Text style={styles.label}>
                                    {' '}
                                    Submitted On :
                                  </Text>
                                  <Text style={styles.date}>
                                    {moment(item.submitted_date).format(
                                      'MMM DD, YYYY',
                                    )}
                                  </Text>
                                </View>

                                <View style={styles.footer}>
                                  <TouchableOpacity
                                    style={[
                                      styles.viewButton,
                                      {
                                        borderWidth: 1,
                                        borderColor: '#34A770',
                                        backgroundColor: '#DCF3EB',
                                      },
                                    ]}>
                                    <Image
                                      source={require('../../../assets/images/doneIcon.png')}
                                      style={{
                                        width: width * 3.5,
                                        height: height * 3.5,
                                        resizeMode: 'contain',
                                      }}
                                    />
                                    <Text style={styles.viewText}>
                                      {' '}
                                      Grade {item.grade}({item.grade_percent})%
                                    </Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    onPress={() =>
                                      navigation.navigate('CompletedScreenTablet', {
                                        attempt_id: item.attempt_id,
                                        quiz_name: item.quiz_name,
                                      })
                                    }
                                    style={[
                                      styles.viewButton,
                                      {
                                        paddingVertical: width * 1.5,
                                        gap: width * 2,
                                      },
                                    ]}>
                                    <Text
                                      style={[
                                        styles.viewText,
                                        { color: '#000' },
                                      ]}>
                                      {' '}
                                      View
                                    </Text>
                                    <FontAwesome
                                      name="eye"
                                      size={18}
                                      color="#000"
                                    />
                                  </TouchableOpacity>
                                </View>
                              </View>
                            );
                          }}
                        />
                      ) : (
                        <View style={styles.courseRoundShape}>
                          <Text
                            style={{
                              color: ColorCode.primary,
                              fontSize: 4 * width,
                              fontFamily: Fonts.Medium,
                              marginTop: 4 * height,
                            }}>{`No Quiz Data Found (${quizData.length} items)`}</Text>
                        </View>
                      )}
                    </View>
                  ) : selectedTab == 1 ? (
                    <View
                      style={{
                        flex: 1,
                        width: '100%',
                        paddingVertical: 3 * width,
                      }}>
                      {isInitialLoading ? (
                        <AssignmentSkeleton />
                      ) : assignmentData.length > 0 ? (
                        <FlatList
                          data={assignmentData.map(formatAssignmentData)}
                          style={{ width: '100%', paddingHorizontal: 5 * width }}
                          contentContainerStyle={{ paddingBottom: height * 10 }}
                          renderItem={({ item, index }) => {
                            console.log('Rendering assignment item:', item);
                            return (
                              <View style={styles.card}>
                                <Text style={styles.title}>
                                  {item.quiz_name}
                                </Text>

                                <View style={styles.row}>
                                  <FontAwesome
                                    name="calendar"
                                    size={16}
                                    color="#555"
                                  />
                                  <Text style={styles.label}>
                                    {' '}
                                    Assigned On :
                                  </Text>
                                  <Text style={styles.date}>
                                    {moment(item.assigned_date).format(
                                      'MMM DD, YYYY',
                                    )}
                                  </Text>
                                </View>

                                <View style={styles.row}>
                                  <FontAwesome
                                    name="calendar"
                                    size={16}
                                    color="#555"
                                  />
                                  <Text style={styles.label}>
                                    {' '}
                                    Submitted On :
                                  </Text>
                                  <Text style={styles.date}>
                                    {moment(item.submitted_date).format(
                                      'MMM DD, YYYY',
                                    )}
                                  </Text>
                                </View>

                                <View style={styles.footer}>
                                  {item.file && (
                                    <TouchableOpacity
                                      style={[
                                        styles.viewButton,
                                        {
                                          borderWidth: 1,
                                          borderColor: '#34A770',
                                          backgroundColor: '#DCF3EB',
                                          marginRight: 2 * width,
                                        },
                                      ]}
                                      onPress={() => Linking.openURL(item.file)}>
                                      <Feather name="download" size={3.5 * width} color="#00471A" />
                                    </TouchableOpacity>
                                  )}
                                  <TouchableOpacity
                                    style={[
                                      styles.viewButton,
                                      {
                                        borderWidth: 1,
                                        borderColor: '#34A770',
                                        backgroundColor: '#DCF3EB',
                                      },
                                    ]}>
                                    <Image
                                      source={require('../../../assets/images/doneIcon.png')}
                                      style={{
                                        width: width * 3.5,
                                        height: height * 3.5,
                                        resizeMode: 'contain',
                                      }}
                                    />
                                    <Text style={styles.viewText}>
                                      {' '}
                                      Grade {item.grade}
                                    </Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    onPress={() => {
                                      // Use assignment_id from my-syllabus-new API (not id)
                                      const assignmentIdToUse = item.assignment_id;
                                      console.log('Assignment ID for "asd test":', assignmentIdToUse);
                                      console.log('Full assignment item:', item);
                                      console.log('Item id (should NOT use this):', item.id);
                                      console.log('Item assignment_id (should use this):', item.assignment_id);
                                      if (!assignmentIdToUse) {
                                        ToastUtility.showToast('Assignment ID not found');
                                        return;
                                      }
                                      navigation.navigate('AsignmentUpload', {
                                        assignmentId: assignmentIdToUse,
                                        assignedDate: item.assigned_date,
                                        submittedDate: item.submitted_date,
                                      });
                                    }}
                                    style={[
                                      styles.viewButton,
                                      {
                                        paddingVertical: width * 1.5,
                                        gap: width * 2,
                                      },
                                    ]}>
                                    <Text
                                      style={[
                                        styles.viewText,
                                        { color: '#000' },
                                      ]}>
                                      {' '}
                                      View
                                    </Text>
                                    <FontAwesome
                                      name="eye"
                                      size={18}
                                      color="#000"
                                    />
                                  </TouchableOpacity>
                                </View>
                              </View>
                            );
                          }}
                        />
                      ) : (
                        <View style={styles.courseRoundShape}>
                          <Text
                            style={{
                              color: ColorCode.primary,
                              fontSize: 4 * width,
                              fontFamily: Fonts.Medium,
                              marginTop: 4 * height,
                            }}>{`No Assignment Data Found (${assignmentData.length} items)`}</Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <View
                      style={{
                        flex: 1,
                        width: '100%',
                        paddingVertical: 3 * width,
                      }}>
                      {getCurrentData().length != 0 ? (
                        <FlatList
                          data={getCurrentData()}
                          style={{ width: '100%', paddingHorizontal: 5 * width }}
                          contentContainerStyle={{ paddingBottom: height * 10 }}
                          renderItem={({ item, index }) => {
                            return (
                              <View
                                key={index}
                                style={{
                                  width: '100%',
                                  marginVertical: 1 * width,
                                }}>
                                <View
                                  style={{
                                    paddingVertical: 2 * width,
                                    paddingHorizontal: 4 * width,
                                    borderTopWidth: 1,
                                    borderLeftWidth: 1,
                                    borderRightWidth: 1,
                                    borderColor: '#E3E3E3',
                                    borderTopEndRadius: 2 * width,
                                    borderTopStartRadius: 2 * width,
                                  }}>
                                  <Text style={styles.headerText1}>
                                    {item.quiz_name}
                                  </Text>
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                    }}>
                                    <View style={{ flex: 1 }}>
                                      <Text style={styles.weekText}>
                                        {'Assigned On'}
                                      </Text>
                                      <Text style={styles.weekText}>
                                        {'Submitted On'}
                                      </Text>
                                    </View>

                                    <View
                                      style={{ flex: 1, alignItems: 'flex-end' }}>
                                      <Text style={styles.weekText1}>
                                        {moment(item.assigned_date).format(
                                          'MMM DD',
                                        )}
                                      </Text>
                                      <Text style={styles.weekText1}>
                                        {moment(item.submitted_date).format(
                                          'MMM DD',
                                        )}
                                      </Text>
                                    </View>
                                  </View>
                                </View>

                                <View
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                  }}>
                                  <View
                                    style={{
                                      width: '68%',
                                    }}>
                                    <View
                                      style={{
                                        width: '100%',
                                        height: 3 * height,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        backgroundColor: item.grade
                                          ? '#008A3D'
                                          : '#c0c0c0',
                                        borderBottomEndRadius: 2 * width,
                                        borderBottomStartRadius: 2 * width,
                                        paddingHorizontal: 4 * width,
                                      }}>
                                      <Text style={styles.gradeText}>
                                        {'Grade'}
                                      </Text>
                                      <Text
                                        style={
                                          item.grade
                                            ? styles.gradeText1
                                            : styles.gradeText2
                                        }>
                                        {item.grade
                                          ? `${item.grade} (${item.grade_percent}%)`
                                          : `-`}
                                      </Text>
                                    </View>
                                  </View>

                                  <View
                                    style={{
                                      width: '30%',
                                      marginStart: 1,
                                    }}>
                                    <TouchableOpacity
                                      onPress={() => { }}
                                      style={{
                                        width: '100%',
                                        height: 3 * height,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        backgroundColor: '#008A3D',
                                        borderBottomStartRadius: 2 * width,
                                        borderBottomEndRadius: 2 * width,
                                        paddingHorizontal: 4 * width,
                                      }}>
                                      <Text style={{ color: '#ffffff' }}>
                                        View
                                      </Text>
                                      <Ionicons
                                        name="arrow-forward-outline"
                                        size={5 * width}
                                        color="#ffffff"
                                      />
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              </View>
                            );
                          }}
                        />
                      ) : (
                        <View style={styles.courseRoundShape}>
                          <Text
                            style={{
                              color: '#008A3D',
                              fontSize: 4 * width,
                              fontFamily: Fonts.Medium,
                              marginTop: 4 * height,
                            }}>{`No Data Found`}</Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}
            </LinearGradient>
          </View>
        </SafeAreaView>
      </View>

      <GradePopup
        show={showGrades}
        setShowGrades={b => setShowGrades(b)}
        onDismiss={() => {
          setShowGrades(false);
        }}
      />
      <CustomProgress show={showProgress && !isInitialLoading} />
    </Provider>
  );
};

const styles = StyleSheet.create({
  headerText: {
    color: '#000000',
    fontSize: 3.5 * width,
    fontFamily: Fonts.SemiBold,
    // marginTop: 2 * width,
  },

  headerText1: {
    color: '#000000',
    fontSize: 4 * width,
    fontFamily: Fonts.SemiBold,
    // marginTop: 2 * width,
  },
  weekText: {
    color: '#969696',
    fontSize: 3.4 * width,
    fontFamily: Fonts.Regular,
    marginTop: 1 * width,
  },
  gradeText: {
    color: '#FFFFFF',
    fontSize: 3.4 * width,
    fontFamily: Fonts.Regular,
    // marginTop: 1 * width,
  },
  gradeText1: {
    color: '#FFFFFF',
    fontSize: 3.4 * width,
    fontFamily: Fonts.Medium,
    // marginTop: 1 * width,
  },
  gradeText2: {
    color: '#969696',
    fontSize: 3.4 * width,
    fontFamily: Fonts.Medium,
    // marginTop: 1 * width,
  },
  weekText1: {
    color: '#000000',
    fontSize: 3.4 * width,
    fontFamily: Fonts.Regular,
    marginTop: 1 * width,
  },
  courseRoundShape: {
    width: '100%',
    height: '100%',
    // flex: 1,
    // height: 9 * height,
    marginTop: 2 * width,

    borderRadius: 3 * width,
    alignItems: 'center',
    // justifyContent: 'center',
    // flexDirection: 'row',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: width * 3.5,
    fontWeight: 'bold',
    marginBottom: width * 2,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: width * 2,
  },
  label: {
    fontSize: width * 3,
    color: '#555',
    marginLeft: width * 2,
  },
  date: {
    fontSize: width * 3,
    color: '#333',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: height * 1,
    gap: width * 4,
  },
  gradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gradeText: {
    fontSize: width * 3.6,
    fontWeight: '800',
    color: ColorCode.primary,
  },
  gradeValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0,
    paddingHorizontal: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    flex: 1,
    justifyContent: 'center',
  },
  viewText: {
    fontSize: width * 2.8,
    color: 'green',
    textAlign: 'center',
    fontWeight: '800',
  },
  headerText1: {
    color: '#000000',
    fontSize: 3.2 * width,
    fontFamily: Fonts.Medium,
    marginBottom: 2 * height,
  },
  weekText: {
    color: '#000000',
    fontSize: 3 * width,
    fontFamily: Fonts.Regular,
    marginBottom: 1 * height,
  },
  weekText1: {
    color: '#000000',
    fontSize: 3 * width,
    fontFamily: Fonts.Medium,
    marginBottom: 1 * height,
  },
  gradeText: {
    color: '#FFFFFF',
    fontSize: 2.6 * width,
    fontFamily: Fonts.Regular,
  },
  gradeText1: {
    color: '#FFFFFF',
    fontSize: 2.6 * width,
    fontFamily: Fonts.Medium,
  },
  gradeText2: {
    color: '#000000',
    fontSize: 3 * width,
    fontFamily: Fonts.Medium,
  },
  courseRoundShape: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default AssignmentTabScreenTablet;
