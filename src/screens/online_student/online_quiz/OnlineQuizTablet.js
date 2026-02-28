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
    Dimensions,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Modal, Provider } from 'react-native-paper';
import CustomSAView from '../../../compenents/CustomSAView';
import CustomStatus from '../../../compenents/CustomStatus';
// import width from '../../../Units/width';
import ColorCode from '../../../utility/ColorCode';
import Fonts from '../../../utility/Fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CommonActions } from '@react-navigation/native';
import ConstData from '../../../utility/ConstData';
import ToastUtility from '../../../utility/ToastUtility';
import ApiMethod from '../../../api/ApiMethod';
import CustomProgress from '../../../compenents/CustomProgress';
import FastImage from 'react-native-fast-image';
import CustomButton from '../../../compenents/CustomButton';
import ConfettiCannon from 'react-native-confetti-cannon';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;
const width = screenWidth > 420 ? 420 / 100 : screenWidth / 100;
const height = Dimensions.get('window').height / 100;

const OnlineQuizTablet = ({ navigation, route }) => {
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
                console.log('========== QUIZ SUBMISSION SUCCESS (TABLET) ==========');
                console.log('Full API Response:', JSON.stringify(pass, null, 2));
                console.log('Response Status:', pass?.status);
                console.log('Response Message:', pass?.message);
                console.log('Correct Answers:', pass?.correct);
                console.log('Total Questions:', pass?.total_questions);
                console.log('Percentage:', pass?.percentage);
                console.log('Response Data:', pass?.data);
                console.log('======================================================');

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
                console.log('========== QUIZ SUBMISSION FAILED (TABLET) ==========');
                console.log('Full Error Response:', JSON.stringify(fail, null, 2));
                console.log('Error Status:', fail?.status);
                console.log('Error Message:', fail?.message);
                console.log('Error Data:', fail?.data);
                console.log('Error Details:', fail?.error);
                console.log('====================================================');

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
        console.log('correctAnsCount', correctAnsCount1);
        return correctAnsCount1;
    };

    const incorrectAnsCount = () => {
        var perc = syllabusQuiz.length - correctAnsCount1;

        console.log('incorrectAnsCount', perc);
        return perc;
    };

    // Check if we have valid quiz data
    if (!allSyllabusData || !allSyllabusData.quiz || !syllabusQuiz || syllabusQuiz.length === 0) {
        return (
            <Provider>
                <View style={{ flex: 1, backgroundColor: ColorCode.white }}>
                    <CustomStatus trans={true} isDark={true} color="#FFFFFF00" />
                    <CustomSAView
                        parentStyple={{ flex: 1, backgroundColor: ColorCode.transarent }}
                        style={{ flex: 1, backgroundColor: ColorCode.transarent }}>
                        {/* Standard Tablet Header */}
                        <View
                            style={{
                                width: '100%',
                                height: 6 * height,
                                backgroundColor: '#FFFFFF',
                                paddingHorizontal: 3 * width,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}>
                            <TouchableOpacity
                                onPress={handleBackPress}
                                style={{
                                    width: 8 * width,
                                    height: 8 * width,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                <Ionicons
                                    name="chevron-back"
                                    size={6 * width}
                                    color={ColorCode.black}
                                />
                            </TouchableOpacity>
                            <Text
                                style={{
                                    fontSize: 3.5 * width,
                                    fontFamily: Fonts.SemiBold,
                                    color: '#000000',
                                }}>
                                {'Quiz Error'}
                            </Text>
                            <View style={{ width: 10 * width }} />
                        </View>
                        <View
                            style={{
                                width: '100%',
                                height: 0.1 * height,
                                backgroundColor: '#E5E5E5',
                            }}
                        />
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                            <Text style={{ fontSize: 3.5 * width, color: ColorCode.black, textAlign: 'center' }}>
                                No quiz data available. Please try again.
                            </Text>
                            <TouchableOpacity
                                style={{
                                    marginTop: 20,
                                    padding: 3 * width,
                                    backgroundColor: ColorCode.primary,
                                    borderRadius: 1 * width,
                                }}
                                onPress={handleBackPress}>
                                <Text style={{ color: ColorCode.white, fontSize: 3 * width }}>Go Back</Text>
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
                <CustomStatus trans={true} isDark={true} color="#FFFFFF00" />


                <CustomSAView
                    parentStyple={{ flex: 1, backgroundColor: ColorCode.transarent }}
                    style={{ flex: 1, backgroundColor: ColorCode.transarent }}>
                    {/* Standard Tablet Header */}
                    {!showConfetti && (
                        <>
                            <View
                                style={{
                                    width: '100%',
                                    height: 6 * height,
                                    backgroundColor: '#FFFFFF',
                                    paddingHorizontal: 3 * width,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}>
                                <TouchableOpacity
                                    onPress={() => navigation.goBack()}
                                    style={{
                                        width: 8 * width,
                                        height: 8 * width,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                    <Ionicons
                                        name="chevron-back"
                                        size={6 * width}
                                        color={ColorCode.black}
                                    />
                                </TouchableOpacity>
                                <Text
                                    style={{
                                        fontSize: 3.5 * width,
                                        fontFamily: Fonts.SemiBold,
                                        color: '#000000',
                                    }}>
                                    {
                                        allSyllabusData?.quiz?.title ||
                                        allSyllabusData?.title ||
                                        syllabusData?.title ||
                                        postData?.title ||
                                        'Start Quiz'
                                    }
                                </Text>
                                <View style={{ width: 10 * width }} />
                            </View>
                            <View
                                style={{
                                    width: '100%',
                                    height: 0.1 * height,
                                    backgroundColor: '#E5E5E5',
                                }}
                            />
                        </>
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
                                    flexDirection: 'row',
                                }}>
                                <FlatList
                                    ref={questionPosRef}
                                    horizontal
                                    data={syllabusQuiz}
                                    showsHorizontalScrollIndicator={false}
                                    renderItem={({ item, index }) => (
                                        <View key={index} style={{}}>
                                            <LinearGradient
                                                style={{
                                                    height: 7 * width,// Adjusted for tablet
                                                    width: 7 * width, // Adjusted for tablet
                                                    borderRadius: 3.5 * width,
                                                    marginHorizontal: 1.5 * width,
                                                    marginVertical: 2 * width,
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
                                                        fontSize: 3 * width, // Adjusted for tablet
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
                                contentContainerStyle={{ paddingBottom: 14 * width }}>
                                <Pressable
                                    style={{ flex: 1, padding: 3 * width }}
                                    onPress={() => Keyboard.dismiss()}>
                                    <Text
                                        style={{
                                            fontSize: 3.2 * width,
                                            color: ColorCode.black,
                                            fontFamily: Fonts.SemiBold,
                                            textAlign: 'right',
                                        }}>
                                        {`Mark : `}
                                        <Text
                                            style={{
                                                fontSize: 3.2 * width,
                                                color: ColorCode.black,
                                                fontFamily: Fonts.SemiBold,
                                            }}>
                                            {`${currentQuestion.points}`}
                                        </Text>
                                    </Text>

                                    <Text
                                        style={{
                                            fontSize: 3.6 * width,
                                            color: ColorCode.black,
                                            fontFamily: Fonts.SemiBold,
                                            marginTop: 1 * width,
                                        }}>
                                        {`Question ${currentQuizPos + 1} : `}
                                        <Text
                                            style={{
                                                fontSize: 3.6 * width,
                                                color: ColorCode.grey888,
                                                fontFamily: Fonts.Regular,
                                            }}>
                                            {`${currentQuestion.question_text}`}
                                        </Text>
                                    </Text>

                                    {currentQuestion.question_type == 'MCQ_TEXT' ? (
                                        <View style={{ width: '100%', marginTop: 2 * width }}>
                                            <TextInput
                                                style={{
                                                    width: '100%',
                                                    height: 40 * width, // Adjusted for tablet
                                                    borderRadius: 1 * width,
                                                    borderColor: ColorCode.greyDDD,
                                                    borderWidth: 1,
                                                    paddingHorizontal: 2 * width,
                                                    paddingVertical: 1.5 * width,
                                                    fontSize: 3.2 * width, // Adjusted for tablet
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
                                        <View style={{ width: '100%', marginTop: 2 * width }}>
                                            {currentQuestion.options.map((item, index) => {
                                                console.log('options  ==>>    ', JSON.stringify(item));
                                                return (
                                                    <View key={index}>
                                                        <TouchableOpacity
                                                            style={{
                                                                width: '100%',
                                                                flexDirection: 'row',
                                                                paddingVertical: 1.5 * width,
                                                                alignItems: 'center',
                                                            }}
                                                            onPress={() => {
                                                                // setSelectedTempAns(item);
                                                                updateAnswer(item);
                                                            }}>
                                                            <LinearGradient
                                                                style={{
                                                                    height: 6 * width, // Adjusted for tablet
                                                                    width: 6 * width, // Adjusted for tablet
                                                                    borderRadius: 3 * width,
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
                                                                        fontSize: 3 * width, // Adjusted for tablet
                                                                        color: ColorCode.white,
                                                                        fontFamily: Fonts.Bold,
                                                                    }}>
                                                                    {`${ConstData.AlphabetAray[index]}`}
                                                                </Text>
                                                            </LinearGradient>
                                                            <Text
                                                                style={{
                                                                    flex: 1,
                                                                    marginStart: 2 * width,
                                                                    fontSize: 3.4 * width, // Adjusted for tablet
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
                                    marginBottom:
                                        Platform.OS === 'ios'
                                            ? Math.max(0, keyboardHeight - insets.bottom)
                                            : 2 * width,
                                    backgroundColor: ColorCode.white,
                                    // backgroundColor:"#DAD"
                                }}>
                                {currentQuizPos > 0 && (
                                    <TouchableOpacity
                                        style={{
                                            width: '30%', // Reduced width for tablet
                                            height: 8 * width, // Reduced height
                                            backgroundColor: ColorCode.white,
                                            borderRadius: 1 * width,
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
                                            size={4 * width}
                                            color={ColorCode.primary}
                                        // style={{position: 'absolute', start: 5 * width}}
                                        />
                                        <Text
                                            style={{
                                                marginEnd: 2 * width,
                                                marginStart: 3 * width,
                                                fontSize: 3.2 * width,
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
                                        height: 8 * width, // Reduced height
                                        backgroundColor: ColorCode.primary,
                                        borderRadius: 1 * width,
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

                                                let isCorrect = false;
                                                let possibleAnswers = [];

                                                if (currentQuestion.options && currentQuestion.options.length > 0) {
                                                    const correctOpts = currentQuestion.options.filter(opt => opt.is_correct == 1 || opt.is_correct === true || opt.is_correct === '1');
                                                    if (correctOpts.length > 0) {
                                                        possibleAnswers = correctOpts.map(opt => opt.option_text);
                                                    } else {
                                                        possibleAnswers = [currentQuestion.options[0].option_text];
                                                    }
                                                }

                                                if (currentQuestion.answer) possibleAnswers.push(currentQuestion.answer);
                                                if (currentQuestion.answer_text) possibleAnswers.push(currentQuestion.answer_text);

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
                                            fontSize: 3.2 * width,
                                            color: ColorCode.white,
                                            fontFamily: Fonts.SemiBold,
                                            marginEnd: 3 * width,
                                            marginStart: 2 * width,
                                        }}>
                                        {currentQuizPos == syllabusQuiz?.length - 1
                                            ? 'Save & Submit'
                                            : `Save & Next`}
                                    </Text>

                                    <Ionicons
                                        name="chevron-forward"
                                        size={4 * width}
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
                                            width: 40 * width, // Adjusted for tablet
                                            height: 45 * width,
                                            marginTop: 5 * width,
                                            alignSelf: 'center',
                                        }}
                                        resizeMode={FastImage.resizeMode.contain}
                                    />
                                    <Text
                                        style={{
                                            fontSize: 5 * width, // Adjusted
                                            color: ColorCode.white,
                                            fontFamily: Fonts.SemiBold,
                                            position: 'absolute',
                                            top: 20 * width,
                                            alignSelf: 'center',
                                            zIndex: 10,
                                            textAlign: 'center',
                                            textAlignVertical: 'center',
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
                                            width: 30 * width, // Increased size
                                            height: 30 * width,
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
                                            fontSize: 7 * width, // Increased font size
                                            color: ColorCode.black,
                                            fontFamily: Fonts.SemiBold,
                                            textAlign: 'center',
                                        }}>
                                        {isPassing
                                            ? `Congratulations!`
                                            : `Don't Give Up,\n You're Improving!`}
                                    </Text>
                                    <Text
                                        style={{
                                            width: '80%',
                                            textAlign: 'center',
                                            fontSize: 3.5 * width, // Increased font size
                                            color: ColorCode.black,
                                            fontFamily: Fonts.Regular,
                                            lineHeight: 5 * width,
                                            marginTop: 2 * width,
                                        }}>
                                        {isPassing
                                            ? `You got Grade ${grade} (${percentage.toFixed(2)}%)!`
                                            : `You got Grade ${grade} - ${percentage.toFixed(2)}% -- keep pushing forward!`}
                                    </Text>

                                    <View
                                        style={{
                                            width: '70%', // Wider container
                                            padding: 3 * width, // More padding
                                            borderRadius: 2 * width,
                                            backgroundColor: ColorCode.primary,
                                            marginTop: 4 * width,
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
                                                                fontSize: 3.5 * width,
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
                                                                fontSize: 3.5 * width,
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
                                                                fontSize: 3.5 * width,
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
                                                                fontSize: 3.5 * width,
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
                                                                fontSize: 3.5 * width,
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
                                                                fontSize: 3.5 * width,
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

                                height: 12 * width, // Increased height
                                marginHorizontal: 4 * width,
                                marginTop: 2 * height,
                                marginBottom: 2 * height,
                                borderRadius: 2 * width,
                            }}
                            btnTextStyle={{
                                //fontWeight: '700',
                                fontFamily: Fonts.Medium,
                                fontSize: 3.5 * width, // Increased font size
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
                        marginHorizontal: 8 * width,
                        backgroundColor: ColorCode.white,
                        borderRadius: 2 * width,
                        padding: 4 * width,
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
                            marginTop: 1.5 * width,
                            fontSize: 3 * width,
                            color: ColorCode.grey888,
                            fontFamily: Fonts.Regular,
                            textAlign: 'center',
                        }}>
                        Are you sure you want to leave the quiz?
                    </Text>
                    <View style={{ flexDirection: 'row', marginTop: 4 * width }}>
                        <TouchableOpacity
                            style={{
                                flex: 1,
                                marginRight: 1.5 * width,
                                borderWidth: 1,
                                borderColor: ColorCode.primary,
                                borderRadius: 1 * width,
                                paddingVertical: 1.8 * width,
                            }}
                            onPress={cancelLeaveQuiz}>
                            <Text
                                style={{
                                    textAlign: 'center',
                                    color: ColorCode.primary,
                                    fontSize: 2.8 * width,
                                    fontFamily: Fonts.SemiBold,
                                }}>
                                Stay
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{
                                flex: 1,
                                marginLeft: 1.5 * width,
                                backgroundColor: ColorCode.primary,
                                borderRadius: 1 * width,
                                paddingVertical: 1.8 * width,
                            }}
                            onPress={confirmLeaveQuiz}>
                            <Text
                                style={{
                                    textAlign: 'center',
                                    color: ColorCode.white,
                                    fontSize: 2.8 * width,
                                    fontFamily: Fonts.SemiBold,
                                }}>
                                Leave
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <CustomProgress show={showProgress} />
        </Provider >
    );
};

export default OnlineQuizTablet;
