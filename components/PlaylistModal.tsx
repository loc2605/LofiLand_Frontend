import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axiosInstance from '../utils/axiosInstance';

interface PlaylistModalProps {
  isVisible: boolean;
  onClose: () => void;
  song?: any;
}

interface Playlist {
  _id: string;
  title: string;
  description?: string;
  isPublic: boolean;
}

const PRIMARY_COLOR = '#9747FF';
const SPOTIFY_DARK_BG = '#121212';
const TEXT_COLOR = '#FFFFFF';

const PlaylistModal: React.FC<PlaylistModalProps> = ({ isVisible, onClose, song }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch playlists từ backend
  const fetchPlaylists = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/playlists');
      setPlaylists(res.data.playlists || []);
    } catch (error: any) {
      console.log('Error fetching playlists:', error);
      Alert.alert('Lỗi', error.message || 'Không thể lấy danh sách playlist');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isVisible) fetchPlaylists();
  }, [isVisible]);

  // Thêm song vào playlist
  const handleAddToPlaylist = async (playlistId: string) => {
    if (!song) {
      Alert.alert('Lỗi', 'Không có bài hát để thêm');
      return;
    }

    try {
      const res = await axiosInstance.post(`/api/playlists/${playlistId}/songs`, { song });
      if (res.data.success) {
        Alert.alert('Thành công', 'Bài hát đã được thêm vào playlist');
        handleClose();
      } else {
        Alert.alert('Lỗi', res.data.message || 'Không thể thêm bài hát');
      }
    } catch (error: any) {
      console.log('Error adding song to playlist:', error.response?.data || error.message);
      const msg = error.response?.data?.message || 'Lỗi server';
      Alert.alert('Lỗi', msg);
    }
  };

  // Tạo playlist mới
  const handleCreatePlaylist = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Lỗi', 'Tên playlist không được để trống');
      return;
    }
    setCreating(true);
    try {
      await axiosInstance.post('/api/playlists', { title: newTitle, description: newDesc });
      Alert.alert('Thành công', 'Playlist đã được tạo');
      setNewTitle('');
      setNewDesc('');
      setShowCreateForm(false);
      fetchPlaylists();
    } catch (error: any) {
      console.log('Error creating playlist:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tạo playlist');
    }
    setCreating(false);
  };

  const handleClose = () => {
    setShowCreateForm(false);
    setNewTitle('');
    setNewDesc('');
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>Hủy</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Thêm vào danh sách phát</Text>
            <View style={styles.headerButton} />
          </View>

          {/* Form tạo playlist */}
          {showCreateForm && (
            <View style={styles.centeredForm}>
              <TextInput
                style={styles.input}
                placeholder="Tên playlist"
                placeholderTextColor="#888"
                value={newTitle}
                onChangeText={setNewTitle}
              />
              <TextInput
                style={[styles.input, { marginTop: 10 }]}
                placeholder="Mô tả (tùy chọn)"
                placeholderTextColor="#888"
                value={newDesc}
                onChangeText={setNewDesc}
              />
              <TouchableOpacity style={styles.actionButton} onPress={handleCreatePlaylist}>
                {creating ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionButtonText}>Tạo playlist</Text>}
              </TouchableOpacity>
            </View>
          )}

          {/* Nút hiển thị form */}
          {!showCreateForm && (
            <TouchableOpacity style={styles.actionButton} onPress={() => setShowCreateForm(true)}>
              <Text style={styles.actionButtonText}>Tạo playlist mới</Text>
            </TouchableOpacity>
          )}

          {/* Danh sách playlist */}
          <View style={{ flex: 1, marginTop: 40, paddingBottom: 30 }}>
            {loading ? (
              <ActivityIndicator size="large" color={PRIMARY_COLOR} style={{ marginTop: 20 }} />
            ) : playlists.length === 0 ? (
              <Text style={{ color: TEXT_COLOR, textAlign: 'center', marginTop: 20 }}>
                Chưa có playlist nào
              </Text>
            ) : (
              <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
                {playlists.map((playlist) => (
                  <TouchableOpacity
                    key={playlist._id}
                    style={styles.playlistItem}
                    onPress={() => handleAddToPlaylist(playlist._id)}
                  >
                    <Text style={styles.playlistTitle}>{playlist.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  modalContent: {
    flex: 1,
    backgroundColor: SPOTIFY_DARK_BG,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 15,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 50, paddingBottom: 10 },
  headerButton: { minWidth: 50 },
  headerButtonText: { color: TEXT_COLOR, fontSize: 16 },
  headerTitle: { color: TEXT_COLOR, fontSize: 18, fontWeight: 'bold' },
  centeredForm: { paddingVertical: 10 },
  input: {
    backgroundColor: '#2E2E2E',
    color: TEXT_COLOR,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    width: '90%',
    alignSelf: 'center',
  },
  actionButton: {
    backgroundColor: 'transparent',
    borderColor: PRIMARY_COLOR,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 25,
    alignItems: 'center',
    marginTop: 15,
    alignSelf: 'center',
  },
  actionButtonText: { color: TEXT_COLOR, fontSize: 16, fontWeight: '600' },
  playlistItem: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  playlistTitle: { color: TEXT_COLOR, fontSize: 16, fontWeight: '600' },
});

export default PlaylistModal;
