import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Provider } from 'react-native-paper';
import CustomStatus from '../../../compenents/CustomStatus';
import HeaderWithBack from '../../../compenents/HeaderWithBack';
import CustomSAView from '../../../compenents/CustomSAView';
import CustomProgress from '../../../compenents/CustomProgress';
import width from '../../../Units/width';
import height from '../../../Units/height';
import Fonts from '../../../utility/Fonts';
import ColorCode from '../../../utility/ColorCode';
import ApiMethod from '../../../api/ApiMethod';
import ToastUtility from '../../../utility/ToastUtility';
import FastImage from 'react-native-fast-image';
import Pdf from 'react-native-pdf';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ConstData from '../../../utility/ConstData';

const UploadedDocScreen = ({ navigation, route }) => {
  const assignmentId = route.params?.assignmentId ?? null;
  const [showProgress, setShowProgress] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [baseUrl, setBaseUrl] = useState('');
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');

  useEffect(() => {
    if (assignmentId) {
      fetchDocuments(assignmentId);
    } else {
      ToastUtility.showToast('Assignment id not found.');
    }
  }, [assignmentId]);

  useEffect(() => {
    if (showPdfModal && selectedPdfUrl) {
      console.log('🔵 PDF Modal opened with URL:', selectedPdfUrl);
      console.log('🔵 PDF Loading state:', pdfLoading);
      console.log('🔵 PDF Error state:', pdfError);
    }
  }, [showPdfModal, selectedPdfUrl, pdfLoading, pdfError]);

  const fetchDocuments = id => {
    setShowProgress(true);
    // API expects parameter name 'id' but we pass assignment_id value
    ApiMethod.uploadedDocs(
      `id=${id}`,
      pass => {
        setShowProgress(false);
        if (pass.status === 200 && Array.isArray(pass.data) && pass.data.length) {
          setDocuments(pass.data);
          setBaseUrl(pass.base_url || '');
        } else {
          setDocuments([]);
          ToastUtility.showToast('No documents found.');
        }
      },
      fail => {
        setShowProgress(false);
        setDocuments([]);
        ToastUtility.showToast('Failed to load documents.');
      },
    );
  };

  // Helper function to detect file type
  const getFileType = (documentPath) => {
    if (!documentPath || typeof documentPath !== 'string') return 'unknown';

    const pathLower = documentPath.toLowerCase().trim();

    // Extract file extension
    const getFileExtension = (path) => {
      const match = path.match(/\.([a-z0-9]+)$/i);
      return match ? match[1].toLowerCase() : '';
    };

    const fileExtension = getFileExtension(pathLower);

    // Define extensions
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'heic', 'svg'];
    const pdfExtensions = ['pdf'];

    if (imageExtensions.includes(fileExtension)) {
      return 'image';
    }
    if (pdfExtensions.includes(fileExtension)) {
      return 'pdf';
    }

    return 'unknown';
  };

  const handleOpenDocument = documentPath => {
    if (!documentPath) {
      ToastUtility.showToast('Document path not available.');
      return;
    }

    // Construct the full URL
    let finalUrl = '';
    if (baseUrl) {
      // Remove trailing slash from baseUrl and leading slash from documentPath
      const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
      const cleanPath = documentPath.replace(/^\/+/, '');
      finalUrl = `${cleanBaseUrl}/${cleanPath}`;
    } else {
      // If no baseUrl, use documentPath as-is (assuming it's a full URL)
      finalUrl = documentPath;
    }

    // Ensure URL is properly formatted
    finalUrl = finalUrl.replace(/([^:]\/)\/+/g, '$1');

    // If URL doesn't have protocol, add https
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }

    console.log('Base URL:', baseUrl);
    console.log('Document Path:', documentPath);
    console.log('Final URL:', finalUrl);

    // Detect file type
    const fileType = getFileType(documentPath);
    console.log('File type detected:', fileType);

    if (fileType === 'pdf') {
      // Open PDF viewer
      setPdfError(false);
      setPdfLoading(true);
      setSelectedPdfUrl(finalUrl);
      setShowPdfModal(true);
    } else if (fileType === 'image') {
      // Open image viewer
      setSelectedImageUrl(finalUrl);
      setShowImageModal(true);
    } else {
      // Unknown file type - try as image first
      ToastUtility.showToast('Opening document...');
      setSelectedImageUrl(finalUrl);
      setShowImageModal(true);
    }
  };

  const renderDocumentCard = ({ item }) => {
    const isPdf =
      typeof item.document === 'string' &&
      item.document.toLowerCase().endsWith('.pdf');

    // Calculate card width: screen width - container padding (both sides) - margins between cards
    // Screen width = 100 * width, container padding = width * 3 * 2, margins = width * 0.75 * 2
    const availableWidth = 100 * width - (width * 3 * 2) - (width * 0.75 * 2);
    const cardWidth = availableWidth / 2;
    const cardHeight = cardWidth * 1.25; // Aspect ratio for document cards

    return (
      <TouchableOpacity
        onPress={() => handleOpenDocument(item.document)}
        activeOpacity={0.8}
        style={{
          width: cardWidth,
          height: cardHeight,
          borderRadius: width * 2,
          marginVertical: width * 1.5,
          marginHorizontal: width * 0.75,
          borderWidth: 1,
          borderColor: '#D9D9D9',
          overflow: 'hidden',
          backgroundColor: ColorCode.white,
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        }}>
        <FastImage
          style={{ width: '100%', height: '100%' }}
          resizeMode={isPdf ? FastImage.resizeMode.contain : FastImage.resizeMode.cover}
          source={
            isPdf
              ? require('../../../assets/images/pdf.png')
              : { uri: `${baseUrl}/${item.document}` }
          }
        />
      </TouchableOpacity>
    );
  };

  return (
    <Provider>
      <View style={{ flex: 1, backgroundColor: ColorCode.white }}>
        <CustomStatus trans={true} isDark={false} color="#FFFFFF00" />
        <CustomSAView style={{ flex: 1 }} parentStyple={{ flex: 1 }}>
          <HeaderWithBack
            title="Uploaded Documents"
            backgroundColor={ColorCode.white}
            textColor={ColorCode.black}
            onBackPress={() => navigation.goBack()}
          />

          <View style={{ flex: 1, paddingHorizontal: width * 3 }}>
            {documents.length > 0 ? (
              <FlatList
                data={documents}
                numColumns={2}
                keyExtractor={(item, index) =>
                  `${item.id ?? item.document ?? index}`
                }
                renderItem={renderDocumentCard}
                contentContainerStyle={{
                  paddingVertical: width * 2,
                  paddingBottom: height * 10,
                }}
                columnWrapperStyle={{
                  justifyContent: 'space-between',
                }}
              />
            ) : (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text
                  style={{
                    fontFamily: Fonts.SemiBold,
                    fontSize: width * 4,
                    color: ColorCode.black,
                    marginBottom: width,
                  }}>
                  No documents found
                </Text>
                <TouchableOpacity
                  onPress={() => assignmentId && fetchDocuments(assignmentId)}
                  style={{
                    paddingVertical: width * 2,
                    paddingHorizontal: width * 4,
                    borderRadius: width * 2,
                    backgroundColor: ColorCode.primary,
                  }}>
                  <Text
                    style={{
                      fontFamily: Fonts.Medium,
                      fontSize: width * 3.2,
                      color: ColorCode.white,
                    }}>
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </CustomSAView>
        <CustomProgress show={showProgress} />
      </View>

      {/* Image Viewer Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowImageModal(false);
          setSelectedImageUrl('');
        }}>
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => {
            setShowImageModal(false);
            setSelectedImageUrl('');
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
            }}
            onStartShouldSetResponder={() => true}>
            <TouchableOpacity
              onPress={() => {
                setShowImageModal(false);
                setSelectedImageUrl('');
              }}
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
                zIndex: 10,
              }}>
              <Ionicons name="close" size={width * 5} color="#000000" />
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
                }}
                resizeMode="contain"
                source={{ uri: selectedImageUrl }}
              />
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* PDF Viewer Modal */}
      <Modal
        visible={showPdfModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowPdfModal(false);
          setSelectedPdfUrl('');
          setPdfLoading(false);
          setPdfError(false);
        }}>
        {selectedPdfUrl && (
          <Pressable
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
            }}
            onPress={() => {
              setShowPdfModal(false);
              setSelectedPdfUrl('');
              setPdfLoading(false);
              setPdfError(false);
            }}>
            <View
              style={{
                flex: 1,
                backgroundColor: ColorCode.white,
                width: '100%',
              }}
              onStartShouldSetResponder={() => true}>
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
              ) : (
                <View
                  style={{
                    flex: 1,
                    width: '100%',
                    backgroundColor: ColorCode.white,
                    minHeight: height * 50,
                  }}>
                  {selectedPdfUrl ? (
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
                        // Immediately hide loading when PDF loads
                        setPdfLoading(false);
                        setPdfError(false);
                      }}
                      onPageChanged={(page, numberOfPages) => {
                        console.log(`📄 Current page: ${page} of ${numberOfPages}`);
                        // Hide loading when first page is displayed (PDF is ready)
                        if (page >= 1) {
                          setPdfLoading(false);
                        }
                      }}
                      onLoadProgress={(percent) => {
                        console.log(`⏳ PDF Loading: ${percent}%`);
                        // Hide loading when progress reaches 100%
                        if (percent >= 100) {
                          // Use setTimeout to ensure state update happens
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
                  ) : (
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          fontSize: width * 3.5,
                          fontFamily: Fonts.Regular,
                          color: ColorCode.black,
                        }}>
                        No PDF URL provided
                      </Text>
                    </View>
                  )}
                </View>
              )}
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
                    top: 2 * width,
                    zIndex: 20,
                  },
                  ConstData.ELEVATION_STYLE,
                ]}>
                <Ionicons name="close" size={8 * width} color={ColorCode.red} />
              </TouchableOpacity>
            </View>
          </Pressable>
        )}
      </Modal>
    </Provider>
  );
};

export default UploadedDocScreen;

