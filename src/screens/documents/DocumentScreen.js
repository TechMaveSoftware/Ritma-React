import React, { Fragment, useEffect, useState, useRef } from 'react';
import {
  FlatList,
  Image,
  ImageBackground,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Provider } from 'react-native-paper';
import CustomButton from '../../compenents/CustomButton';
import CustomSAView from '../../compenents/CustomSAView';
import CustomStatus from '../../compenents/CustomStatus';
import HeaderWithBack from '../../compenents/HeaderWithBack';
import ImageView from '../../compenents/ImageView';
import height from '../../Units/height';
import width from '../../Units/width';
import ColorCode from '../../utility/ColorCode';
import Fonts from '../../utility/Fonts';
import StorageUtility from '../../utility/StorageUtility';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ApiMethod from '../../api/ApiMethod';
import Custom_ImagePicker from '../../compenents/Custom_ImagePicker';
import FastImage from 'react-native-fast-image';
import ToastUtility from '../../utility/ToastUtility';
import CustomProgress from '../../compenents/CustomProgress';
import Pdf from 'react-native-pdf';
import ConstData from '../../utility/ConstData';
import RNFS from 'react-native-fs';
import DropDown from 'react-native-paper-dropdown';
import CustomHeader from '../../compenents/CustomHeader';
import Icon from 'react-native-vector-icons/Feather';

const data = [
  {
    name: 'FCSR Document',
    image1: '',
    key: 'fcsr_document',
    show: false,
    optional: true,
    uploaded: false,
    is_verified: false,
    is_rejected: false,
    reupload: false,
    docType: 'image',
  },
  {
    name: 'Highschool diploma /GED',
    image1: '',
    key: 'highschool_diploma',
    show: true,
    optional: false,
    uploaded: false,
    is_verified: false,
    is_rejected: false,
    reupload: false,
    docType: 'image',
  },
  {
    name: 'Id Proof Front',
    image1: '',
    key: 'id_proof',
    show: true,
    optional: false,
    uploaded: false,
    is_verified: false,
    is_rejected: false,
    reupload: false,
    docType: 'image',
  },
  {
    name: 'Id Proof Back',
    image1: '',
    key: 'id_proof_back',
    show: true,
    optional: false,
    uploaded: false,
    is_verified: false,
    is_rejected: false,
    reupload: false,
    docType: 'image',
  },
  {
    name: 'Profile Picture',
    image1: '',
    key: 'profile_pic',
    show: true,
    optional: false,
    uploaded: false,
    is_verified: false,
    is_rejected: false,
    reupload: false,
    docType: 'image',
  },
  {
    name: 'Recommendation letter',
    image1: '',
    key: 'reference_letter',
    show: true,
    optional: false,
    uploaded: false,
    is_verified: false,
    is_rejected: false,
    reupload: false,
    docType: 'image',
  },
  {
    name: 'TMU Check',
    image1: '',
    key: 'tmu_check',
    show: false,
    optional: true,
    uploaded: false,
    is_verified: false,
    is_rejected: false,
    reupload: false,
    docType: 'image',
  },
  {
    name: 'Universal Background Check',
    image1: '',
    key: 'universal_background',
    show: false,
    optional: true,
    uploaded: false,
    is_verified: false,
    is_rejected: false,
    reupload: false,
    docType: 'image',
  },
  {
    name: 'Enrollement Agreement',
    image1: '',
    key: 'enrollement_agreement',
    show: false,
    optional: true,
    uploaded: false,
    is_verified: false,
    is_rejected: false,
    reupload: false,
    docType: 'image',
  },
  {
    name: 'Health Insurance',
    image1: '',
    key: 'health_insurance',
    show: true,
    optional: true,
    uploaded: false,
    is_verified: false,
    is_rejected: false,
    reupload: false,
    docType: 'image',
  },
  {
    name: 'SSN Number Picture',
    image1: '',
    key: 'ssn_picture',
    show: true,
    optional: true,
    uploaded: false,
    is_verified: false,
    is_rejected: false,
    reupload: false,
    docType: 'image',
  },
  {
    name: 'SSN Number',
    image1: '',
    key: 'ssn_number',
    show: true,
    optional: false,
    uploaded: false,
    is_verified: false,
    is_rejected: false,
    reupload: false,
    docType: 'text',
  },
];

const DocumentScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  // Initialize with empty array - will be populated from API
  const [documents, setDocuments] = useState([]);
  const [docType, setDocType] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  // Track recently uploaded local files to use until server updates
  // Using ref to ensure immediate access without waiting for state update
  const recentlyUploadedFilesRef = useRef({});
  const [recentlyUploadedFiles, setRecentlyUploadedFiles] = useState({});

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [selImg, setselImg] = useState('');
  const [showSelImgPopup, setShowSelImgPopup] = useState(false);
  const [selPdf, setSelPdf] = useState('');
  const [showSelPdfPopup, setShowSelPdfPopup] = useState(false);

  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    // setShowSuccess(true);
    getCourseDocuments();
  }, []);

  useEffect(() => {
    let keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', e => {
      setKeyboardHeight(Platform.OS == 'ios' ? e.endCoordinates.height : 1);
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

  const isAllUploaded = documents.every(({ uploaded }) => uploaded == true);
  // const isAllVerified = documents.every(({is_verified}) => is_verified == true);
  const isAnyRejected = documents.some(({ is_rejected }) => is_rejected == true);
  const isAnyReupload = documents.some(({ reupload }) => reupload == true);
  const hasSelectedDocuments = documents.some(({ selectedForUpload }) => selectedForUpload == true);
  // console.log([false, false, true].some(v => v == true));

  const getCourseDocuments = () => {
    setShowProgress(true);
    ApiMethod.courseDocuments(
      pass => {
        setShowProgress(false);
        console.log('Course Documents API Response:', JSON.stringify(pass, null, 2));

        // Handle both array response and object with data property
        let documentsArray = [];
        let baseUrl = '';

        if (Array.isArray(pass)) {
          documentsArray = pass;
        } else if (pass && typeof pass === 'object') {
          // The API returns: { status: 200, message: "...", data: [...], document_root: "..." }
          documentsArray = pass.data || pass.documents || pass.result || [];
          baseUrl = pass.document_root || pass.base_url || pass.baseUrl || '';
        }

        console.log('Documents Array:', documentsArray);
        console.log('Base URL:', baseUrl);
        console.log('Documents Array Length:', documentsArray?.length);
        console.log('Is Array:', Array.isArray(documentsArray));

        var docs = [];

        // If no documents array found, log the entire response structure
        if (!documentsArray || documentsArray.length === 0) {
          console.log('=== FULL API RESPONSE STRUCTURE ===');
          console.log('Type:', typeof pass);
          console.log('Keys:', pass ? Object.keys(pass) : 'null');
          console.log('Full Response:', JSON.stringify(pass, null, 2));
        }

        // Track which recently uploaded files should be cleared (server has updated)
        const filesToClear = [];

        if (documentsArray && documentsArray.length > 0) {
          documentsArray.forEach((docItem, index) => {
            console.log(`Processing document item ${index}:`, JSON.stringify(docItem, null, 2));

            // Handle nested structure: enrollment_document contains the document info
            const enrollmentDoc = docItem.enrollment_document || {};

            // Get document info - try enrollment_document first, then fallback to docItem itself
            let docTitle = enrollmentDoc.document_title || docItem.document_title || '';
            let docName = enrollmentDoc.document_name || docItem.document_name || '';

            // Clean up document_name (remove trailing underscores)
            if (docName) {
              docName = docName.replace(/_+$/, ''); // Remove trailing underscores
            }

            // If no title but we have name, generate title from name
            if (!docTitle && docName) {
              docTitle = docName
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            }

            // If still no document_name, try to generate from title
            if (!docName && docTitle) {
              docName = docTitle.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
            }

            // Final fallback - use index if nothing else works
            if (!docName && !docTitle) {
              docTitle = `Document ${index + 1}`;
              docName = `document_${index + 1}`;
              console.log('Using fallback name for document item:', docItem);
            }

            // Determine document type based on document_types
            const docTypes = enrollmentDoc.document_types || docItem.document_types || '';
            const isTextType = !docTypes.includes('image') && !docTypes.includes('pdf') && !docTypes.includes('application');
            const docType = isTextType ? 'text' : 'image';

            // Get document data - document_data is an object with file property
            let documentData = '';
            const docDataObj = docItem.document_data;

            if (docDataObj && typeof docDataObj === 'object' && docDataObj !== null) {
              // document_data is an object, extract the file path
              const filePath = docDataObj.file || '';

              if (filePath) {
                // Construct full URL using document_root
                if (baseUrl) {
                  // Remove trailing slash from baseUrl if present
                  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
                  // filePath already includes the path, just combine
                  documentData = cleanBaseUrl + '/' + filePath;
                } else {
                  // Fallback if no baseUrl
                  documentData = 'https://techmavedev.com/ritma-edtech/storage/app/public/' + filePath;
                }
                // Add cache-busting parameter for PDFs to force reload
                if (documentData.includes('.pdf') || docTypes.includes('pdf')) {
                  const separator = documentData.includes('?') ? '&' : '?';
                  documentData = documentData + separator + 't=' + Date.now();
                }
              }
            } else if (typeof docDataObj === 'string' && docDataObj !== '') {
              // If document_data is a string (legacy format)
              documentData = docDataObj;
              if (documentData && !documentData.startsWith('http') && !documentData.startsWith('file://')) {
                if (baseUrl) {
                  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
                  const cleanFilePath = documentData.startsWith('/') ? documentData : '/' + documentData;
                  documentData = cleanBaseUrl + cleanFilePath;
                }
              }
              // Add cache-busting parameter for PDFs to force reload
              if (documentData && (documentData.includes('.pdf') || docTypes.includes('pdf'))) {
                const separator = documentData.includes('?') ? '&' : '?';
                documentData = documentData + separator + 't=' + Date.now();
              }
            }

            const hasDocument = documentData && documentData !== null && documentData !== '';

            // Determine if document is optional (is_required: "1" = required, "0" = optional)
            const isRequired = docItem.is_required === '1' || docItem.is_required === 1 || docItem.is_required === true;
            const isOptional = !isRequired;

            // Get status from document_data object or other fields
            const isVerified = (docDataObj && (docDataObj.is_verified === '1' || docDataObj.is_verified === 1)) || docItem.is_verified === '1' || docItem.is_verified === 1;
            const isRejected = (docDataObj && (docDataObj.is_rejected === '1' || docDataObj.is_rejected === 1)) || docItem.is_rejected === '1' || docItem.is_rejected === 1;
            const reupload = (docDataObj && (docDataObj.reupload === '1' || docDataObj.reupload === 1)) || docItem.reupload === '1' || docItem.reupload === 1;

            // Check if we have a recently uploaded local file for this document
            // Use local file if it exists and was uploaded recently (within last 5 minutes)
            // BUT only if the server hasn't updated yet (check updated_at timestamp)
            // Use ref to get the latest value immediately (state might not have updated yet)
            const recentUpload = recentlyUploadedFilesRef.current[docName] || recentlyUploadedFiles[docName];

            // Get server's updated_at timestamp
            const serverUpdatedAt = docDataObj?.updated_at ? new Date(docDataObj.updated_at).getTime() : 0;
            const uploadTime = recentUpload?.uploadTime || 0;

            // Use local file if:
            // 1. We have a recent upload
            // 2. It's within 5 minutes
            // 3. Server's updated_at is older than or equal to our upload time (server hasn't updated yet)
            const useLocalFile = recentUpload &&
              recentUpload.localPath &&
              (Date.now() - uploadTime < 5 * 60 * 1000) && // Within 5 minutes
              (serverUpdatedAt <= uploadTime + 1000); // Server hasn't updated yet (add 1s buffer for timing)

            // Debug log
            if (recentUpload && docName === 'highschool_diploma') {
              console.log('🔍 Local file check:', {
                docName,
                hasRecentUpload: !!recentUpload,
                localPath: recentUpload.localPath,
                uploadTime: new Date(uploadTime).toISOString(),
                serverUpdatedAt: new Date(serverUpdatedAt).toISOString(),
                timeDiff: Date.now() - uploadTime,
                within5Min: (Date.now() - uploadTime < 5 * 60 * 1000),
                serverOlder: (serverUpdatedAt <= uploadTime + 1000),
                useLocalFile: useLocalFile
              });
            }

            // Use local file if available, otherwise use server URL
            const finalDocumentUrl = useLocalFile ? recentUpload.localPath : (hasDocument ? documentData : '');

            // If server has updated, mark for removal from recently uploaded files
            if (recentUpload && serverUpdatedAt > uploadTime) {
              filesToClear.push(docName);
            }

            docs.push({
              name: docTitle, // Use document_title from API
              image1: finalDocumentUrl, // Use local file if available, otherwise server URL
              key: docName, // Use document_name as key
              show: true, // Show all documents from API
              optional: isOptional,
              isRequired: isRequired, // Store isRequired for display
              uploaded: hasDocument || useLocalFile, // Consider uploaded if we have local file or server URL
              is_verified: isVerified,
              is_rejected: isRejected,
              reupload: reupload,
              docType: docType,
              id: docItem.id,
              enrollment_document_id: docItem.enrollment_document_id,
              document_types: docTypes,
              selectedForUpload: false, // Clear selection after refresh
              serverUrl: hasDocument ? documentData : '', // Store server URL separately
              localPath: useLocalFile ? recentUpload.localPath : '', // Store local path separately
            });
          });
        } else {
          console.log('No documents found in API response');
        }

        // Clear recently uploaded files that the server has now updated
        if (filesToClear.length > 0) {
          setRecentlyUploadedFiles(prev => {
            const updated = { ...prev };
            filesToClear.forEach(key => {
              delete updated[key];
              delete recentlyUploadedFilesRef.current[key];
            });
            return updated;
          });
        }

        console.log('============ Parsed Documents:', docs);
        console.log('Total documents parsed:', docs.length);
        console.log('Documents Array Length from API:', documentsArray?.length);

        // Log all document keys to verify all are included
        const documentKeys = docs.map(d => d.key);
        console.log('Document keys parsed:', documentKeys);
        console.log('Document names parsed:', docs.map(d => d.name));

        if (docs.length === 0 && documentsArray && documentsArray.length > 0) {
          console.log('⚠️ WARNING: API returned documents but none were parsed!');
          console.log('First document item structure:', JSON.stringify(documentsArray[0], null, 2));
        }

        if (docs.length !== documentsArray?.length) {
          console.log('⚠️ WARNING: Not all documents were parsed!');
          console.log('Expected:', documentsArray?.length, 'Got:', docs.length);
          documentsArray.forEach((item, idx) => {
            const enrollmentDoc = item.enrollment_document || {};
            console.log(`Document ${idx}:`, {
              title: enrollmentDoc.document_title,
              name: enrollmentDoc.document_name,
              parsed: docs.some(d => d.key === (enrollmentDoc.document_name || '').replace(/_+$/, ''))
            });
          });
        }

        if (docs.length > 0) {
          console.log(
            '=====uploaded=======',
            docs.every(({ uploaded }) => uploaded == true),
          );
          console.log(
            '====is_verified========',
            docs.every(({ is_verified }) => is_verified == true),
          );
          console.log(
            '======is_rejected======',
            docs.every(({ is_rejected }) => is_rejected == true),
          );
          console.log(
            '======reupload======',
            docs.every(({ reupload }) => reupload == false),
          );
        }

        setDocuments(docs);
      },
      fail => {
        setShowProgress(false);
        console.log('Course Documents API Error:', JSON.stringify(fail, null, 2));
        ToastUtility.showToast(fail?.message || 'Failed to load documents');
        // Set empty array to show no documents message
        setDocuments([]);
      },
    );
  };

  const uploadAllDocs = () => {
    var error = false;
    var errorMsg = '';

    // Allow individual document uploads - no need to select all at once
    // User can select and upload documents one at a time

    // Check if there are any documents to upload
    const hasDocumentsToUpload = documents.some(d => {
      if (d.docType === 'image') {
        return d.selectedForUpload || (d.image1 && !d.image1.startsWith('http') && !d.uploaded);
      } else if (d.docType === 'text') {
        return d.image1 && d.image1 !== '' && (d.is_rejected || d.reupload || !d.uploaded);
      }
      return false;
    });

    if (!hasDocumentsToUpload) {
      ToastUtility.showToast('No documents selected for upload');
      return;
    }

    // Validate required documents (only for text type SSN)
    documents.map((d, pos) => {
      if (d.docType === 'text' && pos == documents.length - 1) {
        if (d.image1 == '') {
          if (!error) {
            errorMsg = 'Enter SSN Number';
            error = true;
          }
        } else if (d.image1.length != 9) {
          if (!error) {
            errorMsg = 'Enter Valid SSN Number';
            error = true;
          }
        }
      }
    });

    if (error) {
      ToastUtility.showToast(errorMsg);
      return;
    } else {
      const formData = new FormData();

      // The API requires ALL required documents to be sent together
      // We need to include all required documents in formData, even if already uploaded
      documents.map(d => {
        console.log('Processing document for upload:', d.name, d.key, {
          selectedForUpload: d.selectedForUpload,
          uploaded: d.uploaded,
          hasImage: !!d.image1,
          isLocal: d.image1 && !d.image1.startsWith('http'),
          isRequired: d.isRequired
        });

        if (d.docType == 'image') {
          // Include all image documents that have local files selected
          // Required documents (except profile_picture) must all be selected
          // Profile picture is optional
          const hasLocalFile = d.image1 && !d.image1.startsWith('http') && !d.image1.startsWith('https');
          const shouldInclude = d.selectedForUpload || d.reupload || hasLocalFile;

          console.log('Document upload check:', d.name, {
            key: d.key,
            selectedForUpload: d.selectedForUpload,
            reupload: d.reupload,
            hasLocalFile: hasLocalFile,
            shouldInclude: shouldInclude,
            image1: d.image1,
            image1Type: typeof d.image1,
            image1Length: d.image1 ? d.image1.length : 0
          });

          if (shouldInclude && d.image1 != '' && d.image1) {
            // Check if it's a local file path (not HTTP/HTTPS URL)
            // Local files can be: file:// paths, content:// paths (Android), or direct paths
            const isLocalFile = !d.image1.startsWith('http') && !d.image1.startsWith('https');

            console.log('Processing local file:', d.name, {
              isLocalFile: isLocalFile,
              path: d.image1
            });

            if (isLocalFile) {
              // Determine file extension and MIME type
              // Remove file:// prefix for checking extension
              const pathForCheck = d.image1.replace('file://', '').toLowerCase();
              let ext = '.jpg';
              let mimeType = 'image/jpeg';

              if (pathForCheck.endsWith('.pdf')) {
                ext = '.pdf';
                mimeType = 'application/pdf';
              } else if (pathForCheck.endsWith('.png')) {
                ext = '.png';
                mimeType = 'image/png';
              } else if (pathForCheck.endsWith('.jpg') || pathForCheck.endsWith('.jpeg')) {
                ext = '.jpg';
                mimeType = 'image/jpeg';
              }

              // Extract filename from path or generate one
              // Handle both file:// and regular paths
              const cleanPath = d.image1.replace('file://', '');
              var pathParts = cleanPath.split('/');
              var originalFileName = pathParts[pathParts.length - 1] || '';

              // Generate a clean filename using document key and timestamp
              var cleanFileName = `${d.key}_${Date.now()}${ext}`;

              // Use original filename if it's valid, otherwise use generated one
              var finalFileName = originalFileName && originalFileName.includes('.')
                ? originalFileName.replace(/[^a-zA-Z0-9._-]/g, '_')
                : cleanFileName;

              // Prepare URI - remove file:// for iOS, keep as is for Android
              const fileUri = Platform.OS === 'android'
                ? d.image1
                : d.image1.replace('file://', '');

              formData.append(d.key, {
                uri: fileUri,
                type: mimeType,
                name: finalFileName,
              });

              console.log('✅ Added to formData:', d.key, {
                originalUri: d.image1,
                processedUri: fileUri,
                type: mimeType,
                name: finalFileName,
                ext: ext,
                platform: Platform.OS
              });
            } else {
              console.log('⚠️ Skipped - not a local file:', d.name, d.image1);
            }
          } else {
            console.log('⚠️ Skipped - conditions not met:', d.name, {
              shouldInclude: shouldInclude,
              hasImage1: !!d.image1,
              image1Empty: d.image1 === ''
            });
          }
        } else if (d.docType == 'text') {
          // For text documents, upload if changed or needs re-upload
          if (d.is_rejected || d.reupload || !d.uploaded || d.selectedForUpload) {
            if (d.image1 && d.image1 !== '') {
              formData.append(d.key, d.image1);
            }
          }
        }
      });

      //  console.log(Object.fromEntries(formData.entries()))
      console.log(JSON.parse(JSON.stringify(formData))._parts);
      if (JSON.parse(JSON.stringify(formData))._parts.length == 0) {
        ToastUtility.showToast('Nothing to update');
        return;
      }
      // return;

      setShowProgress(true);

      // Store local file paths before upload for documents being uploaded
      const uploadedLocalFiles = {};
      documents.forEach(doc => {
        if (doc.selectedForUpload && doc.image1 && !doc.image1.startsWith('http')) {
          uploadedLocalFiles[doc.key] = {
            localPath: doc.image1,
            uploadTime: Date.now(),
          };
        }
      });

      ApiMethod.updateDocuments(
        formData,
        pass => {
          setShowProgress(false);
          console.log('Upload response:', JSON.stringify(pass));
          if (pass.status == 200 || pass.data?.status == 200) {
            // Store recently uploaded files to use until server updates
            // Update both ref (for immediate access) and state (for re-renders)
            Object.keys(uploadedLocalFiles).forEach(key => {
              recentlyUploadedFilesRef.current[key] = uploadedLocalFiles[key];
            });
            setRecentlyUploadedFiles(prev => ({
              ...prev,
              ...uploadedLocalFiles,
            }));

            console.log('✅ Stored recently uploaded files:', {
              ref: recentlyUploadedFilesRef.current,
              state: uploadedLocalFiles
            });

            // IMMEDIATELY update the documents state to show the local file
            // This ensures UI updates right away with the new file
            setDocuments(prevDocs => {
              const updatedDocs = prevDocs.map(doc => {
                if (uploadedLocalFiles[doc.key]) {
                  // Keep the local file path and mark as uploaded
                  return {
                    ...doc,
                    image1: uploadedLocalFiles[doc.key].localPath,
                    localPath: uploadedLocalFiles[doc.key].localPath,
                    selectedForUpload: false, // Clear selection flag
                    uploaded: true, // Mark as uploaded
                  };
                }
                return doc;
              });
              return updatedDocs;
            });

            navigation.goBack();
            ToastUtility.showToast(pass.message || pass.data?.message || 'Documents uploaded successfully');
          } else {
            ToastUtility.showToast(pass.message || 'Upload failed');
          }
        },
        fail => {
          setShowProgress(false);
          console.log('Upload error:', JSON.stringify(fail, null, 2));

          // Log validation errors if available
          if (fail?.errors) {
            console.log('Validation errors:', JSON.stringify(fail.errors, null, 2));
            const errorMessages = Object.values(fail.errors).flat().join(', ');
            ToastUtility.showToast(errorMessages || fail?.message || 'Validation failed');
          } else {
            ToastUtility.showToast(fail?.message || 'Failed to upload documents');
          }
        },
      );
    }
  };

  const downloadDoc = doc => {
    var t1 = doc.split('/');
    console.log('t1[t1.length - 1]', t1[t1.length - 1]);

    const filePath =
      (Platform.OS == 'ios'
        ? t1[t1.length - 1].endsWith('.pdf')
          ? RNFS.DocumentDirectoryPath
          : RNFS.LibraryDirectoryPath
        : RNFS.DownloadDirectoryPath) +
      '/' +
      t1[t1.length - 1];
    console.log('filePath', filePath);

    RNFS.downloadFile({
      fromUrl: doc,
      toFile: filePath,
      background: true, // Enable downloading in the background (iOS only)
      discretionary: true, // Allow the OS to control the timing and speed (iOS only)
      progress: res => {
        // Handle download progress updates if needed
        const progress = (res.bytesWritten / res.contentLength) * 100;
        console.log(`Progress: ${progress.toFixed(2)}%`);
      },
    })
      .promise.then(response => {
        setShowProgress(false);
        ToastUtility.showToast(t1[t1.length - 1] + ' File Downloaded');
        console.log('File downloaded!', response);
        setShowSelImgPopup(false);
        setselImg('');
      })
      .catch(err => {
        setShowProgress(false);
        console.log('Download error:', err);
      });
    // RNFS.unlink(doc)
    //   .then(() => {
    //     console.log('Previous file deleted');
    //   })
    //   .catch((err) => {
    //     console.log(err.message);
    //   });
  };

  const handleUpload = docKey => {
    if (!documents || documents.length === 0) {
      ToastUtility.showToast('Documents are still loading');
      return;
    }

    const index = documents.findIndex(doc => doc.key === docKey);
    if (index === -1) {
      ToastUtility.showToast('Document not available');
      return;
    }

    const item = documents[index];

    if (item.docType === 'image') {
      // Always show picker for upload/re-upload when clicking the card
      // View button handles viewing uploaded documents
      setDocType(index);
      setShowPicker(true);
    } else if (item.docType === 'text') {
      ToastUtility.showToast('Please enter this information manually');
    }
  };

  const handleView = (docKey, e) => {
    e.stopPropagation(); // Prevent triggering the upload handler

    if (!documents || documents.length === 0) {
      ToastUtility.showToast('Documents are still loading');
      return;
    }

    const index = documents.findIndex(doc => doc.key === docKey);
    if (index === -1) {
      ToastUtility.showToast('Document not available');
      return;
    }

    const item = documents[index];

    // Priority: 1. localPath (recently uploaded), 2. image1 (current), 3. serverUrl (from API)
    // Also check ref for recently uploaded files
    const recentUpload = recentlyUploadedFilesRef.current[docKey] || recentlyUploadedFiles[docKey];
    let documentUrl = item.localPath ||
      (recentUpload && recentUpload.localPath) ||
      item.image1 ||
      item.serverUrl;

    console.log('👁️ Viewing document:', {
      docKey,
      localPath: item.localPath,
      image1: item.image1,
      serverUrl: item.serverUrl,
      recentUpload: recentUpload?.localPath,
      finalUrl: documentUrl
    });

    if (!documentUrl || documentUrl === '') {
      ToastUtility.showToast('Document not available');
      return;
    }

    // Check if it's a PDF - strictly check file extension or URI content
    const lowerPath = documentUrl ? documentUrl.toLowerCase().split('?')[0] : '';
    const isPdf = lowerPath.endsWith('.pdf') ||
      documentUrl.includes('.pdf') ||
      (item.document_types?.includes('pdf') && !lowerPath.match(/\.(jpg|jpeg|png|gif|bmp|webp|heic|heif|jfif)$/i));

    // Add cache-busting parameter for PDFs to ensure latest version is loaded
    if (documentUrl && (documentUrl.startsWith('http') || documentUrl.startsWith('https'))) {
      if (isPdf) {
        // Add timestamp to force reload of PDF
        const separator = documentUrl.includes('?') ? '&' : '?';
        documentUrl = documentUrl + separator + 't=' + Date.now();
        setSelPdf(documentUrl);
        setShowSelPdfPopup(true);
      } else {
        setselImg(documentUrl);
        setShowSelImgPopup(true);
      }
    } else if (documentUrl && (documentUrl.startsWith('file://') || documentUrl.startsWith('content://'))) {
      // Local file - also allow viewing
      if (isPdf) {
        setSelPdf(documentUrl);
        setShowSelPdfPopup(true);
      } else {
        setselImg(documentUrl);
        setShowSelImgPopup(true);
      }
    } else {
      ToastUtility.showToast('Cannot view this document');
    }
  };

  const UploadCard = ({ title, onPress, fullWidth = false, hasDocument = false, documentUrl = '', docType = 'image', isRequired = false, selectedForUpload = false, docKey = '', onView = null }) => {
    // Check if it's a local file (selected but not uploaded) or remote URL (already uploaded)
    // Local files can be: file://, content:// (Android), or paths without http/https
    const isLocalFile = documentUrl && (
      documentUrl.startsWith('file://') ||
      documentUrl.startsWith('content://') ||
      (!documentUrl.startsWith('http') && !documentUrl.startsWith('https'))
    );

    // Check for PDF - check extension in path, file name, or URI type
    const lowerPath = documentUrl ? documentUrl.toLowerCase() : '';
    // Extract filename from path to check extension
    const pathParts = documentUrl ? documentUrl.split('/') : [];
    const fileName = pathParts.length > 0 ? pathParts[pathParts.length - 1].toLowerCase() : '';

    // Check if it's a PDF - multiple ways to detect
    const hasPdfExtension = lowerPath.endsWith('.pdf') ||
      lowerPath.includes('.pdf') ||
      fileName.endsWith('.pdf') ||
      fileName.includes('.pdf');
    const hasPdfMimeType = lowerPath.includes('application/pdf');
    // If selected for upload and local file, and not an image extension, likely PDF
    const isLikelyPdf = selectedForUpload && isLocalFile && !lowerPath.match(/\.(jpg|jpeg|png|gif|bmp|webp|heic|heif|jfif)$/i);

    const isPdf = documentUrl && (hasPdfExtension || hasPdfMimeType || isLikelyPdf);

    // Debug log for PDF detection
    if (selectedForUpload && documentUrl) {
      console.log('🔍 PDF Detection:', {
        documentUrl: documentUrl.substring(0, 50) + '...',
        lowerPath: lowerPath.substring(0, 50) + '...',
        fileName: fileName,
        hasPdfExtension: hasPdfExtension,
        hasPdfMimeType: hasPdfMimeType,
        isLikelyPdf: isLikelyPdf,
        isPdf: isPdf,
        isLocalFile: isLocalFile,
        selectedForUpload: selectedForUpload
      });
    }
    const isRtf = documentUrl && (lowerPath.endsWith('.rtf') || lowerPath.includes('.rtf'));
    const isImage = documentUrl && !isPdf && !isRtf;

    // Show image if it exists (either local or remote)
    const showImage = hasDocument && isImage && (isLocalFile || documentUrl.startsWith('http'));

    // Check if document is uploaded (has HTTP URL)
    const isUploaded = documentUrl && (documentUrl.startsWith('http') || documentUrl.startsWith('https'));
    const canView = (isUploaded || (documentUrl && documentUrl.startsWith('file://'))) && onView;

    return (
      <TouchableOpacity
        style={[styles.uploadCard, fullWidth && styles.fullWidthCard]}
        onPress={onPress}
        activeOpacity={0.7}>
        {showImage ? (
          <View style={{ width: '100%', height: 150, marginBottom: width * 1.5, position: 'relative' }}>
            <FastImage
              source={{ uri: isLocalFile ? documentUrl : documentUrl }}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: height * 0.5,
              }}
              resizeMode="cover"
            />
            {/* Document name in the center */}
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                borderRadius: height * 0.5,
              }}>
              <Text
                style={{
                  color: ColorCode.white,
                  fontSize: width * 3.5,
                  fontFamily: Fonts.SemiBold,
                  textAlign: 'center',
                  paddingHorizontal: width * 2,
                }}
                numberOfLines={2}>
                {title}
              </Text>
            </View>
          </View>
        ) : (hasDocument && (isPdf || isRtf)) || (selectedForUpload && isLocalFile && (isPdf || isRtf)) ? (
          <View style={{ width: '100%', height: 150, alignItems: 'center', justifyContent: 'center', marginBottom: width * 1.5, position: 'relative' }}>
            <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', position: 'relative' }}>
              <AntDesign
                name={isPdf ? "pdffile1" : "file1"}
                size={50}
                color={ColorCode.red}
              />
              {/* Document name in the center below icon */}
              <Text
                style={{
                  color: ColorCode.textBlack,
                  fontSize: width * 3.5,
                  fontFamily: Fonts.SemiBold,
                  textAlign: 'center',
                  paddingHorizontal: width * 2,
                  marginTop: width * 2,
                }}
                numberOfLines={2}>
                {title}
              </Text>
              {(isLocalFile || selectedForUpload) && (
                <Text
                  style={{
                    color: ColorCode.yellow,
                    fontSize: width * 2.5,
                    fontFamily: Fonts.Regular,
                    textAlign: 'center',
                    marginTop: width * 1,
                  }}>
                  Ready to upload
                </Text>
              )}
            </View>
          </View>
        ) : (
          <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', minHeight: 120 }}>
            <Icon name="upload-cloud" size={32} color={ColorCode.primary} />
            <Text style={[styles.uploadText, { marginTop: width * 2 }]}>{title}</Text>
          </View>
        )}
        {(hasDocument && !isLocalFile) && (
          <>
            <View
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: ColorCode.primary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: ColorCode.white,
              }}>
              <AntDesign name="check" size={16} color={ColorCode.white} />
            </View>
            {canView && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onView(docKey, e);
                }}
                style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  backgroundColor: ColorCode.primary,
                  paddingHorizontal: width * 2,
                  paddingVertical: width * 1,
                  borderRadius: width * 1.5,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: width * 1,
                }}>
                <Ionicons name="eye" size={14} color={ColorCode.white} />
                <Text
                  style={{
                    color: ColorCode.white,
                    fontSize: width * 2.5,
                    fontFamily: Fonts.SemiBold,
                  }}>
                  View
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
        {selectedForUpload && isLocalFile && (
          <View
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: ColorCode.yellow,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: ColorCode.white,
            }}>
            <AntDesign name="clockcircle" size={14} color={ColorCode.white} />
          </View>
        )}
      </TouchableOpacity>
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
        <CustomSAView
          parentStyple={{
            flex: 1,
            backgroundColor: ColorCode.transarent,
            paddingBottom: keyboardHeight,
          }}
          style={{ flex: 1, backgroundColor: ColorCode.transarent }}>
          <CustomHeader text={'All Documents'} customStyle={{ marginTop: 0 }} />
          <View
            style={{
              flex: 1,
              paddingHorizontal: 4 * width,
              paddingTop: 2 * width,
            }}>
            <Text
              style={{
                color: '#000',
                fontSize: 4 * width,
                fontFamily: Fonts.SemiBold,
              }}>
              {'Upload Your Documents'}
            </Text>
            <Text
              style={{
                color: '#4A5568',
                fontSize: 3 * width,
                fontFamily: Fonts.Regular,
                marginTop: 1 * width,
              }}>
              {
                'Please upload the documents mentioned below to setup your course'
              }
            </Text>
            <View
              style={{
                backgroundColor: ColorCode.primaryTrans,
                padding: width * 2,
                borderRadius: width * 1.5,
                marginTop: width * 2,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Ionicons name="information-circle" size={16} color={ColorCode.primary} />
              <Text
                style={{
                  color: ColorCode.primary,
                  fontSize: 3 * width,
                  fontFamily: Fonts.Medium,
                  marginLeft: width * 1.5,
                  flex: 1,
                }}>
                Click in middle to upload doc/image
              </Text>
            </View>

            <ScrollView
              style={styles.container}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}>
              {showProgress ? (
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 20 }}>
                  <Text style={{ color: '#666', fontSize: 3.5 * width }}>Loading documents...</Text>
                </View>
              ) : documents.length === 0 ? (
                <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 20 }}>
                  <Text style={{ color: '#666', fontSize: 3.5 * width }}>No documents available</Text>
                </View>
              ) : (
                documents.map((doc, index) => {
                  // Debug: Log each document being rendered
                  if (index === 0) {
                    console.log('Rendering documents. Total:', documents.length);
                    console.log('Document keys to render:', documents.map(d => ({ key: d.key, name: d.name })));
                  }

                  if (doc.docType === 'text') {
                    return (
                      <View
                        key={doc.key || index}
                        style={{
                          width: '100%',
                          marginBottom: width * 3,
                          padding: width * 2,
                          backgroundColor: '#F8FBFF',
                          borderRadius: 3 * width,
                          borderWidth: 1,
                          borderColor: doc.is_rejected
                            ? ColorCode.red
                            : doc.is_verified
                              ? ColorCode.primary
                              : doc.reupload
                                ? ColorCode.accent
                                : '#ABC32F',
                        }}>
                        <View
                          style={{
                            width: '100%',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginBottom: width * 2,
                          }}>
                          <Text
                            style={{
                              color: '#4A5568',
                              fontSize: 3 * width,
                              fontFamily: Fonts.Regular,
                            }}>
                            {doc.optional ? `${doc.name} (Optional)` : doc.name}
                          </Text>
                          {(doc.is_rejected || doc.reupload || doc.is_verified || doc.uploaded) && (
                            <Text
                              style={{
                                color: doc.is_rejected
                                  ? ColorCode.red
                                  : doc.is_verified
                                    ? ColorCode.primary
                                    : doc.reupload
                                      ? ColorCode.accent
                                      : ColorCode.yellow,
                                fontSize: 3 * width,
                                fontFamily: Fonts.Regular,
                              }}>
                              {doc.is_rejected
                                ? 'Rejected'
                                : doc.reupload
                                  ? 'Re-Upload'
                                  : doc.is_verified
                                    ? 'Verified'
                                    : doc.uploaded
                                      ? 'Uploaded'
                                      : ''}
                            </Text>
                          )}
                        </View>
                        <TextInput
                          style={{
                            width: '100%',
                            height: 13 * width,
                            borderWidth: 1,
                            borderColor: doc.is_rejected
                              ? ColorCode.red
                              : doc.is_verified
                                ? ColorCode.primary
                                : doc.reupload
                                  ? ColorCode.accent
                                  : '#ABC32F',
                            borderRadius: 2 * width,
                            paddingHorizontal: 3 * width,
                          }}
                          placeholder={`Enter ${doc.name}`}
                          value={doc.image1}
                          maxLength={9}
                          editable={doc.reupload || doc.is_rejected || !doc.uploaded}
                          onChangeText={t => {
                            var d = [...documents];
                            var docItem = d[index];
                            docItem.image1 = t;
                            d[index] = docItem;
                            setDocuments(d);
                          }}
                        />
                      </View>
                    );
                  } else {
                    // Render image documents - alternate between full width and side by side
                    const imageDocs = documents.filter(d => d.docType === 'image');
                    const imageIndex = imageDocs.findIndex(d => d.key === doc.key);
                    const isFullWidth = imageIndex % 3 === 0;
                    const nextImageDoc = imageDocs[imageIndex + 1];
                    const showInRow = nextImageDoc && imageIndex % 3 !== 0 && (imageIndex + 1) % 3 !== 0;

                    // Skip if this will be rendered in previous row
                    if (imageIndex > 0 && imageIndex % 3 === 1 && imageDocs[imageIndex - 1]) {
                      return null;
                    }

                    // Check if document has image (either uploaded or selected)
                    // Prefer localPath if available (recently uploaded), otherwise use image1
                    const docImageUrl = doc.localPath || doc.image1 || '';
                    const hasDocImage = docImageUrl && docImageUrl !== '';

                    // Debug log for PDF selection
                    if (doc.selectedForUpload && hasDocImage) {
                      console.log('🔍 Rendering document with selection:', {
                        name: doc.name,
                        key: doc.key,
                        localPath: doc.localPath,
                        image1: doc.image1,
                        serverUrl: doc.serverUrl,
                        finalUrl: docImageUrl,
                        selectedForUpload: doc.selectedForUpload,
                        hasDocImage: hasDocImage
                      });
                    }

                    if (showInRow) {
                      const nextDocImageUrl = nextImageDoc.localPath || nextImageDoc.image1 || '';
                      const hasNextDocImage = nextDocImageUrl && nextDocImageUrl !== '';

                      return (
                        <View key={doc.key || index} style={styles.rowContainer}>
                          <UploadCard
                            title={doc.name}
                            onPress={() => handleUpload(doc.key)}
                            hasDocument={hasDocImage}
                            documentUrl={docImageUrl}
                            docType={doc.docType}
                            isRequired={doc.isRequired}
                            selectedForUpload={doc.selectedForUpload}
                            docKey={doc.key}
                            onView={handleView}
                          />
                          <UploadCard
                            title={nextImageDoc.name}
                            onPress={() => handleUpload(nextImageDoc.key)}
                            hasDocument={hasNextDocImage}
                            documentUrl={nextImageDoc.localPath || nextImageDoc.image1 || ''}
                            docType={nextImageDoc.docType}
                            isRequired={nextImageDoc.isRequired}
                            selectedForUpload={nextImageDoc.selectedForUpload}
                            docKey={nextImageDoc.key}
                            onView={handleView}
                          />
                        </View>
                      );
                    }

                    return (
                      <UploadCard
                        key={doc.key || index}
                        title={doc.name}
                        onPress={() => handleUpload(doc.key)}
                        fullWidth={isFullWidth}
                        hasDocument={hasDocImage}
                        documentUrl={docImageUrl}
                        docType={doc.docType}
                        isRequired={doc.isRequired}
                        selectedForUpload={doc.selectedForUpload}
                        docKey={doc.key}
                        onView={handleView}
                      />
                    );
                  }
                })
              )}
            </ScrollView>
            {/* <View
              style={{
                flex: 1,
                backgroundColor: '#FFF',
                paddingVertical: 2 * width,
              }}>
              <FlatList
                // data={[1, 1, 1, 1]}
                // data={documents}
                data={documents.slice(0, documents.length - 1)}
                numColumns={2}
                removeClippedSubviews={false}
                // style={{width: '100%'}}
                renderItem={({item, index}) => {
                  return item.docType == 'image' ? (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        if (
                          (!item.uploaded && !item.is_rejected) ||
                          item.reupload
                        ) {
                          setDocType(index);
                          setShowPicker(true);
                        } else if (item.uploaded) {
                          if (item.image1 != '') {
                            console.log('File Path ==  ', item.image1);
                            if (item.image1.endsWith('.pdf')) {
                              setSelPdf(item.image1);
                              setShowSelPdfPopup(true);
                            } else {
                              setselImg(item.image1);
                              setShowSelImgPopup(true);
                            }
                          }
                        }
                      }}
                      style={{
                        width: 43 * width,
                        height: 30 * width,
                        margin: 1.5 * width,
                        backgroundColor: '#F8FBFF',
                        borderWidth: 1,
                        borderRadius: 3 * width,
                        borderColor: '#ABC32F',
                        borderStyle: 'dashed',
                        alignItems: 'center',
                        // justifyContent: 'center',
                      }}>
                      {item.image1 == '' ? (
                        <View style={{flex: 1, alignItems: 'center'}}>
                          <View
                            style={{
                              width: 12 * width,
                              height: 12 * width,
                              borderRadius: 2 * width,
                              backgroundColor: '#FED40266',
                              alignItems: 'center',
                              marginTop: 5 * width,
                              justifyContent: 'center',
                            }}>
                            <AntDesign
                              name="arrowup"
                              size={5 * width}
                              color="#000"
                            />
                          </View>
                        </View>
                      ) : item.image1.endsWith('.pdf') ? (
                        <View style={{flex: 1, alignItems: 'center'}}>
                          <View
                            style={{
                              width: 20 * width,
                              height: 20 * width,
                              // borderRadius: 2 * width,
                              // backgroundColor: '#FED40266',
                              alignItems: 'center',
                              marginTop: 5 * width,
                              justifyContent: 'center',
                            }}>
                            <AntDesign
                              name="pdffile1"
                              size={15 * width}
                              color="#000"
                            />
                          </View>
                        </View>
                      ) : (
                        <View style={{flex: 1}}>
                          <FastImage
                            source={{uri: item.image1}}
                            style={{
                              width: 42 * width,
                              height: 29 * width,
                              borderRadius: 3 * width,
                            }}
                            resizeMode="cover"
                          />
                        </View>
                      )}
                      <View
                        style={{
                          // width: '40%',
                          height: 6 * width,
                          backgroundColor: item.is_rejected
                            ? ColorCode.red
                            : item.is_verified
                            ? ColorCode.primary
                            : item.reupload
                            ? ColorCode.accent
                            : ColorCode.yellow,
                          position: 'absolute',
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingHorizontal: 2 * width,
                          top: 0,
                          right: 0,
                          borderTopRightRadius: 2 * width,
                          borderBottomLeftRadius: 2 * width,
                        }}>
                        <Text
                          style={{
                            color: item.image1
                              ? ColorCode.white
                              : ColorCode.black,
                            fontSize: 3 * width,
                            fontFamily: Fonts.Regular,
                            textAlign: 'center',
                          }}>
                          {item.is_rejected
                            ? 'Rejected'
                            : item.reupload
                            ? 'Re-Upload'
                            : item.is_verified
                            ? 'Verified'
                            : item.uploaded
                            ? 'Uploaded'
                            : 'Upload'}
                        </Text>
                      </View>
                      <View
                        style={{
                          width: '100%',
                          height: 10 * width,
                          marginTop: 1 * width,
                          backgroundColor: ColorCode.primaryTrans,
                          position: 'absolute',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bottom: 0,
                          borderBottomRightRadius: 2 * width,
                          borderBottomLeftRadius: 2 * width,
                        }}>
                        <Text
                          style={{
                            width: 40 * width,
                            color: item.image1
                              ? ColorCode.white
                              : ColorCode.black,
                            fontSize: 3 * width,
                            fontFamily: Fonts.Regular,
                            textAlign: 'center',
                          }}>
                          {item.optional
                            ? `${item.name} (Optional)`
                            : item.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ) : (
                    <View
                      key={index}
                      style={{
                        width: 89 * width,
                        // height: 30 * width,
                        margin: 1.5 * width,
                        // backgroundColor: '#F8FBFF',
                        borderRadius: 3 * width,
                        // borderWidth: 1,
                        // borderColor: '#ABC32F',
                        // borderStyle: 'dashed',
                        // alignItems: 'center',
                        // justifyContent: 'center',
                      }}>
                      <View
                        style={{
                          width: '100%',
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <Text
                          style={{
                            color: '#4A5568',
                            fontSize: 3 * width,
                            fontFamily: Fonts.Regular,
                            marginTop: 1 * width,
                            // textAlign: 'center',
                          }}>
                          {item.optional
                            ? `${item.name} (Optional)`
                            : item.name}
                        </Text>
                        <Text
                          style={{
                            color: item.is_rejected
                              ? ColorCode.red
                              : item.is_verified
                              ? ColorCode.primary
                              : item.reupload
                              ? ColorCode.accent
                              : ColorCode.yellow,
                            fontSize: 3 * width,
                            fontFamily: Fonts.Regular,
                            marginTop: 1 * width,
                            // textAlign: 'center',
                          }}>
                          {item.is_rejected
                            ? 'Rejected'
                            : item.reupload
                            ? 'Re-Upload'
                            : item.is_verified
                            ? 'Verified'
                            : item.uploaded
                            ? 'Uploaded'
                            : ''}
                        </Text>
                      </View>
                      <TextInput
                        style={{
                          width: '100%',
                          height: 13 * width,
                          borderWidth: 1,
                          borderColor: item.is_rejected
                            ? ColorCode.red
                            : item.is_verified
                            ? ColorCode.primary
                            : item.reupload
                            ? ColorCode.accent
                            : '#ABC32F',
                          borderRadius: 2 * width,
                          paddingHorizontal: 3 * width,
                          marginTop: 1 * width,
                        }}
                        placeholder={`Enter ${item.name}`}
                        value={item.image1}
                        maxLength={9}
                        editable={
                          item.reupload || item.is_rejected || !item.uploaded
                        }
                        onChangeText={t => {
                          var d = [...documents];
                          var doc = d[index];
                          doc.image1 = t;
                          d[index] = doc;
                          setDocuments(d);
                        }}
                      />
                    </View>
                  );
                }}
              />

              {documents.length > 0 && (
                <View
                  style={{
                    width: 89 * width,
                    // height: 30 * width,
                    margin: 1.5 * width,
                    // backgroundColor: '#F8FBFF',
                    borderRadius: 3 * width,
                    // borderWidth: 1,
                    // borderColor: '#ABC32F',
                    // borderStyle: 'dashed',
                    // alignItems: 'center',
                    // justifyContent: 'center',
                  }}>
                  <View
                    style={{
                      width: '100%',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      style={{
                        color: '#4A5568',
                        fontSize: 3 * width,
                        fontFamily: Fonts.Regular,
                        marginTop: 1 * width,
                        // textAlign: 'center',
                      }}>
                      {documents[documents.length - 1].optional
                        ? `${documents[documents.length - 1].name} (Optional)`
                        : documents[documents.length - 1].name}
                    </Text>
                    <Text
                      style={{
                        color: documents[documents.length - 1].is_rejected
                          ? ColorCode.red
                          : documents[documents.length - 1].is_verified
                          ? ColorCode.primary
                          : documents[documents.length - 1].reupload
                          ? ColorCode.accent
                          : ColorCode.yellow,
                        fontSize: 3 * width,
                        fontFamily: Fonts.Regular,
                        marginTop: 1 * width,
                        // textAlign: 'center',
                      }}>
                      {documents[documents.length - 1].is_rejected
                        ? 'Rejected'
                        : documents[documents.length - 1].reupload
                        ? 'Re-Upload'
                        : documents[documents.length - 1].is_verified
                        ? 'Verified'
                        : documents[documents.length - 1].uploaded
                        ? 'Uploaded'
                        : ''}
                    </Text>
                  </View>
                  <TextInput
                    style={{
                      width: '100%',
                      height: 13 * width,
                      borderWidth: 1,
                      borderColor: documents[documents.length - 1].is_rejected
                        ? ColorCode.red
                        : documents[documents.length - 1].is_verified
                        ? ColorCode.primary
                        : documents[documents.length - 1].reupload
                        ? ColorCode.accent
                        : '#ABC32F',
                      borderRadius: 2 * width,
                      paddingHorizontal: 3 * width,
                      marginTop: 1 * width,
                    }}
                    placeholder={`Enter ${
                      documents[documents.length - 1].name
                    }`}
                    value={documents[documents.length - 1].image1}
                    maxLength={9}
                    editable={
                      documents[documents.length - 1].reupload ||
                      documents[documents.length - 1].is_rejected ||
                      !documents[documents.length - 1].uploaded
                    }
                    onChangeText={t => {
                      var d = [...documents];
                      var doc = d[documents.length - 1];
                      doc.image1 = t;
                      d[documents.length - 1] = doc;
                      setDocuments(d);
                    }}
                  />
                </View>
              )}
            </View> */}
            {(hasSelectedDocuments || !isAllUploaded || isAnyReupload || isAnyRejected) &&
              keyboardHeight == 0 && (
                <CustomButton
                  btnText="Submit"
                  colors={[ColorCode.primary, ColorCode.primary]}
                  enable={true}
                  btnStyle={{
                    width: '100%',
                    height: 13 * width,
                    marginTop: 4 * width,
                    marginBottom: insets.bottom + (4 * width),
                    elevation: 1 * width,
                  }}
                  btnTextStyle={{
                    //fontWeight: '700',
                    fontFamily: Fonts.Regular,
                    fontSize: 4 * width,
                  }}
                  onPress={() => {
                    uploadAllDocs();
                    // navigation.navigate('Intro');
                  }}
                />
              )}
          </View>
        </CustomSAView>
      </View>

      <Custom_ImagePicker
        visibility={showPicker}
        setVisibility={setShowPicker}
        limit={1}
        enableDocumentPicker={true}
        selectedImagePath={path => {
          console.log('📎 Selected file path:', path);
          console.log('📎 Document index:', docType);
          console.log('📎 Current document:', documents[docType]);
          var d = [...documents];
          var doc = d[docType];
          if (!doc) {
            console.error('❌ Document not found at index:', docType);
            ToastUtility.showToast('Document not found');
            setShowPicker(false);
            return;
          }
          // Store the selected file path (local file path for images/PDFs)
          doc.image1 = path;
          doc.localPath = path; // Store local path separately
          // Mark as selected but not yet uploaded
          doc.selectedForUpload = true;

          // Detect if it's a PDF based on the path
          // Check if path contains .pdf or if it's a content:// URI (likely PDF from picker)
          const lowerPath = path ? path.toLowerCase() : '';
          const isPdfFile = lowerPath.endsWith('.pdf') ||
            lowerPath.includes('.pdf') ||
            lowerPath.includes('application/pdf') ||
            path.startsWith('content://'); // content:// URIs from Android are often PDFs

          // If it's detected as PDF, we can store this info (though docType should already handle it)
          // The key is ensuring hasDocument is true so the UI shows it
          console.log('✅ Updated document:', {
            name: doc.name,
            key: doc.key,
            newPath: path,
            selectedForUpload: doc.selectedForUpload,
            isPdf: isPdfFile,
            hasDocument: !!path
          });

          d[docType] = doc;
          // Force state update by creating a new array
          setDocuments([...d]);
          setShowPicker(false);
        }}
      />

      <Modal
        visible={showSelImgPopup}
        transparent={false}
        onRequestClose={() => {
          setShowSelImgPopup(false);
          setselImg('');
        }}>
        {selImg && (
          <View
            style={{
              flex: 1,
              backgroundColor: ColorCode.white,
            }}>
            <StatusBar backgroundColor={ColorCode.white} barStyle="dark-content" />
            <View
              style={{
                width: '100%',
                backgroundColor: ColorCode.white,
                paddingTop: Platform.OS === 'ios' ? insets.top : 2 * width,
                borderBottomWidth: 1,
                borderBottomColor: '#eee',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 4 * width,
                height: Platform.OS === 'ios' ? insets.top + (14 * width) : (14 * width),
              }}>
              <TouchableOpacity
                onPress={() => {
                  setShowSelImgPopup(false);
                  setselImg('');
                }}
                style={{
                  width: 10 * width,
                  height: 10 * width,
                  justifyContent: 'center',
                }}>
                <AntDesign name="arrowleft" size={6 * width} color={ColorCode.black} />
              </TouchableOpacity>

              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 4.5 * width, fontFamily: Fonts.SemiBold, color: '#000' }}>View</Text>
              </View>

              <View style={{ width: 10 * width }} />
            </View>

            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <FastImage
                source={{ uri: selImg }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </View>
          </View>
        )}
      </Modal>

      <Modal
        visible={showSelPdfPopup}
        transparent={false}
        onRequestClose={() => {
          setShowSelPdfPopup(false);
          setSelPdf('');
        }}>
        {selPdf && (
          <View
            style={{
              flex: 1,
              backgroundColor: ColorCode.white,
            }}>
            <StatusBar backgroundColor={ColorCode.white} barStyle="dark-content" />
            <View
              style={{
                width: '100%',
                backgroundColor: ColorCode.white,
                paddingTop: Platform.OS === 'ios' ? insets.top : 2 * width,
                borderBottomWidth: 1,
                borderBottomColor: '#eee',
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 4 * width,
                height: Platform.OS === 'ios' ? insets.top + (14 * width) : (14 * width),
              }}>
              <TouchableOpacity
                onPress={() => {
                  setShowSelPdfPopup(false);
                  setSelPdf('');
                }}
                style={{
                  width: 10 * width,
                  height: 10 * width,
                  justifyContent: 'center',
                }}>
                <AntDesign name="arrowleft" size={6 * width} color={ColorCode.black} />
              </TouchableOpacity>

              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 4.5 * width, fontFamily: Fonts.SemiBold, color: '#000' }}>View</Text>
              </View>

              <View style={{ width: 10 * width }} />
            </View>

            <View style={{ flex: 1, width: '100%' }}>
              <Pdf
                trustAllCerts={false}
                scrollEnabled={true}
                source={{
                  uri: selPdf,
                  cache: false,
                }}
                onLoadComplete={(numberOfPages, filePath) => {
                  console.log(`Number of pages: ${numberOfPages}`);
                }}
                onPageChanged={(page, numberOfPages) => {
                  console.log(`Current page: ${page}`);
                }}
                onError={error => {
                  console.log(error);
                }}
                style={{ flex: 1, width: '100%' }}
              />
            </View>
          </View>
        )}
      </Modal>


      {/* <Modal
        // visible={showSuccess}
        visible={true}
        // transparent
        >
        <View
          style={{
            // flex: 1,
            width:'100%',
            height:'100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0004',
          }}>
          <View
            style={{
              width: '90%',
              backgroundColor: ColorCode.white,
              padding: 4 * width,
              borderRadius: 3 * width,
              alignSelf: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: '#008A3D',
                fontSize: 4 * width,
                fontFamily: Fonts.Medium,
              }}>
              {`Successful!`}
            </Text>

            <View
              style={{
                width: '50%',
                height: 1,
                marginTop: 2,
                backgroundColor: ColorCode.primary,
              }}
            />
            <Text
              style={{
                color: ColorCode.grey888,
                fontSize: 3.8 * width,
                textAlign: 'center',
                marginVertical: 3 * width,
                fontFamily: Fonts.Regular,
              }}>
              {`Congratulations, new student! You are officially enrolled! Feel free to take your time exploring the app and student portal. If you have any questions, please don’t hesitate to reach out to us. We are here to help! ☺️`}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowSuccess(false);
                navigation.goBack();
              }}
              style={[
                {
                  width: '100%',
                  height: 12 * width,
                  backgroundColor: ColorCode.primary,
                  borderRadius: 2 * width,
                  marginVertical: 2 * width,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                ConstData.ELEVATION_STYLE,
              ]}>
              <Text
                style={{
                  color: ColorCode.white,
                  fontSize: 3.4 * width,
                  textAlign: 'center',
                  fontFamily: Fonts.Regular,
                }}>
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal> */}

      <CustomProgress show={showProgress} />
    </Provider>
  );
};

export default DocumentScreen;

const styles = StyleSheet.create({
  container: {
    padding: width * 2,
    flex: 1,
  },
  uploadCard: {
    backgroundColor: ColorCode.white,
    borderWidth: 1.5,
    borderColor: ColorCode.primary,
    borderStyle: 'dashed',
    borderRadius: height * 1.5,
    padding: width * 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: width * 3,
    minHeight: 120,
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  fullWidthCard: {
    flex: 0,
    width: '100%',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: width * 2,
    marginBottom: width * 3,
  },
  uploadText: {
    fontSize: width * 3.2,
    color: ColorCode.textBlack,
    textAlign: 'center',
    fontFamily: Fonts.SemiBold,
  },
});
