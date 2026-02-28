import React, { Fragment, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Modal, Provider } from 'react-native-paper';
import CustomSAView from '../../../compenents/CustomSAView';
import CustomStatus from '../../../compenents/CustomStatus';
import HeaderWithBack from '../../../compenents/HeaderWithBack';
import width from '../../../Units/width';
import ColorCode from '../../../utility/ColorCode';
import Fonts from '../../../utility/Fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ConstData from '../../../utility/ConstData';
import ToastUtility from '../../../utility/ToastUtility';
import ApiMethod from '../../../api/ApiMethod';
import CustomProgress from '../../../compenents/CustomProgress';
import FastImage from 'react-native-fast-image';
import CustomButton from '../../../compenents/CustomButton';
import ConfettiCannon from 'react-native-confetti-cannon';
import height from '../../../Units/height';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CustomHeader from '../../../compenents/CustomHeader';
import { CommonActions } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const OnlineQuizScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const [postData, setPost] = useState(route.params.post);
  const [allSyllabusData, setAllSyllabusData] = useState(route.params.data);
  const [syllabusData, setSyllabusData] = useState(allSyllabusData?.quiz || {});
  const [syllabusQuiz, setSyllabusQuiz] = useState(syllabusData?.questions || []);
  const [submitedAnswers, setSubmitedAnswers] = useState([]);
  const [totalAttempt, setTotalAttempt] = useState(
    route.params.totalAttempt || 0,
  );
  const [currentQuizPos, setCurrentQuizPos] = useState(0);
  const [selectedTempAns, setSelectedTempAns] = useState(null);
  const [selectedTempAnsArr, setSelectedTempAnsArr] = useState([]);
  const [inputTempAns, setInputTempAns] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(syllabusQuiz[currentQuizPos]);
  const [showProgress, setShowProgress] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showLeaveQuizModal, setShowLeaveQuizModal] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [correctAnsCount1, setCorrectAnsCount1] = useState(0);
  const [quizResult, setQuizResult] = useState({
    correct: 0,
    total: 0,
    percentage: 0,
    mcq_stats: { total: 0, correct: 0, incorrect: 0 },
    text_stats: { total: 0, correct: 0, incorrect: 0 }
  });
  const isSubmittingRef = useRef(false);
  const pendingNavigationActionRef = useRef(null);
  const isLeavingQuizRef = useRef(false);
  const questionPosRef = useRef(null);
  // console.log('syllabusData ==>>    ', JSON.stringify(syllabusData));
  // console.log('submitedAnswers ==>>    ', JSON.stringify(submitedAnswers));
  console.log('totalAttempt ==>>    ', JSON.stringify(totalAttempt));

  useEffect(() => {
    console.log('useEffect triggered - submitedAnswers length:', submitedAnswers.length);
    console.log('syllabusQuiz length:', syllabusQuiz?.length);
    console.log('currentQuizPos:', currentQuizPos);
    console.log('isSubmitting:', isSubmittingRef.current);

    // Prevent duplicate submissions
    if (submitedAnswers.length == syllabusQuiz.length && !isSubmittingRef.current && syllabusQuiz.length > 0) {
      console.log('All questions answered - calling submitAllAnswers');
      isSubmittingRef.current = true;
      submitAllAnswers();
    } else {
      if (submitedAnswers[currentQuizPos]) {
        console.log('currentQuizPos', currentQuizPos);
        if (syllabusQuiz[currentQuizPos].question_type == 'MCQ_TEXT') {
          setInputTempAns(submitedAnswers[currentQuizPos].id);
        } else {
          setSelectedTempAns(submitedAnswers[currentQuizPos]);
          setSelectedTempAnsArr(submitedAnswers[currentQuizPos]);
        }
      } else if (currentQuizPos < syllabusQuiz?.length) {
        if (syllabusQuiz[currentQuizPos].question_type == 'MCQ_TEXT') {
          setInputTempAns('');
        } else {
          setSelectedTempAns(null);
          setSelectedTempAnsArr([]);
        }
      }
    }
  }, [submitedAnswers, currentQuizPos]);

  const submitAllAnswers = () => {
    console.log('submitAllAnswers called');
    console.log('submitedAnswers:', submitedAnswers);
    console.log('syllabusQuiz:', syllabusQuiz);

    Keyboard.dismiss();

    const payload = {
      quiz_bank_id:
        allSyllabusData?.quiz_bank_id ||
        postData?.quiz_bank_id ||
        allSyllabusData?.quiz?.quiz_bank_id ||
        allSyllabusData?.quiz?.id ||
        syllabusData?.quiz_bank_id ||
        postData?.quiz_bank_id ||
        0,
      syllabus_id:
        allSyllabusData?.syllabus_id ||
        postData?.syllabus_id ||
        allSyllabusData?.id ||
        0,
      answer_type:
        syllabusQuiz[0]?.question_type === 'MCQ_TEXT'
          ? 'text'
          : 'choice',
    };

    submitedAnswers.forEach((answer, index) => {
      const question = syllabusQuiz[index];
      if (!question) {
        return;
      }
      const questionKey = `question_id[${question.id}]`;

      if (question.question_type === 'MCQ_TEXT') {
        const textValue =
          typeof answer === 'string'
            ? answer
            : Array.isArray(answer?.text_answer)
              ? answer.text_answer.join(',')
              : answer?.id || '';
        payload[questionKey] = textValue;
      } else {
        // Handle multiple selected options
        const optionIds = Array.isArray(answer)
          ? answer.map(option => option.id)
          : answer?.id
            ? [answer.id]
            : [];
        // Join multiple option IDs with comma (e.g., "1118,1117")
        payload[questionKey] = optionIds.join(',');
        console.log(`Question ${question.id}: Selected ${optionIds.length} option(s) - ${optionIds.join(',')}`);
      }
    });

    console.log('Submit payload:', JSON.stringify(payload, null, 2));
    setShowProgress(true);
    ApiMethod.submitAllAnswers(
      payload,
      pass => {
        console.log('========== QUIZ SUBMISSION SUCCESS ==========');
        console.log('Full API Response:', JSON.stringify(pass, null, 2));
        console.log('Response Status:', pass?.status);
        console.log('Response Message:', pass?.message);
        console.log('Correct Answers:', pass?.correct);
        console.log('Total Questions:', pass?.total_questions);
        console.log('Percentage:', pass?.percentage);
        console.log('Response Data:', pass?.data);
        console.log('============================================');

        setShowProgress(false);
        isSubmittingRef.current = false;
        setShowConfetti(true);

        const correctAnswerCount =
          pass?.correct ??
          submitedAnswers.filter(ans => ans.is_correct === 1).length;
        const totalQuestions = syllabusQuiz.length || pass?.total_questions || 1;
        const percentage =
          pass?.percentage ??
          Math.round((correctAnswerCount / totalQuestions) * 100);

        console.log('Calculated Results:');
        console.log('- Correct Answer Count:', correctAnswerCount);
        console.log('- Total Questions:', totalQuestions);
        console.log('- Percentage:', percentage);

        // Store quiz result for display with separate MCQ and text stats
        setQuizResult({
          correct: correctAnswerCount,
          total: totalQuestions,
          percentage: percentage,
          mcq_stats: pass?.mcq_stats || { total: 0, correct: 0, incorrect: 0 },
          text_stats: pass?.text_stats || { total: 0, correct: 0, incorrect: 0 }
        });

        // Removed: Next Step Unlocked modal
        // if (percentage >= 70) {
        //   setTimeout(() => {
        //     setTotalAttempt(totalAttempt);
        //     setShowNextStePopup(true);
        //   }, 4000);
        // }
        ToastUtility.showToast(pass?.message || 'Quiz submitted successfully.');
      },
      fail => {
        console.log('========== QUIZ SUBMISSION FAILED ==========');
        console.log('Full Error Response:', JSON.stringify(fail, null, 2));
        console.log('Error Status:', fail?.status);
        console.log('Error Message:', fail?.message);
        console.log('Error Data:', fail?.data);
        console.log('Error Details:', fail?.error);
        console.log('===========================================');

        setShowProgress(false);
        isSubmittingRef.current = false;
        ToastUtility.showToast(fail?.message || 'Failed to submit quiz.');
      },
    );
  };

  const updateAnswer = item => {
    var t1 = [...selectedTempAnsArr];

    if (selectedTempAnsArr.includes(item)) {
      var pos = selectedTempAnsArr.indexOf(item);
      t1.splice(pos, 1);
    } else {
      t1.push(item);
    }

    setSelectedTempAnsArr(t1);
  };

  const getCorrectAndPercentage = () => {
    var perc = (correctAnsCount1 / syllabusQuiz.length) * 100;
    // var perc =
    //   (submitedAnswers.filter(ans => {
    //     var c = syllabusQuiz.find(q => q.id == ans[0][0].question_id);
    //     console.log("c", c);
    //     ans.every(an => an.is_correct == 1);
    //   }).length /
    //     syllabusQuiz.length) *
    //   100;

    console.log('getCorrectAndPercentage', parseInt(perc));
    return parseInt(perc);
  };

  const closeQuizResultPopup = () => {
    setShowConfetti(false);
    const navState = navigation.getState?.();
    const routes = navState?.routes || [];
    const previousRoute = routes.length > 1 ? routes[routes.length - 2] : null;

    if (previousRoute?.key) {
      navigation.dispatch({
        ...CommonActions.setParams({ refreshFromQuiz: Date.now() }),
        source: previousRoute.key,
      });
    }

    navigation.goBack();
  };

  const requestLeaveQuiz = action => {
    pendingNavigationActionRef.current = action || CommonActions.goBack();
    setShowLeaveQuizModal(true);
  };

  const cancelLeaveQuiz = () => {
    setShowLeaveQuizModal(false);
    pendingNavigationActionRef.current = null;
  };

  const confirmLeaveQuiz = () => {
    setShowLeaveQuizModal(false);
    const action = pendingNavigationActionRef.current || CommonActions.goBack();
    pendingNavigationActionRef.current = null;
    isLeavingQuizRef.current = true;
    navigation.dispatch(action);
  };

  const handleBackPress = () => {
    if (showConfetti) {
      navigation.goBack();
      return;
    }
    requestLeaveQuiz(CommonActions.goBack());
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      if (showConfetti || isLeavingQuizRef.current) {
        return;
      }
      e.preventDefault();
      requestLeaveQuiz(e.data.action);
    });

    return unsubscribe;
  }, [navigation, showConfetti]);

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return;
    }

    const showSub = Keyboard.addListener('keyboardWillShow', e => {
      setKeyboardHeight(e?.endCoordinates?.height || 0);
    });
    const hideSub = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const correctAnsCount = () => {
    // var perc = submitedAnswers.filter(ans =>{
    //   ans.every(an => an.is_correct == 1);
    // }
    // ); ;
    console.log('correctAnsCount', correctAnsCount1);
    return correctAnsCount1;
  };

  const incorrectAnsCount = () => {
    // var perc = submitedAnswers.filter(
    //   ans => ans.filter(an => an.is_correct == 0).length > 0,
    // );

    var perc = syllabusQuiz.length - correctAnsCount1;

    console.log('incorrectAnsCount', perc);
    return perc;
  };

  // Check if we have valid quiz data
  if (!allSyllabusData || !allSyllabusData.quiz || !syllabusQuiz || syllabusQuiz.length === 0) {
    return (
      <Provider>
        <View style={{ flex: 1, backgroundColor: ColorCode.white }}>
          <CustomStatus trans={true} isDark={false} color="#FFFFFF00" />
          <CustomSAView
            parentStyple={{ flex: 1, backgroundColor: ColorCode.transarent }}
            style={{ flex: 1, backgroundColor: ColorCode.transarent }}>
            <CustomHeader text={'Quiz Error'} customStyle={{ marginTop: 0 }} />
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
              <Text style={{ fontSize: 18, color: ColorCode.black, textAlign: 'center' }}>
                No quiz data available. Please try again.
              </Text>
              <TouchableOpacity
                style={{
                  marginTop: 20,
                  padding: 15,
                  backgroundColor: ColorCode.primary,
                  borderRadius: 8,
                }}
                onPress={handleBackPress}>
                <Text style={{ color: ColorCode.white, fontSize: 16 }}>Go Back</Text>
              </TouchableOpacity>
            </View>
          </CustomSAView>
        </View>
      </Provider>
    );
  }

  return (
    <Provider>
      <View
        style={{
          flex: 1,
          backgroundColor: ColorCode.white,
        }}>
        <CustomStatus trans={true} isDark={false} color="#FFFFFF00" />


        <CustomSAView
          parentStyple={{ flex: 1, backgroundColor: ColorCode.transarent }}
          style={{ flex: 1, backgroundColor: ColorCode.transarent }}>
          {!showConfetti && (
            <CustomHeader
              text={
                allSyllabusData?.quiz?.title ||
                allSyllabusData?.title ||
                syllabusData?.title ||
                postData?.title ||
                'Start Quiz'
              }
              customStyle={{ marginTop: 0 }}
            />
          )}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? undefined : 'height'}
            style={{ flex: 1 }}>
            <View
              style={{
                flex: 1,
                paddingHorizontal: 3 * width,
                backgroundColor: ColorCode.white,
              }}>
              <View
                style={{
                  width: '100%',
                  // paddingHorizontal: 3 * width,
                  flexDirection: 'row',
                }}>
                {/* <ScrollView ref={questionPosRef} horizontal showsHorizontalScrollIndicator={false}>
                {syllabusQuiz.map((iem, index) => (
                  
                ))}
              </ScrollView> */}
                <FlatList
                  ref={questionPosRef}
                  horizontal
                  data={syllabusQuiz}
                  renderItem={({ item, index }) => (
                    <View key={index} style={{}}>
                      <LinearGradient
                        style={{
                          height: 10 * width,
                          width: 10 * width,
                          borderRadius: 6 * width,
                          marginHorizontal: 2 * width,
                          marginVertical: 4 * width,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        useAngle={true}
                        angle={135}
                        colors={
                          currentQuizPos == index
                            ? [ColorCode.primary, '#83b1fc']
                            : ['#D4D4D4', '#D4D4D4']
                        }>
                        <Text
                          style={{
                            fontSize: 4 * width,
                            color: ColorCode.white,
                            fontFamily: Fonts.Bold,
                          }}>
                          {`${index + 1}`}
                        </Text>
                      </LinearGradient>
                      <LinearGradient
                        style={{
                          width: '100%',
                          height: 3,
                        }}
                        colors={
                          currentQuizPos == index
                            ? [ColorCode.primary, '#83b1fc']
                            : ['#D4D4D4', '#D4D4D4']
                        }
                      />
                    </View>
                  )}
                />
              </View>
              <KeyboardAwareScrollView
                style={{ flex: 1 }}
                enableOnAndroid={true}
                keyboardShouldPersistTaps="handled"
                extraScrollHeight={Platform.OS === 'ios' ? 3 * width : 0}
                contentContainerStyle={{
                  paddingBottom: Platform.OS === 'ios' ? insets.bottom + (18 * width) : width * 20,
                }}>
                <Pressable
                  style={{ flex: 1, padding: 4 * width }}
                  onPress={() => Keyboard.dismiss()}>
                  <Text
                    style={{
                      fontSize: 3.8 * width,
                      color: ColorCode.black,
                      fontFamily: Fonts.SemiBold,
                      textAlign: 'right',
                    }}>
                    {`Mark : `}
                    <Text
                      style={{
                        fontSize: 3.8 * width,
                        color: ColorCode.black,
                        fontFamily: Fonts.SemiBold,
                      }}>
                      {`${currentQuestion.points}`}
                    </Text>
                  </Text>

                  <Text
                    style={{
                      fontSize: 3.8 * width,
                      color: ColorCode.black,
                      fontFamily: Fonts.SemiBold,
                      marginTop: 2 * width,
                    }}>
                    {`Question ${currentQuizPos + 1} : `}
                    <Text
                      style={{
                        fontSize: 3.8 * width,
                        color: ColorCode.grey888,
                        fontFamily: Fonts.Regular,
                      }}>
                      {`${currentQuestion.question_text}`}
                    </Text>
                  </Text>

                  {currentQuestion.question_type == 'MCQ_TEXT' ? (
                    <View style={{ width: '100%', marginTop: 3 * width }}>
                      <TextInput
                        style={{
                          width: '100%',
                          height: 50 * width,
                          borderRadius: 2 * width,
                          borderColor: ColorCode.greyDDD,
                          borderWidth: 1,
                          paddingHorizontal: 3 * width,
                          paddingVertical: 2 * width,
                          fontSize: 3.4 * width,
                          fontFamily: Fonts.Regular,
                          color: ColorCode.black,
                          textAlignVertical: 'top',
                        }}
                        multiline={true}
                        value={inputTempAns}
                        onChangeText={t => {
                          setInputTempAns(t);
                        }}
                      />
                    </View>
                  ) : (
                    <View style={{ width: '100%', marginTop: 3 * width }}>
                      {currentQuestion.options.map((item, index) => {
                        console.log('options  ==>>    ', JSON.stringify(item));
                        return (
                          <View key={index}>
                            <TouchableOpacity
                              style={{
                                width: '100%',
                                flexDirection: 'row',
                                paddingVertical: 2 * width,
                                alignItems: 'center',
                              }}
                              onPress={() => {
                                // setSelectedTempAns(item);
                                updateAnswer(item);
                              }}>
                              <LinearGradient
                                style={{
                                  height: 10 * width,
                                  width: 10 * width,
                                  borderRadius: 6 * width,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                                useAngle={true}
                                angle={135}
                                colors={
                                  // selectedTempAns?.id == item.id
                                  selectedTempAnsArr.includes(item)
                                    ? ['#008A3D', '#9DFFC8']
                                    : ['#D4D4D4', '#D4D4D4']
                                }>
                                <Text
                                  style={{
                                    fontSize: 4 * width,
                                    color: ColorCode.white,
                                    fontFamily: Fonts.Bold,
                                  }}>
                                  {`${ConstData.AlphabetAray[index]}`}
                                </Text>
                              </LinearGradient>
                              <Text
                                style={{
                                  flex: 1,
                                  marginStart: 3 * width,
                                  fontSize: 3.8 * width,
                                  color:
                                    // selectedTempAns?.id == item.id
                                    selectedTempAnsArr.includes(item)
                                      ? '#008A3D'
                                      : '#333333',
                                  fontFamily: Fonts.Regular,
                                }}>
                                {`${item.option_text}`}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </Pressable>
              </KeyboardAwareScrollView>
              <View
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingHorizontal: 2 * width,
                  paddingTop: 2 * width,
                  paddingBottom: Math.max(insets.bottom, 2 * width),
                  marginBottom:
                    Platform.OS === 'ios'
                      ? Math.max(0, keyboardHeight - insets.bottom)
                      : 0,
                  backgroundColor: ColorCode.white,
                }}>
                {currentQuizPos > 0 && (
                  <TouchableOpacity
                    style={{
                      width: '40%',
                      height: 12 * width,
                      backgroundColor: ColorCode.white,
                      borderRadius: 2 * width,
                      borderWidth: 1,
                      borderColor: ColorCode.primary,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginEnd: 4 * width,
                    }}
                    onPress={() => {
                      // setSubmitedAnswers(null);
                      setCurrentQuestion(syllabusQuiz[currentQuizPos - 1]);
                      setCurrentQuizPos(currentQuizPos - 1);
                      if (
                        syllabusQuiz[currentQuizPos - 1].question_type ==
                        'MCQ_TEXT'
                      ) {
                        setInputTempAns(submitedAnswers[currentQuizPos - 1].id);
                      } else {
                        setSelectedTempAns(submitedAnswers[currentQuizPos - 1]);
                      }

                      questionPosRef.current.scrollToIndex({
                        index: currentQuizPos - 1,
                        animated: true,
                      });
                    }}>
                    <Ionicons
                      name="chevron-back"
                      size={5 * width}
                      color={ColorCode.primary}
                    // style={{position: 'absolute', start: 5 * width}}
                    />
                    <Text
                      style={{
                        marginEnd: 3 * width,
                        marginStart: 5 * width,
                        fontSize: 3.8 * width,
                        color: ColorCode.primary,
                        fontFamily: Fonts.SemiBold,
                      }}>
                      {`Back`}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={{
                    flex: 1,
                    height: 12 * width,
                    backgroundColor: ColorCode.primary,
                    borderRadius: 2 * width,
                    borderWidth: 1,
                    borderColor: ColorCode.primary,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => {
                    console.log('Button pressed - currentQuizPos:', currentQuizPos);
                    console.log('syllabusQuiz length:', syllabusQuiz?.length);
                    console.log('Is last question:', currentQuizPos == syllabusQuiz?.length - 1);

                    if (currentQuestion.question_type == 'MCQ_TEXT') {
                      if (inputTempAns != '') {
                        console.log(
                          'Find some',
                          submitedAnswers.some(ans => ans.id == inputTempAns),
                        );

                        var tepp = inputTempAns;
                        console.log('tepp', tepp);
                        console.log(
                          'currentQuestion.options',
                          currentQuestion.options,
                        );

                        // FIX: Create a new answer object instead of modifying options[0] which might be undefined
                        // Also improve correctness check
                        let isCorrect = false;
                        let possibleAnswers = [];

                        // Try to get possible correct answers from various properties
                        if (currentQuestion.options && currentQuestion.options.length > 0) {
                          // If options exist, check for is_correct flag or collect option_text
                          const correctOpts = currentQuestion.options.filter(opt => opt.is_correct == 1 || opt.is_correct === true || opt.is_correct === '1');
                          if (correctOpts.length > 0) {
                            possibleAnswers = correctOpts.map(opt => opt.option_text);
                          } else {
                            // If no option marked correct, use the first option's text (legacy behavior?)
                            possibleAnswers = [currentQuestion.options[0].option_text];
                          }
                        }

                        // Also check question.answer or question.answer_text or direct text_answer logic
                        if (currentQuestion.answer) possibleAnswers.push(currentQuestion.answer);
                        if (currentQuestion.answer_text) possibleAnswers.push(currentQuestion.answer_text);

                        // Normalize and split comma-separated answers
                        const normalizedPossibleAnswers = [];
                        possibleAnswers.forEach(ans => {
                          if (typeof ans === 'string') {
                            ans.split(',').forEach(part => normalizedPossibleAnswers.push(part.trim().toLowerCase()));
                          }
                        });

                        const userAns = tepp.trim().toLowerCase();
                        isCorrect = normalizedPossibleAnswers.includes(userAns);

                        console.log('Correct', isCorrect);

                        const ans11 = {
                          id: tepp,
                          option_text: tepp,
                          question_type: 'MCQ_TEXT',
                          is_correct: isCorrect ? 1 : 0,
                          question_id: currentQuestion.id
                        };

                        if (isCorrect) {
                          setCorrectAnsCount1(correctAnsCount1 + 1);
                        }

                        if (submitedAnswers.length == 0) {
                          console.log('1111');
                          setSubmitedAnswers([ans11]);
                        } else if (submitedAnswers[currentQuizPos]) {
                          console.log('22222');
                          var t1 = [...submitedAnswers];
                          t1[currentQuizPos] = ans11;
                          setSubmitedAnswers(t1);
                        } else {
                          console.log('33333');
                          setSubmitedAnswers(prevState => [...prevState, ans11]);
                        }

                        if (currentQuizPos + 1 < syllabusQuiz?.length) {
                          setCurrentQuestion(syllabusQuiz[currentQuizPos + 1]);
                          setCurrentQuizPos(currentQuizPos + 1);
                          questionPosRef.current.scrollToIndex({
                            index: currentQuizPos + 1,
                            animated: true,
                          });
                        }
                      } else {
                        ToastUtility.showToast('Write your answer to proceed');
                      }
                    } else {
                      if (selectedTempAnsArr.length > 0) {
                        console.log(
                          'Find some',
                          submitedAnswers.some(ans => ans == selectedTempAnsArr),
                        );

                        var corC = currentQuestion.options.filter(
                          q => q.is_correct == 1,
                        ).length;
                        var selC = selectedTempAnsArr.every(
                          ans => ans.is_correct == 1,
                        );

                        console.log(selectedTempAnsArr.length, selC, corC);

                        if (corC == selectedTempAnsArr.length && selC) {
                          setCorrectAnsCount1(correctAnsCount1 + 1);
                          console.log('Correct');
                        }

                        var tepp = selectedTempAnsArr;
                        console.log('tepp', tepp);
                        if (submitedAnswers.length == 0) {
                          console.log('1111');
                          setSubmitedAnswers([tepp]);
                        } else if (submitedAnswers[currentQuizPos]) {
                          console.log('22222');
                          var t1 = [...submitedAnswers];
                          t1[currentQuizPos] = tepp;
                          setSubmitedAnswers(t1);
                        } else {
                          console.log('33333');
                          setSubmitedAnswers(prevState => [...prevState, tepp]);
                        }

                        if (currentQuizPos + 1 < syllabusQuiz?.length) {
                          setCurrentQuestion(syllabusQuiz[currentQuizPos + 1]);
                          setCurrentQuizPos(currentQuizPos + 1);
                          questionPosRef.current.scrollToIndex({
                            index: currentQuizPos + 1,
                            animated: true,
                          });
                        }
                      } else {
                        ToastUtility.showToast('Select an answer to proceed');
                      }
                    }
                  }}>
                  <Text
                    style={{
                      fontSize: 3.8 * width,
                      color: ColorCode.white,
                      fontFamily: Fonts.SemiBold,
                      marginEnd: 4 * width,
                      marginStart: 3 * width,
                    }}>
                    {currentQuizPos == syllabusQuiz?.length - 1
                      ? 'Save & Submit'
                      : `Save & Next`}
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={5 * width}
                    color={ColorCode.white}
                  // style={{position: 'absolute', start: 5 * width}}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </CustomSAView>
      </View>

      <Modal
        visible={showConfetti}
        dismissable={false}
        onDismiss={() => {
          setShowConfetti(false);
        }}>
        <ImageBackground
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'white',
          }}>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {(() => {
              const percentage = quizResult.percentage ?? getCorrectAndPercentage();
              const isPassing = percentage >= 70;

              return isPassing ? (
                <View style={{ flex: 1 }}>
                  <FastImage
                    source={require('../../../assets/cup.gif')}
                    style={{
                      width: 80 * width,
                      height: 85 * width,
                      marginTop: 5 * width,
                    }}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                  <Text
                    style={{
                      fontSize: 8 * width,
                      color: ColorCode.white,
                      fontFamily: Fonts.SemiBold,
                      position: 'absolute',
                      paddingStart: 30 * width,
                      paddingTop: 37 * width,
                    }}>
                    {`${ConstData.getGradeValue(percentage)}`}
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <FastImage
                    source={require('../../../assets/fail.gif')}
                    style={{
                      width: 38 * width,
                      height: 38 * width,
                      marginTop: 5 * width,
                    }}
                    resizeMode={FastImage.resizeMode.contain}
                  />
                </View>
              );
            })()}
          </View>

          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {(() => {
              const percentage = quizResult.percentage ?? getCorrectAndPercentage();
              const isPassing = percentage >= 70;
              const grade = ConstData.getGradeValue(percentage);

              return (
                <>
                  <Text
                    style={{
                      fontSize: 7 * width,
                      color: ColorCode.black,
                      fontFamily: Fonts.SemiBold,
                      textAlign: 'center',
                    }}>
                    {isPassing
                      ? `Congratulation!`
                      : `Don't Give Up,\n You're Improving!`}
                  </Text>
                  <Text
                    style={{
                      width: '80%',
                      textAlign: 'center',
                      fontSize: 3.4 * width,
                      color: ColorCode.black,
                      fontFamily: Fonts.Regular,
                      lineHeight: 4 * width,
                      marginTop: 1 * width,
                    }}>
                    {isPassing
                      ? `You got Grade ${grade} (${percentage.toFixed(2)}%)!`
                      : `You got Grade ${grade} - ${percentage.toFixed(2)}% -- keep pushing forward!`}
                  </Text>

                  <View
                    style={{
                      width: '80%',
                      padding: 3 * width,
                      borderRadius: 3 * width,
                      backgroundColor: ColorCode.primary,
                      marginTop: 6 * width,
                      marginBottom: 4 * width,
                    }}>
                    {/* Overall Questions Count */}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingBottom: 2 * width,
                        marginBottom: 2 * width,
                        borderBottomWidth: 1,
                        borderBottomColor: '#fff',
                      }}>
                      <Ionicons name="star-outline" size={5 * width} color="#fff" />
                      <Text
                        style={{
                          fontSize: 3.4 * width,
                          color: '#fff',
                          fontFamily: Fonts.Bold,
                          marginLeft: 2 * width,
                        }}>
                        {`TOTAL QUESTIONS: ${(quizResult.mcq_stats?.total || 0) + (quizResult.text_stats?.total || 0)}`}
                      </Text>
                    </View>

                    {/* MCQ Stats */}
                    {(quizResult.mcq_stats?.total || 0) > 0 && (
                      <View
                        style={{
                          marginBottom: 2 * width,
                          paddingBottom: 2 * width,
                          borderBottomWidth: 1,
                          borderBottomColor: 'rgba(255,255,255,0.3)',
                        }}>
                        <Text
                          style={{
                            fontSize: 3.2 * width,
                            color: '#B8D4F0',
                            fontFamily: Fonts.SemiBold,
                            marginBottom: 1.5 * width,
                          }}>
                          MCQ Questions
                        </Text>
                        <View style={{ flexDirection: 'row' }}>
                          <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text
                              style={{
                                fontSize: 2.8 * width,
                                color: '#B8D4F0',
                                fontFamily: Fonts.Regular,
                              }}>
                              TOTAL
                            </Text>
                            <Text
                              style={{
                                fontSize: 3.4 * width,
                                color: '#fff',
                                fontFamily: Fonts.Bold,
                                marginTop: 0.5 * width,
                              }}>
                              {quizResult.mcq_stats?.total || 0}
                            </Text>
                          </View>
                          <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />
                          <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text
                              style={{
                                fontSize: 2.8 * width,
                                color: '#B8D4F0',
                                fontFamily: Fonts.Regular,
                              }}>
                              CORRECT
                            </Text>
                            <Text
                              style={{
                                fontSize: 3.4 * width,
                                color: '#fff',
                                fontFamily: Fonts.Bold,
                                marginTop: 0.5 * width,
                              }}>
                              {quizResult.mcq_stats?.correct || 0}
                            </Text>
                          </View>
                          <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />
                          <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text
                              style={{
                                fontSize: 2.8 * width,
                                color: '#B8D4F0',
                                fontFamily: Fonts.Regular,
                              }}>
                              INCORRECT
                            </Text>
                            <Text
                              style={{
                                fontSize: 3.4 * width,
                                color: '#fff',
                                fontFamily: Fonts.Bold,
                                marginTop: 0.5 * width,
                              }}>
                              {quizResult.mcq_stats?.incorrect || 0}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Text Stats */}
                    {(quizResult.text_stats?.total || 0) > 0 && (
                      <View>
                        <Text
                          style={{
                            fontSize: 3.2 * width,
                            color: '#B8D4F0',
                            fontFamily: Fonts.SemiBold,
                            marginBottom: 1.5 * width,
                          }}>
                          Text Questions
                        </Text>
                        <View style={{ flexDirection: 'row' }}>
                          <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text
                              style={{
                                fontSize: 2.8 * width,
                                color: '#B8D4F0',
                                fontFamily: Fonts.Regular,
                              }}>
                              TOTAL
                            </Text>
                            <Text
                              style={{
                                fontSize: 3.4 * width,
                                color: '#fff',
                                fontFamily: Fonts.Bold,
                                marginTop: 0.5 * width,
                              }}>
                              {quizResult.text_stats?.total || 0}
                            </Text>
                          </View>
                          <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />
                          <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text
                              style={{
                                fontSize: 2.8 * width,
                                color: '#B8D4F0',
                                fontFamily: Fonts.Regular,
                              }}>
                              CORRECT
                            </Text>
                            <Text
                              style={{
                                fontSize: 3.4 * width,
                                color: '#fff',
                                fontFamily: Fonts.Bold,
                                marginTop: 0.5 * width,
                              }}>
                              {quizResult.text_stats?.correct || 0}
                            </Text>
                          </View>
                          <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />
                          <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text
                              style={{
                                fontSize: 2.8 * width,
                                color: '#B8D4F0',
                                fontFamily: Fonts.Regular,
                              }}>
                              UNDER-REVIEW
                            </Text>
                            <Text
                              style={{
                                fontSize: 3.4 * width,
                                color: '#fff',
                                fontFamily: Fonts.Bold,
                                marginTop: 0.5 * width,
                              }}>
                              {quizResult.text_stats?.incorrect || 0}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                </>
              );
            })()}
          </View>

          {/* {getCorrectAndPercentage() >= 70 && ( */}
          <View
            style={{
              flex: 0.4,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              paddingHorizontal: 2 * width,
            }}>
            <CustomButton
              btnText="Close"
              colors={['#E3E7F6', '#E3E7F6']}
              enable={true}
              btnStyle={{
                flex: 1,

                height: 11 * width,
                marginHorizontal: 4 * width,
                marginTop: 2 * height,
                marginBottom: 2 * height,
                borderRadius: 1 * width,
                borderRadius: height * 3,
              }}
              btnTextStyle={{
                //fontWeight: '700',
                fontFamily: Fonts.Medium,
                fontSize: 3.4 * width,
                color: '#000',
              }}
              onPress={() => {
                closeQuizResultPopup();
              }}
            />
          </View>
          {/* )} */}

          {getCorrectAndPercentage() >= 70 && (
            <ConfettiCannon
              count={200}
              origin={{ x: 0, y: 0 }}
              autoStartDelay={500}
              onAnimationEnd={() => { }}
            />
          )}
        </ImageBackground>
      </Modal>

      {/* Removed: Next Step Unlocked modal */}

      <Modal visible={showLeaveQuizModal} dismissable={true} onDismiss={cancelLeaveQuiz}>
        <View
          style={{
            marginHorizontal: 6 * width,
            backgroundColor: ColorCode.white,
            borderRadius: 3 * width,
            padding: 5 * width,
          }}>
          <Text
            style={{
              fontSize: 4 * width,
              color: ColorCode.black,
              fontFamily: Fonts.SemiBold,
              textAlign: 'center',
            }}>
            Leave Quiz?
          </Text>
          <Text
            style={{
              marginTop: 2 * width,
              fontSize: 3.4 * width,
              color: ColorCode.grey888,
              fontFamily: Fonts.Regular,
              textAlign: 'center',
            }}>
            Are you sure you want to leave the quiz?
          </Text>
          <View style={{ flexDirection: 'row', marginTop: 5 * width }}>
            <TouchableOpacity
              style={{
                flex: 1,
                marginRight: 2 * width,
                borderWidth: 1,
                borderColor: ColorCode.primary,
                borderRadius: 2 * width,
                paddingVertical: 2.5 * width,
              }}
              onPress={cancelLeaveQuiz}>
              <Text
                style={{
                  textAlign: 'center',
                  color: ColorCode.primary,
                  fontSize: 3.3 * width,
                  fontFamily: Fonts.SemiBold,
                }}>
                Stay
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                marginLeft: 2 * width,
                backgroundColor: ColorCode.primary,
                borderRadius: 2 * width,
                paddingVertical: 2.5 * width,
              }}
              onPress={confirmLeaveQuiz}>
              <Text
                style={{
                  textAlign: 'center',
                  color: ColorCode.white,
                  fontSize: 3.3 * width,
                  fontFamily: Fonts.SemiBold,
                }}>
                Leave
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CustomProgress show={showProgress} />
    </Provider>
  );
};

export default OnlineQuizScreen;
