import React, { Fragment, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-native-paper';
import CustomStatus from '../../../compenents/CustomStatus';
import CustomHeader from '../../../compenents/CustomHeader';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ImageView from '../../../compenents/ImageView';
import width from '../../../Units/width';
import Fonts from '../../../utility/Fonts';
import height from '../../../Units/height';
import ApiMethod from '../../../api/ApiMethod';
import CustomProgress from '../../../compenents/CustomProgress';
import moment from 'moment';
import Entypo from 'react-native-vector-icons/Entypo';
import FastImage from 'react-native-fast-image';
import Pdf from 'react-native-pdf';
import ColorCode from '../../../utility/ColorCode';
import ConstData from '../../../utility/ConstData';
import ToastUtility from '../../../utility/ToastUtility';

const ViewUploadedAssignmentScreen = ({ navigation, route }) => {
  const [viewDocModal, setViewDocModal] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState(route.params?.uploadedDocs || []);
  const [baseUrl, setBaseUrl] = useState(route.params?.baseUrl || '');
  const [singleImg, setSingleImg] = useState('');
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(false);

  useEffect(() => {
    console.log('=== ViewUploadedAssignmentScreen mounted ===');
    console.log('Route params:', JSON.stringify(route.params, null, 2));
    console.log('Uploaded docs:', uploadedDocs?.length || 0);
    console.log('Base URL:', baseUrl);
    console.log('file image is coming+++++ Initial Data:', {
      uploadedDocs: uploadedDocs,
      uploadedDocsLength: uploadedDocs?.length || 0,
      baseUrl: baseUrl,
      firstDoc: uploadedDocs && uploadedDocs.length > 0 ? uploadedDocs[0] : null,
    });

    if (!uploadedDocs || uploadedDocs.length === 0) {
      console.log('No uploaded documents found');
      ToastUtility.showToast('No documents found');
    }
  }, []);

  return (
    <Provider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <CustomStatus trans={true} isDark={true} color="#FFFFFF00" />
        <CustomHeader
          text={'Uploaded Assignments'}
          customStyle={{ marginTop: -5, paddingVertical: 5 }}
        />
        <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
          <View
            style={{
              flex: 1,
              backgroundColor: '#ffffff',
              alignItems: 'center',
              paddingVertical: width * 3,
            }}>
            {uploadedDocs && uploadedDocs.length > 0 ? (
              <FlatList
                data={uploadedDocs}
                numColumns={2}
                style={{ width: '100%' }}
                keyExtractor={(item, index) => `doc-${item.id || item.document || index}`}
                contentContainerStyle={{
                  paddingVertical: width * 3,
                  paddingHorizontal: width * 4,
                  paddingBottom: height * 10,
                }}
                columnWrapperStyle={{
                  justifyContent: 'space-between',
                }}
                renderItem={({ item, index }) => {
                  // Check for different possible field names
                  const documentPath = item.document || item.document_file || item.file || item.path || '';

                  console.log('file image is coming+++++', {
                    index: index,
                    item: item,
                    document: item.document,
                    document_file: item.document_file,
                    file: item.file,
                    path: item.path,
                    documentPath: documentPath,
                    documentType: typeof documentPath,
                    baseUrl: baseUrl,
                    allKeys: Object.keys(item),
                  });

                  // Construct the full URL properly for thumbnail
                  let thumbnailUrl = '';
                  if (baseUrl && documentPath) {
                    const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
                    const cleanPath = (documentPath || '').replace(/^\/+/, '');
                    thumbnailUrl = `${cleanBaseUrl}/${cleanPath}`;
                    thumbnailUrl = thumbnailUrl.replace(/([^:]\/)\/+/g, '$1');

                    if (thumbnailUrl && !thumbnailUrl.startsWith('http://') && !thumbnailUrl.startsWith('https://')) {
                      thumbnailUrl = `https://${thumbnailUrl}`;
                    }
                  } else if (documentPath) {
                    thumbnailUrl = documentPath;
                    if (thumbnailUrl && !thumbnailUrl.startsWith('http://') && !thumbnailUrl.startsWith('https://')) {
                      thumbnailUrl = `https://${thumbnailUrl}`;
                    }
                  }

                  const isPdf = documentPath &&
                    typeof documentPath === 'string' &&
                    documentPath.toLowerCase().endsWith('.pdf');

                  console.log('file image is coming+++++', {
                    isPdf: isPdf,
                    thumbnailUrl: thumbnailUrl,
                    documentPath: documentPath,
                    documentLower: documentPath ? documentPath.toLowerCase() : 'no document',
                  });

                  return (
                    <View
                      style={{
                        width: width * 45,
                        aspectRatio: 1.2,
                        borderRadius: width * 3,
                        marginBottom: width * 4,
                        borderColor: '#D9D9D9',
                        borderWidth: 1,
                        overflow: 'hidden',
                        backgroundColor: ColorCode.white,
                        elevation: 1,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.08,
                        shadowRadius: 2,
                      }}>
                      <TouchableOpacity
                        onPress={async () => {
                          // Check for different possible field names
                          const documentPath = item.document || item.document_file || item.file || item.path || '';

                          console.log('Document clicked:', item);
                          console.log('Base URL:', baseUrl);
                          console.log('Document path:', documentPath);

                          // Construct the full URL properly
                          let fullUrl = '';
                          if (baseUrl && documentPath) {
                            // Remove trailing slash from baseUrl and leading slash from documentPath
                            const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
                            const cleanPath = (documentPath || '').replace(/^\/+/, '');
                            fullUrl = `${cleanBaseUrl}/${cleanPath}`;
                          } else if (documentPath) {
                            fullUrl = documentPath;
                          }

                          // Ensure URL is properly formatted
                          fullUrl = fullUrl.replace(/([^:]\/)\/+/g, '$1');

                          // If URL doesn't have protocol, add https
                          if (fullUrl && !fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
                            fullUrl = `https://${fullUrl}`;
                          }

                          console.log('Final URL:', fullUrl);
                          console.log('=== ViewUploadedAssignmentScreen - Full item data ===', JSON.stringify(item, null, 2));

                          // Get document path and convert to lowercase
                          const pathLower = typeof documentPath === 'string' ? documentPath.toLowerCase().trim() : '';
                          console.log('Lowercase path:', pathLower);

                          // Remove query parameters and check the actual file extension
                          const urlWithoutQuery = fullUrl.split('?')[0].split('#')[0];
                          const urlLower = urlWithoutQuery.toLowerCase();

                          // Extract file extension explicitly
                          const getFileExtension = (path) => {
                            if (!path || typeof path !== 'string') return '';
                            const match = path.match(/\.([a-z0-9]+)$/i);
                            return match ? match[1].toLowerCase() : '';
                          };

                          const pathExtension = getFileExtension(pathLower);
                          const urlExtension = getFileExtension(urlLower);
                          const fileExtension = pathExtension || urlExtension;

                          console.log('File extension detected:', fileExtension, 'from path:', pathExtension, 'from url:', urlExtension);

                          // Define image and PDF extensions
                          const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'heic', 'svg'];
                          const pdfExtensions = ['pdf'];

                          // Determine file type - prioritize extension detection
                          const isImageFile = imageExtensions.includes(fileExtension);
                          const isPdfFile = pdfExtensions.includes(fileExtension);

                          console.log('File type detection - isImageFile:', isImageFile, 'isPdfFile:', isPdfFile);

                          // If we have a clear extension match, use it (extension takes priority)
                          if (isImageFile) {
                            // Definitely an image - open image viewer
                            console.log('✅ Opening as IMAGE (extension match):', fullUrl);
                            setSingleImg(fullUrl);
                            setViewDocModal(!viewDocModal);
                            return; // Early return to prevent any other logic
                          }

                          if (isPdfFile) {
                            // Definitely a PDF - open PDF viewer
                            console.log('✅ Opening as PDF (extension match):', fullUrl);
                            setPdfError(false);
                            setPdfLoading(true);
                            setSelectedPdfUrl(fullUrl);
                            setShowPdfModal(true);
                            return; // Early return
                          }

                          // No clear extension - check type field as fallback
                          const documentType = item.type || item.file_type || null;
                          console.log('No clear extension, checking type field:', documentType);

                          if (documentType !== null && documentType !== undefined) {
                            const clickedIsPdf = documentType === 1 || documentType === '1';
                            if (clickedIsPdf) {
                              console.log('✅ Opening as PDF (type field):', fullUrl);
                              setPdfError(false);
                              setPdfLoading(true);
                              setSelectedPdfUrl(fullUrl);
                              setShowPdfModal(true);
                              return;
                            }
                          }

                          // Default to image viewer if uncertain (images are more common)
                          console.log('⚠️ No clear type detected, defaulting to IMAGE viewer:', fullUrl);
                          setSingleImg(fullUrl);
                          setViewDocModal(!viewDocModal);
                        }}>
                        {isPdf ? (
                          <Image
                            source={require('../../../assets/images/pdf.png')}
                            style={{
                              width: '100%',
                              height: '100%',
                            }}
                            resizeMode="contain"
                          />
                        ) : thumbnailUrl ? (
                          <FastImage
                            style={{
                              width: '100%',
                              height: '100%',
                            }}
                            resizeMode={FastImage.resizeMode.cover}
                            source={{ uri: thumbnailUrl }}
                            defaultSource={require('../../../assets/images/pdf.png')}
                            onError={(error) => {
                              console.log('file image is coming+++++ FastImage Error:', error, thumbnailUrl);
                            }}
                            onLoad={() => {
                              console.log('file image is coming+++++ Image loaded successfully:', thumbnailUrl);
                            }}
                          />
                        ) : (
                          <Image
                            source={require('../../../assets/images/pdf.png')}
                            style={{
                              width: '100%',
                              height: '100%',
                            }}
                            resizeMode="contain"
                          />
                        )}
                        {item.status == 2 && (
                          <View
                            style={{
                              width: '100%',
                              height: '100%',
                              position: 'absolute',
                              backgroundColor: '#008A3D44',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                            <Text
                              style={{
                                color: '#FFFFFF',
                                fontFamily: Fonts.SemiBold,
                                fontSize: 4.5 * width,
                              }}>
                              {'Re-submitted'}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                }}
              />
            ) : (
              <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: height * 10,
              }}>
                <Text style={{
                  fontSize: width * 3.4,
                  color: '#666',
                  textAlign: 'center',
                  fontFamily: Fonts.Regular,
                }}>
                  No documents found
                </Text>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>

      <Modal animationType="fade" transparent={true} visible={viewDocModal}>
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
              height: height * 55,
              backgroundColor: '#ffffff',
              borderRadius: width * 3,
              paddingHorizontal: width * 3,
              paddingVertical: width * 3,
              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={() => setViewDocModal(!viewDocModal)}
              style={{
                width: width * 8,
                height: width * 8,
                borderRadius: width * 4,
                backgroundColor: '#ffffff',
                position: 'absolute',
                top: -width * 3,
                right: -width * 3,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Entypo name="cross" size={width * 5} color="#000000" />
            </TouchableOpacity>

            <View
              style={{
                width: width * 85,
                height: height * 52,
                borderRadius: width * 3,
                marginBottom: width * 2,
                marginLeft: width * 2,
              }}>
              <FastImage
                style={{
                  width: '100%',
                  height: '100%',
                  resizeMode: 'contain',
                }}
                resizeMode="contain"
                source={{ uri: `${singleImg}` }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* PDF Viewer Modal */}
      <Modal
        visible={showPdfModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => {
          setShowPdfModal(false);
          setSelectedPdfUrl('');
          setPdfLoading(false);
          setPdfError(false);
        }}
        statusBarTranslucent={true}>
        <SafeAreaView
          style={{
            flex: 1,
            backgroundColor: ColorCode.white,
          }}>
          <View
            style={{
              flex: 1,
              backgroundColor: ColorCode.white,
              width: '100%',
              marginTop: width * 5.5,
            }}>
            {pdfLoading && !pdfError && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: ColorCode.white,
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 10,
                }}
                pointerEvents="none">
                <CustomProgress show={true} />
              </View>
            )}
            {pdfError ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: width * 4,
                }}>
                <Text
                  style={{
                    fontSize: width * 4,
                    fontFamily: Fonts.SemiBold,
                    color: ColorCode.black,
                    textAlign: 'center',
                    marginBottom: width * 2,
                  }}>
                  Unable to load PDF
                </Text>
                <Text
                  style={{
                    fontSize: width * 3.2,
                    fontFamily: Fonts.Regular,
                    color: ColorCode.black,
                    textAlign: 'center',
                    marginBottom: width * 4,
                  }}>
                  Please check your connection and try again.
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setPdfError(false);
                    setPdfLoading(true);
                    const url = selectedPdfUrl;
                    setSelectedPdfUrl('');
                    setTimeout(() => {
                      setSelectedPdfUrl(url);
                    }, 100);
                  }}
                  style={{
                    paddingVertical: width * 2,
                    paddingHorizontal: width * 6,
                    backgroundColor: ColorCode.primary,
                    borderRadius: width * 2,
                  }}>
                  <Text
                    style={{
                      fontSize: width * 3.5,
                      fontFamily: Fonts.Medium,
                      color: ColorCode.white,
                    }}>
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>
            ) : selectedPdfUrl ? (
              <Pdf
                key={`pdf-${selectedPdfUrl}`}
                trustAllCerts={false}
                scrollEnabled={true}
                source={{
                  uri: selectedPdfUrl,
                  cache: true,
                }}
                onLoadComplete={(numberOfPages, filePath) => {
                  console.log(`✅ PDF loaded successfully. Number of pages: ${numberOfPages}`);
                  console.log(`✅ PDF file path: ${filePath}`);
                  setPdfLoading(false);
                  setPdfError(false);
                }}
                onPageChanged={(page, numberOfPages) => {
                  console.log(`📄 Current page: ${page} of ${numberOfPages}`);
                  if (page >= 1) {
                    setPdfLoading(false);
                  }
                }}
                onLoadProgress={(percent) => {
                  console.log(`⏳ PDF Loading: ${percent}%`);
                  if (percent >= 100) {
                    setTimeout(() => {
                      setPdfLoading(false);
                    }, 100);
                  }
                }}
                onError={error => {
                  console.log('❌ PDF Error Details:', JSON.stringify(error, null, 2));
                  console.log('❌ PDF URL that failed:', selectedPdfUrl);
                  setPdfLoading(false);
                  setPdfError(true);
                  ToastUtility.showToast('Unable to load PDF document.');
                }}
                onPressLink={uri => {
                  console.log(`🔗 Link pressed: ${uri}`);
                }}
                style={{
                  flex: 1,
                  width: '100%',
                  backgroundColor: ColorCode.white,
                }}
                enablePaging={false}
              />
            ) : null}
            <TouchableOpacity
              onPress={() => {
                setShowPdfModal(false);
                setSelectedPdfUrl('');
                setPdfLoading(false);
                setPdfError(false);
              }}
              style={[
                {
                  width: 10 * width,
                  height: 10 * width,
                  borderRadius: 10 * width,
                  backgroundColor: '#FFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'absolute',
                  right: 2 * width,
                  top: Platform.OS === 'ios' ? 5 * width : 3 * width,
                  zIndex: 20,
                },
                ConstData.ELEVATION_STYLE,
              ]}>
              <Ionicons name="close" size={8 * width} color={ColorCode.red} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
    color: '#969696',
    fontSize: 3.4 * width,
    fontFamily: Fonts.Regular,
    marginTop: 1 * width,
  },
  gradeText: {
    color: '#FFFFFF',
    fontSize: 3.4 * width,
    fontFamily: Fonts.Regular,
    // marginTop: 1 * width,
  },
  gradeText1: {
    color: '#FFFFFF',
    fontSize: 3.4 * width,
    fontFamily: Fonts.Medium,
    // marginTop: 1 * width,
  },
  gradeText2: {
    color: '#969696',
    fontSize: 3.4 * width,
    fontFamily: Fonts.Medium,
    // marginTop: 1 * width,
  },
  weekText1: {
    color: '#000000',
    fontSize: 3.4 * width,
    fontFamily: Fonts.Regular,
    marginTop: 1 * width,
  },
  courseRoundShape: {
    width: '100%',
    height: '100%',
    // flex: 1,
    // height: 9 * height,
    marginTop: 2 * width,
    backgroundColor: '#FFFFFF',
    borderRadius: 3 * width,
    alignItems: 'center',
    // justifyContent: 'center',
    // flexDirection: 'row',
  },
});

export default ViewUploadedAssignmentScreen;
