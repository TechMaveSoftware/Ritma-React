import { Text, TouchableOpacity, View, Platform, StatusBar } from 'react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import width from '../Units/width';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ColorCode from '../utility/ColorCode';
import height from '../Units/height';
import Fonts from '../utility/Fonts';
import { useNavigation } from '@react-navigation/native';

const CustomHeader = ({ text, customStyle, titleStyle }) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Get status bar height for proper spacing
  // When used with SafeAreaView and translucent StatusBar, SafeAreaView handles safe area
  // But we need minimal padding to ensure header doesn't hide under status bar
  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : insets.top;

  return (
    <View style={{ backgroundColor: '#fff' }}>
      {/* White background behind status bar area - extends to very top */}
      {Platform.OS === 'android' && statusBarHeight > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -statusBarHeight,
            left: 0,
            right: 0,
            height: statusBarHeight,
            backgroundColor: '#fff',
          }}
        />
      )}
      <View
        style={[
          {
            width: '94%',
            alignSelf: 'center',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: height * 0.8,
            marginTop: Platform.OS === 'ios' ? 0 : height * 1.5,
          },
          customStyle,
        ]}>
        <TouchableOpacity
          style={{ position: 'absolute', left: 0, zIndex: 10 }}
          onPress={() => navigation.goBack()}>
          <AntDesign size={24} color={'#000'} name="arrowleft" />
        </TouchableOpacity>
        <Text
          style={[
            {
              textAlign: 'center',
              flex: 1,
              fontSize: 4 * width,
              fontFamily: Fonts.SemiBold,
              paddingHorizontal: width * 8,
            },
            titleStyle,
          ]}>
          {text}
        </Text>
      </View>
      <View
        style={{
          height: 1,
          width: '100%',
          backgroundColor: ColorCode.greyAAA,
          // marginTop: height * 2,
        }}
      />
    </View>
  );
};

export default CustomHeader;
