import React, {Fragment, useEffect} from 'react';
import {Image, ImageBackground, StatusBar, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Provider} from 'react-native-paper';
import ImageView from '../../compenents/ImageView';
import width from '../../Units/width';
import ColorCode from '../../utility/ColorCode';

const AndroidSplashScreen = ({navigation}) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('Waiting');
    }, 3000);

    // Get.Get();
  }, []);

  return (
    <Provider>
      <StatusBar
        animated={true}
        translucent={true}
        backgroundColor="#FFFFFF00"
        barStyle={'dark-content'} // : 'dark-content'
        showHideTransition={'fade'}
      />

      <View
        style={{
          flex: 1,
          backgroundColor: '#fff',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Image
          source={require('../../assets/images/appLogo.png')}
          style={{width: 80 * width, height: 80 * width, resizeMode: 'contain'}}
        />
        
        <Text
          style={{
            position: 'absolute',
            bottom: 50,
            textAlign: 'center',
            color: '#000',
            fontSize: 14,
            fontWeight: 'bold',
          }}>
          Powered by Ritma Edtech
        </Text>
      </View>
    </Provider>
  );
};

export default AndroidSplashScreen;
