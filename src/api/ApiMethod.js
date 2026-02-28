import GetCall from './GetCall';
import ImageUploadCall from './ImageUploadCall';
import LocationApiCall from './LocationApiCall';
import PaymentApi from './PaymentApi';
import PostCall from './PostCall';

export default {
  login: (data, pass, fail) => {
    PostCall.Post('login', data, pass, fail);
  },
  forgotPassword: (data, pass, fail) => {
    PostCall.Post('forgot-password', data, pass, fail);
  },
  verifyOtp: (data, pass, fail) => {
    PostCall.Post('verify-otp', data, pass, fail);
  },
  resendOtp: (data, pass, fail) => {
    PostCall.Post('forgot-password', data, pass, fail); 
  },
  changePassword: (data, pass, fail) => {
    PostCall.Post('change-password', data, pass, fail);
  },
  signup: (data, pass, fail) => {
    PostCall.Post('register', data, pass, fail);
  },

  getProfile: (pass, fail) => {
    GetCall.Get('get-profile', pass, fail);
  },

  getHomeData: (pass, fail) => {
    GetCall.Get('home-data', pass, fail);
  },

  myAssignments: (pass, fail) => {
    GetCall.Get('my-assignments', pass, fail);
  },

  gradeData: (pass, fail) => {
    GetCall.Get('grade-data', pass, fail);
  },

  onlineGradeData: (pass, fail) => {
    GetCall.Get('online-grade', pass, fail);
  },

  myClass: (pass, fail) => {
    GetCall.Get('my-class', pass, fail);
  },

  myCourses: (pass, fail) => {
    GetCall.Get('my-courses', pass, fail);
  },

  allNotices: (pass, fail) => {
    GetCall.Get('notice', pass, fail);
  },

  myProgress: (urlData, pass, fail) => {
    GetCall.Get('my-progress?', pass, fail, urlData);
  },

  myWeeks: (urlData, pass, fail) => {
    GetCall.Get('weeks-count?', pass, fail, urlData);
  },



  mySyllabus: (urlData, pass, fail) => {
    GetCall.Get('my-syllabus-new?', pass, fail, urlData);
  },

  syllabusDetail: (urlData, pass, fail) => {
    GetCall.Get('syllabus-detail?', pass, fail, urlData);
  },

  uploadedDocs: (urlData, pass, fail) => {
    GetCall.Get('assignment-document?', pass, fail, urlData);
  },

  uploadAssignments: (data, pass, fail) => {
    PostCall.Post('submit-assignment', data, pass, fail);
  },
  reUploadAssignments: (data, pass, fail) => {
    PostCall.Post('reupload-assignment', data, pass, fail);
  },
  getNotification: (pass, fail) => {
    GetCall.Get('notification-list', pass, fail);
  },
  pendingAssignment: (pass, fail) => {
    GetCall.Get('assignment-track', pass, fail);
  },
  readNotification: (data, pass, fail) => {
    PostCall.Post('read-notification', data, pass, fail);
  },
  clockIn: (data, pass, fail) => {
    PostCall.Post('clockin', data, pass, fail);
  },
  clockOut: (data, pass, fail) => {
    PostCall.Post('clockout', data, pass, fail);
  },
  completeSyllabusLesson: (data, pass, fail) => {
    PostCall.Post('complete-syllabus-lesson', data, pass, fail);
  },
  completeSyllabus: (data, pass, fail) => {
    PostCall.Post('complete-syllabus', data, pass, fail);
  },
  googleAssignMarkDone: (data, pass, fail) => {
    PostCall.Post('markdone-google-assignment', data, pass, fail);
  },

  quizData: (urlData, pass, fail) => {
    GetCall.Get('quiz_mechanism_step?', pass, fail, urlData);
  },

  quizQuestions: (urlData, pass, fail) => {
    GetCall.Get('quiz-questions?', pass, fail, urlData);
  },

  quizResult: (urlData, pass, fail) => {
    GetCall.Get('quiz-result?', pass, fail, urlData);
  },

  submitWatchTime: (data, pass, fail) => {
    PostCall.Post('submit_watch_time', data, pass, fail);
  },

  submitAllAnswers: (data, pass, fail) => {
    PostCall.Post('submit_quiz', data, pass, fail);
  },
  getDiscussions: (pass, fail) => {
    GetCall.Get('discussion_forum', pass, fail);
  },

  discussionDetail: (urlData, pass, fail) => {
    GetCall.Get('discussion_forum_view?', pass, fail, urlData);
  },

  viewDoscussion: (data, pass, fail) => {
    PostCall.Post('increment_view_forum', data, pass, fail);
  },

  sendNewComment: (data, pass, fail) => {
    PostCall.Post('reply_forums', data, pass, fail);
  },
  getCalendarData: (pass, fail) => {
    GetCall.Get('schedule_classes', pass, fail);
  },

  schedule1to1: (data, pass, fail) => {
    PostCall.Post('add_schedule', data, pass, fail);
  },

  getClinicalCalendarData: (pass, fail) => {
    GetCall.Get('schedule_classes-clinical', pass, fail);
  },

  scheduleClinical1to1: (data, pass, fail) => {
    PostCall.Post('add_schedule-clinical', data, pass, fail);
  },

  updateVideoTime: (data, pass, fail) => {
    PostCall.Post('submit_watch_time', data, pass, fail);
  },

  weeklyOnlineAttendance: (urlData, pass, fail) => {
    GetCall.Get('online-attendance/', pass, fail, urlData);
  },

  quizBundle: (pass, fail) => {
    GetCall.Get('quiz_mechanism_step-bundel', pass, fail);
  },

  quizBundleNew: (pass, fail) => {
    GetCall.Get('quiz_mechanism_step-bundel-new', pass, fail);
  },

  myDocuments: (pass, fail) => {
    GetCall.Get('my-documents', pass, fail);
  },

  courseDocuments: (pass, fail) => {
    GetCall.Get('course-documents', pass, fail);
  },

  updateDocuments: (data, pass, fail) => {
    PostCall.Post('upload-document', data, pass, fail);
  },

  editprofilepic: (data, pass, fail) => {
    PostCall.Post('editprofilepic', data, pass, fail);
  },

  editprofile: (data, pass, fail) => {
    PostCall.Post('editprofile', data, pass, fail);
  },

  classAssignments: (pass, fail) => {
    GetCall.Get('class-assignments', pass, fail);
  },

  courseAssignments: (urlData, pass, fail) => {
    GetCall.Get('course-assignments?', pass, fail, urlData);
  },

  termsAndPrivacy: (pass, fail) => {
    GetCall.Get('termsandprivacy', pass, fail);
  },

};
