import React, { Fragment, useEffect, useRef, useState } from 'react';
import { FlatList, Image, ImageBackground, RefreshControl, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ActivityIndicator, DefaultTheme, Modal, ProgressBar, Provider } from 'react-native-paper';
import ApiMethod from '../../../api/ApiMethod';
import CustomProgress from '../../../compenents/CustomProgress';
import CustomSAView from '../../../compenents/CustomSAView';
import CustomStatus from '../../../compenents/CustomStatus';
import HeaderWithBack from '../../../compenents/HeaderWithBack';
import height from '../../../Units/height';
import width from '../../../Units/width';
import ColorCode from '../../../utility/ColorCode';
import ConstData from '../../../utility/ConstData';
import Fonts from '../../../utility/Fonts';
import ToastUtility from '../../../utility/ToastUtility';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import Dash from 'react-native-dash-2';
import Video, { VideoRef } from 'react-native-video';
import ConfettiCannon from 'react-native-confetti-cannon';
import moment from 'moment';
import CustomButton from '../../../compenents/CustomButton';

var watchTimeInSec = 0;
var videoTotalTime = 0;


var videoPerentage = 1;

const AllQuizDataScreen = ({ navigation }) => {
  const [showProgress, setShowProgress] = useState(false);
  const [syllabusData, setSyllabusData] = useState([]);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const [selectedVideoData, setSelectedVideoData] = useState(null);
  const [selectedVideoData1, setSelectedVideoData1] = useState(null);
  const [selectedVideoindex, setSelectedVideoIndex] = useState(-1);

  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [showVideoControls, setShowVideoControls] = useState(false);
  const [isVideoPlaying, setVideoPlaying] = useState(false);
  const [isVideoBuffering, setVideoBuffering] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [quizOpenPosition, setQuizOpenPosition] = useState(-1);

  const [isVideoPlayed, setVideoPlayed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showNextStePopup, setShowNextStePopup] = useState(false);

  const [showMaxAttemptReachedPopup, setShowMaxAttemptReachedPopup] = useState(false);
  const [showQuizLockedPopup, sethowQuizLockedPopup] = useState(false);

  const videoRef = useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      getQuiz();
    }, []),
  )
  // console.log('syllabusData', syllabusData);

  const getQuiz = () => {
    setShowProgress(true);
    ApiMethod.quizBundle(
      pass => {
        setShowProgress(false);
        // console.log(JSON.stringify(pass));

        let t1 = [];
        pass.data.map(d1 => {
          d1.syllabus.map(s1 => {
            t1.push(s1);
          });
        });

        setSyllabusData(t1);
        // setSyllabusData(pass.mechanism_steps);

        setThumbnailUrl(pass.thumbnail_url);
        setVideoUrl(pass.video_url);
      },
      fail => {
        setShowProgress(false);
      },
    );
  };

  useEffect(() => {
    console.log("111111111111111111", "isVideoPlayed => " + isVideoPlayed)
    if (isVideoPlayed) {
      setVideoPlayed(false);
      console.log("222222222222222222")
      var selvdo = syllabusData[selectedVideoindex];
      if (isQuizUnlocked1(selvdo, selectedVideoindex)) {
        console.log("333333333333333333")
        // ToastUtility.showToast("111=>  "+isVideoPlayed)

        setShowConfetti(true);
      } else {
        console.log('444444444444444444444');
        // ToastUtility.showToast("222=>  "+isVideoPlayed)
        setSelectedVideoData(null);
        setSelectedVideoData1(null);
        setSelectedVideoIndex(-1);
      }
    } else {
      console.log('55555555555555555555');
      // ToastUtility.showToast("333=>  "+isVideoPlayed)
      setSelectedVideoData(null);
      setSelectedVideoData1(null);
      setSelectedVideoIndex(-1);
    }
  }, [syllabusData]);


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
        mechanism_id: selectedVideoData.mechanism_id,
        step_id: selectedVideoData.id,
        watch_time: watchTimeInSec,
        total_time: videoTotalTime,
        formatted_watch_time: watchTime1.format('HH:mm:ss'),
        formatted_total_time: totalTime1.format('HH:mm:ss'),
      },
      pass => {

        setShowProgress(false);
        // setSelectedVideoData(null);
        setVideoProgress(0);
        getQuiz();
      },
      fail => {
        setShowProgress(false);
        setSelectedVideoData(null);
        setVideoProgress(0);
      },
    );
  };


  const getVideoTime = (syllabusQuiz) => {
    let totalTime = moment('00:00:00', 'HH:mm:ss');
    // console.log('HH:mm:ss', totalTime.format('HH:mm:ss'));
    if (
      syllabusQuiz &&
      syllabusQuiz.step.video.attempt_history &&
      syllabusQuiz.step.video.attempt_history.length > 0
    ) {
      let t =
        syllabusQuiz.step.video.attempt_history[
          syllabusQuiz.step.video.attempt_history.length - 1
        ].total_time.split(':');
      totalTime
        .add(Number(t[0]), 'hour')
        .add(Number(t[1]), 'minute')
        .add(Number(t[2]), 'second');
      // console.log('=-=-=----=-=-');
    }
    // console.log('Video Time', totalTime.format('HH:mm:ss'));
    return totalTime;
  };

  const getTotalWatchTime = (syllabusQuiz) => {
    let totalTime = moment('00:00:00', 'HH:mm:ss');
    // console.log('HH:mm:ss', totalTime.format('HH:mm:ss'));
    if (
      syllabusQuiz &&
      syllabusQuiz.step.video.attempt_history &&
      syllabusQuiz.step.video.attempt_history.length > 0
    ) {
      syllabusQuiz.step.video.attempt_history.map(watch => {
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
    // console.log('Watch Time', totalTime.format('HH:mm:ss'));
    return totalTime;
  };

  const isQuizUnlocked = (item, index) => {
    // console.log('Quiz Dta', JSON.stringify(item))
    if (getVideoTime(item).format('HH:mm:ss').includes('00:00:00')) {
      // console.log(item.quiz_mechanism_step.title, '111111111');
      return false;
    } else {
      // console.log('222222222');
      let wTime = getTotalWatchTime(item);
      let vTime = getVideoTime(item);
      // console.log(wTime);
      // console.log(vTime);

      var all = vTime.format('HH:mm:ss').split(':');
      var sec = Number(all[0]) * 3600 + Number(all[1]) * 60 + Number(all[2]);
      // console.log('sec', sec);

      var diff = vTime.diff(wTime, 'seconds');

      // console.log('diff', diff);

      // let percent = Math.round(((diff / vTime) * 100000000 * 2) / 100);
      // let p = Math.round((diff)/(vTime)* 100000000*2)/100
      let p = Math.floor(((sec - diff) / sec) * 100);

      console.log(item.quiz_mechanism_step.title, '  ==  percent =>', p, p > ConstData.VideoPercentage);

      return p > ConstData.VideoPercentage;
    }
  };

  const isQuizUnlocked1 = (item, index) => {
    console.log('Quiz Dta', JSON.stringify(item))
    if (getVideoTime(item).format('HH:mm:ss').includes('00:00:00')) {
      console.log(item.quiz_mechanism_step.title, '111111111');
      return false;
    } else {
      console.log('222222222');
      let wTime = getTotalWatchTime(item);
      let vTime = getVideoTime(item);
      // console.log(wTime);
      // console.log(vTime);

      var all = vTime.format('HH:mm:ss').split(':');
      var sec = Number(all[0]) * 3600 + Number(all[1]) * 60 + Number(all[2]);
      console.log('video total sec', sec);

      var diff = vTime.diff(wTime, 'seconds');

      console.log('diff', diff);

      // let percent = Math.round(((diff / vTime) * 100000000 * 2) / 100);
      // let p = Math.round((diff)/(vTime)* 100000000*2)/100
      let p = Math.floor(((sec - diff) / sec) * 100);

      console.log(item.quiz_mechanism_step.title, '  ==  percent =>', p, p > ConstData.VideoPercentage);

      return p > ConstData.VideoPercentage;
    }
  };


  const isVideoUnlocked = (item, index) => {
    // console.log('Quiz Dta', JSON.stringify(item))
    if (index == 0) {
      return true;
    } else {
      var prevQuizes = syllabusData[index - 1].step.step_quizzes;
      var hist = prevQuizes.filter(
        q =>
          q.attempt_history.length > 0 &&
          q.attempt_history.filter(h => h.percentage >= ConstData.QuizResultPercentage).length > 0,
      );
      // console.log('attempt1', hist);

      return hist.length > 0;
    }
  };


  const totalMarks = quisArr => {
    let point = 0;
    quisArr.map(q => {
      point += q.points;
    });

    return point;
  }

  const highestMarks = attempsts => {
    const highestMaxScore = Math.max(...attempsts.map(member => member.percentage));
    var ind = attempsts.find(q => q.percentage == highestMaxScore);
    // var pos = attempsts.indexOf(ind);
    // console.log('' + highestMaxScore, ind);
    // console.log('' + highestMaxScore, pos);
    // console.log('' + highestMaxScore, pos);
    return ind;
  }

  const mechanismView = ({ item, index }) => {
    // console.log('Ayllabus quiz', index, JSON.stringify(item));
    let quizData = item;
    return (
      <View
        key={index}
        style={[
          {
            width: '96%',
            alignItems: 'center',
            paddingVertical: 2 * width,
            borderWidth: 1,
            borderColor: '#DEDEDE',
            borderRadius: 2 * width,
            minHeight: 100,
            marginHorizontal: 2 * width,
            marginVertical: 2 * width,
            backgroundColor: ColorCode.white,
          },
          ConstData.ELEVATION_STYLE,
        ]}>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            paddingHorizontal: 2 * width,
            paddingVertical: 2 * width,
          }}>
          <TouchableOpacity
            onPress={() => {
              // watchTimeInSec = 0;
              // setShowVideoPopup(true);
              // console.log(
              //   'Ayllabus quiz',
              //   index,
              //   JSON.stringify(item.step.video),
              // );
              // isVideoUnlocked(item, index);
              if (isVideoUnlocked(item, index)) {
                watchTimeInSec = 0;
                setSelectedVideoData(item.step);
                setSelectedVideoData1(item);
                setSelectedVideoIndex(index);
                setVideoPlayed(true);
                setShowVideoPopup(true);
              } else {
                ToastUtility.showToast('Video Locked');
              }
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
                quizData?.video_thumbnail
                  ? {
                    uri: thumbnailUrl + '/' + quizData?.video_thumbnail,
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
                  <Ionicons name="play" size={6 * width} color="#FFA800" />
                </View>
              </View>
            </FastImage>
          </TouchableOpacity>
          <View
            style={{
              flex: 1,
              height: 25 * width,
              paddingHorizontal: 3 * width,
            }}>
            <Text
              style={{
                fontFamily: Fonts.Bold,
                fontSize: 4 * width,
                color: ColorCode.black,
              }}
              numberOfLines={2}>
              {`${quizData?.quiz_mechanism_step?.title ?? 'N/A'}`}
            </Text>

            <View style={{ flexDirection: 'row', marginTop: 1 * width }}>
              <View
                style={{
                  width: '28%',
                  paddingVertical: 0.5 * width,
                  paddingHorizontal: 1 * width,
                  backgroundColor: ColorCode.greyDDD,
                  borderRadius: 3 * width,
                  marginEnd: 4 * width,
                }}>
                <Text
                  style={{
                    fontFamily: Fonts.Regular,
                    fontSize: 3 * width,
                    textAlign: 'center',
                    color: ColorCode.black,
                  }}
                  numberOfLines={1}>
                  {`${quizData?.week.week}`}
                </Text>
              </View>

              {index == 0 || isVideoUnlocked(item, index) ? (
                // {quizData.is_locked ? (
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
                {`${getTotalWatchTime(item).format('HH:mm:ss')}`}
              </Text>
            </Text>
          </View>
          <TouchableOpacity
            style={{
              width: 8 * width,
              height: 5 * width,
              // borderRadius: 8 * width,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              // paddingStart: 1 * width,
            }}
            onPress={() => {
              if (index == quizOpenPosition) {
                setQuizOpenPosition(-1);
              } else {
                setQuizOpenPosition(index);
              }
            }}>
            <Ionicons
              name={quizOpenPosition == index ? 'chevron-up' : 'chevron-down'}
              size={5 * width}
              color="#232323"
            />
          </TouchableOpacity>
        </View>

        {quizOpenPosition == index && (
          <View style={{ width: '100%' }}>
            <View
              style={{
                width: '100%',
                height: 1,
                backgroundColor: '#DEDEDE',
              }}
            />
            <FlatList
              data={quizData?.step.step_quizzes}
              style={{ width: '100%' }}
              renderItem={({ item, index }) =>
                renderQuizView(item, index, quizData)
              }
            />
          </View>
        )}
      </View>
    );
  };

  const renderQuizView = (item, index, quizData) => {
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
              highestMarks(item.attempt_history).percentage >
              ConstData.QuizResultPercentage
            ) {
              navigation.navigate('OnlineQuizResult', {
                data: highestMarks(item.attempt_history),
                quizData: item.quiz,
                questionCount: item.quiz.questions.length,
                totalMarks: totalMarks(item.quiz.questions),
              });
            } else if (
              item.attempt_history.length >= ConstData.MaxAttempsCount
            ) {
              setShowMaxAttemptReachedPopup(true);
              ToastUtility.showToast('Maximum attempt reached');
            } else if (item.attempt_history.length >= ConstData.AttempsCount) {
              if (item.attempt_history[0].is_third_enable == '1') {
                navigation.navigate('OnlineQuiz', {
                  data: item,
                  totalAttempt: item.attempt_history
                    ? item.attempt_history.length
                    : 0,
                  post: {
                    mechanism_id: quizData.step.mechanism_id,
                    step_id: item.step_id,
                    step_quiz_id: item.id,
                    quiz_bank_id: item.quiz_bank_id,
                  },
                });
              } else {
                setShowMaxAttemptReachedPopup(true);
                ToastUtility.showToast('Maximum attempt reached');
              }
            } else if (!isQuizUnlocked(quizData, index)) {
              // if (item.is_locked) {
              sethowQuizLockedPopup(true);
            } else {
              // console.log('', quizData)
              // ToastUtility.showToast(""+quizData.step.mechanism_id)
              navigation.navigate('OnlineQuiz', {
                data: item,
                totalAttempt: item.attempt_history
                  ? item.attempt_history.length
                  : 0,
                post: {
                  mechanism_id: quizData.step.mechanism_id,
                  step_id: item.step_id,
                  step_quiz_id: item.id,
                  quiz_bank_id: item.quiz_bank_id,
                },
              });
            }
          }}>
          <View
            style={{
              width: 12 * width,
              height: 12 * width,
            }}>
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
                  numberOfLines={1}>
                  {item.attempt_history.length > 0
                    ? `${item.quiz.questions.length}/${item.quiz.questions.length
                    } Ques  |  ${highestMarks(item.attempt_history).total_points
                    }/${totalMarks(item.quiz.questions)} Marks`
                    : `0/${item.quiz.questions.length} Ques  |  0/${totalMarks(
                      item.quiz.questions,
                    )} Marks`}
                </Text>
              </View>
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
                    highestMarks(item.attempt_history).percentage,
                  )}`}
                </Text>
              </View>
            </View>
          ) : isQuizUnlocked(quizData, index) ? (
            // ) : item.is_locked ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Image
                style={{
                  width: 3.6 * width,
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
              index == quizData?.step.step_quizzes.length - 1 && {
                borderBottomEndRadius: 2 * width,
                borderBottomStartRadius: 2 * width,
              },
            ]}>
            <TouchableOpacity
              onPress={() => {

                navigation.navigate('OnlineQuizAttempts', {
                  data: item.attempt_history,
                  quizData: quizData.step,
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
        {index < quizData?.step.step_quizzes.length - 1 && (
          <Dash style={{ width: '100%', height: 1 }} dashColor="#DEDEDE" />
        )}
      </View>
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
          parentStyple={{ flex: 1, backgroundColor: ColorCode.transarent }}
          style={{ flex: 1, backgroundColor: ColorCode.transarent }}>
          <HeaderWithBack
            title="Quiz Data"
            backgroundColor={ColorCode.primary}
            textColor={ColorCode.white}
          />
          <View
            style={{
              flex: 1,
              // paddingHorizontal: 2 * width,
              backgroundColor: ColorCode.white,
            }}>
            <FlatList
              data={syllabusData}
              // style={{marginHorizontal: 2 * width}}
              refreshControl={
                <RefreshControl
                  refreshing={showProgress}
                  onRefresh={() => {
                    getQuiz();
                  }}
                // colors={['grey']}
                // progressBackgroundColor={'black'}
                />
              }
              renderItem={mechanismView}
            />
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
                poster={thumbnailUrl + '/' + selectedVideoData?.video_thumbnail}
                posterResizeMode="stretch"
                source={{
                  uri: selectedVideoData?.video?.file_path,
                }}
                // playWhenInactive={false}
                fullscreenAutorotate={true}
                preventsDisplaySleepDuringVideoPlayback={true}
                // Callback when remote video is buffering
                onBuffer={b => {
                  // console.log('buffering', b);
                  setVideoBuffering(b.isBuffering);
                  setVideoPlaying(!b.isBuffering);
                }}
                onProgress={p => {
                  // console.log('progress', p);
                  // console.log('progress bar', p.currentTime / p.seekableDuration);
                  setVideoProgress(p.currentTime / p.seekableDuration);
                  videoTotalTime = parseInt(p.seekableDuration);

                  if (parseInt(p.currentTime) > watchTimeInSec) {
                    watchTimeInSec = parseInt(p.currentTime);
                    console.log('watchTimeInSec', watchTimeInSec);
                  }
                }}
                onEnd={() => { }}
                onAspectRatio={data => {
                  // console.log('onAspectRatio', data);
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
                  setShowVideoControls(!showVideoControls);
                  setTimeout(() => {
                    setShowVideoControls(false);
                  }, 4000);
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
          setSelectedVideoData(null);
          setSelectedVideoData1(null);
          setSelectedVideoIndex(-1);
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
              setSelectedVideoData(null);
              setSelectedVideoData1(null);
              setSelectedVideoIndex(-1);
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
              setSelectedVideoData(null);
              setSelectedVideoData1(null);
              setSelectedVideoIndex(-1);
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

export default AllQuizDataScreen;
