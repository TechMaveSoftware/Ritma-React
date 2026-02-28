import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Share,
} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import CustomProgress from '../../compenents/CustomProgress';
import CustomStatus from '../../compenents/CustomStatus';
import Feather from 'react-native-vector-icons/Feather';
import height from '../../Units/height';
import width from '../../Units/width';
import Fonts from '../../utility/Fonts';
import ApiMethod from '../../api/ApiMethod';
import ConstData from '../../utility/ConstData';
import ToastUtility from '../../utility/ToastUtility';
import ColorCode from '../../utility/ColorCode';
import CustomHeader from '../../compenents/CustomHeader';

const CourseAssignmentsScreen = ({ navigation, route }) => {
  const courseId = route.params?.course_id;
  const courseName = route.params?.course_name || 'Assignments';
  const [assignments, setAssignments] = useState([]);
  const [showProgress, setShowProgress] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [docBasePath, setDocBasePath] = useState('https://techmavedev.com/ritma-edtech/storage/app/public/');

  useFocusEffect(
    React.useCallback(() => {
      if (courseId) {
        getAssignments();
      }
    }, [courseId]),
  );

  const getAssignments = () => {
    if (!courseId) {
      ToastUtility.showToast('Course ID is required');
      return;
    }

    setShowProgress(true);
    console.log('=== getAssignments API called (courseAssignments) ===');

    ApiMethod.courseAssignments(
      `course_id=${courseId}`,
      pass => {
        setShowProgress(false);
        if (pass.status == 200) {
          setAssignments(pass.data || []);
          if (pass.base_url) {
            setDocBasePath(pass.base_url);
          }
        } else {
          setAssignments([]);
          ToastUtility.showToast(pass.message || 'Failed to load assignments');
        }
      },
      fail => {
        setShowProgress(false);
        setAssignments([]);
        ToastUtility.showToast('Failed to load assignments. Please try again.');
      },
    );
  };

  const downloadDoc = doc => {
    setShowOverlay(true);
    const { config, fs, android } = ReactNativeBlobUtil;
    let t1 = doc.split('/');
    const fileName = t1[t1.length - 1];
    const cleanFileName = fileName.split('?')[0];

    // Determine mime type based on extension
    let mimeType = 'application/pdf';
    if (cleanFileName.toLowerCase().endsWith('.jpg') || cleanFileName.toLowerCase().endsWith('.jpeg')) {
      mimeType = 'image/jpeg';
    } else if (cleanFileName.toLowerCase().endsWith('.png')) {
      mimeType = 'image/png';
    }

    // Use the correct directory names for ReactNativeBlobUtil
    const { DownloadDir, DocumentDir } = fs.dirs;
    const path = Platform.OS === 'ios' ? DocumentDir : DownloadDir;
    const filePath = `${path}/${cleanFileName}`;

    config({
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        description: 'Downloading assignment document',
        path: filePath,
        mime: mimeType,
        mediaScannable: true,
      },
      fileCache: true,
      path: filePath,
    })
      .fetch('GET', doc)
      .then(async res => {
        setShowOverlay(false);
        console.log('File downloaded to: ', res.path());
        ToastUtility.showToast('Saved');

        if (Platform.OS === 'ios') {
          const fileUri = res.path().startsWith('file://') ? res.path() : `file://${res.path()}`;
          try {
            await Share.share({
              url: fileUri,
              title: cleanFileName,
            });
          } catch (shareError) {
            console.log('iOS share error:', shareError);
            ReactNativeBlobUtil.ios.previewDocument(res.path());
          }
        }
      })
      .catch(err => {
        setShowOverlay(false);
        console.log('Download error:', err);
        ToastUtility.showToast('Download failed');
      });
  };

  // Function to handle upload button press
  const handleUploadPress = (item) => {
    // Check if this is a resubmit case
    if (item.resubmit == '2' || item.resubmit === 2) {
      navigation.navigate('ReUploadAssignment', {
        data: {
          id: item.id,
          syllabus_id: item.syllabus_id || item.id,
          assigned_date: item.assigned_date || item.created_at,
          title: item.title,
        },
      });
    } else {
      navigation.navigate('UploadAssignment', {
        data: {
          ...item,
          chapter_name: item.title,
          class_assignment_id: item.id,
          // If the API provides syllabus_id, use it as the main ID for the upload screen's syllabus_id field
          id: item.syllabus_id || item.id,
        },
      });
    }
  };

  // Function to handle viewing uploaded assignment
  const getUploadedAssignment = (id) => {
    setShowProgress(true);
    console.log('=== getUploadedAssignment API called ===');
    console.log('Document ID:', id);

    const requestParam = `id=${id}`;
    console.log('Request parameter:', requestParam);

    ApiMethod.uploadedDocs(
      requestParam,
      pass => {
        setShowProgress(false);
        console.log('=== Uploaded Docs API Success ===');
        console.log('Full API Response:', JSON.stringify(pass, null, 2));
        console.log('API Status:', pass.status);
        console.log('Base URL:', pass.base_url);
        console.log('Data length:', pass.data ? pass.data.length : 0);

        if (pass.status == 200 && pass.data.length > 0) {
          console.log('=== Uploaded documents found ===');
          console.log('Documents data:', JSON.stringify(pass.data, null, 2));
          console.log('Navigating to viewUploadedDocs with:');
          console.log('- Base URL:', pass.base_url);
          console.log('- Documents count:', pass.data.length);

          navigation.navigate('viewUploadedDocs', {
            baseUrl: pass.base_url,
            uploadedDocs: pass.data,
          });
        } else {
          console.log('No documents found or API error');
          ToastUtility.showToast('No Documents Found.');
          setShowProgress(false);
        }
      },
      fail => {
        setShowProgress(false);
        console.log('=== Uploaded Docs API Failed ===');
        console.log('Error:', JSON.stringify(fail, null, 2));
      },
    );
  };

  // Opening URLs
  const handleOpenUrl = async (url) => {
    const encodedUrl = encodeURI(url);
    try {
      await Linking.openURL(encodedUrl);
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  // Helper function to convert to integer flag (same as SyllabusDetailScreen)
  const toIntFlag = (value) => {
    if (value === 1 || value === '1') return 1;
    if (value === 0 || value === '0') return 0;
    return 0;
  };

  // Component for assignment card
  const AssignmentCard = ({ item, index }) => {
    // Condition for showing uploaded state
    const showUploadedState = !!item.submitted_assignment;

    // Condition for showing upload button
    const canUploadAssignment = !showUploadedState;

    const displayTitle = item.title || `Assignment ${index + 1}`;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {displayTitle}
          </Text>
        </View>

        {/* Assignment Document Section */}
        <View style={styles.documentRow}>
          <Text style={styles.documentLabel}>Assignment document</Text>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => {
              if (item.file) {
                downloadDoc(docBasePath + item.file);
              } else {
                ToastUtility.showToast('No document available');
              }
            }}>
            <Feather name="download" size={18} color={ColorCode.primary} />
          </TouchableOpacity>
        </View>

        {/* Show upload/uploaded UI for assignments based on conditions */}
        {showUploadedState ? (
          // Show uploaded state when submitted_assignment is present
          <View style={styles.uploadedContainer}>
            <View style={styles.pdfIconContainer}>
              <View style={styles.pdfIcon}>
                <Image
                  source={require('../../assets/images/folder.png')}
                  style={{
                    resizeMode: 'contain',
                    width: width * 8,
                    height: width * 8,
                  }}
                />
              </View>
            </View>
            <View style={styles.uploadedContentContainer}>
              <View style={styles.uploadedHeader}>
                <Text style={styles.assignmentTitle}>Assignment</Text>
                <TouchableOpacity
                  style={styles.uploadedButton}
                  onPress={() => {
                    const assignmentIdToUse = item.submitted_assignment.id;
                    if (!assignmentIdToUse) {
                      ToastUtility.showToast('Submitted Assignment ID not found');
                      return;
                    }
                    getUploadedAssignment(assignmentIdToUse);
                  }}>
                  <Text style={styles.uploadedButtonText}>
                    Uploaded
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.progressBar} />
            </View>
          </View>
        ) : (
          // Show upload button
          <TouchableOpacity
            style={styles.uploadContainer}
            onPress={() => handleUploadPress(item)}>
            <Text style={styles.uploadAssignmentText}>Assignment</Text>
            <View style={styles.uploadButton}>
              <Text style={styles.uploadText}>
                Upload
              </Text>
              <Feather name="arrow-right" size={16} color={ColorCode.primary} />
            </View>
          </TouchableOpacity>
        )}

        {item.google_doc_url && (
          <TouchableOpacity
            style={styles.googleDocButton}
            onPress={() => handleOpenUrl(item.google_doc_url)}>
            <Feather name="external-link" size={16} color={ColorCode.primary} />
            <Text style={styles.googleDocText}>Open Google Doc</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={ColorCode.primary} />
      <Text style={styles.loadingText}>Loading assignments...</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No assignments found</Text>
    </View>
  );

  return (
    <Provider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <CustomStatus trans={true} isDark={true} color="#FFFFFF00" />
        <CustomHeader
          text={courseName}
          customStyle={{ marginTop: -5, paddingVertical: 5 }}
        />
        <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
          <View style={{ flex: 1 }}>
            <View
              style={{
                flex: 1,
                width: '100%',
                backgroundColor: '#FAFAFA',
                paddingTop: width * 2.5,
              }}>
              {showProgress ? (
                renderLoading()
              ) : (
                <ScrollView
                  style={styles.scrollContainer}
                  contentContainerStyle={{ paddingBottom: width * 10, flexGrow: 1 }}>
                  {assignments.length > 0 ? (
                    assignments.map((item, index) => {
                      console.log(`Rendering assignment ${index}:`, item.id, item.chapter_name);
                      return (
                        <AssignmentCard
                          key={`assignment-${item.id}-${index}`}
                          item={item}
                          index={index}
                        />
                      );
                    })
                  ) : (
                    renderEmptyState()
                  )}
                </ScrollView>
              )}
            </View>
          </View>
        </View>
      </SafeAreaView>
      <CustomProgress show={showOverlay} />
    </Provider >
  );
};

export default CourseAssignmentsScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    width: '100%',
    paddingHorizontal: width * 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: width * 2,
    padding: width * 3,
    marginBottom: height * 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: height * 1,
    width: '100%',
  },
  cardTitle: {
    fontSize: width * 4,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
    marginRight: width * 2,
    flexShrink: 1,
    fontFamily: Fonts.SemiBold,
  },
  mandatoryBadge: {
    backgroundColor: '#e8f2fa',
    paddingHorizontal: width * 2,
    paddingVertical: width * 0.5,
    borderRadius: width * 4,
    alignSelf: 'flex-start',
    marginLeft: width * 1,
    flexShrink: 0,
  },
  mandatoryText: {
    color: ColorCode.primary,
    fontSize: width * 3,
    fontWeight: '500',
    fontFamily: Fonts.Medium,
  },
  cardDescription: {
    color: '#706767',
    fontSize: width * 3.5,
    marginBottom: height * 2,
    fontFamily: Fonts.Regular,
  },
  // Uploaded state styles
  uploadedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: width * 2,
  },
  pdfIconContainer: {
    marginRight: width * 2,
  },
  pdfIcon: {
    width: width * 10,
    height: width * 10,
    borderRadius: width * 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadedContentContainer: {
    flex: 1,
  },
  uploadedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.5,
  },
  assignmentTitle: {
    color: '#000000',
    fontSize: width * 3.5,
    fontWeight: '500',
    fontFamily: Fonts.Medium,
  },
  uploadedButton: {
    backgroundColor: '#DCF3EB',
    borderWidth: 1,
    borderColor: '#34A770',
    borderRadius: width * 2,
    paddingHorizontal: width * 4,
    paddingVertical: width * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadedButtonText: {
    color: '#16763E',
    fontSize: width * 3.5,
    fontWeight: '500',
    fontFamily: Fonts.Medium,
  },
  progressBar: {
    height: height * 0.6,
    backgroundColor: ColorCode.primary,
    width: '100%',
    borderRadius: width * 1,
    marginTop: width * 2,
  },
  // Upload state styles
  uploadContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    paddingHorizontal: width * 3,
    paddingVertical: width * 3,
    borderRadius: width * 1.5,
    marginTop: width * 2,
  },
  uploadAssignmentText: {
    color: '#000000',
    fontSize: width * 3.5,
    fontWeight: '500',
    fontFamily: Fonts.Medium,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadText: {
    color: ColorCode.primary,
    fontSize: width * 3.5,
    fontWeight: '500',
    marginRight: width * 1,
    fontFamily: Fonts.Medium,
  },
  googleDocButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: width * 2,
    paddingVertical: width * 2,
    paddingHorizontal: width * 2,
    backgroundColor: '#F0F8FF',
    borderRadius: width * 1.5,
  },
  googleDocText: {
    color: ColorCode.primary,
    fontSize: width * 3.2,
    fontWeight: '500',
    marginLeft: width * 1,
    fontFamily: Fonts.Medium,
  },
  quizContainer: {
    marginTop: width * 2,
    paddingVertical: width * 2,
    paddingHorizontal: width * 2,
    backgroundColor: '#F0F8FF',
    borderRadius: width * 1.5,
  },
  quizTypeText: {
    color: ColorCode.primary,
    fontSize: width * 3,
    fontFamily: Fonts.Medium,
    marginTop: width * 0.5,
  },
  quizInfoText: {
    color: '#000000',
    fontSize: width * 3.5,
    fontWeight: '500',
    fontFamily: Fonts.Medium,
  },
  quizIdText: {
    color: '#666',
    fontSize: width * 3,
    fontFamily: Fonts.Regular,
    marginTop: width * 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: height * 10,
  },
  loadingText: {
    fontSize: width * 3.2,
    color: '#666',
    marginTop: width * 2,
    fontFamily: Fonts.Regular,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: height * 10,
  },
  emptyText: {
    fontSize: width * 3.4,
    color: '#666',
    textAlign: 'center',
    fontFamily: Fonts.Regular,
  },
  documentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: width * 3,
    borderRadius: width * 1.5,
    marginBottom: width * 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  documentLabel: {
    fontSize: width * 3.5,
    color: '#333',
    fontFamily: Fonts.Medium,
  },
  downloadButton: {
    padding: width * 1,
  },
});
