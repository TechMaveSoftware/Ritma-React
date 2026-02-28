import React, {Fragment, useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Provider} from 'react-native-paper';
import CustomSAView from '../../../compenents/CustomSAView';
import CustomStatus from '../../../compenents/CustomStatus';
import HeaderWithBack from '../../../compenents/HeaderWithBack';
import width from '../../../Units/width';
import ColorCode from '../../../utility/ColorCode';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fonts from '../../../utility/Fonts';
import ConstData from '../../../utility/ConstData';
import ToastUtility from '../../../utility/ToastUtility';
import ApiMethod from '../../../api/ApiMethod';
import moment from 'moment';

const OnlineQuizAtemptsScreen = ({navigation, route}) => {
  const resolveAttemptId = attempt =>
    attempt?.attempt_id ||
    attempt?.id ||
    attempt?.quiz_result_id ||
    attempt?.quiz_attempt_id ||
    attempt?.quizAttemptId ||
    attempt?.quiz_attempts_id ||
    attempt?.quiz_attempt ||
    attempt?.attemptId;

  // Deduplicate attempts based on their unique ID
  const deduplicateAttempts = attempts => {
    if (!Array.isArray(attempts) || attempts.length === 0) {
      return [];
    }
    const seen = new Set();
    const unique = [];
    for (const attempt of attempts) {
      const id = resolveAttemptId(attempt);
      if (id !== null && id !== undefined && !seen.has(id)) {
        seen.add(id);
        unique.push(attempt);
      } else if (id === null || id === undefined) {
        // If no ID, include it but log a warning
        console.warn('Attempt without ID found:', attempt);
        unique.push(attempt);
      }
    }
    return unique;
  };

  const rawAttemptList = route.params.data || [];
  const deduplicatedAttempts = deduplicateAttempts(rawAttemptList);
  const [attemptList, setAttemptList] = useState(deduplicatedAttempts);
  const [quizData, setQuizData] = useState(route.params.quizData);
  const [questionCount, setQuestionCount] = useState(route.params.questionCount);
  const [totalMarks, settotalMarks] = useState(route.params.totalMarks);
  console.log('rawAttemptList', rawAttemptList);
  console.log('deduplicatedAttempts', deduplicatedAttempts);
  console.log('attemptList', attemptList);
  console.log('quizData', quizData);

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

  const calculatePercentage = attempt => {
    if (!attempt) {
      return null;
    }

    // First, try to get percentage directly from attempt data (check multiple possible fields)
    const direct =
      toNumber(attempt?.percentage) ??
      toNumber(attempt?.percent) ??
      toNumber(attempt?.result_percentage) ??
      toNumber(attempt?.score_percentage) ??
      toNumber(attempt?.quiz_result?.percentage) ??
      toNumber(attempt?.result?.percentage);

    if (direct !== null && direct >= 0) {
      return direct;
    }

    // Try to calculate from earned and max marks
    const earned =
      toNumber(attempt?.total_points) ??
      toNumber(attempt?.score) ??
      toNumber(attempt?.marks_obtained) ??
      toNumber(attempt?.quiz_result?.total_points) ??
      toNumber(attempt?.result?.total_points);

    const max =
      toNumber(attempt?.total_marks) ??
      toNumber(totalMarks) ??
      toNumber(quizData?.total_marks) ??
      toNumber(attempt?.max_points) ??
      toNumber(attempt?.quiz_result?.total_marks) ??
      toNumber(attempt?.result?.total_marks);

    // Only calculate if we have both earned and max, and max is greater than 0
    // Also check if earned is not null/undefined (0 is valid)
    if (earned !== null && max !== null && max > 0) {
      const calculated = (earned / max) * 100;
      // Only return if calculated value is valid (not NaN or Infinity)
      if (Number.isFinite(calculated) && calculated >= 0) {
        return calculated;
      }
    }

    return null;
  };

  const resolveGradeFromAttempt = attempt => {
    if (!attempt) {
      return '--';
    }

    // Try to get grade directly from attempt data (check multiple possible locations)
    // This is used as a fallback when percentage is not available
    const gradeHints = [
      attempt?.grade,
      attempt?.grade_text,
      attempt?.grade_letter,
      attempt?.overall_grade,
      attempt?.gradeValue,
      attempt?.grade_value,
      attempt?.final_grade,
      attempt?.quiz_result?.grade,
      attempt?.quiz_result?.grade_text,
      attempt?.quiz_result?.grade_letter,
      attempt?.result?.grade,
      attempt?.result?.grade_text,
      attempt?.result?.grade_letter,
    ];

    for (const hint of gradeHints) {
      if (typeof hint === 'number' && Number.isFinite(hint)) {
        const gradeFromNumber = ConstData.getGradeValue(hint);
        if (gradeFromNumber !== '--') {
          return gradeFromNumber;
        }
      } else if (typeof hint === 'string') {
        const trimmed = hint.trim();
        if (trimmed.length > 0 && trimmed !== '--') {
          return trimmed.toUpperCase();
        }
      }
    }

    return '--';
  };

  const formatAttemptDate = attempt => {
    if (!attempt) {
      return '';
    }

    // Try to get date from multiple possible fields
    const dateString =
      attempt?.created_at ||
      attempt?.updated_at ||
      attempt?.attempt_date ||
      attempt?.submitted_at ||
      attempt?.completed_at ||
      attempt?.quiz_result?.created_at ||
      attempt?.quiz_result?.updated_at ||
      attempt?.result?.created_at ||
      attempt?.result?.updated_at;

    if (!dateString) {
      return '';
    }

    // Format the date
    const dateMoment = moment(dateString);
    if (dateMoment.isValid()) {
      return dateMoment.format('MMM DD, YYYY');
    }
    return dateString;
  };

  useEffect(() => {
    // Get.Get();
  }, []);

  const handleViewResult = attempt => {
    const attemptId = resolveAttemptId(attempt);
    if (!attemptId) {
      ToastUtility.showToast('Attempt data not available.');
      return;
    }
    ApiMethod.quizResult(
      `attempt_id=${attemptId}`,
      pass => {
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
        ToastUtility.showToast('Failed to load quiz result.');
      },
    );
  };

  return (
    <Provider>
      <View
        style={{
          flex: 1,
          backgroundColor: ColorCode.white,
        }}>
        <CustomStatus trans={true} isDark={false} color="#FFFFFF00" />
        <View
          style={{
            width: '100%',
            height: '10%',
            position: 'absolute',
            backgroundColor: ColorCode.primary,
          }}
        />
        <CustomSAView
          parentStyple={{flex: 1, backgroundColor: ColorCode.transarent}}
          style={{flex: 1, backgroundColor: ColorCode.transarent}}>
          <HeaderWithBack
            title="Attempts History"
            backgroundColor={ColorCode.primary}
            textColor={ColorCode.white}
          />
          <View
            style={{
              flex: 1,
              paddingHorizontal: 3 * width,
              backgroundColor: ColorCode.white,
            }}>
            <View
              style={{
                backgroundColor: ColorCode.white,
              }}>
              <FlatList
                data={attemptList}
                inverted
                style={{flexDirection: 'column-reverse'}}
                keyExtractor={(item, index) =>
                  `${resolveAttemptId(item) ?? index.toString()}`
                }
                renderItem={({item, index}) => {
                  const attemptId = resolveAttemptId(item);
                  const percentage = calculatePercentage(item);
                  // Use same logic as Result screen: calculate grade from percentage first
                  const grade =
                    percentage !== null
                      ? ConstData.getGradeValue(percentage)
                      : resolveGradeFromAttempt(item);
                  const attemptDate = formatAttemptDate(item);
                  return (
                    <View
                      key={attemptId ?? index}
                      style={{
                        width: '100%',
                        borderWidth: 1,
                        borderColor: '#DEDEDE',
                        borderRadius: 2 * width,
                        marginVertical: 2 * width,
                        overflow: 'hidden',
                      }}>
                      <View
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          paddingHorizontal: 2 * width,
                          paddingVertical: 2 * width,
                        }}>
                        <View style={{width: 12 * width, height: 12 * width}}>
                          <Image
                            source={require('../../../assets/images/quiz_icon.png')}
                            style={{
                              width: '100%',
                              height: '100%',
                              resizeMode: 'contain',
                            }}
                          />
                        </View>
                        <View
                          style={{
                            flex: 1,
                            // height: 25 * width,
                            paddingHorizontal: 3 * width,
                            // paddingVertical: 1 * width,
                            // justifyContent: 'space-between',
                          }}>
                          <Text
                            style={{
                              fontFamily: Fonts.Regular,
                              fontSize: 3.2 * width,
                              color: ColorCode.black,
                            }}
                            numberOfLines={1}>
                            {`${quizData?.title}`}
                          </Text>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginTop: 2 * width,
                            }}>
                            <Text
                              style={{
                                fontFamily: Fonts.Regular,
                                fontSize: 3.4 * width,
                                color: '#858494',
                              }}
                              numberOfLines={1}>
                              {`${questionCount}/${questionCount} Ques`}
                            </Text>
                            {/* <View
                          style={{
                            width: '50%',
                            flexDirection: 'row',
                            paddingVertical: 1 * width,
                            backgroundColor: '#F4F4F4',
                            borderRadius: 3 * width,
                            alignItems: 'center',
                            justifyContent: 'center',
                            // justifyContent: 'space-between',
                          }}>
                          <MaterialCommunityIcons
                            name="lightning-bolt"
                            color={ColorCode.black}
                            size={3 * width}
                          />
                          <Text
                            style={{
                              fontFamily: Fonts.Regular,
                              fontSize: 2.6 * width,
                              color: ColorCode.black,
                            }}
                            numberOfLines={1}>
                            {`Percentage : ${item.percentage}`}
                          </Text>
                        </View> */}
                          </View>
                        </View>
                        <View
                          style={{
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                          }}>
                          <Image
                            source={require('../../../assets/images/quiz_attempt.png')}
                            style={{
                              width: 14 * width,
                              height: 7 * width,
                              resizeMode: 'contain',
                            }}
                          />

                          <Text
                            style={{
                              fontFamily: Fonts.SemiBold,
                              fontSize: 3.8 * width,
                              color: '#FFFFFF',
                              position: 'absolute',
                              end: 4.5 * width,
                              paddingStart: 2 * width,
                              paddingTop: 0.5 * width,
                            }}
                            numberOfLines={2}>
                            {`${grade}`}
                          </Text>
                        </View>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingHorizontal: 3 * width,
                          paddingVertical: 2 * width,
                          backgroundColor: '#FFA80033',
                          borderBottomEndRadius: 2 * width,
                          borderBottomStartRadius: 2 * width,
                        }}>
                        {attemptDate ? (
                          <Text
                            style={{
                              fontFamily: Fonts.Medium,
                              fontSize: 3.2 * width,
                              color: ColorCode.black,
                            }}
                            numberOfLines={1}>
                            {attemptDate}
                          </Text>
                        ) : (
                          <View />
                        )}
                        <TouchableOpacity
                          onPress={() => handleViewResult(item)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <Text
                            style={{
                              fontFamily: Fonts.Medium,
                              fontSize: 3.2 * width,
                              color: ColorCode.black,
                            }}
                            numberOfLines={1}>
                            View Result
                          </Text>
                          <Ionicons
                            name="chevron-forward"
                            size={5 * width}
                            color="#000"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }}
              />
            </View>
          </View>
        </CustomSAView>
      </View>
    </Provider>
  );
};

export default OnlineQuizAtemptsScreen;
