import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ScrollView, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const width = screenWidth > 420 ? 420 / 100 : screenWidth / 100;
const height = Dimensions.get('window').height / 100;

const ShimmerPlaceholder = ({ style }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return <Animated.View style={[style, { opacity, backgroundColor: '#E1E9EE' }]} />;
};

const SkeletonNoticeCard = () => (
    <View style={styles.alertItem}>
        <ShimmerPlaceholder style={styles.iconContainer} />
        <View style={styles.contentContainer}>
            <ShimmerPlaceholder style={styles.noticeTitle} />
            <ShimmerPlaceholder style={styles.noticeSubtitle} />
            <ShimmerPlaceholder style={styles.noticeSubtitleShort} />
            <ShimmerPlaceholder style={styles.noticeDate} />
        </View>
    </View>
);

const NoticeSkeletonTablet = () => {
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.dateSection}>
                <ShimmerPlaceholder style={styles.dateHeader} />
                {[1, 2, 3, 4].map(i => (
                    <SkeletonNoticeCard key={i} />
                ))}
            </View>
            <View style={styles.dateSection}>
                <ShimmerPlaceholder style={styles.dateHeader} />
                {[5, 6].map(i => (
                    <SkeletonNoticeCard key={i} />
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 2.5 * width,
        paddingTop: 3 * width,
        backgroundColor: '#FCFCFC'
    },
    dateSection: {
        marginBottom: 6 * width,
    },
    dateHeader: {
        width: 20 * width,
        height: 2.5 * width,
        borderRadius: 4,
        marginBottom: 1.5 * width,
        marginLeft: 1 * width,
    },
    alertItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 3 * width,
        marginBottom: 1.5 * width,
        borderRadius: 3 * width,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        backgroundColor: '#fff',
    },
    iconContainer: {
        width: 5 * width,
        height: 5 * width,
        borderRadius: 2.5 * width,
        marginRight: 2 * width,
    },
    contentContainer: {
        flex: 1,
    },
    noticeTitle: {
        width: '50%',
        height: 2.5 * width,
        borderRadius: 4,
        marginBottom: 1 * width,
    },
    noticeSubtitle: {
        width: '85%',
        height: 2 * width,
        borderRadius: 4,
        marginBottom: 0.8 * width,
    },
    noticeSubtitleShort: {
        width: '35%',
        height: 2 * width,
        borderRadius: 4,
        marginBottom: 1 * width,
    },
    noticeDate: {
        width: 15 * width,
        height: 1.8 * width,
        borderRadius: 4,
        marginTop: 0.5 * width,
    },
});

export default NoticeSkeletonTablet;
