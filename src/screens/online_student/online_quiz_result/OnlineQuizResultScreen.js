import React, { Fragment, useEffect, useState } from 'react';
import { FlatList, Image, ImageBackground, StatusBar, Text, View, RefreshControl } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Provider } from 'react-native-paper';
import ApiMethod from '../../../api/ApiMethod';
import CustomProgress from '../../../compenents/CustomProgress';
import CustomSAView from '../../../compenents/CustomSAView';
import CustomStatus from '../../../compenents/CustomStatus';
import CustomHeader from '../../../compenents/CustomHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import height from '../../../Units/height';
import width from '../../../Units/width';
import ColorCode from '../../../utility/ColorCode';
import ConstData from '../../../utility/ConstData';
import Fonts from '../../../utility/Fonts';
import ToastUtility from '../../../utility/ToastUtility';

const OnlineQuizResultScreen = ({ navigation, route }) => {
  const [attemptData, setAttemptData] = useState(route.params.data);
  const [quizData, setQuizData] = useState(route.params.quizData);
  const [questionCount, setQuestionCount] = useState(route.params.questionCount);
  const [totalMarksState, setTotalMarksState] = useState(route.params.totalMarks);
  const [answerData, setAnswerData] = useState(null);
  const [remark, setRemark] = useState("");

  const [showProgress, setShowProgress] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const attemptIdParam =
    route.params?.attemptId ||
    route.params?.data?.attempt_id ||
    route.params?.data?.id;
  const quizTitle =
    route.params?.quizTitle ||
    route.params?.quizData?.title ||
    route.params?.data?.quiz?.title ||
    route.params?.data?.title;

  console.log('attemptData', attemptData)
  console.log('quizData', quizData)

  useEffect(() => {
    getquizResult();
  }, [attemptIdParam]);

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

  const quizQuestionsFromParams = Array.isArray(quizData?.questions)
    ? quizData.questions
    : Array.isArray(quizData?.quiz_data)
      ? quizData.quiz_data
      : [];

  const matchQuestionFromParams = question => {
    if (!question) {
      return null;
    }
    const questionId =
      question.question_id || question.id || question.quiz_question_id;
    const text = question.question_text || question.text;
    const matched =
      quizQuestionsFromParams.find(
        q =>
          (q.id && q.id === questionId) ||
          (q.question_id && q.question_id === questionId) ||
          (q.question_text && q.question_text === text),
      ) || null;
    return matched;
  };

  const onRefresh = () => {
    setRefreshing(true);
    getquizResult(true);
  };

  const getquizResult = (isRefreshing = false) => {
    if (!isRefreshing) setShowProgress(true);
    const idToUse = attemptIdParam || attemptData?.id;
    if (!idToUse) {
      setShowProgress(false);
      setRefreshing(false);
      ToastUtility.showToast('Attempt details not available.');
      return;
    }
    ApiMethod.quizResult(
      `attempt_id=${idToUse}`,
      pass => {
        setShowProgress(false);
        setRefreshing(false);
        console.log('✅ Quiz Result API Response (Full):', JSON.stringify(pass, null, 2));
        const attemptResult = pass?.attempt_result;
        if (attemptResult) {
          console.log('📝 Attempt Result Details:', {
            attempt_id: attemptResult.attempt_id,
            total_questions: attemptResult.questions?.length,
            quiz_type: attemptResult.quiz_type
          });

          const enrichedQuestions = Array.isArray(attemptResult.questions)
            ? attemptResult.questions.map((question, index) => {
              const fallback = matchQuestionFromParams(question);
              const mergedOptions =
                Array.isArray(question.options) && question.options.length > 0
                  ? question.options
                  : Array.isArray(fallback?.options)
                    ? fallback.options
                    : [];

              console.log(`🔍 Processing Question ${index + 1}:`, {
                id: question.question_id || question.id,
                has_fallback: !!fallback,
                options_count: mergedOptions.length,
                submitted: question.submitted_options || question.selected_option_id
              });

              return {
                ...fallback,
                ...question,
                options: mergedOptions,
              };
            })
            : [];

          setAttemptData(prev => ({
            ...prev,
            ...(attemptResult || {}),
          }));
          setAnswerData({
            ...attemptResult,
            questions: enrichedQuestions,
          });
          const calculatedTotal = enrichedQuestions.reduce((acc, q) => acc + (getQuestionPoints(q) || 1), 0);
          if (calculatedTotal > 0) {
            setTotalMarksState(calculatedTotal);
          }
          if (attemptResult.total_marks_obtained !== undefined && attemptResult.total_marks_obtained !== null) {
            setAttemptData(prev => ({ ...prev, total_points: attemptResult.total_marks_obtained }));
          }
          if (attemptResult.total_marks !== undefined && attemptResult.total_marks !== null) {
            setTotalMarksState(toNumber(attemptResult.total_marks));
          }
          setRemark(attemptResult.review);
        } else {
          setRefreshing(false);
          ToastUtility.showToast('Result not available yet.');
        }
      },
      fail => {
        setShowProgress(false);
        setRefreshing(false);
        ToastUtility.showToast('Failed to load attempt details.');
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

  const determineQuizType = attempt => {
    return (
      attempt?.quiz_type ||
      attempt?.quiz?.quiz_type ||
      quizData?.quiz_type ||
      route.params?.quizData?.quiz_type ||
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

    // Core correctness logic (mirrors previous isQuestionCorrect)
    let isCorrect = false;

    // If backend has explicit correctness, always trust it.
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
          if (!hasMultiSelectViolation && submittedIds.some(id => correctOptionIds.includes(id))) {
            isCorrect = true;
          }
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

      // Final fallbacks for correctness (Now allowed for Text types too if reviewed)
      if (!isCorrect && !hasMultiSelectViolation) {
        if (toNumber(question?.marks_obtained) > 0 || toNumber(question?.obtained_marks) > 0 || toNumber(question?.score) > 0) isCorrect = true;
      }

      if (!isCorrect && quizType === 'Abbreviation') {
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

  const isQuestionCorrect = (question, quizType) => {
    return getQuestionStatus(question, quizType).isCorrect;
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
      } else if (isQuestionCorrect(question, quizType)) {
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

    const matchedAttemptFromQuizData = Array.isArray(quizData?.attempt_history)
      ? quizData.attempt_history.find(item => {
        const itemId = item?.id ?? item?.attempt_id;
        return itemId !== undefined && String(itemId) === String(attemptIdParam);
      })
      : null;

    const quizDataDirectPercentage =
      toNumber(matchedAttemptFromQuizData?.percentage) ??
      toNumber(quizData?.highest_attempt?.percentage);

    if (quizDataDirectPercentage !== null) {
      return quizDataDirectPercentage;
    }

    const hasViolationFromQuestions =
      Array.isArray(questionsCandidate) &&
      questionsCandidate.some(question => hasSingleCorrectMultiSelectViolation(question));

    if (hasViolationFromQuestions) {
      const derivedFirst = calculatePercentageFromQuestions(attempt, questionsCandidate);
      if (derivedFirst !== null) {
        return derivedFirst;
      }
    }

    // Priority 1: Direct percentage from attempt (source of truth for overrides)
    const direct =
      toNumber(attempt?.percentage) ??
      toNumber(attempt?.percent) ??
      toNumber(attempt?.result_percentage ?? attempt?.score_percentage);

    if (direct !== null) {
      return direct;
    }

    // Priority 2: Marks-based calculation
    const earned =
      toNumber(attempt?.total_points) ??
      toNumber(attempt?.score) ??
      toNumber(attempt?.marks_obtained);

    const max =
      toNumber(attempt?.total_marks) ??
      toNumber(totalMarks) ??
      toNumber(quizData?.total_marks) ??
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

  const resolveGradeFromAttempt = attempt => {
    if (!attempt) {
      return '--';
    }

    const gradeHints = [
      attempt.grade,
      attempt.grade_text,
      attempt.grade_letter,
      attempt.overall_grade,
      attempt.gradeValue,
      attempt.grade_value,
      attempt.final_grade,
    ];

    for (const hint of gradeHints) {
      if (typeof hint === 'number' && Number.isFinite(hint)) {
        const gradeFromNumber = ConstData.getGradeValue(hint);
        if (gradeFromNumber !== '--') {
          return gradeFromNumber;
        }
      } else if (typeof hint === 'string') {
        const trimmed = hint.trim();
        if (trimmed.length > 0) {
          return trimmed.toUpperCase();
        }
      }
    }

    return '--';
  };

  const calculateObtainedMarksFromQuestions = (attempt, questionsCandidate) => {
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
    let earnedPoints = 0;

    questions.forEach(question => {
      // Use fallback of 1 point to match display logic
      const points = getQuestionPoints(question) || 1;

      // If question has an explicit percentage, use it to derive marks
      const qPercentage = toNumber(question?.percentage);
      if (
        qPercentage !== null &&
        qPercentage >= 0 &&
        !hasSingleCorrectMultiSelectViolation(question)
      ) {
        earnedPoints += (qPercentage / 100) * points;
      } else if (isQuestionCorrect(question, quizType)) {
        earnedPoints += points;
      }
    });

    return earnedPoints;
  };

  const calculateDetailedStats = (questions) => {
    let mcqCorrect = 0;
    let mcqTotal = 0;
    let textCorrect = 0;
    let textTotal = 0;
    let textPending = 0;

    const quizType = determineQuizType(attemptData);
    const overallReview = attemptData?.review;

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

  const detailedStats = answerData?.questions ? calculateDetailedStats(answerData.questions) : null;

  const totalMarks =
    toNumber(attemptData?.total_marks) ||
    totalMarksState ||
    (answerData?.questions?.reduce((acc, q) => acc + (getQuestionPoints(q) || 1), 0)) ||
    (attemptData?.questions?.reduce((acc, q) => acc + (getQuestionPoints(q) || 1), 0)) ||
    questionCount ||
    5;

  const formatMark = (value) => {
    const num = toNumber(value);
    if (num === null) return "0";
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  };

  const obtainedMarks =
    toNumber(attemptData?.total_marks_obtained) ??
    toNumber(attemptData?.total_points) ??
    toNumber(attemptData?.score) ??
    toNumber(attemptData?.marks_obtained) ??
    calculateObtainedMarksFromQuestions(attemptData, answerData?.questions) ??
    0;

  const totalQuestionsCount =
    (Array.isArray(answerData?.questions) && answerData.questions.length > 0
      ? answerData.questions.length
      : toNumber(questionCount) ?? 0);
  const correctAnswersCount =
    detailedStats
      ? (detailedStats.mcqCorrect + detailedStats.textCorrect)
      : 0;
  const underReviewCount =
    detailedStats?.textPending ?? 0;
  const incorrectAnswersCount = Math.max(
    totalQuestionsCount - correctAnswersCount - underReviewCount,
    0,
  );
  const showUnderReviewSummary = underReviewCount > 0;

  const attemptPercentage = calculatePercentage(attemptData, answerData?.questions);
  const attemptGrade =
    attemptPercentage !== null
      ? ConstData.getGradeValue(attemptPercentage)
      : resolveGradeFromAttempt(attemptData);


  return (
    <Provider>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: ColorCode.white,
        }}>
        <CustomStatus trans={true} isDark={true} color="#FFFFFF00" />
        <CustomHeader
          text={quizTitle ? `${quizTitle} Result` : 'Quiz Result'}
          customStyle={{ marginTop: -5, paddingVertical: 5 }}
        />
        <CustomSAView
          parentStyple={{ flex: 1, backgroundColor: ColorCode.transarent }}
          style={{ flex: 1, backgroundColor: ColorCode.transarent }}>
          <View
            style={{
              flex: 1,
              borderRadius: 2 * width,
              paddingHorizontal: 3 * width,
              backgroundColor: ColorCode.white,
            }}>
            <View
              style={{
                flexDirection: 'row',
                paddingHorizontal: 2 * width,
                paddingVertical: 2 * width,
              }}>
              <View style={{ width: 12 * width, height: 12 * width }}>
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
                  {`${quizData.title}`}
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.Regular,
                    fontSize: 3.4 * width,
                    color: '#858494',
                  }}
                  numberOfLines={1}>
                  {`${String(totalQuestionsCount).padStart(2, '0')} Questions`}
                </Text>
                {attemptPercentage !== null && (
                  <Text
                    style={{
                      fontFamily: Fonts.SemiBold,
                      fontSize: 3.2 * width,
                      color: '#4CAF50', // Green for success/percentage
                      marginTop: 1 * width,
                    }}>
                    {`Percentage: ${Number(attemptPercentage).toFixed(2)}%`}
                  </Text>
                )}
              </View>
              <View
                style={{
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                }}>
                <View style={{ alignItems: 'flex-end' }}>
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
                      fontSize: 3.0 * width,
                      color: '#FFFFFF',
                      position: 'absolute',
                      end: 4.5 * width,
                      paddingStart: 0 * width,
                      paddingTop: 0.5 * width,
                      marginTop: 1.5 * width,
                    }}
                    numberOfLines={2}>
                    {`${attemptGrade}`}
                  </Text>
                </View>

                {detailedStats && detailedStats.textPending > 0 && (
                  <View style={{
                    backgroundColor: '#FED402',
                    paddingHorizontal: 1 * width,
                    paddingVertical: 0.5 * width,
                    borderRadius: 4,
                    marginTop: 0.5 * width,
                  }}>
                    <Text style={{
                      fontFamily: Fonts.Bold,
                      fontSize: 2.2 * width,
                      color: '#000',
                    }}>
                      Under Review
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View
              style={{
                width: '100%',
                height: 1,
                backgroundColor: '#DDDDDD',
              }}
            />
            <View
              style={{
                width: '100%',
                marginTop: 2 * width,
                marginBottom: 2 * width,
                borderRadius: 2 * width,
                backgroundColor: '#3A8DE0',
                flexDirection: 'row',
                paddingVertical: 2.5 * width,
              }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontFamily: Fonts.Regular, fontSize: 2.6 * width, color: '#D7EBFF' }}>
                  QUESTIONS
                </Text>
                <Text style={{ fontFamily: Fonts.SemiBold, fontSize: 4 * width, color: '#FFFFFF', marginTop: 0.5 * width }}>
                  {String(totalQuestionsCount).padStart(2, '0')}
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontFamily: Fonts.Regular, fontSize: 2.6 * width, color: '#D7EBFF' }}>
                  CORRECT
                </Text>
                <Text style={{ fontFamily: Fonts.SemiBold, fontSize: 4 * width, color: '#FFFFFF', marginTop: 0.5 * width }}>
                  {String(correctAnswersCount).padStart(2, '0')}
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontFamily: Fonts.Regular, fontSize: 2.6 * width, color: '#D7EBFF' }}>
                  {showUnderReviewSummary ? 'UNDER REVIEW' : 'INCORRECT'}
                </Text>
                <Text style={{ fontFamily: Fonts.SemiBold, fontSize: 4 * width, color: '#FFFFFF', marginTop: 0.5 * width }}>
                  {String(showUnderReviewSummary ? underReviewCount : incorrectAnswersCount).padStart(2, '0')}
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontFamily: Fonts.Regular, fontSize: 2.6 * width, color: '#D7EBFF' }}>
                  MARKS
                </Text>
                <Text style={{ fontFamily: Fonts.SemiBold, fontSize: 4 * width, color: '#FFFFFF', marginTop: 0.5 * width }}>
                  {`${formatMark(obtainedMarks)}/${formatMark(totalMarks)}`}
                </Text>
              </View>
            </View>
            <View
              style={{
                width: '100%',
                height: 1,
                backgroundColor: '#DDDDDD',
              }}
            />
            {remark && (
              <View
                style={{
                  width: '100%',
                  // flexDirection: 'row',
                  paddingVertical: 1 * width,
                  paddingHorizontal: 3 * width,
                }}>
                <Text
                  style={{
                    fontFamily: Fonts.Regular,
                    fontSize: 3.4 * width,
                    color: '#000',
                    textDecorationLine: 'underline',
                  }}
                  numberOfLines={1}>
                  {`Teacher Remark`}
                </Text>
                <Text
                  style={{
                    // flex: 1,
                    fontFamily: Fonts.Regular,
                    fontSize: 3.4 * width,
                    color: ColorCode.grey888,
                  }}>
                  {remark}
                </Text>
              </View>
            )}
            <View
              style={{
                width: '100%',
                height: 1,
                backgroundColor: '#DDDDDD',
              }}
            />
            {answerData && (
              <FlatList
                contentContainerStyle={{ paddingBottom: height * 12 }}
                style={{ flex: 1 }}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[ColorCode.primary]}
                  />
                }
                data={answerData.questions}
                renderItem={({ item, index }) => {
                  // Helper function to check if an option ID matches submitted IDs (same logic used in display)
                  const isOptionSubmitted = (optionId, submittedIds) => {
                    if (!optionId || optionId === undefined || optionId === null || submittedIds.length === 0) {
                      return false;
                    }
                    const optIdStr = String(optionId);
                    const optIdNum = Number(optionId);

                    return submittedIds.includes(optIdStr) ||
                      submittedIds.includes(String(optIdNum)) ||
                      submittedIds.some(sub => {
                        const subStr = String(sub);
                        const subNum = Number(sub);
                        return subStr === optIdStr ||
                          subStr === String(optIdNum) ||
                          String(subNum) === optIdStr ||
                          subNum === optIdNum ||
                          subNum === optionId ||
                          String(subNum) === String(optionId);
                      });
                  };

                  // Normalize submitted_options to array of IDs (as strings for comparison)
                  let submittedOptionsArray = [];
                  if (item.submitted_options !== undefined && item.submitted_options !== null) {
                    if (Array.isArray(item.submitted_options)) {
                      submittedOptionsArray = item.submitted_options.map(opt => String(opt));
                    } else if (typeof item.submitted_options === 'string') {
                      submittedOptionsArray = item.submitted_options.split(',').map(opt => String(opt.trim())).filter(opt => opt.length > 0);
                    } else {
                      submittedOptionsArray = [String(item.submitted_options)];
                    }
                  }

                  // Also check for other possible fields
                  if (submittedOptionsArray.length === 0) {
                    if (item.selected_option_id !== undefined && item.selected_option_id !== null) {
                      submittedOptionsArray = Array.isArray(item.selected_option_id) ? item.selected_option_id.map(opt => String(opt)) : [String(item.selected_option_id)];
                    } else if (item.selected_options !== undefined && item.selected_options !== null) {
                      submittedOptionsArray = Array.isArray(item.selected_options) ? item.selected_options.map(opt => String(opt)) : String(item.selected_options).split(',').map(opt => String(opt.trim())).filter(opt => opt.length > 0);
                    }
                  }

                  // Get user's submitted answer text using existing logic
                  let userSubmittedAnswerText = '';
                  if (item.text_answer && ((Array.isArray(item.text_answer) && item.text_answer.length > 0) || (typeof item.text_answer === 'string' && item.text_answer.trim().length > 0))) {
                    userSubmittedAnswerText = Array.isArray(item.text_answer) ? item.text_answer.join(', ') : item.text_answer.trim();
                  }

                  if (!userSubmittedAnswerText && submittedOptionsArray.length > 0 && item.options) {
                    const texts = item.options.filter(opt => opt && opt.id !== undefined && isOptionSubmitted(opt.id, submittedOptionsArray)).map(opt => opt.option_text).filter(Boolean);
                    if (texts.length) userSubmittedAnswerText = texts.join(', ');
                  }

                  // Fallbacks for userSubmittedAnswerText
                  if (!userSubmittedAnswerText) {
                    if (item.answer && typeof item.answer === 'string' && item.answer.trim().length > 0) userSubmittedAnswerText = item.answer.trim();
                    else if (item.user_answer && typeof item.user_answer === 'string' && item.user_answer.trim().length > 0) userSubmittedAnswerText = item.user_answer.trim();
                  }

                  // Get UNIFIED status
                  const { isCorrect: isCorrectForDisplay, isPending, isIncorrect, isTextType: isTextQuestion } = getQuestionStatus(item, determineQuizType(attemptData), remark);
                  const hasMultiSelectViolation = hasSingleCorrectMultiSelectViolation(item);
                  return (
                    <View key={index} style={{ width: '100%' }}>
                      <View
                        key={index}
                        style={{ width: '100%', paddingVertical: 3 * width }}>
                        <View
                          style={{
                            width: '100%',
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                          }}>
                          <View
                            style={{
                              width: '25%',
                              height: 8 * width,
                              borderWidth: 1,
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderColor: '#DEDEDE',
                              borderBottomColor: isIncorrect ? '#EC142A' : (isPending ? '#FED402' : '#DEDEDE'),
                            }}>
                            <Text
                              style={{
                                fontSize: 3.2 * width,
                                color: ColorCode.grey888,
                                fontFamily: Fonts.Regular,
                              }}>
                              {`${0} pts Poor`}
                            </Text>
                            {isIncorrect && (
                              <View
                                style={{
                                  width: '100%',
                                  height: 2,
                                  position: 'absolute',
                                  bottom: 0,
                                  backgroundColor: '#EC142A',
                                }}
                              />
                            )}
                            {isPending && (
                              <View
                                style={{
                                  width: '100%',
                                  height: 2,
                                  position: 'absolute',
                                  bottom: 0,
                                  backgroundColor: '#FED402',
                                }}
                              />
                            )}
                          </View>

                          <View
                            style={{
                              width: '25%',
                              height: 8 * width,
                              marginStart: 3 * width,
                              borderWidth: 1,
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderColor: '#DEDEDE',
                              borderBottomColor: isCorrectForDisplay ? '#008A3D' : '#DEDEDE',
                            }}>
                            <Text
                              style={{
                                fontSize: 3 * width,
                                color: ColorCode.grey888,
                                fontFamily: Fonts.Bold,
                              }}>
                              {`${item.points || 0} pts Good`}
                            </Text>
                            {isCorrectForDisplay && (
                              <View
                                style={{
                                  width: '100%',
                                  height: 2,
                                  position: 'absolute',
                                  bottom: 0,
                                  backgroundColor: '#008A3D',
                                }}
                              />
                            )}
                          </View>
                        </View>
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginTop: 2 * width,
                          flexWrap: 'wrap'
                        }}>
                          <Text
                            style={{
                              fontFamily: Fonts.SemiBold,
                              fontSize: 3.8 * width,
                              color: ColorCode.black,
                              flexShrink: 1
                            }}>
                            {`Q ${index + 1} : ${item.question_text || item.text || ''}`}
                          </Text>
                        </View>
                      </View>

                      {/* All Options */}
                      <View
                        style={{
                          width: '100%',
                          marginTop: 3 * width,
                        }}>
                        {isTextQuestion && userSubmittedAnswerText ? (
                          // For text questions, show the user's submitted answer
                          <View
                            style={{ flex: 1, paddingVertical: 1 * width }}>
                            <Text style={{
                              fontSize: 2.8 * width,
                              color: '#666',
                              marginBottom: 1 * width,
                              fontFamily: Fonts.Medium
                            }}>Your Answer:</Text>
                            <View
                              style={{
                                width: '100%',
                                paddingVertical: 2 * width,
                                borderRadius: 2 * width,
                                borderWidth: 1,
                                paddingHorizontal: 3 * width,
                                borderColor: isPending ? '#FED402' : (isCorrectForDisplay ? '#008A3D' : '#EC142A'),
                              }}>
                              <Text
                                style={{
                                  flex: 1,
                                  fontSize: 3.8 * width,
                                  color: isPending ? '#FED402' : (isCorrectForDisplay ? '#008A3D' : '#EC142A'),
                                  fontFamily: Fonts.Regular,
                                }}>
                                {userSubmittedAnswerText}
                              </Text>
                            </View>
                          </View>
                        ) : (
                          // For non-text questions, show all options
                          item.options.map((ans, index1) => {
                            // Check if this option was submitted using the same helper function
                            const isSubmitted = isOptionSubmitted(ans.id, submittedOptionsArray);
                            const isCorrect = ans.is_correct == 1 || ans.is_correct === true || ans.is_correct === '1';

                            // Only show correct/wrong for user's selected option
                            // Unselected options just show in gray
                            let borderColor = '#DEDEDE';
                            let textColor = '#333333';

                            if (isSubmitted) {
                              // Respect final reviewed question status first.
                              if (isPending) {
                                borderColor = '#FED402';
                                textColor = '#FED402';
                              } else if (isIncorrect) {
                                borderColor = '#EC142A';
                                textColor = '#EC142A';
                              } else if (!hasMultiSelectViolation && isCorrect) {
                                borderColor = '#008A3D';
                                textColor = '#008A3D';
                              } else {
                                borderColor = '#EC142A';
                                textColor = '#EC142A';
                              }
                            } else {
                              // Not selected by user - show in gray
                              borderColor = '#DEDEDE';
                              textColor = '#333333';
                            }

                            return (
                              <View
                                key={index1}
                                style={{ flex: 1, paddingVertical: 1 * width }}>
                                {quizData?.quiz_type != 'Abbreviation' ? (
                                  <View
                                    style={{
                                      width: '100%',
                                      paddingVertical: 2 * width,
                                      borderRadius: 2 * width,
                                      borderWidth: 1,
                                      paddingHorizontal: 3 * width,
                                      borderColor,
                                    }}>
                                    <Text
                                      style={{
                                        flex: 1,
                                        fontSize: 3.8 * width,
                                        color: textColor,
                                        fontFamily: Fonts.Regular,
                                      }}>
                                      {`${ans.option_text}`}
                                    </Text>
                                  </View>
                                ) : (
                                  <View
                                    style={{
                                      width: '100%',
                                      // flexDirection: 'row',
                                      paddingVertical: 2 * width,
                                      // alignItems: 'center',
                                      borderRadius: 2 * width,
                                      borderWidth: 1,
                                      paddingHorizontal: 3 * width,
                                      borderColor: borderColor,
                                    }}>
                                    <Text
                                      style={{
                                        flex: 1,
                                        fontSize: 3.8 * width,
                                        color: textColor,
                                        fontFamily: Fonts.Regular,
                                      }}>
                                      {item.text_answer && item.text_answer.length > 0
                                        ? `${item.text_answer[0]}`
                                        : `${ans.option_text}`}
                                    </Text>
                                  </View>
                                )}
                              </View>
                            );
                          })
                        )}
                      </View>
                      <Text
                        style={{
                          marginTop: 2 * width,
                          fontFamily: Fonts.Medium,
                          fontSize: 3.2 * width,
                          color: isPending ? '#FED402' : (isCorrectForDisplay ? '#16763E' : '#EC142A'),
                        }}>
                        {isPending ? 'Under review' : (isCorrectForDisplay ? 'Your answer is correct' : 'Your answer is incorrect')}
                      </Text>
                    </View>
                  );
                }}
                ItemSeparatorComponent={() => <View style={{ width: '100%', height: 1, backgroundColor: '#DDDDDD' }} />}
              />
            )}
          </View>
          <CustomProgress show={showProgress} />
        </CustomSAView>
      </SafeAreaView>
    </Provider>
  );
};

export default OnlineQuizResultScreen;
