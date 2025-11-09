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
import { useFollow } from '../../context/FollowContext';

type Album = { id: string; title: string; coverUrl: string };
type Song = {
  id: string;
  title: string;
  album: { id: string; title: string; coverUrl: string };
  artist?: { id: string; name: string; avatarUrl: string };
};
type Artist = { id: string; name: string; avatarUrl: string };

const ArtistDetailScreen: React.FC = () => {
  const { artistId, artistName, artistImage } = useLocalSearchParams();
  const router = useRouter();
  const { followedArtists, follow, unfollow } = useFollow();

  const [artist, setArtist] = useState<Artist | null>(
    artistName && artistImage
      ? { id: artistId as string, name: artistName as string, avatarUrl: artistImage as string }
      : null
  );
  const [albums, setAlbums] = useState<Album[]>([]);
  const [tracks, setTracks] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const isFollowing = artist ? followedArtists.has(artist.id) : false;

  const fetchArtistDetail = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/api/deezer/artist/${artistId}/detail`);
      if (res.data.artist) setArtist(res.data.artist);
      if (res.data.albums) setAlbums(res.data.albums);
      if (res.data.tracks) setTracks(res.data.tracks);
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

  const handlePlayFirstTrack = () => {
    if (tracks.length) {
      handleTrackPress(tracks[0]);
    }
  };

  const handleFollow = async () => {
    if (!artist || !artist.id) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await axiosInstance.post('/api/follows/unfollow', { artistId: artist.id });
        unfollow(artist.id);
      } else {
        await axiosInstance.post('/api/follows/follow', {
          artist: { id: artist.id, name: artist.name || '', avatarUrl: artist.avatarUrl || '' },
        });
        follow(artist.id);
      }
    } catch (err) {
      console.log('Follow/Unfollow error:', err);
    } finally {
      setFollowLoading(false);
    }
  };


  if (loading || !artist) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#9747FF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.fixedHeader}>
        <ImageBackground
          source={{ uri: artist.avatarUrl }}
          style={StyleSheet.absoluteFill}
          blurRadius={15}
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
              disabled={followLoading}
            >
              {followLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.followText}>
                  {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.playButton} onPress={handlePlayFirstTrack}>
              <Ionicons name="play" size={30} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

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

