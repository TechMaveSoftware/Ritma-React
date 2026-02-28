import React from 'react';
import {View, Text, TouchableOpacity, FlatList, Alert} from 'react-native';
import {ActivityIndicator, Modal} from 'react-native-paper';
import height from '../Units/height';
import width from '../Units/width';
import ConstData from '../utility/ConstData';
import Fonts from '../utility/Fonts';

const WeeklyAttendancePopup = ({
  data,
  week,
  dataArr = [],
  show,
  onDismiss,
  isOnlineUser = false,
}) => {
  return (
    <Modal
      visible={show}
      // dismissable={false}
      onDismiss={onDismiss}
      contentContainerStyle={{alignItems: 'center', justifyContent: 'center'}}>
      <View
        style={{
          width: '80%',
          // height: '80%',
          alignSelf: 'center',
          borderRadius: 2 * width,
          backgroundColor: '#FFFFFF',
        }}>
        <Text
          style={{
            color: '#000000',
            fontSize: 4 * width,
            fontFamily: Fonts.SemiBold,
            marginTop: 4 * width,
            paddingHorizontal: 5 * width,
          }}>{`Week ${week} Attendance`}</Text>
        {!isOnlineUser && (
          <Text
            style={{
              color: '#464646',
              fontSize: 3 * width,
              fontFamily: Fonts.Regular,
              marginTop: 1 * width,
              marginBottom: 2 * width,
              paddingHorizontal: 5 * width,
            }}>
            {data ? `(${data.start_date} - ${data.end_date})` : ''}
          </Text>
        )}

        <View
          style={{
            height: 1,
            width: '100%',
            marginTop: 2 * width,
            backgroundColor: '#BCBCBC',
          }}
        />
        <View
          style={{
            width: '100%',
            // height: '80%',
            alignSelf: 'center',
            borderRadius: 2 * width,
            backgroundColor: '#FFFFFF',
            paddingHorizontal: 5 * width,
            paddingVertical: 2 * width,
          }}>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 1 * width,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text
              style={{
                color: '#000000',
                fontSize: 3 * width,
                fontFamily: Fonts.Regular,
              }}>{`Total Hours : `}</Text>
            <Text
              style={{
                color: '#16763E',
                fontSize: 3 * width,
                fontFamily: Fonts.SemiBold,
              }}>{`${data?.week_hour} hrs`}</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 1 * width,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text
              style={{
                color: '#000000',
                fontSize: 3 * width,
                fontFamily: Fonts.Regular,
              }}>{`Hours Done : `}</Text>
            <Text
              style={{
                color: '#16763E',
                fontSize: 3 * width,
                fontFamily: Fonts.SemiBold,
              }}>{`${data?.login_hours} hrs`}</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 1 * width,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text
              style={{
                color: '#000000',
                fontSize: 3 * width,
                fontFamily: Fonts.Regular,
              }}>{`Hours Left : `}</Text>
            <Text
              style={{
                color: '#16763E',
                fontSize: 3 * width,
                fontFamily: Fonts.SemiBold,
              }}>{`${data?.pending_hours} hrs`}</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 1 * width,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text
              style={{
                color: '#000000',
                fontSize: 3 * width,
                fontFamily: Fonts.Regular,
              }}>{`Extra Hours : `}</Text>
            <Text
              style={{
                color: '#16763E',
                fontSize: 3 * width,
                fontFamily: Fonts.SemiBold,
              }}>{`${data?.extra_hours} hrs`}</Text>
          </View>
          {!isOnlineUser && (
            <View
              style={{
                flexDirection: 'row',
                marginTop: 1 * width,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  color: '#000000',
                  fontSize: 3 * width,
                  fontFamily: Fonts.Regular,
                }}>{`Hours by Admin : `}</Text>
              <Text
                style={{
                  color: '#16763E',
                  fontSize: 3 * width,
                  fontFamily: Fonts.SemiBold,
                }}>{`${data?.login_hours_admin} hrs`}</Text>
            </View>
          )}
          {!isOnlineUser && (
            <View
              style={{
                flexDirection: 'row',
                marginTop: 1 * width,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  color: '#000000',
                  fontSize: 3 * width,
                  fontFamily: Fonts.Regular,
                }}>{`Comment : `}</Text>
              {data?.comment ? (
                <TouchableOpacity
                  onPress={() => {
                    // setAdminComment(item.comment);
                    Alert.alert('Comment', data?.comment, [
                      {
                        text: 'Close',
                        onPress: () => {
                          //Linking.openURL(res.storeUrl); // open store if update is needed.
                        },
                      },
                    ]);
                  }}>
                  <Text
                    style={{
                      color: '#454545',
                      fontSize: 3 * width,
                      fontFamily: Fonts.SemiBold,
                    }}>{`View ->`}</Text>
                </TouchableOpacity>
              ) : (
                <Text
                  style={{
                    color: '#454545',
                    fontSize: 3 * width,
                    fontFamily: Fonts.SemiBold,
                  }}>{`N/A`}</Text>
              )}
            </View>
          )}
        </View>

        {!isOnlineUser && (
          <View
            style={{
              alignItems: 'center',
              paddingVertical: 1 * width,
              paddingHorizontal: 2 * width,
              maxHeight: 40 * height,
            }}>
            {dataArr && dataArr.length > 0 ? (
              <FlatList
                data={dataArr}
                style={{
                  width: '100%',
                  paddingHorizontal: 2 * width,
                }}
                renderItem={({item, index}) => {
                  return (
                    <View
                      key={index}
                      style={[
                        {
                          width: '100%',
                          marginVertical: 1 * width,
                          paddingHorizontal: 2 * width,
                          backgroundColor: '#FFFFFF',
                          borderRadius: 2 * width,
                          padding: 3 * width,
                        },
                        ConstData.ELEVATION_STYLE,
                      ]}>
                      <Text
                        style={{
                          color: '#16763E',
                          fontSize: 3.6 * width,
                          fontFamily: Fonts.SemiBold,
                        }}>{`Date : ${item.date}`}</Text>

                      <View
                        style={{
                          flexDirection: 'row',
                          marginTop: 1 * width,
                          alignItems: 'center',
                          // justifyContent: 'space-between',
                        }}>
                        <Text
                          style={{
                            width: '40%',
                            color: '#000000',
                            fontSize: 3 * width,
                            fontFamily: Fonts.Regular,
                          }}>{`Clock In Time : `}</Text>
                        <Text
                          style={{
                            color: '#16763E',
                            fontSize: 3 * width,
                            fontFamily: Fonts.SemiBold,
                          }}>{`${item.start_time}`}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          marginTop: 1 * width,
                          alignItems: 'center',
                          // justifyContent: 'space-between',
                        }}>
                        <Text
                          style={{
                            width: '40%',
                            color: '#000000',
                            fontSize: 3 * width,
                            fontFamily: Fonts.Regular,
                          }}>{`Clock Out Time : `}</Text>
                        <Text
                          style={{
                            color: '#16763E',
                            fontSize: 3 * width,
                            fontFamily: Fonts.SemiBold,
                          }}>{`${item.end_time}`}</Text>
                      </View>
                    </View>
                  );
                }}
              />
            ) : (
              <Text
                style={{
                  color: '#000000',
                  textAlign: 'center',
                  fontSize: 4 * width,
                  fontFamily: Fonts.Regular,
                  paddingVertical: 5 * height,
                }}>{`No Data found`}</Text>
            )}
          </View>
        )}
      </View>

      <TouchableOpacity
        onPress={onDismiss}
        style={{
          marginTop: width * 5,
          alignSelf: 'center',
          backgroundColor: '#ffffff',
          borderRadius: 2 * width,
        }}>
        <Text
          style={{
            paddingHorizontal: width * 3.5,
            paddingVertical: width * 2,
            color: '#000000',
            fontSize: 13,
          }}>
          Close
        </Text>
      </TouchableOpacity>
    </Modal>
  );
};

export default WeeklyAttendancePopup;
