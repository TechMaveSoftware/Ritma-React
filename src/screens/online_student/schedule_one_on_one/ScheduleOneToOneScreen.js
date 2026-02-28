import React, {Fragment, useEffect, useState} from 'react';
import {Image, ImageBackground, StatusBar, Text, TextInput, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Modal, Provider} from 'react-native-paper';
import ApiMethod from '../../../api/ApiMethod';
import CustomProgress from '../../../compenents/CustomProgress';
import CustomSAView from '../../../compenents/CustomSAView';
import CustomStatus from '../../../compenents/CustomStatus';
import HeaderWithBack from '../../../compenents/HeaderWithBack';
import height from '../../../Units/height';
import width from '../../../Units/width';
import ColorCode from '../../../utility/ColorCode';
import ConstData from '../../../utility/ConstData';
import Fonts from '../../../utility/Fonts';
import ToastUtility from '../../../utility/ToastUtility';
import MonthlyCalendar from './MonthlyCalendar';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ScheduleOneToOneScreen = ({navigation}) => {
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    // Get.Get();
  }, []);

  
  return (
    <Provider>
      <View
        style={{
          flex: 1,
          backgroundColor: ColorCode.white,
        }}>
        <CustomStatus trans={true} isDark={false} color="#FFFFFF00" />
        <View
          style={{
            width: '100%',
            height: '10%',
            position: 'absolute',
            backgroundColor: ColorCode.primary,
          }}
        />
        <CustomSAView
          parentStyple={{flex: 1, backgroundColor: ColorCode.transarent}}
          style={{flex: 1, backgroundColor: ColorCode.transarent}}>
          <HeaderWithBack
            title="Calendar"
            backgroundColor={ColorCode.primary}
            textColor={ColorCode.white}
          />
          <View
            style={{
              flex: 1,
              borderRadius: 2 * width,
              backgroundColor: ColorCode.white,
            }}>
            <MonthlyCalendar setProgress={setShowProgress} />
          </View>
        </CustomSAView>
      </View>

      <CustomProgress show={showProgress} />
    </Provider>
  );
};

export default ScheduleOneToOneScreen;
