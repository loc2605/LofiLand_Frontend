import React from 'react';
import { Modal, View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface OptionsMenuProps {
  visible: boolean;
  onClose: () => void;
  onAddToPlaylist: () => void;
  onAddToFavorites: () => void;
}

const OptionsMenu: React.FC<OptionsMenuProps> = ({
  visible,
  onClose,
  onAddToPlaylist,
  onAddToFavorites,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.menuItem} onPress={onAddToPlaylist}>
            <Text>➕ Thêm vào Playlist</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={onAddToFavorites}>
            <Text>❤️ Thêm vào Yêu thích</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={onClose}>
            <Text>✖ Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 250,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
  },
  menuItem: {
    paddingVertical: 12,
  },
});

export default OptionsMenu;
