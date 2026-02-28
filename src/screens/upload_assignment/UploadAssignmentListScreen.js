import React, {Fragment, useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Provider} from 'react-native-paper';
import CustomStatus from '../../compenents/CustomStatus';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {Dropdown} from 'react-native-element-dropdown';
import width from '../../Units/width';
import Fonts from '../../utility/Fonts';
import height from '../../Units/height';
import ApiMethod from '../../api/ApiMethod';
import CustomProgress from '../../compenents/CustomProgress';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';

const weekAr = [
  {label: 'Week 1', value: 1},
  {label: 'Week 2', value: 2},
  {label: 'Week 3', value: 3},
  {label: 'Week 4', value: 4},
  {label: 'Week 5', value: 5},
  {label: 'Week 6', value: 6},
  {label: 'Week 7', value: 7},
];

const UploadAssignmentListScreen = ({navigation, route}) => {
  const [courseName, setCourseName] = useState(route.params.course_name);
  const [chapterList, setChapterList] = useState([]);
  const [allChapterList, setAllChapterList] = useState([]);
  const [chapterDayWise, setChapterDayWise] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(1);

  const [showProgress, setShowProgress] = useState(false);

  // useFocusEffect(
  //   React.useCallback(() => {
  //     // Define the function that should be called when the screen gains focus
  //     const handleFocus = () => {
  //       console.log('Screen focused. Calling apiCall...');
  //       apiCall(selectedWeek);
  //     };

  //     // Add an event listener for the 'focus' event
  //     const unsubscribe = navigation.addListener('focus', handleFocus);

  //     // Clean up the event listener when the component is unmounted
  //     return () => {
  //       console.log('Cleaning up event listener...');
  //       unsubscribe();
  //     };
  //   }, [navigation, selectedWeek, apiCall]),
  // );
  useEffect(() => {
    // This will be called when the component mounts
    apiCall(selectedWeek);

    // Subscribe to the focus event to call apiCall when the screen gains focus
    const unsubscribe = navigation.addListener('focus', () => {
      apiCall(selectedWeek);
    });

    // Clean up the event listener when the component is unmounted
    return () => {
      unsubscribe();
    };
  }, [navigation, selectedWeek]);

  const apiCall = week => {
    setShowProgress(true);
    ApiMethod.mySyllabus(
      `week=${week}`,
      pass => {
        setShowProgress(false);
        console.log('pass', pass);

        if (pass.status == 200) {
          setChapterList(pass.data);
          // let tt1 = pass.data;
          // tt1.sort((it1, it2) =>
          //   Number(it1.day) > Number(it2.day) ? 1 : -1,
          // );
          // console.log('ss', tt1);
          // setChapterList(tt1);

          // setDataList(pass.data);
          // let tt = {};
          // let days = [];
          // let chapList = [];
          // pass.data.map(item => {
          //   if(!chapList.some(it=> it.chapter_name == item.chapter_name)){
          //     chapList.push(item);
          //   }
          //   setAllChapterList(chapList);

          //   if (tt[item.day]) {
          //     let t1 = tt[item.day];
          //     t1.push(item);
          //     tt[item.day] = t1;
          //   } else {
          //     let t1 = [];
          //     t1.push(item);
          //     tt[item.day] = t1;
          //     days.push(item.day);
          //   }
          //   // if(tt.some(t=> t.da))
          //   setChapterList(days);
          //   setChapterDayWise(tt);
          //   console.log('tt', tt);
          //   console.log('days', days);
          // });
        } else {
          setChapterList([]);
        }
      },
      fail => {
        setShowProgress(false);
        setAllChapterList([]);
        setChapterList([]);
        setChapterDayWise([]);
      },
    );
  };

  // const apiCall = () => {
  //   setShowProgress(true);
  //   ApiMethod.myAssignments(
  //     pass => {
  //       setShowProgress(false);
  //       console.log('pass', pass);
  //       if (pass.status == 200) {
  //         setChapterList(pass.data);
  //       } else {
  //         setChapterList([]);
  //       }
  //     },
  //     fail => {
  //       setShowProgress(false);
  //       setChapterList([]);
  //     },
  //   );
  // };

  return (
    <Provider>
      <CustomStatus trans={true} isDark={true} color="#FFFFFF" />
      <View style={{flex: 1}}>
        <View
          style={{
            paddingTop: height * 4,
            width: '100%',
            height: 12 * height,
            backgroundColor: '#FFFFFF',
            paddingLeft: 6 * width,
            paddingRight: Platform.OS === 'ios' ? 13 * width : 6 * width,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <Text
            style={{
              color: '#000000',
              fontFamily: Fonts.SemiBold,
              fontSize: 4.5 * width,
              // marginRight: Platform.OS === 'ios' ? width * 20 : null,
            }}
            numberOfLines={1}>
            {`${courseName}`}
          </Text>

          <TouchableOpacity
            onPress={navigation.goBack}
            style={{
              width: 9 * width,
              height: 9 * width,
              margin: 2 * width,
              position: 'absolute',
              right: 0,
              top: width * 6,
              borderRadius: 2 * width,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#EFFFF6',
            }}>
            <Ionicons name="chevron-back" size={5 * width} color="#000000" />
          </TouchableOpacity>
        </View>

        <View
          style={{width: '100%', height: 1 * width, backgroundColor: '#F5F5F5'}}
        />
        <View
          style={{
            flex: 1,
            width: '100%',
            backgroundColor: '#FFFFFF',
            paddingVertical: 3 * width,
          }}>
          <View
            style={{
              width: '100%',
              height: 5 * height,
              alignItems: 'center',
              flexDirection: 'row',
              paddingHorizontal: 5 * width,
              // backgroundColor: '#ada',
              justifyContent: 'space-between',
            }}>
            <Text style={Styles.headerText1}>{'Chapters'}</Text>

            {/* <TouchableOpacity
              style={{
                flexDirection: 'row',
                width: '23%',
                justifyContent: 'space-between',
              }}>
              <Text style={Styles.weekText}>{'Week 1'}</Text>
              <Ionicons name="chevron-down" size={5 * width} color="#000000" />
            </TouchableOpacity> */}

            <View
              style={{
                width: '30%',
                // width: '23%',
                height: 6 * height,
                // borderColor: '#BBBBBB',
                // borderWidth: 1,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Dropdown
                style={{
                  flex: 1,
                  width: '100%',
                  backgroundColor: '#F7F8F800',
                }}
                placeholderStyle={{
                  fontSize: 4 * width,
                  // paddingHorizontal: 2 * width,
                  fontFamily: Fonts.SemiBold,
                  color: '#D8D8D8',
                }}
                selectedTextStyle={{
                  fontSize: 4 * width,
                  paddingHorizontal: 2 * width,
                  fontFamily: Fonts.SemiBold,
                  textAlign: 'right',
                  color: '#1D1D1D',
                }}
                itemContainerStyle={{
                  paddingVertical: 0,
                  height: 6 * height,
                  // backgroundColor: '#afa',
                  borderBottomWidth: 1,
                  borderBlockColor: '#EBEBEB',
                  paddingTop: 0,
                  padding: 0,
                }}
                itemTextStyle={{
                  margin: 0,
                  height: 5 * width,
                  marginTop: -1 * width,
                  fontSize: 4 * width,
                  paddingHorizontal: 0 * width,
                  fontFamily: Fonts.Regular,
                  color: '#1D1D1D',
                  // paddingVertical: 0,
                  // paddingTop: 0,
                }}
                data={weekAr}
                showsVerticalScrollIndicator={false}
                maxHeight={30 * height}
                labelField="label"
                valueField="value"
                placeholder={
                  selectedWeek || selectedWeek == '' ? 'Select Week' : '...'
                }
                value={selectedWeek}
                onChange={item => {
                  setSelectedWeek(item.value);
                  apiCall(item.value);
                }}
                containerStyle={{
                  backgroundColor: '#FFFFFF',
                  marginTop: Platform.OS == 'android' ? -0 * width : 0,
                  borderRadius: 1 * width,
                }}
                renderRightIcon={() => (
                  <Ionicons
                    name="chevron-down"
                    size={5 * width}
                    color="#000000"
                  />
                )}
              />
            </View>
          </View>

          {chapterList.length > 0 ? (
            <FlatList
              data={chapterList}
              style={{width: '100%', paddingHorizontal: 5 * width}}
              renderItem={({item, index}) => {
                return (
                  <View
                    key={index}
                    style={{
                      width: '100%',
                      paddingVertical: 4 * width,
                      borderBottomWidth: 1,
                      borderColor: '#EDEDED',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <View style={{flex: 1}}>
                      <Text style={Styles.headerText1} numberOfLines={1}>
                        {item.chapter_name}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          // justifyContent: 'center',
                          // backgroundColor: '#aad',
                        }}>
                        <MaterialIcons
                          name={
                            item.mark_done_student == '0'
                              ? 'check-box-outline-blank'
                              : 'check-box'
                          } //check-box
                          size={6 * width}
                          color={
                            item.mark_done_student == '0'
                              ? '#888686'
                              : '#008A3D'
                          }
                        />
                        <View style={{flex: 1, justifyContent: 'center'}}>
                          <Text
                            style={
                              item.mark_done_student == '0'
                                ? Styles.markNotDoneText
                                : Styles.markDoneText
                            }>
                            {'Mark as done'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {item.resubmit == 2 ? (
                      <TouchableOpacity
                        onPress={() => {
                          navigation.navigate('ReUploadAssignment', {
                            // data: item,
                            data: {
                              id: item.assignment_id,
                              syllabus_id: item.id,
                              assigned_date: item.assigned_date,
                              title: item.chapter_name,
                            },
                          });
                        }}
                        style={{
                          width: '42%',
                          height: 6 * height,
                          borderRadius: 3 * width,
                          backgroundColor:
                            item.mark_done == '1' ? '#008A3D' : '#F0F0F0',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <Text
                          style={
                            item.mark_done == '1'
                              ? Styles.uploadText
                              : Styles.uploadTextGrey
                          }>
                          {'Re-Upload'}
                        </Text>
                      </TouchableOpacity>
                    ) : item.mark_done_student == '1' ? (
                      <View
                        style={{
                          width: '42%',
                          height: 6 * height,
                          borderRadius: 3 * width,
                          // backgroundColor: '#008A3D77',
                          backgroundColor: '#F0F0F0',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'row',
                        }}>
                        <Text style={Styles.uploadTextGrey}>{'Uploaded'}</Text>
                        <Ionicons
                          name="checkmark-done-sharp"
                          size={5 * width}
                          color="#000000"
                          style={{marginStart: 2 * width}}
                        />
                      </View>
                    ) : item.mark_done == '1' ? (
                      // && item.mark_done_student == '0'
                      <TouchableOpacity
                        onPress={() => {
                          if (item.mark_done == '1') {
                            navigation.navigate('UploadAssignment', {
                              data: item,
                            });
                          }
                        }}
                        style={{
                          width: '42%',
                          height: 6 * height,
                          borderRadius: 3 * width,
                          backgroundColor:
                            item.mark_done == '1' ? '#008A3D' : '#F0F0F0',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <Text
                          style={
                            item.mark_done == '1'
                              ? Styles.uploadText
                              : Styles.uploadTextGrey
                          }>
                          {'Upload'}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View></View>
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
      </View>

      <CustomProgress show={showProgress} />
    </Provider>
  );
};

const Styles = StyleSheet.create({
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
    fontSize: 4 * width,
    fontFamily: Fonts.SemiBold,
    // marginTop: 2 * width,
  },
  uploadText: {
    color: '#FFFFFF',
    fontSize: 3.4 * width,
    fontFamily: Fonts.Regular,
    // marginTop: 2 * width,
  },
  uploadTextGrey: {
    color: '#000000',
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
  markNotDoneText: {
    color: '#888686',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 3 * width,
    alignItems: 'center',
    justifyContent: 'center',
    // flexDirection: 'row',
  },
});
export default UploadAssignmentListScreen;
