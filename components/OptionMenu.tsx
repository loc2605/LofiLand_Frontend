import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OptionMenuProps {
  visible: boolean;
  onClose: () => void;
  onAddToPlaylist: () => void;
  onAddToFavorites: () => void;
}

const OptionMenu: React.FC<OptionMenuProps> = ({
  visible,
  onClose,
  onAddToPlaylist,
  onAddToFavorites,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPressOut={onClose}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.optionButton} onPress={onAddToPlaylist}>
            <Ionicons name="add-circle-outline" size={24} color="#FFF" style={{ marginRight: 10 }} />
            <Text style={styles.optionText}>Thêm vào Playlist</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton} onPress={onAddToFavorites}>
            <Ionicons name="heart" size={24} color="#eb2525ff" style={{ marginRight: 10 }} />
            <Text style={styles.optionText}>Thêm vào Yêu thích</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default OptionMenu;

const styles = StyleSheet.create({
    overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 10,
    },
    modalContent: {
    width: '85%',
    backgroundColor: '#2E2E2E',
    borderRadius: 10,
    paddingVertical: 10,
    marginBottom: 20,
    alignItems: 'center',
    },
    optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    },
    optionText: {
    color: '#FFF',
    fontSize: 17,
    },
});
