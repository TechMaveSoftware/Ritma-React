import React, { Fragment, useEffect, useState, useRef } from 'react';
import {
    Dimensions,
    Keyboard,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Provider } from 'react-native-paper';
import CustomButton from '../../compenents/CustomButton';
import CustomSAView from '../../compenents/CustomSAView';
import CustomStatus from '../../compenents/CustomStatus';
const screenWidth = Dimensions.get('window').width;
const width = screenWidth > 420 ? 420 / 100 : screenWidth / 100;
const height = Dimensions.get('window').height / 100;
import ColorCode from '../../utility/ColorCode';
import Fonts from '../../utility/Fonts';
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
import Icon from 'react-native-vector-icons/Feather';
import CustomHeaderTablet from '../../compenents/CustomHeaderTablet';

const DocumentScreenTablet = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [documents, setDocuments] = useState([]);
    const [docType, setDocType] = useState(0);
    const [showPicker, setShowPicker] = useState(false);
    const recentlyUploadedFilesRef = useRef({});
    const [recentlyUploadedFiles, setRecentlyUploadedFiles] = useState({});
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [selImg, setselImg] = useState('');
    const [showSelImgPopup, setShowSelImgPopup] = useState(false);
    const [selPdf, setSelPdf] = useState('');
    const [showSelPdfPopup, setShowSelPdfPopup] = useState(false);
    const [showProgress, setShowProgress] = useState(false);

    useEffect(() => {
        getCourseDocuments();
    }, []);

    useEffect(() => {
        let keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', e => {
            setKeyboardHeight(Platform.OS == 'ios' ? e.endCoordinates.height : 1);
        });
        let keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0);
        });
        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    const isAllUploaded = documents.every(({ uploaded }) => uploaded == true);
    const isAnyRejected = documents.some(({ is_rejected }) => is_rejected == true);
    const isAnyReupload = documents.some(({ reupload }) => reupload == true);
    const hasSelectedDocuments = documents.some(({ selectedForUpload }) => selectedForUpload == true);

    const getCourseDocuments = () => {
        setShowProgress(true);
        ApiMethod.courseDocuments(
            pass => {
                setShowProgress(false);
                let documentsArray = [];
                let baseUrl = '';

                if (Array.isArray(pass)) {
                    documentsArray = pass;
                } else if (pass && typeof pass === 'object') {
                    documentsArray = pass.data || pass.documents || pass.result || [];
                    baseUrl = pass.document_root || pass.base_url || pass.baseUrl || '';
                }

                var docs = [];
                const seenDocumentKeys = new Set();
                const filesToClear = [];

                if (documentsArray && documentsArray.length > 0) {
                    documentsArray.forEach((docItem, index) => {
                        const enrollmentDoc = docItem.enrollment_document || {};
                        let docTitle = enrollmentDoc.document_title || docItem.document_title || '';
                        let docName = enrollmentDoc.document_name || docItem.document_name || '';

                        if (docName) {
                            docName = docName.replace(/_+$/, '');
                        }

                        if (!docTitle && docName) {
                            docTitle = docName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                        }

                        if (!docName && docTitle) {
                            docName = docTitle.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                        }

                        if (!docName && !docTitle) {
                            docTitle = `Document ${index + 1}`;
                            docName = `document_${index + 1}`;
                        }

                        const docTypes = enrollmentDoc.document_types || docItem.document_types || '';
                        const isTextType = !docTypes.includes('image') && !docTypes.includes('pdf') && !docTypes.includes('application');
                        const docType = isTextType ? 'text' : 'image';

                        let documentData = '';
                        const docDataObj = docItem.document_data;

                        if (docDataObj && typeof docDataObj === 'object' && docDataObj !== null) {
                            const filePath = docDataObj.file || '';
                            if (filePath) {
                                if (baseUrl) {
                                    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
                                    documentData = cleanBaseUrl + '/' + filePath;
                                } else {
                                    documentData = 'https://techmavedev.com/ritma-edtech/storage/app/public/' + filePath;
                                }
                                if (documentData.includes('.pdf') || docTypes.includes('pdf')) {
                                    const separator = documentData.includes('?') ? '&' : '?';
                                    documentData = documentData + separator + 't=' + Date.now();
                                }
                            }
                        } else if (typeof docDataObj === 'string' && docDataObj !== '') {
                            documentData = docDataObj;
                            if (documentData && !documentData.startsWith('http') && !documentData.startsWith('file://')) {
                                if (baseUrl) {
                                    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
                                    const cleanFilePath = documentData.startsWith('/') ? documentData : '/' + documentData;
                                    documentData = cleanBaseUrl + cleanFilePath;
                                }
                            }
                        }

                        const isRequired = docItem.is_required === '1' || docItem.is_required === 1 || docItem.is_required === true;
                        const isVerified = (docDataObj && (docDataObj.is_verified === '1' || docDataObj.is_verified === 1)) || docItem.is_verified === '1' || docItem.is_verified === 1;
                        const isRejected = (docDataObj && (docDataObj.is_rejected === '1' || docDataObj.is_rejected === 1)) || docItem.is_rejected === '1' || docItem.is_rejected === 1;
                        const reupload = (docDataObj && (docDataObj.reupload === '1' || docDataObj.reupload === 1)) || docItem.reupload === '1' || docItem.reupload === 1;

                        const recentUpload = recentlyUploadedFilesRef.current[docName] || recentlyUploadedFiles[docName];
                        const serverUpdatedAt = docDataObj?.updated_at ? new Date(docDataObj.updated_at).getTime() : 0;
                        const uploadTime = recentUpload?.uploadTime || 0;
                        const useLocalFile = recentUpload && recentUpload.localPath && (Date.now() - uploadTime < 5 * 60 * 1000) && (serverUpdatedAt <= uploadTime + 1000);

                        const finalDocumentUrl = useLocalFile ? recentUpload.localPath : (documentData || '');

                        if (recentUpload && serverUpdatedAt > uploadTime) {
                            filesToClear.push(docName);
                        }

                        const normalizedDocName = (docName || '')
                            .toLowerCase()
                            .replace(/_+$/, '')
                            .replace(/\s+/g, '_');
                        const normalizedDocTitle = (docTitle || '')
                            .toLowerCase()
                            .replace(/[^a-z0-9]/g, '');
                        const dedupeKey =
                            normalizedDocName === 'profile_picture'
                                ? 'profile_pic'
                                : normalizedDocName || normalizedDocTitle || `document_${index + 1}`;

                        // Tablet should not show profile picture upload card.
                        if (dedupeKey === 'profile_pic') {
                            return;
                        }

                        if (seenDocumentKeys.has(dedupeKey)) {
                            return;
                        }
                        seenDocumentKeys.add(dedupeKey);

                        docs.push({
                            name: docTitle,
                            image1: finalDocumentUrl,
                            key: docName,
                            show: true,
                            optional: !isRequired,
                            isRequired: isRequired,
                            uploaded: !!(documentData || useLocalFile),
                            is_verified: isVerified,
                            is_rejected: isRejected,
                            reupload: reupload,
                            docType: docType,
                            id: docItem.id,
                            enrollment_document_id: docItem.enrollment_document_id,
                            document_types: docTypes,
                            selectedForUpload: false,
                            serverUrl: documentData || '',
                            localPath: useLocalFile ? recentUpload.localPath : '',
                        });
                    });
                }

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
                setDocuments(docs);
            },
            fail => {
                setShowProgress(false);
                ToastUtility.showToast(fail?.message || 'Failed to load documents');
                setDocuments([]);
            },
        );
    };

    const uploadAllDocs = () => {
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

        let error = false;
        let errorMsg = '';
        documents.forEach((d, pos) => {
            if (d.docType === 'text' && pos === documents.length - 1) {
                if (d.image1 === '') {
                    if (!error) { errorMsg = 'Enter SSN Number'; error = true; }
                } else if (d.image1.length !== 9) {
                    if (!error) { errorMsg = 'Enter Valid SSN Number'; error = true; }
                }
            }
        });

        if (error) {
            ToastUtility.showToast(errorMsg);
            return;
        }

        const formData = new FormData();
        documents.forEach(d => {
            if (d.docType === 'image') {
                const hasLocalFile = d.image1 && !d.image1.startsWith('http') && !d.image1.startsWith('https');
                const shouldInclude = d.selectedForUpload || d.reupload || hasLocalFile;
                if (shouldInclude && d.image1) {
                    const isLocalFile = !d.image1.startsWith('http') && !d.image1.startsWith('https');
                    if (isLocalFile) {
                        const pathForCheck = d.image1.replace('file://', '').toLowerCase();
                        let ext = '.jpg';
                        let mimeType = 'image/jpeg';
                        if (pathForCheck.endsWith('.pdf')) { ext = '.pdf'; mimeType = 'application/pdf'; }
                        else if (pathForCheck.endsWith('.png')) { ext = '.png'; mimeType = 'image/png'; }

                        const cleanPath = d.image1.replace('file://', '');
                        const pathParts = cleanPath.split('/');
                        const originalFileName = pathParts[pathParts.length - 1] || '';
                        const finalFileName = originalFileName.includes('.') ? originalFileName.replace(/[^a-zA-Z0-9._-]/g, '_') : `${d.key}_${Date.now()}${ext}`;
                        const fileUri = Platform.OS === 'android' ? d.image1 : d.image1.replace('file://', '');

                        formData.append(d.key, { uri: fileUri, type: mimeType, name: finalFileName });
                    }
                }
            } else if (d.docType === 'text') {
                if (d.is_rejected || d.reupload || !d.uploaded || d.selectedForUpload) {
                    if (d.image1) formData.append(d.key, d.image1);
                }
            }
        });

        if (JSON.parse(JSON.stringify(formData))._parts.length === 0) {
            ToastUtility.showToast('Nothing to update');
            return;
        }

        setShowProgress(true);
        const uploadedLocalFiles = {};
        documents.forEach(doc => {
            if (doc.selectedForUpload && doc.image1 && !doc.image1.startsWith('http')) {
                uploadedLocalFiles[doc.key] = { localPath: doc.image1, uploadTime: Date.now() };
            }
        });

        ApiMethod.updateDocuments(formData, pass => {
            setShowProgress(false);
            if (pass.status === 200 || pass.data?.status === 200) {
                Object.keys(uploadedLocalFiles).forEach(key => { recentlyUploadedFilesRef.current[key] = uploadedLocalFiles[key]; });
                setRecentlyUploadedFiles(prev => ({ ...prev, ...uploadedLocalFiles }));

                setDocuments(prevDocs => prevDocs.map(doc => uploadedLocalFiles[doc.key] ? { ...doc, image1: uploadedLocalFiles[doc.key].localPath, localPath: uploadedLocalFiles[doc.key].localPath, selectedForUpload: false, uploaded: true } : doc));

                navigation.goBack();
                ToastUtility.showToast(pass.message || pass.data?.message || 'Documents uploaded successfully');
            } else ToastUtility.showToast(pass.message || 'Upload failed');
        }, fail => {
            setShowProgress(false);
            ToastUtility.showToast(fail?.message || 'Failed to upload documents');
        });
    };

    const downloadDoc = docPath => {
        const parts = docPath.split('/');
        const fileName = parts[parts.length - 1];
        const destination = (Platform.OS === 'ios' ? (fileName.endsWith('.pdf') ? RNFS.DocumentDirectoryPath : RNFS.LibraryDirectoryPath) : RNFS.DownloadDirectoryPath) + '/' + fileName;

        RNFS.downloadFile({ fromUrl: docPath, toFile: destination, background: true, discretionary: true })
            .promise.then(() => {
                setShowProgress(false);
                ToastUtility.showToast(fileName + ' File Downloaded');
                setShowSelImgPopup(false);
                setselImg('');
            }).catch(err => {
                setShowProgress(false);
                console.log('Download error:', err);
            });
    };

    const handleUpload = index => {
        setDocType(index);
        setShowPicker(true);
    };

    const handleView = (docKey, e) => {
        e.stopPropagation();
        const item = documents.find(doc => doc.key === docKey);
        if (!item) return;

        const recentUpload = recentlyUploadedFilesRef.current[docKey] || recentlyUploadedFiles[docKey];
        let documentUrl = item.localPath || (recentUpload && recentUpload.localPath) || item.image1 || item.serverUrl;

        if (!documentUrl) { ToastUtility.showToast('Document not available'); return; }

        // Check if it's a PDF - strictly check file extension or URI content
        const lowerPath = documentUrl.toLowerCase().split('?')[0];
        const isPdf = lowerPath.endsWith('.pdf') ||
            documentUrl.includes('.pdf') ||
            (item.document_types?.includes('pdf') && !lowerPath.match(/\.(jpg|jpeg|png|gif|bmp|webp|heic|heif|jfif)$/i));

        if (documentUrl.startsWith('http') || documentUrl.startsWith('https')) {
            if (isPdf) {
                setSelPdf(documentUrl + (documentUrl.includes('?') ? '&' : '?') + 't=' + Date.now());
                setShowSelPdfPopup(true);
            } else { setselImg(documentUrl); setShowSelImgPopup(true); }
        } else if (documentUrl.startsWith('file://') || documentUrl.startsWith('content://')) {
            if (isPdf) { setSelPdf(documentUrl); setShowSelPdfPopup(true); }
            else { setselImg(documentUrl); setShowSelImgPopup(true); }
        }
    };

    const UploadCard = ({ title, onPress, hasDocument, documentUrl, docKey, isRequired, selectedForUpload }) => {
        const isLocalFile = documentUrl && (documentUrl.startsWith('file://') || documentUrl.startsWith('content://') || (!documentUrl.startsWith('http') && !documentUrl.startsWith('https')));
        const lowerPath = documentUrl ? documentUrl.toLowerCase().split('?')[0] : '';
        const isPdf = documentUrl && (lowerPath.endsWith('.pdf') || lowerPath.includes('.pdf') || (selectedForUpload && isLocalFile && !lowerPath.match(/\.(jpg|jpeg|png|gif|bmp|webp|heic|heif|jfif)$/i)));
        const showImage = hasDocument && !isPdf && (isLocalFile || documentUrl.startsWith('http'));

        return (
            <TouchableOpacity style={styles.uploadCard} onPress={onPress} activeOpacity={0.7}>
                {showImage ? (
                    <View style={styles.cardImageContainer}>
                        <FastImage source={{ uri: documentUrl }} style={styles.cardImage} resizeMode="cover" />
                        <View style={styles.cardOverlay}>
                            <Text style={styles.cardTitleOverlay} numberOfLines={2}>{title}</Text>
                        </View>
                    </View>
                ) : hasDocument && isPdf ? (
                    <View style={styles.cardEmptyContainer}>
                        <AntDesign name="pdffile1" size={15 * width} color={ColorCode.red} />
                        <Text style={styles.cardTitleText} numberOfLines={2}>{title}</Text>
                    </View>
                ) : (
                    <View style={styles.cardEmptyContainer}>
                        <Icon name="upload-cloud" size={12 * width} color={ColorCode.primary} />
                        <Text style={styles.uploadText}>{title}</Text>
                    </View>
                )}
                {hasDocument && !isLocalFile && (
                    <View style={styles.checkIcon}>
                        <AntDesign name="check" size={4.5 * width} color={ColorCode.white} />
                    </View>
                )}
                {hasDocument && !isLocalFile && (
                    <TouchableOpacity onPress={(e) => handleView(docKey, e)} style={styles.viewBadge}>
                        <Ionicons name="eye" size={4 * width} color={ColorCode.white} />
                        <Text style={styles.viewBadgeText}>View</Text>
                    </TouchableOpacity>
                )}
                {selectedForUpload && isLocalFile && (
                    <View style={styles.clockIcon}>
                        <AntDesign name="clockcircle" size={4 * width} color={ColorCode.white} />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Provider>
            <View style={styles.mainContainer}>
                <CustomStatus trans={true} isDark={true} color="#FFFFFF00" />
                <CustomSAView parentStyple={{ flex: 1, paddingBottom: keyboardHeight }} style={styles.saView}>
                    <CustomHeaderTablet text="All Documents" />

                    <View style={styles.content}>
                        <Text style={styles.pageTitle}>Upload Your Documents</Text>
                        <Text style={styles.pageSubtitle}>Please upload the documents mentioned below to setup your course</Text>

                        <View style={styles.infoBox}>
                            <Ionicons name="information-circle" size={20} color={ColorCode.primary} />
                            <Text style={styles.infoText}>Click in middle to upload doc/image</Text>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                            {showProgress ? (
                                <View style={styles.centerBox}><Text style={styles.statusText}>Loading documents...</Text></View>
                            ) : documents.length === 0 ? (
                                <View style={styles.centerBox}><Text style={styles.statusText}>No documents available</Text></View>
                            ) : (
                                <View style={styles.gridContainer}>
                                    {documents.map((doc, index) => {
                                        if (doc.docType === 'text') {
                                            return (
                                                <View key={doc.key} style={styles.textInputBox}>
                                                    <View style={styles.textInputHeader}>
                                                        <Text style={styles.inputLabel}>{doc.optional ? `${doc.name} (Optional)` : doc.name}</Text>
                                                        {(doc.is_rejected || doc.reupload || doc.is_verified || doc.uploaded) && (
                                                            <Text style={[styles.statusBadgeText, { color: doc.is_rejected ? ColorCode.red : doc.is_verified ? ColorCode.primary : ColorCode.yellow }]}>
                                                                {doc.is_rejected ? 'Rejected' : doc.reupload ? 'Re-Upload' : doc.is_verified ? 'Verified' : 'Uploaded'}
                                                            </Text>
                                                        )}
                                                    </View>
                                                    <TextInput
                                                        style={[styles.textInput, { borderColor: doc.is_rejected ? ColorCode.red : doc.is_verified ? ColorCode.primary : '#ABC32F' }]}
                                                        placeholder={`Enter ${doc.name}`}
                                                        value={doc.image1}
                                                        maxLength={9}
                                                        editable={doc.reupload || doc.is_rejected || !doc.uploaded}
                                                        onChangeText={t => {
                                                            const d = [...documents];
                                                            d[index].image1 = t;
                                                            setDocuments(d);
                                                        }}
                                                    />
                                                </View>
                                            );
                                        } else {
                                            return (
                                                <UploadCard
                                                    key={doc.key}
                                                    title={doc.name}
                                                    onPress={() => handleUpload(index)}
                                                    hasDocument={!!doc.image1}
                                                    documentUrl={doc.image1}
                                                    docKey={doc.key}
                                                    isRequired={doc.isRequired}
                                                    selectedForUpload={doc.selectedForUpload}
                                                />
                                            );
                                        }
                                    })}
                                </View>
                            )}
                        </ScrollView>

                        {(hasSelectedDocuments || !isAllUploaded || isAnyReupload || isAnyRejected) && keyboardHeight === 0 && (
                            <CustomButton
                                btnText="Submit"
                                colors={[ColorCode.primary, ColorCode.primary]}
                                enable={true}
                                btnStyle={styles.submitBtn}
                                btnTextStyle={styles.submitBtnText}
                                onPress={uploadAllDocs}
                            />
                        )}
                    </View>
                </CustomSAView>

                <Modal visible={showSelImgPopup} transparent={false} onRequestClose={() => setShowSelImgPopup(false)}>
                    <View style={{ flex: 1, backgroundColor: ColorCode.white }}>
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
                                    alignItems: 'center',
                                }}>
                                <Ionicons name="close" size={8 * width} color={ColorCode.black} />
                            </TouchableOpacity>
                            <Text style={{ flex: 1, textAlign: 'center', fontSize: 4 * width, fontFamily: Fonts.SemiBold, color: '#000', marginRight: 10 * width }}>
                                View Image
                            </Text>
                        </View>

                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <FastImage
                                source={{ uri: selImg }}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                </Modal>

                <Modal visible={showSelPdfPopup} transparent={false} onRequestClose={() => setShowSelPdfPopup(false)}>
                    <View style={{ flex: 1, backgroundColor: ColorCode.white }}>
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
                                    alignItems: 'center',
                                }}>
                                <Ionicons name="close" size={8 * width} color={ColorCode.black} />
                            </TouchableOpacity>
                            <Text style={{ flex: 1, textAlign: 'center', fontSize: 4 * width, fontFamily: Fonts.SemiBold, color: '#000', marginRight: 10 * width }}>
                                View PDF
                            </Text>
                        </View>

                        <View style={{ flex: 1, width: '100%' }}>
                            <Pdf
                                trustAllCerts={false}
                                scrollEnabled={true}
                                source={{ uri: selPdf, cache: false }}
                                style={{ flex: 1, width: '100%' }}
                            />
                        </View>
                    </View>
                </Modal>
                <Custom_ImagePicker
                    visibility={showPicker}
                    setVisibility={setShowPicker}
                    limit={1}
                    enableDocumentPicker={true}
                    selectedImagePath={path => {
                        console.log('📎 Selected file path:', path);
                        const d = [...documents];
                        const doc = d[docType];
                        if (!doc) {
                            ToastUtility.showToast('Document not found');
                            setShowPicker(false);
                            return;
                        }
                        doc.image1 = path;
                        doc.localPath = path;
                        doc.selectedForUpload = true;
                        setDocuments(d);
                        setShowPicker(false);
                    }}
                />
                <CustomProgress show={showProgress} />
            </View>
        </Provider>
    );
};

export default DocumentScreenTablet;

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: ColorCode.white },
    saView: { flex: 1, backgroundColor: ColorCode.transarent },
    header: {
        width: '100%',
        height: 4.5 * height,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 6 * width,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backBtn: { width: 10 * width, height: 10 * width, justifyContent: 'center' },
    headerTitle: { fontSize: 3.5 * width, fontFamily: Fonts.SemiBold, color: '#000000' },
    content: { flex: 1, paddingHorizontal: 2.5 * width, paddingTop: 3 * width },
    pageTitle: { fontSize: 4 * width, fontFamily: Fonts.Bold, color: '#000' },
    pageSubtitle: { fontSize: 2.8 * width, fontFamily: Fonts.Regular, color: '#4A5568', marginTop: 1 * width },
    infoBox: {
        backgroundColor: ColorCode.primaryTrans,
        padding: 2.5 * width,
        borderRadius: 2 * width,
        marginTop: 3 * width,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2 * width,
    },
    infoText: { color: ColorCode.primary, fontSize: 2.5 * width, fontFamily: Fonts.Medium, flex: 1 },
    scrollContent: { paddingBottom: 5 * width },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 4 * width },
    uploadCard: {
        width: '31.5%',
        aspectRatio: 1,
        backgroundColor: ColorCode.white,
        borderWidth: 1.5,
        borderColor: ColorCode.primary,
        borderStyle: 'dashed',
        borderRadius: 3 * width,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 3 * width,
        padding: 1 * width,
        position: 'relative',
        overflow: 'hidden',
    },
    cardImageContainer: { width: '100%', height: '100%' },
    cardImage: { width: '100%', height: '100%', borderRadius: 2 * width },
    cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 2 * width, alignItems: 'center', justifyContent: 'center' },
    cardTitleOverlay: { color: ColorCode.white, fontSize: 2.2 * width, fontFamily: Fonts.SemiBold, textAlign: 'center', paddingHorizontal: 1 * width },
    cardEmptyContainer: { alignItems: 'center', justifyContent: 'center', gap: 2 * width },
    cardTitleText: { color: ColorCode.textBlack, fontSize: 2.2 * width, fontFamily: Fonts.SemiBold, textAlign: 'center', paddingHorizontal: 1 * width },
    uploadText: { fontSize: 2.2 * width, color: ColorCode.textBlack, textAlign: 'center', fontFamily: Fonts.SemiBold },
    checkIcon: { position: 'absolute', top: 5, right: 5, width: 20, height: 20, borderRadius: 10, backgroundColor: ColorCode.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#fff' },
    clockIcon: { position: 'absolute', top: 5, right: 5, width: 20, height: 20, borderRadius: 10, backgroundColor: ColorCode.yellow, alignItems: 'center', justifyContent: 'center' },
    viewBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: ColorCode.primary, paddingHorizontal: 1.5 * width, paddingVertical: 0.5 * width, borderRadius: 1 * width, flexDirection: 'row', alignItems: 'center', gap: 1 },
    viewBadgeText: { color: ColorCode.white, fontSize: 1.8 * width, fontFamily: Fonts.SemiBold },
    textInputBox: { width: '100%', marginBottom: 4 * width },
    textInputHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 1.5 * width },
    inputLabel: { color: '#4A5568', fontSize: 2.8 * width, fontFamily: Fonts.Medium },
    statusBadgeText: { fontSize: 2.5 * width, fontFamily: Fonts.SemiBold },
    textInput: { width: '100%', height: 10 * width, borderWidth: 1, borderRadius: 2 * width, paddingHorizontal: 3 * width, fontSize: 3 * width, color: '#000' },
    submitBtn: { width: '100%', height: 10 * width, marginTop: 4 * width, marginBottom: 15 * width, borderRadius: 2 * width },
    submitBtnText: { fontFamily: Fonts.Bold, fontSize: 3.5 * width },
    centerBox: { height: 40 * height, alignItems: 'center', justifyContent: 'center' },
    statusText: { color: '#666', fontSize: 3 * width },
    modalFull: { flex: 1, backgroundColor: ColorCode.white, alignItems: 'center', justifyContent: 'center' },
    fullImage: { width: '90%', height: '70%' },
    modalActions: { flexDirection: 'row', gap: 5 * width, marginTop: 5 * width },
    modalActionBtn: { width: 14 * width, height: 14 * width, borderRadius: 7 * width, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
    modalPdfContainer: { flex: 1, backgroundColor: ColorCode.white },
    pdfHeader: { height: 10 * height, justifyContent: 'center', paddingHorizontal: 4 * width },
    closePdfBtn: { alignSelf: 'flex-end' },
    pdfView: { flex: 1, width: '100%' },
    downloadPdfBtn: { position: 'absolute', right: 5 * width, bottom: 5 * width, backgroundColor: '#0002', padding: 2 * width, borderRadius: 10 * width },
});
