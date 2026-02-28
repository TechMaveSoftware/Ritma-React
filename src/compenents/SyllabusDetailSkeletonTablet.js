import React, { useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Dimensions,
    ScrollView,
} from 'react-native';

const screenWidth = Dimensions.get('window').width;
const width = screenWidth > 420 ? 420 / 100 : screenWidth / 100;
const height = Dimensions.get('window').height / 100;

const ShimmerPlaceholder = ({ style }) => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const startShimmer = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(shimmerAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(shimmerAnim, {
                        toValue: 0,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        startShimmer();
    }, [shimmerAnim]);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return <Animated.View style={[style, { opacity, backgroundColor: '#E1E9EE' }]} />;
};

const SyllabusDetailSkeletonTablet = () => {
    return (
        <View style={styles.container}>
            {/* Chapter Info Card Placeholder */}
            <View style={styles.infoCard}>
                <ShimmerPlaceholder style={styles.infoTitlePlaceholder} />
                <ShimmerPlaceholder style={styles.infoSubtitlePlaceholder} />
                <View style={styles.metaRow}>
                    <ShimmerPlaceholder style={styles.metaChipPlaceholder} />
                    <ShimmerPlaceholder style={styles.metaChipPlaceholder} />
                    <ShimmerPlaceholder style={styles.metaChipPlaceholder} />
                </View>
            </View>

            {/* Segmented Control Placeholder */}
            <View style={styles.segmentedContainer}>
                <ShimmerPlaceholder style={styles.segmentedTabPlaceholder} />
                <ShimmerPlaceholder style={styles.segmentedTabPlaceholder} />
                <ShimmerPlaceholder style={styles.segmentedTabPlaceholder} />
            </View>

            {/* List of Detail Cards Placeholder */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 5 * height }}>
                {[1, 2, 3, 4].map((item) => (
                    <View key={item} style={styles.lessonCard}>
                        <View style={{ flex: 1 }}>
                            <ShimmerPlaceholder style={styles.lessonTitlePlaceholder} />
                            <View style={{ flexDirection: 'row', marginTop: width * 1.5 }}>
                                <ShimmerPlaceholder style={styles.lessonMetaPlaceholder} />
                                <ShimmerPlaceholder style={[styles.lessonMetaPlaceholder, { width: width * 15, marginLeft: width * 2 }]} />
                            </View>
                            <ShimmerPlaceholder style={[styles.lessonTitlePlaceholder, { width: '80%', marginTop: width * 1.5, height: width * 2.5 }]} />
                        </View>
                        <ShimmerPlaceholder style={styles.chevronPlaceholder} />
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        paddingHorizontal: 2.5 * width,
        paddingTop: 1.9 * height,
        backgroundColor: '#fff',
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        width: '100%',
        borderRadius: width * 3,
        padding: width * 4.75,
        marginBottom: height * 2.85,
        borderWidth: 1,
        borderColor: '#F0F0FF',
    },
    infoTitlePlaceholder: {
        height: width * 5,
        width: '50%',
        borderRadius: width * 1,
        marginBottom: width * 2,
    },
    infoSubtitlePlaceholder: {
        height: width * 3.5,
        width: '80%',
        borderRadius: width * 1,
        marginBottom: width * 3.5,
    },
    metaRow: {
        flexDirection: 'row',
        gap: width * 3,
    },
    metaChipPlaceholder: {
        height: width * 5.5,
        width: width * 20,
        borderRadius: width * 5,
    },
    segmentedContainer: {
        flexDirection: 'row',
        gap: width * 2,
        marginBottom: height * 2.85,
        width: '100%',
    },
    segmentedTabPlaceholder: {
        flex: 1,
        height: height * 4,
        borderRadius: width * 2,
    },
    lessonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: width * 3.8,
        borderRadius: width * 3,
        marginBottom: width * 2.85,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        width: '100%',
    },
    lessonTitlePlaceholder: {
        height: width * 3.8,
        width: '40%',
        borderRadius: width * 1,
    },
    lessonMetaPlaceholder: {
        height: width * 3,
        width: width * 10,
        borderRadius: width * 1,
    },
    chevronPlaceholder: {
        height: width * 4,
        width: width * 4,
        borderRadius: width * 1,
        marginLeft: width * 2,
    },
});

export default SyllabusDetailSkeletonTablet;
