/* eslint-disable react/no-unstable-nested-components */
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  // Modal,
} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';

import moment from 'moment';
import ColorCode from '../../utility/ColorCode';
import Fonts from '../../utility/Fonts';
import ApiMethod from '../../api/ApiMethod';
import width from '../../Units/width';
import { Modal } from 'react-native-paper';
import ToastUtility from '../../utility/ToastUtility';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ConstData from '../../utility/ConstData';
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';
import height from '../../Units/height';
import StorageUtility from '../../utility/StorageUtility';

const MonthlyCalendarVirtual = props => {
  const [fromDate, setFromDate] = useState(moment().format('yyyy/MM/DD'));
  const [toDate, setToDate] = useState(moment().format('yyyy/MM/DD'));

  const [selectedMonth, setSelectedMonth] = useState({
    id: moment().format('YYYYMM'),
    month_name: moment().format('MMMM'),
    year: moment().format('YYYY'),
  });
  const [calendarData, setCalendarData] = useState([]);
  const [ticketList, setTicketList] = useState([]);
  const [mySchedules, setMySchedules] = useState([]);
  const [dateSlotList, setDateSlotList] = useState([]);
  const [timeSlotList, setTimeSlotList] = useState([]);
  const [datesInMonth, setDatesInMonth] = useState([]);

  const [quizList, setQuizList] = useState([]);
  const [quizSelectedList, setQuizSelectedList] = useState([]);

  const [showDatePopup, setShowDatePopup] = useState(false);
  const [showDatePopup1, setShowDatePopup1] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slotDate, setSlotDate] = useState('');
  const [slotTime, setSlotTime] = useState(null);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const [user, setUser] = useState(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const flatListRef = useRef(null);
  console.log('keyboardHeight', keyboardHeight);

  useEffect(() => {
    let keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', e => {
      setKeyboardHeight(Platform.OS == 'ios' ? e.endCoordinates.height : 0);
    });
    let keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      },
    );

    // Generate the seven months starting from the current month
    let initialData = generateMonths();
    setCalendarData(initialData);

    console.log('initialData', initialData);

    // Select the current month and generate its dates
    generateDatesForSelectedMonth(initialData[0]);
    getCalendarData();

    getUserDetail();

    return () => {
      // ToastUtility.showToast('dsfdsf')
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const getUserDetail = async () => {
    var uu = await StorageUtility.getUser();
    console.log(uu);
    setUser(uu);

  };


  const getCalendarData = () => {
    props.setProgress(true);
    ApiMethod.getCalendarData(
      pass => {
        console.log(JSON.stringify(pass));
        props.setProgress(false);
        if (pass.status == 200) {
          setTicketList(pass.slots);
          setMySchedules(pass.schedules);
          var d1 = [];
          pass.slots.map(s => {
            console.log(
              'find',
              s.date,
              d1.some(d => d.value == s.date),
            );
            if (!d1.some(d => d.value == s.date)) {
              d1.push({label: s.date, value: s.date});
            }
          });
          setDateSlotList(d1);
          
        }
        getQuiz();
      },
      fail => {
        props.setProgress(false);
      },
    );
  };

  const getQuiz = () => {
    props.setProgress(true);
    ApiMethod.quizBundle(
      pass => {
        props.setProgress(false);
        console.log(JSON.stringify(pass));

        let t1 = [];
        pass.data.map(d1 => {
          d1?.syllabus.map(s1 => {
            s1?.step?.step_quizzes.map(q1=>{
              if (q1?.attempt_history.length > 0) {
                console.log(q1);
                console.log("-=-=-",q1.quiz);
                console.log(t1.some(q11 => q11.quiz.id == q1.quiz.id));
                if (!t1.find(q11 => q11.quiz.id == q1.quiz.id)) {
                  t1.push({...q1, title: q1.quiz.title});
                  console.log('Adding')
                }
              }
            })
          });
        });

        console.log('ttt', t1);
        setQuizList(t1);
      },
      fail => {
        props.setProgress(false);
      },
    );
  };

  const updateTimeSlot = date => {
    var t1 = ticketList.filter(t => t.date == date);
    var t2 = [];
    t1.map(t => {
      console.log(`${t.start_time} - ${t.end_time}`);
      t2.push({
        label: `${t.start_time} - ${t.end_time}`,
        value: `${t.start_time} - ${t.end_time}`,
        data: t,
      });
    });
    setTimeSlotList(t2);
  };

  // Generate seven months starting from the current month
  const generateMonths = () => {
    let monthsArray = [];
    for (let i = 0; i < 12; i++) {
      let month = moment().add(i, 'months');
      monthsArray.push({
        id: month.format('YYYYMM'),
        month_name: month.format('MMMM'),
        year: month.format('YYYY'),
      });
    }
    return monthsArray;
  };

  // Generate all dates for the selected month
  const generateDatesForSelectedMonth = selectedMonth => {
    let daysInMonth = moment(
      `${selectedMonth.year}-${selectedMonth.month_name}`,
      'YYYY-MMMM',
    ).daysInMonth();
    let datesArray = [];
    for (let i = 1; i <= daysInMonth; i++) {
      datesArray.push({
        date: i,
        completeDate: moment(
          `${selectedMonth.year}-${selectedMonth.month_name}-${i}`,
          'YYYY-MMMM-D',
        ).format('YYYY-MM-DD'),
      });
    }
    setDatesInMonth(datesArray);
    console.log('dates in particular months--->', datesArray);
  };

  // Handle month selection and update the dates
  const handleMonthSelection = (month,index) => {
    setSelectedMonth(month);
    console.log('month', month);
    generateDatesForSelectedMonth(month);
    flatListRef.current.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0, // This ensures that the selected item is aligned to the start
    });
  };

  const renderMonthItem = ({item, index}) => (
    <Pressable
      style={[
        styles.monthContainer,
        selectedMonth.id === item.id && {
          backgroundColor: ColorCode.primary,
          borderRadius: width * 6,
        },
      ]}
      onPress={() => handleMonthSelection(item, index)}>
      <Text
        style={[
          styles.monthName,
          selectedMonth.id === item.id && {color: ColorCode.white},
        ]}>
        {item.month_name.substring(0, 3)}
      </Text>
      <Text
        style={[
          styles.year,
          selectedMonth.id === item.id && {color: ColorCode.white},
        ]}>
        {item.year.substring(2)}
      </Text>
    </Pressable>
  );

  const renderGrid = () => {
    const firstDayOfMonth = moment(
      `${selectedMonth.year}-${selectedMonth.month_name}`,
      'YYYY-MMMM',
    )
      .startOf('month')
      .day();

    const daysInMonth = moment(
      `${selectedMonth.year}-${selectedMonth.month_name}`,
      'YYYY-MMMM',
    ).daysInMonth();

    // Create an array to store the grid items, filling in empty slots where needed
    let gridArray = [];

    // Fill the empty slots before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      gridArray.push(null); // null means an empty cell
    }

    // Fill in the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      gridArray.push({
        date: i,
        completeDate: moment(
          `${selectedMonth.year}-${selectedMonth.month_name}-${i}`,
          'YYYY-MMMM-D',
        ).format('YYYY-MM-DD'),
      });
    }

    // Ensure there are exactly 35 cells (7 columns × 5 rows)
    while (gridArray.length < 35) {
      gridArray.push(null); // Fill remaining cells with empty slots
    }

    // Group the grid into rows of 7 days
    const rows = [];
    for (let i = 0; i < gridArray.length; i += 7) {
      rows.push(gridArray.slice(i, i + 7));
    }
    // const ft = ticketList.filter(t => t.date === item.completeDate);
    // const ticketCount = ft.length;
    // let availSlot = 0;
    // ft.map(t => {
    //   availSlot += t.available_slot;
    // });

    return (
      <View style={styles.gridContainer}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.gridRow}>
            {row.map((item, colIndex) => (
              <View
                key={colIndex}
                style={[
                  styles.gridCell,
                  // Check if the current cell has tickets and change background color to pink if true
                  item &&
                    ticketList.filter(t => t.date === item.completeDate)
                      .length > 0 &&
                    ticketList
                      .filter(t => t.date === item.completeDate)
                      .reduce((a, v) => (a = a + v.prix), 0) > 0 && {
                      backgroundColor: '#e4fdec',
                    },
                ]}>
                {item ? renderTicketCount(item) : null}
                {mySchedules.filter(s => s.slot.date == item?.completeDate)
                  .length > 0 &&
                  (mySchedules.filter(s => s.slot.date == item?.completeDate)[0]
                    .is_present == '1' ? (
                    <View
                      style={{
                        width: 6 * width,
                        height: 6 * width,
                        position: 'absolute',
                        end: 0,
                      }}>
                      <Ionicons
                        name="checkmark-circle"
                        size={5 * width}
                        color={ColorCode.primary}
                      />
                    </View>
                  ) : (
                    <View
                      style={{
                        width: 6 * width,
                        height: 6 * width,
                        position: 'absolute',
                        end: 0,
                      }}>
                      <Ionicons
                        name="checkmark-circle"
                        size={5 * width}
                        color={ColorCode.yellow}
                      />
                    </View>
                  ))}
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const renderTicketCount = item => {
    const ft = ticketList.filter(t => t.date === item.completeDate);
    const ticketCount = ft.length;
    let availSlot = 0;
    ft.map(t => {
      availSlot += t.available_slot;
    });

    return (
      <View style={styles.ticketBox}>
        <Text style={styles.dateText}>{item.date}</Text>
        {ticketCount > 0 && availSlot > 0 && (
          <TouchableOpacity
            onPress={() => {
              onDatePress(ft[0]);
            }}
            style={styles.ticketCountContainer}>
            <Text style={styles.ticketCountText}>{availSlot}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const onDatePress = data => {
    console.log('selectedDate', data);
    if (data.is_scheduled) {
      ToastUtility.showToast('1 - 1 class already scheduled for selected date');
    } else {
      updateTimeSlot(data.date);
      // setSelectedDate(data);
      setShowDatePopup(true);
    }
  };

  const schedule1to1 = () => {
    props.setProgress(true);
    var t2 = [];
    quizList.map(q => {
      if (quizSelectedList.includes(q.quiz_bank_id)) {
        t2.push(q.step_id);
      }
    });
    console.log('=-=-=--', t2);
    ApiMethod.schedule1to1(
      {
        title: title,
        slot_id: selectedDate.id,
        comments: comment,
        step_id: t2,
        attempt_quiz: quizSelectedList,
      },
      pass => {
        props.setProgress(false);
        if (pass.status == 200) {
          setShowDatePopup(false);
          setShowDatePopup1(false);
          
          getCalendarData();

          setTitle('');
          setSlotDate('');
          setQuizSelectedList([]);
          setSlotTime(null);
          setSelectedDate(null);
          setComment("");
        }
        ToastUtility.showToast(pass.message);
      },
      fail => {
        props.setProgress(false);
      },
    );
  };

  const unSelect = item => {
    console.log(item);
    const t1 = [...quizSelectedList];

    var p = t1.indexOf(item[0]);
    t1.splice(p, 1);

    setQuizSelectedList(t1);
  };

  return (
    <View style={styles.page}>
      <ScrollView>
        <View style={{flex: 1}}>
          <View style={styles.monthMainContainer}>
            <FlatList
              ref={flatListRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              data={calendarData}
              renderItem={renderMonthItem}
              keyExtractor={item => item.id.toString()}
              // contentContainerStyle={styles.flatlistContainer}
              // onScroll={onScroll}
              // scrollEventThrottle={16}
            />
          </View>
          <View
            style={{
              alignSelf: 'center',
              width: '95%',
              height: 10 * width,
              backgroundColor: '#E6E6E6',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 2 * width,
            }}>
            <Text
              style={{
                width: 13.5 * width,
                textAlign: 'center',
                color: ColorCode.black,
                fontFamily: Fonts.Medium,
                fontSize: 3.4 * width,
              }}>
              SUN
            </Text>
            <View
              style={{
                width: 1,
                height: '50%',
                backgroundColor: ColorCode.black,
              }}
            />
            <Text
              style={{
                width: 13.5 * width,
                textAlign: 'center',
                color: ColorCode.black,
                fontFamily: Fonts.Medium,
                fontSize: 3.4 * width,
              }}>
              MON
            </Text>
            <View
              style={{
                width: 1,
                height: '50%',
                backgroundColor: ColorCode.black,
              }}
            />
            <Text
              style={{
                width: 13.5 * width,
                textAlign: 'center',
                color: ColorCode.black,
                fontFamily: Fonts.Medium,
                fontSize: 3.4 * width,
              }}>
              TUE
            </Text>
            <View
              style={{
                width: 1,
                height: '50%',
                backgroundColor: ColorCode.black,
              }}
            />
            <Text
              style={{
                width: 13.5 * width,
                textAlign: 'center',
                color: ColorCode.black,
                fontFamily: Fonts.Medium,
                fontSize: 3.4 * width,
              }}>
              WED
            </Text>
            <View
              style={{
                width: 1,
                height: '50%',
                backgroundColor: ColorCode.black,
              }}
            />
            <Text
              style={{
                width: 13.5 * width,
                textAlign: 'center',
                color: ColorCode.black,
                fontFamily: Fonts.Medium,
                fontSize: 3.4 * width,
              }}>
              THU
            </Text>
            <View
              style={{
                width: 1,
                height: '50%',
                backgroundColor: ColorCode.black,
              }}
            />
            <Text
              style={{
                width: 13.5 * width,
                textAlign: 'center',
                color: ColorCode.black,
                fontFamily: Fonts.Medium,
                fontSize: 3.4 * width,
              }}>
              FRI
            </Text>
            <View
              style={{
                width: 1,
                height: '50%',
                backgroundColor: ColorCode.black,
              }}
            />
            <Text
              style={{
                width: 13.5 * width,
                textAlign: 'center',
                color: ColorCode.black,
                fontFamily: Fonts.Medium,
                fontSize: 3.4 * width,
              }}>
              SAT
            </Text>
          </View>
          <View style={styles.dateGridContainer}>
            <View>{renderGrid()}</View>
          </View>

          <View
            style={{
              width: '100%',
              alignItems: 'center',
              paddingVertical: 2 * width,
            }}>
            <Text
              style={{
                width: '94%',
                textAlign: 'left',
                color: ColorCode.black,
                fontFamily: Fonts.Medium,
                fontSize: 4 * width,
              }}
              numberOfLines={2}>
              {'My Schedules'}
            </Text>

            {mySchedules.length > 0 ? (
              mySchedules.map((item, index) => {
                return (
                  <View
                    key={index}
                    style={{
                      width: '96%',
                      alignSelf: 'center',
                      // height: 50,
                      // backgroundColor: ColorCode.accent,
                      borderRadius: 2 * width,
                      borderWidth: 1,
                      paddingHorizontal: 3 * width,
                      paddingVertical: 2 * width,
                      borderColor: ColorCode.greyDDD,
                      marginVertical: 2 * width,
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text
                        style={{
                          fontFamily: Fonts.Medium,
                          fontSize: 3.4 * width,
                          color: ColorCode.black,
                          flex: 1,
                        }}>
                        {`${item.title}`}
                      </Text>
                      <View
                        style={{
                          marginStart: 2 * width,
                          backgroundColor:
                            item.is_present == '1'
                              ? ColorCode.primary
                              : ColorCode.yellow,
                          paddingHorizontal: 2 * width,
                          paddingVertical: 1 * width,
                          borderRadius: 1 * width,
                          height: 7 * width,
                        }}>
                        <Text
                          style={{
                            fontFamily: Fonts.Medium,
                            textAlign: 'center',
                            fontSize: 3 * width,
                            color:
                              item.is_present == '1'
                                ? ColorCode.white
                                : ColorCode.black,
                          }}>
                          {`${
                            item.is_present == '1' ? 'Completed' : 'Scheduled'
                          }`}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={{
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexDirection: 'row',
                        marginTop: 1 * width,
                        // paddingHorizontal: 2 * width,
                      }}>
                      <View style={{width: '30%'}}>
                        <Text
                          style={{
                            color: ColorCode.grey888,
                            fontFamily: Fonts.Regular,
                            fontSize: 3 * width,
                          }}
                          numberOfLines={2}>
                          {'Date'}
                        </Text>
                        <Text
                          style={{
                            color: ColorCode.black,
                            fontFamily: Fonts.Medium,
                            fontSize: 3.4 * width,
                          }}
                          numberOfLines={2}>
                          {item.slot?.date}
                        </Text>
                      </View>
                      <View style={{width: '30%', alignItems: 'center'}}>
                        <Text
                          style={{
                            color: ColorCode.grey888,
                            fontFamily: Fonts.Regular,
                            fontSize: 3 * width,
                          }}
                          numberOfLines={2}>
                          {'Start Time'}
                        </Text>
                        <Text
                          style={{
                            color: ColorCode.black,
                            fontFamily: Fonts.Medium,
                            fontSize: 3.4 * width,
                          }}
                          numberOfLines={2}>
                          {item.slot?.start_time}
                        </Text>
                      </View>
                      <View style={{width: '30%', alignItems: 'flex-end'}}>
                        <Text
                          style={{
                            color: ColorCode.grey888,
                            fontFamily: Fonts.Regular,
                            fontSize: 3 * width,
                          }}
                          numberOfLines={2}>
                          {'End Time'}
                        </Text>
                        <Text
                          style={{
                            color: ColorCode.black,
                            fontFamily: Fonts.Medium,
                            fontSize: 3.4 * width,
                          }}
                          numberOfLines={2}>
                          {item.slot?.end_time}
                        </Text>
                      </View>
                    </View>
                    <View style={{width: '100%'}}>
                      <Text
                        style={{
                          color: ColorCode.grey888,
                          fontFamily: Fonts.Regular,
                          fontSize: 3 * width,
                        }}
                        numberOfLines={2}>
                        {'Comment'}
                      </Text>
                      <Text
                        style={{
                          color: ColorCode.black,
                          fontFamily: Fonts.Medium,
                          fontSize: 3.4 * width,
                        }}
                        numberOfLines={2}>
                        {item.comments}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text
                style={{
                  height: 20 * width,
                  textAlignVertical: 'center',
                  color: ColorCode.grey888,
                  fontFamily: Fonts.Regular,
                  fontSize: 3.4 * width,
                }}
                numberOfLines={2}>
                {'No Schedules'}
              </Text>
            )}
          </View>
          <View style={{width: '100%', height: 20 * width}} />
        </View>
      </ScrollView>
      {!showDatePopup && !showDatePopup1 && (
        <TouchableOpacity
          onPress={() => {
            if (ticketList.length > 0) {
              setShowDatePopup1(true);
            } else {
              ToastUtility.showToast('No slots available');
            }
          }}
          style={[
            {
              width: 26 * width,
              height: 13 * width,
              position: 'absolute',
              right: 6 * width,
              bottom: 6 * width,
              backgroundColor: ColorCode.primary,
              borderRadius: 10 * width,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
            },
            ConstData.ELEVATION_STYLE,
          ]}>
          <Ionicons name={'add'} size={7 * width} color="#FFF" />
          <Text
            style={{
              fontFamily: Fonts.Medium,
              fontSize: 4 * width,
              color: ColorCode.white,
              marginStart: 1 * width,
              marginTop: 3,
            }}>
            New
          </Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={showDatePopup}
        // visible={true}
        onDismiss={() => {
          setShowDatePopup(false);
          setTitle('');
          setSlotDate('');
          setQuizSelectedList([]);
          setSlotTime(null);
          setSelectedDate(null);
        }}>
        <View
          onPress={() => Keyboard.dismiss()}
          style={{
            alignSelf: 'center',
            width: '100%',
            // height: 30 * height,
            // backgroundColor: '#FFF',
            // borderRadius: 3 * width,
            // padding: 3 * width,
            // borderTopStartRadius: 3 * width,
            // borderTopEndRadius: 3 * width,
            // marginBottom: keyboardHeight,
          }}>
          <ScrollView
            // onPress={() => Keyboard.dismiss()}
            nestedScrollEnabled={true}
            style={{
              width:'90%',
              alignSelf: 'center',
              // height: 30 * height,
              minHeight: 40 * height,
              backgroundColor: '#FFF',
              borderRadius: 3 * width,
              padding: 3 * width,
              marginBottom: keyboardHeight,
            }}>
            <Text
              style={{
                // width: 13.5 * width,
                textAlign: 'center',
                color: ColorCode.black,
                fontFamily: Fonts.Medium,
                fontSize: 4 * width,
                marginVertical: 2 * width,
              }}>
              {'Schedule 1 - 1'}
            </Text>

            <TextInput
              style={{
                width: '100%',
                height: 13 * width,
                borderWidth: 1,
                borderColor: ColorCode.greyDDD,
                borderRadius: 2 * width,
                marginTop: 3 * width,
                paddingHorizontal: 4 * width,
                color: ColorCode.black,
                fontFamily: Fonts.Regular,
                fontSize: 3.4 * width,
              }}
              placeholder="Enter Title"
              placeholderTextColor={ColorCode.grey888}
              value={title}
              onChangeText={t => {
                setTitle(t);
              }}
            />

            {user?.type == 'virtual' && (
              <View
                style={{
                  width: '100%',
                  // width: '23%',
                  height: 6 * height,
                  // borderColor: '#BBBBBB',
                  // borderWidth: 1,
                  // flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 3 * width,
                }}>
                <MultiSelect
                  style={{
                    flex: 1,
                    width: '100%',
                    // height: 6 * height,
                    backgroundColor: '#F7F8F800',
                    paddingHorizontal: 4 * width,
                    borderWidth: 1,
                    borderColor: ColorCode.greyDDD,
                    borderRadius: 2 * width,
                    flexDirection: 'column',
                  }}
                  placeholderStyle={{
                    fontSize: 3.4 * width,
                    fontFamily: Fonts.Regular,
                    color: '#D8D8D8',
                  }}
                  selectedTextStyle={{
                    fontSize: 3.4 * width,
                    fontFamily: Fonts.Regular,
                    color: ColorCode.black,
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
                    // margin: 0,
                    height: 5 * width,
                    marginTop: -1 * width,
                    fontSize: 3.4 * width,
                    fontFamily: Fonts.Regular,
                    color: ColorCode.black,
                    // paddingVertical: 0,
                    // paddingTop: 0,
                  }}
                  data={quizList}
                  showsVerticalScrollIndicator={false}
                  maxHeight={26 * height}
                  labelField="title"
                  valueField="quiz_bank_id"
                  onFocus={() => {
                    Keyboard.dismiss();
                  }}
                  placeholder={
                    quizSelectedList.length == 0
                      ? 'Select Quiz'
                      : `${quizSelectedList.length} Selected`
                  }
                  value={quizSelectedList}
                  onChange={item => {
                    setQuizSelectedList(item);
                    // setSlotTime(item.value);
                    // console.log('Slot Time Data', item.data);
                    // setSelectedDate(item.data);
                    // updateTimeSlot(item.value);
                  }}
                  containerStyle={{
                    backgroundColor: '#FFFFFF',
                    // marginTop: Platform.OS == 'android' ? -0 * width : 15,
                    borderRadius: 1 * width,
                  }}
                  renderRightIcon={() => (
                    <Ionicons
                      name="chevron-down"
                      size={5 * width}
                      color="#000000"
                    />
                  )}
                  visibleSelectedItem={false}
                />
              </View>
            )}

            {user?.type == 'virtual' && quizSelectedList.length > 0 && (
              <ScrollView style={{maxHeight: 30 * height}}>
                <View
                  style={{
                    flexWrap: 'wrap',
                    flexDirection: 'row',
                  }}>
                  {quizList.map((item, pos) => {
                    // console.log(item);
                    var found = quizSelectedList.filter(
                      q => q == item.quiz_bank_id,
                    );
                    // console.log(found);
                    if (found.length > 0) {
                      return (
                        <TouchableOpacity onPress={() => unSelect(found)}>
                          <View
                            key={pos}
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'center',
                              alignItems: 'center',
                              borderRadius: 5 * width,
                              backgroundColor: 'white',
                              marginTop: 2 * width,
                              marginRight: 2 * width,
                              paddingHorizontal: 3 * width,
                              paddingVertical: 1 * width,
                              borderWidth: 1,
                              borderColor: ColorCode.greyDDD,
                            }}>
                            <Text
                              style={{
                                marginRight: 5,
                                fontSize: 3.4 * width,
                                fontFamily: Fonts.Regular,
                                color: ColorCode.black,
                              }}
                              numberOfLines={1}>
                              {item.title}
                            </Text>
                            <Ionicons
                              color="black"
                              name="close"
                              size={6 * width}
                            />
                          </View>
                        </TouchableOpacity>
                      );
                    } else null;
                  })}
                </View>
              </ScrollView>
            )}

            <View
              style={{
                width: '100%',
                // width: '23%',
                height: 6 * height,
                // borderColor: '#BBBBBB',
                // borderWidth: 1,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: ColorCode.greyDDD,
                borderRadius: 2 * width,
                marginTop: 3 * width,
              }}>
              <Dropdown
                style={{
                  flex: 1,
                  width: '100%',
                  backgroundColor: '#F7F8F800',
                  paddingHorizontal: 4 * width,
                }}
                placeholderStyle={{
                  fontSize: 3.4 * width,
                  fontFamily: Fonts.Regular,
                  color: '#D8D8D8',
                }}
                selectedTextStyle={{
                  fontSize: 3.4 * width,
                  fontFamily: Fonts.Regular,
                  color: ColorCode.black,
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
                  // margin: 0,
                  height: 5 * width,
                  marginTop: -1 * width,
                  fontSize: 3.4 * width,
                  fontFamily: Fonts.Regular,
                  color: ColorCode.black,
                  // paddingVertical: 0,
                  // paddingTop: 0,
                }}
                data={timeSlotList}
                showsVerticalScrollIndicator={false}
                maxHeight={26 * height}
                labelField="label"
                valueField="value"
                placeholder={slotTime == null ? 'Select Time' : ''}
                value={slotTime}
                onFocus={() => {
                  Keyboard.dismiss();
                }}
                onChange={item => {
                  setSlotTime(item.value);
                  console.log('Slot Time Data', item.data);
                  setSelectedDate(item.data);
                  // updateTimeSlot(item.value);
                }}
                containerStyle={{
                  backgroundColor: '#FFFFFF',
                  // marginTop: Platform.OS == 'android' ? -0 * width : 0,
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

            <View
              style={{
                width: '100%',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: 'row',
                marginTop: 2 * width,
                paddingHorizontal: 2 * width,
              }}>
              <View style={{width: '100%'}}>
                <Text
                  style={{
                    color: ColorCode.grey888,
                    fontFamily: Fonts.Regular,
                    fontSize: 3 * width,
                  }}
                  numberOfLines={2}>
                  {'Class'}
                </Text>
                <Text
                  style={{
                    color: ColorCode.black,
                    fontFamily: Fonts.Medium,
                    fontSize: 3.4 * width,
                  }}
                  numberOfLines={2}>
                  {selectedDate?.class
                    ? selectedDate?.class.name
                    : 'All Classes'}
                </Text>
              </View>
            </View>

            {selectedDate && (
              <View
                style={{
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  marginTop: 2 * width,
                  paddingHorizontal: 2 * width,
                }}>
                <View style={{width: '30%'}}>
                  <Text
                    style={{
                      color: ColorCode.grey888,
                      fontFamily: Fonts.Regular,
                      fontSize: 3 * width,
                    }}
                    numberOfLines={2}>
                    {'Date'}
                  </Text>
                  <Text
                    style={{
                      color: ColorCode.black,
                      fontFamily: Fonts.Medium,
                      fontSize: 3.4 * width,
                    }}
                    numberOfLines={2}>
                    {selectedDate?.date}
                  </Text>
                </View>
                <View style={{width: '30%', alignItems: 'center'}}>
                  <Text
                    style={{
                      color: ColorCode.grey888,
                      fontFamily: Fonts.Regular,
                      fontSize: 3 * width,
                    }}
                    numberOfLines={2}>
                    {'Start Time'}
                  </Text>
                  <Text
                    style={{
                      color: ColorCode.black,
                      fontFamily: Fonts.Medium,
                      fontSize: 3.4 * width,
                    }}
                    numberOfLines={2}>
                    {selectedDate?.start_time}
                  </Text>
                </View>
                <View style={{width: '30%', alignItems: 'flex-end'}}>
                  <Text
                    style={{
                      color: ColorCode.grey888,
                      fontFamily: Fonts.Regular,
                      fontSize: 3 * width,
                    }}
                    numberOfLines={2}>
                    {'End Time'}
                  </Text>
                  <Text
                    style={{
                      color: ColorCode.black,
                      fontFamily: Fonts.Medium,
                      fontSize: 3.4 * width,
                    }}
                    numberOfLines={2}>
                    {selectedDate?.end_time}
                  </Text>
                </View>
              </View>
            )}

            <View
              style={{
                width: '100%',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: 'row',
                marginTop: 2 * width,
                paddingHorizontal: 2 * width,
              }}>
              <View style={{width: '100%'}}>
                <Text
                  style={{
                    color: ColorCode.grey888,
                    fontFamily: Fonts.Regular,
                    fontSize: 3 * width,
                  }}
                  numberOfLines={2}>
                  {'Comment'}
                </Text>
                <Text
                  style={{
                    color: ColorCode.black,
                    fontFamily: Fonts.Medium,
                    fontSize: 3.4 * width,
                  }}>
                  {selectedDate?.comments ? selectedDate?.comments : 'N/A'}
                </Text>
              </View>
            </View>

            <TextInput
              style={{
                width: '100%',
                height: 24 * width,
                borderWidth: 1,
                borderColor: ColorCode.greyDDD,
                borderRadius: 2 * width,
                marginTop: 3 * width,
                paddingHorizontal: 4 * width,
                color: ColorCode.black,
                fontFamily: Fonts.Regular,
                fontSize: 3.4 * width,
                textAlignVertical: 'top',
              }}
              multiline={true}
              placeholder="Enter notes (if any...)"
              placeholderTextColor={ColorCode.grey888}
              value={comment}
              onChangeText={t => {
                setComment(t);
              }}
            />

            <TouchableOpacity
              onPress={() => {
                if (title.trim().length == 0) {
                  ToastUtility.showToast('Enter Title');
                } else if (slotTime == null) {
                  ToastUtility.showToast('Select Time');
                } else {
                  schedule1to1();
                }
              }}
              style={{
                width: '100%',
                height: 12 * width,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 5 * width,
                flexDirection: 'row',
                backgroundColor: ColorCode.yellow,
                borderRadius: 2 * width,
                marginTop: 4 * width,
              }}>
              <Text
                style={{
                  color: ColorCode.white,
                  fontFamily: Fonts.Regular,
                  fontSize: 3.4 * width,
                }}
                numberOfLines={2}>
                {'Schedule 1 - 1'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowDatePopup(false);
                setTitle('');
                // setQuizSelectedList([]);
                setSelectedDate(null);
              }}
              style={{
                width: '30%',
                padding: 2 * width,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 4 * width,
                marginBottom: 2 * width,
                alignSelf: 'center',
              }}>
              <Text
                style={{
                  color: ColorCode.yellow,
                  fontFamily: Fonts.Regular,
                  fontSize: 3.4 * width,
                }}
                numberOfLines={2}>
                {'Cancel'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={showDatePopup1}
        // visible={true}
        onDismiss={() => {
          setShowDatePopup1(false);
          setTitle('');
          setSlotDate('');
          setQuizSelectedList([]);
          setSlotTime(null);
          setSelectedDate(null);
        }}>
          {console.log(keyboardHeight)}
        <View
          onPress={() => Keyboard.dismiss()}
          style={{
            alignSelf: 'center',
            width: '90%',
            // height: 30 * height,
            // backgroundColor: '#FFF',
            // borderRadius: 3 * width,
            // padding: 3 * width,
            // borderTopStartRadius: 3 * width,
            // borderTopEndRadius: 3 * width,
            // marginBottom: keyboardHeight,
          }}>
          <ScrollView
            // onPress={() => Keyboard.dismiss()}
            nestedScrollEnabled={true}
            style={{
              width:'90%',
              alignSelf: 'center',
              // height: 30 * height,
              minHeight: 40 * height,
              backgroundColor: '#FFF',
              borderRadius: 3 * width,
              padding: 3 * width,
              marginBottom: keyboardHeight,
            }}>
            <Text
              style={{
                // width: 13.5 * width,
                textAlign: 'center',
                color: ColorCode.black,
                fontFamily: Fonts.Medium,
                fontSize: 4 * width,
                marginVertical: 2 * width,
              }}>
              {'Schedule 1 - 1'}
            </Text>
            <TextInput
              style={{
                width: '100%',
                height: 13 * width,
                borderWidth: 1,
                borderColor: ColorCode.greyDDD,
                borderRadius: 2 * width,
                marginTop: 3 * width,
                paddingHorizontal: 4 * width,
                color: ColorCode.black,
                fontFamily: Fonts.Regular,
                fontSize: 3.4 * width,
              }}
              placeholder="Enter Title"
              placeholderTextColor={ColorCode.grey888}
              value={title}
              onChangeText={t => {
                setTitle(t);
              }}
            />

            {user?.type == 'virtual' && (
              <View
                style={{
                  width: '100%',
                  // width: '23%',
                  height: 6 * height,
                  // borderColor: '#BBBBBB',
                  // borderWidth: 1,
                  // flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 3 * width,
                }}>
                <MultiSelect
                  style={{
                    flex: 1,
                    width: '100%',
                    // height: 6 * height,
                    backgroundColor: '#F7F8F800',
                    paddingHorizontal: 4 * width,
                    borderWidth: 1,
                    borderColor: ColorCode.greyDDD,
                    borderRadius: 2 * width,
                    flexDirection: 'column',
                  }}
                  placeholderStyle={{
                    fontSize: 3.4 * width,
                    fontFamily: Fonts.Regular,
                    color: '#D8D8D8',
                  }}
                  selectedTextStyle={{
                    fontSize: 3.4 * width,
                    fontFamily: Fonts.Regular,
                    color: ColorCode.black,
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
                  onFocus={() => {
                    Keyboard.dismiss();
                  }}
                  itemTextStyle={{
                    // margin: 0,
                    height: 5 * width,
                    marginTop: -1 * width,
                    fontSize: 3.4 * width,
                    fontFamily: Fonts.Regular,
                    color: ColorCode.black,
                    // paddingVertical: 0,
                    // paddingTop: 0,
                  }}
                  data={quizList}
                  showsVerticalScrollIndicator={false}
                  maxHeight={26 * height}
                  labelField="title"
                  valueField="quiz_bank_id"
                  placeholder={
                    quizSelectedList.length == 0
                      ? 'Select Quiz'
                      : `${quizSelectedList.length} Selected`
                  }
                  value={quizSelectedList}
                  onChange={item => {
                    setQuizSelectedList(item);
                    // setSlotTime(item.value);
                    // console.log('Slot Time Data', item.data);
                    // setSelectedDate(item.data);
                    // updateTimeSlot(item.value);
                  }}
                  containerStyle={{
                    backgroundColor: '#FFFFFF',
                    // marginTop: Platform.OS == 'android' ? -0 * width : 15,
                    borderRadius: 1 * width,
                  }}
                  renderRightIcon={() => (
                    <Ionicons
                      name="chevron-down"
                      size={5 * width}
                      color="#000000"
                    />
                  )}
                  visibleSelectedItem={false}
                />
              </View>
            )}

            {user?.type == 'virtual' && quizSelectedList.length > 0 && (
              <ScrollView style={{maxHeight: 30 * height}}>
                <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                  {quizList.map((item, pos) => {
                    // console.log(item);
                    var found = quizSelectedList.filter(
                      q => q == item.quiz_bank_id,
                    );
                    // console.log(found);
                    if (found.length > 0) {
                      return (
                        <TouchableOpacity onPress={() => unSelect(found)}>
                          <View
                            key={pos}
                            style={{
                              flexDirection: 'row',
                              justifyContent: 'center',
                              alignItems: 'center',
                              borderRadius: 5 * width,
                              backgroundColor: 'white',
                              marginTop: 2 * width,
                              marginRight: 2 * width,
                              paddingHorizontal: 3 * width,
                              paddingVertical: 1 * width,
                              borderWidth: 1,
                              borderColor: ColorCode.greyDDD,
                            }}>
                            <Text
                              style={{
                                marginRight: 5,
                                fontSize: 3.4 * width,
                                fontFamily: Fonts.Regular,
                                color: ColorCode.black,
                              }}
                              numberOfLines={1}>
                              {item.title}
                            </Text>
                            <Ionicons
                              color="black"
                              name="close"
                              size={6 * width}
                            />
                          </View>
                        </TouchableOpacity>
                      );
                    } else null;
                  })}
                </View>
              </ScrollView>
            )}

            <View
              style={{
                width: '100%',
                // width: '23%',
                height: 6 * height,
                // borderColor: '#BBBBBB',
                // borderWidth: 1,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: ColorCode.greyDDD,
                borderRadius: 2 * width,
                marginTop: 3 * width,
              }}>
              <Dropdown
                style={{
                  flex: 1,
                  width: '100%',
                  backgroundColor: '#F7F8F800',
                  paddingHorizontal: 4 * width,
                }}
                placeholderStyle={{
                  fontSize: 3.4 * width,
                  fontFamily: Fonts.Regular,
                  color: '#D8D8D8',
                }}
                selectedTextStyle={{
                  fontSize: 3.4 * width,
                  fontFamily: Fonts.Regular,
                  color: ColorCode.black,
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
                  // margin: 0,
                  height: 5 * width,
                  marginTop: -1 * width,
                  fontSize: 3.4 * width,
                  fontFamily: Fonts.Regular,
                  color: ColorCode.black,
                  // paddingVertical: 0,
                  // paddingTop: 0,
                }}
                data={dateSlotList}
                showsVerticalScrollIndicator={false}
                maxHeight={26 * height}
                labelField="label"
                valueField="value"
                placeholder={slotDate || slotDate == '' ? 'Select Date' : '...'}
                value={slotDate}
                onChange={item => {
                  setSlotDate(item.value);
                  setSlotTime(null);
                  setSelectedDate(null);
                  updateTimeSlot(item.value);
                }}
                containerStyle={{
                  backgroundColor: '#FFFFFF',
                  // marginTop: Platform.OS == 'android' ? -0 * width : 0,
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

            <View
              style={{
                width: '100%',
                // width: '23%',
                height: 6 * height,
                // borderColor: '#BBBBBB',
                // borderWidth: 1,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: ColorCode.greyDDD,
                borderRadius: 2 * width,
                marginTop: 3 * width,
              }}>
              <Dropdown
                style={{
                  flex: 1,
                  width: '100%',
                  backgroundColor: '#F7F8F800',
                  paddingHorizontal: 4 * width,
                }}
                placeholderStyle={{
                  fontSize: 3.4 * width,
                  fontFamily: Fonts.Regular,
                  color: '#D8D8D8',
                }}
                selectedTextStyle={{
                  fontSize: 3.4 * width,
                  fontFamily: Fonts.Regular,
                  color: ColorCode.black,
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
                  // margin: 0,
                  height: 5 * width,
                  marginTop: -1 * width,
                  fontSize: 3.4 * width,
                  fontFamily: Fonts.Regular,
                  color: ColorCode.black,
                  // paddingVertical: 0,
                  // paddingTop: 0,
                }}
                data={timeSlotList}
                showsVerticalScrollIndicator={false}
                maxHeight={26 * height}
                labelField="label"
                valueField="value"
                placeholder={slotTime == null ? 'Select Time' : ''}
                value={slotTime}
                onChange={item => {
                  setSlotTime(item.value);
                  console.log('Slot Time Data', item.data);
                  setSelectedDate(item.data);
                  // updateTimeSlot(item.value);
                }}
                containerStyle={{
                  backgroundColor: '#FFFFFF',
                  // marginTop: Platform.OS == 'android' ? -0 * width : 0,
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

            <View
              style={{
                width: '100%',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: 'row',
                marginTop: 2 * width,
                paddingHorizontal: 2 * width,
              }}>
              <View style={{width: '100%'}}>
                <Text
                  style={{
                    color: ColorCode.grey888,
                    fontFamily: Fonts.Regular,
                    fontSize: 3 * width,
                  }}
                  numberOfLines={2}>
                  {'Class'}
                </Text>
                <Text
                  style={{
                    color: ColorCode.black,
                    fontFamily: Fonts.Medium,
                    fontSize: 3.4 * width,
                  }}
                  numberOfLines={2}>
                  {selectedDate?.class
                    ? selectedDate?.class.name
                    : 'All Classes'}
                </Text>
              </View>
            </View>

            {selectedDate && (
              <View
                style={{
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  marginTop: 2 * width,
                  paddingHorizontal: 2 * width,
                }}>
                <View style={{width: '30%'}}>
                  <Text
                    style={{
                      color: ColorCode.grey888,
                      fontFamily: Fonts.Regular,
                      fontSize: 3 * width,
                    }}
                    numberOfLines={2}>
                    {'Date'}
                  </Text>
                  <Text
                    style={{
                      color: ColorCode.black,
                      fontFamily: Fonts.Medium,
                      fontSize: 3.4 * width,
                    }}
                    numberOfLines={2}>
                    {selectedDate?.date}
                  </Text>
                </View>
                <View style={{width: '30%', alignItems: 'center'}}>
                  <Text
                    style={{
                      color: ColorCode.grey888,
                      fontFamily: Fonts.Regular,
                      fontSize: 3 * width,
                    }}
                    numberOfLines={2}>
                    {'Start Time'}
                  </Text>
                  <Text
                    style={{
                      color: ColorCode.black,
                      fontFamily: Fonts.Medium,
                      fontSize: 3.4 * width,
                    }}
                    numberOfLines={2}>
                    {selectedDate?.start_time}
                  </Text>
                </View>
                <View style={{width: '30%', alignItems: 'flex-end'}}>
                  <Text
                    style={{
                      color: ColorCode.grey888,
                      fontFamily: Fonts.Regular,
                      fontSize: 3 * width,
                    }}
                    numberOfLines={2}>
                    {'End Time'}
                  </Text>
                  <Text
                    style={{
                      color: ColorCode.black,
                      fontFamily: Fonts.Medium,
                      fontSize: 3.4 * width,
                    }}
                    numberOfLines={2}>
                    {selectedDate?.end_time}
                  </Text>
                </View>
              </View>
            )}

            <View
              style={{
                width: '100%',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: 'row',
                marginTop: 2 * width,
                paddingHorizontal: 2 * width,
              }}>
              <View style={{width: '100%'}}>
                <Text
                  style={{
                    color: ColorCode.grey888,
                    fontFamily: Fonts.Regular,
                    fontSize: 3 * width,
                  }}
                  numberOfLines={2}>
                  {'Comment'}
                </Text>
                <Text
                  style={{
                    color: ColorCode.black,
                    fontFamily: Fonts.Medium,
                    fontSize: 3.4 * width,
                  }}>
                  {selectedDate?.comments ? selectedDate?.comments : 'N/A'}
                </Text>
              </View>
            </View>

            <TextInput
              style={{
                width: '100%',
                height: 24 * width,
                borderWidth: 1,
                borderColor: ColorCode.greyDDD,
                borderRadius: 2 * width,
                marginTop: 3 * width,
                paddingHorizontal: 4 * width,
                color: ColorCode.black,
                fontFamily: Fonts.Regular,
                fontSize: 3.4 * width,
                textAlignVertical: 'top',
              }}
              multiline={true}
              placeholder="Enter notes (if any...)"
              placeholderTextColor={ColorCode.grey888}
              value={comment}
              onChangeText={t => {
                setComment(t);
              }}
            />

            <TouchableOpacity
              onPress={() => {
                if (title.trim().length == 0) {
                  ToastUtility.showToast('Enter Title');
                } else if (slotDate == '') {
                  ToastUtility.showToast('Select Date');
                } else if (slotTime == null) {
                  ToastUtility.showToast('Select Time');
                } else {
                  schedule1to1();
                }
              }}
              style={{
                width: '100%',
                height: 12 * width,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 5 * width,
                flexDirection: 'row',
                backgroundColor: ColorCode.yellow,
                borderRadius: 2 * width,
                marginTop: 4 * width,
              }}>
              <Text
                style={{
                  color: ColorCode.white,
                  fontFamily: Fonts.Regular,
                  fontSize: 3.4 * width,
                }}
                numberOfLines={2}>
                {'Schedule 1 - 1'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setShowDatePopup1(false);
                setTitle('');
                setSlotDate('');
                // setQuizSelectedList([]);
                setSlotTime(null);
                setSelectedDate(null);
              }}
              style={{
                width: '30%',
                padding: 2 * width,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 4 * width,
                marginBottom: 2 * width,
                alignSelf: 'center',
              }}>
              <Text
                style={{
                  color: ColorCode.yellow,
                  fontFamily: Fonts.Regular,
                  fontSize: 3.4 * width,
                }}
                numberOfLines={2}>
                {'Cancel'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: ColorCode.white,
  },
  flatlistContainer: {
    width: '100%',
    paddingVertical: height * 2,
  },
  monthMainContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: width * 3,
  },
  monthContainer: {
    // alignItems: 'center',
    // justifyContent: 'space-between',
    // width: width * 11,
    // height: height * 10,
    // backgroundColor: ColorCode.pink,
    // marginRight: width * 2.7,
    // borderRadius: width * 6,
    // paddingVertical: height * 2,
    paddingVertical: height * 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ColorCode.yellow,
    margin: width * 1,
    borderRadius: width * 6,
    height: height * 8,
    width: width * 10,
  },
  monthName: {
    fontSize: width * 3,
    fontFamily: Fonts.Regular,
    color: ColorCode.black,
  },
  year: {
    fontSize: width * 3.6,
    fontFamily: Fonts.Regular,
    color: ColorCode.black,
    marginTop: 2 * width,
  },
  dateGridContainer: {
    // marginLeft: width * 2,
    alignSelf: 'center',
  },
  gridContainer: {
    flexDirection: 'column',
    paddingVertical: width * 1,
  },
  gridRow: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    // marginBottom: 5,
    // borderColor: ColorCode.lightgrey,
    // borderWidth: 1,
  },
  gridCell: {
    width: width * 13.5,
    height: height * 8,
    // backgroundColor: '#dad',
    // justifyContent: 'flex-end',
    // alignItems: 'flex-start',
    borderColor: '#E6E6E6',
    borderWidth: 1,
  },
  ticketBox: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    // padding: 5,
  },
  dateText: {
    fontSize: width * 2.8,
    color: ColorCode.black,
    position: 'absolute',
    bottom: 1 * width,
    left: 1 * width,
  },
  ticketCountContainer: {
    // flex: 1,
    height: '70%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#dad',
  },
  ticketCountText: {
    fontSize: width * 6,
    color: ColorCode.red,
  },
});

export default MonthlyCalendarVirtual;
