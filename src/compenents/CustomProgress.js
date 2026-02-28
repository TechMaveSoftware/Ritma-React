import React from 'react';
import {View,Modal} from 'react-native';
import {ActivityIndicator, } from 'react-native-paper';
import height from '../Units/height';
import width from '../Units/width';

const CustomProgress = props => {
  return (
    <Modal
      visible={props.show}
      dismissable={false}
      transparent
      contentContainerStyle={{alignItems: 'center', justifyContent: 'center'}}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0005',
        }}>
        <View
          style={{
            width: 20 * width,
            height: 20 * width,
            backgroundColor: 'white',
            borderRadius: 2 * width,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <ActivityIndicator size={8 * width} color="#8D5B98" />
        </View>
      </View>
    </Modal>
  );
};

export default CustomProgress;
