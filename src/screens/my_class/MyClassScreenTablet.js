import moment from 'moment';
import React, { Fragment, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Provider } from 'react-native-paper';
import ApiMethod from '../../api/ApiMethod';
import CustomProgress from '../../compenents/CustomProgress';
import CustomStatus from '../../compenents/CustomStatus';
import Fonts from '../../utility/Fonts';
import StorageUtility from '../../utility/StorageUtility';
import CustomHeader from '../../compenents/CustomHeader';

const screenWidth = Dimensions.get('window').width;
const width = screenWidth > 420 ? 420 / 100 : screenWidth / 100;
const height = Dimensions.get('window').height / 100;

const MyClassScreenTablet = ({ navigation, route }) => {
    const [userData, setUser] = useState(null);
    const [classData, setClassData] = useState(null);
    const [showProgress, setShowProgress] = useState(false);
    const [courseData, setCourseData] = useState(null);

    // Get course data from navigation params
    const selectedCourse = route.params?.courseData;

    useEffect(() => {
        getUserDetail();
        getMyClass();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            console.log('Selected Course Data from Params:', selectedCourse);
            setCourseData(selectedCourse);
        }
    }, [selectedCourse]);

    const getUserDetail = async () => {
        var uu = await StorageUtility.getUser();
        console.log(uu);
        setUser(uu);
    };

    const getMyClass = () => {
        setShowProgress(true);
        ApiMethod.myClass(
            pass => {
                setShowProgress(false);
                console.log('My Class Data Full Response:', pass);
                console.log('My Class Data Data field:', pass.data);
                if (pass.data?.teachers) {
                    console.log('Teachers Array:', pass.data.teachers);
                    if (pass.data.teachers.length > 0) {
                        console.log('First Teacher Object:', pass.data.teachers[0]);
                        console.log('Teacher details inside first object:', pass.data.teachers[0].teacher);
                    }
                }
                if (pass.status == 200) {
                    setClassData(pass.data);
                }
            },
            fail => {
                setShowProgress(false);
            },
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return moment(dateString).format('Do MMMM YYYY');
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'N/A';
        return moment(timeString, 'HH:mm:ss').format('h:mm A');
    };

    return (
        <Provider>
            <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                <CustomStatus trans={true} isDark={true} color="#FFFFFF00" />
                <CustomHeader
                    text={'Subject Details'}
                    customStyle={{ marginTop: -5, paddingVertical: 5 }}
                    titleStyle={{ fontSize: 3.5 * width, fontFamily: Fonts.SemiBold }}
                />
                <View style={{ flex: 1, backgroundColor: '#EBF7F8' }}>
                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={true}
                        bounces={true}
                        keyboardShouldPersistTaps="handled">
                        <View style={styles.headerContainer}>
                            <Text style={styles.headerText}>Subject Overview</Text>
                        </View>

                        <View style={styles.card}>
                            <View style={styles.section}>
                                <Text style={styles.label}>Class Name</Text>
                                <Text style={styles.value}>
                                    {classData?.name || 'N/A'}
                                </Text>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.section}>
                                <Text style={styles.label}>Subject</Text>
                                <Text style={styles.value}>
                                    {courseData?.course?.course_name || 'N/A'}
                                </Text>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.section}>
                                <Text style={styles.label}>Number of Weeks</Text>
                                <Text style={styles.value}>
                                    {courseData?.course?.week ? `${courseData.course.week} Weeks` : 'N/A'}
                                </Text>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.section}>
                                <Text style={styles.label}>Teacher</Text>
                                <Text style={styles.value}>
                                    {courseData?.teacher ||
                                        (classData?.teachers && classData.teachers.length > 0
                                            ? classData.teachers[0].teacher.name
                                            : 'N/A')}
                                </Text>
                            </View>

                            <View style={styles.divider} />
                            {/* 
                            <View style={styles.section}>
                                <Text style={styles.label}>Assistant</Text>
                                <Text style={styles.value}>
                                    {classData?.assistant || 'N/A'}
                                </Text>
                            </View> */}

                            <View style={styles.divider} />

                            <View style={styles.dateTimeSection}>
                                <View style={styles.dateTimeColumn}>
                                    <Text style={styles.label}>Start Date</Text>
                                    <Text style={styles.value}>
                                        {formatDate(classData?.start_date)}
                                    </Text>
                                </View>
                                <View style={styles.dateTimeColumn}>
                                    <Text style={styles.label}>Start Time</Text>
                                    <Text style={styles.value}>
                                        {formatTime(classData?.start_time)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.dateTimeSection}>
                                <View style={styles.dateTimeColumn}>
                                    <Text style={styles.label}>End Date</Text>
                                    <Text style={styles.value}>
                                        {formatDate(classData?.end_date)}
                                    </Text>
                                </View>
                                <View style={styles.dateTimeColumn}>
                                    <Text style={styles.label}>End Time</Text>
                                    <Text style={styles.value}>
                                        {formatTime(classData?.end_time)}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.section}>
                                <Text style={styles.label}>Total Hours</Text>
                                <Text style={styles.value}>
                                    {classData?.total_hours ? `${classData.total_hours} Hours` : 'N/A'}
                                </Text>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
            <CustomProgress show={showProgress} />
        </Provider>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: height * 4,
    },
    container: {
        alignSelf: 'flex-end',
        marginHorizontal: width * 3,
        marginBottom: height * 6,
        width: width * 28,
    },
    pickerContainer: {
        marginTop: 8,
    },
    selectedPickerOption: {
        fontSize: 12,
        color: '#000',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#aaa',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        maxHeight: '80%',
    },
    pickerOption: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#aaa',
    },
    pickerOptionText: {
        fontSize: 12,
        color: '#000',
    },
    mainContainer: {
        width: '90%',
        paddingHorizontal: 4 * width,
        backgroundColor: '#FFFFFF',
        paddingVertical: 0.4 * height,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 1 * width,
        marginTop: 1 * height,
    },
    nameContainer: {
        width: '96%',
        paddingHorizontal: 4 * width,
        paddingVertical: 0.4 * height,
        marginTop: 1 * height,
    },
    nameTxt: {
        color: '#000000',
        fontSize: 4 * width,
        fontFamily: Fonts.Medium,
    },
    nameTxtHead: {
        color: '#868686',
        fontSize: 3.4 * width,
        fontFamily: Fonts.Medium,
    },
    headerContainer: {
        paddingHorizontal: width * 4,
        paddingVertical: width * 2,
    },
    headerText: {
        fontSize: 5 * width,
        fontWeight: 'bold',
        color: '#000',
    },
    card: {
        backgroundColor: '#fff',
        marginHorizontal: width * 4,
        marginVertical: width * 2,
        borderRadius: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    section: {
        padding: width * 4,
    },
    dateTimeSection: {
        flexDirection: 'row',
    },
    dateTimeColumn: {
        flex: 1,
        padding: width * 4,
    },
    label: {
        fontSize: width * 3.6,
        color: '#4F5597',
        marginBottom: width * 1,
        fontWeight: '600',
    },
    value: {
        fontSize: width * 3.6,
        color: '#333',
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
    },
});

export default MyClassScreenTablet;
