import React from 'react';
import { View, Modal, StyleSheet } from 'react-native';

interface PlaylistModalProps {
    isVisible: boolean;
    onClose: () => void;
}

const PlaylistModal: React.FC<PlaylistModalProps> = ({ isVisible, onClose }) => {
    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                {/* Add your playlist modal content here */}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
});

export default PlaylistModal;