import React, {Fragment, useEffect, useRef, useState} from 'react';
import {
  FlatList,
  Image,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Modal, Provider} from 'react-native-paper';
import ApiMethod from '../../../api/ApiMethod';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomProgress from '../../../compenents/CustomProgress';
import CustomStatus from '../../../compenents/CustomStatus';
import ImageView from '../../../compenents/ImageView';
import height from '../../../Units/height';
import width from '../../../Units/width';
import Fonts from '../../../utility/Fonts';
import StorageUtility from '../../../utility/StorageUtility';
import {useFocusEffect} from '@react-navigation/native';
import ToastUtility from '../../../utility/ToastUtility';
import ColorCode from '../../../utility/ColorCode';
import CustomSAView from '../../../compenents/CustomSAView';
import HeaderWithBack from '../../../compenents/HeaderWithBack';
import FastImage from 'react-native-fast-image';
import Dash from 'react-native-dash-2';
import ConstData from '../../../utility/ConstData';
import Entypo from 'react-native-vector-icons/Entypo';
// import RenderHtml from 'react-native-render-html';

const dayMap = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
};

const OnlineSyllabusScreen = ({navigation}) => {
  const [user, setUser] = useState(null);
  const [virtualClassCalendar, setVirtualClassCalendar] = useState(0);
  const [allChapterList, setAllChapterList] = useState([]);
  const [allSyllabusDaya, setAllSyllabusDaya] = useState([]);
  const [allSyllabusDataArr, setAllSyllabusDataArr] = useState([]);
  // const [chapterDayWise, setChapterDayWise] = useState(null);
  // const [chapterListDayWise, setChapterListDayWise] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [weekCountArr, setWeekCountArr] = useState([]);
  const [weekCount, setWeekCount] = useState(0);
  const [dataList, setDataList] = useState(null);
  // const [className, setClassName] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailUrlMech, setThumbnailUrlMech] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleIndex, setModalVisibleIndex] = useState(-1);
  const [selectedGoogleLink, setSelectedGoogleLink] = useState(null);
  const [selectedGoogleIndex, setSelectedGoogleIndex] = useState(-1);
  const [showGoogleLink, setShowGoogleLink] = useState(false);

  const [showProgress, setShowProgress] = useState(false);

  const weekRef = useRef();
  const syllabusRef = useRef();

  // useEffect(() => {
  //   console.log('=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-', ConstData.VideoPercentage);
  //   getUserDetail();
  // }, []);

  useFocusEffect(
    React.useCallback(() => {
      console.log('=-=-=-=-=-=-=-=-=', ConstData.VideoPercentage);
      getUserDetail();
    }, []),
  );

  useEffect(() => {
    syllabusRef?.current?.scrollToIndex({
      animated: true,
      index: 0,
    });
  }, [allChapterList]);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     // The screen is focused Call any action
  //     //apiCall(selectedWeek);
  //     getTotalWeek();
  //   }, [selectedWeek]),
  // );

  // const getProfile = () => {
  //   ApiMethod.getProfile(
  //     async pass => {
  //       console.log('profile data ********* ', pass.data.class);
  //       setShowProgress(false);
  //       if (pass.status == 200) {
  //         var data = pass.data;
  //         setClassName(data.class);
  //       }
  //     },
  //     fail => {
  //       console.log(fail);
  //       setShowProgress(false);
  //       ToastUtility.showToast('Some Error Occurred.');
  //     },
  //   );
  // };

  const getUserDetail = async () => {
    var uu = await StorageUtility.getUser();
    setUser(uu);

    if (uu.type == 'virtual') {
      setVirtualClassCalendar(1);
    } else {
      setVirtualClassCalendar(2);
    }
    // var path = await StorageUtility.getProfilePath();
    // setUserPath(path);
    // getProfile();
    setSelectedWeek(1);
    getTotalWeek();
  };

  const getTotalWeek = () => {
    setShowProgress(true);
    ApiMethod.myWeeks(
      pass => {
        setShowProgress(false);
        console.log(pass);
        setWeekCount(pass.data);
        let temp = []
        for (let i = 1; i <= pass.data; i++) {
          temp.push(i)
        }
        setWeekCountArr(temp);
        // if (pass.status == 200) {
        apiCall(selectedWeek);
        // }
      },
      fail => {
        setShowProgress(false);
        console.log(fail);
      },
    );
  };

  const apiCall = week => {
    setShowProgress(true);
    ApiMethod.quizBundleNew(
      pass => {
        setShowProgress(false);
        console.log(JSON.stringify(pass));

        if (pass.status == 200) {
          setAllSyllabusDaya(pass.data);

          let t1 = [];
          pass.data.map(d1 => {
            d1.syllabus.map(s1 => {
              t1.push(s1);
            });
          });
          setAllSyllabusDataArr(t1);

          setDataList(pass.main_data);

          var w1 = pass.data.filter(m => m.week == week);

          if (w1.length > 0) {
            setAllChapterList(w1[0].syllabus);
          } else {
            setShowProgress(false);
            setAllChapterList([]);
          }
        } else {
          setShowProgress(false);
          setAllChapterList([]);
        }

        setThumbnailUrl(pass.thumbnail_url);
        setThumbnailUrlMech(pass.mech_thumbnail_url);
        setVideoUrl(pass.video_url);
      },
      fail => {
        setShowProgress(false);
      },
    );
    // ApiMethod.mySyllabus(
    //   `week=${week}`,
    //   pass => {
    //     setShowProgress(false);

    //     console.log('===@@@@@@@@@@@pass', JSON.stringify(pass));
    //     if (pass.status == 200) {
    //       setDataList(pass.main_data);
    //       setAllChapterList(pass.data);
    //       setThumbnailUrl(pass.thumbnail_url);
    //       setVideoUrl(pass.video_url);
          
    //     } else {
    //       setShowProgress(false);
    //       setAllChapterList([]);
    //     }
    //   },
    //   fail => {
    //     setShowProgress(false);
    //     setAllChapterList([]);
    //   },
    // );
  };

  const isVideoUnlocked = (item, index) => {
    
    if (index == 0) {
      if (item.week.id == 1) {
        return true;
      } else {
        // console.log('Quiz Dta', JSON.stringify(item))
        let i = allSyllabusDataArr.indexOf(item);
        if (i > -1) {
          var prevQuizes = allSyllabusDataArr[i - 1].step.step_quizzes;
          var hist = prevQuizes.filter(
            q =>
              q.attempt_history.length > 0 &&
              q.attempt_history.filter(
                h => h.percentage >= ConstData.QuizResultPercentage,
              ).length > 0,
          );
          // console.log(i);
          // console.log(allSyllabusDataArr[i - 1]);
          return hist.length > 0;
        }

        return false;
      }
    } else {
      var prevQuizes = allChapterList[index - 1].step.step_quizzes;
      var hist = prevQuizes.filter(
        q =>
          q.attempt_history.length > 0 &&
          q.attempt_history.filter(
            h => h.percentage >= ConstData.QuizResultPercentage,
          ).length > 0,
      );
      // console.log('attempt1', hist);

      return hist.length > 0;
    }
  };


  const markDoneGoogleAssignment = data => {
    console.log('hjghggh', data.id);
    console.log('hjghggh', allSyllabusDataArr[modalVisibleIndex]);
    // return
    setShowProgress(true);
    ApiMethod.googleAssignMarkDone(
      {
        url_model_id: data.id,
        syllabus_id: allChapterList[modalVisibleIndex].id,
      },
      pass => {
        setShowProgress(false);
        console.log('===getting uploaded docs===', pass);

        if (pass.status == 200) {
          ToastUtility.showToast('Assignment Marked as Done');
          setShowGoogleLink(false);
          setSelectedGoogleLink(null);

          apiCall(selectedWeek);
        }
      },
      fail => {
        setShowProgress(false);
      },
    );
  };



  return (
    <Provider>
      <View style={{flex: 1, backgroundColor: ColorCode.white}}>
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
            title="Schedule"
            backgroundColor={ColorCode.primary}
            textColor={ColorCode.white}
          />
          <View style={{flex: 1, backgroundColor: ColorCode.white}}>
            {/* <ScrollView style={{flex: 1}}>
            <View style={{flex: 1}}> */}
            <View
              style={{
                flexDirection: 'row',
                width: '100%',
                paddingHorizontal: 3 * width,
                paddingVertical: 2 * width,
              }}>
              <FastImage
                style={{
                  width: 20 * width,
                  height: 20 * width,
                  backgroundColor: '#F6F6F6',
                  borderRadius: 2 * width,
                }}
                resizeMode="cover"
                onError={() => {
                  console.log('error1');
                }}
                source={
                  dataList?.thumbnail && {
                    uri: thumbnailUrlMech + '/' + dataList?.thumbnail,
                  }
                  // : require('../../../assets/images/banner1.png')
                }
              />
              <View style={{flex: 1, marginStart: 3 * width}}>
                <Text
                  style={{
                    fontFamily: Fonts.Bold,
                    fontSize: 3.4 * width,
                    color: ColorCode.black,
                  }}>
                  {dataList?.title && `${dataList?.title}`}
                </Text>
              </View>
            </View>

            <View
              style={{
                width: '100%',
                paddingHorizontal: 1 * width,
              }}>
              <ScrollView
                ref={weekRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{
                  width: '100%',
                  marginTop: 4 * width,
                  marginBottom: 3 * width,
                }}>
                <View style={{flexDirection: 'row', width: '100%'}}>
                  {/* {[1, 2, 3, 4, 5, 6, 7].map(item => ( */}
                  {weekCountArr.map(item => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => {
                        setSelectedWeek(item);
                        // apiCall(item);
                        var w1 = allSyllabusDaya.filter(m => m.week == item);

                        if (w1.length > 0) {
                          setAllChapterList(w1[0].syllabus);
                        } else {
                          setShowProgress(false);
                          setAllChapterList([]);
                        }
                      }}
                      style={{
                        width: 15 * width,
                        height: 17 * width,
                        backgroundColor:
                          item == selectedWeek ? '#D69C37' : '#EAF0EC',
                        borderRadius: 2 * width,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: item == selectedWeek ? 0 : 1,
                        borderColor: item == selectedWeek ? '#0000' : '#16763E',
                        marginHorizontal: 1.5 * width,
                      }}>
                      <Text
                        style={
                          item == selectedWeek
                            ? Styles.weekTextSelected
                            : Styles.weekText
                        }>{`Week ${item}`}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={{flex: 1, width: '100%'}}>
              {allChapterList.length > 0 ? (
                <FlatList
                  ref={syllabusRef}
                  data={allChapterList}
                  style={{
                    paddingHorizontal: 3 * width,
                  }}
                  renderItem={({item, index}) => {
                    // console.log('=--=--=-=-=-', item);
                    return (
                      <View
                        key={index}
                        style={{
                          width: '100%',
                          // height: 100,
                          // flexDirection: 'row',
                          alignItems: 'center',
                          marginVertical: 2 * width,
                        }}>
                        <View
                          style={{
                            width: '100%',
                            borderTopWidth: 1,
                            borderLeftWidth: 1,
                            borderRightWidth: 1,
                            borderBottomWidth: 1,
                            borderColor: ColorCode.primary,
                            borderRadius: 2 * width,
                            paddingHorizontal: 2 * width,
                            // paddingVertical: 2 * width,
                          }}>
                          <TouchableOpacity
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              width: '100%',
                              marginVertical: 3 * width,
                              // borderWidth: 1,
                              // borderColor: '#DEDEDE',
                              // borderRadius: 2 * width,
                              // paddingHorizontal: 2 * width,
                              // paddingVertical: 2 * width,
                            }}
                            onPress={() => {
                              // console.log('=--=--=-=-=-', JSON.stringify(item));
                              if (item.quiz_mechanism_step) {
                                if (isVideoUnlocked(item, index)) {
                                  navigation.navigate('OnlineSyllabusDetail', {
                                    data: item,
                                    thumbnailUrl: thumbnailUrl,
                                    videoUrl: videoUrl,
                                    week: selectedWeek,
                                  });
                                } else {
                                  ToastUtility.showToast('Quiz Locked');
                                }
                              } else {
                                ToastUtility.showToast(
                                  'No Quiz Mechanism Found',
                                );
                              }
                            }}>
                            <FastImage
                              style={{
                                width: 15 * width,
                                height: 15 * width,
                                backgroundColor: '#F6F6F6',
                                borderRadius: 2 * width,
                              }}
                              source={
                                item.quiz_mechanism_step?.video_thumbnail
                                  ? {
                                      uri:
                                        thumbnailUrl +
                                        '/' +
                                        item.quiz_mechanism_step
                                          ?.video_thumbnail,
                                    }
                                  : require('../../../assets/images/banner1.png')
                              }
                            />
                            <View
                              style={{
                                flex: 1,
                                paddingHorizontal: 3 * width,
                                // paddingVertical: 1 * width,
                                justifyContent: 'space-between',
                              }}>
                              <Text
                                style={{
                                  fontFamily: Fonts.Bold,
                                  fontSize: 3.4 * width,
                                  color: ColorCode.black,
                                }}
                                numberOfLines={1}>
                                {`${item.quiz_mechanism_step.title}`}
                              </Text>
                              <Text
                                style={{
                                  fontFamily: Fonts.Medium,
                                  fontSize: 3.4 * width,
                                  color: '#000000',
                                }}
                                numberOfLines={2}>
                                {`${dayMap[item.day]}`}
                              </Text>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                }}>
                                {/* {item.is_locked ? ( */}
                                {
                                  // index == 0 ||
                                  // allChapterList[index - 1]
                                  //   .attempts_completed_quiz == 0 ? (
                                  isVideoUnlocked(item, index) ? (
                                    <View
                                      style={{
                                        flexDirection: 'row',
                                        // alignItems: 'center',
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
                                          marginStart: 2 * width,
                                        }}
                                        numberOfLines={2}>
                                        {`Unlocked`}
                                      </Text>
                                    </View>
                                  ) : (
                                    <View
                                      style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
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
                                  )
                                }
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    marginStart: 3 * width,
                                  }}>
                                  <View
                                    style={{
                                      width: 2 * width,
                                      height: 2 * width,
                                      backgroundColor: '#ABC32F',
                                      borderRadius: 2 * width,
                                    }}
                                  />
                                  <Text
                                    style={{
                                      textAlign: 'right',
                                      fontFamily: Fonts.Regular,
                                      fontSize: 3.2 * width,
                                      color: '#ABC32F',
                                      marginStart: 2 * width,
                                    }}
                                    numberOfLines={2}>
                                    {`Current Hours : ${item.current_hours}`}
                                  </Text>
                                </View>
                              </View>
                            </View>
                            <Ionicons
                              name="chevron-forward"
                              size={5 * width}
                              color="#232323"
                            />
                          </TouchableOpacity>

                          {item?.google_doc_url &&
                            item?.google_doc_url.length > 0 && (
                              <View
                                style={{
                                  width: '100%',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  borderTopWidth: 1,
                                  borderColor: ColorCode.primary, //'#DEDEDE',
                                  // borderRadius: 2 * width,
                                  paddingHorizontal: 2 * width,
                                  paddingVertical: 1 * width,
                                  marginTop: 2 * width,
                                }}>
                                <Text
                                  style={{
                                    fontFamily: Fonts.SemiBold,
                                    fontSize: 3.6 * width,
                                    color: '#121212',
                                  }}
                                  numberOfLines={1}>
                                  {`Google Doc`}
                                </Text>
                                <TouchableOpacity
                                  onPress={() => {
                                    // ToastUtility.showToast('Clicked => ' + index);
                                    setModalVisibleIndex(index);
                                    setModalVisible(!modalVisible);
                                  }}
                                  style={{
                                    height: 5 * height,
                                    paddingVertical: 1 * width,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}>
                                  <Text
                                    style={{
                                      fontFamily: Fonts.Medium,
                                      fontSize: 3.2 * width,
                                      color: '#666666',
                                      marginHorizontal: 1 * width,
                                    }}>
                                    {`View`}
                                  </Text>
                                  <Ionicons
                                    name="arrow-forward-outline"
                                    size={5 * width}
                                    color="#16763E"
                                  />
                                </TouchableOpacity>
                                {/* {item?.google_doc_url.map((gdoc, index1) => (
                                    <TouchableOpacity
                                      key={index1}
                                      onPress={() => {
                                        if (gdoc.submitted == 0) {
                                          setSelectedGoogleIndex(index);
                                          setSelectedGoogleLink(gdoc);
                                          setShowGoogleLink(true);
                                        }
                                      }}
                                      style={{
                                        width: '100%',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                      }}>
                                      <Text
                                        style={{
                                          flex: 1,
                                          fontFamily: Fonts.Regular,
                                          fontSize: 3.8 * width,
                                          color: '#858585',
                                          paddingVertical: 1 * width,
                                        }}>
                                        {`${item.google_doc_url[0].title}`}
                                      </Text>
                                      {gdoc.submitted == 1 ? (
                                        <Ionicons
                                          name="checkmark-done"
                                          size={5 * width}
                                          color="#16763E"
                                        />
                                      ) : (
                                        <Ionicons
                                          name="arrow-forward-outline"
                                          size={4 * width}
                                          color="#16763E"
                                        />
                                      )}
                                    </TouchableOpacity>
                                  ))} */}
                              </View>
                            )}

                          {item.quiz_data && (
                            <View
                              style={{
                                width: '100%',
                                flexDirection: 'row',
                                alignItems: 'center',
                                borderTopWidth: 1,
                                borderTopColor: ColorCode.primary,
                                borderBottomEndRadius: 3 * width,
                                justifyContent: 'space-between',
                                paddingHorizontal: 3 * width,
                                paddingVertical: 1 * width,
                                // backgroundColor: '#ada',
                                // marginTop: 2 * width,
                              }}>
                              <Text
                                style={{
                                  fontFamily: Fonts.SemiBold,
                                  fontSize: 3.6 * width,
                                  color: '#121212',
                                  // marginHorizontal: 1 * width,
                                }}>
                                {`Quiz Assignment`}
                              </Text>

                              {item.quiz_data.submit_status.length > 0 ? (
                                <View
                                  style={{
                                    height: 5 * height,
                                    paddingVertical: 1 * width,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}>
                                  <Text
                                    style={{
                                      fontFamily: Fonts.Medium,
                                      fontSize: 3.2 * width,
                                      color: '#666666',
                                      marginHorizontal: 1 * width,
                                    }}>
                                    {`Attempted`}
                                  </Text>
                                  <Ionicons
                                    name="checkmark-done"
                                    size={5 * width}
                                    color="#16763E"
                                  />
                                </View>
                              ) : (
                                <TouchableOpacity
                                  onPress={() => {
                                    // ToastUtility.showToast('Clicked => ' + index);
                                    navigation.navigate('QuizAssignment', {
                                      data: item,
                                      quizData: item.quiz_data,
                                      questions: item.quiz_data.questions,
                                    });
                                  }}
                                  style={{
                                    height: 5 * height,
                                    paddingVertical: 1 * width,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}>
                                  <Text
                                    style={{
                                      fontFamily: Fonts.Medium,
                                      fontSize: 3.2 * width,
                                      color: '#666666',
                                      marginHorizontal: 1 * width,
                                    }}>
                                    {`Attempt`}
                                  </Text>
                                  <Ionicons
                                    name="arrow-forward-outline"
                                    size={5 * width}
                                    color="#16763E"
                                  />
                                </TouchableOpacity>
                              )}
                            </View>
                          )}
                        </View>

                        {!item.is_locked && (
                          // {isVideoUnlocked(item, index) && (
                          <View
                            style={{
                              // flexDirection: 'row',
                              width: '100%',
                              borderStartWidth: 1,
                              borderEndWidth: 1,
                              borderBottomWidth: 1,
                              borderColor: '#DEDEDE',
                              borderRadius: 2 * width,
                              // marginTop: 2 * width,
                            }}>
                            <View
                              style={{
                                flex: 1,
                                paddingHorizontal: 2 * width,
                                paddingVertical: 2 * width,
                              }}>
                              <Text
                                style={{
                                  fontFamily: Fonts.Regular,
                                  fontSize: 3.4 * width,
                                  color: ColorCode.black,
                                }}
                                numberOfLines={1}>
                                {item.chapter_name
                                  ? `${item.chapter_name}`
                                  : 'N/A'}
                              </Text>
                              <View
                                style={{
                                  flexDirection: 'row',
                                  // paddingHorizontal: 2 * width,
                                  // paddingVertical: 1 * width,
                                  justifyContent: 'space-between',
                                  marginTop: 1 * width,
                                }}>
                                <Text
                                  style={{
                                    flex: 1,
                                    fontFamily: Fonts.Regular,
                                    fontSize: 3.4 * width,
                                    color: '#636363',
                                  }}
                                  numberOfLines={1}>
                                  {`${item.abbreviations}`}
                                </Text>
                                <View
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}>
                                  <Image
                                    style={{
                                      width: 3.4 * width,
                                      height: 3.4 * width,
                                    }}
                                    resizeMode="contain"
                                    source={require('../../../assets/images/total_hours.png')}
                                  />
                                  <Text
                                    style={{
                                      width: 25 * width,
                                      fontFamily: Fonts.Regular,
                                      fontSize: 3 * width,
                                      color: '#FFA800',
                                      marginStart: 2 * width,
                                    }}
                                    numberOfLines={1}>
                                    {`Total : ${item.total_hours} Hrs`}
                                  </Text>
                                </View>
                              </View>
                            </View>
                            <View
                              style={{
                                width: '100%',
                                height: 1,
                                backgroundColor: '#DEDEDE',
                              }}
                            />
                            <View
                              style={{
                                flex: 1,
                                paddingHorizontal: 2 * width,
                                paddingVertical: 2 * width,
                              }}>
                              <Text
                                style={{
                                  fontFamily: Fonts.Bold,
                                  fontSize: 3.4 * width,
                                  color: ColorCode.black,
                                }}
                                numberOfLines={1}>
                                {`Mock Test`}
                              </Text>
                              <Text
                                style={{
                                  fontFamily: Fonts.Regular,
                                  fontSize: 3.4 * width,
                                  color: '#858585',
                                  marginTop: 1 * width,
                                }}>
                                {`${item.mock_skill_test
                                  .replaceAll(ConstData.HTML_Regex, '')
                                  .replaceAll('&nbsp;', '')}`}
                              </Text>
                              {/* <RenderHtml
                                contentWidth={'100%'}
                                source={`${item.mock_skill_test}`}
                              /> */}
                              <Text
                                style={{
                                  fontFamily: Fonts.Bold,
                                  fontSize: 3.4 * width,
                                  color: ColorCode.black,
                                  marginTop: 3 * width,
                                }}
                                numberOfLines={1}>
                                {`Est. Time All- Instruction and Tools`}
                              </Text>
                              <View
                                style={{
                                  width: '100%',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  paddingVertical: 2 * width,
                                }}>
                                <Text
                                  style={{
                                    fontFamily: Fonts.Regular,
                                    fontSize: 3.4 * width,
                                    color: '#858585',
                                  }}>
                                  {`Chapter Video/quiz`}
                                </Text>
                                <Text
                                  style={{
                                    fontFamily: Fonts.Regular,
                                    fontSize: 3.4 * width,
                                    color: '#858585',
                                  }}>
                                  {`${item.instruction_and_tools.chapter_video_quiz} min`}
                                </Text>
                              </View>
                              <Dash
                                style={{width: '100%', height: 1}}
                                dashColor="#DEDEDE"
                              />
                              <View
                                style={{
                                  width: '100%',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  paddingVertical: 2 * width,
                                }}>
                                <Text
                                  style={{
                                    fontFamily: Fonts.Regular,
                                    fontSize: 3.4 * width,
                                    color: '#858585',
                                  }}>
                                  {`Chapter Test`}
                                </Text>
                                <Text
                                  style={{
                                    fontFamily: Fonts.Regular,
                                    fontSize: 3.4 * width,
                                    color: '#858585',
                                  }}>
                                  {`${item.instruction_and_tools.chapter_test} min`}
                                </Text>
                              </View>
                              <Dash
                                style={{width: '100%', height: 1}}
                                dashColor="#DEDEDE"
                              />
                              <View
                                style={{
                                  width: '100%',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  paddingVertical: 3 * width,
                                }}>
                                <Text
                                  style={{
                                    fontFamily: Fonts.Regular,
                                    fontSize: 3.4 * width,
                                    color: '#858585',
                                  }}>
                                  {`Vocabulary`}
                                </Text>
                                <Text
                                  style={{
                                    fontFamily: Fonts.Regular,
                                    fontSize: 3.4 * width,
                                    color: '#858585',
                                  }}>
                                  {`${item.instruction_and_tools.vocabulary} min`}
                                </Text>
                              </View>
                              <Dash
                                style={{width: '100%', height: 1}}
                                dashColor="#DEDEDE"
                              />
                              <View
                                style={{
                                  width: '100%',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  paddingVertical: 3 * width,
                                }}>
                                <Text
                                  style={{
                                    fontFamily: Fonts.Regular,
                                    fontSize: 3.4 * width,
                                    color: '#858585',
                                  }}>
                                  {`Chapter 1 workbook`}
                                </Text>
                                <Text
                                  style={{
                                    fontFamily: Fonts.Regular,
                                    fontSize: 3.4 * width,
                                    color: '#858585',
                                  }}>
                                  {`${item.instruction_and_tools.chapter_workbook} min`}
                                </Text>
                              </View>
                              <Dash
                                style={{width: '100%', height: 1}}
                                dashColor="#DEDEDE"
                              />
                              <View
                                style={{
                                  width: '100%',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  paddingVertical: 3 * width,
                                }}>
                                <Text
                                  style={{
                                    fontFamily: Fonts.Regular,
                                    fontSize: 3.4 * width,
                                    color: '#858585',
                                  }}>
                                  {`Abbreviations`}
                                </Text>
                                <Text
                                  style={{
                                    fontFamily: Fonts.Regular,
                                    fontSize: 3.4 * width,
                                    color: '#858585',
                                  }}>
                                  {`${item.instruction_and_tools.abbreviations} min`}
                                </Text>
                              </View>
                              <Dash
                                style={{width: '100%', height: 1}}
                                dashColor="#DEDEDE"
                              />
                              <View
                                style={{
                                  width: '100%',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  paddingVertical: 3 * width,
                                }}>
                                <Text
                                  style={{
                                    fontFamily: Fonts.Regular,
                                    fontSize: 3.4 * width,
                                    color: '#858585',
                                  }}>
                                  {`Skills`}
                                </Text>
                                <Text
                                  style={{
                                    fontFamily: Fonts.Regular,
                                    fontSize: 3.4 * width,
                                    color: '#858585',
                                  }}>
                                  {`${item.instruction_and_tools.skills} min`}
                                </Text>
                              </View>
                              <Dash
                                style={{width: '100%', height: 1}}
                                dashColor="#DEDEDE"
                              />
                              <View
                                style={{
                                  width: '100%',
                                  flexDirection: 'row',
                                  justifyContent: 'space-between',
                                  paddingVertical: 3 * width,
                                }}>
                                <Text
                                  style={{
                                    fontFamily: Fonts.Regular,
                                    fontSize: 3.4 * width,
                                    color: '#858585',
                                  }}>
                                  {`Instructor pre-recorded (zoom)`}
                                </Text>
                                <Text
                                  style={{
                                    fontFamily: Fonts.Regular,
                                    fontSize: 3.4 * width,
                                    color: '#858585',
                                  }}>
                                  {`${item.instruction_and_tools.instructor_pre_recorded_zoom} min`}
                                </Text>
                              </View>
                            </View>
                          </View>
                        )}
                      </View>
                    );
                  }}
                />
              ) : (
                <View style={Styles.courseRoundShape}>
                  <Text style={Styles.courseText}>{`No Data Found`}</Text>
                </View>
              )}
            </View>

            {/* </View>
          </ScrollView> */}
          </View>
        </CustomSAView>
      </View>

      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
          }}>
          <View
            style={{
              width: width * 90,
              height: height * 38,
              backgroundColor: '#ffffff',
              borderRadius: width * 3,
              paddingHorizontal: width * 3,
              paddingVertical: width * 3,
            }}>
            <Text
              style={{
                textAlign: 'center',
                color: '#000000',
                fontSize: width * 3.5,
                marginBottom: width * 4,
              }}>
              Documents Links
            </Text>
            <TouchableOpacity
              onPress={() => {
                setModalVisibleIndex(-1);
                setModalVisible(!modalVisible);
              }}
              style={{
                width: width * 8,
                height: width * 8,
                // backgroundColor: 'blue',
                position: 'absolute',
                top: width * 0.1,
                right: width * 0.1,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Entypo name="cross" size={width * 5} color="#000000" />
            </TouchableOpacity>
            <ScrollView
              style={{
                height: height * 30,
                // backgroundColor: '#157',
              }}>
              {modalVisibleIndex != -1 &&
                allChapterList[modalVisibleIndex].google_doc_url.map(
                  (item1, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        if (item1.submitted == 0) {
                          setModalVisible(!modalVisible);
                          setSelectedGoogleIndex(index);
                          setSelectedGoogleLink(item1);
                          setShowGoogleLink(true);
                        } else {
                          ToastUtility.showToast('Already Completed');
                        }
                      }}
                      style={{
                        backgroundColor:
                          item1.submitted == 1 ? '#16763E' : '#D1FFE4',
                        paddingHorizontal: 3 * width,
                        paddingVertical: 3 * width,
                        borderRadius: 2 * width,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginVertical: width * 2,
                      }}>
                      <Text
                        style={{
                          fontFamily: Fonts.Medium,
                          fontSize: 3.2 * width,
                          color: item1.submitted == 1 ? '#FFFFFF' : '#666666',
                          marginHorizontal: 1 * width,
                        }}>
                        {item1.title ? item1.title : 'Doc'}
                      </Text>
                      <Ionicons
                        name={
                          item1.submitted == 1
                            ? 'checkmark-done'
                            : 'arrow-forward-outline'
                        }
                        size={5 * width}
                        color={item1.submitted == 1 ? '#D1FFE4' : '#16763E'}
                      />
                    </TouchableOpacity>
                  ),
                )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showGoogleLink}>
        <View
          style={{
            width: '90%',
            padding: 3 * width,
            backgroundColor: ColorCode.white,
            alignSelf: 'center',
            borderRadius: 2 * width,
          }}>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 2 * width,
            }}>
            <Text
              style={{
                fontFamily: Fonts.Regular,
                fontSize: 4 * width,
                color: '#000',
                paddingVertical: 1 * width,
                textDecorationLine: 'underline',
              }}>
              {`Google Link`}
            </Text>
            <TouchableOpacity
              onPress={() => {
                // setSelectedGoogleLink(gdoc);
                setShowGoogleLink(false);
                setSelectedGoogleLink(null);
              }}
              style={{
                width: 8 * width,
                height: 8 * width,
                alignItems: 'center',
                justifyContent: 'center',
                // backgroundColor: ColorCode.primary,
              }}>
              <Ionicons name="close" size={5 * width} color={ColorCode.red} />
            </TouchableOpacity>
          </View>

          <Text
            style={{
              fontFamily: Fonts.Regular,
              fontSize: 3.4 * width,
              color: '#858585',
              paddingVertical: 1 * width,
            }}>
            {`${selectedGoogleLink?.title}`}
          </Text>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 2 * width,
            }}>
            <TouchableOpacity
              onPress={() => {
                markDoneGoogleAssignment(selectedGoogleLink);
              }}
              style={{
                width: '48%',
                height: 12 * width,
                borderRadius: 2 * width,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: ColorCode.primary,
              }}>
              <Text
                style={{
                  fontFamily: Fonts.Regular,
                  fontSize: 3.4 * width,
                  color: '#FFF',
                  paddingVertical: 1 * width,
                }}>
                {`Mark As Done`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                const encodedUrl = encodeURI(selectedGoogleLink.google_doc_url);
                // console.log(`Opening URL: ${encodedUrl}`);
                try {
                  await Linking.openURL(encodedUrl);
                } catch (error) {
                  console.error('Failed to open URL:', error);
                }
              }}
              style={{
                width: '48%',
                height: 12 * width,
                borderRadius: 2 * width,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: ColorCode.primary,
              }}>
              <Text
                style={{
                  fontFamily: Fonts.Regular,
                  fontSize: 3.4 * width,
                  color: '#FFF',
                  paddingVertical: 1 * width,
                }}>
                {`Open Doc`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <CustomProgress show={showProgress} />
    </Provider>
  );
};

const Styles = StyleSheet.create({
  circle: {
    width: 6 * height,
    height: 6 * height,
    borderRadius: 5 * height,
    backgroundColor: '#16763E',
  },
  circleText: {
    color: '#000000',
    fontSize: 4 * width,
    fontFamily: Fonts.Medium,
    marginStart: 2 * width,
  },
  headerText: {
    color: '#000000',
    fontSize: 4.4 * width,
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
    color: '#000000',
    fontSize: 3.4 * width,
    fontFamily: Fonts.Regular,
    // marginTop: 2 * width,
  },
  weekTextSelected: {
    color: '#FFFFFF',
    fontSize: 3.4 * width,
    fontFamily: Fonts.Regular,
    // marginTop: 2 * width,
  },
  uploadText: {
    color: '#FFFFFF',
    fontSize: 3.4 * width,
    fontFamily: Fonts.Regular,
    // marginTop: 2 * width,
  },
  markDoneText: {
    color: '#008A3D',
    fontSize: 3.4 * width,
    marginStart: 2 * width,
    fontFamily: Fonts.Medium,
    // marginTop: 2 * width,
  },
  courseText: {
    color: '#008A3D',
    fontSize: 4 * width,
    fontFamily: Fonts.Medium,
    marginTop: 4 * height,
  },
  courseRoundShape: {
    width: '100%',
    // height: '100%',
    // flex: 1,
    // height: 9 * height,
    marginTop: 2 * width,
    backgroundColor: 'transparent',
    borderRadius: 3 * width,
    alignItems: 'center',
    justifyContent: 'center',
    // flexDirection: 'row',
  },
});
export default OnlineSyllabusScreen;
