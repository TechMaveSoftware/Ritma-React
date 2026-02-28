import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import ColorCode from '../utility/ColorCode';
import Fonts from '../utility/Fonts';
import Feather from 'react-native-vector-icons/Feather';

const { width, height } = Dimensions.get('window');

// Tablet detection
const isTablet = width >= 600;
const scale = isTablet ? 1.2 : 0.95;

const CustomLogoutModal = ({ visible, onConfirm, onCancel }) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.iconContainer}>
                        <Feather name="log-out" size={24 * scale} color={ColorCode.primary} />
                    </View>

                    <Text style={styles.title}>Logout</Text>
                    <Text style={styles.message}>Are you sure you want to logout?</Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onCancel}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.confirmButton]}
                            onPress={onConfirm}
                        >
                            <Text style={styles.confirmButtonText}>Yes, Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: isTablet ? '44%' : '80%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16 * scale,
        padding: 16 * scale,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    iconContainer: {
        width: 52 * scale,
        height: 52 * scale,
        backgroundColor: '#F0F9FF', // Light blue background
        borderRadius: 26 * scale,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12 * scale,
    },
    title: {
        fontSize: 19 * scale,
        fontFamily: Fonts.SemiBold,
        color: '#000000',
        marginBottom: 8 * scale,
    },
    message: {
        fontSize: 14 * scale,
        fontFamily: Fonts.Regular,
        color: '#666666',
        textAlign: 'center',
        marginBottom: 18 * scale,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        flex: 1,
        paddingVertical: 10 * scale,
        borderRadius: 8 * scale,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#F5F5F5',
        marginRight: 10 * scale,
    },
    confirmButton: {
        backgroundColor: ColorCode.primary, // Using app primary color (Blue)
        marginLeft: 10 * scale,
    },
    cancelButtonText: {
        color: '#666666',
        fontSize: 14 * scale,
        fontFamily: Fonts.Medium,
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 14 * scale,
        fontFamily: Fonts.Medium,
    },
});

export default CustomLogoutModal;
