import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import axiosInstance from '../utils/axiosInstance';
import { useRouter } from 'expo-router';
import OptionMenu from './OptionMenu';

type SongDetails = {
  id: string;
  title: string;
  album: { title: string; coverUrl?: string };
  artist: { name: string };
};

type HistoryItem = {
  _id: string;
  song: SongDetails;
};

type HistoryListProps = {
  history: HistoryItem[];
  onSongPress?: (song: SongDetails) => void;
};

const CHUNK_SIZE = 5;

const HistoryList: React.FC<HistoryListProps> = ({ history, onSongPress }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedSong, setSelectedSong] = useState<SongDetails | null>(null);
  const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE);
  const router = useRouter();

  const handleTrackPress = (song: SongDetails) => {
    if (onSongPress) onSongPress(song);
    else
      router.push({
        pathname: '/playingscreen',
        params: { id: song.id, playlist: JSON.stringify(history.map(h => h.song)) },
      });
  };

  const handleMenuPress = (song: SongDetails) => {
    setSelectedSong(song);
    setMenuVisible(true);
  };

  const handleAddToPlaylist = () => {
    setMenuVisible(false);
    if (selectedSong) Alert.alert('Thành công', `Thêm "${selectedSong.title}" vào Playlist.`);
  };

  const handleAddToFavorites = () => {
    setMenuVisible(false);
    if (!selectedSong?.id) {
      Alert.alert('Lỗi', 'Không có bài hát để thêm vào yêu thích');
      return;
    }
    axiosInstance
      .post('/api/favorites', { songId: selectedSong.id })
      .then(() => {
        Alert.alert('Thành công', `Đã thêm "${selectedSong.title}" vào danh sách yêu thích`);
      })
      .catch((error) => {
        Alert.alert(
          'Lỗi',
          error.response?.data?.message || error.message || 'Không thể thêm vào yêu thích'
        );
        console.log('Error adding favorite:', error);
      });
  };

  if (!history || history.length === 0) {
    return (
      <Text style={{ color: '#AAA', marginTop: 20, fontSize: 16, paddingHorizontal: 15 }}>
        Bạn chưa nghe bài hát nào gần đây
      </Text>
    );
  }

  const displayedHistory = history.slice(0, visibleCount);

  const handleShowMore = () => {
    if (visibleCount >= history.length) {
      // đã hiển thị hết -> ẩn bớt về CHUNK_SIZE
      setVisibleCount(CHUNK_SIZE);
    } else {
      // tăng thêm CHUNK_SIZE
      const nextCount = Math.min(visibleCount + CHUNK_SIZE, history.length);
      setVisibleCount(nextCount);
    }
  };

  const showMoreText = visibleCount >= history.length ? 'Ẩn bớt' : 'Xem thêm';

  return (
    <>
      <FlatList
        data={displayedHistory}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.trackItem}
            onPress={() => handleTrackPress(item.song)}
            activeOpacity={0.8}
          >
            <View style={styles.trackInfo}>
              <Image
                source={{ uri: item.song.album.coverUrl || 'https://placehold.co/60x60' }}
                style={styles.trackImage}
              />
              <View style={styles.textContainer}>
                <Text numberOfLines={1} style={styles.trackTitle}>
                  {item.song.title}
                </Text>
                <Text numberOfLines={1} style={styles.artistName}>
                  {item.song.artist.name}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.menuIconContainer}
              onPress={() => handleMenuPress(item.song)}
            >
              <Entypo name="dots-three-horizontal" size={18} color="#AAA" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        ListFooterComponent={
          history.length > CHUNK_SIZE ? (
            <TouchableOpacity onPress={handleShowMore} style={styles.showMoreButton}>
              <Text style={styles.showMoreText}>{showMoreText}</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <OptionMenu
        visible={menuVisible}
        onClose={() => {
          setMenuVisible(false);
          setSelectedSong(null);
        }}
        onAddToPlaylist={handleAddToPlaylist}
        onAddToFavorites={handleAddToFavorites}
      />
    </>
  );
};

const styles = StyleSheet.create({
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  trackImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
  trackTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '500',
  },
  artistName: {
    color: '#AAA',
    fontSize: 14,
    marginTop: 2,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  showMoreButton: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 6,
  },
  showMoreText: {
    color: '#9747FF',
    fontWeight: '500',
    fontSize: 14,
  },
});

export default HistoryList;
