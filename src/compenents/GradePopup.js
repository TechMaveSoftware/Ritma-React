import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {Modal} from 'react-native-paper';
import height from '../Units/height';
import width from '../Units/width';
import Fonts from '../utility/Fonts';

const GradePopup = props => {
  return (
    <Modal
      visible={props.show}
      onDismiss={props.onDismiss}
      contentContainerStyle={{
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4 * width,
      }}>
      <View
        style={{
          width: '85%',
          alignSelf: 'center',
          borderRadius: 3 * width,
          backgroundColor: '#FFFFFF',
          paddingVertical: 4 * width,
          paddingHorizontal: 2 * width,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
        <View
          style={{
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: '#BCBCBC',
            paddingBottom: 2 * width,
            marginBottom: 2 * width,
          }}>
          <View style={{flex: 1, alignItems: 'center'}}>
            <Text
              style={{
                color: '#000000',
                fontSize: 3.8 * width,
                fontFamily: Fonts.SemiBold,
              }}>
              Percentage
            </Text>
          </View>
          <View
            style={{width: 1, height: '100%', backgroundColor: '#BCBCBC'}}
          />
          <View style={{flex: 1, alignItems: 'center'}}>
            <Text
              style={{
                color: '#000000',
                fontSize: 3.8 * width,
                fontFamily: Fonts.SemiBold,
              }}>
              Grade
            </Text>
          </View>
        </View>

        <View style={{flexDirection: 'row'}}>
          <View style={{flex: 1, alignItems: 'center'}}>
            <Text
              style={{
                color: '#000000',
                fontSize: 3.5 * width,
                fontFamily: Fonts.Medium,
                paddingVertical: 2 * width,
              }}>
              90-100%
            </Text>
            <Text
              style={{
                color: '#000000',
                fontSize: 3.5 * width,
                fontFamily: Fonts.Medium,
                paddingVertical: 2 * width,
              }}>
              80-89%
            </Text>
            <Text
              style={{
                color: '#000000',
                fontSize: 3.5 * width,
                fontFamily: Fonts.Medium,
                paddingVertical: 2 * width,
              }}>
              70-79%
            </Text>
            <Text
              style={{
                color: '#000000',
                fontSize: 3.5 * width,
                fontFamily: Fonts.Medium,
                paddingVertical: 2 * width,
              }}>
              60-69%
            </Text>
            <Text
              style={{
                color: '#000000',
                fontSize: 3.5 * width,
                fontFamily: Fonts.Medium,
                paddingVertical: 2 * width,
              }}>
              50-59%
            </Text>
          </View>

          <View
            style={{width: 1, backgroundColor: '#BCBCBC', marginHorizontal: 2 * width}}
          />

          <View style={{flex: 1, alignItems: 'center'}}>
            <Text
              style={{
                color: '#000000',
                fontSize: 3.5 * width,
                fontFamily: Fonts.Medium,
                paddingVertical: 2 * width,
              }}>
              A
            </Text>
            <Text
              style={{
                color: '#000000',
                fontSize: 3.5 * width,
                fontFamily: Fonts.Medium,
                paddingVertical: 2 * width,
              }}>
              B
            </Text>
            <Text
              style={{
                color: '#000000',
                fontSize: 3.5 * width,
                fontFamily: Fonts.Medium,
                paddingVertical: 2 * width,
              }}>
              C
            </Text>
            <Text
              style={{
                color: '#000000',
                fontSize: 3.5 * width,
                fontFamily: Fonts.Medium,
                paddingVertical: 2 * width,
              }}>
              D
            </Text>
            <Text
              style={{
                color: '#000000',
                fontSize: 3.5 * width,
                fontFamily: Fonts.Medium,
                paddingVertical: 2 * width,
              }}>
              F
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => props.setShowGrades(false)}
          style={{
            marginTop: 4 * width,
            alignSelf: 'center',
            backgroundColor: '#F0F0F0',
            borderRadius: 2 * width,
            paddingHorizontal: 6 * width,
            paddingVertical: 2 * width,
          }}>
          <Text
            style={{
              color: '#000000',
              fontSize: 3.5 * width,
              fontFamily: Fonts.Medium,
            }}>
            Close
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default GradePopup;
