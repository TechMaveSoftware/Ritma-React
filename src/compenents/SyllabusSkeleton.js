import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ScrollView } from 'react-native';
import widthUnits from '../Units/width';
import heightUnits from '../Units/height';
import ColorCode from '../utility/ColorCode';

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

const SyllabusSkeleton = () => {
    return (
        <View style={styles.container}>
            {/* Subject tabs */}
            <View style={styles.tabContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContainer}>
                    {[1, 2, 3].map((i) => (
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
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: height * 5 }}>
                {[1, 2, 3].map((i) => (
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
    tabContainer: {
        width: '100%',
        paddingHorizontal: 2.5 * width,
        marginTop: 4 * width,
    },
    tabScrollContainer: {
        paddingHorizontal: 3 * width,
    },
    tabButton: {
        width: 25 * width,
        height: 10 * width,
        borderRadius: 2 * width,
        marginRight: 3 * width,
    },
    courseInfoContainer: {
        width: '92%',
        alignSelf: 'center',
        marginTop: 5 * width,
        marginBottom: 3 * width,
    },
    courseDescription: {
        width: '100%',
        height: 4 * width,
        borderRadius: 4,
        marginBottom: 2 * width,
    },
    courseDescriptionSmall: {
        width: '60%',
        height: 4 * width,
        borderRadius: 4,
        marginBottom: 3 * width,
    },
    metaChipContainer: {
        flexDirection: 'row',
        marginTop: 2 * width,
    },
    metaChip: {
        width: 20 * width,
        height: 6 * width,
        borderRadius: 5 * width,
        marginRight: 3 * width,
    },
    chapterCard: {
        width: '92%',
        alignSelf: 'center',
        padding: 4 * width,
        borderRadius: 4 * width,
        backgroundColor: '#FFFFFF',
        marginBottom: 4 * width,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    cardHeader: {
        flexDirection: 'row',
        marginBottom: 3 * width,
    },
    cardMetaItem: {
        width: 20 * width,
        height: 3.5 * width,
        borderRadius: 4,
        marginRight: 4 * width,
    },
    chapterTitle: {
        width: '80%',
        height: 5 * width,
        borderRadius: 4,
        marginBottom: 2 * width,
    },
    chapterSubText: {
        width: '60%',
        height: 3.5 * width,
        borderRadius: 4,
        marginBottom: 4 * width,
    },
    goalsTitle: {
        width: 40 * width,
        height: 3.5 * width,
        borderRadius: 4,
        marginBottom: 3 * width,
    },
    goalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2 * width,
    },
    goalText: {
        width: '90%',
        height: 3 * width,
        borderRadius: 4,
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4 * width,
    },
    viewDetailsBtn: {
        width: '48%',
        height: 10 * width,
        borderRadius: 2 * width,
    },
    markCompletedBtn: {
        width: '48%',
        height: 10 * width,
        borderRadius: 2 * width,
    },
});

export default SyllabusSkeleton;
