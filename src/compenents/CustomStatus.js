import React from 'react';
import { Platform, StatusBar, View } from 'react-native';

const CustomStatus = props => {
  // return;
  // Platform.OS == 'android' ? (
  //   <StatusBar
  //     animated={true}
  //     translucent={props.trans ? props.trans : false}
  //     backgroundColor={props.color ? props.color : '#FFFFFF00'}
  //     barStyle={props.isDark ? 'dark-content' : 'light-content'} // : 'dark-content'
  //     showHideTransition={'slide'}
  //   />
  // ) : (
  // console.log('StatusBar.currentHeight', StatusBar.currentHeight);
  return (
    <View
      style={{
        width: '100%',
        height: Platform.OS == 'ios' ? 0 : (StatusBar.currentHeight || 30),
        backgroundColor: props.color ? props.color : '#FFFFFF',
      }}>
      <StatusBar
        animated={true}
        translucent={props.trans ? props.trans : false}
        backgroundColor={props.color ? props.color : '#FFFFFF00'}
        barStyle={props.isDark ? 'dark-content' : 'light-content'} // : 'dark-content'
        showHideTransition={'slide'}
      />
    </View >
  );
  // );
};

export default CustomStatus;
