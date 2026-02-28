import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ScrollView } from 'react-native';
import widthUnits from '../Units/width';
import heightUnits from '../Units/height';

const width = widthUnits;
const height = heightUnits;

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

const NoticeSkeleton = () => {
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.dateSection}>
                <ShimmerPlaceholder style={styles.dateHeader} />
                {[1, 2, 3].map(i => (
                    <SkeletonNoticeCard key={i} />
                ))}
            </View>
            <View style={styles.dateSection}>
                <ShimmerPlaceholder style={styles.dateHeader} />
                {[4, 5].map(i => (
                    <SkeletonNoticeCard key={i} />
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 4 * width,
        paddingTop: 3 * width,
        backgroundColor: '#FCFCFC'
    },
    dateSection: {
        marginBottom: 6 * width,
    },
    dateHeader: {
        width: 30 * width,
        height: 4 * width,
        borderRadius: 4,
        marginBottom: 3 * width,
        marginLeft: 1 * width,
    },
    alertItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4 * width,
        marginBottom: 2 * width,
        borderRadius: 3 * width,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        backgroundColor: '#fff',
    },
    iconContainer: {
        width: 8 * width,
        height: 8 * width,
        borderRadius: 4 * width,
        marginRight: 3 * width,
    },
    contentContainer: {
        flex: 1,
    },
    noticeTitle: {
        width: '60%',
        height: 4 * width,
        borderRadius: 4,
        marginBottom: 2 * width,
    },
    noticeSubtitle: {
        width: '90%',
        height: 3 * width,
        borderRadius: 4,
        marginBottom: 1.5 * width,
    },
    noticeSubtitleShort: {
        width: '40%',
        height: 3 * width,
        borderRadius: 4,
        marginBottom: 2 * width,
    },
    noticeDate: {
        width: 20 * width,
        height: 2.5 * width,
        borderRadius: 4,
        marginTop: 1 * width,
    },
});

export default NoticeSkeleton;
