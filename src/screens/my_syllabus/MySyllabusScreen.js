import React, { Fragment, useEffect, useState, useRef } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  RefreshControl,
  Modal,
  Linking,
  Platform,
  Share,
} from 'react-native';
import { Provider } from 'react-native-paper';
import ApiMethod from '../../api/ApiMethod';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomProgress from '../../compenents/CustomProgress';
import CustomStatus from '../../compenents/CustomStatus';
import ImageView from '../../compenents/ImageView';
import height from '../../Units/height';
import width from '../../Units/width';
import Fonts from '../../utility/Fonts';
import StorageUtility from '../../utility/StorageUtility';
import { useFocusEffect } from '@react-navigation/native';
import ToastUtility from '../../utility/ToastUtility';
import CustomSAView from '../../compenents/CustomSAView';
import ColorCode from '../../utility/ColorCode';
import CustomHeader from '../../compenents/CustomHeader';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Feather from 'react-native-vector-icons/Feather';
import SyllabusSkeleton from '../../compenents/SyllabusSkeleton';

const dayMap = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday',
};

// Courses will be loaded from my-courses API

const MySyllabusScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState(null);
  const [virtualClassCalendar, setVirtualClassCalendar] = useState(0);
  const [allChapterList, setAllChapterList] = useState([]);
  const [chapterList, setChapterList] = useState([]);
  const [chapterDayWise, setChapterDayWise] = useState(null);
  const [chapterListDayWise, setChapterListDayWise] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [selectedSyllabusId, setSelectedSyllabusId] = useState(null);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [imageBasePath, setImageBasePath] = useState('https://techmavedev.com/ritma-edtech/');
  const [docBasePath, setDocBasePath] = useState('https://techmavedev.com/ritma-edtech/storage/app/public/');
  const [weekCountArr, setWeekCountArr] = useState([]);
  const [weekCount, setWeekCount] = useState(0);
  const [dataList, setDataList] = useState([]);
  const [className, setClassName] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [showProgress, setShowProgress] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const isInitializedRef = useRef(false);
  const selectedSubjectRef = useRef(null);
  const selectedWeekRef = useRef(1);

  const downloadAssignment = (file) => {
    if (!file) return;

    const { config, fs } = ReactNativeBlobUtil;
    const date = new Date();
    const file_url = file;
    const isIOS = Platform.OS === 'ios';
    const pictureDir = isIOS ? fs.dirs.DocumentDir : fs.dirs.DownloadDir;
    const timestamp = Math.floor(date.getTime() + date.getSeconds() / 2);
    const generatedFileName = `assignment_${timestamp}.pdf`;
    const filePath = `${pictureDir}/${generatedFileName}`;
    let options = {
      fileCache: true,
      path: filePath,
    };
    if (!isIOS) {
      options.addAndroidDownloads = {
        useDownloadManager: true,
        notification: true,
        path: filePath,
        description: 'Downloading Assignment...',
      };
    }

    const fullUrl = docBasePath + file_url;

    config(options)
      .fetch('GET', fullUrl)
      .then(async res => {
        if (isIOS) {
          const fileUri = res.path().startsWith('file://') ? res.path() : `file://${res.path()}`;
          try {
            await Share.share({
              url: fileUri,
              title: generatedFileName,
            });
            ToastUtility.showToast('Saved');
          } catch (shareError) {
            console.log('iOS share error:', shareError);
            ReactNativeBlobUtil.ios.previewDocument(res.path());
          }
          return;
        }
        ToastUtility.showToast('Saved');
      })
      .catch((errorMessage, statusCode) => {
        console.log('errorMessage', errorMessage);
      });
  };

  // Keep refs in sync with state
  useEffect(() => {
    selectedSubjectRef.current = selectedSubject;
  }, [selectedSubject]);

  useEffect(() => {
    selectedWeekRef.current = selectedWeek;
  }, [selectedWeek]);

  useEffect(() => {
    // getUserDetail moved to focus effect for fresh data on each focus
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // The screen is focused Call any action
      getUserDetail(); // Get user and profile (Parallel)

      // Only fetch class data on first load, otherwise preserve current selection
      if (!isInitializedRef.current || !selectedSubjectRef.current) {
        isInitializedRef.current = true;
        fetchClassData();
      } else {
        // If we have a selected subject, just refresh the data for current selection
        if (selectedSubjectRef.current && selectedWeekRef.current) {
          // We can go directly to apiCall if we already have the subjects data
          // but getTotalWeek also refreshes the week count just in case.
          // For optimization, if we have subjects, we can just call apiCall.
          apiCall(selectedWeekRef.current, selectedSubjectRef.current);
        }
      }
    }, []),
  );

  const getProfile = () => {
    ApiMethod.getProfile(
      async pass => {
        console.log('profile data ********* ', pass.data.class);
        setShowProgress(false);
        if (pass.status == 200) {
          var data = pass.data;
          setClassName(data.class);
        }
      },
      fail => {
        console.log(fail);
        setShowProgress(false);
        ToastUtility.showToast('Some Error Occurred.');
      },
    );
  };

  const getUserDetail = async () => {
    var uu = await StorageUtility.getUser();
    setUser(uu);

    if (uu.type == 'virtual') {
      setVirtualClassCalendar(1);
    } else {
      setVirtualClassCalendar(2);
    }
    // var path = await StorageUtility.getProfilePath();
    // setUserPath(path);
    getProfile();
  };

  // Function to handle viewing uploaded assignment
  const getUploadedAssignment = (assignmentId) => {
    if (!assignmentId) {
      ToastUtility.showToast('Assignment ID not available.');
      return;
    }
    setShowProgress(true);
    console.log('getUploadedAssignment - using assignment_id:', assignmentId);

    ApiMethod.uploadedDocs(
      `id=${assignmentId}`,
      pass => {
        setShowProgress(false);
        console.log('Uploaded Docs API Response:', pass);
        if (pass.status == 200 && pass.data && pass.data.length > 0) {
          navigation.navigate('viewUploadedDocs', {
            baseUrl: pass.base_url,
            uploadedDocs: pass.data,
          });
        } else {
          ToastUtility.showToast('No Documents Found.');
        }
      },
      fail => {
        setShowProgress(false);
        console.log('Uploaded Docs API Error:', fail);
        ToastUtility.showToast('Failed to load documents.');
      },
    );
  };

  const fetchClassData = () => {
    setShowProgress(true);
    console.log('Calling fetchClassData...');
    ApiMethod.myCourses(
      response => {
        console.log('MyCourses API Response:', response);
        setShowProgress(false);
        if (response.status === 200 && response.data) {
          if (response.image_root) {
            setImageBasePath(response.image_root);
          }
          if (response.document_root) {
            setDocBasePath(response.document_root);
          }
          const courseData = Array.isArray(response.data) ? response.data : response.data.courses || [];
          if (courseData.length > 0) {
            // Convert courses to subjects format
            const courseSubjects = courseData.map(courseItem => ({
              id: courseItem.course.id,
              name: courseItem.course.course_name,
              description: courseItem.course.description || courseItem.course.full_description,
              totalWeeks: courseItem.course.week,
              documents: courseItem.course.documents || []
            }));
            console.log('Course subjects created:', courseSubjects);
            setSubjects(courseSubjects);

            // Set first course as selected by default only if no subject is currently selected
            if (courseSubjects.length > 0) {
              const existingSubject = courseSubjects.find(
                subjectItem => subjectItem.id === selectedSubject,
              );

              if (existingSubject && selectedSubject) {
                // Preserve existing selection - just refresh the data
                console.log('Preserving existing subject selection:', selectedSubject);
                const weekArr = [];
                for (let i = 1; i <= existingSubject.totalWeeks; i++) {
                  weekArr.push(i);
                }
                setWeekCount(existingSubject.totalWeeks);
                setWeekCountArr(weekArr);

                if (selectedWeek) {
                  apiCall(selectedWeek, selectedSubject);
                } else {
                  apiCall(1, selectedSubject);
                }
              } else {
                // No existing selection, set first course as default
                const subjectToUse = courseSubjects[0];
                const subjectIdToUse = subjectToUse.id;
                const weekToLoad = 1;

                const weekArr = [];
                for (let i = 1; i <= subjectToUse.totalWeeks; i++) {
                  weekArr.push(i);
                }
                setWeekCount(subjectToUse.totalWeeks);
                setWeekCountArr(weekArr);

                console.log(
                  'Setting first course as selected:',
                  courseSubjects[0],
                );
                setSelectedSubject(subjectIdToUse);
                setSelectedWeek(weekToLoad);
                // Update refs immediately
                selectedSubjectRef.current = subjectIdToUse;
                selectedWeekRef.current = weekToLoad;
                apiCall(weekToLoad, subjectIdToUse);
              }
            }
          } else {
            console.log('No courses found in response');
          }
        } else {
          console.log('API response not successful:', response.status);
        }
      },
      error => {
        console.log('MyCourses API Error:', error);
        setShowProgress(false);
        ToastUtility.showToast('Failed to fetch class data');
      },
    );
  };

  const getTotalWeek = (courseId, weekToLoad = selectedWeek) => {
    setShowProgress(true);
    console.log('Calling getTotalWeek with courseId:', courseId);
    // Pass course_id as query parameter to the API
    ApiMethod.myWeeks(
      `course_id=${courseId}`,
      pass => {
        setShowProgress(false);
        console.log('Week count response:', pass);
        if (pass.status == 200) {
          const weekCountValue = pass.data;
          console.log('Week count value:', weekCountValue);
          setWeekCount(weekCountValue);
          let temp = [];
          for (let i = 1; i <= weekCountValue; i++) {
            temp.push(i);
          }
          console.log('Week array created:', temp);
          setWeekCountArr(temp);
          console.log('Selected week:', weekToLoad, 'Course ID:', courseId);
          apiCall(weekToLoad, courseId);
        } else {
          console.log('Week count API failed with status:', pass.status);
        }
      },
      fail => {
        setShowProgress(false);
        console.log('Failed to get week count:', fail);
        // Fallback to default 5 weeks if API fails
        console.log('Using fallback week count');
        const weekCountValue = 5;
        setWeekCount(weekCountValue);
        let temp = [];
        for (let i = 1; i <= weekCountValue; i++) {
          temp.push(i);
        }
        setWeekCountArr(temp);
        apiCall(weekToLoad, courseId);
        ToastUtility.showToast('Failed to load week data.');
      },
    );
  };

  const onRefresh = () => {
    if (selectedSubject && selectedWeek) {
      getTotalWeek(selectedSubject, selectedWeek);
    }
  };

  const handleMarkComplete = () => {
    setShowCompleteModal(false);
    setTimeout(() => {
      setShowProgress(true);

      const formData = new FormData();
      formData.append('syllabus_id', selectedSyllabusId);

      ApiMethod.completeSyllabus(
        formData,
        pass => {
          if (pass && pass.status == 200) {
            ToastUtility.showToast(pass.message || 'Syllabus marked as completed');
            onRefresh(); // Refresh the list
          } else {
            setShowProgress(false);
            ToastUtility.showToast(
              pass && pass.message
                ? pass.message
                : 'Failed to mark syllabus as completed',
            );
          }
        },
        fail => {
          setShowProgress(false);
          setTimeout(() => {
            ToastUtility.showToast('Something went wrong');
          }, 500);
        },
      );
    }, 500);
  };

  const apiCall = (week, courseId) => {
    setShowProgress(true);
    console.log('Calling apiCall with week:', week, 'courseId:', courseId);
    // Use my-syllabus API with course_id and week parameters
    ApiMethod.mySyllabus(
      `week=${week}&course_id=${courseId}`,
      pass => {
        setShowProgress(false);

        console.log('===@@@@@@@@@@@pass', JSON.stringify(pass));
        if (pass.status == 200) {
          setDataList(pass.data);
          setIsInitialLoading(false);
          let tt = {};
          let days = [];
          // Show all syllabus items, not just unique chapter names
          let chapList = pass.data;

          pass.data.map(item => {
            if (tt[item.day]) {
              let t1 = tt[item.day];
              t1.push(item);
              tt[item.day] = t1;
            } else {
              let t1 = [];
              t1.push(item);
              tt[item.day] = t1;
              days.push(item.day);
            }
          });

          let tt1 = [];
          for (let i = 1; i <= 7; i++) {
            if (tt[`${i}`]) {
              tt1.push(tt[`${i}`]);
            }
          }

          setChapterList(days);
          setChapterDayWise(tt);
          setChapterListDayWise(tt1);
          setAllChapterList(chapList);
        } else {
          setChapterList([]);
          setChapterDayWise([]);
          setShowProgress(false);
          setAllChapterList([]);
          setIsInitialLoading(false);
        }
      },
      fail => {
        setShowProgress(false);
        setAllChapterList([]);
        setChapterList([]);
        setChapterDayWise([]);
        setIsInitialLoading(false);
      },
    );
  };

  // Handle subject selection
  const handleSubjectSelect = subjectId => {
    setSelectedSubject(subjectId);
    setSelectedWeek(1); // Reset to week 1 when changing subject
    // Update refs immediately
    selectedSubjectRef.current = subjectId;
    selectedWeekRef.current = 1;
    getTotalWeek(subjectId, 1);
  };


  return (
    <Fragment>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <CustomStatus trans={true} isDark={true} color="#FFFFFF00" />
        <CustomHeader
          text={'My Syllabus'}
          customStyle={{ marginTop: -5, paddingVertical: 5 }}
        />
        <CustomSAView
          parentStyple={{
            flex: 1,
            backgroundColor: ColorCode.transarent,
          }}
          style={{
            flex: 1,
            width: 100 * width,
            backgroundColor: ColorCode.transarent,
            alignItems: 'center',
          }}>
          {isInitialLoading ? (
            <SyllabusSkeleton />
          ) : (
            <Fragment>
              {/*
          <View
            style={{
              width: '100%',
              height: 5 * height,
              paddingHorizontal: 6 * width,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text
              style={{
                color: '#000000',
                fontFamily: Fonts.SemiBold,
                fontSize: 4.5 * width,
              }}>
              {'Schedule'}
            </Text>

            <TouchableOpacity
              onPress={navigation.goBack}
              style={{
                width: 9 * width,
                height: 9 * width,
                margin: 2 * width,
                borderRadius: 2 * width,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#EFFFF6',
              }}>
              <Ionicons name="chevron-back" size={5 * width} color="#000000" />
            </TouchableOpacity>
          </View>
          */}

              {/* Subject tabs */}
              <View style={Styles.tabContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={Styles.tabScrollContainer}>
                  {subjects.map(subject => (
                    <TouchableOpacity
                      key={subject.id}
                      style={[
                        Styles.tabButton,
                        selectedSubject === subject.id && Styles.selectedTabButton,
                      ]}
                      onPress={() => handleSubjectSelect(subject.id)}>
                      <Text
                        style={[
                          Styles.tabText,
                          selectedSubject === subject.id && Styles.selectedTabText,
                        ]}>
                        {subject.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Course Info Section */}
              <View style={Styles.courseInfoContainer}>
                {subjects.map(s => s.id == selectedSubject && (
                  <Fragment key={s.id}>
                    <Text style={Styles.courseDescription}>
                      {s.description}
                    </Text>
                    <View style={Styles.metaChipContainer}>
                      <View style={Styles.metaChip}>
                        <Feather name="clock" size={3.5 * width} color="#666" />
                        <Text style={Styles.metaChipText}>{`${s.totalWeeks || weekCount || 5} Weeks`}</Text>
                      </View>
                      {s.documents && s.documents.length > 0 && (
                        <TouchableOpacity
                          style={Styles.metaChip}
                          onPress={() => {
                            setSelectedDocs(s.documents);
                            setShowDocsModal(true);
                          }}>
                          <Ionicons name="document-text-outline" size={3.5 * width} color="#666" />
                          <Text style={Styles.metaChipText}>Documents</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </Fragment>
                ))}
              </View>

              {/*
      //   {virtualClassCalendar > 0 && (
      //       <TouchableOpacity
      //         onPress={() => {
      //           console.log('sdsutyruity');
      //         }}
      //         style={{
      //           width: '92%',
      //           height: 10 * height,
      //           borderRadius: 3 * width,
      //           backgroundColor: '#FFFFFF',
      //         }}>
      //         <View
      //           style={{
      //             flex: 1,
      //             paddingHorizontal: 3 * width,
      //             alignItems: 'center',
      //             flexDirection: 'row',
      //           }}>
      //           <View
      //             style={{
      //               width: 6 * height,
      //               height: 6 * height,
      //               borderRadius: 5 * height,
      //               backgroundColor: '#16763E',
      //               alignItems: 'center',
      //               justifyContent: 'center',
      //             }}>
      //             <Image
      //               source={require('../../assets/images/syllabus_icon.png')}
      //               style={{
      //                 width: '40%',
      //                 height: '40%',
      //                 tintColor: '#FFF',
      //                 resizeMode: 'center',
      //               }}
      //             />
      //           </View>

      //           {className ? (
      //             <Text
      //               style={{
      //                 flex: 1,
      //                 color: '#000000',
      //                 fontFamily: Fonts.SemiBold,
      //                 marginStart: 4 * width,
      //                 fontSize: 4.4 * width,
      //                 width: width * 40,
      //               }}>
      //               {className} -{' '}
      //               {subjects.find(s => s.id === selectedSubject).name}
      //             </Text>
      //           ) : (
      //             <Text
      //               style={{
      //                 flex: 1,
      //                 color: '#000000',
      //                 fontFamily: Fonts.SemiBold,
      //                 marginStart: 4 * width,
      //                 fontSize: 4.4 * width,
      //                 width: width * 40,
      //               }}>
      //               {'N/A'}
      //             </Text>
      //           )}
      //         </View>
      //       </TouchableOpacity>
      //     )}
      // */}

              <View style={{ flex: 1, width: '100%', alignItems: 'center' }}>
                {allChapterList.length > 0 ? (
                  <View style={{ flex: 1, width: '100%' }}>
                    <FlatList
                      data={allChapterList}
                      style={{
                        paddingHorizontal: 4 * width,
                      }}
                      showsVerticalScrollIndicator={false}
                      contentContainerStyle={{ paddingBottom: insets.bottom + (2 * height) }}
                      refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                      }
                      renderItem={({ item, index }) => {
                        const isSyllabusCompleted = item.student_syllabus_completion && item.student_syllabus_completion.completed == 1;
                        const canUploadAssignment = item.mark_done == "1" && item.is_assignment_upload == "1";
                        const submittedAssignment =
                          item.assignment?.submitted_assignment || item.submitted_assignment || null;
                        const isAssignmentUploaded = !!submittedAssignment;
                        return (
                          <View
                            key={index}
                            style={Styles.chapterCard}>
                            {/* Status Header */}
                            <View style={Styles.cardHeader}>
                              <View style={Styles.cardMetaItem}>
                                <Feather name="clock" size={3.5 * width} color="#999" />
                                <Text style={Styles.cardMetaText}>{item.estimated_duration || item.total_hours || 60} Hours</Text>
                              </View>
                              <View style={Styles.cardMetaItem}>
                                <Feather name="calendar" size={3.5 * width} color="#999" />
                                <Text style={Styles.cardMetaText}>{`${item.week_range_start || 1}-${item.week_range_end || 3} Weeks`}</Text>
                              </View>
                            </View>

                            {/* Chapter Info */}
                            <Text style={Styles.chapterTitle}>{item.chapter_name}</Text>
                            <Text style={Styles.chapterSubText}>
                              {item.main_topic || item.description || " "}
                            </Text>

                            {/* Goals Section */}
                            <Text style={Styles.goalsTitle}>Specific Learning Goals</Text>
                            {(() => {
                              try {
                                const goals = item.learning_goals ? (typeof item.learning_goals === 'string' ? JSON.parse(item.learning_goals) : item.learning_goals) : [];
                                return goals.map((goal, idx) => (
                                  <View key={idx} style={Styles.goalItem}>
                                    <Ionicons name="checkmark" size={4 * width} color="#008A3D" />
                                    <Text style={Styles.goalText}>{goal}</Text>
                                  </View>
                                ));
                              } catch (e) {
                                return null;
                              }
                            })()}

                            {/* Action Buttons */}
                            <View style={Styles.cardActions}>
                              <TouchableOpacity
                                onPress={() => {
                                  navigation.navigate('SyllabusDetail', {
                                    day: dayMap[item.day],
                                    selectedWeek: selectedWeek,
                                    dataList: [item],
                                    className: className,
                                    selectedIndex: index,
                                    subjectName: subjects.find(
                                      s => s.id === selectedSubject,
                                    )?.name || `Course ${selectedSubject}`,
                                    subjectId: selectedSubject,
                                    courseId: selectedSubject,
                                  });
                                }}
                                style={Styles.viewDetailsBtn}>
                                <Text style={Styles.viewDetailsText}>View Details</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={[
                                  Styles.markCompletedBtn,
                                  isSyllabusCompleted && Styles.completedBtn,
                                ]}
                                disabled={isSyllabusCompleted}
                                onPress={() => {
                                  setSelectedSyllabusId(item.id);
                                  setShowCompleteModal(true);
                                }}>
                                {isSyllabusCompleted ? (
                                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="checkmark-circle-outline" size={4 * width} color="#fff" />
                                    <Text style={Styles.markCompletedText}> Completed</Text>
                                  </View>
                                ) : (
                                  <Text style={Styles.markCompletedText}>Mark as Completed</Text>
                                )}
                              </TouchableOpacity>
                            </View>

                            {/* Upload Assignment Button - Bottom of Card */
                              item.assignment && (
                                <View
                                  style={[
                                    Styles.uploadContainer,
                                    isAssignmentUploaded && Styles.uploadedContainer,
                                    { flexDirection: 'column', alignItems: 'flex-start' }
                                  ]}>

                                  {item.assignment.file && (
                                    <View style={{
                                      flexDirection: 'row',
                                      justifyContent: 'space-between',
                                      width: '100%',
                                      marginBottom: 4 * width,
                                      paddingBottom: 4 * width,
                                      borderBottomWidth: 1,
                                      borderBottomColor: '#E5E5E5'
                                    }}>
                                      <Text style={Styles.uploadAssignmentText}>Assignment document</Text>
                                      <TouchableOpacity
                                        onPress={() => downloadAssignment(item.assignment.file)}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                        <Feather name="download" size={5 * width} color="#008A3D" />
                                      </TouchableOpacity>
                                    </View>
                                  )}

                                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginTop: item.assignment.file ? 0 : 2 * width }}>
                                    <View style={{ flex: 1, marginRight: 2 * width }}>
                                      <Text style={Styles.uploadAssignmentText}>Assignment</Text>
                                      {(item.assignment?.title || item.assignment?.name || item.assignment?.assignment_title) ? (
                                        <Text
                                          style={Styles.assignmentTitleText}
                                          numberOfLines={1}
                                          ellipsizeMode="tail">
                                          {item.assignment?.title || item.assignment?.name || item.assignment?.assignment_title}
                                        </Text>
                                      ) : null}
                                    </View>

                                    <TouchableOpacity
                                      activeOpacity={0.7}
                                      onPress={() => {
                                        if (!isAssignmentUploaded) {
                                          // Pass the full item as data, but ensure assignment ID is mapped correctly
                                          const dataToPass = {
                                            ...item,
                                            class_assignment_id: item.submitted_assignment?.assignment_id || item.assignment?.id || item.assignment_id || item.id,
                                          };
                                          navigation.navigate('UploadAssignment', {
                                            data: dataToPass,
                                          });
                                        } else {
                                          // View uploaded documents - use assignment.submitted_assignment.id
                                          const assignmentIdToUse =
                                            submittedAssignment?.id || submittedAssignment?.assignment_id;
                                          if (!assignmentIdToUse) {
                                            ToastUtility.showToast('Submitted assignment ID not found.');
                                            return;
                                          }
                                          console.log('📋 Using submitted_assignment id:', assignmentIdToUse);
                                          getUploadedAssignment(assignmentIdToUse);
                                        }
                                      }}>
                                      {isAssignmentUploaded ? (
                                        <View style={Styles.uploadedButton}>
                                          <Text style={Styles.uploadedButtonText}>Uploaded</Text>
                                        </View>
                                      ) : (
                                        <View style={Styles.uploadButton}>
                                          <Text style={{
                                            color: '#16763E',
                                            fontSize: width * 4,
                                            fontWeight: '600',
                                            marginRight: width * 1,
                                            fontFamily: Fonts.SemiBold,
                                          }}>Upload</Text>
                                          <Feather name="arrow-right" size={3 * width} color="#00471A" />
                                        </View>
                                      )}
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              )}
                          </View>
                        );
                      }}
                    />
                  </View>
                ) : (
                  <ScrollView
                    style={{ flex: 1, width: '100%' }}
                    refreshControl={
                      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }>
                    <View style={Styles.courseRoundShape}>
                      <Text style={Styles.courseText}>{`No Data Found`}</Text>
                    </View>
                  </ScrollView>
                )}
              </View>
            </Fragment>
          )}
        </CustomSAView>

        {/* Confirmation Modal */}
        <Modal
          transparent={true}
          visible={showCompleteModal}
          animationType="fade"
          onRequestClose={() => setShowCompleteModal(false)}>
          <View style={Styles.modalOverlay}>
            <View style={Styles.modalContainer}>
              <View style={Styles.warningIconContainer}>
                <Ionicons
                  name="warning-outline"
                  size={width * 10}
                  color="#FF9500"
                />
              </View>
              <Text style={Styles.modalTitle}>Mark this as Completed ?</Text>
              <Text style={Styles.modalSubtitle}>
                Are you sure you want to mark as completed?
              </Text>

              <View style={Styles.modalActionRow}>
                <TouchableOpacity
                  style={Styles.skipBtn}
                  activeOpacity={0.7}
                  onPress={() => setShowCompleteModal(false)}>
                  <Text style={Styles.skipBtnText}>No, Skip It</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={Styles.confirmBtn}
                  activeOpacity={0.7}
                  onPress={handleMarkComplete}>
                  <Text style={Styles.confirmBtnText}>Yes, Mark Completed</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Documents Modal */}
        <Modal
          transparent={true}
          visible={showDocsModal}
          animationType="slide"
          onRequestClose={() => setShowDocsModal(false)}>
          <View style={Styles.modalOverlay}>
            <View style={Styles.docsModalContainer}>
              <View style={Styles.docsModalHeader}>
                <Text style={Styles.docsModalTitle}>Course Documents</Text>
                <TouchableOpacity onPress={() => setShowDocsModal(false)}>
                  <Ionicons name="close" size={6 * width} color="#000" />
                </TouchableOpacity>
              </View>

              <ScrollView style={Styles.docsList} showsVerticalScrollIndicator={false}>
                {selectedDocs.map((doc, index) => (
                  <View key={doc.id || index} style={Styles.docItem}>
                    <View style={Styles.docInfo}>
                      <Ionicons name="document-text" size={6 * width} color="#007AFF" />
                      <View style={{ marginLeft: 3 * width, flex: 1 }}>
                        <Text style={Styles.docName} numberOfLines={1}>{doc.document_name}</Text>
                        <Text style={Styles.docDate}>{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : ''}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={Styles.docViewBtn}
                      onPress={() => {
                        const fullUrl = doc.document_path.startsWith('http')
                          ? doc.document_path
                          : `${docBasePath}${doc.document_path}`;
                        Linking.openURL(fullUrl).catch(err => {
                          console.error('Failed to open document:', err);
                          ToastUtility.showToast('Could not open document');
                        });
                      }}>
                      <Text style={Styles.docViewText}>View</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
      <CustomProgress show={showProgress && !isInitialLoading} />
    </Fragment>
  );
};

const Styles = StyleSheet.create({
  // Tab styles
  tabContainer: {
    width: '100%',
    paddingHorizontal: 2 * width,
    marginTop: width * 4,
  },
  tabScrollContainer: {
    paddingHorizontal: 3 * width,
    paddingRight: 10 * width, // Add some end padding
  },
  tabButton: {
    paddingHorizontal: 5 * width,
    paddingVertical: 2 * width,
    marginRight: 3 * width,
    borderRadius: 2 * width,
    backgroundColor: '#F6F7FA',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    minWidth: 25 * width,
    alignItems: 'center',
  },
  selectedTabButton: {
    backgroundColor: '#FF9359',
    borderColor: '#FF9359',
  },
  tabText: {
    fontFamily: Fonts.Medium,
    fontSize: 3.6 * width,
    color: '#333333',
  },
  selectedTabText: {
    color: '#FFFFFF',
  },
  courseInfoContainer: {
    width: '92%',
    marginTop: 4 * width,
  },
  courseDescription: {
    fontFamily: Fonts.Regular,
    fontSize: 3.2 * width,
    color: '#444',
    lineHeight: 5 * width,
  },
  metaChipContainer: {
    flexDirection: 'row',
    marginTop: 3 * width,
    marginBottom: 2 * width,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    paddingHorizontal: 3 * width,
    paddingVertical: 1.5 * width,
    borderRadius: 5 * width,
    marginRight: 3 * width,
  },
  metaChipText: {
    fontFamily: Fonts.Medium,
    fontSize: 3 * width,
    color: '#666',
    marginLeft: 1.5 * width,
  },
  chapterCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 4 * width,
    padding: 4 * width,
    marginVertical: 2 * width,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    // shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
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
  uploadedContainer: {
    backgroundColor: '#F6F6F6',
  },
  uploadAssignmentText: {
    color: '#000000',
    fontSize: width * 3.5,
    fontWeight: '500',
    fontFamily: Fonts.Medium,
  },
  assignmentTitleText: {
    color: '#666666',
    fontSize: width * 3.1,
    fontFamily: Fonts.Regular,
    marginTop: width * 0.8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadText: {
    color: '#16763E',
    fontSize: width * 4,
    fontWeight: '600',
    marginRight: width * 1,
    fontFamily: Fonts.SemiBold,
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
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 2 * width,
  },
  cardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4 * width,
  },
  cardMetaText: {
    fontFamily: Fonts.Medium,
    fontSize: 2.8 * width,
    color: '#999',
    marginLeft: 1.5 * width,
  },
  chapterTitle: {
    fontFamily: Fonts.Bold,
    fontSize: 4.5 * width,
    color: '#000',
    marginBottom: 1 * width,
  },
  chapterSubText: {
    fontFamily: Fonts.Regular,
    fontSize: 3.4 * width,
    color: '#666',
    marginBottom: 4 * width,
    lineHeight: 5 * width,
  },
  goalsTitle: {
    fontFamily: Fonts.SemiBold,
    fontSize: 3.2 * width,
    color: '#666',
    marginBottom: 2 * width,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1 * width,
  },
  goalText: {
    fontFamily: Fonts.Medium,
    fontSize: 3 * width,
    color: '#444',
    marginLeft: 2 * width,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 5 * width,
    justifyContent: 'space-between',
  },
  viewDetailsBtn: {
    flex: 1,
    backgroundColor: ColorCode.primary,
    paddingVertical: 2.5 * width,
    borderRadius: 2 * width,
    alignItems: 'center',
    marginRight: 3 * width,
  },
  viewDetailsText: {
    fontFamily: Fonts.SemiBold,
    fontSize: 3.4 * width,
    color: '#fff',
  },
  markCompletedBtn: {
    flex: 1,
    backgroundColor: '#00BD5B',
    paddingVertical: 2.5 * width,
    borderRadius: 2 * width,
    alignItems: 'center',
  },
  markCompletedText: {
    fontFamily: Fonts.SemiBold,
    fontSize: 3.4 * width,
    color: '#fff',
  },
  completedBtn: {
    backgroundColor: '#00BD5B',
    borderWidth: 1,
    borderColor: '#00BD5B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: width * 5,
    padding: width * 6,
    alignItems: 'center',
  },
  warningIconContainer: {
    width: width * 20,
    height: width * 20,
    borderRadius: width * 10,
    backgroundColor: '#FFF8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: width * 4,
  },
  modalTitle: {
    fontSize: width * 5.5,
    fontFamily: Fonts.Bold,
    color: '#333',
    textAlign: 'center',
    marginBottom: width * 2,
  },
  modalSubtitle: {
    fontSize: width * 3.8,
    fontFamily: Fonts.Regular,
    color: '#666',
    textAlign: 'center',
    marginBottom: width * 6,
  },
  modalActionRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  skipBtn: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    height: width * 11,
    borderRadius: width * 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: width * 2,
  },
  skipBtnText: {
    fontSize: width * 3.4,
    fontFamily: Fonts.SemiBold,
    color: '#333',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#00BD5B',
    height: width * 11,
    borderRadius: width * 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: width * 2,
  },
  confirmBtnText: {
    fontSize: width * 3.4,
    fontFamily: Fonts.SemiBold,
    color: '#fff',
    textAlign: 'center',
  },
  docsModalContainer: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: width * 4,
    padding: width * 5,
  },
  docsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: width * 4,
    paddingBottom: width * 2,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  docsModalTitle: {
    fontSize: width * 4.5,
    fontFamily: Fonts.Bold,
    color: '#000',
  },
  docsList: {
    width: '100%',
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: width * 3,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  docInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  docName: {
    fontSize: width * 3.6,
    fontFamily: Fonts.Medium,
    color: '#333',
  },
  docDate: {
    fontSize: width * 2.8,
    fontFamily: Fonts.Regular,
    color: '#999',
  },
  docViewBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: width * 4,
    paddingVertical: width * 1.5,
    borderRadius: width * 1.5,
  },
  docViewText: {
    color: '#fff',
    fontSize: width * 3.2,
    fontFamily: Fonts.Bold,
  },
  circle: {
    width: 6 * height,
    height: 6 * height,
    borderRadius: 5 * height,
    backgroundColor: '#16763E',
  },
  circleText: {
    color: '#000000',
    fontSize: 4 * width,
    fontFamily: Fonts.Medium,
    marginStart: 2 * width,
  },
  headerText: {
    color: '#000000',
    fontSize: 4.4 * width,
    fontFamily: Fonts.SemiBold,
  },
  headerText1: {
    color: '#000000',
    fontSize: 4 * width,
    fontFamily: Fonts.SemiBold,
  },
  weekText: {
    color: '#000000',
    fontSize: 3.4 * width,
    fontFamily: Fonts.Medium,
  },
  weekTextSelected: {
    color: '#FFFFFF',
    fontSize: 3.4 * width,
    fontFamily: Fonts.Medium,
  },
  markDoneText: {
    color: '#008A3D',
    fontSize: 3.4 * width,
    marginStart: 2 * width,
    fontFamily: Fonts.Medium,
  },
  courseText: {
    color: '#008A3D',
    fontSize: 4 * width,
    fontFamily: Fonts.Medium,
    marginTop: 4 * height,
  },
  courseRoundShape: {
    width: '100%',
    marginTop: 2 * width,
    backgroundColor: 'transparent',
    borderRadius: 3 * width,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MySyllabusScreen;
