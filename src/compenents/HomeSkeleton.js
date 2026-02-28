import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
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

const HomeSkeleton = () => {
    return (
        <View style={styles.container}>
            {/* Header Section (Blue Background) */}
            <View style={styles.blueHeader}>
                {/* Greeting & Bell Row */}
                <View style={styles.headerContent}>
                    <View>
                        <ShimmerPlaceholder style={styles.headerTitle} />
                        <ShimmerPlaceholder style={styles.headerSubtitle} />
                    </View>
                    <ShimmerPlaceholder style={styles.bellIcon} />
                </View>

                {/* Today's Classes Header Row */}
                <View style={styles.tabHeader}>
                    <ShimmerPlaceholder style={styles.tabTitle} />
                    <ShimmerPlaceholder style={styles.tabLink} />
                </View>

                {/* Floating Class Card */}
                <View style={styles.classCard}>
                    <ShimmerPlaceholder style={styles.cardTitle} />
                    <View style={styles.cardRow}>
                        <ShimmerPlaceholder style={styles.cardItem} />
                        <ShimmerPlaceholder style={styles.cardItem} />
                    </View>
                    <View style={styles.cardRow}>
                        <ShimmerPlaceholder style={styles.cardItem} />
                        <ShimmerPlaceholder style={styles.cardItem} />
                    </View>
                </View>
            </View>

            {/* Scrollable Content Area */}
            <View style={styles.whiteBody}>
                {/* Menu Items Row (Matched paddingHorizontal: 5*width) */}
                <View style={styles.menuContainer}>
                    <View style={styles.menuRow}>
                        <ShimmerPlaceholder style={styles.menuItem} />
                        <ShimmerPlaceholder style={styles.menuItem} />
                        <ShimmerPlaceholder style={styles.menuItem} />
                    </View>
                </View>

                {/* Assignments Section (Matched width: '92%', alignSelf: 'center') */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <ShimmerPlaceholder style={styles.sectionTitle} />
                        <ShimmerPlaceholder style={styles.sectionIcon} />
                    </View>
                    <ShimmerPlaceholder style={styles.statsRow} />
                </View>

                {/* Quiz Section (Matched width: '92%', alignSelf: 'center') */}
                <View style={styles.sectionCard}>
                    <ShimmerPlaceholder style={styles.sectionTitle} />
                    <ShimmerPlaceholder style={styles.statsRow} />
                </View>

                {/* Attendance Section (Matched width: '100%', paddingHorizontal: 4*width) */}
                <View style={styles.attendanceContainer}>
                    <View style={styles.sectionHeader}>
                        <ShimmerPlaceholder style={styles.sectionTitle} />
                        <View style={styles.legendRow}>
                            <View style={styles.dot} />
                            <ShimmerPlaceholder style={styles.legendText} />
                            <View style={[styles.dot, { backgroundColor: '#FF0000' }]} />
                            <ShimmerPlaceholder style={styles.legendText} />
                        </View>
                    </View>
                    <ShimmerPlaceholder style={styles.calendarGrid} />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    blueHeader: {
        width: '100%',
        backgroundColor: ColorCode.primary,
        paddingBottom: 2 * height,
    },
    headerContent: {
        width: '100%',
        height: 10 * height,
        paddingHorizontal: 6 * width,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        width: 35 * width,
        height: 2.5 * height,
        borderRadius: 4,
        marginBottom: 8,
    },
    headerSubtitle: {
        width: 50 * width,
        height: 1.5 * height,
        borderRadius: 4,
    },
    bellIcon: {
        width: 8 * width,
        height: 8 * width,
        borderRadius: 4 * width,
    },
    tabHeader: {
        paddingHorizontal: 6 * width,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 1 * height,
    },
    tabTitle: {
        width: 25 * width,
        height: 2 * height,
        borderRadius: 4,
    },
    tabLink: {
        width: 20 * width,
        height: 1.5 * height,
        borderRadius: 4,
    },
    classCard: {
        marginHorizontal: 5 * width,
        padding: 4 * width,
        backgroundColor: '#FFFFFF',
        borderRadius: 2 * width,
        marginTop: 2 * width,
        marginBottom: 4 * width,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        width: '60%',
        height: 2 * height,
        borderRadius: 4,
        marginBottom: 2 * height,
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 1.5 * height,
    },
    cardItem: {
        width: '45%',
        height: 1.5 * height,
        borderRadius: 4,
    },
    whiteBody: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: 3 * width,
    },
    menuContainer: {
        paddingHorizontal: 5 * width,
        marginBottom: 3 * width,
    },
    menuRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    menuItem: {
        width: '32%', // Matched Styles.halfRoundShape
        height: 13 * height, // Matched Styles.halfRoundShape
        borderRadius: 3 * width,
    },
    sectionCard: {
        width: '92%',
        alignSelf: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 1 * height,
        padding: 4 * width,
        marginBottom: 2 * height,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2 * width,
    },
    sectionTitle: {
        width: 25 * width,
        height: 2 * height,
        borderRadius: 4,
    },
    sectionIcon: {
        width: 8 * width,
        height: 8 * width,
        borderRadius: 2 * width,
    },
    statsRow: {
        width: '100%',
        height: 10 * height, // Matched actual stats box height roughly
        backgroundColor: '#F7F5FF',
        borderRadius: 1 * height,
        marginTop: width,
    },
    attendanceContainer: {
        width: '100%',
        paddingHorizontal: 4 * width,
        marginTop: width * 2,
        marginBottom: 10 * width,
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 4 * width,
        height: 4 * width,
        borderRadius: 2 * width,
        backgroundColor: '#16763E',
        marginRight: 1 * width,
    },
    legendText: {
        width: 12 * width,
        height: 1.5 * height,
        borderRadius: 2,
        marginRight: 3 * width,
    },
    calendarGrid: {
        width: '100%',
        height: 30 * height,
        borderRadius: 2 * width,
        marginTop: 2 * width,
        borderWidth: 1,
        borderColor: '#EAEAEA',
    },
});

export default HomeSkeleton;
