import { useFocusEffect } from '@react-navigation/native';
import React, {Fragment, useEffect, useState} from 'react';
import {FlatList, Image, ImageBackground, StatusBar, Text, TouchableOpacity, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import {Provider} from 'react-native-paper';
import CustomProgress from '../../../compenents/CustomProgress';
import CustomSAView from '../../../compenents/CustomSAView';
import CustomStatus from '../../../compenents/CustomStatus';
import HeaderWithBack from '../../../compenents/HeaderWithBack';
import width from '../../../Units/width';
import ColorCode from '../../../utility/ColorCode';
import ConstData from '../../../utility/ConstData';
import Fonts from '../../../utility/Fonts';
import StorageUtility from '../../../utility/StorageUtility';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

const DiscussionForumScreen = ({navigation, route}) => {
  const [user, setUser] = useState(null);
  const [discussionList, setDiscussionList] = useState([]);
  const [profileUrl, setProfileUrl] = useState('');
  const [docUrl, setDocUrl] = useState([]);
  const [showProgress, setShowProgress] = useState(false);
  const [isRefreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getUserDetail();
  }, []);

  useFocusEffect(React.useCallback(() => {
    setShowProgress(true);
    getDiscussions()
  }, []));

  const getUserDetail = async () => {
    var uu = await StorageUtility.getUser();
    setUser(uu);
  };

  const getDiscussions = () => {
    ApiMethod.getDiscussions(
      pass => {
        setShowProgress(false);
        setRefreshing(false);
        console.log(JSON.stringify(pass.data));
        setDiscussionList(pass.data);
        setProfileUrl(pass.profile_url);
        setDocUrl(pass.doc_url);
      },
    );
  };

  const getDocViewType  = doc =>{
    return (
      <TouchableOpacity
        style={{
          width: 15 * width,
          height: 15 * width,
          backgroundColor: ColorCode.greyDDD,
        }}></TouchableOpacity>
    );
  }

  const isDiscussionOpened = disc => {
    return (
      disc.count.filter(d => d.student && d.student.id == user.id).length > 0
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
          parentStyple={{flex: 1, backgroundColor: ColorCode.transarent}}
          style={{flex: 1, backgroundColor: ColorCode.transarent}}>
          <HeaderWithBack
            title="Discussion Forum"
            backgroundColor={ColorCode.primary}
            textColor={ColorCode.white}
          />
          <View
            style={{
              flex: 1,
              paddingHorizontal: 3 * width,
              backgroundColor: ColorCode.white,
            }}>
            {discussionList.length > 0 ? (
              <FlatList
                data={discussionList}
                // data={[1,1,1,1,1,1,1,1,1]}
                renderItem={({item, index}) => {
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        navigation.navigate('DiscussionDetail', {data: item});
                      }}
                      style={[
                        {
                          width: '100%',
                          borderWidth: !isDiscussionOpened(item) ? 2 : 1,
                          borderColor: !isDiscussionOpened(item)
                            ? ColorCode.primary
                            : '#BFC1CB',
                          paddingHorizontal: 3 * width,
                          paddingVertical: 3 * width,
                          marginVertical: 2 * width,
                          backgroundColor: ColorCode.white,
                          borderRadius: 2 * width,
                          // height: 2 * width,
                        },
                        ConstData.ELEVATION_STYLE,
                      ]}>
                      <View
                        style={{
                          width: '100%',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <FastImage
                          style={{
                            width: 12 * width,
                            height: 12 * width,
                            backgroundColor: '#F6F6F6',
                            borderRadius: 10 * width,
                          }}
                          source={
                            item.admin?.photo
                              ? {
                                  uri: profileUrl + '/' + item?.admin?.photo,
                                }
                              : require('../../../assets/images/splash_logo.png')
                          }
                        />
                        <Text
                          style={{
                            flex: 1,
                            fontFamily: Fonts.Medium,
                            fontSize: 3.8 * width,
                            color: '#000000',
                            marginStart: 3 * width,
                          }}
                          numberOfLines={1}>
                          {`${item.admin?.name}`}
                        </Text>
                      </View>

                      <Text
                        style={{
                          flex: 1,
                          fontFamily: Fonts.Medium,
                          fontSize: 3.8 * width,
                          color: '#000000',
                          marginTop: 2 * width,
                          lineHeight: 6 * width,
                        }}
                        numberOfLines={2}>
                        {`${item?.title}`}
                      </Text>

                      <Text
                        style={{
                          flex: 1,
                          lineHeight: 5 * width,
                          fontFamily: Fonts.Regular,
                          fontSize: 3.2 * width,
                          color: '#565973',
                          marginTop: 2 * width,
                        }}
                        numberOfLines={4}>
                        {`${item.content}`}
                      </Text>
                      {/* {item.documents.length > 0 && ( */}
                      {/* <View
                        style={{flexDirection: 'row', marginTop: 3 * width}}> */}
                      {/* <Text>{`Doc uploaded ${item.documents.length}`}</Text> */}
                      {/* {item.documents.map((doc, index) => {})} */}
                      {/* </View> */}
                      {/* )} */}
                      <View
                        style={{
                          flexDirection: 'row',
                          width: '100%',
                          alignItems: 'center',
                          marginTop: 3 * width,
                          justifyContent: 'space-between',
                        }}>
                        <Text
                          style={{
                            lineHeight: 5 * width,
                            fontFamily: Fonts.Regular,
                            fontSize: 3.2 * width,
                            color: '#565973',
                          }}
                          numberOfLines={1}>
                          {moment(item.created_at)
                            .format('MMM DD, YYYY')
                            .toUpperCase()}
                        </Text>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <Ionicons
                            name={'chatbubble-outline'}
                            size={5 * width}
                            color="#9397AD"
                          />
                          <Text
                            style={{
                              fontFamily: Fonts.Regular,
                              fontSize: 3.2 * width,
                              color: '#9397AD',
                              marginStart: 1 * width,
                            }}
                            numberOfLines={1}>
                            {`${item.comments_count}`}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            ) : (
              <Text
                style={{
                  textAlign: 'center',
                  fontFamily: Fonts.Medium,
                  fontSize: 3.8 * width,
                  color: '#000000',
                  marginTop: 10 * width,
                }}
                numberOfLines={1}>
                {`No Discussions\nstarted yet`}
              </Text>
            )}
          </View>
        </CustomSAView>
      </View>
      <CustomProgress show={showProgress} />
    </Provider>
  );
};

export default DiscussionForumScreen;
