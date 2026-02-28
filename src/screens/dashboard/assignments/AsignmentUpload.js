import { SafeAreaView, StyleSheet, Text, View, Image, FlatList, TouchableOpacity, Platform, Modal, ScrollView, RefreshControl } from 'react-native';
import React, { Fragment, useEffect, useState } from 'react';
import CustomStatus from '../../../compenents/CustomStatus';
import LinearGradient from 'react-native-linear-gradient';
import width from '../../../Units/width';
import height from '../../../Units/height';
import ApiMethod from '../../../api/ApiMethod';
import CustomProgress from '../../../compenents/CustomProgress';
import moment from 'moment';
import Fonts from '../../../utility/Fonts';
import FastImage from 'react-native-fast-image';
import ToastUtility from '../../../utility/ToastUtility';
import { CommonActions } from '@react-navigation/native';
import StorageUtility from '../../../utility/StorageUtility';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ColorCode from '../../../utility/ColorCode';
import CustomSAView from '../../../compenents/CustomSAView';
import Pdf from 'react-native-pdf';

const AsignmentUpload = ({ navigation, route }) => {
  const assignmentId = route.params?.assignmentId;
  const fallbackAssignedDate = route.params?.assignedDate;
  const fallbackSubmittedDate = route.params?.submittedDate;
  const [showProgress, setShowProgress] = useState(false);
  const [assignmentData, setAssignmentData] = useState(null);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [baseUrl, setBaseUrl] = useState('');
  const [viewDocModal, setViewDocModal] = useState(false);
  const [singleImg, setSingleImg] = useState('');
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (assignmentId) {
      fetchAssignmentDocument();
    } else {
      ToastUtility.showToast('Assignment ID not found');
    }
  }, [assignmentId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAssignmentDocument(true);
  };

  // Shared helper function to detect if a document is a PDF
  const isDocumentPdf = (item) => {
    const documentPath = item.document || item.document_file || item.file || item.path || '';
    const pathLower = typeof documentPath === 'string' ? documentPath.toLowerCase().trim() : '';

    const getFileExtension = (path) => {
      if (!path || typeof path !== 'string') return '';
      const match = path.match(/\.([a-z0-9]+)$/i);
      return match ? match[1].toLowerCase() : '';
    };

    const fileExtension = getFileExtension(pathLower);
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'heic', 'svg'];
    const pdfExtensions = ['pdf'];

    if (imageExtensions.includes(fileExtension)) return false;
    if (pdfExtensions.includes(fileExtension)) return true;

    const documentType = item.type || item.file_type || null;
    if (documentType !== null && documentType !== undefined) {
      return documentType === 1 || documentType === '1';
    }
    return false;
  };

  const fetchAssignmentDocument = (isRefresh = false) => {
    if (!isRefresh) setShowProgress(true);
    ApiMethod.uploadedDocs(
      `id=${assignmentId}`,
      pass => {
        setShowProgress(false);
        setRefreshing(false);
        if (pass.status == 200) {
          setBaseUrl(pass.base_url || '');
          let assignedOn = pass.assigned_date || pass.assigned_at;
          let submittedOn = pass.submitted_date || pass.submitted_at;

          if (pass.data && Array.isArray(pass.data) && pass.data.length > 0) {
            setUploadedDocs(pass.data);
            const firstDoc = pass.data[0];
            if (!assignedOn) assignedOn = firstDoc.assigned_date || firstDoc.assigned_at || firstDoc.created_at;
            if (!submittedOn) submittedOn = firstDoc.submitted_date || firstDoc.submitted_at || firstDoc.created_at;
          } else {
            setUploadedDocs([]);
          }

          if (!assignedOn && fallbackAssignedDate) assignedOn = fallbackAssignedDate;
          if (!submittedOn && fallbackSubmittedDate) submittedOn = fallbackSubmittedDate;

          setAssignmentData({
            assigned_on: assignedOn,
            submitted_on: submittedOn,
          });
        } else {
          setUploadedDocs([]);
          if (fallbackAssignedDate || fallbackSubmittedDate) {
            setAssignmentData({
              assigned_on: fallbackAssignedDate,
              submitted_on: fallbackSubmittedDate,
            });
          }
          ToastUtility.showToast(pass.message || 'Failed to load assignment documents');
        }
      },
      async fail => {
        setShowProgress(false);
        setRefreshing(false);
        setUploadedDocs([]);
        if (fallbackAssignedDate || fallbackSubmittedDate) {
          setAssignmentData({
            assigned_on: fallbackAssignedDate,
            submitted_on: fallbackSubmittedDate,
          });
        }

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
          ToastUtility.showToast('Failed to load assignment documents');
        }
      },
    );
  };

  const handleDocumentPress = (item) => {
    const cleanBaseUrl = (baseUrl || '').replace(/\/+$/, '');
    const cleanPath = (item.document || '').replace(/^\/+/, '');
    let fullUrl = `${cleanBaseUrl}/${cleanPath}`;
    fullUrl = fullUrl.replace(/([^:]\/)\/+/g, '$1');

    if (fullUrl && !fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = `https://${fullUrl}`;
    }

    const isPdf = isDocumentPdf(item);
    if (isPdf) {
      setPdfError(false);
      setPdfLoading(true);
      setSelectedPdfUrl(fullUrl);
      setShowPdfModal(true);
    } else {
      setSingleImg(fullUrl);
      setViewDocModal(true);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = moment(dateString);
    return date.isValid() ? date.format('DD/MM/YYYY') : 'N/A';
  };

  return (
    <Fragment>
      <View style={styles.mainContainer}>
        <CustomStatus trans={true} isDark={true} color="#FFFFFF00" />
        <CustomSAView
          parentStyple={{ flex: 1, backgroundColor: ColorCode.white }}
          style={styles.saView}>

          {/* Standard Mobile Header matching Tablet Pattern */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backBtn}>
              <Ionicons
                name="chevron-back"
                size={7 * width}
                color={ColorCode.black}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Assignment Details</Text>
            <View style={{ width: 10 * width }} />
          </View>
          <View style={{ width: '100%', height: 0.1 * height, backgroundColor: '#E5E5E5' }} />

          <LinearGradient
            colors={['#EBF7F8', '#EAF4F6', '#CCF0F7', '#CECBEA']}
            style={{ flex: 1 }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <ScrollView
              contentContainerStyle={{ paddingBottom: height * 12 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {assignmentData && (
                <View style={styles.detailsSection}>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Assigned On :</Text>
                    <Text style={styles.value}>{formatDate(assignmentData.assigned_on)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.label}>Submitted On :</Text>
                    <Text style={styles.value}>{formatDate(assignmentData.submitted_on)}</Text>
                  </View>
                </View>
              )}

              <View style={styles.uploadSection}>
                <Text style={styles.uploadTitle}>Uploaded Assignment</Text>
                {uploadedDocs.length > 0 ? (
                  <View style={styles.gridContainer}>
                    {uploadedDocs.map((item, index) => {
                      const isPdf = isDocumentPdf(item);
                      const cleanBaseUrl = (baseUrl || '').replace(/\/+$/, '');
                      const cleanPath = (item.document || item.document_file || item.file || item.path || '').replace(/^\/+/, '');
                      let imageUrl = `${cleanBaseUrl}/${cleanPath}`;
                      imageUrl = imageUrl.replace(/([^:]\/)\/+/g, '$1');
                      if (imageUrl && !imageUrl.startsWith('http')) imageUrl = `https://${imageUrl}`;

                      return (
                        <TouchableOpacity
                          key={`doc-${index}`}
                          style={styles.imageContainer}
                          onPress={() => handleDocumentPress(item)}
                          activeOpacity={0.8}>
                          <FastImage
                            style={styles.imageItem}
                            resizeMode={isPdf ? FastImage.resizeMode.contain : FastImage.resizeMode.cover}
                            source={isPdf ? require('../../../assets/images/pdfIcon.png') : { uri: imageUrl }}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No uploaded documents found</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </LinearGradient>
        </CustomSAView>
        <CustomProgress show={showProgress} />

        {/* Image Viewer Modal */}
        <Modal animationType="fade" transparent={true} visible={viewDocModal}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <TouchableOpacity onPress={() => setViewDocModal(false)} style={styles.closeButton}>
                <Entypo name="cross" size={width * 5} color="#000000" />
              </TouchableOpacity>
              <View style={styles.imageViewContainer}>
                <FastImage style={styles.fullImage} resizeMode="contain" source={{ uri: singleImg }} />
              </View>
            </View>
          </View>
        </Modal>

        {/* PDF Viewer Modal */}
        <Modal visible={showPdfModal} transparent={false} animationType="slide" onRequestClose={() => setShowPdfModal(false)}>
          <SafeAreaView style={styles.pdfModalContainer}>
            <View style={styles.pdfViewContainer}>
              {pdfLoading && !pdfError && <View style={styles.pdfLoadingContainer}><CustomProgress show={true} /></View>}
              {pdfError ? (
                <View style={styles.pdfErrorContainer}>
                  <Text style={styles.pdfErrorText}>Unable to load PDF</Text>
                  <TouchableOpacity onPress={() => { setPdfError(false); setPdfLoading(true); }} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : selectedPdfUrl ? (
                <Pdf
                  trustAllCerts={false}
                  source={{ uri: selectedPdfUrl, cache: true }}
                  onLoadComplete={() => setPdfLoading(false)}
                  onError={() => { setPdfLoading(false); setPdfError(true); }}
                  style={styles.pdfViewer}
                />
              ) : null}
              <TouchableOpacity onPress={() => setShowPdfModal(false)} style={styles.pdfCloseButton}>
                <Ionicons name="close" size={8 * width} color={ColorCode.red} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      </View>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: ColorCode.white,
  },
  saView: {
    flex: 1,
    backgroundColor: ColorCode.transarent,
  },
  header: {
    width: '100%',
    height: 7 * height,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 3 * width,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 10 * width,
    height: 10 * width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 4.5 * width,
    fontFamily: Fonts.SemiBold,
    color: '#000000',
  },
  detailsSection: {
    paddingHorizontal: width * 6,
    marginTop: width * 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: width * 5,
    paddingHorizontal: width * 4,
    marginVertical: width * 2,
    backgroundColor: '#fff',
    borderRadius: width * 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  label: {
    fontSize: width * 4,
    fontFamily: Fonts.SemiBold,
    color: '#000',
  },
  value: {
    fontSize: width * 3.7,
    fontFamily: Fonts.Medium,
    color: '#6b7280',
  },
  uploadSection: {
    marginTop: width * 6,
    paddingHorizontal: width * 6,
  },
  uploadTitle: {
    fontSize: width * 4.5,
    fontFamily: Fonts.SemiBold,
    color: '#000',
    marginBottom: width * 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  imageContainer: {
    width: '48%',
    aspectRatio: 1.3,
    borderRadius: width * 2,
    marginBottom: width * 4,
    borderColor: '#D9D9D9',
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: ColorCode.white,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageItem: {
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    padding: width * 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: width * 2,
  },
  emptyText: {
    fontSize: width * 4,
    color: '#6b7280',
    fontFamily: Fonts.Regular,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  modalContent: {
    width: width * 85,
    height: height * 60,
    backgroundColor: '#ffffff',
    borderRadius: width * 2,
    padding: width * 2,
    alignItems: 'center',
  },
  closeButton: {
    width: width * 8,
    height: width * 8,
    borderRadius: width * 4,
    backgroundColor: '#ffffff',
    position: 'absolute',
    top: -width * 4,
    right: -width * 4,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  imageViewContainer: {
    width: '100%',
    height: '100%',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  pdfModalContainer: {
    flex: 1,
    backgroundColor: ColorCode.white,
  },
  pdfViewContainer: {
    flex: 1,
    marginTop: width * 2,
  },
  pdfLoadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: ColorCode.white,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  pdfErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: width * 6,
  },
  pdfErrorText: {
    fontSize: width * 4,
    fontFamily: Fonts.SemiBold,
    color: ColorCode.red,
    marginBottom: width * 4,
  },
  retryButton: {
    paddingVertical: width * 3,
    paddingHorizontal: width * 8,
    backgroundColor: ColorCode.primary,
    borderRadius: width * 1,
  },
  retryButtonText: {
    fontSize: width * 3.5,
    fontFamily: Fonts.Medium,
    color: ColorCode.white,
  },
  pdfViewer: {
    flex: 1,
  },
  pdfCloseButton: {
    width: 10 * width,
    height: 10 * width,
    borderRadius: 5 * width,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 4 * width,
    top: 4 * width,
    zIndex: 20,
    elevation: 8,
  },
});

export default AsignmentUpload;
