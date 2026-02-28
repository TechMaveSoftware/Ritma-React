import React, {Children} from 'react';
import {ImageBackground, Platform, StatusBar, View} from 'react-native';
import {ActivityIndicator, Modal} from 'react-native-paper';
import height from '../Units/height';
import width from '../Units/width';
import ColorCode from '../utility/ColorCode';

const ImageView = props => {
  return (
    <ImageBackground
      source={require('../assets/images/splash_bg.png')}
      resizeMode={'stretch'}
      style={[
        {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        props.style && props.style,
      ]}>
      {props.children}
    </ImageBackground>
  );
};

export default ImageView;
