import React, { Fragment, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Modal, Provider } from 'react-native-paper';
import CustomStatus from '../../compenents/CustomStatus';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Dropdown } from 'react-native-element-dropdown';
import width from '../../Units/width';
import Fonts from '../../utility/Fonts';
import height from '../../Units/height';
import ApiMethod from '../../api/ApiMethod';
import CustomProgress from '../../compenents/CustomProgress';
import moment from 'moment';
import { pick, keepLocalCopy, types } from '@react-native-documents/picker';
import ConstData from '../../utility/ConstData';
// import ImageCropPicker from 'react-native-image-crop-picker';
import { styles } from 'react-native-gifted-charts/src/LineChart/styles';
import Pdf from 'react-native-pdf';
import { PermissionsAndroid } from 'react-native';
import StorageUtility from '../../utility/StorageUtility';
import { CommonActions } from '@react-navigation/native';
import ToastUtility from '../../utility/ToastUtility';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import CustomHeader from '../../compenents/CustomHeader';
import ColorCode from '../../utility/ColorCode';

const weekAr = [
  { label: 'Week 1', value: 1 },
  { label: 'Week 2', value: 2 },
  { label: 'Week 3', value: 3 },
  { label: 'Week 4', value: 4 },
  { label: 'Week 5', value: 5 },
  { label: 'Week 6', value: 6 },
];

// Options will be created dynamically based on current selection
const getImagePickerOptions = (currentImageCount = 0) => ({
  title: 'Select Image',
  multiple: true,
  selectionLimit: Math.max(1, 6 - currentImageCount), // Dynamic limit, max 6 total
  maxWidth: 1024, // Downscale to avoid huge payloads
  maxHeight: 1024,
  quality: 0.8,
  mediaType: 'photo',
  includeBase64: false,
  storageOptions: {
    skipBackup: true,
    path: 'images',
  },
});

import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';

const UploadAssignment1Screen = ({ navigation, route }) => {
  const [chapterData, setChapterData] = useState(route.params.data);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [assignmentTitle, setAssignmentTitle] = useState(null);
  const [showProgress, setShowProgress] = useState(false);
  const [showSelection, sethowSelection] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedImagesCamera, setSelectedImagesCamera] = useState([]);
  const [preview, setPreview] = useState(false);
  const [uploadMethod, setUploadMethod] = useState('');
  const [titleError, setTitleError] = useState(false);
  const [docs, setDocs] = useState([]);
  const [pdfPreview, setPdfPreview] = useState(false);
  const hasPdfSelected = !!docs?.uri || pdfPreview;
  const hasImagesSelected = selectedImages.length > 0 || preview;
  console.log('***************', docs);
  console.log('chapterData', chapterData);

  useEffect(() => {
    setShowProgress(false);
  }, []);

  // checking title name //
  const checkTitleForPdf = () => {
    if (hasImagesSelected) {
      ToastUtility.showToast('JPG already selected. Please clear it before uploading PDF.');
      return;
    }
    // if (assignmentTitle) {
    //   openDocPicker();
    // } else {
    //   setTitleError(true);
    // }
    openDocPicker();
  };

  const checkTitleForImage = () => {
    if (hasPdfSelected) {
      ToastUtility.showToast('PDF already selected. Please clear it before uploading JPG.');
      return;
    }
    // if (assignmentTitle) {
    //   sethowSelection(true);
    // } else {
    //   setTitleError(true);
    // }
    sethowSelection(true);
  };

  const openDocPicker = async () => {
    const [file] = await pick({
      type: [types.pdf],
    });
    console.log('file', file);
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
    console.log('=-=-=-', [{ uri: localCopy.localUri, name: file.name }]);
    setDocs({ uri: localCopy.localUri, name: file.name });
    setPdfPreview(true);

 
  };

  const resetUploadSelection = () => {
    setPdfPreview(false);
    setPreview(false);
    setDocs([]);
    setSelectedImages([]);
    sethowSelection(false);
  };

  const handleCancel = () => {
    resetUploadSelection();
  };
  const handlePicCancel = () => {
    resetUploadSelection();
  };
  const handleSave = uri => {
    setPdfPreview(false);
    setPreview(false);
    uploadDoc(1, docs.uri);
  };

  const openCamera = async () => {
    if (hasPdfSelected) {
      ToastUtility.showToast('PDF already selected. Please clear it before uploading JPG.');
      return;
    }

    if (selectedImages.length >= 6) {
      ToastUtility.showToast('You can upload a maximum of 6 images.');
      return;
    }

    // Permission handling
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

    // Clear existing images when opening camera for new selection
    const currentOptions = getImagePickerOptions(selectedImages.length);
    launchCamera(currentOptions, response => {
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
        const source = response.assets;
        console.log('image, ', source);

        // Append new images to existing ones
        setSelectedImages([...selectedImages, ...source]);
        setPreview(true);

        // compressImage(response.assets[0].uri)
      }
    });

    // ImageCropPicker.openCamera({
    //   multiple: true,
    //   maxFiles: 3,
    //   cropping: false,
    // }).then(newImgs => {
    //   console.log('captured images', newImgs);

    //   // Ensure newImgs is an array before using map
    //   if (Array.isArray(newImgs)) {
    //     setSelectedImages([...selectedImages, ...newImgs.map(img => img.path)]);
    //   } else if (newImgs.path) {
    //     // If it's a single image, newImgs will not be an array
    //     setSelectedImages([...selectedImages, newImgs.path]);
    //   }

    //   setPreview(true);
    // });
  };

  const openGallery = () => {
    if (hasPdfSelected) {
      ToastUtility.showToast('PDF already selected. Please clear it before uploading JPG.');
      return;
    }

    if (selectedImages.length >= 6) {
      ToastUtility.showToast('You can upload a maximum of 6 images.');
      return;
    }
    // Clear existing images when opening gallery for new selection
    const currentOptions = getImagePickerOptions(selectedImages.length);
    launchImageLibrary(currentOptions, response => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = response.assets;
        console.log('image, ', source);

        // Append new images to existing ones
        setSelectedImages([...selectedImages, ...source]);
        setPreview(true);
      }
    });
    // ImageCropPicker.openPicker({
    //   multiple: true,
    //   cropping: false,
    //   mediaType: 'photo',
    // }).then(newImgs => {
    //   console.log('Gallery images', newImgs);
    //   setSelectedImages([...selectedImages, ...newImgs.map(img => img.path)]);
    //   setPreview(true);
    // });
  };

  const extractApiErrorMessage = err => {
    const fallback = 'Failed to upload assignment. Please try again.';
    if (!err) return fallback;

    const pickFirstError = errorsObj => {
      if (!errorsObj || typeof errorsObj !== 'object') return null;
      const firstErrorGroup = Object.values(errorsObj)[0];
      if (Array.isArray(firstErrorGroup) && firstErrorGroup.length > 0) {
        return String(firstErrorGroup[0]);
      }
      if (typeof firstErrorGroup === 'string') {
        return firstErrorGroup;
      }
      return null;
    };

    const parseMaybeJson = value => {
      if (typeof value !== 'string') return null;
      try {
        return JSON.parse(value);
      } catch (e) {
        return null;
      }
    };

    if (typeof err === 'string') return err;

    const directErrors = pickFirstError(err.errors);
    if (directErrors) return directErrors;

    if (err.message && typeof err.message === 'string') return err.message;

    if (typeof err.response === 'string') {
      const parsed = parseMaybeJson(err.response);
      if (parsed) return extractApiErrorMessage(parsed);
      return err.response;
    }

    if (err.response && typeof err.response === 'object') {
      if (err.response.data) {
        const nested = extractApiErrorMessage(err.response.data);
        if (nested && nested !== fallback) return nested;
      }
      if (err.response._response) {
        const parsed = parseMaybeJson(err.response._response);
        if (parsed) {
          const nested = extractApiErrorMessage(parsed);
          if (nested && nested !== fallback) return nested;
        }
      }
    }

    if (err.data && typeof err.data === 'object') {
      const nested = extractApiErrorMessage(err.data);
      if (nested && nested !== fallback) return nested;
    }

    return fallback;
  };

  const uploadDoc = (type, filePath) => {
    setShowProgress(true);
    const formData = new FormData();
    formData.append('syllabus_id', chapterData.id);
    formData.append('submit_date', moment().format('yyyy-MM-DD'));
    formData.append('type', type);
    formData.append('title', assignmentTitle || '');

    if (chapterData.class_assignment_id) {
      formData.append('assignment_id', chapterData.class_assignment_id);
    }

    if (type == 1) {
      formData.append('assignment[]', {
        uri:
          Platform.OS === 'android'
            ? filePath
            : filePath.replace('file://', ''),
        type: 'application/*',
        name: `Doc_${Date.now()}.pdf`,
      });
    } else {
      filePath.forEach((item, index) => {
        let uri = item.uri;
        if (Platform.OS === 'android' && !uri.startsWith('file://') && !uri.startsWith('content://')) {
          uri = `file://${uri}`;
        }

        let name = item.fileName || `Doc_${Date.now()}_${index}.jpg`;
        let type = item.type;

        // If type is missing, infer it from extension or default to jpeg
        if (!type) {
          const ext = name.split('.').pop().toLowerCase();
          if (ext === 'png') type = 'image/png';
          else if (ext === 'jpg' || ext === 'jpeg') type = 'image/jpeg';
          else type = 'image/jpeg';
        }

        formData.append('assignment[]', {
          uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
          type: type,
          name: name,
        });
      });
    }

    setShowProgress(true);
    ApiMethod.uploadAssignments(
      formData,
      pass => {
        setShowProgress(false);
        if (pass.status == '200') {
          console.log('************TRUE************', pass);
          setTimeout(() => {
            setShowSuccess(false);
            setSelectedImages([]);
            if (navigation.canGoBack()) {
              navigation.goBack();
            }
          }, 1500);
          setShowSuccess(true);
        } else {
          console.log('************FALSE************', pass);
          console.log('Upload validation/full error response:', pass);
          console.log('Upload extracted error message:', extractApiErrorMessage(pass));
          // Clear images on failure so user can try again
          setSelectedImages([]);
          setPreview(false);
          setDocs([]);
          setPdfPreview(false);
          ToastUtility.showToast(extractApiErrorMessage(pass));
        }
      },
      async fail => {
        setShowProgress(false);
        console.log('************UPLOAD API FAILED************', fail);
        console.log('Upload extracted fail message:', extractApiErrorMessage(fail));
        // Clear selected images on submission failure so user can try again
        setSelectedImages([]);
        setPreview(false);
        setDocs([]);
        setPdfPreview(false);
        if (fail.status == 404 && fail.message && fail.message.includes('User not found')) {
          await StorageUtility.logout();
          ToastUtility.showToast('User not found. Please Re-Login');
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'AuthStack' }],
            }),
          );
        } else {
          ToastUtility.showToast(extractApiErrorMessage(fail));
        }
      },
    );
  };
  const handleSubmit = () => {
    // Call the uploadDoc function with the selected images
    setPreview(false);
    setPdfPreview(false);
    console.log(
      '+++++++*********Image Upload******+++++++++++++',
      selectedImages,
    );
    uploadDoc(2, selectedImages);
  };

  const handleAllSubmit = () => {
    if (preview) {
      handleSubmit();
    } else {
      handleSave();
    }
  };
  const handleAllCancel = () => {
    resetUploadSelection();
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

  const deleteImage = index => {
    const updatedImages = [...selectedImages];
    updatedImages.splice(index, 1);
    setSelectedImages(updatedImages);
    if (updatedImages.length === 0) {
      handleAllCancel(); // Call the function to handle cancel
    }
  };

  return (
    <Provider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <CustomStatus trans={true} isDark={true} color="#FFFFFF" />
        <CustomHeader
          text={'Upload Assignment'}
          customStyle={{ marginTop: -5, paddingVertical: 5 }}
        />
        <View style={{ flex: 1, backgroundColor: '#EBF7F8' }}>
          <View
            style={{
              flex: 1,
              width: '100%',
              backgroundColor: '#EBF7F8',
              paddingVertical: 3 * width,
              paddingHorizontal: 5 * width,
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#fff',
                padding: width * 3.5,
                borderRadius: width * 3,
                borderWidth: 0.5,
                borderColor: ColorCode.greyAAA,
              }}>
              <Text style={Styles.headerText1}>{'Assigned On :'}</Text>
              <Text style={Styles.headerText1}>
                {(() => {
                  const assignedDate =
                    chapterData?.assignment?.created_at ||
                    chapterData?.submitted_assignment?.created_at ||
                    chapterData?.created_at ||
                    chapterData?.syllabus?.created_at ||
                    chapterData?.assigned_date ||
                    chapterData?.assigned_at ||
                    chapterData?.syllabus?.assigned_date ||
                    chapterData?.syllabus?.assigned_at;

                  if (assignedDate) {
                    const dateMoment = moment.utc(assignedDate);
                    if (dateMoment.isValid()) {
                      return dateMoment.format('MMM DD, YYYY');
                    }
                  }
                  return 'N/A';
                })()}
              </Text>
            </View>

            {/*  <Text style={Styles.headerText1}>{'Submission On'}</Text>
          <Text style={Styles.weekText}>{`${moment().format('MMM DD')}`}</Text> */}

            {/* <Text style={Styles.headerText1}>{'Assignment Title'}</Text>

          <TouchableOpacity
            style={{
              width: '100%',
              height: 6.5 * height,
              // backgroundColor: '#16763E11',
              borderWidth: 1,
              marginTop: 1 * width,
              borderRadius: 3 * width,
              borderColor: '#c0c0c0',
              // alignItems: 'center',
              justifyContent: 'center',
            }}>
            <TextInput
              placeholder="Enter Title"
              placeholderTextColor={'#969696'}
              onBlur={() => setTitleError(false)}
              style={{
                fontSize: 13,
                color: '#000000',
                paddingHorizontal: width * 5,
              }}
              value={assignmentTitle}
              onChangeText={text => setAssignmentTitle(text)}
            />
          </TouchableOpacity>
          {titleError && (
            <Text style={Styles.assignTitleText}>
              {'Please enter title of your assignment first !'}
            </Text>
          )} */}

            <Text style={[Styles.headerText1, { marginTop: width * 4 }]}>
              {'Upload Assignment'}
            </Text>

            <Text
              style={{
                fontSize: 3.6 * width,
                color: ColorCode.black,
                marginBottom: width * 2,
              }}>
              {'Easily upload your assignments and meet deadlines on time.'}
            </Text>

            <TouchableOpacity
              disabled={hasImagesSelected}
              onPress={() => {
                checkTitleForPdf();
              }}
              style={{
                width: '100%',
                height: 15 * height,
                backgroundColor: '#fff',
                borderWidth: 1,
                marginTop: 1 * width,
                borderRadius: 3 * width,
                borderStyle: 'dashed',
                borderColor: ColorCode.primary,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: hasImagesSelected ? 0.5 : 1,
              }}>
              <Image
                source={require('../../assets/images/uploadIcon.png')}
                style={{
                  resizeMode: 'contain',
                  width: width * 10,
                  height: width * 10,
                }}
              />
              <Text style={Styles.markDoneText}>{`Upload PDF`}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={hasPdfSelected}
              onPress={() => {
                checkTitleForImage();
              }}
              style={{
                width: '100%',
                height: 15 * height,
                backgroundColor: '#fff',
                borderWidth: 1,
                marginTop: 3 * height,
                borderRadius: 3 * width,
                borderStyle: 'dashed',
                borderColor: ColorCode.primary,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: hasPdfSelected ? 0.5 : 1,
              }}>
              <Image
                source={require('../../assets/images/uploadIcon.png')}
                style={{
                  resizeMode: 'contain',
                  width: width * 10,
                  height: width * 10,
                }}
              />
              <Text style={Styles.markDoneText}>{`Upload JPG`}</Text>
            </TouchableOpacity>

            {/* Submit button 
          <TouchableOpacity
            onPress={() => {
              // Call the uploadDoc function with the selected images
              selectedImages.forEach(imgPath => uploadDoc(imgPath));
            }}
            style={{
              width: '100%',
              height: 8 * height,
              backgroundColor: '#16763E11',
              borderWidth: 1,
              marginTop: 3 * height,
              borderRadius: 3 * width,
              borderStyle: 'dashed',
              borderColor: '#16763E',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={Styles.markDoneText}>{`Submit`}</Text>
          </TouchableOpacity>  */}

            {(preview || pdfPreview) && (
              <View>
                <View
                  style={{
                    width: '100%',
                    height: '50%',
                    alignSelf: 'center',
                    borderRadius: 2 * width,
                    backgroundColor: '#FFFFFF',
                    // paddingHorizontal: 3 * width,
                    // paddingVertical: 3 * width,
                    flexDirection: 'row',
                    borderColor: '#16763E',
                    borderWidth: 1,
                    marginTop: width * 3,
                    padding: width * 1,
                  }}>
                  {preview && (
                    <ScrollView
                      showsHorizontalScrollIndicator={false}
                      horizontal
                      style={{ marginTop: 10 }}>
                      {/* Display selected images */}
                      {selectedImages.map((item, index) => (
                        <View key={index} style={{ flexWrap: 'wrap' }}>
                          <View style={{ height: width * 2 }} />
                          <Image
                            // key={index}
                            source={{ uri: item.uri }}
                            style={{
                              // flex: 1,
                              width: width * 40,
                              height: width * 40,
                              resizeMode: 'stretch',
                              marginLeft: width * 3,
                              // alignSelf: 'center',
                            }}
                          />
                          <TouchableOpacity
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 5,
                            }}
                            onPress={() => deleteImage(index)}>
                            <Icon name="times" size={20} color="#000000" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  )}
                  {pdfPreview && (
                    <View
                      style={{
                        // flex: 1,
                        width: '100%',
                        height: '30%',
                        // alignSelf: 'center',
                        borderRadius: 2 * width,
                        // backgroundColor: '#FFFFFF',
                        // paddingHorizontal: 3 * width,
                        flexDirection: 'row',
                        alignItems: 'center',
                        // justifyContent: 'center',
                        alignSelf: 'center',
                        // marginLeft: -width * 10,
                        borderColor: 'red',
                        borderWidth: 1,
                      }}>
                      <Image
                        style={{
                          width: width * 12,
                          height: width * 12,
                          // marginLeft: -width * 3,
                        }}
                        source={require('../../assets/images/pdf.png')}
                      />
                      <Text style={{ color: '#000000', marginLeft: width * 3 }}>
                        {docs.name.length > 50
                          ? `${docs.name.substring(0, 35)}...`
                          : docs.name}
                      </Text>
                    </View>
                  )}
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    marginHorizontal: width * 20,
                    justifyContent: 'space-between',
                  }}>
                  <TouchableOpacity
                    onPress={() => handleAllCancel()}
                    style={{
                      marginTop: width * 5,
                      alignSelf: 'center',
                      backgroundColor: '#16763E11',
                      borderRadius: 2 * width,
                    }}>
                    <Text
                      style={{
                        paddingHorizontal: width * 3.5,
                        paddingVertical: width * 1,
                        color: '#008A3D',
                        fontSize: 13,
                      }}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleAllSubmit()}
                    style={{
                      marginTop: width * 5,
                      alignSelf: 'center',
                      backgroundColor: '#008A3D',
                      borderRadius: 2 * width,
                    }}>
                    <Text
                      style={{
                        paddingHorizontal: width * 3.5,
                        paddingVertical: width * 1,
                        color: '#ffffff',
                        fontSize: 13,
                      }}>
                      Submit
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>

      <Modal
        visible={showSelection}
        transparent
        onRequestClose={() => sethowSelection(false)}
        onDismiss={() => sethowSelection(false)}>
        <View
          style={[
            {
              width: '70%',
              borderRadius: 2 * width,
              backgroundColor: '#F7F7F7',
              paddingVertical: 1 * height,
              paddingHorizontal: 2 * height,
              alignSelf: 'center',
              alignItems: 'center',
              // justifyContent: 'center',
            },
            ConstData.ELEVATION_STYLE,
          ]}>
          <Text
            style={{
              width: '100%',
              textAlign: 'center',
              paddingVertical: 1 * height,
              color: '#232323',
              fontSize: 4 * width,
              fontWeight: '600',
              marginTop: 1 * height,
            }}>
            Choose From
          </Text>
          <View style={{ width: '90%', height: 2, backgroundColor: '#888888' }} />
          <View
            style={{
              flexDirection: 'row',
              marginTop: 2 * height,
            }}>
            <TouchableOpacity
              onPress={() => {
                sethowSelection(false);
                openCamera();
              }}
              style={{
                flex: 1,
                height: 10 * height,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f0f0f0',
                margin: 1 * width,
                borderRadius: 2 * width,
              }}>
              <Feather name="camera" color={'#232323'} size={6 * width} />
              <Text
                style={{
                  color: '#232323',
                  fontSize: 3 * width,
                  fontWeight: '600',
                  marginTop: 1 * height,
                }}>
                Camera
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                sethowSelection(false);
                openGallery();
              }}
              style={{
                flex: 1,
                height: 10 * height,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f0f0f0',
                margin: 1 * width,
                borderRadius: 2 * width,
              }}>
              <Feather name="image" color={'#232323'} size={6 * width} />
              <Text
                style={{
                  color: '#232323',
                  fontSize: 3 * width,
                  fontWeight: '600',
                  marginTop: 1 * height,
                }}>
                Gallery
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => sethowSelection(false)}
            style={{
              // flex: 1,
              height: 3 * height,
              alignItems: 'center',
              justifyContent: 'center',
              // backgroundColor: '#f0f0f0',
              margin: 2 * width,
              paddingHorizontal: 2 * width,
              borderRadius: 2 * width,
            }}>
            <Text
              style={{
                color: '#FF0011',
                fontSize: 3 * width,
                fontWeight: '600',
              }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={showSuccess} onDismiss={() => setShowSuccess(false)}>
        <View
          style={{
            width: '80%',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 4 * height,
            backgroundColor: '#FFFFFF',
            borderRadius: 4 * width,
            alignSelf: 'center',
          }}>
          <View
            style={{
              width: 7 * height,
              height: 7 * height,
              borderRadius: 5 * height,
              backgroundColor: '#008A3D',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Feather name="check" size={8 * width} color="#FFFFFF" />
          </View>

          <Text
            style={{
              fontFamily: Fonts.Medium,
              fontSize: 3.4 * width,
              color: '#000000',
              marginTop: 3 * height,
            }}>
            {'Assignment Submitted!'}
          </Text>
        </View>
      </Modal>
      <CustomProgress show={showProgress} />
    </Provider >
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
  },
  weekText: {
    color: '#969696',
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
  uploadTextGrey: {
    color: '#888686',
    fontSize: 3.4 * width,
    fontFamily: Fonts.Regular,
    // marginTop: 2 * width,
  },
  markDoneText: {
    color: '#000',
    fontSize: 3.4 * width,
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
  assignTitleText: {
    color: '#fc4b4b',
    fontSize: 3 * width,
    fontFamily: Fonts.SemiBold,
    marginTop: 1 * width,
    textAlign: 'center',
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  image: {
    width: width * 15,
    height: width * 15,
    resizeMode: 'cover',
    marginLeft: width * 3,
    // alignSelf: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: 0,
    right: 10,
    // backgroundColor: 'red',
    // borderRadius: 12,
    // padding: 4,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
});
export default UploadAssignment1Screen;
