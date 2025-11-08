import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axiosInstance from '../../utils/axiosInstance';

const { width } = Dimensions.get('window');

type Album = { id: string; title: string; coverUrl: string };
type Song = { id: string; title: string; album: { id: string; title: string; coverUrl: string } };
type Artist = { id: string; name: string; avatarUrl: string };

const ArtistDetailScreen: React.FC = () => {
  const { artistId } = useLocalSearchParams();
  const router = useRouter();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tracks, setTracks] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArtistDetail = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/api/deezer/artist/${artistId}/detail`);
      setArtist(res.data.artist || null);
      setAlbums(res.data.albums || []);
      setTracks(res.data.tracks || []);
    } catch (error) {
      console.log('Artist detail API error:', error);
    } finally {
      setLoading(false);
    }
  }, [artistId]);

  useEffect(() => {
    fetchArtistDetail();
  }, [fetchArtistDetail]);

  const handleTrackPress = (track: Song) => {
    router.push({
      pathname: '/playingscreen',
      params: { id: track.id, playlist: JSON.stringify(tracks) },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#9747FF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {artist && (
              <View style={styles.artistHeader}>
                <Image source={{ uri: artist.avatarUrl }} style={styles.artistAvatar} />
                <Text style={styles.artistName}>{artist.name}</Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>Albums</Text>
            <FlatList
              horizontal
              data={albums}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.albumItem}
                  onPress={() =>
                    router.push({
                      pathname: '/albumdetail',
                      params: {
                        albumId: item.id,
                        albumTitle: item.title,
                        albumCover: item.coverUrl,
                      },
                    })
                  }
                >
                  <Image source={{ uri: item.coverUrl }} style={styles.albumImage} />
                  <Text style={styles.albumTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={{ paddingHorizontal: 10 }}
              showsHorizontalScrollIndicator={false}
            />

            <Text style={styles.sectionTitle}>Bài hát</Text>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.trackItem} onPress={() => handleTrackPress(item)}>
            <Text style={styles.trackTitle}>{item.title}</Text>
            <Text style={styles.albumName}>{item.album.title}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default ArtistDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  artistHeader: {
    alignItems: 'center',
    marginVertical: 20,
  },
  artistAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#9747FF',
  },
  artistName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginVertical: 15,
    marginLeft: 10,
  },
  albumItem: {
    marginRight: 15,
    alignItems: 'center',
    width: 120,
  },
  albumImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  albumTitle: {
    color: '#FFF',
    width: 120,
    textAlign: 'center',
    marginTop: 5,
  },
  trackItem: {
    marginBottom: 15,
  },
  trackTitle: {
    color: '#FFF',
    fontSize: 16,
  },
  albumName: {
    color: '#A9A9A9',
    fontSize: 14,
  },
});
