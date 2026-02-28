import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { FlatList, Image, ImageBackground, Keyboard, Modal, Platform, Pressable, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View, Alert, Linking } from 'react-native';
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { Provider } from 'react-native-paper';
import ApiMethod from '../../../api/ApiMethod';
import CustomProgress from '../../../compenents/CustomProgress';
import CustomSAView from '../../../compenents/CustomSAView';
import CustomStatus from '../../../compenents/CustomStatus';
import HeaderWithBack from '../../../compenents/HeaderWithBack';
import width from '../../../Units/width';
import ColorCode from '../../../utility/ColorCode';
import ConstData from '../../../utility/ConstData';
import Fonts from '../../../utility/Fonts';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import StorageUtility from '../../../utility/StorageUtility';
import ToastUtility from '../../../utility/ToastUtility';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { pick, keepLocalCopy, types } from '@react-native-documents/picker';
import Pdf from 'react-native-pdf';
import height from '../../../Units/height';
import Video from 'react-native-video';
// import {Image as Compressor} from 'react-native-compressor';

let options = {
  title: 'Select Image',
  multiple: false,
  quality: 0.6,
  maxHeight: 1000,
  maxWidth: 1000,
  selectionLimit: 1,
  storageOptions: {
    skipBackup: true,
    // path: 'images',
  },
};

let optionVdo = {
  mediaType: 'video',
  title: 'Select Image',
  multiple: false,
  quality: 0.6,
  maxHeight: 1000,
  maxWidth: 1000,
  selectionLimit: 1,
  storageOptions: {
    skipBackup: true,
    // path: 'images',
  },
};

const DiscussionDetailScreen = ({ navigation, route }) => {
  const [user, setUser] = useState(null);
  const [discussionData, setDiscussionData] = useState(route.params.data);
  const [discussionData1, setDiscussionData1] = useState(null);
  const [commentsList, setCommentsList] = useState([]);
  const [profileUrl, setProfileUrl] = useState('');
  const [newComment, setNewComment] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [selectedComment, setSelectedComment] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [docUrl, setDocUrl] = useState([]);
  const [showProgress, setShowProgress] = useState(false);
  const [showDocumentPopup, setShowDocumentPopup] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [selImg, setselImg] = useState('');
  const [showSelImgPopup, setShowSelImgPopup] = useState(false);
  const [selPdf, setSelPdf] = useState('');
  const [showSelPdfPopup, setShowSelPdfPopup] = useState(false);
  const [selVdo, setSelVdo] = useState('');
  const [showSelVdoPopup, setShowSelVdoPopup] = useState(false);

  // console.log('discussionData', discussionData);
  const commentListRef = useRef(null);

  useEffect(() => {
    getUserDetail();

    let keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', e => {
      setKeyboardHeight(Platform.OS == 'ios' ? e.endCoordinates.height : 0);
    });
    let keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      },
    );

    return () => {
      // ToastUtility.showToast('dsfdsf')
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useFocusEffect(React.useCallback(() => {
    setShowProgress(true);
    getDiscussionData()
  }, []));

  useEffect(() => {
    console.log("commentsList", commentsList.length)

    setTimeout(() => {
      // scrollToLast()
      // commentListRef.current.scrollToIndex({
      //   // animated: true,
      //   index: commentsList.length - 1,
      // });
      commentListRef.current.scrollToEnd({ animated: true, });
    }, 100);
  }, [commentsList]);

  // const scrollToLast = async () => {
  //   var pos = 0;

  //   while (pos < commentsList.length - 1) {
  //     commentListRef.current.scrollToIndex({
  //       animated: true,
  //       index: pos,
  //     });
  //     pos += 1;
  //   }
  // };

  // React.useLayoutEffect(() => {
  //   const timeout = setTimeout(() => {
  //     if (commentListRef.current && commentsList && commentsList.length > 0) {
  //       commentListRef.current.scrollToEnd({animated: true});
  //     }
  //   }, 1000);

  //   return () => {
  //     clearTimeout(timeout);
  //   };
  // }, [commentsList]);

  const getUserDetail = async () => {
    var uu = await StorageUtility.getUser();
    setUser(uu);
    console.log('user', user);
  };

  const getDiscussionData = () => {
    ApiMethod.discussionDetail(
      `forum_id=${discussionData.id}`,
      pass => {
        setShowProgress(false);
        console.log('JSON.stringify(pass)', JSON.stringify(pass));
        setDiscussionData1(pass.data);
        setCommentsList(pass.data.forums_comments);
        setProfileUrl(pass.profile_url);
        setDocUrl(pass.doc_url);

        //   try{
        //   if (pass.data.forums_comments.length > 0) {
        //     setTimeout(() => {
        //       commentListRef.current.scrollToIndex({
        //         animated: true,
        //         index: pass.data.forums_comments.length - 1,
        //       });
        //     }, 1000);
        //   }
        // }catch(e){
        // }
        updateView();
      },
      fail => {
        setShowProgress(false);
      },
    );
  };

  const updateView = () => {
    ApiMethod.viewDoscussion(
      { forum_id: discussionData.id },
      pass => {
        setShowProgress(false);
      },
      fail => {
        setShowProgress(false);
      },
    );
  };

  const sendComment = () => {
    if (newComment == '') {
      return;
    } else {
      Keyboard.dismiss();
      var formData = new FormData();

      if (selectedComment) {
        formData.append('reply_to_id', selectedComment.id);
      } else {
        formData.append('reply_to_id', discussionData.id);
      }
      formData.append('content', newComment);

      if (selectedDocument) {
        formData.append('document_file[]', {
          uri:
            Platform.OS === 'android'
              ? selectedDocument
              : selectedDocument.replace('file://', ''),
          type:
            selectedDocument.includes('.mp4') ||
              selectedDocument.includes('.mov') ||
              selectedDocument.includes('.MOV')
              ? 'video/*'
              : selectedDocument.includes('.pdf')
                ? 'application/pdf'
                : 'image/*',
          name: selectedDocument.includes('.mp4')
            ? `comment_${moment().valueOf()}.mp4`
            : selectedDocument.includes('.mov')
              ? `comment_${moment().valueOf()}.mov`
              : selectedDocument.includes('.MOV')
                ? `comment_${moment().valueOf()}.MOV`
                : selectedDocument.includes('.pdf')
                  ? `comment_${moment().valueOf()}.pdf`
                  : `comment_${moment().valueOf()}.jpg`,
        });
      }

      console.log(JSON.stringify(formData));
      // return

      setShowProgress(true);
      ApiMethod.sendNewComment(
        formData,
        pass => {
          setShowProgress(false);
          console.log('JSON.stringify(pass)', JSON.stringify(pass));
          setNewComment('');
          setSelectedDocument(null);
          setSelectedComment(null);
          getDiscussionData();
        },
        fail => {
          setShowProgress(false);
        },
      );
    }
  };

  const openDocPicker = async (type) => {
    console.log(type)
    const [file] = await pick({
      type: [types.pdf],
    });

    const [localCopy] = await keepLocalCopy({
      files: [
        {
          uri: file.uri,
          fileName: file.name ?? 'fallbackName',
        },
      ],
      destination: 'documentDirectory',
    });
    console.log('Res', localCopy);
    setSelectedDocument(localCopy.localUri);

    // DocumentPicker.pickSingle({
    //   type: [type ?? DocumentPicker.types.pdf],
    //   copyTo: 'documentDirectory',
    //   //There can me more options as well
    //   // DocumentPicker.types.allFiles
    //   // DocumentPicker.types.images
    //   // DocumentPicker.types.plainText
    //   // DocumentPicker.types.audio
    //   // DocumentPicker.types.pdf
    //   // DocumentPicker.types.video
    // })
    //   .then(res => {
    //     console.log('Res', res);
    //     // if (res.uri.endsWith('.pdf')) {
    //     setSelectedDocument(res.fileCopyUri);
    //     // } else {
    //     //   ToastUtility.showToast('Please select file from different directory');
    //     // }
    //     // setDocs(res);
    //     // setPdfPreview(true);
    //   })
    //   .catch(err => {
    //     console.log('err', err);
    //   });
  };

  const openCamera = async () => {
    let permission;
    if (Platform.OS === 'ios') {
      permission = PERMISSIONS.IOS.CAMERA;
    } else {
      permission = PERMISSIONS.ANDROID.CAMERA;
    }

    const cameraPermission = await check(permission);
    if (cameraPermission !== RESULTS.GRANTED) {
      if (cameraPermission === RESULTS.DENIED) {
        const result = await request(permission);
        if (result !== RESULTS.GRANTED) {
          Alert.alert(
            'Camera Permission Required',
            'Please allow camera access to take photos.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
          return;
        }
      } else if (cameraPermission === RESULTS.BLOCKED) {
        Alert.alert(
          'Camera Permission Blocked',
          'Camera access is blocked. Please enable it in settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
    }

    launchCamera(options, response => {
      console.log('Response = ', response);
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error || response.errorCode) {
        console.log('ImagePicker Error: ', response.error || response.errorCode);
        const errorMessage = response.errorMessage || response.error || 'Camera error';
        if (response.errorCode === 'permission') {
          Alert.alert(
            'Permission Denied',
            'Camera access is required.',
            [{ text: 'Open Settings', onPress: () => Linking.openSettings() }, { text: 'OK' }]
          );
        } else {
          ToastUtility.showToast(errorMessage);
        }
      } else {
        const source = response.assets[0].uri;
        console.log('image, ', source);

        if (!source.startsWith('content')) {
          compressImage(source);
        } else {
          ToastUtility.showToast('Please select file from different directory');
        }
      }
    });
  };

  const openGallery = () => {
    launchImageLibrary(options, response => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = response.assets[0].uri;
        console.log('image, ', source);

        if (!source.startsWith('content')) {
          compressImage(source);
        } else {
          ToastUtility.showToast('Please select file from different directory');
        }
      }
    });
  };

  const compressImage = async (uri) => {
    // var path = await Compressor.compress(uri);
    var path = uri;
    console.log('Compressed', path);
    setSelectedDocument(path);
  };

  const openVideoGallery = () => {
    launchImageLibrary(optionVdo, response => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('VideoPicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = response.assets[0].uri;
        const fileSize = response.assets[0].fileSize;
        console.log('Video, ', fileSize, source);

        const mbSize = fileSize / 1000000;
        console.log('Video size in MB, ', mbSize);

        if (mbSize > 10) {
          setSelectedDocument("");
          ToastUtility.showToast('MP4 must be not be greater than 10 MB');
        } else if (!source.startsWith('content') && source.endsWith('.mp4')) {
          // compressImage(source);
          setSelectedDocument(source);
        } else {
          setSelectedDocument("");
          ToastUtility.showToast('Please select MP4 file from different directory');
        }
      }
    });
  };

  const commentView = list => {
    return (
      <FlatList
        ref={commentListRef}
        data={list}
        renderItem={({ item, index }) => {
          return (
            <View key={index} style={{ flex: 1 }}>
              <View
                style={{
                  paddingHorizontal: 4 * width,
                  paddingVertical: 2 * width,
                }}>
                <View style={{ flexDirection: 'row' }}>
                  <FastImage
                    style={{
                      width: 11 * width,
                      height: 11 * width,
                      backgroundColor: '#F6F6F6',
                      borderRadius: 10 * width,
                      borderColor: '#DEDEDE',
                      borderWidth: 1,
                    }}
                    source={
                      item.comment_by?.photo
                        ? {
                          uri: profileUrl + '/' + item.comment_by?.photo,
                        }
                        : item.admin?.photo
                          ? {
                            uri: profileUrl + '/' + item.admin?.photo,
                          }
                          : item.student?.photo
                            ? {
                              uri: profileUrl + '/' + item.student?.photo,
                            }
                            : item.teacher?.photo
                              ? {
                                uri: profileUrl + '/' + item.teacher?.photo,
                              }
                              : require('../../../assets/images/splash_logo.png')
                    }
                  />
                  <View
                    style={{
                      marginStart: 3 * width,
                      paddingTop: 2 * width,
                    }}>
                    <Text
                      style={{
                        fontFamily: Fonts.Medium,
                        fontSize: 3.2 * width,
                        color: '#000000',
                      }}
                      numberOfLines={1}>
                      {item.comment_by?.name
                        ? `${item.comment_by?.name}`
                        : item.admin?.name
                          ? `${item.admin?.name}`
                          : item.student?.name
                            ? `${item.student?.name}`
                            : item.teacher?.name
                              ? `${item.teacher?.name}`
                              : 'N/A'}
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.Regular,
                        fontSize: 3 * width,
                        color: '#6A6A6A',
                      }}
                      numberOfLines={1}>
                      {/* {`${moment(item.created_at).format('MMM DD, YYYY')}`} */}
                      {`${moment(item.created_at).fromNow()}`}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    {
                      flexDirection: 'column',
                      paddingStart: 8 * width,
                      marginTop: 1 * width,
                    },
                    ConstData.ELEVATION_STYLE,
                  ]}>
                  <Image
                    source={require('../../../assets/images/trianglecomment.png')}
                    style={{
                      width: 3.2 * width,
                      height: 3 * width,
                      resizeMode: 'stretch',
                      // backgroundColor: '#ada',
                    }}
                  />
                  <View
                    style={[
                      {
                        width: '100%',
                        backgroundColor: ColorCode.white,
                        padding: 3 * width,
                        borderTopEndRadius: 2 * width,
                        borderBottomEndRadius: 2 * width,
                        borderBottomStartRadius: 2 * width,
                      },
                    ]}>
                    {item.parent_comment &&
                      item.parent_comment.id != discussionData.id && (
                        <View
                          style={{
                            width: '100%',
                            flexDirection: 'row',
                            backgroundColor: '#F1F1F1',
                            borderRadius: 2 * width,
                            marginBottom: 2 * width,
                          }}>
                          <View
                            style={{
                              width: 2 * width,
                              height: '100%',
                              overflow: 'hidden',
                            }}>
                            <View
                              style={{
                                flex: 1,
                                width: 4 * width,
                                overflow: 'hidden',
                                borderRadius: 2 * width,
                                backgroundColor: '#FFA800',
                              }}
                            />
                          </View>
                          <View style={{ flex: 1, padding: 3 * width }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}>
                              <FastImage
                                style={{
                                  width: 9 * width,
                                  height: 9 * width,
                                  backgroundColor: '#F6F6F6',
                                  borderRadius: 10 * width,
                                  borderColor: '#DEDEDE',
                                  borderWidth: 1,
                                }}
                                source={
                                  item.parent_comment.admin
                                    ? {
                                      uri:
                                        profileUrl +
                                        '/' +
                                        item.parent_comment.admin?.photo,
                                    }
                                    : item.parent_comment.student
                                      ? {
                                        uri:
                                          profileUrl +
                                          '/' +
                                          item.parent_comment.student?.photo,
                                      }
                                      : item.parent_comment.teacher
                                        ? {
                                          uri:
                                            profileUrl +
                                            '/' +
                                            item.parent_comment.teacher?.photo,
                                        }
                                        : require('../../../assets/images/splash_logo.png')
                                }
                              />
                              <Text
                                style={{
                                  fontFamily: Fonts.Medium,
                                  fontSize: 3.2 * width,
                                  color: '#000000',
                                  marginStart: 3 * width,
                                }}
                                numberOfLines={1}>
                                {item.parent_comment.admin
                                  ? `${item.parent_comment.admin?.name}`
                                  : item.parent_comment.teacher
                                    ? `${item.parent_comment.teacher?.name}`
                                    : item.parent_comment.student
                                      ? `${item.parent_comment.student?.name}`
                                      : 'N/A'}
                              </Text>
                            </View>
                            <Text
                              style={{
                                flex: 1,
                                fontFamily: Fonts.Regular,
                                fontSize: 3.2 * width,
                                color: '#565973',
                                marginTop: 2 * width,
                              }}
                              numberOfLines={2}>
                              {`${item.parent_comment.content}`}
                            </Text>
                          </View>
                        </View>
                      )}
                    {item.documents.length > 0 && (
                      <View style={{ width: '100%' }}>
                        <TouchableOpacity
                          style={{
                            width: item.documents[0].document_file.includes(
                              '.pdf',
                            )
                              ? 10 * width
                              : '100%',
                            height: item.documents[0].document_file.includes(
                              '.pdf',
                            )
                              ? 10 * width
                              : 60 * width,
                            marginBottom: 1 * width,
                          }}
                          onPress={() => {
                            if (
                              item.documents[0].document_file.includes('.mp4')
                            ) {
                              setSelVdo(
                                docUrl + '/' + item.documents[0].document_file,
                              );
                              setShowSelVdoPopup(true);
                            } else if (
                              item.documents[0].document_file.includes('.pdf')
                            ) {
                              setSelPdf(
                                docUrl + '/' + item.documents[0].document_file,
                              );
                              setShowSelPdfPopup(true);
                            } else {
                              setselImg(
                                docUrl + '/' + item.documents[0].document_file,
                              );
                              setShowSelImgPopup(true);
                            }
                            ToastUtility.showToast(
                              item.documents[0].document_file,
                            );
                          }}>
                          {item.documents[0].document_file.includes('.mp4') ? (
                            <View
                              style={{
                                flex: 1,
                              }}>
                              <Video
                                source={{
                                  uri:
                                    docUrl +
                                    '/' +
                                    item.documents[0].document_file,
                                }} // Can be a URL or a local file.
                                paused={true}
                                controls={false}
                                style={{ width: '100%', height: '100%' }}
                                onError={() => {
                                  console.log('vdo load error');
                                }}
                              />
                              <View
                                style={{
                                  // flex: 1,
                                  width: '100%',
                                  height: '100%',
                                  position: 'absolute',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: '#0006',
                                }}>
                                <Ionicons
                                  name="play"
                                  size={10 * width}
                                  color={ColorCode.white}
                                />
                              </View>
                            </View>
                          ) : (
                            <FastImage
                              source={
                                item.documents[0].document_file.includes('.pdf')
                                  ? require('../../../assets/images/pdf.png')
                                  : {
                                    uri:
                                      docUrl +
                                      '/' +
                                      item.documents[0].document_file,
                                  }
                              }
                              style={{
                                width: '100%',
                                height: '100%',
                                resizeMode: 'cover',
                                borderRadius: 1 * width,
                                backgroundColor: '#F6F6F6',
                              }}
                            />
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                    <Text
                      style={{
                        flex: 1,
                        fontFamily: Fonts.Regular,
                        fontSize: 3.2 * width,
                        color: '#565973',
                      }}>
                      {`${item.content}`}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={{
                    alignSelf: 'flex-end',
                    paddingTop: 1 * width,
                    marginTop: 1 * width,
                    paddingHorizontal: 1 * width,
                  }}
                  onPress={() => {
                    setSelectedComment(item);
                  }}>
                  <Text
                    style={{
                      fontFamily: Fonts.Regular,
                      fontSize: 3 * width,
                      color: '#6A6A6A',
                    }}
                    numberOfLines={1}>
                    {'REPLY'}
                  </Text>
                </TouchableOpacity>
              </View>
              {/* <View
                style={{width: '100%', height: 2, backgroundColor: '#ada'}}
              /> */}
              {item.forums_comments.length > 0 &&
                childCommentView(item.forums_comments)}
            </View>
          );
        }}
      />
    );
  };

  const childCommentView = list => {
    return (
      <FlatList
        data={list}
        renderItem={({ item, index }) => {
          return (
            <View key={index} style={{ flex: 1 }}>
              <View
                style={{
                  paddingHorizontal: 4 * width,
                  paddingVertical: 2 * width,
                }}>
                <View style={{ flexDirection: 'row' }}>
                  <FastImage
                    style={{
                      width: 11 * width,
                      height: 11 * width,
                      backgroundColor: '#F6F6F6',
                      borderRadius: 10 * width,
                      borderColor: '#DEDEDE',
                      borderWidth: 1,
                    }}
                    source={
                      item.comment_by.photo
                        ? {
                          uri: profileUrl + '/' + item.comment_by?.photo,
                        }
                        : item.admin?.photo
                          ? {
                            uri: profileUrl + '/' + item.admin?.photo,
                          }
                          : item.student?.photo
                            ? {
                              uri: profileUrl + '/' + item.student?.photo,
                            }
                            : item.teacher?.photo
                              ? {
                                uri: profileUrl + '/' + item.teacher?.photo,
                              }
                              : require('../../../assets/images/splash_logo.png')
                    }
                  />
                  <View
                    style={{
                      marginStart: 3 * width,
                      paddingTop: 2 * width,
                    }}>
                    <Text
                      style={{
                        fontFamily: Fonts.Medium,
                        fontSize: 3.2 * width,
                        color: '#000000',
                      }}
                      numberOfLines={1}>
                      {item.comment_by.name
                        ? `${item.comment_by.name}`
                        : item.admin?.name
                          ? `${item.admin?.name}`
                          : item.student?.name
                            ? `${item.student?.name}`
                            : item.teacher?.name
                              ? `${item.teacher?.name}`
                              : 'N/A'}
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.Regular,
                        fontSize: 3 * width,
                        color: '#6A6A6A',
                      }}
                      numberOfLines={1}>
                      {/* {`${moment(item.created_at).format('MMM DD, YYYY')}`} */}
                      {`${moment(item.created_at).fromNow()}`}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    {
                      flexDirection: 'column',
                      paddingStart: 8 * width,
                      marginTop: 1 * width,
                    },
                    ConstData.ELEVATION_STYLE,
                  ]}>
                  <Image
                    source={require('../../../assets/images/trianglecomment.png')}
                    style={{
                      width: 3.2 * width,
                      height: 3 * width,
                      resizeMode: 'stretch',
                      // backgroundColor: '#ada',
                    }}
                  />
                  <View
                    style={[
                      {
                        width: '100%',
                        backgroundColor: ColorCode.white,
                        padding: 3 * width,
                        borderTopEndRadius: 2 * width,
                        borderBottomEndRadius: 2 * width,
                        borderBottomStartRadius: 2 * width,
                      },
                    ]}>
                    {item.parent_comment &&
                      item.parent_comment.id != discussionData.id && (
                        <View
                          style={{
                            width: '100%',
                            flexDirection: 'row',
                            backgroundColor: '#F1F1F1',
                            borderRadius: 2 * width,
                            marginBottom: 2 * width,
                          }}>
                          <View
                            style={{
                              width: 2 * width,
                              height: '100%',
                              overflow: 'hidden',
                            }}>
                            <View
                              style={{
                                flex: 1,
                                width: 4 * width,
                                overflow: 'hidden',
                                borderRadius: 2 * width,
                                backgroundColor: '#FFA800',
                              }}
                            />
                          </View>
                          <View style={{ flex: 1, padding: 3 * width }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}>
                              <FastImage
                                style={{
                                  width: 9 * width,
                                  height: 9 * width,
                                  backgroundColor: '#F6F6F6',
                                  borderRadius: 10 * width,
                                  borderColor: '#DEDEDE',
                                  borderWidth: 1,
                                }}
                                source={
                                  item.parent_comment.admin
                                    ? {
                                      uri:
                                        profileUrl +
                                        '/' +
                                        item.parent_comment.admin?.photo,
                                    }
                                    : item.parent_comment.student
                                      ? {
                                        uri:
                                          profileUrl +
                                          '/' +
                                          item.parent_comment.student?.photo,
                                      }
                                      : item.parent_comment.teacher
                                        ? {
                                          uri:
                                            profileUrl +
                                            '/' +
                                            item.parent_comment.teacher?.photo,
                                        }
                                        : require('../../../assets/images/splash_logo.png')
                                }
                              />
                              <Text
                                style={{
                                  fontFamily: Fonts.Medium,
                                  fontSize: 3.2 * width,
                                  color: '#000000',
                                  marginStart: 3 * width,
                                }}
                                numberOfLines={1}>
                                {item.parent_comment.admin
                                  ? `${item.parent_comment.admin?.name}`
                                  : item.parent_comment.teacher
                                    ? `${item.parent_comment.teacher?.name}`
                                    : item.parent_comment.student
                                      ? `${item.parent_comment.student?.name}`
                                      : 'N/A'}
                              </Text>
                            </View>
                            <Text
                              style={{
                                flex: 1,
                                fontFamily: Fonts.Regular,
                                fontSize: 3.2 * width,
                                color: '#565973',
                                marginTop: 2 * width,
                              }}
                              numberOfLines={2}>
                              {`${item.parent_comment.content}`}
                            </Text>
                          </View>
                        </View>
                      )}
                    {item.documents.length > 0 && (
                      <View style={{ width: '100%' }}>
                        <TouchableOpacity
                          style={{
                            width: item.documents[0].document_file.includes(
                              '.pdf',
                            )
                              ? 10 * width
                              : '100%',
                            height: item.documents[0].document_file.includes(
                              '.pdf',
                            )
                              ? 10 * width
                              : 60 * width,
                            marginBottom: 1 * width,
                          }}
                          onPress={() => {
                            if (
                              item.documents[0].document_file.includes('.mp4')
                            ) {
                              setSelVdo(
                                docUrl + '/' + item.documents[0].document_file,
                              );
                              setShowSelVdoPopup(true);
                            } else if (
                              item.documents[0].document_file.includes('.pdf')
                            ) {
                              setSelPdf(
                                docUrl + '/' + item.documents[0].document_file,
                              );
                              setShowSelPdfPopup(true);
                            } else {
                              setselImg(
                                docUrl + '/' + item.documents[0].document_file,
                              );
                              setShowSelImgPopup(true);
                            }
                            ToastUtility.showToast(
                              item.documents[0].document_file,
                            );
                          }}>
                          {item.documents[0].document_file.includes('.mp4') ? (
                            <View
                              style={{
                                flex: 1,
                              }}>
                              <Video
                                source={{
                                  uri:
                                    docUrl +
                                    '/' +
                                    item.documents[0].document_file,
                                }} // Can be a URL or a local file.
                                paused={true}
                                controls={false}
                                style={{ width: '100%', height: '100%' }}
                                onError={() => {
                                  console.log('vdo load error');
                                }}
                              />
                              <View
                                style={{
                                  // flex: 1,
                                  width: '100%',
                                  height: '100%',
                                  position: 'absolute',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: '#0006',
                                }}>
                                <Ionicons
                                  name="play"
                                  size={10 * width}
                                  color={ColorCode.white}
                                />
                              </View>
                            </View>
                          ) : (
                            <FastImage
                              source={
                                item.documents[0].document_file.includes('.pdf')
                                  ? require('../../../assets/images/pdf.png')
                                  : {
                                    uri:
                                      docUrl +
                                      '/' +
                                      item.documents[0].document_file,
                                  }
                              }
                              style={{
                                width: '100%',
                                height: '100%',
                                resizeMode: 'cover',
                                borderRadius: 1 * width,
                                backgroundColor: '#F6F6F6',
                              }}
                            />
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                    <Text
                      style={{
                        flex: 1,
                        fontFamily: Fonts.Regular,
                        fontSize: 3.2 * width,
                        color: '#565973',
                      }}>
                      {`${item.content}`}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={{
                    alignSelf: 'flex-end',
                    paddingTop: 1 * width,
                    marginTop: 1 * width,
                    paddingHorizontal: 1 * width,
                  }}
                  onPress={() => {
                    setSelectedComment(item);
                  }}>
                  <Text
                    style={{
                      fontFamily: Fonts.Regular,
                      fontSize: 3 * width,
                      color: '#6A6A6A',
                    }}
                    numberOfLines={1}>
                    {'REPLY'}
                  </Text>
                </TouchableOpacity>
              </View>
              {/* <View
                style={{width: '100%', height: 2, backgroundColor: '#ada'}}
              /> */}
              {item.forums_comments.length > 0 &&
                commentView1(item.forums_comments)}
            </View>
          );
        }}
      />
    );
  };

  const commentView1 = list => {
    return (
      <FlatList
        data={list}
        renderItem={({ item, index }) => {
          return (
            <View key={index} style={{ flex: 1 }}>
              <View
                style={{
                  paddingHorizontal: 4 * width,
                  paddingVertical: 2 * width,
                }}>
                <View style={{ flexDirection: 'row' }}>
                  <FastImage
                    style={{
                      width: 11 * width,
                      height: 11 * width,
                      backgroundColor: '#F6F6F6',
                      borderRadius: 10 * width,
                      borderColor: '#DEDEDE',
                      borderWidth: 1,
                    }}
                    source={
                      item.comment_by.photo
                        ? {
                          uri: profileUrl + '/' + item.comment_by?.photo,
                        }
                        : item.admin?.photo
                          ? {
                            uri: profileUrl + '/' + item.admin?.photo,
                          }
                          : item.student?.photo
                            ? {
                              uri: profileUrl + '/' + item.student?.photo,
                            }
                            : item.teacher?.photo
                              ? {
                                uri: profileUrl + '/' + item.teacher?.photo,
                              }
                              : require('../../../assets/images/splash_logo.png')
                    }
                  />
                  <View
                    style={{
                      marginStart: 3 * width,
                      paddingTop: 2 * width,
                    }}>
                    <Text
                      style={{
                        fontFamily: Fonts.Medium,
                        fontSize: 3.2 * width,
                        color: '#000000',
                      }}
                      numberOfLines={1}>
                      {item.comment_by.name
                        ? `${item.comment_by.name}`
                        : item.admin?.name
                          ? `${item.admin?.name}`
                          : item.student?.name
                            ? `${item.student?.name}`
                            : item.teacher?.name
                              ? `${item.teacher?.name}`
                              : 'N/A'}
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.Regular,
                        fontSize: 3 * width,
                        color: '#6A6A6A',
                      }}
                      numberOfLines={1}>
                      {/* {`${moment(item.created_at).format('MMM DD, YYYY')}`} */}
                      {`${moment(item.created_at).fromNow()}`}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    {
                      flexDirection: 'column',
                      paddingStart: 8 * width,
                      marginTop: 1 * width,
                    },
                    ConstData.ELEVATION_STYLE,
                  ]}>
                  <Image
                    source={require('../../../assets/images/trianglecomment.png')}
                    style={{
                      width: 3.2 * width,
                      height: 3 * width,
                      resizeMode: 'stretch',
                      // backgroundColor: '#ada',
                    }}
                  />
                  <View
                    style={[
                      {
                        width: '100%',
                        backgroundColor: ColorCode.white,
                        padding: 3 * width,
                        borderTopEndRadius: 2 * width,
                        borderBottomEndRadius: 2 * width,
                        borderBottomStartRadius: 2 * width,
                      },
                    ]}>
                    {item.parent_comment &&
                      item.parent_comment.id != discussionData.id && (
                        <View
                          style={{
                            width: '100%',
                            flexDirection: 'row',
                            backgroundColor: '#F1F1F1',
                            borderRadius: 2 * width,
                            marginBottom: 2 * width,
                          }}>
                          <View
                            style={{
                              width: 2 * width,
                              height: '100%',
                              overflow: 'hidden',
                            }}>
                            <View
                              style={{
                                flex: 1,
                                width: 4 * width,
                                overflow: 'hidden',
                                borderRadius: 2 * width,
                                backgroundColor: '#FFA800',
                              }}
                            />
                          </View>
                          <View style={{ flex: 1, padding: 3 * width }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}>
                              <FastImage
                                style={{
                                  width: 9 * width,
                                  height: 9 * width,
                                  backgroundColor: '#F6F6F6',
                                  borderRadius: 10 * width,
                                  borderColor: '#DEDEDE',
                                  borderWidth: 1,
                                }}
                                source={
                                  item.parent_comment.admin
                                    ? {
                                      uri:
                                        profileUrl +
                                        '/' +
                                        item.parent_comment.admin?.photo,
                                    }
                                    : item.parent_comment.student
                                      ? {
                                        uri:
                                          profileUrl +
                                          '/' +
                                          item.parent_comment.student?.photo,
                                      }
                                      : item.parent_comment.teacher
                                        ? {
                                          uri:
                                            profileUrl +
                                            '/' +
                                            item.parent_comment.teacher?.photo,
                                        }
                                        : require('../../../assets/images/splash_logo.png')
                                }
                              />
                              <Text
                                style={{
                                  fontFamily: Fonts.Medium,
                                  fontSize: 3.2 * width,
                                  color: '#000000',
                                  marginStart: 3 * width,
                                }}
                                numberOfLines={1}>
                                {item.parent_comment.admin
                                  ? `${item.parent_comment.admin?.name}`
                                  : item.parent_comment.teacher
                                    ? `${item.parent_comment.teacher?.name}`
                                    : item.parent_comment.student
                                      ? `${item.parent_comment.student?.name}`
                                      : 'N/A'}
                              </Text>
                            </View>
                            <Text
                              style={{
                                flex: 1,
                                fontFamily: Fonts.Regular,
                                fontSize: 3.2 * width,
                                color: '#565973',
                                marginTop: 2 * width,
                              }}
                              numberOfLines={2}>
                              {`${item.parent_comment.content}`}
                            </Text>
                          </View>
                        </View>
                      )}
                    {item.documents.length > 0 && (
                      <View style={{ width: '100%' }}>
                        <TouchableOpacity
                          style={{
                            width: item.documents[0].document_file.includes(
                              '.pdf',
                            )
                              ? 10 * width
                              : '100%',
                            height: item.documents[0].document_file.includes(
                              '.pdf',
                            )
                              ? 10 * width
                              : 60 * width,
                            marginBottom: 1 * width,
                          }}
                          onPress={() => {
                            if (
                              item.documents[0].document_file.includes('.mp4')
                            ) {
                              setSelVdo(
                                docUrl + '/' + item.documents[0].document_file,
                              );
                              setShowSelVdoPopup(true);
                            } else if (
                              item.documents[0].document_file.includes('.pdf')
                            ) {
                              setSelPdf(
                                docUrl + '/' + item.documents[0].document_file,
                              );
                              setShowSelPdfPopup(true);
                            } else {
                              setselImg(
                                docUrl + '/' + item.documents[0].document_file,
                              );
                              setShowSelImgPopup(true);
                            }
                            ToastUtility.showToast(
                              item.documents[0].document_file,
                            );
                          }}>
                          {item.documents[0].document_file.includes('.mp4') ? (
                            <View
                              style={{
                                flex: 1,
                              }}>
                              <Video
                                source={{
                                  uri:
                                    docUrl +
                                    '/' +
                                    item.documents[0].document_file,
                                }} // Can be a URL or a local file.
                                paused={true}
                                controls={false}
                                style={{ width: '100%', height: '100%' }}
                                onError={() => {
                                  console.log('vdo load error');
                                }}
                              />
                              <View
                                style={{
                                  // flex: 1,
                                  width: '100%',
                                  height: '100%',
                                  position: 'absolute',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: '#0006',
                                }}>
                                <Ionicons
                                  name="play"
                                  size={10 * width}
                                  color={ColorCode.white}
                                />
                              </View>
                            </View>
                          ) : (
                            <FastImage
                              source={
                                item.documents[0].document_file.includes('.pdf')
                                  ? require('../../../assets/images/pdf.png')
                                  : {
                                    uri:
                                      docUrl +
                                      '/' +
                                      item.documents[0].document_file,
                                  }
                              }
                              style={{
                                width: '100%',
                                height: '100%',
                                resizeMode: 'cover',
                                borderRadius: 1 * width,
                                backgroundColor: '#F6F6F6',
                              }}
                            />
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                    <Text
                      style={{
                        flex: 1,
                        fontFamily: Fonts.Regular,
                        fontSize: 3.2 * width,
                        color: '#565973',
                      }}>
                      {`${item.content}`}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={{
                    alignSelf: 'flex-end',
                    paddingTop: 1 * width,
                    marginTop: 1 * width,
                    paddingHorizontal: 1 * width,
                  }}
                  onPress={() => {
                    setSelectedComment(item);
                  }}>
                  <Text
                    style={{
                      fontFamily: Fonts.Regular,
                      fontSize: 3 * width,
                      color: '#6A6A6A',
                    }}
                    numberOfLines={1}>
                    {'REPLY'}
                  </Text>
                </TouchableOpacity>
              </View>
              {/* <View
                style={{width: '100%', height: 2, backgroundColor: '#ada'}}
              /> */}
              {item.forums_comments.length > 0 &&
                childCommentView(item.forums_comments)}
            </View>
          );
        }}
      />
    );
  };

  const documentView = () => {
    return showImagePopup ? (
      <View
        style={{
          width: '100%',
        }}>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            paddingVertical: 2 * width,
          }}>
          <TouchableOpacity
            onPress={() => {
              openCamera();
              setShowDocumentPopup(false);
            }}
            style={[
              {
                width: '42%',
                height: 15 * width,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: ColorCode.white,
                marginVertical: 3 * width,
                borderRadius: 3 * width,
              },
              ConstData.ELEVATION_STYLE,
            ]}>
            <Ionicons
              name="camera-outline"
              size={6 * width}
              color={ColorCode.primary}
            />
            <Text
              style={{
                fontFamily: Fonts.Medium,
                fontSize: 4 * width,
                color: ColorCode.primary,
                marginStart: 3 * width,
              }}
              numberOfLines={1}>
              {`Camera`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              openGallery();
              setShowDocumentPopup(false);
            }}
            style={[
              {
                width: '42%',
                height: 15 * width,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: ColorCode.white,
                marginVertical: 3 * width,
                borderRadius: 3 * width,
              },
              ConstData.ELEVATION_STYLE,
            ]}>
            <Ionicons
              name="images-outline"
              size={6 * width}
              color={ColorCode.primary}
            />
            <Text
              style={{
                fontFamily: Fonts.Medium,
                fontSize: 4 * width,
                color: ColorCode.primary,
                marginStart: 3 * width,
              }}
              numberOfLines={1}>
              {`Gallery`}
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{ width: '100%', height: 1, backgroundColor: ColorCode.greyDDD }}
        />
      </View>
    ) : (
      <View
        style={{
          width: '100%',
        }}>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            paddingVertical: 2 * width,
            padding: 2 * width,
          }}>
          <TouchableOpacity
            onPress={() => {
              openDocPicker();
              setShowDocumentPopup(false);
            }}
            style={[
              {
                flex: 1,
                // width: '42%',
                height: 15 * width,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: ColorCode.white,
                marginVertical: 3 * width,
                borderRadius: 3 * width,
                marginHorizontal: 2 * width,
              },
              ConstData.ELEVATION_STYLE,
            ]}>
            <AntDesign
              name="pdffile1"
              size={6 * width}
              color={ColorCode.primary}
            />
            <Text
              style={{
                fontFamily: Fonts.Medium,
                fontSize: 4 * width,
                color: ColorCode.primary,
                marginStart: 3 * width,
              }}
              numberOfLines={1}>
              {`PDF`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              openVideoGallery();
              setShowDocumentPopup(false);
            }}
            style={[
              {
                flex: 1,
                // width: '42%',
                height: 15 * width,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: ColorCode.white,
                marginVertical: 3 * width,
                borderRadius: 3 * width,
                marginHorizontal: 2 * width,
              },
              ConstData.ELEVATION_STYLE,
            ]}>
            <Ionicons
              name="videocam-outline"
              size={6 * width}
              color={ColorCode.primary}
            />
            <Text
              style={{
                fontFamily: Fonts.Medium,
                fontSize: 4 * width,
                color: ColorCode.primary,
                marginStart: 2 * width,
              }}
              numberOfLines={1}>
              {`Video`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setShowImagePopup(true);
            }}
            style={[
              {
                flex: 1,
                // width: '42%',
                height: 15 * width,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: ColorCode.white,
                marginVertical: 3 * width,
                borderRadius: 3 * width,
                marginHorizontal: 2 * width,
              },
              ConstData.ELEVATION_STYLE,
            ]}>
            <Ionicons
              name="image-outline"
              size={7 * width}
              color={ColorCode.primary}
            />
            <Text
              style={{
                fontFamily: Fonts.Medium,
                fontSize: 4 * width,
                color: ColorCode.primary,
                marginStart: 2 * width,
              }}
              numberOfLines={1}>
              {`Image`}
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{ width: '100%', height: 1, backgroundColor: ColorCode.greyDDD }}
        />
      </View>
    );
  };

  const selectedDocView = () => {
    return (
      <View
        style={{
          width: '100%',
          backgroundColor: '#F8F8F8',
        }}>
        <View
          style={{
            width: '92%',
            alignSelf: 'center',
            flexDirection: 'row',
            paddingVertical: 2 * width,
            alignItems: 'center',
          }}>
          <View
            style={{
              width: 10 * width,
              height: 10 * width,
              // marginBottom: 1 * width,
            }}
            onPress={() => {
              ToastUtility.showToast(selectedDocument);
            }}>
            {selectedDocument.includes('.mp4') ||
              selectedDocument.includes('.MOV') ||
              selectedDocument.includes('.mov') ? (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Video
                  source={{ uri: selectedDocument }} // Can be a URL or a local file.
                  paused={true}
                  controls={false}
                  style={{ width: '100%', height: '100%' }}
                  onError={() => {
                    console.log('vdo load error');
                  }}
                />
                <Ionicons
                  name="play"
                  size={4 * width}
                  color={ColorCode.white}
                  style={{ position: 'absolute' }}
                />
              </View>
            ) : (
              <FastImage
                source={
                  selectedDocument.includes('.pdf')
                    ? require('../../../assets/images/pdf.png')
                    : { uri: selectedDocument }
                }
                style={{
                  width: '100%',
                  height: '100%',
                  resizeMode: 'cover',
                  borderRadius: 2 * width,
                }}
              />
            )}
          </View>
          <Text
            style={{
              flex: 1,
              fontFamily: Fonts.Regular,
              fontSize: 3.4 * width,
              color: '#565973',
              marginStart: 3 * width,
            }}
            ellipsizeMode="head"
            numberOfLines={1}>
            {`${selectedDocument}`}
          </Text>
          <TouchableOpacity
            style={{ padding: 1 * width }}
            onPress={() => {
              setSelectedDocument(null);
            }}>
            <Ionicons name="close" size={6 * width} color={ColorCode.black} />
          </TouchableOpacity>
        </View>
        <View
          style={{ width: '100%', height: 1, backgroundColor: ColorCode.greyDDD }}
        />
      </View>
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
        <View
          style={{
            width: '100%',
            height: '10%',
            position: 'absolute',
            backgroundColor: ColorCode.primary,
          }}
        />
        <CustomSAView
          parentStyple={{
            flex: 1,
            backgroundColor: ColorCode.transarent,
            paddingBottom: keyboardHeight,
          }}
          style={{ flex: 1, backgroundColor: ColorCode.transarent }}>
          <HeaderWithBack
            title="Discussion Topic"
            backgroundColor={ColorCode.primary}
            textColor={ColorCode.white}
          />
          <View
            style={{
              flex: 1,
              // paddingHorizontal: 3 * width,
              backgroundColor: ColorCode.white,
            }}>
            <View style={{ overflow: 'hidden', paddingBottom: 2 }}>
              <View
                style={{
                  width: '100%',
                  paddingHorizontal: 3 * width,
                  paddingVertical: 3 * width,
                  marginVertical: 2 * width,
                  backgroundColor: ColorCode.white,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  marginBottom: 3,
                  elevation: 3,
                }}>
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
                      discussionData.admin?.photo
                        ? {
                          uri: profileUrl + '/' + discussionData.admin?.photo,
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
                    {`${discussionData.admin?.name}`}
                  </Text>
                </View>

                <Text
                  style={{
                    fontFamily: Fonts.Medium,
                    fontSize: 3.8 * width,
                    color: '#000000',
                    marginTop: 2 * width,
                    lineHeight: 6 * width,
                  }}
                  numberOfLines={2}>
                  {`${discussionData.title}`}
                </Text>

                <Text
                  style={{
                    lineHeight: 5 * width,
                    fontFamily: Fonts.Regular,
                    fontSize: 3.2 * width,
                    color: '#565973',
                    marginTop: 2 * width,
                  }}
                  numberOfLines={4}>
                  {`${discussionData.content}`}
                </Text>
                {discussionData1?.documents.length > 0 && (
                  <View style={{ flexDirection: 'column', marginTop: 1 * width }}>
                    <ScrollView horizontal>
                      {discussionData1?.documents.map((doc, index) => (
                        <TouchableOpacity
                          onPress={() => {
                            if (
                              doc.document_file.includes('.mp4') ||
                              doc.document_file.includes('.MOV') ||
                              doc.document_file.includes('.mov')
                            ) {
                              setSelVdo(docUrl + '/' + doc.document_file);
                              setShowSelVdoPopup(true);
                            } else if (doc.document_file.includes('.pdf')) {
                              setSelPdf(docUrl + '/' + doc.document_file);
                              setShowSelPdfPopup(true);
                            } else {
                              setselImg(docUrl + '/' + doc.document_file);
                              setShowSelImgPopup(true);
                            }
                          }}
                          key={index}
                          style={{
                            width: 15 * width,
                            height: 15 * width,
                            backgroundColor: '#F6F6F6',
                            borderRadius: 2 * width,
                            borderWidth: 1,
                            margin: 1 * width,
                            borderColor: ColorCode.greyDDD,
                          }}>
                          {doc.document_file.includes('.mp4') ||
                            doc.document_file.includes('.MOV') ||
                            doc.document_file.includes('.mov') ? (
                            <View
                              style={{
                                flex: 1,
                              }}>
                              <Video
                                source={{
                                  uri: docUrl + '/' + doc.document_file,
                                }} // Can be a URL or a local file.
                                paused={true}
                                controls={false}
                                style={{ width: '100%', height: '100%' }}
                                onError={() => {
                                  console.log('vdo load error');
                                }}
                              />
                              <View
                                style={{
                                  // flex: 1,
                                  width: '100%',
                                  height: '100%',
                                  position: 'absolute',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: '#0006',
                                }}>
                                <Ionicons
                                  name="play"
                                  size={6 * width}
                                  color={ColorCode.white}
                                />
                              </View>
                            </View>
                          ) : (
                            <FastImage
                              style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: '#F6F6F6',
                                // borderRadius: 2 * width,
                              }}
                              resizeMode="cover"
                              source={
                                doc.document_file.includes('.pdf')
                                  ? require('../../../assets/images/pdf.png')
                                  : {
                                    uri: docUrl + '/' + doc.document_file,
                                  }
                              }
                            />
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
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
                    {moment(discussionData.created_at)
                      .format('MMM DD, YYYY')
                      .toUpperCase()}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    {discussionData1?.count.length > 0 && (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginEnd: 2 * width,
                        }}>
                        <FastImage
                          style={{
                            width: 8 * width,
                            height: 8 * width,
                            backgroundColor: '#F6F6F6',
                            borderRadius: 6 * width,
                            borderWidth: 1,
                            borderColor: '#9397AD',
                          }}
                          source={
                            discussionData1?.count[0].view_by.photo
                              ? {
                                uri:
                                  profileUrl +
                                  '/' +
                                  discussionData1?.count[0].view_by.photo,
                              }
                              : require('../../../assets/images/splash_logo.png')
                          }
                        />
                        {discussionData1?.count.length > 1 && (
                          <FastImage
                            style={{
                              width: 8 * width,
                              height: 8 * width,
                              backgroundColor: '#F6F6F6',
                              borderRadius: 6 * width,
                              marginStart: -3 * width,
                              borderWidth: 1,
                              borderColor: '#9397AD',
                            }}
                            source={
                              discussionData1?.count[1].view_by.photo
                                ? {
                                  uri:
                                    profileUrl +
                                    '/' +
                                    discussionData1?.count[1].view_by.photo,
                                }
                                : require('../../../assets/images/splash_logo.png')
                            }
                          />
                        )}
                        {discussionData1?.count.length > 2 && (
                          <FastImage
                            style={{
                              width: 8 * width,
                              height: 8 * width,
                              backgroundColor: '#F6F6F6',
                              borderRadius: 6 * width,
                              marginStart: -3 * width,
                              borderWidth: 1,
                              borderColor: '#9397AD',
                            }}
                            source={
                              discussionData1?.count[2].view_by.photo
                                ? {
                                  uri:
                                    profileUrl +
                                    '/' +
                                    discussionData1?.count[2].view_by.photo,
                                }
                                : require('../../../assets/images/splash_logo.png')
                            }
                          />
                        )}
                        {discussionData1?.count.length > 3 && (
                          <FastImage
                            style={{
                              width: 8 * width,
                              height: 8 * width,
                              backgroundColor: '#F6F6F6',
                              borderRadius: 6 * width,
                              marginStart: -3 * width,
                              borderWidth: 1,
                              borderColor: '#9397AD',
                            }}
                            source={
                              discussionData1?.count[3].view_by.photo
                                ? {
                                  uri:
                                    profileUrl +
                                    '/' +
                                    discussionData1?.count[3].view_by.photo,
                                }
                                : require('../../../assets/images/splash_logo.png')
                            }
                          />
                        )}
                        {discussionData1?.count.length > 4 && (
                          <FastImage
                            style={{
                              width: 8 * width,
                              height: 8 * width,
                              backgroundColor: '#F6F6F6',
                              borderRadius: 6 * width,
                              marginStart: -3 * width,
                              borderWidth: 1,
                              borderColor: '#9397AD',
                            }}
                            source={
                              discussionData1?.count[4].view_by.photo
                                ? {
                                  uri:
                                    profileUrl +
                                    '/' +
                                    discussionData1?.count[4].view_by.photo,
                                }
                                : require('../../../assets/images/splash_logo.png')
                            }
                          />
                        )}
                        {discussionData1?.count.length > 5 && (
                          <FastImage
                            style={{
                              width: 8 * width,
                              height: 8 * width,
                              backgroundColor: '#F6F6F6',
                              borderRadius: 6 * width,
                              marginStart: -3 * width,
                              borderWidth: 1,
                              borderColor: '#9397AD',
                            }}
                            source={
                              discussionData1?.count[1].view_by.photo
                                ? {
                                  uri:
                                    profileUrl +
                                    '/' +
                                    discussionData1?.count[1].view_by.photo,
                                }
                                : require('../../../assets/images/splash_logo.png')
                            }>
                            <View
                              style={{
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#0003',
                              }}>
                              <Text
                                style={{
                                  fontFamily: Fonts.Regular,
                                  fontSize: 3.2 * width,
                                  color: '#9397AD',
                                  marginStart: 1 * width,
                                }}
                                numberOfLines={1}>
                                {`+${discussionData1?.count.length - 5}`}
                              </Text>
                            </View>
                          </FastImage>
                        )}
                      </View>
                    )}
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
                      {`${discussionData.comments_count}`}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
              {commentView(commentsList)}
            </View>
          </View>
          <View style={{ width: '100%' }}>
            <View
              style={{ width: '100%', height: 1, backgroundColor: '#B9B9B9' }}
            />
            {selectedComment && (
              <View
                style={{
                  width: '90%',
                  marginVertical: 2 * width,
                  alignSelf: 'center',
                  flexDirection: 'row',
                  backgroundColor: '#F1F1F1',
                  borderRadius: 2 * width,
                  // marginBottom: 2 * width,
                }}>
                <View
                  style={{
                    width: 2 * width,
                    height: '100%',
                    overflow: 'hidden',
                  }}>
                  <View
                    style={{
                      flex: 1,
                      width: 4 * width,
                      overflow: 'hidden',
                      borderRadius: 2 * width,
                      backgroundColor: '#FFA800',
                    }}
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                    padding: 2 * width,
                    width: '100%',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <FastImage
                      style={{
                        width: 9 * width,
                        height: 9 * width,
                        backgroundColor: '#F6F6F6',
                        borderRadius: 10 * width,
                        borderColor: '#DEDEDE',
                        borderWidth: 1,
                      }}
                      source={
                        selectedComment.admin
                          ? {
                            uri:
                              profileUrl + '/' + selectedComment.admin?.photo,
                          }
                          : selectedComment.student
                            ? {
                              uri:
                                profileUrl +
                                '/' +
                                selectedComment.student?.photo,
                            }
                            : selectedComment.teacher
                              ? {
                                uri:
                                  profileUrl +
                                  '/' +
                                  selectedComment.teacher?.photo,
                              }
                              : require('../../../assets/images/splash_logo.png')
                      }
                    />
                    <Text
                      style={{
                        fontFamily: Fonts.Medium,
                        fontSize: 3.2 * width,
                        color: '#000000',
                        marginStart: 3 * width,
                      }}
                      numberOfLines={1}>
                      {selectedComment.admin
                        ? `${selectedComment.admin?.name}`
                        : selectedComment.teacher
                          ? `${selectedComment.teacher?.name}`
                          : selectedComment.student
                            ? `${selectedComment.student?.name}`
                            : selectedComment.comment_by
                              ? `${selectedComment.comment_by.name}`
                              : 'N/A'}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        fontFamily: Fonts.Regular,
                        fontSize: 3.2 * width,
                        color: '#565973',
                        marginTop: 2 * width,
                        marginStart: 1 * width,
                      }}
                      numberOfLines={1}>
                      {`${selectedComment.content}`}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={{ padding: 1 * width }}
                  onPress={() => {
                    setSelectedComment(null);
                  }}>
                  <Ionicons
                    name="close"
                    size={5 * width}
                    color={ColorCode.black}
                  />
                </TouchableOpacity>
              </View>
            )}
            {showDocumentPopup && documentView()}
            {!showDocumentPopup && selectedDocument && selectedDocView()}
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                paddingHorizontal: 4 * width,
                paddingVertical: 3 * width,
              }}>
              <FastImage
                style={{
                  width: 12 * width,
                  height: 12 * width,
                  backgroundColor: '#F6F6F6',
                  borderRadius: 8 * width,
                  borderWidth: 2,
                  borderColor: '#107BEF',
                }}
                source={
                  user?.proile_image
                    ? { uri: user?.proile_image }
                    : require('../../../assets/images/type_in_person.png')
                }
              />
              <View
                style={{
                  flex: 1,
                  height: 12 * width,
                  borderRadius: 8 * width,
                  borderWidth: 1,
                  borderColor: '#B4B7C9',
                  backgroundColor: '#F3F3F3',
                  alignItems: 'center',
                  flexDirection: 'row',
                  marginStart: 3 * width,
                  paddingHorizontal: 1 * width,
                  // paddingVertical: 1 * width,
                }}>
                <TextInput
                  style={{
                    flex: 1,
                    color: ColorCode.black,
                    fontSize: 3.4 * width,
                    fontFamily: Fonts.Regular,
                    paddingHorizontal: 2 * width,
                    backgroundColor: '#F3F3F3',
                    borderRadius: 6 * width,
                    textAlignVertical: 'center',
                  }}
                  maxLength={200}
                  multiline={true}
                  placeholder="Add a comment"
                  placeholderTextColor={'#565973'}
                  value={newComment}
                  onChangeText={t => {
                    setNewComment(t);
                  }}
                />
                <TouchableOpacity
                  onPress={() => {
                    setShowDocumentPopup(!showDocumentPopup);
                    if (!showDocumentPopup) {
                      setShowImagePopup(false);
                    }
                  }}
                  style={{
                    width: 8 * width,
                    height: 8 * width,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginHorizontal: 0.5 * width,
                  }}>
                  <Ionicons
                    name="attach"
                    size={6 * width}
                    color={ColorCode.black}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    sendComment();
                  }}
                  style={{
                    width: 9 * width,
                    height: 9 * width,
                    borderRadius: 5 * width,
                    backgroundColor: ColorCode.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingStart: 1 * width,
                    marginHorizontal: 0.5 * width,
                  }}>
                  <Ionicons
                    name="send"
                    size={4 * width}
                    color={ColorCode.white}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </CustomSAView>
      </View>

      <Modal
        visible={showSelImgPopup}
        transparent
        onRequestClose={() => {
          setShowSelImgPopup(false);
          setselImg('');
        }}>
        {selImg && (
          <Pressable
            style={{
              flex: 1,
              backgroundColor: '#0004',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <FastImage
              source={{ uri: selImg }}
              style={{ width: '90%', height: '60%' }}
              resizeMode="contain"
            />

            <TouchableOpacity
              onPress={() => {
                setShowSelImgPopup(false);
                setselImg('');
              }}
              style={{
                width: 14 * width,
                height: 14 * width,
                borderRadius: 10 * width,
                backgroundColor: '#FFF',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Ionicons name="close" size={8 * width} color={ColorCode.red} />
            </TouchableOpacity>
          </Pressable>
        )}
      </Modal>

      <Modal
        visible={showSelPdfPopup}
        transparent
        onRequestClose={() => {
          setShowSelPdfPopup(false);
          setSelPdf('');
        }}>
        {selPdf && (
          <Pressable
            style={{
              flex: 1,
              backgroundColor: '#0004',
            }}>
            <CustomSAView
              parentStyple={{
                flex: 1,
                backgroundColor: ColorCode.transarent,
              }}
              style={{
                flex: 1,
                backgroundColor: ColorCode.transarent,
                // height: 50 * height,
                // width: 100 * width,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View style={{ flex: 1, width: 100 * width }}>
                <Pdf
                  trustAllCerts={false}
                  source={{ uri: selPdf }}
                  onLoadComplete={(numberOfPages, filePath) => {
                    console.log(`Number of pages: ${numberOfPages}`);
                  }}
                  onPageChanged={(page, numberOfPages) => {
                    console.log(`Current page: ${page}`);
                  }}
                  onError={error => {
                    console.log(error);
                  }}
                  onPressLink={uri => {
                    console.log(`Link pressed: ${uri}`);
                  }}
                  style={{ flex: 1 }}
                />
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowSelPdfPopup(false);
                  setSelPdf('');
                }}
                style={{
                  width: 10 * width,
                  height: 10 * width,
                  borderRadius: 10 * width,
                  // backgroundColor: '#FFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'absolute',
                  right: 2 * width,
                  top: 2 * width,
                }}>
                <Ionicons name="close" size={8 * width} color={ColorCode.red} />
              </TouchableOpacity>
            </CustomSAView>
          </Pressable>
        )}
      </Modal>

      <Modal
        visible={showSelVdoPopup}
        transparent
        onRequestClose={() => {
          setShowSelVdoPopup(false);
          setSelVdo('');
        }}>
        {selVdo && (
          <Pressable
            style={{
              flex: 1,
              backgroundColor: '#0004',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 2 * width,
            }}>
            <View
              style={{
                width: '100%',
                height: 50 * width,
                backgroundColor: '#FFFFFF',
                borderRadius: 2 * width,
                padding: 2 * width,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Video
                source={{
                  uri: selVdo,
                }}
                // playWhenInactive={false}
                fullscreenAutorotate={true}
                preventsDisplaySleepDuringVideoPlayback={true}
                // Callback when remote video is buffering
                onBuffer={b => {
                  console.log('buffering', b);
                }}
                onProgress={p => {
                  console.log('progress', p);
                  // console.log('progress bar', p.currentTime / p.seekableDuration);
                }}
                onEnd={() => { }}
                // Callback when video cannot be loaded
                // onError={onError}
                controls={true}
                style={{ width: '100%', height: '100%' }}
              />
            </View>

            <TouchableOpacity
              onPress={() => {
                setShowSelVdoPopup(false);
                setSelVdo('');
              }}
              style={{
                width: 14 * width,
                height: 14 * width,
                borderRadius: 10 * width,
                marginTop: 5 * width,
                backgroundColor: '#FFF',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Ionicons name="close" size={8 * width} color={ColorCode.red} />
            </TouchableOpacity>
          </Pressable>
        )}
      </Modal>
      <CustomProgress show={showProgress} />
    </Provider>
  );
};

export default DiscussionDetailScreen;
