import React, {Children} from 'react';
import {ImageBackground, Platform, StatusBar, Text, View} from 'react-native';
import {ActivityIndicator, Modal} from 'react-native-paper';
import height from '../Units/height';
import width from '../Units/width';
import ColorCode from '../utility/ColorCode';

const VerticalText = props => {

  return (
    <View>
      {props.children.split('').map(item => (
        <Text style={[props.style, {lineHeight: props.style.fontSize}]}>{item}</Text>
      ))}
    </View>
  );
};

export default VerticalText;
