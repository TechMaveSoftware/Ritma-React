import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Image } from 'react-native';
import ColorCode from '../utility/ColorCode';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fonts from '../utility/Fonts';
import width from '../Units/width';

const HeaderWithBack = ({
  title,
  rightIcon = null,
  leftClick = null,
  backgroundColor = ColorCode.white,
  textColor = ColorCode.black,
}) => {
  const navigation = useNavigation();
  return (
    <View style={{overflow: 'hidden', paddingBottom: 2}}>
      <View
        style={[
          {
            backgroundColor: backgroundColor,
            height: 65,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: 100 * width,
            elevation: 1,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.2,
            marginBottom: 3,
            elevation: 5,
          },
        ]}>
        <TouchableOpacity
          style={{
            backgroundColor: '#F3F3F3',
            width: 8 * width,
            height: 8 * width,
            borderRadius: 2 * width,
            alignItems: 'center',
            start: 4 * width,
            justifyContent: 'center',
            position: 'absolute',
          }}
          onPress={leftClick ? leftClick : () => navigation.goBack()}>
          <Ionicons name="chevron-back" size={5 * width} color="#000000" />
          {/* <Image
            source={require('../assets/images/arraow_back_ic.png')}
            style={{
              width: 4 * width,
              height: 4 * width,
              resizeMode: 'contain',
            }}
          /> */}
        </TouchableOpacity>
        <Text
          style={{
            width: '60%',
            color: textColor,
            textAlign: 'center',
            fontFamily: Fonts.Bold,
            fontSize: 4 * width,
          }}
          numberOfLines={1}>
          {title}
        </Text>
        {rightIcon}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: ColorCode.primary,
    borderRadius: 2 * width,
    justifyContent: 'center',
    alignItems: 'center',
    height: 14 * width,
  },
  buttonText: {
    color: ColorCode.white,
    fontFamily: Fonts.Bold,
    fontSize: 3.5 * width,
  },
});
export default HeaderWithBack;
