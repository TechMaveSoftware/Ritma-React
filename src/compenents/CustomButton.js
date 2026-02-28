import React, {Fragment, useEffect} from 'react';
import {
  Image,
  ImageBackground,
  Keyboard,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import height from '../Units/height';
import width from '../Units/width';
import ColorCode from '../utility/ColorCode';
import ConstData from '../utility/ConstData';

const CustomButton = props => {
  return (
    <LinearGradient
      colors={
        props.colors ? props.colors : [ColorCode.primary, ColorCode.secondary]
      } //colors={['#6669AC', '#8D5B98']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={[
        {
          width: 80 * width,
          height: 6.5 * height,
          borderRadius: 2 * width,
          alignSelf: 'center',
        },
        props.btnStyle,
      ]}>
      <TouchableOpacity
        onPress={() => {
          props.onPress && props.enable ? props.onPress() : null;
          Keyboard.dismiss();
        }}
        style={[
          {
            width: '100%',
            height: '100%',
            borderRadius: 2.5 * width,
            alignSelf: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: props.enable ? 'transparent' : '#97979799',
          },
        ]}>
        <Text
          style={[
            {color: ColorCode.white, fontSize: 5 * width},
            props.btnTextStyle,
          ]}>
          {props.btnText ? props.btnText : 'Get Started'}
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default CustomButton;
