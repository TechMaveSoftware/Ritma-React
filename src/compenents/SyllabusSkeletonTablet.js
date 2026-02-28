import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ScrollView, Dimensions } from 'react-native';
import ColorCode from '../utility/ColorCode';

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

const SyllabusSkeletonTablet = () => {
    return (
        <View style={styles.container}>
            {/* Standard Tablet Header Placeholder */}
            <View style={styles.headerPlaceholder}>
                <ShimmerPlaceholder style={styles.backBtnPlaceholder} />
                <ShimmerPlaceholder style={styles.titlePlaceholder} />
                <View style={{ width: 10 * width }} />
            </View>
            <View style={{ width: '100%', height: 0.1 * height, backgroundColor: '#E5E5E5' }} />

            {/* Subject tabs */}
            <View style={styles.tabContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContainer}>
                    {[1, 2, 3, 4].map((i) => (
                        <ShimmerPlaceholder key={i} style={styles.tabButton} />
                    ))}
                </ScrollView>
            </View>

            {/* Course Info Section */}
            <View style={styles.courseInfoContainer}>
                <ShimmerPlaceholder style={styles.courseDescription} />
                <ShimmerPlaceholder style={styles.courseDescriptionSmall} />
                <View style={styles.metaChipContainer}>
                    <ShimmerPlaceholder style={styles.metaChip} />
                    <ShimmerPlaceholder style={styles.metaChip} />
                </View>
            </View>

            {/* List of Chapter Cards */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: height * 8, alignItems: 'center' }}>
                {[1, 2].map((i) => (
                    <View key={i} style={styles.chapterCard}>
                        {/* Status Header */}
                        <View style={styles.cardHeader}>
                            <ShimmerPlaceholder style={styles.cardMetaItem} />
                            <ShimmerPlaceholder style={styles.cardMetaItem} />
                        </View>

                        {/* Chapter Info */}
                        <ShimmerPlaceholder style={styles.chapterTitle} />
                        <ShimmerPlaceholder style={styles.chapterSubText} />

                        {/* Goals Section */}
                        <ShimmerPlaceholder style={styles.goalsTitle} />
                        {[1, 2].map((j) => (
                            <View key={j} style={styles.goalItem}>
                                <ShimmerPlaceholder style={styles.goalText} />
                            </View>
                        ))}

                        {/* Action Buttons */}
                        <View style={styles.cardActions}>
                            <ShimmerPlaceholder style={styles.viewDetailsBtn} />
                            <ShimmerPlaceholder style={styles.markCompletedBtn} />
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        width: '100%',
    },
    headerPlaceholder: {
        width: '100%',
        height: 6 * height,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 3 * width,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backBtnPlaceholder: {
        width: 8 * width,
        height: 8 * width,
        borderRadius: 4 * width,
    },
    titlePlaceholder: {
        width: 30 * width,
        height: 4 * width,
        borderRadius: 4,
    },
    tabContainer: {
        width: '100%',
        paddingHorizontal: 2.5 * width,
        marginTop: 4 * width,
    },
    tabScrollContainer: {
        paddingHorizontal: 3 * width,
    },
    tabButton: {
        width: 20 * width,
        height: 8 * width,
        borderRadius: 2 * width,
        marginRight: 3 * width,
    },
    courseInfoContainer: {
        width: '95%',
        alignSelf: 'center',
        marginTop: 3 * width,
        marginBottom: 3 * width,
    },
    courseDescription: {
        width: '100%',
        height: 3 * width,
        borderRadius: 4,
        marginBottom: 1.5 * width,
    },
    courseDescriptionSmall: {
        width: '70%',
        height: 3 * width,
        borderRadius: 4,
        marginBottom: 2 * width,
    },
    metaChipContainer: {
        flexDirection: 'row',
        marginTop: 2 * width,
    },
    metaChip: {
        width: 15 * width,
        height: 5 * width,
        borderRadius: 5 * width,
        marginRight: 3 * width,
    },
    chapterCard: {
        width: '95%',
        padding: 3.5 * width,
        borderRadius: 3 * width,
        backgroundColor: '#FFFFFF',
        marginBottom: 3 * width,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    cardHeader: {
        flexDirection: 'row',
        marginBottom: 2.5 * width,
    },
    cardMetaItem: {
        width: 15 * width,
        height: 3 * width,
        borderRadius: 4,
        marginRight: 3 * width,
    },
    chapterTitle: {
        width: '70%',
        height: 4.5 * width,
        borderRadius: 4,
        marginBottom: 2 * width,
    },
    chapterSubText: {
        width: '50%',
        height: 3 * width,
        borderRadius: 4,
        marginBottom: 3.5 * width,
    },
    goalsTitle: {
        width: 30 * width,
        height: 3.2 * width,
        borderRadius: 4,
        marginBottom: 2.5 * width,
    },
    goalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 1.5 * width,
    },
    goalText: {
        width: '95%',
        height: 2.5 * width,
        borderRadius: 4,
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 3 * width,
    },
    viewDetailsBtn: {
        width: '48%',
        height: 8 * width,
        borderRadius: 2 * width,
    },
    markCompletedBtn: {
        width: '48%',
        height: 8 * width,
        borderRadius: 2 * width,
    },
});

export default SyllabusSkeletonTablet;
