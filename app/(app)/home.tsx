import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, ScrollView, FlatList,
  TouchableOpacity, ActivityIndicator, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import SuggestionItem from '../../components/SuggestionItem';
import AlbumItem from '../../components/AlbumItem';
import ArtistItem from '../../components/ArtistItem';
import BottomTabBar from '../../components/BottomTabBar';
import RightDrawerMenu from '../../components/RightDrawerMenu';
import EditProfileModal from '../../components/EditProfileModal';

const { width } = Dimensions.get('window');

// ======================== Spotify Config ========================
const SPOTIFY_TOKEN = 'BQB4GFKaf5nSR_feiLN--kbRbdWDk-Fxaf9ukCrBdKxPvEPWTSP-0nO6vtR0WDPDtBCdFscSsQzp4X3ArGpc6yG1_Nk-be265sUBxEl3jZFBGzHYmmnq5Kqy3WqGSfZV-EgeQEzkStnNqLQgtcLx9__TTjPyU4nUE4gT8Gj3eos3yW-PEPvvvGGt6oq3oYaHP1yJxqEzHORskXcO5ZungedJSS5XiyxO0gxUruf9-CJ60BRS-0vci9AOsouk4D0Tm9qKjtGfNky4pMjO4w3Dlvg90IJJyV-NlmcU-gziKThP4tu0OFAaGZd7FkzyYUz2IgN2';

async function fetchSpotifyApi(endpoint: string, method = 'GET', body?: any) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: { Authorization: `Bearer ${SPOTIFY_TOKEN}` },
    method,
    body: body ? JSON.stringify(body) : undefined,
  });
  return await res.json();
}

async function getTopTracks() {
  const res = await fetchSpotifyApi('v1/me/top/tracks?time_range=medium_term&limit=20', 'GET');
  return res.items || [];
}
// ===============================================================

type User = {
  username: string;
  email: string;
  avatarUrl?: string;
};

type Song = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl?: string;
};

type Album = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
};

type Artist = {
  id: string;
  name: string;
  avatarUrl: string;
};

const HomeScreen: React.FC = () => {
  const router = useRouter();

  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

  const defaultProfileImage = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

  // Dùng useCallback để cố định hàm loadUser
  const loadUser = useCallback(async () => {
    try {
      const storedAuth = await AsyncStorage.getItem('auth');
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth);
        console.log('Loaded user:', parsed);

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

  // Logout hoạt động trên iOS & Android
  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['auth', 'token']);
      setDrawerVisible(false);
      setTimeout(() => router.replace('/(auth)/login'), 300);
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  // Fetch Spotify Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await loadUser();

        const topTracks = await getTopTracks();

        const mappedSongs = topTracks.map((track: any) => ({
          id: track.id,
          title: track.name,
          artist: track.artists.map((a: any) => a.name).join(', '),
          coverUrl: track.album.images[0]?.url || 'https://picsum.photos/300',
          audioUrl: track.preview_url,
        }));

        const mappedAlbums = topTracks.slice(0, 5).map((track: any) => ({
          id: track.album.id,
          title: track.album.name,
          artist: track.artists.map((a: any) => a.name).join(', '),
          coverUrl: track.album.images[0]?.url || 'https://picsum.photos/200',
        }));

        const mappedArtists = Array.from(
          new Map(
            topTracks.flatMap((track: any) =>
              track.artists.map((artist: any) => [artist.id, artist])
            )
          ).values()
        )
          .slice(0, 8)
          .map((artist: any) => ({
            id: artist.id,
            name: artist.name,
            avatarUrl: artist.images?.[0]?.url || 'https://picsum.photos/200',
          }));

        setSongs(mappedSongs);
        setAlbums(mappedAlbums);
        setArtists(mappedArtists);
      } catch (error) {
        console.log('Spotify API error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [loadUser]);

  const handleSongPress = (song: Song) => {
    router.push({
      pathname: '/playingscreen',
      params: { id: song.id },
    });
  };

  if (loading) {
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

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {user && (
          <Header
            name={user.username}
            profileImage={{ uri: user.avatarUrl || defaultProfileImage }}
            onProfilePress={() => setDrawerVisible(true)}
          />
        )}

        <SearchBar />

        <Text style={styles.sectionTitle}>Gợi ý cho bạn</Text>
        <FlatList
          horizontal
          data={songs}
          renderItem={({ item }) => (
            <SuggestionItem
              title={item.title}
              artist={item.artist}
              image={item.coverUrl}
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
            <AlbumItem title={item.title} artist={item.artist} image={item.coverUrl} />
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
          renderItem={({ item }) => <ArtistItem name={item.name} image={item.avatarUrl} />}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 20 }}
        />

        <View style={{ height: 100 }} />
      </ScrollView>

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
        user={user || { username: "", avatarUrl: "" }}
        onClose={() => setEditVisible(false)}
        onSave={async (updated) => {
          console.log("New info:", updated);
          // TODO: gọi API /api/upload và /api/users/update
          setEditVisible(false);
        }}
      />

      <BottomTabBar />
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1, backgroundColor: '#000', paddingHorizontal: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 15,
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
