import React, { useEffect, useState, useRef } from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Provider } from 'react-native-paper';
import Fonts from '../../utility/Fonts';
import StorageUtility from '../../utility/StorageUtility';
import ConstData from '../../utility/ConstData';
import ColorCode from '../../utility/ColorCode';

const screenWidth = Dimensions.get('window').width;
const width = screenWidth / 100;
const height = Dimensions.get('window').height / 100;

const WelcomeScreenTablet = ({ navigation }) => {
    useEffect(() => {
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
        const isLastSlide = index === ConstData.screens.length - 1;

        if (isLastSlide) {
            return (
                <View style={[styles.slide, styles.lastSlide]}>
                    <ImageBackground
                        source={item.image}
                        style={styles.backgroundImage}
                        resizeMode="cover">
                        <LinearGradient
                            colors={[
                                'rgba(0, 0, 0, 0.65)',
                                'rgba(0, 0, 0, 0.35)',
                                'rgba(0, 0, 0, 0.6)',
                            ]}
                            style={styles.gradient}>
                            <View style={styles.thirdSlideContent}>
                                <View style={styles.textContainerOverlay}>
                                    <Text style={[styles.title, styles.overlayTitle]}>{item.title}</Text>
                                    <Text style={[styles.description, styles.overlayDescription]}>{item.description}</Text>
                                </View>

                                <View style={{ flex: 1 }} />

                                <TouchableOpacity
                                    style={[styles.primaryButton, styles.getStartedButton]}
                                    onPress={goToNextSlide}>
                                    <Text style={styles.buttonText}>{item.buttonText}</Text>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </ImageBackground>
                </View>
            );
        }

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
                                i === currentIndex ? styles.activeDot : styles.inactiveDot,
                            ]}
                        />
                    ))}
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={goToNextSlide}>
                        <Text style={styles.buttonText}>{item.buttonText}</Text>
                    </TouchableOpacity>

                    {item.skipText ? (
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={goToLastSlide}>
                            <Text style={styles.skipButtonText}>{item.skipText}</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={{ height: 6 * height }} />
                    )}
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
                backgroundColor="transparent"
                barStyle={'dark-content'}
            />
            <View style={styles.mainContainer}>
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

export default WelcomeScreenTablet;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    slide: {
        width: screenWidth,
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 6 * width,
    },
    lastSlide: {
        paddingHorizontal: 0,
        alignItems: 'stretch',
    },
    imageContainer: {
        width: '100%',
        height: 48 * height,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2.5 * height,
    },
    image: {
        width: '82%',
        height: '82%',
    },
    textContainer: {
        alignItems: 'center',
        marginTop: 1.2 * height,
        paddingHorizontal: 12 * width,
    },
    title: {
        fontSize: 3.7 * width,
        fontFamily: Fonts.SemiBold,
        color: '#000',
        textAlign: 'center',
        marginBottom: 1 * height,
    },
    description: {
        fontSize: 1.8 * width,
        fontFamily: Fonts.Regular,
        textAlign: 'center',
        color: '#666',
        lineHeight: 2.8 * width,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2.2 * height,
        marginBottom: 2.2 * height,
    },
    paginationDot: {
        height: 1 * width,
        borderRadius: 0.5 * width,
        marginHorizontal: 1 * width,
    },
    activeDot: {
        width: 6 * width,
        backgroundColor: '#1B94EF',
    },
    inactiveDot: {
        width: 2 * width,
        backgroundColor: '#E0E0E0',
    },
    buttonContainer: {
        width: '100%',
        maxWidth: 540,
        marginTop: 'auto',
        marginBottom: 4 * height,
    },
    primaryButton: {
        width: '100%',
        height: 5.8 * height,
        backgroundColor: '#1B94EF',
        borderRadius: 1 * width,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 1.5 * height,
    },
    secondaryButton: {
        width: '100%',
        height: 5.8 * height,
        backgroundColor: '#fff',
        borderRadius: 1 * width,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontFamily: Fonts.Medium,
        fontSize: 1.7 * width,
    },
    skipButtonText: {
        color: '#666',
        fontFamily: Fonts.Medium,
        fontSize: 1.7 * width,
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        flex: 1,
    },
    thirdSlideContent: {
        flex: 1,
        paddingTop: 10 * height,
        paddingHorizontal: 5 * width,
        paddingBottom: 4 * height,
    },
    textContainerOverlay: {
        width: '45%',
        alignItems: 'flex-start',
    },
    overlayTitle: {
        color: '#FFFFFF',
        textAlign: 'left',
        fontSize: 5 * width,
        lineHeight: 5.6 * width,
        marginBottom: 1.2 * height,
    },
    overlayDescription: {
        color: '#FFFFFF',
        textAlign: 'left',
        fontSize: 2.2 * width,
        lineHeight: 3.2 * width,
    },
    getStartedButton: {
        maxWidth: 540,
        alignSelf: 'center',
        marginBottom: 2 * height,
    },
});
