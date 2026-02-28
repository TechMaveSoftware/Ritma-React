import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, SafeAreaView } from 'react-native';
import widthUnits from '../Units/width';
import heightUnits from '../Units/height';
import ColorCode from '../utility/ColorCode';
import Fonts from '../utility/Fonts';

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

const HomeSkeletonTablet = () => {
    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <View>
                    <ShimmerPlaceholder style={styles.greeting} />
                    <ShimmerPlaceholder style={styles.subtitle} />
                </View>
                <ShimmerPlaceholder style={styles.bellIcon} />
            </View>

            {/* Today's Classes Header */}
            <View style={styles.classesHeader}>
                <ShimmerPlaceholder style={styles.classesTitle} />
                <ShimmerPlaceholder style={styles.openSchedule} />
            </View>

            {/* Class Card */}
            <View style={styles.classCard}>
                <ShimmerPlaceholder style={styles.cardHeader} />
                <View style={styles.cardGrid}>
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

            {/* White Body */}
            <View style={styles.whiteBody}>
                {/* Navigation Row (3 items) */}
                <View style={styles.navRow}>
                    {[1, 2, 3].map((i) => (
                        <View key={i} style={styles.navContainer}>
                            <ShimmerPlaceholder style={styles.iconCircle} />
                            <ShimmerPlaceholder style={styles.navText} />
                        </View>
                    ))}
                </View>

                {/* Stats Row (2 items: Quiz & Assignments) */}
                <View style={styles.statsRow}>
                    {[1, 2].map((i) => (
                        <View key={i} style={styles.sideContainer}>
                            <ShimmerPlaceholder style={styles.sideHeader} />
                            <ShimmerPlaceholder style={styles.statsCard} />
                        </View>
                    ))}
                </View>

                {/* Attendance Section */}
                <View style={styles.attendanceContainer}>
                    <View style={styles.attendanceHeader}>
                        <ShimmerPlaceholder style={styles.attendanceTitle} />
                        <View style={styles.legendRow}>
                            <View style={styles.dotPlaceholder} />
                            <ShimmerPlaceholder style={styles.legendText} />
                            <View style={styles.dotPlaceholder} />
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
        backgroundColor: ColorCode.primary,
    },
    header: {
        width: '100%',
        paddingVertical: 2.5 * width,
        paddingHorizontal: 2.5 * width,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        width: 30 * width,
        height: 3.5 * width,
        borderRadius: 4,
        marginBottom: width * 1.5,
    },
    subtitle: {
        width: 45 * width,
        height: 2.6 * width,
        borderRadius: 4,
    },
    bellIcon: {
        width: 8 * width,
        height: 8 * width,
        borderRadius: 4 * width,
    },
    classesHeader: {
        width: '100%',
        paddingHorizontal: 2.5 * width,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: width,
    },
    classesTitle: {
        width: 25 * width,
        height: 3.5 * width,
        borderRadius: 4,
    },
    openSchedule: {
        width: 20 * width,
        height: 2.8 * width,
        borderRadius: 4,
    },
    classCard: {
        paddingHorizontal: width * 5,
        width: '100%',
    },
    cardHeader: {
        width: '100%',
        height: 20 * width,
        backgroundColor: '#FFFFFF',
        marginTop: width * 2,
        marginBottom: width * 1,
        borderRadius: width * 2,
        opacity: 0.1, // Using light color via ShimmerPlaceholder overlay
    },
    cardGrid: {
        padding: width * 4,
        backgroundColor: '#FFFFFF',
        marginBottom: width * 4,
        borderRadius: width * 2,
        width: '100%',
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: width * 2,
    },
    cardItem: {
        width: '48%',
        height: 2.6 * width,
        borderRadius: 4,
    },
    whiteBody: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 2.5 * width,
        paddingTop: 3 * width,
    },
    navRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 3 * width,
    },
    navContainer: {
        width: '31.5%',
        height: 38 * width,
        borderRadius: 4 * width,
        backgroundColor: '#F8FAFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E1E9EE',
    },
    iconCircle: {
        width: 14 * width,
        height: 14 * width,
        borderRadius: 7 * width,
        marginBottom: width * 3,
    },
    navText: {
        width: '60%',
        height: 3 * width,
        borderRadius: 4,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: width * 3,
    },
    sideContainer: {
        width: '48.5%',
        padding: 3.5 * width,
        backgroundColor: '#FFF',
        borderRadius: 3 * width,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    sideHeader: {
        width: 20 * width,
        height: 4 * width,
        borderRadius: 4,
        marginBottom: 3 * width,
    },
    statsCard: {
        width: '100%',
        height: 15 * width,
        backgroundColor: '#F8FAFF',
        borderRadius: 2 * width,
    },
    attendanceContainer: {
        width: '100%',
        marginTop: width * 5,
    },
    attendanceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: width,
        marginBottom: width * 2,
    },
    attendanceTitle: {
        width: 20 * width,
        height: 3.2 * width,
        borderRadius: 4,
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dotPlaceholder: {
        width: 4 * width,
        height: 4 * width,
        borderRadius: 2 * width,
        backgroundColor: '#E1E9EE',
        marginRight: width,
        marginLeft: width * 2,
    },
    legendText: {
        width: 12 * width,
        height: 3.4 * width,
        borderRadius: 4,
    },
    calendarGrid: {
        width: '100%',
        height: 45 * width,
        borderRadius: width * 2,
        marginTop: width * 2,
        borderWidth: 1,
        borderColor: '#EAEAEA',
    },
});

export default HomeSkeletonTablet;
