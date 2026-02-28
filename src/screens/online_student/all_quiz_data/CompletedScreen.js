import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import CustomHeader from '../../../compenents/CustomHeader';
import HeaderWithBack from '../../../compenents/HeaderWithBack';
import ColorCode from '../../../utility/ColorCode';
import width from '../../../Units/width';
import CustomStatus from '../../../compenents/CustomStatus';
import ApiMethod from '../../../api/ApiMethod';
import CustomProgress from '../../../compenents/CustomProgress';
import ToastUtility from '../../../utility/ToastUtility';
import Fonts from '../../../utility/Fonts';
import ConstData from '../../../utility/ConstData';

const CompletedScreen = ({ route, navigation }) => {
  const [quizResult, setQuizResult] = useState(null);
  const [showProgress, setShowProgress] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    attempt: 0,
    correct: 0,
    incorrect: 0,
    underReview: 0,
    obtainedMarks: 0,
    totalMarks: 0,
  });

  const attempt_id = route.params?.attempt_id;
  const quiz_name = route.params?.quiz_name || 'Quiz Result';

  useEffect(() => {
    if (attempt_id) {
      fetchQuizResult();
    } else {
      ToastUtility.showToast('Attempt ID is missing');
    }
  }, [attempt_id]);

  const fetchQuizResult = (isRefreshing = false) => {
    if (!isRefreshing) setShowProgress(true);
    const urlData = `attempt_id=${attempt_id}`;

    ApiMethod.quizResult(
      urlData,
      pass => {
        setShowProgress(false);
        setRefreshing(false);
        console.log('Quiz Result API Response:', JSON.stringify(pass, null, 2));

        if (pass.status === 200 && pass.attempt_result) {
          setQuizResult(pass.attempt_result);
          calculateStats(pass.attempt_result);
        } else {
          ToastUtility.showToast('Failed to load quiz result');
        }
      },
      fail => {
        setShowProgress(false);
        setRefreshing(false);
        console.log('Quiz Result API Error:', fail);
        ToastUtility.showToast('Failed to load quiz result');
      },
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchQuizResult(true);
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

  const isTruthy = value => {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'number') {
      return value === 1;
    }
    if (typeof value === 'string') {
      return value.trim().toLowerCase() === '1' || value.trim().toLowerCase() === 'true';
    }
    return false;
  };

  const formatMark = num => {
    if (num === null || num === undefined) return '0';
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  };

  const toArray = value => {
    if (value === undefined || value === null) {
      return [];
    }
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      if (value.trim().length === 0) {
        return [];
      }
      return value
        .split(',')
        .map(v => v.trim())
        .filter(Boolean);
    }
    return [value];
  };

  const determineQuizType = attempt => {
    return (
      attempt?.quiz_type ||
      attempt?.quiz?.quiz_type ||
      ''
    );
  };

  const getQuestionPoints = question => {
    const candidates = [
      question?.points,
      question?.point,
      question?.score,
      question?.marks,
      question?.total_points,
    ];

    for (const candidate of candidates) {
      const numericValue = toNumber(candidate);
      if (numericValue !== null) {
        return numericValue;
      }
    }

    return 0;
  };

  const getSubmittedOptionIds = question => {
    const possibleFields = [
      question?.submitted_options,
      question?.selected_option_id,
      question?.selected_options,
      question?.user_answer_id,
    ];

    for (const field of possibleFields) {
      if (field === undefined || field === null) continue;

      let ids = [];
      if (Array.isArray(field)) {
        ids = field.map(id => String(id).trim()).filter(Boolean);
      } else if (typeof field === 'string') {
        ids = field.split(',').map(id => id.trim()).filter(Boolean);
      } else {
        ids = [String(field).trim()].filter(Boolean);
      }

      if (ids.length > 0) {
        return Array.from(new Set(ids));
      }
    }

    return [];
  };

  const hasSingleCorrectMultiSelectViolation = question => {
    const rawType = String(question?.question_type || question?.type || '').toUpperCase().trim();
    const isTextType = rawType === 'MCQ_TEXT' || rawType === 'TEXT';
    if (isTextType || !Array.isArray(question?.options) || question.options.length === 0) {
      return false;
    }

    const correctOptionIds = question.options
      .filter(opt => isTruthy(opt?.is_correct) || isTruthy(opt?.isCorrect))
      .map(opt => String(opt.id || opt.option_id));

    if (correctOptionIds.length !== 1) {
      return false;
    }

    const submittedIds = getSubmittedOptionIds(question);
    return submittedIds.length > 1;
  };

  const getQuestionStatus = (question, quizType, overallReview) => {
    // 1. Check for Correctness first
    const qPercentage = toNumber(question?.percentage);
    const hasMultiSelectViolation = hasSingleCorrectMultiSelectViolation(question);
    const hasExplicitIsCorrect =
      question?.is_correct !== undefined &&
      question?.is_correct !== null;
    const apiIsCorrect =
      !hasMultiSelectViolation &&
      (isTruthy(question?.is_correct) || isTruthy(question?.isCorrect));

    // Core correctness logic
    let isCorrect = false;

    if (hasExplicitIsCorrect) {
      isCorrect = apiIsCorrect;
    } else if (qPercentage === 100 && !hasMultiSelectViolation) {
      isCorrect = true;
    } else if (apiIsCorrect) {
      isCorrect = true;
    } else {
      // Check MCQ/Text matches
      const rawType = String(question?.question_type || question?.type || '').toUpperCase().trim();
      const isTextType = rawType === 'MCQ_TEXT' || rawType === 'TEXT';

      if (Array.isArray(question?.options) && question.options.length > 0) {
        const correctOptionIds = [];
        const correctOptionTexts = [];
        question.options.forEach(opt => {
          if (isTruthy(opt?.is_correct) || isTruthy(opt?.isCorrect)) {
            correctOptionIds.push(String(opt.id || opt.option_id));
            if (opt.option_text) correctOptionTexts.push(String(opt.option_text).toLowerCase().trim());
          }
        });

        // ID match
        const submittedIds = getSubmittedOptionIds(question);
        if (submittedIds.length > 0 && correctOptionIds.length > 0) {
          if (!hasMultiSelectViolation && submittedIds.some(id => correctOptionIds.includes(id))) isCorrect = true;
        }

        // Text match (only if not already correct)
        if (!isCorrect && isTextType && correctOptionTexts.length > 0) {
          let userText = '';
          if (Array.isArray(question.text_answer) && question.text_answer.length > 0) userText = question.text_answer.join(', ');
          else if (typeof question.text_answer === 'string') userText = question.text_answer;
          else if (question.answer) userText = String(question.answer);
          else if (question.user_answer) userText = String(question.user_answer);

          if (userText && correctOptionTexts.includes(userText.toLowerCase().trim())) isCorrect = true;
        }
      }

      // Final fallbacks for correctness
      if (!isCorrect && !hasMultiSelectViolation) {
        if (toNumber(question?.marks_obtained) > 0 || toNumber(question?.obtained_marks) > 0 || toNumber(question?.score) > 0) isCorrect = true;
      }

      if (!isCorrect && !hasMultiSelectViolation && quizType === 'Abbreviation') {
        const textAnswers = toArray(question?.text_answer);
        const optionText = (Array.isArray(question?.options) && question.options[0]?.option_text) || question?.answer || question?.answer_text;
        if (optionText && typeof optionText === 'string' && textAnswers.length > 0) {
          const lowerOption = optionText.toLowerCase();
          if (textAnswers.some(answer => lowerOption.includes(answer.toLowerCase()))) isCorrect = true;
        }
      }
    }

    // 2. Determine Pending status (strictly for text types and ONLY if not correct)
    const rawType = String(question?.question_type || question?.type || '').toUpperCase().trim();
    const isUnderReviewType = rawType === 'MCQ_TEXT' || rawType === 'TEXT';
    const questionReview = question?.review || question?.remark;
    const hasReviewText = (questionReview && String(questionReview).trim() !== "") || (overallReview && String(overallReview).trim() !== "");

    // STRICT RULE: MCQ never shows Under Review. Only text types that are NOT correct and have NO review text are pending.
    const isPending = !hasExplicitIsCorrect && isUnderReviewType && !isCorrect && !hasReviewText;
    const isIncorrect = !isCorrect && !isPending;

    return { isCorrect, isPending, isIncorrect, isTextType: isUnderReviewType };
  };

  const isQuestionCorrect = (question, quizType, overallReview) => {
    return getQuestionStatus(question, quizType, overallReview).isCorrect;
  };

  const calculateObtainedMarksFromQuestions = (attempt, questionsCandidate) => {
    const questions = Array.isArray(questionsCandidate) ? questionsCandidate : [];
    if (!questions.length) return 0;

    const quizType = determineQuizType(attempt);
    const overallReview = attempt?.review;
    let earnedPoints = 0;

    questions.forEach(question => {
      const points = getQuestionPoints(question) || 1;

      // If question has an explicit percentage, use it to derive marks
      const qPercentage = toNumber(question?.percentage);
      if (
        qPercentage !== null &&
        qPercentage >= 0 &&
        !hasSingleCorrectMultiSelectViolation(question)
      ) {
        earnedPoints += (qPercentage / 100) * points;
      } else if (isQuestionCorrect(question, quizType, overallReview)) {
        earnedPoints += points;
      }
    });

    return earnedPoints;
  };

  const calculatePercentageFromQuestions = (attempt, questionsCandidate) => {
    const questions =
      (Array.isArray(questionsCandidate) && questionsCandidate.length > 0
        ? questionsCandidate
        : Array.isArray(attempt?.questions) && attempt.questions.length > 0
          ? attempt.questions
          : Array.isArray(attempt?.question_details) &&
            attempt.question_details.length > 0
            ? attempt.question_details
            : Array.isArray(attempt?.quiz_questions) &&
              attempt.quiz_questions.length > 0
              ? attempt.quiz_questions
              : []);

    if (!questions.length) {
      return null;
    }

    const quizType = determineQuizType(attempt);
    const overallReview = attempt?.review;
    let totalPoints = 0;
    let earnedPoints = 0;

    questions.forEach(question => {
      const points = getQuestionPoints(question) || 1;
      totalPoints += points;

      const qPercentage = toNumber(question?.percentage);
      if (
        qPercentage !== null &&
        qPercentage >= 0 &&
        !hasSingleCorrectMultiSelectViolation(question)
      ) {
        earnedPoints += (qPercentage / 100) * points;
      } else if (isQuestionCorrect(question, quizType, overallReview)) {
        earnedPoints += points;
      }
    });

    if (totalPoints <= 0) {
      return null;
    }

    return (earnedPoints / totalPoints) * 100;
  };

  const calculatePercentage = (attempt, questionsCandidate) => {
    if (!attempt) {
      return null;
    }

    const direct =
      toNumber(attempt?.percentage) ??
      toNumber(attempt?.percent) ??
      toNumber(attempt?.result_percentage ?? attempt?.score_percentage);

    if (direct !== null) {
      return direct;
    }

    const earned =
      toNumber(attempt?.total_marks_obtained) ??
      toNumber(attempt?.total_points) ??
      toNumber(attempt?.score) ??
      toNumber(attempt?.marks_obtained);

    const max =
      toNumber(attempt?.total_marks) ??
      toNumber(quizResult?.total_marks) ??
      toNumber(attempt?.max_points);

    if (earned !== null && max !== null && max > 0) {
      return (earned / max) * 100;
    }

    const derived = calculatePercentageFromQuestions(attempt, questionsCandidate);
    if (derived !== null) {
      return derived;
    }

    return null;
  };

  const calculateDetailedStats = (questions, quizResultData) => {
    let mcqCorrect = 0;
    let mcqTotal = 0;
    let textCorrect = 0;
    let textTotal = 0;
    let textPending = 0;

    const quizType = determineQuizType(quizResultData);
    const overallReview = quizResultData?.review;

    questions.forEach(q => {
      const { isCorrect, isPending, isTextType } = getQuestionStatus(q, quizType, overallReview);

      if (isTextType) {
        textTotal++;
        if (isCorrect) textCorrect++;
        else if (isPending) textPending++;
      } else {
        mcqTotal++;
        if (isCorrect) mcqCorrect++;
      }
    });

    return { mcqCorrect, mcqTotal, textCorrect, textTotal, textPending };
  };

  const calculateStats = (attemptResult) => {
    if (!attemptResult || !attemptResult.questions) {
      return;
    }

    let correct = 0;
    let incorrect = 0;
    let underReview = 0;
    const quizType = determineQuizType(attemptResult);
    const overallReview = attemptResult?.review;

    attemptResult.questions.forEach(question => {
      const { isCorrect, isPending } = getQuestionStatus(question, quizType, overallReview);

      if (isCorrect) {
        correct++;
      } else if (isPending) {
        underReview++;
      } else {
        incorrect++;
      }
    });

    const obtainedMarks =
      toNumber(attemptResult.total_marks_obtained) ??
      calculateObtainedMarksFromQuestions(attemptResult, attemptResult.questions);

    const totalMarks =
      toNumber(attemptResult.total_marks) ??
      attemptResult.questions.reduce((acc, q) => acc + (getQuestionPoints(q) || 1), 0);

    setStats({
      attempt: attemptResult.attempt_id || 0,
      correct: correct,
      incorrect: incorrect,
      underReview: underReview,
      obtainedMarks: obtainedMarks,
      totalMarks: totalMarks,
    });
  };

  const getSelectedAnswerText = (question) => {
    // Check for text answer first (only if it has actual content)
    const textAnswer = question.text_answer;
    if (textAnswer &&
      ((Array.isArray(textAnswer) && textAnswer.length > 0) ||
        (typeof textAnswer === 'string' && textAnswer.trim().length > 0))) {
      const textArray = toArray(textAnswer);
      const answerText = textArray.join(', ');
      if (answerText) {
        return answerText;
      }
    }

    // Check for submitted_options (this is what the API actually returns)
    let submittedOptionIds = [];
    if (question.submitted_options !== undefined && question.submitted_options !== null) {
      submittedOptionIds = toArray(question.submitted_options);
    }

    // Fallback to selected_option_id or selected_options
    if (submittedOptionIds.length === 0) {
      submittedOptionIds = toArray(question.selected_option_id || question.selected_options);
    }

    // If no option IDs found, return early
    if (submittedOptionIds.length === 0) {
      return 'No answer selected';
    }

    // Check if we have options to match against
    if (!question.options || question.options.length === 0) {
      return 'No answer selected';
    }

    // Match submitted option IDs with actual options (handle string/number conversions)
    const selectedOptions = question.options.filter(opt => {
      if (!opt || opt.id === undefined || opt.id === null) return false;

      // Try multiple matching strategies
      const optIdStr = String(opt.id);
      const optIdNum = Number(opt.id);

      const isMatch = submittedOptionIds.some(subId => {
        const subIdStr = String(subId);
        const subIdNum = Number(subId);
        return optIdStr === subIdStr ||
          optIdNum === subIdNum ||
          String(optIdNum) === subIdStr ||
          String(subIdNum) === optIdStr ||
          opt.id === subId ||
          opt.id === subIdNum;
      });

      return isMatch;
    });

    if (selectedOptions.length > 0) {
      const answerText = selectedOptions.map(opt => opt.option_text).join(', ');
      return answerText;
    }

    return 'No answer selected';
  };





  const detailedStats = quizResult?.questions ? calculateDetailedStats(quizResult.questions, quizResult) : null;

  if (!quizResult) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: ColorCode.white }}>
        <CustomStatus trans={true} isDark={true} color="#FFFFFF00" />
        <CustomHeader
          text={quiz_name}
          customStyle={{ marginTop: -5, paddingVertical: 5 }}
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: width * 4, color: '#666' }}>
            Loading quiz result...
          </Text>
        </View>
        <CustomProgress show={showProgress} />
      </SafeAreaView>
    );
  }

  const calculatedPercentage = calculatePercentage(quizResult, quizResult?.questions);
  const percentage = calculatedPercentage !== null ? Math.round(calculatedPercentage) : 0;
  const grade = ConstData.getGradeValue(percentage);

  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: ColorCode.white }}>
        <CustomStatus trans={true} isDark={true} color="#FFFFFF00" />
        <CustomHeader
          text={quiz_name}
          customStyle={{ marginTop: -5, paddingVertical: 5 }}
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: height * 12 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Final Result Grade Card */}
          <View style={styles.gradeCard}>
            <Text style={styles.gradeCardTitle}>Final Result</Text>
            <View style={styles.gradeInfoContainer}>
              <View style={styles.gradeInfoItem}>
                <Text style={styles.gradeInfoLabel}>Percentage</Text>
                <Text style={styles.gradeInfoValue}>{percentage}%</Text>
              </View>
              <View style={styles.gradeInfoDivider} />
              <View style={styles.gradeInfoItem}>
                <Text style={styles.gradeInfoLabel}>Grade</Text>
                <Text style={[styles.gradeInfoValue, styles.gradeValue]}>
                  {grade}
                </Text>
              </View>
            </View>
          </View>

          {/* Header Stats */}
          <View style={styles.headerContainer}>
            <View style={styles.statItem}>
              <Icon name="star-outline" size={24} color="white" />
              <Text style={styles.statLabel}>QUESTION</Text>
              <Text style={styles.statValue}>
                {`${quizResult.questions ? quizResult.questions.length : 0} Ques`}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="check" size={24} color="white" />
              <Text style={styles.statLabel}>CORRECT</Text>
              <Text style={styles.statValue}>{stats.correct}</Text>
            </View>
            <View style={styles.statItem}>
              <AntDesign name="closecircleo" size={24} color="white" />
              <Text style={styles.statLabel}>INCORRECT</Text>
              <Text style={styles.statValue}>
                {stats.incorrect.toString().padStart(2, '0')}
              </Text>
            </View>
            {stats.underReview > 0 && (
              <View style={styles.statItem}>
                <AntDesign name="clockcircleo" size={24} color="white" />
                <Text style={styles.statLabel}>REVIEW</Text>
                <Text style={styles.statValue}>{stats.underReview}</Text>
              </View>
            )}
            <View style={styles.statItem}>
              <Icon name="assessment" size={24} color="white" />
              <Text style={styles.statLabel}>MARKS</Text>
              <Text style={styles.statValue}>
                {`${formatMark(stats.obtainedMarks)}/${formatMark(stats.totalMarks)}`}
              </Text>
            </View>
          </View>

          {detailedStats && (
            <View style={[styles.statsBreakdownContainer, { paddingRight: 8 * width, flexDirection: 'row', alignItems: 'center' }]}>
              <Text style={styles.statsBreakdownText}>
                MCQ: {detailedStats.mcqCorrect}/{detailedStats.mcqTotal}  |  Text: {detailedStats.textCorrect}/{detailedStats.textTotal}
              </Text>

            </View>
          )}

          {/* Questions */}
          <View style={styles.questionsContainer}>
            {quizResult.questions && quizResult.questions.length > 0 ? (
              quizResult.questions.map((question, index) => {
                const quizType = determineQuizType(quizResult);
                const overallReview = quizResult?.review;
                const userSelectedAnswerText = getSelectedAnswerText(question);
                const { isCorrect: isThisQuestionCorrect, isPending: isUnderReview, isTextType: hasTextAnswer } = getQuestionStatus(question, quizType, overallReview);

                const hasOptions = Array.isArray(question.options) && question.options.length > 0;

                return (
                  <View key={question.question_id || index} style={styles.questionContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Text style={styles.questionText}>
                        {index + 1}. {question.question_text || 'Question'}
                      </Text>
                    </View>

                    {/* Text Answer Display */}
                    {hasTextAnswer && (
                      <View style={styles.optionsContainer}>
                        <Text style={styles.answerLabel}>Your Answer:</Text>
                        <View style={[
                          styles.optionItem,
                          isThisQuestionCorrect ? styles.correctOption : (isUnderReview ? styles.pendingOption : styles.incorrectOption)
                        ]}>
                          <View style={styles.optionContent}>
                            {isThisQuestionCorrect ? (
                              <View style={styles.optionIconContainer}>
                                <Icon name="check-circle" size={18} color="#4CAF50" />
                              </View>
                            ) : (
                              <View style={styles.optionIconContainer}>
                                <Icon name={isUnderReview ? "help-outline" : "cancel"} size={18} color={isUnderReview ? "#FFC107" : "#F44336"} />
                              </View>
                            )}
                            <Text style={[
                              styles.optionText,
                              isThisQuestionCorrect ? styles.correctOptionText : (isUnderReview ? styles.pendingOptionText : styles.incorrectOptionText)
                            ]}>
                              {userSelectedAnswerText}
                            </Text>
                          </View>
                        </View>
                        <Text style={[
                          styles.statusText,
                          { color: isThisQuestionCorrect ? '#4CAF50' : (isUnderReview ? '#FF9800' : '#F44336') }
                        ]}>
                          {isThisQuestionCorrect ? 'Correct Answer' : (isUnderReview ? 'Under Review' : 'Incorrect Answer')}
                        </Text>
                      </View>
                    )}

                    {/* All Options (for multiple choice questions - only show if no text answer) */}
                    {hasOptions && !hasTextAnswer && (
                      <View style={styles.optionsContainer}>
                        {question.options.map((option, optIndex) => {
                          // Helper function for MCQ matching (local for simplicity or use getQuestionStatus derived bits)
                          const submittedOptionIds = toArray(question.submitted_options || question.selected_option_id || question.selected_options);
                          const isSubmitted = submittedOptionIds.some(subId => String(subId) === String(option.id));
                          const isCorrect = isTruthy(option.is_correct) || isTruthy(option.isCorrect);
                          const hasMultiSelectViolation = hasSingleCorrectMultiSelectViolation(question);
                          const selectedIsCorrect = isSubmitted && isCorrect && !hasMultiSelectViolation;

                          // Only show correct/wrong for user's selected option
                          // Unselected options just show in gray
                          let optionStyle = styles.optionItem;
                          let optionTextStyle = styles.optionText;

                          if (isSubmitted) {
                            // Respect final reviewed question status first.
                            if (isUnderReview) {
                              optionStyle = [styles.optionItem, styles.pendingOption];
                              optionTextStyle = [styles.optionText, styles.pendingOptionText];
                            } else if (!isThisQuestionCorrect) {
                              optionStyle = [styles.optionItem, styles.incorrectOption];
                              optionTextStyle = [styles.optionText, styles.incorrectOptionText];
                            } else if (selectedIsCorrect) {
                              optionStyle = [styles.optionItem, styles.correctOption];
                              optionTextStyle = [styles.optionText, styles.correctOptionText];
                            } else {
                              optionStyle = [styles.optionItem, styles.incorrectOption];
                              optionTextStyle = [styles.optionText, styles.incorrectOptionText];
                            }
                          } else {
                            // Not selected by user - show in gray
                            optionStyle = [styles.optionItem, styles.unselectedOption];
                            optionTextStyle = [styles.optionText, styles.unselectedOptionText];
                          }

                          return (
                            <View key={option.id || optIndex} style={optionStyle}>
                              <View style={styles.optionContent}>
                                {isSubmitted && isThisQuestionCorrect && (
                                  <View style={styles.optionIconContainer}>
                                    <Icon name="check-circle" size={18} color="#4CAF50" />
                                  </View>
                                )}
                                {isSubmitted && isUnderReview && (
                                  <View style={styles.optionIconContainer}>
                                    <Icon name="help-outline" size={18} color="#FFC107" />
                                  </View>
                                )}
                                {isSubmitted && !isThisQuestionCorrect && !isUnderReview && (
                                  <View style={styles.optionIconContainer}>
                                    <Icon name="cancel" size={18} color="#F44336" />
                                  </View>
                                )}
                                {!isSubmitted && (
                                  <View style={styles.optionIconContainer}>
                                    <Icon name="radio-button-unchecked" size={18} color="#999" />
                                  </View>
                                )}
                                <Text style={optionTextStyle}>{option.option_text}</Text>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              <View style={styles.questionContainer}>
                <Text style={styles.questionText}>No questions found</Text>
              </View>
            )}
          </View>
        </ScrollView>
        <CustomProgress show={showProgress} />
      </SafeAreaView >
    </>
  );
};

export default CompletedScreen;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: '#B8D4F0',
    fontSize: width * 2.5,
    fontWeight: '600',
    marginTop: width * 2,
    marginBottom: width * 1,
  },
  statValue: {
    color: 'white',
    fontSize: width * 3.5,
    fontWeight: 'bold',
  },
  questionsContainer: {
    padding: width * 4,
  },
  questionContainer: {
    marginBottom: width * 5,
  },
  questionText: {
    fontSize: width * 3.8,
    color: '#333',
    marginBottom: width * 2.5,
    lineHeight: 22,
    fontWeight: '400',
  },
  answerContainer: {
    borderRadius: width * 2,
    paddingVertical: width * 4,
    paddingHorizontal: width * 4,
    borderWidth: 1,
  },
  correctAnswer: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  incorrectAnswer: {
    backgroundColor: '#FFF0F0',
    borderColor: '#F44336',
  },
  answerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: width * 5,
    height: width * 5,
    borderRadius: width * 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: width * 2.5,
  },
  correctIcon: {
    backgroundColor: '#4CAF50',
  },
  incorrectIcon: {
    backgroundColor: '#F44336',
  },
  answerText: {
    fontSize: width * 3.6,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  gradeCard: {
    backgroundColor: '#F8F9FA',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  gradeCardTitle: {
    fontSize: width * 4.5,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  gradeInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  gradeInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  gradeInfoLabel: {
    fontSize: width * 3.2,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  gradeInfoValue: {
    fontSize: width * 5.5,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  gradeValue: {
    fontSize: width * 6.5,
    color: '#2E7D32',
  },
  gradeInfoDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#DDD',
    marginHorizontal: 10,
  },
  optionsContainer: {
    marginTop: width * 3,
  },
  optionItem: {
    borderRadius: width * 2,
    paddingVertical: width * 3,
    paddingHorizontal: width * 4,
    borderWidth: 1,
    marginBottom: width * 2,
  },
  correctOption: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  incorrectOption: {
    backgroundColor: '#FFF0F0',
    borderColor: '#F44336',
  },
  unselectedOption: {
    backgroundColor: '#F5F5F5',
    borderColor: '#DDD',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIconContainer: {
    marginRight: width * 2,
  },
  optionText: {
    fontSize: width * 3.6,
    flex: 1,
    lineHeight: 20,
  },
  correctOptionText: {
    color: '#2E7D32',
    fontWeight: '500',
  },
  incorrectOptionText: {
    color: '#C62828',
    fontWeight: '500',
  },
  unselectedOptionText: {
    color: '#666',
  },
  statsBreakdownContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  statsBreakdownText: {
    fontSize: width * 3.2,
    color: '#4A90E2',
    fontWeight: '600',
    fontFamily: Fonts.Medium,
  },
  answerLabel: {
    fontSize: width * 2.8,
    color: '#666',
    marginBottom: width * 1.5,
    fontWeight: '500',
  },
  pendingBadgeHeader: {
    backgroundColor: '#FED402',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  pendingBadgeItem: {
    backgroundColor: '#FED402',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  pendingBadgeText: {
    fontSize: width * 2.5,
    color: '#000',
    fontWeight: '700',
  },
  pendingOption: {
    borderColor: '#FED402',
    backgroundColor: '#FFFBE6',
  },
  pendingOptionText: {
    color: '#D4A017',
  },
  statusText: {
    marginTop: 8,
    fontSize: width * 3,
    fontWeight: '600',
    fontFamily: Fonts.Medium,
  },
});
