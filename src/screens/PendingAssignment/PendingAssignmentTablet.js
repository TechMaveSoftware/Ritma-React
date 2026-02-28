import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView,
    ActivityIndicator,
    Dimensions,
    Linking,
    Platform,
    Image,
    Share,
} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-native-paper';
import CustomProgress from '../../compenents/CustomProgress';
import CustomStatus from '../../compenents/CustomStatus';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import height from '../../Units/height';
// import width from '../../Units/width';
import Fonts from '../../utility/Fonts';
import ApiMethod from '../../api/ApiMethod';
import ConstData from '../../utility/ConstData';
import ToastUtility from '../../utility/ToastUtility';
import ColorCode from '../../utility/ColorCode';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import CustomHeader from '../../compenents/CustomHeader';
import LinearGradient from 'react-native-linear-gradient';
import CustomSAView from '../../compenents/CustomSAView';

const screenWidth = Dimensions.get('window').width;
const width = screenWidth > 420 ? 420 / 100 : screenWidth / 100;
const height = Dimensions.get('window').height / 100;

const PendingAssignmentTablet = ({ navigation, route }) => {
    const [courses, setCourses] = useState([]);
    const [classAssignments, setClassAssignments] = useState([]);
    const [selectedTab, setSelectedTab] = useState('Course');
    const [showProgress, setShowProgress] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const [docBasePath, setDocBasePath] = useState('https://techmavedev.com/ritma-edtech/storage/app/public/');

    useEffect(() => {
        if (selectedTab === 'Course') {
            getCourses();
        } else {
            getClassAssignments();
        }
    }, [selectedTab]);

    // Add focus listener to refresh data when returning to screen
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            // Refresh both tabs so Class stays updated after returning from upload
            getCourses();
            getClassAssignments();
        });

        return unsubscribe;
    }, [navigation]);

    const getCourses = () => {
        setShowProgress(true);

        ApiMethod.myCourses(
            pass => {
                setShowProgress(false);
                if (pass.status == 200) {
                    let temp = [];

                    if (Array.isArray(pass.data)) {
                        temp = pass.data;
                    } else if (pass.data && Array.isArray(pass.data.data)) {
                        temp = pass.data.data;
                    } else {
                        temp = [];
                    }

                    setCourses(temp);
                } else {
                    setCourses([]);
                    ToastUtility.showToast(pass.message || 'Failed to load courses');
                }
            },
            fail => {
                setShowProgress(false);
                setCourses([]);
                ToastUtility.showToast('Failed to load courses. Please try again.');
            },
        );
    };

    const getClassAssignments = () => {
        setShowProgress(true);
        ApiMethod.classAssignments(
            pass => {
                setShowProgress(false);
                if (pass.status == 200) {
                    setClassAssignments(pass.data || []);
                    if (pass.base_url) {
                        setDocBasePath(pass.base_url);
                    }
                } else {
                    setClassAssignments([]);
                    ToastUtility.showToast(pass.message || 'Failed to load class assignments');
                }
            },
            fail => {
                setShowProgress(false);
                setClassAssignments([]);
                ToastUtility.showToast('Failed to load class assignments.');
            },
        );
    };

    const handleCoursePress = (courseItem) => {
        const courseId = courseItem.course_id || courseItem.course?.id || courseItem.id;
        const courseName = courseItem.course?.course_name || courseItem.course_name || 'Course';

        if (courseId) {
            navigation.navigate('CourseAssignments', {
                course_id: courseId,
                course_name: courseName,
            });
        } else {
            ToastUtility.showToast('Course ID not found');
        }
    };

    const downloadDoc = doc => {
        setShowOverlay(true);
        const { config, fs, android } = ReactNativeBlobUtil;
        let t1 = doc.split('/');
        const fileName = t1[t1.length - 1];
        const cleanFileName = fileName.split('?')[0];

        // Determine mime type based on extension
        let mimeType = 'application/pdf';
        const lowerName = cleanFileName.toLowerCase();
        if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) {
            mimeType = 'image/jpeg';
        } else if (lowerName.endsWith('.png')) {
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

    const handleAssignmentPress = (item) => {
        if (item.submitted_assignment) {
            getUploadedAssignment(item.submitted_assignment.id);
        } else {
            navigation.navigate('UploadAssignment', {
                data: {
                    ...item,
                    chapter_name: item.title,
                    class_assignment_id: item.id,
                    assignment_source: 'class'
                }
            });
        }
    };

    const getUploadedAssignment = (id) => {
        setShowOverlay(true);
        ApiMethod.uploadedDocs(
            `id=${id}`,
            pass => {
                setShowOverlay(false);
                if (pass.status == 200 && pass.data.length > 0) {
                    navigation.navigate('viewUploadedDocs', {
                        baseUrl: pass.base_url,
                        uploadedDocs: pass.data,
                    });
                } else {
                    ToastUtility.showToast('No Documents Found.');
                }
            },
            fail => {
                setShowOverlay(false);
            },
        );
    };

    const renderLoading = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={ColorCode.primary} />
            <Text style={styles.loadingText}>Loading...</Text>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
                {selectedTab === 'Course' ? 'No courses available' : 'No class assignments found'}
            </Text>
        </View>
    );

    const AssignmentCard = ({ item, index }) => {
        const isUploaded = !!item.submitted_assignment;

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                        {item.title || `Assignment ${index + 1}`}
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
                        <Feather name="download" size={24} color={ColorCode.primary} />
                    </TouchableOpacity>
                </View>

                {isUploaded ? (
                    <View style={styles.uploadedContainer}>
                        <View style={styles.pdfIconContainer}>
                            <View style={styles.pdfIcon}>
                                <Image
                                    source={require('../../assets/images/folder.png')}
                                    style={styles.folderIcon}
                                    resizeMode="contain"
                                />
                            </View>
                        </View>
                        <View style={styles.uploadedContentContainer}>
                            <View style={styles.uploadedHeader}>
                                <Text style={styles.assignmentTitle}>Assignment</Text>
                                <TouchableOpacity
                                    style={styles.uploadedButton}
                                    onPress={() => getUploadedAssignment(item.submitted_assignment.id)}>
                                    <Text style={styles.uploadedButtonText}>Uploaded</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.progressBar} />
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.uploadContainer}
                        onPress={() => handleAssignmentPress(item)}>
                        <Text style={styles.uploadAssignmentText}>Assignment</Text>
                        <View style={styles.uploadButton}>
                            <Text style={styles.uploadText}>Upload</Text>
                            <Feather name="arrow-right" size={2 * width} color={ColorCode.primary} />
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <Provider>
            <View style={styles.mainContainer}>
                <CustomStatus trans={true} isDark={true} color="#FFFFFF00" />
                <CustomSAView parentStyple={{ flex: 1 }} style={styles.saView}>
                    {/* Standard Tablet Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backBtn}>
                            <Ionicons
                                name="chevron-back"
                                size={6 * width}
                                color={ColorCode.black}
                            />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>My Assignment</Text>
                        <View style={{ width: 10 * width }} />
                    </View>
                    <View style={{ width: '100%', height: 0.1 * height, backgroundColor: '#E5E5E5' }} />

                    <LinearGradient
                        colors={['#EBF7F8', '#EAF4F6', '#CCF0F7', '#CECBEA']}
                        style={{ flex: 1 }}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}>
                        {/* Tab Selection */}
                        <View style={styles.tabContainer}>
                            <TouchableOpacity
                                style={[styles.tabButton, selectedTab === 'Course' && styles.activeTab]}
                                onPress={() => setSelectedTab('Course')}>
                                <Text style={[styles.tabText, selectedTab === 'Course' && styles.activeTabText]}>Subjects</Text>
                                {selectedTab === 'Course' && <View style={styles.activeIndicator} />}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.tabButton, selectedTab === 'Class' && styles.activeTab]}
                                onPress={() => setSelectedTab('Class')}>
                                <Text style={[styles.tabText, selectedTab === 'Class' && styles.activeTabText]}>Class</Text>
                                {selectedTab === 'Class' && <View style={styles.activeIndicator} />}
                            </TouchableOpacity>
                        </View>

                        <View style={{ flex: 1 }}>
                            <View
                                style={{
                                    flex: 1,
                                    width: '100%',
                                    paddingTop: width * 2,
                                }}>
                                {showProgress && (selectedTab === 'Course' ? courses.length === 0 : classAssignments.length === 0) ? (
                                    renderLoading()
                                ) : (
                                    <ScrollView
                                        style={styles.scrollContainer}
                                        contentContainerStyle={{ paddingBottom: width * 10 }}>
                                        {selectedTab === 'Course' ? (
                                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                                                {courses.length > 0 ? (
                                                    courses.map((courseItem, index) => (
                                                        <TouchableOpacity
                                                            key={index}
                                                            style={[styles.courseButton, ConstData.ELEVATION_STYLE]}
                                                            onPress={() => handleCoursePress(courseItem)}>
                                                            <View style={styles.courseInfo}>
                                                                <Text style={styles.courseText} numberOfLines={2}>
                                                                    {courseItem.course?.course_name ||
                                                                        courseItem.course_name ||
                                                                        `Course ${index + 1}`}
                                                                </Text>
                                                                {courseItem.course?.description && (
                                                                    <Text style={styles.courseDescription} numberOfLines={2}>
                                                                        {courseItem.course.description}
                                                                    </Text>
                                                                )}
                                                            </View>
                                                            <MaterialIcons
                                                                name="arrow-forward-ios"
                                                                color={ColorCode.black}
                                                                size={4 * width}
                                                            />
                                                        </TouchableOpacity>
                                                    ))
                                                ) : (
                                                    renderEmptyState()
                                                )}
                                            </View>
                                        ) : (
                                            <View style={{ width: '100%' }}>
                                                {classAssignments.length > 0 ? (
                                                    classAssignments.map((item, index) => (
                                                        <AssignmentCard
                                                            key={`class-assignment-${item.id}`}
                                                            item={item}
                                                            index={index}
                                                        />
                                                    ))
                                                ) : (
                                                    renderEmptyState()
                                                )}
                                            </View>
                                        )}
                                    </ScrollView>
                                )}
                            </View>
                        </View>
                    </LinearGradient>
                </CustomSAView>
            </View>
            <CustomProgress show={showOverlay} />
        </Provider>
    );
};

export default PendingAssignmentTablet;

const styles = StyleSheet.create({
    scrollContainer: {
        width: '100%',
        paddingHorizontal: width * 3,
    },
    courseButton: {
        width: '48%', // 2-column grid
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: width * 2,
        padding: width * 3,
        marginBottom: width * 3,
        borderWidth: 1,
        borderColor: ColorCode.greyAAA,
    },
    courseInfo: {
        flex: 1,
        marginRight: width * 2,
    },
    courseText: {
        fontSize: width * 3.5,
        fontFamily: Fonts.SemiBold,
        color: '#000',
        marginBottom: width * 0.5,
    },
    courseDescription: {
        fontSize: width * 2.8,
        fontFamily: Fonts.Regular,
        color: '#666',
        marginTop: width * 0.5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: height * 10,
    },
    loadingText: {
        fontSize: width * 3,
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
        fontSize: width * 3.5,
        color: '#666',
        textAlign: 'center',
        fontFamily: Fonts.Regular,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        paddingHorizontal: width * 4,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tabButton: {
        flex: 1,
        paddingVertical: width * 3,
        alignItems: 'center',
        position: 'relative',
    },
    activeTab: {
        // backgroundColor: '#f0f0f0',
    },
    tabText: {
        fontSize: width * 4,
        fontFamily: Fonts.Medium,
        color: '#666',
    },
    activeTabText: {
        color: ColorCode.primary,
        fontFamily: Fonts.SemiBold,
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 0,
        width: '60%',
        height: 3,
        backgroundColor: ColorCode.primary,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
    },
    // Assignment Card styles
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
    folderIcon: {
        width: width * 8,
        height: width * 8,
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
        height: 6 * height,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 3 * width,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backBtn: {
        width: 8 * width,
        height: 8 * width,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 4 * width,
        fontFamily: Fonts.SemiBold,
        color: '#000000',
    },
});
