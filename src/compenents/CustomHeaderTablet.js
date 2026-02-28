import { Text, TouchableOpacity, View, Dimensions } from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fonts from '../utility/Fonts';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;
const width = (screenWidth > 420 ? 420 : screenWidth) * 0.01;
const height = Dimensions.get('window').height / 100;

const CustomHeaderTablet = ({ text, customStyle }) => {
    const navigation = useNavigation();

    return (
        <View
            style={[
                {
                    width: '100%',
                    height: 6 * height,
                    backgroundColor: '#FFFFFF',
                    paddingHorizontal: 3 * width,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottomWidth: 1,
                    borderBottomColor: '#E2E8F0',
                },
                customStyle,
            ]}>
            <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{
                    width: 8 * width,
                    height: 8 * width,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                <Ionicons
                    name="chevron-back"
                    size={6 * width}
                    color={'#000'}
                />
            </TouchableOpacity>
            <Text
                style={{
                    fontSize: 3.5 * width,
                    fontFamily: Fonts.SemiBold,
                    color: '#000000',
                    textAlign: 'center',
                    flex: 1,
                }}>
                {text}
            </Text>
            <View style={{ width: 10 * width }} />
        </View>
    );
};

export default CustomHeaderTablet;
