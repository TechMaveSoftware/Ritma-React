import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, ScrollView } from 'react-native';
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

const SkeletonCard = () => (
    <View style={styles.card}>
        {/* Title */}
        <ShimmerPlaceholder style={styles.title} />

        {/* Assigned On Row */}
        <View style={styles.row}>
            <ShimmerPlaceholder style={styles.icon} />
            <ShimmerPlaceholder style={styles.label} />
            <ShimmerPlaceholder style={styles.date} />
        </View>

        {/* Submitted On Row */}
        <View style={styles.row}>
            <ShimmerPlaceholder style={styles.icon} />
            <ShimmerPlaceholder style={styles.label} />
            <ShimmerPlaceholder style={styles.date} />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
            <ShimmerPlaceholder style={styles.footerButton} />
            <ShimmerPlaceholder style={styles.footerButton} />
        </View>
    </View>
);

const AssignmentSkeleton = () => {
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={{ paddingHorizontal: 5 * width, paddingTop: 3 * width }}>
                {[1, 2, 3, 4, 5].map(i => (
                    <SkeletonCard key={i} />
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        width: '70%',
        height: 2.5 * height,
        borderRadius: 4,
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    icon: {
        width: 16,
        height: 16,
        borderRadius: 8,
    },
    label: {
        width: '30%',
        height: 1.5 * height,
        borderRadius: 4,
        marginLeft: 10,
    },
    date: {
        width: '25%',
        height: 1.5 * height,
        borderRadius: 4,
        marginLeft: 10,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    footerButton: {
        width: '45%',
        height: 4 * height,
        borderRadius: 5,
    },
});

export default AssignmentSkeleton;
