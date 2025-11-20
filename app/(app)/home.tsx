import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import axiosInstance from '../../utils/axiosInstance';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
// import BottomTabBar from '../../components/BottomTabBar';
import RightDrawerMenu from '../../components/RightDrawerMenu';
import EditProfileModal from '../../components/EditProfileModal';
import HistoryList from '../../components/HistoryList';
import SuggestionItem from '../../components/SuggestionItem';
import AlbumItem from '../../components/AlbumItem';
import ArtistItem from '../../components/ArtistItem';

const { width } = Dimensions.get('window');

type User = { username: string; email: string; avatarUrl?: string };
type Song = {
  id: string;
  title: string;
  artist: { id: string; name: string; avatarUrl?: string };
  album: { id: string; title: string; coverUrl?: string };
  audioUrl?: string;
  fullUrl?: string;
};
type Album = { id: string; title: string; artist: { id: string; name: string }; coverUrl: string };
type Artist = { id: string; name: string; avatarUrl: string };
type HistoryItem = { _id: string; song: Song };

// ======================== Deezer API (qua Backend) ========================
async function getMusicData() {
  try {
    const tracksRes = await axiosInstance.get("/api/deezer/tracks");
    return { tracks: tracksRes.data.tracks || [] };
  } catch (error: any) {
    console.error("Deezer backend fetch error:", error.response?.data || error.message);
    return { tracks: [] };
  }
}
// =======================================================================

const HomeScreen: React.FC = () => {
  const router = useRouter();

  // ===== States =====
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

  // ===== Search States =====
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ tracks: Song[]; albums: Album[]; artists: Artist[] } | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'track' | 'album' | 'artist'>('all');

  const defaultProfileImage = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

  // ====================== Load user ======================
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
      } else router.replace('/(auth)/login');
    } catch (error) {
      console.log('Error loading user:', error);
    }
  }, [router]);

  // ====================== Logout ======================
  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('auth');
      setDrawerVisible(false);
      setTimeout(() => router.replace('/(auth)/login'), 300);
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  // ====================== Fetch Albums & Artists ======================
  const fetchAlbumsAndArtists = useCallback(async () => {
    try {
      const [albumsRes, artistsRes] = await Promise.all([
        axiosInstance.get("/api/deezer/albums"),
        axiosInstance.get("/api/deezer/artists"),
      ]);

      setAlbums(albumsRes.data.albums.map((a: any) => ({
        id: a.id.toString(),
        title: a.title || 'Unknown Album',
        artist: { id: a.artist?.id?.toString() || '', name: a.artist?.name || 'Unknown Artist' },
        coverUrl: a.coverUrl || 'https://placehold.co/300x300',
      })));

      setArtists(artistsRes.data.artists.map((a: any) => ({
        id: a.id.toString(),
        name: a.name || 'Unknown Artist',
        avatarUrl: a.avatarUrl || defaultProfileImage,
      })));
    } catch (error) {
      console.log('Albums/Artists API error:', error);
    }
  }, []);

  // ====================== Fetch Songs ======================
  const fetchSongs = useCallback(async () => {
    try {
      setLoading(true);
      const { tracks } = await getMusicData();
      setSongs(tracks.map((t: any) => ({
        id: t.id.toString(),
        title: t.title,
        artist: { id: t.artist?.id?.toString() || '', name: t.artist?.name || 'Unknown Artist', avatarUrl: t.artist?.avatarUrl || '' },
        album: { id: t.album?.id?.toString() || '', title: t.album?.title || '', coverUrl: t.album?.coverUrl || '' },
        audioUrl: t.audioUrl,
        fullUrl: t.fullUrl,
      })));
    } catch (error) {
      console.log('Songs API error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ====================== Fetch History ======================
  const fetchHistory = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/api/history");
      setHistory(res.data.history || []);
    } catch (error: any) {
      console.log("Error fetching history:", error.response?.data || error.message);
      setHistory([]);
    }
  }, []);

  // ====================== Initial Fetch ======================
  useEffect(() => {
    const fetchData = async () => {
      await loadUser();
      await Promise.all([fetchAlbumsAndArtists(), fetchSongs(), fetchHistory()]);
    };
    fetchData();
  }, [loadUser, fetchAlbumsAndArtists, fetchSongs, fetchHistory]);

  // ====================== Pull-to-refresh ======================
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([loadUser(), fetchAlbumsAndArtists(), fetchSongs(), fetchHistory()]);
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // ====================== Handlers ======================
  const handleSongPress = (song: Song) => {
    router.push({ pathname: '/playingscreen', params: { id: song.id, playlist: JSON.stringify(songs) } });
  };
  const handleAlbumPress = (album: Album) => {
    router.push({
      pathname: '/albumdetail',
      params: { albumId: album.id, albumTitle: album.title, albumArtist: album.artist.name, albumCover: album.coverUrl },
    });
  };

  // ====================== Search Handler ======================
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    try {
      setSearchLoading(true);
      const res = await axiosInstance.get(`/api/deezer/search?query=${encodeURIComponent(query)}`);
      const { tracks = [], albums = [], artists = [] } = res.data;
      setSearchResults({
        tracks: tracks.map((t: any) => ({
          id: t.id.toString(),
          title: t.title,
          artist: { id: t.artist?.id?.toString() || '', name: t.artist?.name || 'Unknown Artist', avatarUrl: t.artist?.avatarUrl || '' },
          album: { id: t.album?.id?.toString() || '', title: t.album?.title || '', coverUrl: t.album?.coverUrl || '' },
          audioUrl: t.audioUrl,
          fullUrl: t.fullUrl,
        })),
        albums: albums.map((a: any) => ({
          id: a.id.toString(),
          title: a.title,
          artist: { id: a.artist?.id?.toString() || '', name: a.artist?.name || 'Unknown Artist' },
          coverUrl: a.coverUrl,
        })),
        artists: artists.map((a: any) => ({ id: a.id.toString(), name: a.name, avatarUrl: a.avatarUrl })),
      });
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults(null);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // ====================== Loading State ======================
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#9747FF" />
      </SafeAreaView>
    );
  }

  // ====================== Unified Search Data ======================
  const unifiedSearchResults = searchResults
    ? [
        ...searchResults.tracks.map((t) => ({ type: 'track' as const, data: t })),
        ...searchResults.albums.map((a) => ({ type: 'album' as const, data: a })),
        ...searchResults.artists.map((ar) => ({ type: 'artist' as const, data: ar })),
      ]
    : [];
  const filteredResults = unifiedSearchResults.filter((item) => filter === 'all' || item.type === filter);

  // ====================== Render ======================
  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          setSearchResults(null);
          setSearchQuery('');
        }}
        accessible={false}
      >
        <View style={{ flex: 1 }}>
          {drawerVisible && <TouchableOpacity style={styles.overlay} onPress={() => setDrawerVisible(false)} activeOpacity={1} />}
          {user && <Header name={user.username} profileImage={{ uri: user.avatarUrl || defaultProfileImage }} onProfilePress={() => setDrawerVisible(true)} />}

          <SearchBar
            value={searchQuery}
            onChangeText={handleSearch}
            onClear={() => {
              setSearchQuery('');
              setSearchResults(null);
              setFilter('all');
              Keyboard.dismiss();
            }}
          />

          <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9747FF" colors={['#9747FF']} />}
          >
            {searchResults ? (
              <View style={{ marginVertical: 10 }}>
              {/* Filter Buttons */}
              <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                {['all', 'track', 'album', 'artist'].map((type) => {
                  let label = '';
                  switch (type) {
                    case 'all': label = 'Tất cả'; break;
                    case 'track': label = 'Bài hát'; break;
                    case 'album': label = 'Album'; break;
                    case 'artist': label = 'Nghệ sĩ'; break;
                  }
                  const isActive = filter === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setFilter(type as any)}
                      style={{
                        paddingHorizontal: 15,
                        paddingVertical: 6,
                        borderRadius: 20,
                        backgroundColor: isActive ? '#9747FF' : '#333',
                        marginRight: 8,
                      }}
                    >
                      <Text style={{ color: '#FFF', fontWeight: '600' }}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

                {/* Loading */}
                {searchLoading && <ActivityIndicator color="#9747FF" style={{ marginVertical: 10 }} />}

                {/* List */}
                {filteredResults.length === 0 ? (
                  <Text style={{ color: '#AAA', paddingVertical: 12 }}>Không có kết quả</Text>
                ) : (
                  filteredResults.map((item) => {
                    if (item.type === 'track') {
                      const t = item.data;
                      return (
                        <TouchableOpacity
                          key={t.id}
                          style={styles.listItem} // list item style
                          onPress={() =>
                            router.push({
                              pathname: '/playingscreen',
                              params: { id: t.id, playlist: JSON.stringify(searchResults.tracks) },
                            })
                          }
                        >
                          <Image source={{ uri: t.album.coverUrl || 'https://placehold.co/60x60' }} style={styles.listItemImage} />
                          <View style={styles.listItemText}>
                            <Text style={styles.listItemTitle}>{t.title}</Text>
                            <Text style={styles.listItemSubtitle}>{t.artist.name}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    }
                    if (item.type === 'album') {
                      const a = item.data;
                      return (
                        <TouchableOpacity
                          key={a.id}
                          style={{ flexDirection: 'row', marginBottom: 12, alignItems: 'center' }}
                          onPress={() => handleAlbumPress(a)}
                        >
                          <Image source={{ uri: a.coverUrl }} style={{ width: 70, height: 70, borderRadius: 6, marginRight: 12 }} />
                          <View>
                            <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 16 }}>{a.title}</Text>
                            <Text style={{ color: '#AAA', marginTop: 2 }}>{a.artist.name}</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    }
                    if (item.type === 'artist') {
                      const ar = item.data;
                      return (
                        <TouchableOpacity
                          key={ar.id}
                          style={{ flexDirection: 'row', marginBottom: 12, alignItems: 'center' }}
                          onPress={() =>
                            router.push({ pathname: '/artistdetail', params: { artistId: ar.id, artistName: ar.name, artistImage: ar.avatarUrl } })
                          }
                        >
                          <Image source={{ uri: ar.avatarUrl || defaultProfileImage }} style={{ width: 60, height: 60, borderRadius: 30, marginRight: 12 }} />
                          <Text style={{ color: '#FFF', fontWeight: '600', fontSize: 16 }}>{ar.name}</Text>
                        </TouchableOpacity>
                      );
                    }
                    return null;
                  })
                )}
              </View>
            ) : (
              <>
                <Text style={styles.sectionTitle}>Gợi ý cho bạn</Text>
                <FlatList
                  horizontal
                  data={songs}
                  renderItem={({ item }) => <SuggestionItem title={item.title} artist={item.artist.name} image={item.album.coverUrl || 'https://placehold.co/300x300'} onPress={() => handleSongPress(item)} />}
                  keyExtractor={(item) => item.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 20 }}
                />

                <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Album thịnh hành</Text></View>
                <FlatList
                  horizontal
                  data={albums}
                  renderItem={({ item }) => <AlbumItem title={item.title} artist={item.artist.name} image={item.coverUrl} onPress={() => handleAlbumPress(item)} />}
                  keyExtractor={(item) => item.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 20 }}
                  ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
                />

                <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Nghệ sĩ nổi bật</Text></View>
                <FlatList
                  horizontal
                  data={artists}
                  renderItem={({ item }) => <ArtistItem id={item.id} name={item.name} image={item.avatarUrl} onPress={() => router.push({ pathname: '/artistdetail', params: { artistId: item.id, artistName: item.name, artistImage: item.avatarUrl } })} />}
                  keyExtractor={(item) => item.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 20 }}
                />

                <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Nội dung bạn hay nghe gần đây</Text></View>
                <HistoryList history={history} onSongPress={(song) => router.push({ pathname: '/playingscreen', params: { id: song.id, playlist: JSON.stringify(history.map(h => h.song)) } })} />
              </>
            )}

            <View style={{ height: 60 }} />
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>

      <RightDrawerMenu
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        user={user}
        onEdit={() => { setDrawerVisible(false); setTimeout(() => setEditVisible(true), 300); }}
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
            if (imageFile) formData.append('avatar', { uri: imageFile.uri, name: imageFile.name || 'avatar.jpg', type: imageFile.type || 'image/jpeg' } as any);
            const res = await axiosInstance.put('/api/users/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setUser(res.data.user);
            setEditVisible(false);
            alert('Cập nhật hồ sơ thành công');
          } catch (error: any) {
            console.error('Error updating profile:', error);
            alert(error.message || error.data?.message || 'Có lỗi xảy ra, thử lại sau');
          }
        }}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 10,
  },
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.15)',
    zIndex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  listItemImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 12,
  },
  listItemText: {
    flex: 1,
    justifyContent: 'center',
  },
  listItemTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listItemSubtitle: {
    color: '#AAA',
    fontSize: 14,
    marginTop: 2,
  },
});
