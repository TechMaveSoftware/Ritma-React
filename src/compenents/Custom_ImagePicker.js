import { View, Text, Modal, TouchableOpacity, Alert, Linking, Platform, Dimensions } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
// import height from '../Units/height';
// import width from '../Units/width';

const screenWidth = Dimensions.get('window').width;
const width = screenWidth > 420 ? 420 / 100 : screenWidth / 100;
const height = Dimensions.get('window').height / 100;
import ColorCode from '../utility/ColorCode';
import { pick, keepLocalCopy, types } from '@react-native-documents/picker';
import ToastUtility from '../utility/ToastUtility';
import Fonts from '../utility/Fonts';
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';

const Custom_ImagePicker = ({
  visibility,
  setVisibility,
  selectedImagePath,
  limit,
  enableDocumentPicker = false,
}) => {

  const openImagePicker = async () => {
    setVisibility(false);

    // Check gallery permission for iOS
    if (Platform.OS === 'ios') {
      const status = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
      if (status === RESULTS.BLOCKED || status === RESULTS.DENIED) {
        const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        if (result !== RESULTS.GRANTED && result !== RESULTS.LIMITED) {
          Alert.alert(
            'Gallery Permission Required',
            'Gallery access is required to select photos. Please enable it in settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
          return;
        }
      }
    }

    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 1000,
      maxWidth: 1000,
      quality: 0.6,
      selectionLimit: limit,
    };
    setTimeout(() => {
      launchImageLibrary(options, response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('Image picker error: ', response.error);
        } else {
          console.log('gallery', response);
          if (limit == 10) {
            const selectedImages = response.assets.map(asset => ({
              uri: asset.uri || asset.uri,
            }));
            console.log('ImageUri===>', selectedImages);
            selectedImagePath(selectedImages);
          } else {
            let imageUri = response.assets?.[0]?.uri;
            selectedImagePath(imageUri);
          }
        }
      });
    }, 1000);
  };

  const handleCameraLaunch = () => {
    setVisibility(false);
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 1000,
      maxWidth: 1000,
      quality: 0.6,
      saveToPhotos: false, // Don't save to photos on iOS
    };

    // Add a small delay to ensure modal is closed before launching camera
    setTimeout(() => {
      launchCamera(options, response => {
        console.log('Camera response:', response);
        if (response.didCancel) {
          console.log('User cancelled camera');
        } else if (response.error || response.errorCode) {
          console.log('Camera Error: ', response.error || response.errorCode);
          const errorMessage = response.error || response.errorMessage || 'Camera error occurred';
          const errorCode = response.errorCode || '';

          // Check if error is related to permissions
          if (errorCode === 'camera_unavailable' || errorCode === 'permission' ||
            errorMessage.toLowerCase().includes('permission') ||
            errorMessage.toLowerCase().includes('denied') ||
            errorMessage.toLowerCase().includes('not authorized')) {
            Alert.alert(
              'Camera Permission Required',
              'Camera access is required to take photos. Please enable camera permissions in your device settings.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open Settings', onPress: () => Linking.openSettings() },
              ],
              { cancelable: false }
            );
          } else {
            ToastUtility.showToast(errorMessage);
          }
        } else if (response.assets && response.assets.length > 0) {
          // iOS returns assets array
          console.log('Camera success', response);
          const imageUri = response.assets[0].uri;
          if (imageUri) {
            selectedImagePath(imageUri);
          } else {
            ToastUtility.showToast('Failed to get image path');
          }
        } else if (response.uri) {
          // Android returns uri directly
          console.log('Camera success', response);
          selectedImagePath(response.uri);
        } else {
          console.log('Unexpected camera response:', response);
          ToastUtility.showToast('Failed to capture image');
        }
      });
    }, 300);
  };

  const openCamera = async () => {
    let permission;
    if (Platform.OS === 'ios') {
      permission = PERMISSIONS.IOS.CAMERA;
    } else {
      permission = PERMISSIONS.ANDROID.CAMERA;
    }

    const cameraPermission = await check(permission);
    if (cameraPermission === RESULTS.GRANTED) {
      handleCameraLaunch();
    } else if (cameraPermission === RESULTS.DENIED) {
      const result = await request(permission);
      if (result === RESULTS.GRANTED) {
        handleCameraLaunch();
      } else {
        Alert.alert(
          'Camera Permission Denied',
          'You need to allow camera access to take photos.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      }
    } else if (cameraPermission === RESULTS.BLOCKED) {
      Alert.alert(
        'Camera Permission Blocked',
        'Camera access is blocked. Please allow camera access in app settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
        { cancelable: false }
      );
    } else {
      // Fallback for other states
      handleCameraLaunch();
    }
  };

  const openDocPicker = async () => {
    setVisibility(false);
    setTimeout(async () => {
      try {
        console.log('📄 Opening PDF picker...');
        const result = await pick({ type: [types.pdf] });
        console.log('📄 PDF picker result:', result);

        if (!result || result.length === 0) {
          console.log('📄 No PDF selected or user cancelled');
          return;
        }

        const file = result[0];
        if (!file || !file.uri) {
          console.log('📄 Invalid file selected');
          return;
        }

        console.log('📄 Selected PDF file:', file);

        const localCopyResult = await keepLocalCopy({
          files: [
            {
              uri: file.uri,
              fileName: file.name ?? 'fallbackName',
            },
          ],
          destination: 'documentDirectory',
        });

        console.log('📄 Local copy result:', localCopyResult);

        if (!localCopyResult || localCopyResult.length === 0 || !localCopyResult[0].localUri) {
          console.error('📄 Failed to create local copy');
          ToastUtility.showToast('Failed to process PDF file');
          return;
        }

        const localCopy = localCopyResult[0];
        console.log('📄 PDF local URI:', localCopy.localUri);
        console.log('📄 PDF file name:', file.name);
        // Pass the local URI - it should be a file:// path with the actual filename
        selectedImagePath(localCopy.localUri);
      } catch (error) {
        console.error('📄 PDF picker error:', error);
        if (error.message && error.message.includes('cancel')) {
          console.log('📄 User cancelled PDF picker');
        } else {
          ToastUtility.showToast('Error selecting PDF: ' + (error.message || 'Unknown error'));
        }
      }
    }, 1000);

    // DocumentPicker.pickSingle({
    //   type: [DocumentPicker.types.pdf],
    //   copyTo: 'documentDirectory',
    //   //There can me more options as well
    //   // DocumentPicker.types.allFiles
    //   // DocumentPicker.types.images
    //   // DocumentPicker.types.plainText
    //   // DocumentPicker.types.audio
    //   // DocumentPicker.types.pdf
    // })
    //   .then(res => {
    //     console.log('Res', res);
    //     selectedImagePath(res.fileCopyUri);

    //   })
    //   .catch(err => {
    //     console.log('err', err);
    //   });
  };

  return (
    <Modal transparent={true} animationType="slide" visible={visibility}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
        <View
          style={{
            width: screenWidth > 420 ? 350 : '90%', // Reduced from 450
            borderRadius: 2 * width,
            backgroundColor: 'white',
            alignItems: 'center',
            paddingVertical: 3 * width,
          }}>
          <TouchableOpacity
            style={{ padding: screenWidth > 420 ? 1.5 * height : 2.5 * height, width: '100%' }} // Reduced padding for tablet
            onPress={openCamera}>
            <Text
              style={{
                color: ColorCode.mainClr,
                fontFamily: Fonts.Bold,
                fontSize: screenWidth > 420 ? 3.5 * width : 4 * width, // Reduced for tablet
                textAlign: 'center',
              }}>
              Take Photo
            </Text>
          </TouchableOpacity>
          <View
            style={{ backgroundColor: '#d5ded7', height: 1, width: '100%' }}
          />
          <TouchableOpacity
            style={{
              padding: screenWidth > 420 ? 1.5 * height : 2.5 * height, // Reduced padding for tablet
              width: '100%',
            }}
            onPress={openImagePicker}>
            <Text
              style={{
                color: ColorCode.mainClr,
                fontFamily: Fonts.Bold,
                fontSize: screenWidth > 420 ? 3.5 * width : 4 * width, // Reduced for tablet
                textAlign: 'center',
              }}>
              Choose From Gallery
            </Text>
          </TouchableOpacity>
          <View
            style={{ backgroundColor: '#d5ded7', height: 1, width: '100%' }}
          />
          {enableDocumentPicker && (
            <TouchableOpacity
              style={{
                padding: screenWidth > 420 ? 1.5 * height : 2.5 * height, // Reduced padding for tablet
                width: '100%',
              }}
              onPress={openDocPicker}>
              <Text
                style={{
                  color: ColorCode.mainClr,
                  fontFamily: Fonts.Bold,
                  fontSize: screenWidth > 420 ? 3.5 * width : 4 * width, // Reduced for tablet
                  textAlign: 'center',
                }}>
                Choose PDF
              </Text>
            </TouchableOpacity>
          )}
          {enableDocumentPicker && (
            <View
              style={{ backgroundColor: '#d5ded7', height: 1, width: '100%' }}
            />
          )}
          <TouchableOpacity
            style={{
              borderRadius: 1 * height,
              marginHorizontal: 2 * width,
              justifyContent: 'center',
              backgroundColor: 'white',
              alignItems: 'center',
              padding: screenWidth > 420 ? 1.5 * height : 2.5 * height, // Reduced padding for tablet
              width: '90%',
            }}
            onPress={() => setVisibility(false)}>
            <Text
              style={{
                color: ColorCode.mainClr,
                fontFamily: Fonts.Bold,
                fontSize: screenWidth > 420 ? 3.5 * width : 4 * width, // Reduced for tablet
                textAlign: 'center',
              }}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default Custom_ImagePicker;
