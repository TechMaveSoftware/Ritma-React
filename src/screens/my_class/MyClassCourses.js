import React, { Fragment, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
  Linking,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Provider } from 'react-native-paper';
import CustomHeader from '../../compenents/CustomHeader';
import ApiMethod from '../../api/ApiMethod';
import width from '../../Units/width';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ColorCode from '../../utility/ColorCode';
import Fonts from '../../utility/Fonts';
import ConstData from '../../utility/ConstData';
import CustomStatus from '../../compenents/CustomStatus';
import ToastUtility from '../../utility/ToastUtility';

const MyClassCourses = ({ navigation }) => {
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
        console.log('MyClass API Response Full:', JSON.stringify(response, null, 2));
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
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <CustomStatus trans={true} isDark={true} color="#FFFFFF00" />
        <CustomHeader
          text={'My Class'}
          customStyle={{ marginTop: -5, paddingVertical: 5 }}
        />
        <View style={{ flex: 1, backgroundColor: '#EBF7F8' }}>
          <View style={styles.header}>
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
                      {/* <Text style={styles.courseDescription}>
                        {courseItem.course.description}
                      </Text> */}
                      {/* <Text style={styles.courseType}>
                        Type: {courseItem.course.type}
                      </Text> */}
                    </View>
                    <MaterialIcons
                      name="arrow-forward-ios"
                      color={ColorCode.black}
                      size={22}
                    />
                  </TouchableOpacity>
                ))
              ) : (
                renderEmptyState()
              )}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </Provider>
  );
};

export default MyClassCourses;

const styles = StyleSheet.create({
  header: {
    padding: width * 4,
  },
  headerTitle: {
    fontSize: width * 5,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: width * 3.6,
    color: '#666',
    marginTop: width * 1,
  },
  coursesContainer: {
    padding: width * 4,
  },
  courseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: width * 2.5,
    padding: width * 4,
    marginBottom: width * 2.5,
    borderWidth: 1,
    borderColor: ColorCode.greyAAA,
  },
  courseInfo: {
    flex: 1,
    marginRight: width * 2,
  },
  courseText: {
    fontSize: width * 3.4,
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
  },
});