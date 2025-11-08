import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../../utils/axiosInstance';

type Album = { id: string; title: string; coverUrl: string };
type Song = {
  id: string;
  title: string;
  album: { id: string; title: string; coverUrl: string };
};
type Artist = { id: string; name: string; avatarUrl: string };

const ArtistDetailScreen: React.FC = () => {
  const { artistId, artistName, artistImage } = useLocalSearchParams();
  const router = useRouter();

  const [artist, setArtist] = useState<Artist | null>(
    artistName && artistImage
      ? { id: artistId as string, name: artistName as string, avatarUrl: artistImage as string }
      : null
  );
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tracks, setTracks] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  // Lấy chi tiết artist
  const fetchArtistDetail = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/api/deezer/artist/${artistId}/detail`);
      setArtist(res.data.artist || artist);
      setAlbums(res.data.albums || []);
      setTracks(
        (res.data.tracks || []).map((t: any) => ({
          id: String(t.id),
          title: t.title,
          artist: {
            id: t.artist?.id,
            name: t.artist?.name || artist?.name || 'Unknown Artist',
            avatarUrl: t.artist?.avatarUrl || artist?.avatarUrl || '',
          },
          album: {
            id: t.album?.id,
            title: t.album?.title || 'Unknown Album',
            coverUrl: t.album?.coverUrl || '',
          },
          audioUrl: t.audioUrl || '',
          duration: t.duration || 180,
        }))
      );
    } catch (error) {
      console.log('Artist detail API error:', error);
    } finally {
      setLoading(false);
    }
  }, [artistId, artist]);

  // Kiểm tra xem đã follow hay chưa
  const checkFollowing = useCallback(async () => {
    if (!artistId) return;
    try {
      const res = await axiosInstance.get(`/api/follows/user/me`);
      const followed = res.data.data.some((f: any) => f.artist.id === artistId);
      setIsFollowing(followed);
    } catch (err: any) {
      console.log('Follow check error:', err);
    }
  }, [artistId]);

  useEffect(() => {
    fetchArtistDetail();
    checkFollowing();
  }, [fetchArtistDetail, checkFollowing]);

  const handleTrackPress = (track: Song) => {
    router.push({
      pathname: '/playingscreen',
      params: { id: track.id, playlist: JSON.stringify(tracks) },
    });
  };

  const handlePlayFirstTrack = () => {
    if (tracks.length > 0) {
      const firstTrack = tracks[0];
      router.push({
        pathname: '/playingscreen',
        params: { id: firstTrack.id, playlist: JSON.stringify(tracks) },
      });
    }
  };

  // Follow / Unfollow artist
  const handleFollow = async () => {
    if (!artist) return;
    try {
      if (isFollowing) {
        // Gửi artistId để backend tự lấy userId từ token
        await axiosInstance.post('/api/follows/unfollow', { artistId: artist.id });
        setIsFollowing(false);
      } else {
        await axiosInstance.post('/api/follows/follow', {
          artist: {
            id: artist.id,
            name: artist.name,
            avatarUrl: artist.avatarUrl,
          },
        });
        setIsFollowing(true);
      }
    } catch (err: any) {
      console.log('Follow/Unfollow error:', err);
    }
  };

  if (loading && !artist) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#9747FF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {artist && (
        <View style={styles.fixedHeader}>
          <ImageBackground
            source={{ uri: artist.avatarUrl }}
            style={StyleSheet.absoluteFill}
            blurRadius={10}
            resizeMode="cover"
          />
          <View style={styles.overlay} />

          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={26} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.artistHeader}>
            <Image source={{ uri: artist.avatarUrl }} style={styles.artistAvatar} />
            <Text style={styles.artistName}>{artist.name}</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.followButton, isFollowing ? styles.following : styles.notFollowing]}
                onPress={handleFollow}
              >
                <Text style={styles.followText}>
                  {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.playButton} onPress={handlePlayFirstTrack}>
                <Ionicons name="play" size={30} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
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
            <View style={styles.trackInfo}>
              <Image source={{ uri: item.album.coverUrl }} style={styles.trackImage} />
              <View style={{ flex: 1 }}>
                <Text style={styles.trackTitle}>{item.title}</Text>
                <Text style={styles.albumName}>{item.album.title}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default ArtistDetailScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000' 
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#000' 
  },
  fixedHeader: { 
    zIndex: 10, 
    backgroundColor: '#000', 
    paddingBottom: 10, 
    paddingTop: 10 
  },
  overlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(36,36,63,0.3)' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    paddingVertical: 10 
  },
  backButton: { 
    padding: 5, 
    marginRight: 10 
  },

  artistHeader: { 
    alignItems: 'center', 
    marginVertical: 15, 
    paddingHorizontal: 20 
  },
  artistAvatar: { 
    width: 150, 
    height: 150, 
    borderRadius: 75.5, 
    marginBottom: 10, 
    borderWidth: 2, 
    borderColor: '#A9A9A9' 
  },
  artistName: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#FFF', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  followButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  playButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#9747FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  following: { 
    backgroundColor: '#666' 
  },
  notFollowing: { 
    backgroundColor: '#9747FF' 
  },
  followText: { 
    color: '#FFF', 
    fontWeight: 'bold' 
  },

  sectionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#FFF', 
    marginVertical: 15, 
    marginLeft: 10 
  },
  albumItem: { 
    marginRight: 15, 
    alignItems: 'center', 
    width: 120 
  },
  albumImage: { 
    width: 120, 
    height: 120, 
    borderRadius: 8 
  },
  albumTitle: { 
    color: '#FFF', 
    width: 120, 
    textAlign: 'center', 
    marginTop: 5 
  },
  trackItem: { 
    marginBottom: 15, 
    paddingHorizontal: 10 
  },
  trackInfo: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  trackImage: { 
    width: 50, 
    height: 50, 
    borderRadius: 8, 
    marginRight: 10 
  },
  trackTitle: { 
    color: '#FFF', 
    fontSize: 16 
  },
  albumName: { 
    color: '#A9A9A9', 
    fontSize: 14 
  },
});

