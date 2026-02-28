import React from 'react';
import { SafeAreaView, View } from 'react-native';

const CustomSAView = props => {
  return (
    <View style={props.parentStyple ?? props.style}>
      <SafeAreaView style={props.style}>
        <View style={[props.style]}>{props.children}</View>
      </SafeAreaView>
    </View>
  );
};

export default CustomSAView;
