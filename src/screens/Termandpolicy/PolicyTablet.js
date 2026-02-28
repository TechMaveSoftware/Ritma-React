import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { Provider } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ColorCode from '../../utility/ColorCode';
import CustomStatus from '../../compenents/CustomStatus';
import CustomSAView from '../../compenents/CustomSAView';
import Fonts from '../../utility/Fonts';
import CustomHeaderTablet from '../../compenents/CustomHeaderTablet';

const screenWidth = Dimensions.get('window').width;
const width = screenWidth > 420 ? 420 / 100 : screenWidth / 100;
const height = Dimensions.get('window').height / 100;

const PolicyTablet = ({ navigation }) => {
    return (
        <Provider>
            <View style={styles.mainContainer}>
                <CustomStatus trans={true} isDark={true} color="#FFFFFF00" />
                <CustomSAView
                    parentStyple={{ flex: 1 }}
                    style={styles.saView}>
                    <CustomHeaderTablet text="Privacy Policy" />
                    <ScrollView
                        style={styles.container}
                        showsVerticalScrollIndicator={false}>
                        <View style={styles.content}>
                            {/* Introduction Section */}
                            <Text style={styles.sectionTitle}>Introduction</Text>
                            <Text style={styles.paragraph}>
                                These Website Standard Terms and Conditions written on this
                                webpage shall manage your use of our website, Website Name
                                accessible at Website.com.
                            </Text>
                            <Text style={styles.paragraph}>
                                These Terms will be applied fully and affect to your use of this
                                Website. By using this Website, you agreed to accept all terms
                                and conditions written in here. You must not use this Website if
                                you disagree with any of these Website Standard Terms and
                                Conditions.
                            </Text>
                            <Text style={styles.paragraph}>
                                Minors or people below 18 years old are not allowed to use this
                                Website.
                            </Text>

                            {/* Cancellation Terms Section */}
                            <Text style={styles.sectionTitle}>Cancellation terms</Text>

                            <View style={styles.bulletList}>
                                <View style={styles.bulletItem}>
                                    <Text style={styles.bullet}>•</Text>
                                    <Text style={styles.bulletText}>
                                        Publicly performing and/or showing any Website material
                                    </Text>
                                </View>

                                <View style={styles.bulletItem}>
                                    <Text style={styles.bullet}>•</Text>
                                    <Text style={styles.bulletText}>
                                        Using this Website in any way that is or may be damaging to
                                        this Website
                                    </Text>
                                </View>

                                <View style={styles.bulletItem}>
                                    <Text style={styles.bullet}>•</Text>
                                    <Text style={styles.bulletText}>
                                        Using this Website in any way that impacts user access to
                                        this Website
                                    </Text>
                                </View>

                                <View style={styles.bulletItem}>
                                    <Text style={styles.bullet}>•</Text>
                                    <Text style={styles.bulletText}>
                                        Engaging in any data mining, data harvesting, data
                                        extracting or any other similar activity in relation to this
                                        Website
                                    </Text>
                                </View>
                            </View>

                            {/* Variation of Terms Section */}
                            <Text style={styles.sectionTitle}>Variation of Terms</Text>
                            <Text style={styles.paragraph}>
                                If any provision of these Terms is found to be invalid under any
                                applicable law
                            </Text>
                        </View>
                    </ScrollView>
                </CustomSAView>
            </View>
        </Provider>
    );
};

export default PolicyTablet;

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: ColorCode.white },
    saView: { flex: 1, backgroundColor: ColorCode.transarent },
    header: {
        width: '100%',
        height: 4.5 * height,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 6 * width,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backBtn: { width: 10 * width, height: 10 * width, justifyContent: 'center' },
    headerTitle: {
        fontSize: 3.5 * width,
        fontFamily: Fonts.SemiBold,
        color: '#000000',
    },
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        padding: width * 2.5,
        paddingBottom: width * 10,
    },
    sectionTitle: {
        fontSize: width * 4,
        fontFamily: Fonts.Bold,
        color: '#000000',
        marginTop: width * 2,
        marginBottom: width * 3,
    },
    paragraph: {
        fontSize: width * 3.4,
        lineHeight: width * 5,
        fontFamily: Fonts.Regular,
        color: '#333333',
        marginBottom: width * 3,
        textAlign: 'left',
    },
    bulletList: {
        marginBottom: width * 4,
    },
    bulletItem: {
        flexDirection: 'row',
        marginBottom: width * 2.5,
        paddingRight: width * 2,
    },
    bullet: {
        fontSize: width * 4,
        color: '#333333',
        marginRight: width * 2,
        marginTop: width * 0,
        minWidth: width * 3,
    },
    bulletText: {
        fontSize: width * 3.4,
        lineHeight: width * 5,
        fontFamily: Fonts.Regular,
        color: '#333333',
        flex: 1,
    },
});
