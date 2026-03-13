import moment from 'moment';
import { Platform } from 'react-native';
import width from '../Units/width';
import ColorCode from './ColorCode';
import ToastUtility from './ToastUtility';
import notifee, {
  IntervalTrigger,
  TimeUnit,
  TriggerType,
} from '@notifee/react-native';

export const FCMApi_Path =
  'https://fcm.googleapis.com/v1/projects/drivetest-e500e/messages:send';

export const isAppLive = true;

export default {
  //Base_Path: 'https://techmavesoftwaredev.com/gcs_education/api/',
  // Base_Path: 'https://gceeducationapp.com/api/',
  Base_Path: 'https://techmavedev.com/ritma-edtech/api/v1',

  // Base_Path: 'https://gceeducationapp.com/api/v2/',

  Email_Regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/,
  HTML_Regex: /(<([^>]+)>)/gi,
  Phone_Regex:
    /^\s*(?:\+?(\d{1,3}))?[- (]*(\d{3})[- )]*(\d{3})[- ]*(\d{4})(?: *[x/#]{1}(\d+))?\s*$/,
  Gender: ['Male', 'Female'],
  loginDuration: [
    { label: 'For 12 hours', value: 12 },
    { label: 'For 7 days', value: 24 * 7 },
    { label: 'For 30 days', value: 24 * 30 },
    { label: 'Until I log out', value: 0 },
  ],
  AttempsCount: 2,
  MaxAttempsCount: 3,
  VideoPercentage: 1,
  DocSkipDate: moment('10-03-2025 00:00:00'),
  QuizResultPercentage: 80,
  AlphabetAray: [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ],
  ScheduleTime: 8 * 60 * 60 * 1000,
  MaritalStatus: ['Single', 'Married'],
  ELEVATION_STYLE:
    Platform.OS == 'android'
      ? {
        elevation: 1 * width,
      }
      : {
        shadowOffset: {
          width: -0.1 * width,
          height: -0.1 * width,
        },
        shadowColor: ColorCode.greyDDD,
        shadowOpacity: 1,
        zIndex: 999,
      },

  ELEVATION_STYLE2:
    Platform.OS == 'android'
      ? {
        elevation: 2 * width,
      }
      : {
        shadowOffset: {
          width: -0.1 * width,
          height: -0.1 * width,
        },
        shadowColor: ColorCode.greyDDD,
        shadowOpacity: 2 * width,
        zIndex: 999,
      },

  screens: [
    {
      id: '1',
      title: 'Your Personalized Classroom',
      description:
        'Access your class syllabus, assignments, and grades all in one place. Stay on track with dedicated learning resources for your school.',
      image: require('../assets/images/Onboard1.png'),
      buttonText: 'Continue',
      skipText: 'Skip',
    },
    {
      id: '2',
      title: 'Manage Assignments & Quizzes',
      description:
        'Stay on top of your coursework! View assigned quizzes and assignments, track due dates, and plan your study schedule efficiently.',
      image: require('../assets/images/Onboard2.png'),
      buttonText: 'Continue',
      skipText: 'Skip',
    },
    {
      id: '3',
      title: 'Start Your Learning Journey Today',
      description: 'Access courses, track progress, and enhance your skills.',
      image: require('../assets/images/onBoard3.png'),
      buttonText: 'Get Started',
      skipText: '',
    },
  ],

  getErrorMsg: obj => {
    console.log('obj', obj);
    var arr = [];
    var error = '';

    if (obj && typeof obj === 'object') {
      Object.keys(obj).map(key => {
        console.log(key, obj[key]);
        if (Array.isArray(obj[key])) {
          obj[key].map(er => {
            if (error == '') {
              error = er;
            } else {
              error += ' ' + er;
            }
          });
        } else if (typeof obj[key] === 'string') {
          if (error == '') {
            error = obj[key];
          } else {
            error += ' ' + obj[key];
          }
        }
      });
    }
    console.log('final error=>  ', error);
    return error;
  },

  scheduleHourlyNotif: async () => {
    await notifee.requestPermission();

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'gce_education',
      name: 'GCE-Education',
    });

    const trigger = {
      type: TriggerType.INTERVAL,
      interval: isAppLive ? 3 * 60 : 16,
      timeUnit: TimeUnit.MINUTES, //TimeUnit.HOURS , TimeUnit.MINUTES,
    };

    // const trigger: IntervalTrigger = {
    //   type: TriggerType.INTERVAL,
    //   interval: 16,
    //   timeUnit: TimeUnit.MINUTES, //TimeUnit.MINUTES,
    // };

    var date = moment();
    date = date.add(8 * 60 - 20, 'minute');
    // date = date.add(16, 'minute');
    date = date.set('second', 0);

    console.log('date', date);

    var timeStampPass = date.valueOf();

    console.log('date - time', moment(date).format('DD-MM-yyyy - HH:mm:ss'));
    console.log('timeStampPass', timeStampPass);

    notifee
      .createTriggerNotification(
        {
          id: '123456',
          title: 'GCE-Education',
          body: 'You are still clocked In.',
          android: {
            channelId: channelId,
            smallIcon: 'ic_launcher', // optional, defaults to 'ic_launcher'.
            color: ColorCode.primary,
            // pressAction is needed if you want the notification to open the app when pressed
            pressAction: {
              id: 'mark-as-read',
            },
          },
          data: {
            clockoutTime: moment(date).format('DD-MM-yyyy - HH:mm:ss'),
            timeStamp: timeStampPass,
          },
        },
        trigger,
      )
      .then(() => {
        console.log('Hourly notification scheduled');
      });
  },


  cancelTriggerNotif: () => {
    console.log('Cancel Notification');
    notifee.cancelTriggerNotification('123456').then(() => {
      console.log('Trigger notification cancelled.');
    });
  },

  showErrorMsg: obj => {
    console.log('obj', obj);
    if (obj == 'logout') {
      ToastUtility.showToast('Logout');
    } else if (obj.message) {
      ToastUtility.showToast(obj.message);
    } else if (obj.response) {
      var arr = [];
      var error = '';

      if (obj && typeof obj === 'object') {
        Object.keys(obj).map(key => {
          console.log(key, obj[key]);
          if (Array.isArray(obj[key])) {
            obj[key].map(er => {
              if (error == '') {
                error = er;
              } else {
                error += ' ' + er;
              }
            });
          } else if (typeof obj[key] === 'string') {
            if (error == '') {
              error = obj[key];
            } else {
              error += ' ' + obj[key];
            }
          }
        });
      }
      console.log('final error=>  ', error);
      ToastUtility.showToast(error);
      // return error;
    } else {
      ToastUtility.showToast('Something went wrong.');
    }
  },
  getGradeValue: perc => {
    const numeric =
      typeof perc === 'string'
        ? parseFloat(perc)
        : typeof perc === 'number'
          ? perc
          : NaN;

    if (!Number.isFinite(numeric)) {
      return '--';
    }

    if (numeric >= 90) {
      return 'A';
    }
    if (numeric >= 80) {
      return 'B';
    }
    if (numeric >= 70) {
      return 'C';
    }
    if (numeric >= 60) {
      return 'D';
    }
    if (numeric >= 50) {
      return 'F';
    }

    return 'F';
  },

  secondsToHms: d => {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor((d % 3600) / 60);
    var s = Math.floor((d % 3600) % 60);

    console.log('h:  ' + h, 'M :  ' + m, 'S:  ' + s);

    var hDisplay = h > 0 ? (h < 10 ? '0' + h + ':' : h + ':') : '';
    var mDisplay = m > 0 ? (m < 10 ? '0' + m + ':' : m + ':') : '00:';
    var sDisplay = s > 0 ? (s < 10 ? '' + s : s + '') : '';
    console.log(hDisplay + mDisplay + sDisplay);
    return hDisplay + mDisplay + sDisplay;
  },
};
