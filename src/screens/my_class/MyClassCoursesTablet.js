import React, { Fragment, useEffect, useState } from 'react';
import {
    StatusBar,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    Platform,
    Linking,
    ScrollView,
    SafeAreaView,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { Provider } from 'react-native-paper';
import ApiMethod from '../../api/ApiMethod';
// import width from '../../Units/width';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ColorCode from '../../utility/ColorCode';
import Fonts from '../../utility/Fonts';
import ConstData from '../../utility/ConstData';
import CustomStatus from '../../compenents/CustomStatus';
import ToastUtility from '../../utility/ToastUtility';
import CustomSAView from '../../compenents/CustomSAView';

const screenWidth = Dimensions.get('window').width;
const width = screenWidth > 420 ? 420 / 100 : screenWidth / 100;
const height = Dimensions.get('window').height / 100;

const MyClassCoursesTablet = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [classData, setClassData] = useState(null);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        fetchClassData();
    }, []);

    const fetchClassData = () => {
        setLoading(true);
        ApiMethod.myClass(
            response => {
                console.log('MyClass API Response:', response);
                if (response.status === 200 && response.data) {
                    setClassData(response.data);
                    if (response.data.courses && response.data.courses.length > 0) {
                        setCourses(response.data.courses);
                    } else {
                        setCourses([]);
                    }
                }
                setLoading(false);
            },
            error => {
                console.warn('MyClass API Error:', error);
                ToastUtility.showToast('Unable to load courses right now.');
                setLoading(false);
            },
        );
    };

    const handleCoursePress = course => {
        console.log(`Selected course: ${course.course.course_name}`);
        navigation.navigate('MyClass', { courseData: course });
    };

    const renderLoading = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={ColorCode.primary} />
            <Text style={styles.loadingText}>Loading courses...</Text>
        </View>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No courses available</Text>
        </View>
    );

    return (
        <Provider>
            <CustomStatus trans={true} isDark={true} color="#FFFFFF00" />
            <CustomSAView
                parentStyple={{ flex: 1, backgroundColor: ColorCode.transarent }}
                style={{ flex: 1, backgroundColor: '#EBF7F8' }}>
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
                            color={ColorCode.black}
                        />
                    </TouchableOpacity>
                    <Text
                        style={{
                            fontSize: 3.5 * width,
                            fontFamily: Fonts.SemiBold,
                            color: '#000000',
                        }}>
                        My Class
                    </Text>
                    <View style={{ width: 10 * width }} />
                </View>
                {/* <View
                    style={{
                        width: '100%',
                        height: 0.1 * height,
                        backgroundColor: '#E5E5E5',
                    }}
                /> */}

                <View style={[styles.header, { backgroundColor: '#EBF7F8' }]}>
                    <Text style={styles.headerTitle}>Explore Your Subjects</Text>
                    <Text style={styles.headerSubtitle}>
                        Access detailed schedules and info for each subject.
                    </Text>
                </View>

                {loading ? (
                    renderLoading()
                ) : (
                    <ScrollView
                        style={styles.coursesContainer}
                        contentContainerStyle={{ paddingBottom: width * 10 }}>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                            {courses.length > 0 ? (
                                courses.map((courseItem, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.courseButton, ConstData.ELEVATION_STYLE]}
                                        onPress={() => handleCoursePress(courseItem)}>
                                        <View style={styles.courseInfo}>
                                            <Text style={styles.courseText}>
                                                {courseItem.course.course_name}
                                            </Text>
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
                    </ScrollView>
                )}
            </CustomSAView>
        </Provider>
    );
};

export default MyClassCoursesTablet;

const styles = StyleSheet.create({
    header: {
        padding: width * 3,
    },
    headerTitle: {
        fontSize: width * 4.5,
        fontFamily: Fonts.Bold,
        color: '#000',
    },
    headerSubtitle: {
        fontSize: width * 3.2,
        color: '#666',
        marginTop: width * 1,
        fontFamily: Fonts.Regular,
    },
    coursesContainer: {
        padding: width * 3,
    },
    courseButton: {
        width: '48%', // Allow 2 items per row with spacing
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderRadius: width * 2, // Rounded corners
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
        marginBottom: width * 0.5,
    },
    courseType: {
        fontSize: width * 2.6,
        fontFamily: Fonts.Regular,
        color: ColorCode.primary,
        textTransform: 'capitalize',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        paddingVertical: width * 10,
    },
    emptyText: {
        fontSize: width * 3.4,
        color: '#666',
        textAlign: 'center',
        fontFamily: Fonts.Regular,
    },
});
