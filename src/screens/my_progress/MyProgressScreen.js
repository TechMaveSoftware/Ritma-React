import React, { Fragment, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Provider, Surface } from 'react-native-paper';
import ApiMethod from '../../api/ApiMethod';
import CustomButton from '../../compenents/CustomButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import CustomProgress from '../../compenents/CustomProgress';
import CustomStatus from '../../compenents/CustomStatus';
import ImageView from '../../compenents/ImageView';
import height from '../../Units/height';
import width from '../../Units/width';
import Fonts from '../../utility/Fonts';
import { BarChart, LineChart, PieChart } from 'react-native-gifted-charts';
import StorageUtility from '../../utility/StorageUtility';
import ToastUtility from '../../utility/ToastUtility';
import { Dropdown } from 'react-native-element-dropdown';
import VerticalText from '../../compenents/VerticalText';
import ColorCode from '../../utility/ColorCode';
import CustomHeader from '../../compenents/CustomHeader';

const MyProgressScreen = ({ navigation, route }) => {
  const [user, setUser] = useState(null);
  const [graphData, setGraphData] = useState([]);
  const [skillGraphData, setSkillkGraphData] = useState([]);
  const [showProgress, setShowProgress] = useState(false);
  const [googleGraphData, setGoogleGraphData] = useState([]);
  const [assignmentGraphData, setAssignmentGraphData] = useState([]);
  const [attendance, setAttendance] = useState(true);
  const [assignment, setAssignment] = useState(true);
  const [showSkillGraph, setShowSkillGraph] = useState(false);
  const [visible, setVisible] = useState(null);
  const [apiAssignmentData, setApiAssignmentData] = useState([]);

  // Safe route params handling
  const course_name = route?.params?.course_name || '';
  const quiz = route?.params?.quiz || {
    total_assignment: 0,
    submitted_assignment: 0,
    pending_assignment: 0,
  };

  const googleGraphLable = ['', '', 'F', 'D', 'C', 'B', 'A'];

  // Year filter - show current year and previous 2 years
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, index) => ({
    label: `${currentYear - index}`,
    value: currentYear - index,
  }));

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [quizData, setQuizData] = useState(route?.params?.quiz || null);

  // Safe data preparation with fallback values
  const formatTwoDigits = n => n < 10 ? `0${n}` : `${n}`;

  // Initialize data array - will be updated with API data
  const [data, setData] = useState([
    {
      value: 0,
      color: '#FFD700', // Yellow color for total quizzes
      text: '00',
      name: 'Total Quizzes',
    },
    {
      value: 0,
      color: '#4CAF50', // Green color for completed quizzes
      text: '00',
      name: 'Completed Quizzes',
    },
    {
      value: 0,
      color: '#F44336', // Red color for pending quizzes
      text: '00',
      name: 'Pending Quizzes',
    },
  ]);

  // Chapter test data for Assignment Percentage Graph
  const [chapterTestData, setChapterTestData] = useState([]);

  // Monthly attendance and assignment data
  const [monthlyData, setMonthlyData] = useState([]);

  const handleYearChange = year => {
    try {
      console.log('Year changed to:', year?.value);
      if (year?.value) {
        setSelectedYear(year.value);
        apiCall(year.value);
      }
    } catch (error) {
      console.error('Error in handleYearChange:', error);
    }
  };

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

  const fetchHomeData = () => {
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
      },
      fail => {
        console.error('Failed to fetch home data:', fail);
      }
    );
  };

  const getUserDetail = async () => {
    try {
      const userData = await StorageUtility.getUser();
      console.log('User data:', userData);
      setUser(userData);
    } catch (error) {
      console.error('Error getting user detail:', error);
      setUser(null);
    }
  };

  const apiCall = year => {
    if (!year) return;

    setShowProgress(true);

    ApiMethod.myProgress(
      `year=${year}`,
      pass => {
        try {
          setShowProgress(false);
          console.log('API Response:', pass);

          if (pass && pass.status === 200) {
            // Safely handle attendance and assignment data
            const attendanceData = pass.attendance || [];
            const assignmentData = pass.assignment || [];

            // Store assignment data for later use
            setApiAssignmentData(assignmentData);

            const isAttendanceZero = attendanceData.every(
              item => item?.value === 0,
            );
            const isAssignmentZero = assignmentData.every(
              item => item?.value === 0,
            );

            setAttendance(!isAttendanceZero);
            setAssignment(!isAssignmentZero);

            // Build graph data safely
            let graph = [];
            const graphMaxLength = Math.max(
              assignmentData.length,
              attendanceData.length,
            );

            for (let index = 0; index < graphMaxLength; index++) {
              const asmnt = assignmentData[index];
              const attend = attendanceData[index];

              if (asmnt) {
                graph.push({
                  value: Number(asmnt.value) || 0,
                  frontColor: '#D69C37',
                  gradientColor: '#D69C37',
                  spacing: 4,
                  label: capitalize(asmnt.month || ''),
                });
              }

              if (attend) {
                graph.push({
                  value: Number(attend.value) || 0,
                  frontColor: ColorCode.primary,
                  gradientColor: ColorCode.primary,
                });
              }
            }

            setGraphData(graph);

            // Handle grade data safely - Assignment Percentage Graph
            if (pass.grade?.google) {
              const chapterTestData = pass.grade.google.map(item => ({
                value: Number(item.grade_percent) || 0,
                frontColor: '#177AD5',
                gradientColor: '#177AD5',
                label: item.url_data?.title || 'Chapter Test',
              }));

              setChapterTestData(chapterTestData);
            }

            // Handle assignment graph data
            if (pass.grade?.assignment) {
              const chartHeight = 28 * height; // Chart height from BarChart component
              const assignmentGraphData = pass.grade.assignment
                .filter(item => item.assignment)
                .map((item, index) => {
                  const gradePercent = Number(item.grade_percent) || 0;
                  // Calculate approximate bar height (chart height minus padding/margins)
                  const usableHeight = chartHeight - 50; // Account for chart padding
                  const barHeight = (gradePercent / 100) * usableHeight;
                  return {
                    value: gradePercent,
                    frontColor: '#D69C37',
                    gradientColor: '#D69C37',
                    label: item.assignment?.syllabus?.chapter_name || 'Assignment',
                    topLabelComponent: () => {
                      // Position text inside bar at the top
                      // Use negative margin to move text from above bar into the bar
                      const marginTop = barHeight > 0 ? -(barHeight - 12) : -10;
                      return (
                        <View style={{
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          marginTop: marginTop,
                          height: Math.max(barHeight, 20),
                          width: '100%',
                        }}>
                          <Text
                            style={{
                              color: '#000000',
                              textAlign: 'center',
                              fontFamily: Fonts.SemiBold,
                              fontSize: 8,
                              fontWeight: 'bold',
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

            // Build monthly attendance and assignment data
            let monthlyGraphData = [];
            const monthlyMaxLength = Math.max(
              assignmentData.length,
              attendanceData.length,
            );

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
            // Handle API error response
            setGraphData([]);
            setGoogleGraphData([]);
            setAssignmentGraphData([]);
            setChapterTestData([]);
            setMonthlyData([]);
          }

          getProfile();
        } catch (error) {
          console.error('Error processing API response:', error);
          setShowProgress(false);
          setGraphData([]);
          setGoogleGraphData([]);
          setAssignmentGraphData([]);
          setChapterTestData([]);
          setMonthlyData([]);
        }
      },
      fail => {
        console.error('API Call failed:', fail);
        setShowProgress(false);
        setGraphData([]);
        setGoogleGraphData([]);
        setAssignmentGraphData([]);
        setChapterTestData([]);
        setMonthlyData([]);
      },
    );
  };

  const getProfile = () => {
    setShowProgress(true);

    ApiMethod.getProfile(
      async pass => {
        try {
          console.log('Profile response:', pass);
          setShowProgress(false);

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
        } catch (error) {
          console.error('Error processing profile response:', error);
          setShowProgress(false);
          setSkillkGraphData([]);
          setShowSkillGraph(false);
        }
      },
      fail => {
        console.error('Profile API failed:', fail);
        setSkillkGraphData([]);
        setShowProgress(false);
        setShowSkillGraph(false);
        ToastUtility.showToast('Some Error Occurred.');
      },
    );
  };

  const capitalize = word => {
    if (!word || typeof word !== 'string') return '';
    return word.replace(word.charAt(0), word.charAt(0).toUpperCase());
  };

  // Error boundary wrapper component
  const SafeComponent = ({ children, fallback = null }) => {
    try {
      return children;
    } catch (error) {
      console.error('Component render error:', error);
      return fallback || <Text>Error loading component</Text>;
    }
  };

  return (
    <Provider>
      <View style={{ backgroundColor: 'white', flex: 1 }}>
        <CustomStatus trans={true} isDark={true} color="#FFFFFF00" />
        <SafeAreaView style={{ flex: 1, width: '100%' }}>
          <View style={{ flex: 1 }}>
            <CustomHeader
              text={'My Progress'}
              customStyle={{ marginTop: -5, paddingVertical: 5 }}
            />
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              <View style={{ width: 100 * width }}>
                {/* Quiz Graph Section */}
                <Text
                  style={{
                    fontFamily: Fonts.SemiBold,
                    fontSize: 4 * width,
                    color: '#222',
                    marginLeft: 16,
                    marginTop: 16,
                    // marginBottom: 2,
                  }}
                >
                  Quiz Graph
                </Text>
                <SafeComponent>
                  <View
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: 16,
                      margin: 16,
                      paddingVertical: 20,
                      paddingHorizontal: 16,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.08,
                      shadowRadius: 8,
                      elevation: 3,
                    }}>
                    {/* Donut Chart */}
                    <View style={{ alignItems: 'center', marginBottom: 16 }}>
                      <PieChart
                        data={data}
                        donut
                        radius={80}
                        innerRadius={60}
                        showText
                        textColor="#222"
                        textSize={18}
                        showValuesAsLabels
                        labelsPosition="onBorder"
                        textBackgroundColor="#fff"
                        textBackgroundRadius={18}
                        fontWeight="bold"
                        strokeColor="#fff"
                        strokeWidth={6}
                      />
                    </View>

                    {/* Legend */}
                    <View style={{ borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 16 }}>
                      {data.map((d, idx) => (
                        <View
                          key={idx}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 8,
                          }}>
                          <View
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: 7,
                              backgroundColor: d.color,
                              marginRight: 10,
                            }}
                          />
                          <Text style={{ fontSize: 16, color: '#333', fontFamily: Fonts.Medium }}>
                            {d.name}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </SafeComponent>

                {/* Assignment Percentage Graph */}
                <SafeComponent>
                  <View
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: 16,
                      margin: 16,
                      paddingTop: 35,
                      paddingBottom: 20,
                      paddingHorizontal: 12,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.08,
                      shadowRadius: 8,
                      elevation: 3,
                      overflow: 'visible',
                    }}>
                    <Text
                      style={{
                        fontFamily: Fonts.SemiBold,
                        fontSize: 16,
                        color: '#000',
                        marginBottom: 20,
                        textAlign: 'center',
                      }}>
                      Assignment Percentage Graph
                    </Text>
                    {assignmentGraphData.length > 0 ? (
                      <View style={{
                        overflow: 'visible',
                        paddingTop: 50,
                        paddingBottom: 15,
                        width: '100%',
                      }}>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          nestedScrollEnabled
                          contentContainerStyle={{ paddingRight: 20 }}
                        >
                          <BarChart
                            width={Math.max(70 * width, assignmentGraphData.length * 20 * width)}
                            height={28 * height}
                            barWidth={8 * width}
                            style={{ paddingTop: 0, paddingBottom: 10 }}
                            data={assignmentGraphData}
                            rotateLabel={true}
                            labelsExtraHeight={5 * width}
                            showYAxisIndices
                            noOfSections={10}
                            maxValue={100}
                            hideRules
                            initialSpacing={5 * width}
                            endSpacing={5 * width}
                            spacing={5 * width}
                            xAxisType={'solid'}
                            xAxisColor={'#000'}
                            yAxisTextStyle={{
                              color: '#000',
                              fontFamily: Fonts.Regular,
                              fontSize: 12,
                            }}
                            xAxisLabelTextStyle={{
                              color: '#000000',
                              textAlign: 'center',
                              fontFamily: Fonts.Regular,
                              fontSize: 11,
                            }}
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

                <View
                  style={{
                    width: '100%',
                    height: 5,
                    marginVertical: 2 * width,
                    backgroundColor: '#FFFFFF',
                  }}
                />

                {/* Monthly Attendance/Assignment Graph Section */}
                <SafeComponent>
                  <View
                    style={{
                      backgroundColor: '#fff',
                      borderRadius: 16,
                      margin: 16,
                      paddingVertical: 20,
                      paddingHorizontal: 16,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.08,
                      shadowRadius: 8,
                      elevation: 3,
                    }}>
                    {/* Header with arrows and year */}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 16,
                      }}>
                      <TouchableOpacity onPress={() => {
                        const newYear = selectedYear - 1;
                        setSelectedYear(newYear);
                        apiCall(newYear);
                      }}>
                        <SimpleLineIcons name="arrow-left" size={24} color="#222" />
                      </TouchableOpacity>
                      <Text
                        style={{
                          fontFamily: Fonts.SemiBold,
                          fontSize: 18,
                          color: '#222',
                        }}>
                        {selectedYear}
                      </Text>
                      <TouchableOpacity onPress={() => {
                        const newYear = selectedYear + 1;
                        setSelectedYear(newYear);
                        apiCall(newYear);
                      }}>
                        <SimpleLineIcons name="arrow-right" size={24} color="#222" />
                      </TouchableOpacity>
                    </View>

                    {/* Legend */}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 16,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginRight: 20,
                        }}>
                        <View
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: 7,
                            backgroundColor: '#177AD5',
                            marginRight: 8,
                          }}
                        />
                        <Text style={{ fontSize: 14, color: '#333', fontFamily: Fonts.Medium }}>
                          Attendance
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <View
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: 7,
                            backgroundColor: '#D69C37',
                            marginRight: 8,
                          }}
                        />
                        <Text style={{ fontSize: 14, color: '#333', fontFamily: Fonts.Medium }}>
                          Assignments
                        </Text>
                      </View>
                    </View>

                    {monthlyData.length > 0 ? (
                      <BarChart
                        data={monthlyData}
                        height={25 * height}
                        barWidth={3 * width}
                        style={{ paddingTop: 20 }}
                        initialSpacing={1}
                        endSpacing={1}
                        spacing={4 * width}
                        barBorderRadius={4}
                        hideRules
                        yAxisThickness={0}
                        xAxisThickness={0}
                        labelWidth={6 * width}
                        yAxisTextStyle={{
                          color: '#000000',
                          fontFamily: Fonts.Regular,
                          fontSize: 3 * width,
                        }}
                        xAxisLabelTextStyle={{
                          color: '#000000',
                          fontFamily: Fonts.Regular,
                          fontSize: 3 * width,
                        }}
                        maxValue={Math.max(...monthlyData.map(item => item.value), 1.1)}
                        noOfSections={11}
                      />
                    ) : (
                      <Text
                        style={{
                          color: '#666',
                          fontSize: 3 * width,
                          marginVertical: 20,
                          textAlign: 'center',
                        }}>
                        No monthly data available
                      </Text>
                    )}
                  </View>
                </SafeComponent>

                <View
                  style={{
                    width: '100%',
                    height: 5,
                    marginVertical: 2 * width,
                    backgroundColor: '#FFFFFF',
                  }}
                />

                {/* Skill Graph Section */}
                <SafeComponent>
                  {showSkillGraph ? (
                    <View
                      style={{
                        width: '100%',
                        paddingBottom: 8 * width,
                      }}>
                      <View
                        style={{
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <Text
                          style={{
                            fontFamily: Fonts.SemiBold,
                            fontSize: 4 * width,
                            color: '#000',
                            marginBottom: 3 * width,
                          }}>
                          Skill Graph
                        </Text>
                        {skillGraphData.length > 0 && (
                          <BarChart
                            width={80 * width}
                            height={25 * height}
                            barWidth={60 * width}
                            style={{ paddingTop: 20 }}
                            data={skillGraphData}
                            showYAxisIndices
                            yAxisIndicesWidth={5}
                            xAxisLabelTexts={[course_name || 'Subject']}
                            noOfSections={4}
                            maxValue={100}
                            hideRules
                            initialSpacing={12 * width}
                            xAxisType={'solid'}
                            xAxisColor={'#000'}
                            yAxisTextStyle={{ color: '#000' }}
                            xAxisLabelTextStyle={{
                              color: '#000000',
                              textAlign: 'center',
                              fontFamily: Fonts.Regular,
                              fontSize: 3 * width,
                            }}
                          />
                        )}
                      </View>
                    </View>
                  ) : (
                    <View style={styles.emptyStateContainer}>
                      <Text style={styles.noDataText}>No Skill Data Found</Text>
                    </View>
                  )}
                </SafeComponent>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
      <CustomProgress show={showProgress} />
    </Provider>
  );
};

const styles = StyleSheet.create({
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
  emptyStateContainer: {
    minHeight: 25 * height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: '#666',
    fontSize: 3 * width,
    textAlign: 'center',
    fontFamily: Fonts.Medium,
  },
});

export default MyProgressScreen;
