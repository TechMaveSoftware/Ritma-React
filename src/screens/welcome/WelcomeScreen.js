import React, { Fragment, useEffect, useState, useRef } from 'react';
import {
  Image,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Provider } from 'react-native-paper';
import CustomButton from '../../compenents/CustomButton';
import ImageView from '../../compenents/ImageView';
import Fonts from '../../utility/Fonts';
import StorageUtility from '../../utility/StorageUtility';
import ConstData from '../../utility/ConstData';
import ColorCode from '../../utility/ColorCode';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  useEffect(() => {
    // Get.Get();
    IntroSet();
  }, []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const IntroSet = async () => {
    await StorageUtility.setShowIntro('1');
  };

  const goToNextSlide = () => {
    if (currentIndex < ConstData.screens.length - 1) {
      flatListRef.current.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      navigation.navigate('Login');
    }
  };

  const goToLastSlide = () => {
    flatListRef.current.scrollToIndex({
      index: ConstData.screens.length - 1,
      animated: true,
    });
  };

  const renderItem = ({ item, index }) => {
    // Use different layout for the third slide (index 2)
    if (index === 2) {
      return (
        <View style={styles.slide}>
          <ImageBackground
            source={item.image}
            style={styles.backgroundImage}
            resizeMode="cover">
            <LinearGradient
              colors={[
                'rgba(0, 0, 0, 0.7)',
                'rgba(0, 0, 0, 0.4)',
                'rgba(0, 0, 0, 0.6)',
              ]}
              style={styles.gradient}>
              <View style={styles.thirdSlideContent}>
                {/* Top text section */}
                <View style={styles.textContainerOverlay}>
                  <Text style={[styles.title, styles.overlayText]}>
                    {item.title}
                  </Text>
                  <Text style={[styles.description, styles.overlayText]}>
                    {item.description}
                  </Text>
                </View>

                {/* Spacer to push button to bottom */}
                <View style={{ flex: 1 }} />

                {/* Bottom button section */}
                <TouchableOpacity
                  style={styles.getStartedButton}
                  onPress={goToNextSlide}>
                  <Text style={styles.buttonText}>{item.buttonText}</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>
      );
    }

    // Regular layout for first and second slides
    return (
      <View style={styles.slide}>
        <View style={styles.imageContainer}>
          <Image
            source={item.image}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>

        <View style={styles.pagination}>
          {ConstData.screens.map((_, i) => (
            <View
              key={i}
              style={[
                styles.paginationDot,
                {
                  backgroundColor:
                    i === currentIndex ? ColorCode.primary : '#E0E0E0',
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={goToNextSlide}>
            <Text style={styles.buttonText}>{item.buttonText}</Text>
          </TouchableOpacity>

          {item.skipText ? (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={goToLastSlide}>
              <Text style={styles.skipButtonText}>{item.skipText}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems[0] != null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <Provider>
      <StatusBar
        animated={true}
        translucent={true}
        backgroundColor="#FFFFFF00"
        barStyle={'dark-content'} // : 'dark-content'
        showHideTransition={'fade'}
      />
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <FlatList
          ref={flatListRef}
          data={ConstData.screens}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
      </View>
    </Provider>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: width * 0.08,
    marginBottom: width * 0.08,
  },
  paginationDot: {
    width: width * 0.08,
    height: 4,
    borderRadius: 4,
    marginHorizontal: width * 0.01,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: width * 0.02,
  },
  imageContainer: {
    width: width * 0.8,
    height: height * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: width * 0.02,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    width: width,
    height: height * 1.07,
  },
  gradient: {
    flex: 1,
  },
  thirdSlideContent: {
    flex: 1,
    paddingTop: width * 0.16,
    paddingHorizontal: width * 0.05,
    paddingBottom: width * 0.16,
  },
  textContainer: {
    alignItems: 'center',
    marginVertical: width * 0.02,
    paddingHorizontal: width * 0.02,
  },
  textContainerOverlay: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '90%',
    marginTop: height * 0.08,
  },
  title: {
    fontSize: width * 0.07,
    fontFamily: Fonts.SemiBold,
    textAlign: 'center',
    marginBottom: width * 0.025,
  },
  description: {
    fontSize: width * 0.038,
    fontFamily: Fonts.Light,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
  },
  overlayText: {
    color: '#FFFFFF',
    textAlign: 'left',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: width * 0.02,
    marginTop: 'auto',
    marginBottom: width * 0.15,
  },
  button: {
    paddingVertical: width * 0.035,
    borderRadius: height * 0.01,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: ColorCode.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  getStartedButton: {
    width: '100%',
    backgroundColor: ColorCode.primary,
    paddingVertical: width * 0.035,
    borderRadius: height * 0.01,
    alignItems: 'center',
    marginBottom: width * 0.15,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  skipButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
});
