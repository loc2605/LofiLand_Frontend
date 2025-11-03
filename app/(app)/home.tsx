import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, ScrollView, FlatList,
  TouchableOpacity, ActivityIndicator, Dimensions, RefreshControl
} from 'react-native';
import axiosInstance from '../../utils/axiosInstance';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import SuggestionItem from '../../components/SuggestionItem';
import AlbumItem from '../../components/AlbumItem';
import ArtistItem from '../../components/ArtistItem';
import BottomTabBar from '../../components/BottomTabBar';
import RightDrawerMenu from '../../components/RightDrawerMenu';
import EditProfileModal from '../../components/EditProfileModal';

const { width } = Dimensions.get('window');

type User = {
  username: string;
  email: string;
  avatarUrl?: string;
};

type Song = {
  id: string;
  title: string;
  artist: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  album: {
    id: string;
    title: string;
    coverUrl?: string;
  };
  audioUrl?: string;
  fullUrl?: string;
};

type Album = {
  id: string;
  title: string;
  artist: { id: string; name: string };
  coverUrl: string;
};

type Artist = {
  id: string;
  name: string;
  avatarUrl: string;
};

// ======================== Deezer API (qua Backend) ========================
async function getMusicData() {
  try {
    const tracksRes = await axiosInstance.get("/api/deezer/tracks?query=son tung&country=VN");

    return {
      tracks: tracksRes.data.tracks || [],
    };
  } catch (error: any) {
    console.error("Deezer backend fetch error:", error.response?.data || error.message);
    return { tracks: [] };
  }
}
// =======================================================================

const HomeScreen: React.FC = () => {
  const router = useRouter();

  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

  const defaultProfileImage = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

  // Load user info
const loadUser = useCallback(async () => {
  try {
    const storedAuth = await SecureStore.getItemAsync('auth');
    if (storedAuth) {
      const parsed = JSON.parse(storedAuth);
      const userData = parsed.user || {};
      setUser({
        username: userData.username || 'Người dùng',
        email: userData.email || '',
        avatarUrl: userData.avatarUrl || userData.avatar || defaultProfileImage,
      });
    } else {
      router.replace('/(auth)/login');
    }
  } catch (error) {
    console.log('Error loading user:', error);
  }
}, [router]);

  // Logout
const handleLogout = async () => {
  try {
    await SecureStore.deleteItemAsync('auth');
    setDrawerVisible(false);
    setTimeout(() => router.replace('/(auth)/login'), 300);
  } catch (error) {
    console.log('Logout error:', error);
  }
};

  // Fetch initial albums/artists once
  const fetchAlbumsAndArtists = useCallback(async () => {
    try {
      const [albumsRes, artistsRes] = await Promise.all([
        axiosInstance.get("/api/deezer/albums?query=viet"),
        axiosInstance.get("/api/deezer/artists?query=vpop"),
      ]);

      setAlbums(
        albumsRes.data.albums.map((a: any) => ({
          id: a.id.toString(),
          title: a.title || 'Unknown Album',
          artist: {
            id: a.artist?.id?.toString() || '',
            name: a.artist?.name || 'Unknown Artist',
          },
          coverUrl: a.coverUrl || 'https://placehold.co/300x300',
        }))
      );

      setArtists(
        artistsRes.data.artists.map((a: any) => ({
          id: a.id.toString(),
          name: a.name || 'Unknown Artist',
          avatarUrl: a.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
        }))
      );
    } catch (error) {
      console.log('Albums/Artists API error:', error);
    }
  }, []);

  // Fetch songs (can be called for pull-to-refresh)
  const fetchSongs = useCallback(async () => {
    try {
      setLoading(true);
      const { tracks } = await getMusicData();
      setSongs(
        tracks.map((t: any) => ({
          id: t.id.toString(),
          title: t.title,
          artist: {
            id: t.artist?.id?.toString() || '',
            name: t.artist?.name || 'Unknown Artist',
            avatarUrl: t.artist?.avatarUrl || '',
          },
          album: {
            id: t.album?.id?.toString() || '',
            title: t.album?.title || '',
            coverUrl: t.album?.coverUrl || '',
          },
          audioUrl: t.audioUrl,
          fullUrl: t.fullUrl,
        }))
      );
    } catch (error) {
      console.log('Songs API error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    const fetchData = async () => {
      await loadUser();
      await fetchAlbumsAndArtists();
      await fetchSongs();
    };
    fetchData();
  }, [loadUser, fetchAlbumsAndArtists, fetchSongs]);

  // Pull-to-refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    fetchSongs(); // chỉ refresh phần “Gợi ý cho bạn”
  };

const handleSongPress = (song: Song) => {
  router.push({
    pathname: '/playingscreen',
    params: {
      id: song.id,
      playlist: JSON.stringify(songs),
    },
  });
};

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#9747FF" />
      </SafeAreaView>
    );
  }

  return (
  <SafeAreaView style={styles.safeArea}>
    {drawerVisible && (
      <TouchableOpacity
        style={styles.overlay}
        onPress={() => setDrawerVisible(false)}
        activeOpacity={1}
      />
    )}

    {/* Header + SearchBar cố định */}
    {user && (
      <Header
        name={user.username}
        profileImage={{ uri: user.avatarUrl || defaultProfileImage }}
        onProfilePress={() => setDrawerVisible(true)}
      />
    )}
    <SearchBar />

    {/* Nội dung cuộn */}
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#9747FF"
          colors={['#9747FF']}
        />
      }
    >
      <Text style={styles.sectionTitle}>Gợi ý cho bạn</Text>
      <FlatList
        horizontal
        data={songs}
        renderItem={({ item }) => (
          <SuggestionItem
            title={item.title}
            artist={item.artist.name}
            image={item.album.coverUrl || 'https://placehold.co/300x300'}
            onPress={() => handleSongPress(item)}
          />
        )}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Album thịnh hành</Text>
      </View>
      <FlatList
        horizontal
        data={albums}
        renderItem={({ item }) => (
          <AlbumItem
            title={item.title}
            artist={item.artist.name}
            image={item.coverUrl}
          />
        )}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Nghệ sĩ nổi bật</Text>
      </View>
      <FlatList
        horizontal
        data={artists}
        renderItem={({ item }) => (
          <ArtistItem
            name={item.name}
            image={item.avatarUrl}
          />
        )}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 20 }}
      />

      <View style={{ height: 100 }} />
    </ScrollView>

    {/* Drawer + EditModal + BottomTab */}
    <RightDrawerMenu
      visible={drawerVisible}
      onClose={() => setDrawerVisible(false)}
      user={user}
      onEdit={() => {
        setDrawerVisible(false);
        setTimeout(() => setEditVisible(true), 300);
      }}
      onLogout={handleLogout}
    />

    <EditProfileModal
      visible={editVisible}
      user={user || { username: '', avatarUrl: '' }}
      onClose={() => setEditVisible(false)}
      onSave={async ({ username, imageFile }) => {
        try {
          const formData = new FormData();
          if (username) formData.append('username', username);
          if (imageFile) {
            formData.append('avatar', {
              uri: imageFile.uri,
              name: imageFile.name || 'avatar.jpg',
              type: imageFile.type || 'image/jpeg',
            } as any);
          }

          const res = await axiosInstance.put('/api/users/profile', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          setUser(res.data.user);
          setEditVisible(false);
          alert('Cập nhật hồ sơ thành công');
        } catch (error: any) {
          console.error('Error updating profile:', error);
          alert(error.message || error.data?.message || 'Có lỗi xảy ra, thử lại sau');
        }
      }}
    />

    <BottomTabBar />
  </SafeAreaView>

  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' ,paddingHorizontal: 10 },
  container: { flex: 1, backgroundColor: '#000', paddingHorizontal: 10 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
    paddingTop: 20,
    paddingRight: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  seeAllText: { fontSize: 14, color: '#A9A9A9', fontWeight: '500' },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.15)',
    zIndex: 1,
  },
});
