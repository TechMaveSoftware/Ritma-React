import React, { Fragment, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {
  ActivityIndicator,
  Modal,
  ProgressBar,
  Provider,
} from 'react-native-paper';
import CustomSAView from '../../../compenents/CustomSAView';
import CustomStatus from '../../../compenents/CustomStatus';
import HeaderWithBack from '../../../compenents/HeaderWithBack';
import ColorCode from '../../../utility/ColorCode';
import Fonts from '../../../utility/Fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import width from '../../../Units/width';
import Dash from 'react-native-dash-2';
import CustomProgress from '../../../compenents/CustomProgress';
import ApiMethod from '../../../api/ApiMethod';
import { DefaultTheme, useFocusEffect } from '@react-navigation/native';
import height from '../../../Units/height';
import Video, { VideoRef } from 'react-native-video';
import ConfettiCannon from 'react-native-confetti-cannon';
import CustomButton from '../../../compenents/CustomButton';
import ToastUtility from '../../../utility/ToastUtility';
import ConstData from '../../../utility/ConstData';
import moment from 'moment';

var watchTimeInSec = 0;
var videoTotalTime = 0;

var videoPerentage = 1;
var timeout;

const OnlineSyllabusDetailScreen = ({ navigation, route }) => {
  const [syllabusData, setSyllabusData] = useState(route.params.data);
  const [selectedWeek, setSelectedWeek] = useState(route.params.week);
  const [syllabusQuiz, setSyllabusQuiz] = useState([]);

  const [thumbnailUrl, setThumbnailUrl] = useState(route.params.thumbnailUrl);
  const [videoUrl, setVideoUrl] = useState(route.params.videoUrl);

  const [showProgress, setShowProgress] = useState(false);
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [showVideoControls, setShowVideoControls] = useState(false);
  const [isVideoPlaying, setVideoPlaying] = useState(false);
  const [isVideoBuffering, setVideoBuffering] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);

  const [isVideoPlayed, setVideoPlayed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showNextStePopup, setShowNextStePopup] = useState(false);

  const [showMaxAttemptReachedPopup, setShowMaxAttemptReachedPopup] =
    useState(false);
  const [showQuizLockedPopup, sethowQuizLockedPopup] = useState(false);

  const [vdoTotalTime, setVdoTotalTime] = useState('');

  // let vdoTotalTime = moment('00:00:00', 'HH:mm:ss');

  const videoRef = useRef(null);

  // console.log('syllabusData', syllabusData);

  useFocusEffect(
    React.useCallback(() => {
      getQuizData();
    }, []),
  );

  useEffect(() => {
    if (isVideoPlayed) {
      setVideoPlayed(false);
      if (isQuizUnlocked()) {
        // ToastUtility.showToast(""+isVideoPlayed)
        setShowConfetti(true);
      }
    }
  }, [syllabusQuiz]);

  const getQuizData = () => {
    setShowProgress(true);
    ApiMethod.quizData(
      `id=${syllabusData.quiz_mechanism_step?.id}`,
      pass => {
        setShowProgress(false);
        console.log(JSON.stringify(pass));
        setSyllabusQuiz(pass.mechanism_step);
      },
      fail => {
        setShowProgress(false);
        console.log(fail);
      },
    );
  };

  const getVideoTime = () => {
    let totalTime = moment('00:00:00', 'HH:mm:ss');
    // console.log('HH:mm:ss', totalTime.format('HH:mm:ss'));
    if (
      syllabusQuiz &&
      syllabusQuiz.video.attempt_history &&
      syllabusQuiz.video.attempt_history.length > 0
    ) {
      let t =
        syllabusQuiz.video.attempt_history[
          syllabusQuiz.video.attempt_history.length - 1
        ].total_time.split(':');
      totalTime
        .add(Number(t[0]), 'hour')
        .add(Number(t[1]), 'minute')
        .add(Number(t[2]), 'second');
    }
    console.log('Video Time', totalTime.format('HH:mm:ss'));
    return totalTime;
  };

  const getTotalWatchTime = () => {
    let totalTime = moment('00:00:00', 'HH:mm:ss');
    // console.log('HH:mm:ss', totalTime.format('HH:mm:ss'));
    if (
      syllabusQuiz &&
      syllabusQuiz.video?.attempt_history &&
      syllabusQuiz.video?.attempt_history.length > 0
    ) {
      syllabusQuiz.video?.attempt_history.map(watch => {
        let t = watch.watch_time.split(':');
        // console.log(t)
        totalTime = totalTime
          .add(Number(t[0]), 'h')
          .add(Number(t[1]), 'm')
          .add(Number(t[2]), 's');
      });

      // let h_m = Math.floor(totalTime.get('hour') * 60);
      // let m = totalTime.get('minute');
      // let s = totalTime.get('second');
    }
    console.log('Watch Time', totalTime.format('HH:mm:ss'));
    return totalTime;
  };

  const isQuizUnlocked = () => {
    if (getVideoTime().format('HH:mm:ss').includes('00:00:00')) {
      console.log('111111111');
      return false;
    } else {
      console.log('222222222');
      let wTime = getTotalWatchTime();
      let vTime = getVideoTime();
      console.log(wTime);
      console.log(vTime);

      var all = vTime.format('HH:mm:ss').split(':');
      var sec = Number(all[0]) * 3600 + Number(all[1]) * 60 + Number(all[2]);
      console.log('sec', sec);

      var diff = vTime.diff(wTime, 'seconds');

      console.log('diff', diff);

      // let percent = Math.round(((diff / vTime) * 100000000 * 2) / 100);
      // let p = Math.round((diff)/(vTime)* 100000000*2)/100
      let p = Math.floor(((sec - diff) / sec) * 100);

      console.log('percent =>', p);
      return p > ConstData.VideoPercentage;
    }
  };

  const updateTime = () => {
    let totalTime1 = moment('00:00:00', 'HH:mm:ss').add(
      videoTotalTime,
      'seconds',
    );
    console.log('total Sec', videoTotalTime, totalTime1.format('HH:mm:ss'));

    let watchTime1 = moment('00:00:00', 'HH:mm:ss').add(
      watchTimeInSec,
      'seconds',
    );

    console.log('watchTime', watchTime1.format('HH:mm:ss'));

    console.log('total W Sec', watchTimeInSec);

    setShowProgress(true);
    ApiMethod.updateVideoTime(
      {
        mechanism_id: syllabusQuiz.mechanism_id,
        step_id: syllabusQuiz.id,
        watch_time: watchTimeInSec,
        total_time: videoTotalTime,
        formatted_watch_time: watchTime1.format('HH:mm:ss'),
        formatted_total_time: totalTime1.format('HH:mm:ss'),
      },
      pass => {
        setShowProgress(false);
        getQuizData();
      },
      fail => {
        setShowProgress(false);
      },
    );
  };

  // const marksScored = quisArr =>{
  //   let point = 0;
  //   // quisArr.

  //   return point;
  // }

  const totalMarks = quisArr => {
    let point = 0;
    quisArr.map(q => {
      point += q.points;
    });

    return point;
  };

  const highestMarks = attempsts => {
    const highestMaxScore = Math.max(
      ...attempsts.map(member => member.percentage),
    );
    var ind = attempsts.find(q => q.percentage == highestMaxScore);
    // var pos = attempsts.indexOf(ind);
    // console.log('' + highestMaxScore, ind);
    // console.log('' + highestMaxScore, pos);
    // console.log('' + highestMaxScore, pos);
    return ind;
  };

  const isAttemptUnderReview = (attempt, quiz) => {
    if (!attempt || !quiz || !quiz.questions) return false;

    // Check if review/remark exists - if it does, it's been reviewed
    if (attempt.review && attempt.review.trim().length > 0) return false;

    // Check for text questions
    const hasTextQuestions = quiz.questions.some(q =>
    (q.question_type === 'TEXT' || q.question_type === 'MCQ_TEXT' ||
      q.type === 'TEXT' || q.type === 'MCQ_TEXT')
    );

    // If text questions exist, no review, and not perfect score (implying potential correct text answers)
    // we consider it under review.
    // If percentage is 100, we assume all text answers were exact matches (auto-correct).
    if (hasTextQuestions && attempt.percentage < 100) {
      return true;
    }

    return false;
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
            title="Schedule"
            backgroundColor={ColorCode.primary}
            textColor={ColorCode.white}
          />
          <View
            style={{
              flex: 1,
              paddingHorizontal: 3 * width,
              backgroundColor: ColorCode.white,
              paddingVertical: 2 * width,
            }}>
            <View
              style={{
                // flex: 1,
                width: '100%',
                alignItems: 'center',
                paddingVertical: 2 * width,
                borderWidth: 1,
                borderColor: '#DEDEDE',
                borderRadius: 2 * width,
              }}>
              {/* <View
                style={{
                  // flex: 1,
                  flexDirection: 'row',
                  // alignItems: 'center',
                  width: '100%',
                  paddingHorizontal: 2 * width,
                  paddingVertical: 2 * width,
                }}>
                <TouchableOpacity
                  onPress={() => {
                    // watchTime.set('h', 0).set('m', 0).set('s', 0);
                    // watchTime.add(1, 's');
                    // watchTime.add(1, 's');
                    // watchTime.add(1, 's');
                    // console.log(watchTime.format('HH:mm:ss'));
                    watchTimeInSec = 0;
                    setVideoPlayed(true);
                    setShowVideoPopup(true);
                    // //  videoRef.current.setSource({
                    // //    uri: videoUrl + '/' + syllabusQuiz?.video?.file_path,
                    // //  });
                    // getVideoTime();
                    // getTotalWatchTime();
                  }}>
                  <FastImage
                    style={{
                      width: 25 * width,
                      height: 25 * width,
                      backgroundColor: '#F6F6F6',
                      borderRadius: 2 * width,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    source={
                      syllabusData.quiz_mechanism_step?.video_thumbnail
                        ? {
                            uri:
                              thumbnailUrl +
                              '/' +
                              syllabusData.quiz_mechanism_step?.video_thumbnail,
                          }
                        : require('../../../assets/images/banner1.png')
                    }>
                    <View
                      style={{
                        width: 12 * width,
                        height: 12 * width,
                        borderRadius: 8 * width,
                        backgroundColor: '#FFFFFF55',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <View
                        style={{
                          width: 10 * width,
                          height: 10 * width,
                          borderRadius: 8 * width,
                          backgroundColor: '#FFFFFF',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingStart: 1 * width,
                        }}>
                        <Ionicons
                          name="play"
                          size={6 * width}
                          color="#FFA800"
                        />
                      </View>
                    </View>
                  </FastImage>
                </TouchableOpacity>
                <View
                  style={{
                    flex: 1,
                    height: 25 * width,
                    paddingHorizontal: 3 * width,
                    // paddingVertical: 1 * width,
                    // justifyContent: 'space-between',
                    // maxWidth: '60%',
                  }}>
                  <Text
                    style={{
                      fontFamily: Fonts.Regular,
                      fontSize: 3.8 * width,
                      color: ColorCode.black,
                    }}
                    numberOfLines={3}>
                    {`${syllabusData.quiz_mechanism_step?.title}`}
                  </Text>
                  <View style={{flexDirection: 'row', marginTop: 1 * width}}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <Image
                        style={{width: 3.6 * width, height: 3.6 * width}}
                        resizeMode="contain"
                        source={require('../../../assets/images/video_unlocked.png')}
                      />
                      <Text
                        style={{
                          fontFamily: Fonts.Regular,
                          fontSize: 3.4 * width,
                          color: '#0EBD5B',
                          marginStart: 1 * width,
                        }}
                        numberOfLines={2}>
                        {`Unlocked`}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginStart: 3 * width,
                        backgroundColor: '#EFEFEF',
                        paddingHorizontal: 2 * width,
                        paddingVertical: 1 * width,
                        borderRadius: 3 * width,
                      }}>
                      <MaterialCommunityIcons
                        name="lightning-bolt"
                        color={ColorCode.black}
                        size={3 * width}
                      />
                      <Text
                        style={{
                          fontFamily: Fonts.Regular,
                          fontSize: 3 * width,
                          color: '#000000',
                        }}>
                        {`Week ${selectedWeek}`}
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-up" size={5 * width} color="#232323" />
              </View> */}
              {/* <View style={{width: '100%'}}> */}
              <FlatList
                data={syllabusQuiz?.step_quizzes}
                // data={[
                //   ...syllabusQuiz?.step_quizzes,
                //   ...syllabusQuiz?.step_quizzes,
                //   ...syllabusQuiz?.step_quizzes,
                // ]}
                style={{ width: '100%' }}
                refreshControl={
                  <RefreshControl
                    refreshing={showProgress}
                    onRefresh={() => {
                      getQuizData();
                    }}
                  // colors={['grey']}
                  // progressBackgroundColor={'black'}
                  />
                }
                ListHeaderComponent={
                  <View style={{ width: '100%' }}>
                    <View
                      style={{
                        // flex: 1,
                        flexDirection: 'row',
                        // alignItems: 'center',
                        width: '100%',
                        paddingHorizontal: 2 * width,
                        paddingVertical: 2 * width,
                      }}>
                      <TouchableOpacity
                        onPress={() => {
                          // watchTime.set('h', 0).set('m', 0).set('s', 0);
                          // watchTime.add(1, 's');
                          // watchTime.add(1, 's');
                          // watchTime.add(1, 's');
                          // console.log(watchTime.format('HH:mm:ss'));
                          watchTimeInSec = 0;
                          setVideoPlayed(true);
                          setShowVideoPopup(true);

                          // //  videoRef.current.setSource({
                          // //    uri: videoUrl + '/' + syllabusQuiz?.video?.file_path,
                          // //  });
                          // getVideoTime();
                          // getTotalWatchTime();
                        }}>
                        <FastImage
                          style={{
                            width: 25 * width,
                            height: 25 * width,
                            backgroundColor: '#F6F6F6',
                            borderRadius: 2 * width,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          source={
                            syllabusData.quiz_mechanism_step?.video_thumbnail
                              ? {
                                uri:
                                  thumbnailUrl +
                                  '/' +
                                  syllabusData.quiz_mechanism_step
                                    ?.video_thumbnail,
                              }
                              : require('../../../assets/images/banner1.png')
                          }>
                          <View
                            style={{
                              width: 12 * width,
                              height: 12 * width,
                              borderRadius: 8 * width,
                              backgroundColor: '#FFFFFF55',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <View
                              style={{
                                width: 10 * width,
                                height: 10 * width,
                                borderRadius: 8 * width,
                                backgroundColor: '#FFFFFF',
                                alignItems: 'center',
                                justifyContent: 'center',
                                paddingStart: 1 * width,
                              }}>
                              <Ionicons
                                name="play"
                                size={6 * width}
                                color="#FFA800"
                              />
                            </View>
                          </View>
                        </FastImage>
                      </TouchableOpacity>
                      <View
                        style={{
                          flex: 1,
                          height: 25 * width,
                          paddingHorizontal: 3 * width,
                          // paddingVertical: 1 * width,
                          // justifyContent: 'space-between',
                        }}>
                        <Text
                          style={{
                            fontFamily: Fonts.Bold,
                            fontSize: 3.8 * width,
                            color: ColorCode.black,
                          }}
                          numberOfLines={3}>
                          {syllabusData.quiz_mechanism_step?.title
                            ? `${syllabusData.quiz_mechanism_step?.title}`
                            : 'N/A'}
                        </Text>

                        <View
                          style={{
                            flexDirection: 'row',
                            marginTop: 1 * width,
                          }}>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            <Image
                              style={{
                                width: 3.6 * width,
                                height: 3.6 * width,
                              }}
                              resizeMode="contain"
                              source={require('../../../assets/images/video_unlocked.png')}
                            />
                            <Text
                              style={{
                                fontFamily: Fonts.Regular,
                                fontSize: 3.4 * width,
                                color: '#0EBD5B',
                                marginStart: 1 * width,
                              }}
                              numberOfLines={2}>
                              {`Unlocked`}
                            </Text>
                          </View>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginStart: 3 * width,
                              backgroundColor: '#EFEFEF',
                              paddingHorizontal: 2 * width,
                              paddingVertical: 1 * width,
                              borderRadius: 3 * width,
                            }}>
                            <MaterialCommunityIcons
                              name="lightning-bolt"
                              color={ColorCode.black}
                              size={3 * width}
                            />
                            <Text
                              style={{
                                fontFamily: Fonts.Regular,
                                fontSize: 3 * width,
                                color: '#000000',
                              }}>
                              {`Week ${selectedWeek}`}
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={{
                            fontFamily: Fonts.Regular,
                            fontSize: 3.4 * width,
                            color: '#000000',
                            marginTop: 2 * width,
                          }}>
                          {`Video Watch Time : `}
                          <Text
                            style={{
                              fontFamily: Fonts.Bold,
                              fontSize: 3.4 * width,
                              color: '#000000',
                            }}>
                            {`${getTotalWatchTime().format('HH:mm:ss')}`}
                          </Text>
                        </Text>
                      </View>
                      {/* <Ionicons
                        name="chevron-up"
                        size={5 * width}
                        color="#232323"
                      /> */}
                    </View>
                    <View
                      style={{
                        width: '100%',
                        height: 1,
                        backgroundColor: '#DEDEDE',
                      }}
                    />
                  </View>
                }
                renderItem={({ item, index }) => {
                  // isQuizUnlocked();

                  const bestAttempt = item.attempt_history.length > 0 ? highestMarks(item.attempt_history) : null;
                  const isUnderReview = bestAttempt && isAttemptUnderReview(bestAttempt, item.quiz);

                  return (
                    <View key={index} style={{ width: '100%' }}>
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          width: '100%',
                          paddingHorizontal: 2 * width,
                          paddingVertical: 3 * width,
                        }}
                        onPress={() => {
                          if (
                            item.attempt_history.length >= 1 &&
                            bestAttempt.percentage >
                            ConstData.QuizResultPercentage
                          ) {
                            navigation.navigate('OnlineQuizResult', {
                              data: bestAttempt,
                              quizData: item.quiz,
                              questionCount: item.quiz.questions.length,
                              totalMarks: totalMarks(item.quiz.questions),
                            });
                          } else if (
                            item.attempt_history.length >=
                            ConstData.MaxAttempsCount
                          ) {
                            setShowMaxAttemptReachedPopup(true);
                            ToastUtility.showToast('Maximum attempt reached');
                          } else if (
                            item.attempt_history.length >=
                            ConstData.AttempsCount
                          ) {
                            if (
                              item.attempt_history[0].is_third_enable == '1'
                            ) {
                              navigation.navigate('OnlineQuiz', {
                                data: item,
                                totalAttempt: item.attempt_history
                                  ? item.attempt_history.length
                                  : 0,
                                post: {
                                  mechanism_id: syllabusQuiz.mechanism_id,
                                  step_id: item.step_id,
                                  step_quiz_id: item.id,
                                  quiz_bank_id: item.quiz_bank_id,
                                },
                              });
                            } else {
                              ToastUtility.showToast('Maximum attempt reached');
                              setShowMaxAttemptReachedPopup(true);
                            }
                          } else if (!isQuizUnlocked()) {
                            sethowQuizLockedPopup(true);
                          } else {
                            // Even if under review, if user clicks, we navigate to result or quiz
                            // If under review and finished (reached attempts?), probably result
                            // But original code navigates to Quiz if low percentage and attempts left
                            // We keep original navigation logic, just update display

                            // Edit: If Under Review, we probably want to show Result, not retake?
                            // User request says "on press view when here result render then grade f and under review"
                            // This implies clicking it goes to Result.
                            // Currently logic goes to 'OnlineQuizResult' ONLY if percentage > QuizResultPercentage (usually 50% or determined by const).
                            // If Under Review (0%), it falls through.
                            // If safe to assume Under Review should behave like 'Passed' for navigation:
                            if (isUnderReview && item.attempt_history.length >= 1) {
                              navigation.navigate('OnlineQuizResult', {
                                data: bestAttempt,
                                quizData: item.quiz,
                                questionCount: item.quiz.questions.length,
                                totalMarks: totalMarks(item.quiz.questions),
                              });
                            } else {
                              navigation.navigate('OnlineQuiz', {
                                data: item,
                                totalAttempt: item.attempt_history
                                  ? item.attempt_history.length
                                  : 0,
                                post: {
                                  mechanism_id: syllabusQuiz.mechanism_id,
                                  step_id: item.step_id,
                                  step_quiz_id: item.id,
                                  quiz_bank_id: item.quiz_bank_id,
                                },
                              });
                            }
                          }
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
                            height: 12 * width,
                            paddingHorizontal: 2 * width,
                            justifyContent: 'space-between',
                          }}>
                          <Text
                            style={{
                              fontFamily: Fonts.Bold,
                              fontSize: 3.4 * width,
                              color: ColorCode.black,
                            }}
                            numberOfLines={1}>
                            {`${item.quiz.title}`}
                          </Text>
                          <View style={{ flexDirection: 'row' }}>
                            <View style={{ flexDirection: 'row' }}>
                              <Text
                                style={{
                                  fontFamily: Fonts.Regular,
                                  fontSize: 3.4 * width,
                                  color: '#858494',
                                }}
                                numberOfLines={3}>
                                {/* {highestMarks(item.attempt_history)} */}
                                {item.attempt_history.length > 0
                                  ? `${item.quiz.questions.length}/${item.quiz.questions.length
                                  } Ques  |  ${bestAttempt
                                    .total_points
                                  }/${totalMarks(item.quiz.questions)} Marks`
                                  : `0/${item.quiz.questions.length
                                  } Quiz  |  0/${totalMarks(
                                    item.quiz.questions,
                                  )} Marks`}
                              </Text>
                            </View>
                            {/* <View style={{flexDirection: 'row'}}></View> */}
                          </View>
                        </View>
                        {item.attempt_history.length > 0 ? (
                          <View style={{ height: '100%' }}>
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

                              {isUnderReview ? (
                                <Text
                                  style={{
                                    fontFamily: Fonts.Bold,
                                    fontSize: 2.5 * width,
                                    color: '#FFFFFF',
                                    position: 'absolute',
                                    end: 3 * width,
                                    paddingStart: 2 * width,
                                    paddingTop: 0.5 * width,
                                    textAlign: 'right'
                                  }}
                                  numberOfLines={1}>
                                  Under Review
                                </Text>
                              ) : (
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
                                  {`${ConstData.getGradeValue(
                                    bestAttempt.percentage,
                                  )}`}
                                </Text>
                              )}
                            </View>
                            {/* <TouchableOpacity
                                onPress={() => {
                                  navigation.navigate('OnlineQuizAttempts', {
                                    data: item.attempt_history,
                                    quizData: syllabusData.quiz_mechanism_step,
                                    thumbnailUrl: thumbnailUrl,
                                    videoUrl: videoUrl,
                                    questionCount: item.quiz.questions.length,
                                  });
                                }}
                                style={{
                                  flexDirection: 'row',
                                  backgroundColor: ColorCode.greyDDD,
                                  borderRadius: 1 * width,
                                  marginTop: 1 * width,
                                  // alignItems: 'center',
                                }}>
                                <Text
                                  style={{
                                    fontFamily: Fonts.Regular,
                                    fontSize: 2.4 * width,
                                    color: '#000',
                                    marginStart: 1 * width,
                                    paddingHorizontal: 1 * width,
                                    paddingVertical: 0.5 * width,
                                  }}
                                  numberOfLines={2}>
                                  {`Attempt ${item.attempt_history.length}/3`}
                                </Text>
                              </TouchableOpacity> */}
                          </View>
                        ) : isQuizUnlocked() ? (
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            <Image
                              style={{
                                width: 3.6 * width,
                                height: 3.6 * width,
                              }}
                              resizeMode="contain"
                              source={require('../../../assets/images/video_unlocked.png')}
                            />
                            <Text
                              style={{
                                fontFamily: Fonts.Regular,
                                fontSize: 3.4 * width,
                                color: '#0EBD5B',
                                marginStart: 1 * width,
                              }}
                              numberOfLines={2}>
                              {`Unlocked`}
                            </Text>
                          </View>
                        ) : (
                          <View
                            style={{
                              flexDirection: 'row',
                              // alignItems: 'center',
                            }}>
                            <MaterialCommunityIcons
                              name="lock-outline"
                              size={4 * width}
                              color="#FF0000"
                            />
                            <Text
                              style={{
                                fontFamily: Fonts.Regular,
                                fontSize: 3.4 * width,
                                color: '#FF0000',
                                marginStart: 1 * width,
                              }}
                              numberOfLines={2}>
                              {`Locked`}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                      {item.attempt_history.length > 0 && (
                        <View
                          style={[
                            {
                              width: '100%',
                              flexDirection: 'row',
                              backgroundColor: ColorCode.secondaryTrans,
                              borderTopEndRadius: 2 * width,
                              borderTopStartRadius: 2 * width,
                            },
                            index == syllabusQuiz?.step_quizzes.length - 1 && {
                              borderBottomEndRadius: 2 * width,
                              borderBottomStartRadius: 2 * width,
                            },
                          ]}>
                          <TouchableOpacity
                            onPress={() => {
                              navigation.navigate('OnlineQuizAttempts', {
                                data: item.attempt_history,
                                // quizData: syllabusData.quiz_mechanism_step,
                                quizData: item.quiz,
                                thumbnailUrl: thumbnailUrl,
                                videoUrl: videoUrl,
                                questionCount: item.quiz.questions.length,
                                totalMarks: totalMarks(item.quiz.questions),
                              });
                            }}
                            style={{
                              flex: 1,
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              height: 8 * width,
                              flexDirection: 'row',
                              paddingHorizontal: 5 * width,
                            }}>
                            <Text
                              style={{
                                fontFamily: Fonts.Medium,
                                fontSize: 3 * width,
                                color: ColorCode.black,
                              }}>
                              {`Quiz Attempts : ${item.attempt_history.length}/3`}
                            </Text>

                            <Text
                              style={{
                                fontFamily: Fonts.Medium,
                                fontSize: 3 * width,
                                color: ColorCode.black,
                              }}>
                              {`View Attempts`}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      {index < syllabusQuiz?.step_quizzes.length - 1 && (
                        <Dash
                          style={{ width: '100%', height: 1 }}
                          dashColor="#DEDEDE"
                        />
                      )}
                    </View>
                  );
                }}
              />
              {/* </View> */}
            </View>
          </View>
        </CustomSAView>
      </View>

      <Modal
        visible={showVideoPopup}
        dismissable={false}
        onDismiss={() => {
          // videoRef.current.pause();
          // setShowVideoPopup(false);
        }}>
        <View style={{ alignSelf: 'center', width: '95%' }}>
          <TouchableOpacity
            style={{ padding: 0 * width, alignSelf: 'flex-end' }}
            onPress={() => {
              videoRef.current.pause();
              setShowVideoPopup(false);
              setVideoBuffering(true);
              setVideoProgress(0);

              setTimeout(() => {
                updateTime();
              }, 500);
              // setShowConfetti(true);
            }}>
            <Ionicons name="close" size={9 * width} color={ColorCode.white} />
          </TouchableOpacity>
          <View
            style={{
              width: '100%',
              // height: 50 * width,
              backgroundColor: '#FFFFFF',
              borderRadius: 2 * width,
              padding: 2 * width,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View
              style={{
                width: '100%',
                height: 50 * width,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Video
                // Store reference
                ref={videoRef}
                // Can be a URL or a local file.
                poster={
                  thumbnailUrl +
                  '/' +
                  syllabusData.quiz_mechanism_step?.video_thumbnail
                }
                posterResizeMode="stretch"
                source={{ uri: syllabusQuiz?.video?.file_path }}
                // playWhenInactive={false}
                fullscreenAutorotate={true}
                preventsDisplaySleepDuringVideoPlayback={true}
                // Callback when remote video is buffering
                onBuffer={b => {
                  console.log('buffering', b);
                  setVideoBuffering(b.isBuffering);
                  setVideoPlaying(!b.isBuffering);
                }}
                onProgress={p => {
                  console.log('progress', p);
                  console.log(
                    'progress bar',
                    p.currentTime / p.seekableDuration,
                  );
                  setVideoProgress(p.currentTime / p.seekableDuration);
                  videoTotalTime = parseInt(p.seekableDuration);
                  setVdoTotalTime(
                    ConstData.secondsToHms(parseInt(p.seekableDuration)),
                  );

                  if (parseInt(p.currentTime) > watchTimeInSec) {
                    watchTimeInSec = parseInt(p.currentTime);
                    console.log('watchTimeInSec', watchTimeInSec);
                  }
                }}
                onEnd={() => { }}
                onAspectRatio={data => {
                  console.log('onAspectRatio', data);
                  return {
                    videoWidth: data.width,
                    videoHeight: data.height,
                  };
                }}
                // Callback when video cannot be loaded
                // onError={onError}
                controls={false}
                // controlsStyles={{
                //   hidePosition: true,
                //   hidePlayPause: true,
                //   hideForward: true,
                //   hideRewind: true,
                //   hideNext: false,
                //   hidePrevious: false,
                //   hideFullscreen: false,
                //   hideSeekBar: false,
                //   hideDuration: false,
                //   hideNavigationBarOnFullScreenMode: true,
                //   hideNotificationBarOnFullScreenMode: true,
                //   hideSettingButton: true,
                //   seekIncrementMS: 10000,
                //   liveLabel: 'LIVE',
                // }}
                style={{ width: '100%', height: '100%' }}
              />
              <TouchableOpacity
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                }}
                onPress={() => {
                  if (showVideoControls) {
                    clearTimeout(timeout);
                  } else {
                    timeout = setTimeout(() => {
                      setShowVideoControls(false);
                    }, 6000);
                  }
                  setShowVideoControls(!showVideoControls);
                }}>
                {showVideoControls && (
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: '#0003',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <TouchableOpacity
                      style={{
                        // width: '100%',
                        // height: '100%',
                        top: 1 * width,
                        start: 1 * width,
                        position: 'absolute',
                      }}
                      onPress={() => {
                        videoRef.current.setFullScreen(true);
                        setTimeout(() => {
                          videoRef.current.presentFullscreenPlayer();
                        }, 3000);
                      }}>
                      <Ionicons
                        name="resize-outline"
                        size={8 * width}
                        color={ColorCode.white}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{
                        padding: 3 * width,
                        borderRadius: 12 * width,
                      }}
                      onPress={() => {
                        if (isVideoPlaying) {
                          setVideoPlaying(false);
                          videoRef.current.pause();
                        } else {
                          setVideoPlaying(true);
                          videoRef.current.resume();
                        }
                      }}>
                      {isVideoPlaying ? (
                        <Ionicons
                          name="pause"
                          size={10 * width}
                          color={ColorCode.white}
                        />
                      ) : (
                        <Ionicons
                          name="play"
                          size={10 * width}
                          color={ColorCode.white}
                        />
                      )}
                    </TouchableOpacity>

                    <View
                      style={{
                        width: '95%',
                        position: 'absolute',
                        bottom: 5 * width,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text
                          style={{
                            textAlign: 'center',
                            fontSize: 2.8 * width,
                            color: ColorCode.white,
                            fontFamily: Fonts.Regular,
                          }}>
                          {ConstData.secondsToHms(parseInt(watchTimeInSec))}
                        </Text>
                        <Text
                          style={{
                            textAlign: 'center',
                            fontSize: 2.8 * width,
                            color: ColorCode.white,
                            fontFamily: Fonts.Regular,
                          }}>
                          {vdoTotalTime}
                        </Text>
                      </View>

                      <ProgressBar
                        style={{
                          width: '100%',
                          height: 2 * width,
                          backgroundColor: ColorCode.greyAAA,
                          marginHorizontal: 0,
                          borderRadius: 2 * width,
                        }}
                        theme={{
                          ...DefaultTheme,
                          colors: {
                            primary: ColorCode.primary,
                          },
                        }}
                        // indeterminate={true}
                        progress={videoProgress}
                      />
                    </View>
                  </View>
                )}
              </TouchableOpacity>
              {isVideoBuffering && (
                <ActivityIndicator
                  style={{ position: 'absolute' }}
                  size="large"
                  color={ColorCode.primary}
                />
              )}
            </View>
            <Text
              style={{
                width: '100%',
                fontSize: 3 * width,
                marginTop: 1 * width,
                color: ColorCode.black,
                fontFamily: Fonts.Medium,
              }}>
              {`Note : `}
              <Text
                style={{
                  fontSize: 3 * width,
                  color: ColorCode.grey888,
                  fontFamily: Fonts.Medium,
                }}>
                {`Watch time will be submitted once you close this popup.`}
              </Text>
            </Text>
          </View>
        </View>
      </Modal>
      <Modal
        visible={showConfetti}
        dismissable={false}
        onDismiss={() => {
          setShowConfetti(false);
        }}>
        <ImageBackground
          source={require('../../../assets/images/confetti_bg.png')}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: ColorCode.primary,
          }}>
          <View
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <FastImage
              source={require('../../../assets/images/confetti.gif')}
              style={{ width: 30 * width, height: 30 * width }}
              resizeMode="contain"
            />
            <Text
              style={{
                fontSize: 8 * width,
                color: ColorCode.white,
                fontFamily: Fonts.Bold,
              }}>
              Congratulations!
            </Text>
            <Text
              style={{
                width: '70%',
                textAlign: 'center',
                fontSize: 3.8 * width,
                color: ColorCode.white,
                fontFamily: Fonts.SemiBold,
                lineHeight: 6 * width,
                marginTop: 2 * width,
              }}>
              {`You’ve successfully completed this step of your course and are now ready to move on to the next challenge. Keep up the great work and continue progressing on your learning journey!`}
            </Text>
          </View>
          <CustomButton
            btnText="Continue to process"
            colors={[ColorCode.yellow, ColorCode.yellow]}
            enable={true}
            btnStyle={{
              width: '90%',
              marginTop: 4 * height,
              marginBottom: 4 * height,
              elevation: 1 * width,
            }}
            btnTextStyle={{
              //fontWeight: '700',
              fontFamily: Fonts.Regular,
              fontSize: 4 * width,
            }}
            onPress={() => {
              setShowNextStePopup(true);
            }}
          />
          <ConfettiCannon
            count={200}
            origin={{ x: 0, y: 0 }}
            autoStartDelay={500}
            onAnimationEnd={() => { }}
          />
        </ImageBackground>
      </Modal>

      <Modal
        visible={showNextStePopup}
        dismissable={false}
        onDismiss={() => {
          setShowNextStePopup(false);
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
              () => {
                setShowConfetti(false);
                setShowNextStePopup(false);
              };
            }}>
            <Ionicons name="close" size={7 * width} color={ColorCode.black} />
          </TouchableOpacity> */}
          <FastImage
            source={require('../../../assets/images/step_unlocked.png')}
            style={{
              width: 14 * width,
              height: 14 * width,
              marginTop: 3 * height,
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
            }}
          />
        </View>
      </Modal>

      <Modal
        visible={showMaxAttemptReachedPopup}
        dismissable={false}
        onDismiss={() => {
          setShowMaxAttemptReachedPopup(false);
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
          <TouchableOpacity
            style={{
              padding: 1 * width,
              alignSelf: 'flex-end',
              margin: 1 * width,
            }}
            onPress={() => {
              setShowMaxAttemptReachedPopup(false);
            }}>
            <Ionicons name="close" size={7 * width} color={ColorCode.black} />
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 3.4 * width,
              color: '#4B4B4B',
              fontFamily: Fonts.Bold,
            }}>
            {`Max Attempt Reached!`}
          </Text>
          <Text
            style={{
              width: '80%',
              marginTop: 2 * width,
              textAlign: 'center',
              fontSize: 3 * width,
              color: '#4B4B4B',
              fontFamily: Fonts.Regular,
            }}>
            {`You've completed your all available attempts. To help you move forward, we recommend scheduling a class session with your instructor.`}
          </Text>

          <CustomButton
            btnText="Schedule 1:1"
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
              setShowMaxAttemptReachedPopup(false);
              navigation.navigate('Calendar');
            }}
          />
        </View>
      </Modal>

      <Modal
        visible={showQuizLockedPopup}
        dismissable={true}
        onDismiss={() => {
          sethowQuizLockedPopup(false);
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
          <Text
            style={{
              width: '70%',
              marginTop: 5 * width,
              textAlign: 'center',
              fontSize: 3 * width,
              color: '#4B4B4B',
              fontFamily: Fonts.Regular,
            }}>
            {`Quiz currently locked kindly watch the video to unlock the Quiz.`}
          </Text>

          <Text
            style={{
              width: '70%',
              // marginTop: 1 * width,
              textAlign: 'center',
              fontSize: 3 * width,
              color: '#121212',
              fontFamily: Fonts.Bold,
            }}>
            {`*It is mandatory to watch 80% of the video to unlock the quiz*`}
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
              sethowQuizLockedPopup(false);
            }}
          />
        </View>
      </Modal>

      <CustomProgress show={showProgress} />
    </Provider>
  );
};

export default OnlineSyllabusDetailScreen;
