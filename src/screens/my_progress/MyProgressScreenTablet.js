import React, { Fragment, useEffect, useState } from 'react';
import {
    Image,
    ImageBackground,
    StatusBar,
    Text,
    TouchableOpacity,
    View,
    StyleSheet,
    FlatList,
    Modal,
    Platform,
    ScrollView,
    SafeAreaView,
    Dimensions,
    RefreshControl,
} from 'react-native';
import { Provider } from 'react-native-paper';
import ApiMethod from '../../api/ApiMethod';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import CustomProgress from '../../compenents/CustomProgress';
import CustomStatus from '../../compenents/CustomStatus';
import Fonts from '../../utility/Fonts';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import StorageUtility from '../../utility/StorageUtility';
import ToastUtility from '../../utility/ToastUtility';
import ColorCode from '../../utility/ColorCode';
import CustomSAView from '../../compenents/CustomSAView';
import Ionicons from 'react-native-vector-icons/Ionicons';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const width = screenWidth > 420 ? 420 / 100 : screenWidth / 100;
const height = screenHeight / 100;

const MyProgressScreenTablet = ({ navigation, route }) => {
    const [user, setUser] = useState(null);
    const [graphData, setGraphData] = useState([]);
    const [skillGraphData, setSkillkGraphData] = useState([]);
    const [showProgress, setShowProgress] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [googleGraphData, setGoogleGraphData] = useState([]);
    const [assignmentGraphData, setAssignmentGraphData] = useState([]);
    const [attendance, setAttendance] = useState(true);
    const [assignment, setAssignment] = useState(true);
    const [showSkillGraph, setShowSkillGraph] = useState(false);
    const [apiAssignmentData, setApiAssignmentData] = useState([]);

    // Safe route params handling
    const course_name = route?.params?.course_name || '';

    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [quizData, setQuizData] = useState(route?.params?.quiz || null);
    const gridGap = width;
    const assignmentMinChartWidth = 42 * width;
    const assignmentBarWidth = 10.764 * width;
    const assignmentBarSpacing = 3 * width;
    const assignmentPerPointWidth = assignmentBarWidth + assignmentBarSpacing;
    const assignmentChartWidth = Math.max(
        assignmentMinChartWidth,
        assignmentGraphData.length * assignmentPerPointWidth + 4 * width,
    );
    const skillMinChartWidth = 40 * width;
    const skillPerPointWidth = 18 * width;
    const skillChartWidth = Math.max(
        skillMinChartWidth,
        skillGraphData.length * skillPerPointWidth,
    );
    const gridAvailableHeight = Math.max(
        screenHeight - (6 * height) - (13.2 * width),
        72 * height,
    );
    const gridCardHeight = Math.max(
        ((gridAvailableHeight - gridGap) / 2),
        36 * height,
    );

    // Safe data preparation with fallback values
    const formatTwoDigits = n => n < 10 ? `0${n}` : `${n}`;

    // Initialize data array
    const [data, setData] = useState([
        {
            value: 0,
            color: '#FFD700',
            text: '00',
            name: 'Total Quizzes',
        },
        {
            value: 0,
            color: '#4CAF50',
            text: '00',
            name: 'Completed Quizzes',
        },
        {
            value: 0,
            color: '#F44336',
            text: '00',
            name: 'Pending Quizzes',
        },
    ]);

    const [chapterTestData, setChapterTestData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);

    useEffect(() => {
        try {
            getUserDetail();
            apiCall(selectedYear);
            fetchHomeData();
        } catch (error) {
            console.error('Error in useEffect:', error);
            setShowProgress(false);
        }
    }, [selectedYear]);

    const fetchHomeData = (isRefreshing = false) => {
        return new Promise(resolve => {
            ApiMethod.getHomeData(
                pass => {
                if (pass && pass.status === 200 && pass.quiz_assignment_count) {
                    const qd = pass.quiz_assignment_count;
                    setQuizData(qd);
                    const updatedData = [
                        {
                            value: Number(qd.total_assignment) || 0,
                            color: '#FFD700',
                            text: formatTwoDigits(Number(qd.total_assignment) || 0),
                            name: 'Total Quizzes',
                        },
                        {
                            value: Number(qd.submitted_assignment) || 0,
                            color: '#4CAF50',
                            text: formatTwoDigits(Number(qd.submitted_assignment) || 0),
                            name: 'Completed Quizzes',
                        },
                        {
                            value: Number(qd.pending_assignment) || 0,
                            color: '#F44336',
                            text: formatTwoDigits(Number(qd.pending_assignment) || 0),
                            name: 'Pending Quizzes',
                        },
                    ];
                    setData(updatedData);
                }
                    resolve();
                },
                fail => {
                    console.error('Failed to fetch home data:', fail);
                    resolve();
                }
            );
        });
    };

    const getUserDetail = async () => {
        try {
            const userData = await StorageUtility.getUser();
            setUser(userData);
        } catch (error) {
            console.error('Error getting user detail:', error);
            setUser(null);
        }
    };

    const capitalize = word => {
        if (!word || typeof word !== 'string') return '';
        return word.replace(word.charAt(0), word.charAt(0).toUpperCase());
    };

    const apiCall = (year, isRefreshing = false) => {
        return new Promise(resolve => {
            if (!year) {
                resolve();
                return;
            }
            if (!isRefreshing) {
                setShowProgress(true);
            }

            ApiMethod.myProgress(
                `year=${year}`,
                pass => {
                try {
                    if (!isRefreshing) {
                        setShowProgress(false);
                    }
                    if (pass && pass.status === 200) {
                        const attendanceData = pass.attendance || [];
                        const assignmentData = pass.assignment || [];
                        setApiAssignmentData(assignmentData);

                        const isAttendanceZero = attendanceData.every(item => item?.value === 0);
                        const isAssignmentZero = assignmentData.every(item => item?.value === 0);
                        setAttendance(!isAttendanceZero);
                        setAssignment(!isAssignmentZero);

                        // Assignment Percentage Graph Data
                        if (pass.grade?.assignment) {
                            const assignmentGraphData = pass.grade.assignment
                                .filter(item => item.assignment)
                                .map((item, index) => {
                                    const gradePercent = Number(item.grade_percent) || 0;
                                    return {
                                        value: gradePercent,
                                        frontColor: '#D69C37',
                                        gradientColor: '#D69C37',
                                        label: item.assignment?.syllabus?.chapter_name || 'Assignment',
                                        topLabelComponent: () => {
                                            return (
                                                <View style={{
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginBottom: 0.6 * width,
                                                    width: '100%',
                                                }}>
                                                    <Text
                                                        style={{
                                                            color: '#000000',
                                                            textAlign: 'center',
                                                            fontFamily: Fonts.SemiBold,
                                                            fontSize: 2.1 * width,
                                                        }}>
                                                        {String(gradePercent)}
                                                    </Text>
                                                </View>
                                            );
                                        },
                                    };
                                });
                            setAssignmentGraphData(assignmentGraphData);
                        } else {
                            setAssignmentGraphData([]);
                        }

                        // Monthly Attendance/Assignment Data
                        let monthlyGraphData = [];
                        const monthlyMaxLength = Math.max(assignmentData.length, attendanceData.length);

                        for (let index = 0; index < monthlyMaxLength; index++) {
                            const asmnt = assignmentData[index];
                            const attend = attendanceData[index];

                            if (attend) {
                                monthlyGraphData.push({
                                    value: Number(attend.value) || 0,
                                    frontColor: '#177AD5',
                                    gradientColor: '#177AD5',
                                    label: capitalize(attend.month || ''),
                                    spacing: 20,
                                });
                            }

                            if (asmnt) {
                                monthlyGraphData.push({
                                    value: Number(asmnt.value) || 0,
                                    frontColor: '#D69C37',
                                    gradientColor: '#D69C37',
                                    label: capitalize(asmnt.month || ''),
                                    spacing: 20,
                                });
                            }
                        }
                        setMonthlyData(monthlyGraphData);

                    } else {
                        setGraphData([]);
                        setAssignmentGraphData([]);
                        setMonthlyData([]);
                    }
                    getProfile(isRefreshing).finally(resolve);
                } catch (error) {
                    console.error('Error processing API response:', error);
                    if (!isRefreshing) {
                        setShowProgress(false);
                    }
                    setAssignmentGraphData([]);
                    setMonthlyData([]);
                    resolve();
                }
                },
                fail => {
                console.error('API Call failed:', fail);
                if (!isRefreshing) {
                    setShowProgress(false);
                }
                setAssignmentGraphData([]);
                setMonthlyData([]);
                    resolve();
                },
            );
        });
    };

    const getProfile = (isRefreshing = false) => {
        return new Promise(resolve => {
            if (!isRefreshing) {
                setShowProgress(true);
            }
            ApiMethod.getProfile(
                async pass => {
                try {
                    if (!isRefreshing) {
                        setShowProgress(false);
                    }
                    if (pass && pass.status === 200 && pass.data) {
                        const data = pass.data;
                        const skillValue = Number(data.skill) || 0;
                        const graph = [
                            {
                                value: skillValue,
                                frontColor: ColorCode.primary,
                                gradientColor: ColorCode.primary,
                                label: course_name || null,
                            },
                        ];
                        setShowSkillGraph(skillValue > 0);
                        setSkillkGraphData(graph);
                    } else {
                        setShowSkillGraph(false);
                        setSkillkGraphData([]);
                    }
                    resolve();
                } catch (error) {
                    if (!isRefreshing) {
                        setShowProgress(false);
                    }
                    setSkillkGraphData([]);
                    setShowSkillGraph(false);
                    resolve();
                }
                },
                fail => {
                setSkillkGraphData([]);
                if (!isRefreshing) {
                    setShowProgress(false);
                }
                setShowSkillGraph(false);
                    resolve();
                },
            );
        });
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                fetchHomeData(true),
                apiCall(selectedYear, true),
            ]);
        } catch (error) {
            console.error('Error during pull refresh:', error);
        } finally {
            setRefreshing(false);
        }
    };

    // Error boundary
    const SafeComponent = ({ children, fallback = null }) => {
        try {
            return children;
        } catch (error) {
            return fallback || <Text>Error loading component</Text>;
        }
    };

    return (
        <Provider>
            <View style={{ backgroundColor: 'white', flex: 1 }}>
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
                            My Progress
                        </Text>
                        <View style={{ width: 10 * width }} />
                    </View>

                    <ScrollView
                        style={{ flex: 1 }}
                        showsVerticalScrollIndicator={false}
                        nestedScrollEnabled
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[ColorCode.primary]}
                                tintColor={ColorCode.primary}
                            />
                        }
                        contentContainerStyle={styles.dashboardContent}>
                        <View style={[styles.gridWrap, { minHeight: gridAvailableHeight }]}>

                            {/* 1. Quiz Graph (Donut) - Left Column Row 1 */}
                            <View style={[styles.gridItem, { height: gridCardHeight, paddingBottom: width * 0.8 }]}>
                                <SafeComponent>
                                    <View
                                        style={styles.card}>
                                        <Text style={styles.cardTitle}>Quiz Graph</Text>

                                        <View style={styles.quizCardBody}>
                                            {/* Donut Chart */}
                                            <View style={styles.quizChartWrap}>
                                                <PieChart
                                                    data={data}
                                                    donut
                                                    radius={19.5 * width}
                                                    innerRadius={13.5 * width}
                                                    showText
                                                    textColor="#222"
                                                    textSize={11}
                                                    showValuesAsLabels
                                                    labelsPosition="onBorder"
                                                    textBackgroundColor="#fff"
                                                    textBackgroundRadius={14}
                                                    fontWeight="bold"
                                                    strokeColor="#fff"
                                                    strokeWidth={4}
                                                />
                                            </View>

                                            {/* Legend */}
                                            <View style={styles.legendWrap}>
                                                {data.map((d, idx) => (
                                                    <View key={idx} style={styles.legendRow}>
                                                        <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                                                        <Text style={styles.legendText}>{d.name}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                </SafeComponent>
                            </View>

                            {/* 2. Assignment Percentage Graph - Right Column Row 1 */}
                            <View style={[styles.gridItem, { height: gridCardHeight, paddingBottom: width * 0.8 }]}>
                                <SafeComponent>
                                    <View style={styles.card}>
                                        <Text style={styles.cardTitle}>Assignment Percentage Graph</Text>
                                        {assignmentGraphData.length > 0 ? (
                                            <View style={styles.chartArea}>
                                                <ScrollView
                                                    horizontal
                                                    showsHorizontalScrollIndicator={true}
                                                    nestedScrollEnabled
                                                    style={styles.chartHorizontalScroll}
                                                    contentContainerStyle={styles.chartScrollContent}
                                                >
                                                    <BarChart
                                                        width={assignmentChartWidth}
                                                        height={26 * height}
                                                        barWidth={assignmentBarWidth}
                                                        style={{ paddingTop: 3 * width, paddingBottom: 12 }}
                                                        data={assignmentGraphData}
                                                        rotateLabel={true}
                                                        labelsExtraHeight={9 * width}
                                                        showYAxisIndices
                                                        noOfSections={5}
                                                        maxValue={100}
                                                        hideRules
                                                        initialSpacing={1.5 * width}
                                                        endSpacing={2 * width}
                                                        spacing={assignmentBarSpacing}
                                                        xAxisType={'solid'}
                                                        xAxisColor={'#000'}
                                                        yAxisTextStyle={{ color: '#000', fontSize: 10 }}
                                                        xAxisLabelTextStyle={{ color: '#000', fontSize: 9 }}
                                                    />
                                                </ScrollView>
                                            </View>
                                        ) : (
                                            <View style={styles.emptyStateContainer}>
                                                <Text style={styles.noDataText}>No data available</Text>
                                            </View>
                                        )}
                                    </View>
                                </SafeComponent>
                            </View>

                            {/* 3. Monthly Attendance/Assignment Graph - Left Column Row 2 */}
                            <View style={[styles.gridItem, { height: gridCardHeight }]}>
                                <SafeComponent>
                                    <View style={styles.card}>
                                        <Text style={styles.cardTitle}>Monthly Activity</Text>
                                        {/* Header with arrows and year */}
                                        <View style={styles.chartHeader}>
                                            <TouchableOpacity onPress={() => {
                                                const newYear = selectedYear - 1;
                                                setSelectedYear(newYear);
                                                apiCall(newYear);
                                            }}>
                                                <SimpleLineIcons name="arrow-left" size={20} color="#222" />
                                            </TouchableOpacity>
                                            <Text style={styles.chartDateText}>{selectedYear}</Text>
                                            <TouchableOpacity onPress={() => {
                                                const newYear = selectedYear + 1;
                                                setSelectedYear(newYear);
                                                apiCall(newYear);
                                            }}>
                                                <SimpleLineIcons name="arrow-right" size={20} color="#222" />
                                            </TouchableOpacity>
                                        </View>

                                        {/* Legend */}
                                        <View style={styles.monthlyLegendWrap}>
                                            <View style={[styles.legendRow, { marginRight: 15 }]}>
                                                <View style={[styles.legendDot, { backgroundColor: '#177AD5' }]} />
                                                <Text style={styles.legendText}>Attendance</Text>
                                            </View>
                                            <View style={styles.legendRow}>
                                                <View style={[styles.legendDot, { backgroundColor: '#D69C37' }]} />
                                                <Text style={styles.legendText}>Assignments</Text>
                                            </View>
                                        </View>

                                        {monthlyData.length > 0 ? (
                                            <ScrollView
                                                horizontal
                                                showsHorizontalScrollIndicator={true}
                                                nestedScrollEnabled
                                                style={styles.chartHorizontalScroll}
                                                contentContainerStyle={styles.chartScrollContent}
                                            >
                                                <BarChart
                                                    data={monthlyData}
                                                    height={24 * height}
                                                    barWidth={1.5 * width}
                                                    style={{ paddingTop: 10 }}
                                                    initialSpacing={4}
                                                    endSpacing={4}
                                                    spacing={2 * width}
                                                    barBorderRadius={2}
                                                    hideRules
                                                    yAxisThickness={0}
                                                    xAxisThickness={0}
                                                    labelWidth={4 * width}
                                                    yAxisTextStyle={{ color: '#000', fontSize: 9 }}
                                                    xAxisLabelTextStyle={{ color: '#000', fontSize: 8 }}
                                                    maxValue={Math.max(...monthlyData.map(item => item.value), 1.1)}
                                                    noOfSections={5}
                                                />
                                            </ScrollView>
                                        ) : (
                                            <Text style={styles.noDataText}>No monthly data available</Text>
                                        )}
                                    </View>
                                </SafeComponent>
                            </View>

                            {/* 4. Skills Graph - Right Column Row 2 */}
                            <View style={[styles.gridItem, { height: gridCardHeight }]}>
                                <SafeComponent>
                                    <View style={styles.card}>
                                        <Text style={styles.cardTitle}>Skill Graph</Text>
                                        {showSkillGraph ? (
                                            <View style={styles.skillChartArea}>
                                                {skillGraphData.length > 0 && (
                                                    <ScrollView
                                                        horizontal
                                                        showsHorizontalScrollIndicator={true}
                                                        nestedScrollEnabled
                                                        style={styles.chartHorizontalScroll}
                                                        contentContainerStyle={styles.chartScrollContent}
                                                    >
                                                        <BarChart
                                                            width={skillChartWidth}
                                                            height={24 * height}
                                                            barWidth={10 * width}
                                                            style={{ paddingTop: width }}
                                                            data={skillGraphData}
                                                            showYAxisIndices
                                                            xAxisLabelTexts={[course_name || 'Subject']}
                                                            noOfSections={4}
                                                            maxValue={100}
                                                            hideRules
                                                            yAxisThickness={1}
                                                            xAxisThickness={1}
                                                            initialSpacing={10 * width}
                                                            xAxisType={'solid'}
                                                            xAxisColor={'#000'}
                                                            yAxisColor={'#000'}
                                                            yAxisTextStyle={{ color: '#000', fontSize: 10 }}
                                                            xAxisLabelTextStyle={{ color: '#000', fontSize: 10 }}
                                                        />
                                                    </ScrollView>
                                                )}
                                            </View>
                                        ) : (
                                            <View style={styles.emptyStateContainer}>
                                                <Text style={styles.noDataText}>No Skill Data Found</Text>
                                            </View>
                                        )}
                                    </View>
                                </SafeComponent>
                            </View>

                        </View>
                        <View style={{ height: gridGap * 1.5 }} />
                    </ScrollView>
                </CustomSAView>
            </View>
            <CustomProgress show={showProgress} />
        </Provider>
    );
};

const styles = StyleSheet.create({
    dashboardContent: {
        flexGrow: 1,
        paddingHorizontal: 1.4 * width,
        paddingTop: width,
        paddingBottom: 0,
    },
    gridWrap: {
        flexGrow: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignContent: 'space-between',
    },
    gridItem: {
        width: '49.2%',
        marginBottom: width,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        height: '100%',
        paddingVertical: width * 2,
        paddingHorizontal: width * 2.2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        minHeight: 0,
    },
    cardTitle: {
        fontFamily: Fonts.SemiBold,
        fontSize: 2.8 * width, // Tablet scaled
        color: '#222',
        textAlign: 'center',
        marginBottom: 1.6 * width,
    },
    quizCardBody: {
        flex: 1,
    },
    quizChartWrap: {
        flex: 0.7,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 0,
        marginBottom: 0,
    },
    legendWrap: {
        flex: 0.3,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: width * 1.4,
        marginTop: 0,
        justifyContent: 'center',
    },
    chartArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        overflow: 'visible',
    },
    skillChartArea: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        overflow: 'visible',
    },
    chartHorizontalScroll: {
        width: '100%',
    },
    chartScrollContent: {
        minWidth: '100%',
        paddingLeft: 1.4 * width,
        paddingRight: 1.4 * width,
        paddingBottom: width * 1.2,
        alignItems: 'flex-end',
    },
    monthlyLegendWrap: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: width,
    },
    chartHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: width,
        paddingHorizontal: width,
    },
    chartDateText: {
        fontFamily: Fonts.SemiBold,
        fontSize: 2.5 * width,
        color: '#222',
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    legendText: {
        fontSize: 2.2 * width,
        color: '#333',
        fontFamily: Fonts.Medium,
    },
    noDataText: {
        color: '#666',
        fontSize: 2.2 * width,
        textAlign: 'center',
        fontFamily: Fonts.Medium,
    },
    emptyStateContainer: {
        minHeight: 20 * height,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MyProgressScreenTablet;
