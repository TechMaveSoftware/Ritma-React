import Toast from 'react-native-simple-toast';

export default {
  showToast: msg => {
    if (msg) {
      if (typeof msg === 'object') {
        Toast.show(JSON.stringify(msg));
      } else {
        Toast.show(String(msg));
      }
    }
  },
  // showCenterToast: msg => {
  //   Toast.showWithGravity(msg, Toast.LONG, Toast.CENTER);
  // },
};
