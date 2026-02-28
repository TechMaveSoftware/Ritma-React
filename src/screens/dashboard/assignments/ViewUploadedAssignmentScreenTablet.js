import React, { Fragment, useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    Modal,
    Platform,
    Pressable,
    Text,
    TouchableOpacity,
    View,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-native-paper';
import CustomStatus from '../../../compenents/CustomStatus';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ImageView from '../../../compenents/ImageView';
const { width: screenWidth } = Dimensions.get('window');
const width = (screenWidth > 420 ? 420 : screenWidth) * 0.01;
import Fonts from '../../../utility/Fonts';
import height from '../../../Units/height';
import ApiMethod from '../../../api/ApiMethod';
import CustomProgress from '../../../compenents/CustomProgress';
import moment from 'moment';
import FastImage from 'react-native-fast-image';
import Pdf from 'react-native-pdf';
import ColorCode from '../../../utility/ColorCode';
import ConstData from '../../../utility/ConstData';
import ToastUtility from '../../../utility/ToastUtility';

const ViewUploadedAssignmentScreenTablet = ({ navigation, route }) => {
    const [viewDocModal, setViewDocModal] = useState(false);
    const [uploadedDocs, setUploadedDocs] = useState(route.params?.uploadedDocs || []);
    const [baseUrl, setBaseUrl] = useState(route.params?.baseUrl || '');
    const [singleImg, setSingleImg] = useState('');
    const [showPdfModal, setShowPdfModal] = useState(false);
    const [selectedPdfUrl, setSelectedPdfUrl] = useState('');
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfError, setPdfError] = useState(false);

    useEffect(() => {
        if (!uploadedDocs || uploadedDocs.length === 0) {
            ToastUtility.showToast('No documents found');
        }
    }, []);

    return (
        <Provider>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                <CustomStatus trans={true} isDark={true} color="#FFFFFF00" />
                {/* Standard Tablet Header */}
                <View
                    style={{
                        width: '100%',
                        height: 6 * height,
                        backgroundColor: '#FFFFFF',
                        paddingHorizontal: 3 * width,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottomWidth: 1,
                        borderBottomColor: '#E2E8F0',
                    }}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{
                            width: 8 * width,
                            height: 8 * width,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        <Ionicons
                            name="chevron-back"
                            size={6 * width}
                            color={'#000'}
                        />
                    </TouchableOpacity>
                    <Text
                        style={{
                            fontSize: 3.5 * width,
                            fontFamily: Fonts.SemiBold,
                            color: '#000000',
                        }}>
                        {'Uploaded Assignments'}
                    </Text>
                    <View style={{ width: 10 * width }} />
                </View>

                <View style={{ flex: 1, backgroundColor: ColorCode.white }}>
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
                                numColumns={3}
                                style={{ width: '100%' }}
                                keyExtractor={(item, index) => `doc-${item.id || item.document || index}`}
                                contentContainerStyle={{
                                    paddingVertical: width * 3,
                                    paddingHorizontal: width * 2.5,
                                    paddingBottom: height * 10,
                                }}
                                columnWrapperStyle={{
                                    justifyContent: 'flex-start',
                                    gap: width * 2.5,
                                }}
                                renderItem={({ item, index }) => {
                                    const documentPath = item.document || item.document_file || item.file || item.path || '';

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

                                    return (
                                        <View
                                            style={{
                                                width: width * 30,
                                                aspectRatio: 1.2,
                                                borderRadius: width * 2,
                                                marginBottom: width * 4,
                                                borderColor: '#E2E8F0',
                                                borderWidth: 1.5,
                                                overflow: 'hidden',
                                                backgroundColor: ColorCode.white,
                                                elevation: 2,
                                                shadowColor: '#000',
                                                shadowOffset: { width: 0, height: 2 },
                                                shadowOpacity: 0.1,
                                                shadowRadius: 3,
                                            }}>
                                            <TouchableOpacity
                                                style={{ width: '100%', height: '100%' }}
                                                onPress={async () => {
                                                    const documentPath = item.document || item.document_file || item.file || item.path || '';

                                                    let fullUrl = '';
                                                    if (baseUrl && documentPath) {
                                                        const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
                                                        const cleanPath = (documentPath || '').replace(/^\/+/, '');
                                                        fullUrl = `${cleanBaseUrl}/${cleanPath}`;
                                                    } else if (documentPath) {
                                                        fullUrl = documentPath;
                                                    }

                                                    fullUrl = fullUrl.replace(/([^:]\/)\/+/g, '$1');

                                                    if (fullUrl && !fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
                                                        fullUrl = `https://${fullUrl}`;
                                                    }

                                                    const pathLower = typeof documentPath === 'string' ? documentPath.toLowerCase().trim() : '';
                                                    const urlWithoutQuery = fullUrl.split('?')[0].split('#')[0];
                                                    const urlLower = urlWithoutQuery.toLowerCase();

                                                    const getFileExtension = (path) => {
                                                        if (!path || typeof path !== 'string') return '';
                                                        const match = path.match(/\.([a-z0-9]+)$/i);
                                                        return match ? match[1].toLowerCase() : '';
                                                    };

                                                    const pathExtension = getFileExtension(pathLower);
                                                    const urlExtension = getFileExtension(urlLower);
                                                    const fileExtension = pathExtension || urlExtension;

                                                    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'heic', 'svg'];
                                                    const pdfExtensions = ['pdf'];

                                                    const isImageFile = imageExtensions.includes(fileExtension);
                                                    const isPdfFile = pdfExtensions.includes(fileExtension);

                                                    if (isImageFile) {
                                                        setSingleImg(fullUrl);
                                                        setViewDocModal(!viewDocModal);
                                                        return;
                                                    }

                                                    if (isPdfFile) {
                                                        setPdfError(false);
                                                        setPdfLoading(true);
                                                        setSelectedPdfUrl(fullUrl);
                                                        setShowPdfModal(true);
                                                        return;
                                                    }

                                                    const documentType = item.type || item.file_type || null;
                                                    if (documentType !== null && documentType !== undefined) {
                                                        const clickedIsPdf = documentType === 1 || documentType === '1';
                                                        if (clickedIsPdf) {
                                                            setPdfError(false);
                                                            setPdfLoading(true);
                                                            setSelectedPdfUrl(fullUrl);
                                                            setShowPdfModal(true);
                                                            return;
                                                        }
                                                    }

                                                    setSingleImg(fullUrl);
                                                    setViewDocModal(!viewDocModal);
                                                }}>
                                                {isPdf ? (
                                                    <View style={{ flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' }}>
                                                        <Image
                                                            source={require('../../../assets/images/pdf.png')}
                                                            style={{
                                                                width: '60%',
                                                                height: '60%',
                                                            }}
                                                            resizeMode="contain"
                                                        />
                                                        <Text style={{
                                                            marginTop: width * 2,
                                                            fontSize: width * 2.5,
                                                            fontFamily: Fonts.Medium,
                                                            color: '#64748B'
                                                        }}>PDF Document</Text>
                                                    </View>
                                                ) : thumbnailUrl ? (
                                                    <FastImage
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                        }}
                                                        resizeMode={FastImage.resizeMode.cover}
                                                        source={{ uri: thumbnailUrl }}
                                                        defaultSource={require('../../../assets/images/pdf.png')}
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
                                                            backgroundColor: 'rgba(0, 138, 61, 0.4)',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}>
                                                        <Text
                                                            style={{
                                                                color: '#FFFFFF',
                                                                fontFamily: Fonts.SemiBold,
                                                                fontSize: 3 * width,
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
                                    fontSize: width * 3,
                                    color: '#94A3B8',
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
                        backgroundColor: 'rgba(0,0,0,0.85)',
                    }}>
                    <View
                        style={{
                            width: width * 85,
                            height: height * 70,
                            backgroundColor: '#ffffff',
                            borderRadius: width * 2,
                            padding: width * 2,
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
                                top: -width * 4,
                                right: -width * 4,
                                alignItems: 'center',
                                justifyContent: 'center',
                                elevation: 5,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.25,
                                shadowRadius: 3.84,
                            }}>
                            <Ionicons name="close" size={width * 6} color="#000000" />
                        </TouchableOpacity>

                        <View
                            style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: width * 1.5,
                                overflow: 'hidden'
                            }}>
                            <FastImage
                                style={{
                                    width: '100%',
                                    height: '100%',
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
                                        fontSize: width * 3.5,
                                        fontFamily: Fonts.SemiBold,
                                        color: ColorCode.black,
                                        textAlign: 'center',
                                        marginBottom: width * 2,
                                    }}>
                                    Unable to load PDF
                                </Text>
                                <Text
                                    style={{
                                        fontSize: width * 2.8,
                                        fontFamily: Fonts.Regular,
                                        color: '#64748B',
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
                                        paddingHorizontal: width * 8,
                                        backgroundColor: ColorCode.primary,
                                        borderRadius: width * 1.5,
                                    }}>
                                    <Text
                                        style={{
                                            fontSize: width * 3,
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
                                    setPdfLoading(false);
                                    setPdfError(false);
                                }}
                                onPageChanged={(page, numberOfPages) => {
                                    if (page >= 1) {
                                        setPdfLoading(false);
                                    }
                                }}
                                onLoadProgress={(percent) => {
                                    if (percent >= 100) {
                                        setTimeout(() => {
                                            setPdfLoading(false);
                                        }, 100);
                                    }
                                }}
                                onError={error => {
                                    setPdfLoading(false);
                                    setPdfError(true);
                                    ToastUtility.showToast('Unable to load PDF document.');
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
                                    width: 8 * width,
                                    height: 8 * width,
                                    borderRadius: 4 * width,
                                    backgroundColor: '#FFF',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    position: 'absolute',
                                    right: 3 * width,
                                    top: Platform.OS === 'ios' ? 4 * width : 2 * width,
                                    zIndex: 20,
                                    elevation: 4,
                                },
                                ConstData.ELEVATION_STYLE,
                            ]}>
                            <Ionicons name="close" size={6 * width} color={ColorCode.red} />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>
        </Provider>
    );
};

export default ViewUploadedAssignmentScreenTablet;
