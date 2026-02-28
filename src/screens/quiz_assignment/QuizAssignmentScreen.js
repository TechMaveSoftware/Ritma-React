import React, { Fragment, useEffect, useRef, useState } from 'react';
import { FlatList, Image, ImageBackground, Keyboard, KeyboardAvoidingView, Pressable, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Modal, Provider } from 'react-native-paper';
import CustomSAView from '../../compenents/CustomSAView';
import CustomStatus from '../../compenents/CustomStatus';
import HeaderWithBack from '../../compenents/HeaderWithBack';
import width from '../../Units/width';
import ColorCode from '../../utility/ColorCode';
import Fonts from '../../utility/Fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ConstData from '../../utility/ConstData';
import ToastUtility from '../../utility/ToastUtility';
import CustomProgress from '../../compenents/CustomProgress';
import FastImage from 'react-native-fast-image';
import CustomButton from '../../compenents/CustomButton';
import ConfettiCannon from 'react-native-confetti-cannon';
import height from '../../Units/height';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const QuizAssignmentScreen = ({ navigation, route }) => {
  const [postData, setPost] = useState(route.params.post);
  const [allSyllabusData, setAllSyllabusData] = useState(route.params.data);
  const [syllabusData, setSyllabusData] = useState(allSyllabusData.quiz_data);
  const [quizBank, setQuizBank] = useState(route.params.quizData);
  const [syllabusQuiz, setSyllabusQuiz] = useState(
    route.params.questions ?? syllabusData.questions,
  );
  const [submitedAnswers, setSubmitedAnswers] = useState([]);

  // const [totalAttempt, setTotalAttempt] = useState(route.params.totalAttempt + 1);
  const [currentQuizPos, setCurrentQuizPos] = useState(0);
  const [selectedTempAns, setSelectedTempAns] = useState(null);
  const [selectedTempAnsArr, setSelectedTempAnsArr] = useState([]);
  const [inputTempAns, setInputTempAns] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(
    syllabusQuiz[currentQuizPos],
  );

  const [showProgress, setShowProgress] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showNextStePopup, setShowNextStePopup] = useState(false);

  const [correctAnsCount1, setCorrectAnsCount1] = useState(0);

  const questionPosRef = useRef(null);

  // console.log('syllabusData ==>>    ', JSON.stringify(syllabusData));
  // console.log('submitedAnswers ==>>    ', JSON.stringify(submitedAnswers));
  // console.log('totalAttempt ==>>    ', totalAttempt);

  useEffect(() => { }, []);

  useEffect(() => {
    if (syllabusQuiz.length == 0) {
      ToastUtility.showToast('No Quetions Found');
      navigation.goBack();
    } else if (submitedAnswers.length == syllabusQuiz.length) {
      console.log('All question answered');
      submitAllAnswers();
    } else {
      if (submitedAnswers[currentQuizPos]) {
        // console.log('currentQuizPos', currentQuizPos);
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
    var postData = {};
    Keyboard.dismiss();
    postData['syllabus_id'] = allSyllabusData.id;
    // postData['quiz_bank_id'] = syllabusData.id;
    postData['quiz_bank_id'] = quizBank.id;
    postData['submit_type'] = 'normal';
    postData['answer_type'] =
      syllabusQuiz[0].question_type == 'MCQ'
        ? 'coice'
        : syllabusQuiz[0].question_type == 'MCQ_TEXT'
          ? 'text'
          : 'coice';

    submitedAnswers.map(item => {
      // postData[`question_id[${item.question_id}]`] = item.id;
      if (syllabusQuiz[0].question_type == 'MCQ_TEXT') {
        postData[`question_id[${item.question_id}]`] = item.id;
      } else {
        postData[`question_id[${item[0].question_id}]`] = item.map(an => an.id);
      }
    });

    console.log('all answers', postData);
    // return
    setShowProgress(true);
    ApiMethod.submitAllAnswers(
      postData,
      pass => {
        setShowProgress(false);
        setShowConfetti(true);
        // if (
        //   (submitedAnswers.filter(ans => ans.is_correct == 1).length /
        //     syllabusQuiz.length) *
        //     100 >=
        //   70
        // ) {
        //   setTimeout(() => {
        //     // setTotalAttempt(totalAttempt)
        //     setShowNextStePopup(true);
        //   }, 4000);
        // }
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
    //   (submitedAnswers.filter(ans =>
    //     syllabusQuiz[0].question_type == 'MCQ'
    //       ? ans.every(an => an.is_correct == 1)
    //       : currentQuestion?.options.find(
    //           opt => ans.id.toLowerCase() == opt.option_text.toLowerCase(),
    //         ),
    //   ).length /
    //     syllabusQuiz.length) *
    //   100;

    console.log('getCorrectAndPercentage', parseInt(perc));
    return parseInt(perc);
  };

  const correctAnsCount = () => {
    // if (syllabusQuiz[0].question_type == 'MCQ') {
    //   var perc = submitedAnswers.filter(ans =>
    //     ans.every(an => an.is_correct == 1),
    //   );

    //   console.log('correctAnsCount', perc);
    //   return perc.length;
    // } else {
    //   var perc = submitedAnswers.filter(ans =>
    //     currentQuestion?.options.find(
    //       opt => opt.option_text.toLowerCase() == ans.id.toLowerCase(),
    //     ),
    //   );

    console.log('correctAnsCount', correctAnsCount1);
    return correctAnsCount1;
    // }
  };

  const incorrectAnsCount = () => {
    // if (syllabusQuiz[0].question_type == 'MCQ') {
    //   var perc = submitedAnswers.filter(
    //     ans => ans.filter(an => an.is_correct == 0).length > 0,
    //   );

    //   console.log('incorrectAnsCount', perc);
    //   return perc.length;
    // } else {
    //   var perc = submitedAnswers.filter(
    //     ans =>
    //       currentQuestion?.options.every(
    //         opt => opt.option_text.toLowerCase() != ans.id.toLowerCase(),
    //       ),
    //     //  ans.filter(an => an.is_correct == 0).length > 0,
    //   );
    var perc = syllabusQuiz.length - correctAnsCount1;
    console.log('incorrectAnsCount', perc);
    return perc;
    // }
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
          parentStyple={{ flex: 1, backgroundColor: ColorCode.transarent }}
          style={{ flex: 1, backgroundColor: ColorCode.transarent }}>
          <HeaderWithBack
            title={quizBank.title}
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
                          ? ['#008A3D', '#9DFFC8']
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
                          ? ['#008A3D', '#9DFFC8']
                          : ['#D4D4D4', '#D4D4D4']
                      }
                    />
                  </View>
                )}
              />
            </View>
            <KeyboardAwareScrollView style={{ flex: 1 }}>
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
                    {`${currentQuestion?.points}`}
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
                    {`${currentQuestion?.question_text}`}
                  </Text>
                </Text>

                {currentQuestion?.question_type == 'MCQ_TEXT' ? (
                  <View style={{ width: '100%', marginTop: 3 * width }}>
                    {console.log('options  ==>>    ', JSON.stringify(currentQuestion))}
                    <TextInput
                      style={{
                        width: '100%',
                        height: 24 * width,
                        borderRadius: 2 * width,
                        borderColor: ColorCode.greyDDD,
                        borderWidth: 1,
                        paddingHorizontal: 3 * width,
                        paddingVertical: 2 * width,
                        fontSize: 3.4 * width,
                        fontFamily: Fonts.Regular,
                        color: ColorCode.black,
                      }}
                      maxLength={200}
                      multiline={true}
                      value={inputTempAns}
                      onChangeText={t => {
                        setInputTempAns(t);
                      }}
                    />
                  </View>
                ) : (
                  <View style={{ width: '100%', marginTop: 3 * width }}>
                    {currentQuestion?.options.map((item, index) => {
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
                              setSelectedTempAns(item);
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
                padding: 2 * width,
                paddingBottom: Platform.OS === 'android' ? width * 15 : width * 2,
                // backgroundColor:"#DAD"
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
                  if (currentQuestion?.question_type == 'MCQ_TEXT') {
                    if (inputTempAns != '') {
                      console.log(
                        '=======================Find some============',
                        submitedAnswers.some(ans => ans.id == inputTempAns),
                      );

                      var tepp = inputTempAns;
                      console.log('tepp', tepp);
                      console.log(
                        'currentQuestion?.options',
                        currentQuestion?.options,
                      );
                      var ans11 = currentQuestion?.options[0];
                      ans11.id = tepp;
                      ans11.is_correct = ans11.option_text == tepp;

                      var txtAnsArr = ans11.option_text.split(",").map(ans => ans.trim().toLowerCase());

                      console.log(
                        'Correct',
                        txtAnsArr.includes(tepp.toLowerCase()),
                      );

                      if (txtAnsArr.includes(tepp.toLowerCase())) {
                        setCorrectAnsCount1(correctAnsCount1 + 1);
                      }


                      if (submitedAnswers.length == 0) {
                        console.log('1111');

                        // setSubmitedAnswers([tepp]);
                        setSubmitedAnswers([ans11]);
                      } else if (submitedAnswers[currentQuizPos]) {
                        console.log('22222');
                        var t1 = [...submitedAnswers];
                        // t1[currentQuizPos] = tepp;
                        t1[currentQuizPos] = ans11;
                        setSubmitedAnswers(t1);
                      } else {
                        console.log('33333');
                        // setSubmitedAnswers(prevState => [...prevState, tepp]);
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
        </CustomSAView>
      </View>

      <Modal
        visible={showConfetti}
        dismissable={false}
        onDismiss={() => {
          setShowConfetti(false);
        }}>
        <ImageBackground
          source={
            // (submitedAnswers.filter(ans => ans.is_correct == 1).length /
            //   syllabusQuiz.length) *100
            getCorrectAndPercentage() >= 70
              ? require('../../assets/images/confetti_bg.png')
              : require('../../assets/images/confetti_bg_fail.png')
          }
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: ColorCode.primary,
          }}>
          <View
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <TouchableOpacity
              style={{
                padding: 0 * width,
                alignSelf: 'flex-end',
                position: 'absolute',
                end: 3 * width,
                top: 4 * width,
              }}
              onPress={() => {
                // if (
                //   (submitedAnswers.filter(ans => ans.is_correct == 1).length /
                //     syllabusQuiz.length) *
                //     100 >=
                //   70
                // ) {
                //   setShowNextStePopup(true);
                // } else {
                setShowConfetti(false);
                navigation.goBack();
                // }
              }}>
              <Ionicons name="close" size={9 * width} color={ColorCode.white} />
            </TouchableOpacity>
            {getCorrectAndPercentage() >= 70 ? (
              <View style={{ flex: 1 }}>
                <Image
                  source={require('../../assets/images/grade_rate.png')}
                  style={{
                    width: 60 * width,
                    height: 60 * width,
                    marginTop: 5 * width,
                  }}
                  resizeMode="contain"
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
                  {`${ConstData.getGradeValue(getCorrectAndPercentage())}`}
                </Text>
              </View>
            ) : (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  source={require('../../assets/images/grade_fail.png')}
                  style={{
                    width: 65 * width,
                    height: 65 * width,
                    marginTop: 5 * width,
                  }}
                  resizeMode="contain"
                />
                <Text
                  style={{
                    fontSize: 4 * width,
                    color: ColorCode.white,
                    fontFamily: Fonts.SemiBold,
                    position: 'absolute',
                    paddingStart: 5 * width,
                    paddingTop: 8 * width,
                  }}>
                  {`${ConstData.getGradeValue(getCorrectAndPercentage())}`}
                </Text>
              </View>
            )}
          </View>

          <View
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text
              style={{
                fontSize: 7 * width,
                color: ColorCode.white,
                fontFamily: Fonts.SemiBold,
              }}>
              {`You Achieved Grade ${ConstData.getGradeValue(
                getCorrectAndPercentage(),
              )}`}
            </Text>
            <Text
              style={{
                width: '80%',
                textAlign: 'center',
                fontSize:
                  getCorrectAndPercentage() >= 70 ? 2.6 * width : 3 * width,
                color: ColorCode.white,
                fontFamily: Fonts.Regular,
                lineHeight: 4 * width,
                marginTop: 1 * width,
              }}>
              {getCorrectAndPercentage() >= 70
                ? `Congratulations! You've earned a Grade A, reflecting your hard work and understanding. Keep up the great effort as you continue progressing on your learning journey!`
                : `It looks like you're facing challenges, but don't get discouraged! Review the material, ask for help if needed, and keep pushing forward. Persistence leads to success!`}
            </Text>

            <View
              style={{
                width: '80%',
                padding: 3 * width,
                flexDirection: 'row',
                borderRadius: 3 * width,
                backgroundColor: ColorCode.white,
                marginTop: 10 * width,
              }}>
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Ionicons
                  name="star-outline"
                  size={5 * width}
                  color="#161616"
                />
                <Text
                  style={{
                    fontSize: 3 * width,
                    color: '#161616',
                    fontFamily: Fonts.Regular,
                    marginVertical: 1 * width,
                  }}>
                  {'QUESTIONS'}
                </Text>
                <Text
                  style={{
                    fontSize: 3 * width,
                    color: '#161616',
                    fontFamily: Fonts.Bold,
                  }}>
                  {`${submitedAnswers.length}/${syllabusQuiz.length}`}
                </Text>
              </View>

              <View
                style={{ width: 1, height: '100%', backgroundColor: '#131313' }}
              />

              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Ionicons name="checkmark" size={6 * width} color="#08AF52" />
                <Text
                  style={{
                    fontSize: 3 * width,
                    color: '#161616',
                    fontFamily: Fonts.Regular,
                    marginVertical: 1 * width,
                  }}>
                  {'CORRECT'}
                </Text>
                <Text
                  style={{
                    fontSize: 3 * width,
                    color: '#161616',
                    fontFamily: Fonts.Bold,
                  }}>
                  {`${
                    // submitedAnswers.filter(ans => ans.is_correct == 1).length
                    correctAnsCount()
                    }`}
                </Text>
              </View>

              <View
                style={{ width: 1, height: '100%', backgroundColor: '#131313' }}
              />

              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Ionicons
                  name="close-outline"
                  size={6 * width}
                  color="#FF0909"
                />
                <Text
                  style={{
                    fontSize: 3 * width,
                    color: '#161616',
                    fontFamily: Fonts.Regular,
                    marginVertical: 1 * width,
                  }}>
                  {'INCORRECT'}
                </Text>
                <Text
                  style={{
                    fontSize: 3 * width,
                    color: '#161616',
                    fontFamily: Fonts.Bold,
                  }}>
                  {`${
                    // submitedAnswers.filter(ans => ans.is_correct == 0).length
                    incorrectAnsCount()
                    }`}
                </Text>
              </View>
            </View>
          </View>

          {/* {getCorrectAndPercentage() <= 90 && (
            <View
              style={{
                flex: 0.4,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                paddingHorizontal: 2 * width,
              }}>
              {totalAttempt < ConstData.AttempsCount && (
                <CustomButton
                  btnText="Try Again"
                  colors={[ColorCode.yellow, ColorCode.yellow]}
                  enable={true}
                  btnStyle={{
                    flex: 1,
                    // width: '40%',
                    height: 11 * width,
                    marginHorizontal: 4 * width,
                    marginTop: 2 * height,
                    marginBottom: 2 * height,
                    borderRadius: 1 * width,
                  }}
                  btnTextStyle={{
                    //fontWeight: '700',
                    fontFamily: Fonts.Medium,
                    fontSize: 3.4 * width,
                  }}
                  onPress={() => {
                    setShowConfetti(false);
                    navigation.replace('OnlineQuiz', {
                      data: allSyllabusData,
                      totalAttempt: totalAttempt + 1,
                      post: postData,
                    });
                  }}
                />
              )}
              <CustomButton
                btnText="Schedule 1 : 1"
                colors={[ColorCode.white, ColorCode.white]}
                enable={true}
                btnStyle={{
                  // width: '40%',
                  flex: 1,
                  height: 11 * width,
                  marginHorizontal: 2 * width,
                  marginTop: 2 * height,
                  marginBottom: 2 * height,
                  borderRadius: 1 * width,
                }}
                btnTextStyle={{
                  //fontWeight: '700',
                  fontFamily: Fonts.Medium,
                  fontSize: 3.4 * width,
                  color: ColorCode.yellow,
                }}
                onPress={() => {
                  setShowConfetti(false);
                  navigation.replace('Calendar');
                }}
              />
            </View>
          )} */}

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

      <Modal
        visible={showNextStePopup}
        dismissable={false}
        onDismiss={() => {
          setShowNextStePopup(false);
          setShowConfetti(false);
        }}>
        <View
          style={{
            width: '90%',
            backgroundColor: '#FFF',
            borderRadius: 2 * width,
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {/* <TouchableOpacity
            style={{
              padding: 1 * width,
              alignSelf: 'flex-end',
              margin: 1 * width,
            }}
            onPress={() => {
                setShowConfetti(false);
                setShowNextStePopup(false);
                navigation.goBack();
            }}>
            <Ionicons name="close" size={7 * width} color={ColorCode.black} />
          </TouchableOpacity> */}
          <FastImage
            source={require('../../assets/images/step_unlocked.png')}
            style={{
              width: 14 * width,
              height: 14 * width,
              marginTop: 4 * height,
            }}
            resizeMode="contain"
          />
          <Text
            style={{
              fontSize: 3.4 * width,
              color: '#4B4B4B',
              fontFamily: Fonts.Bold,
            }}>
            {`Next Step Unlocked!`}
          </Text>
          <Text
            style={{
              width: '70%',
              marginTop: 2 * width,
              textAlign: 'center',
              fontSize: 3 * width,
              color: '#4B4B4B',
              fontFamily: Fonts.Regular,
            }}>
            {`You've completed this step—great work! The next one is now unlocked. Keep going!`}
          </Text>

          <CustomButton
            btnText="Okay"
            colors={[ColorCode.yellow, ColorCode.yellow]}
            enable={true}
            btnStyle={{
              width: '40%',
              height: 9 * width,
              marginTop: 2 * height,
              marginBottom: 2 * height,
              borderRadius: 1 * width,
            }}
            btnTextStyle={{
              //fontWeight: '700',
              fontFamily: Fonts.Regular,
              fontSize: 4 * width,
            }}
            onPress={() => {
              setShowConfetti(false);
              setShowNextStePopup(false);
              navigation.goBack();
            }}
          />
        </View>
      </Modal>

      <CustomProgress show={showProgress} />
    </Provider>
  );
};

export default QuizAssignmentScreen;
