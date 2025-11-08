import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, ImageBackground , FlatList,
  ActivityIndicator, Image, TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '../../utils/axiosInstance';

type Song = {
  id: string;
  title: string;
  artist: { id: string; name: string; avatarUrl?: string };
  album?: { id: string; title: string; coverUrl?: string };
  audioUrl?: string;
  duration: number;
};

const AlbumDetailScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { albumId, albumTitle, albumArtist, albumCover } = params;

  const [tracks, setTracks] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlbumTracks = useCallback(async () => {
    if (!albumId || typeof albumId !== 'string') return;

    try {
      setLoading(true);
      const res = await axiosInstance.get(`/api/deezer/album/${albumId}/tracks`);
      
      const fetchedTracks: Song[] = res.data.tracks.map((t: any) => ({
        id: t.id.toString(),
        title: t.title,
        artist: {
          id: t.artist?.id?.toString() || '',
          name: t.artist?.name || 'Unknown Artist',
          avatarUrl: t.artist?.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
        },
        album: {
          id: t.album?.id?.toString() || '',
          title: t.album?.title || 'Unknown Album',
          coverUrl: t.album?.coverUrl || albumCover || 'https://placehold.co/300x300',
        },
        audioUrl: t.audioUrl,
        duration: t.duration || 180,
      }));
      
      setTracks(fetchedTracks);
    } catch (error) {
      console.error('Error fetching album tracks:', error);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  }, [albumId, albumCover]);

  useEffect(() => {
    fetchAlbumTracks();
  }, [fetchAlbumTracks]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleTrackPress = (song: Song, playlist: Song[]) => {
    router.push({
      pathname: '/playingscreen',
      params: {
        id: song.id,
        playlist: JSON.stringify(playlist),
      },
    });
  };
  
  const handlePlayFirstTrack = () => {
  if (tracks.length > 0) {
    const firstTrack = tracks[0];
    router.push({
      pathname: '/playingscreen',
      params: {
        id: firstTrack.id,
        playlist: JSON.stringify(tracks),
      },
    });
  }
};

  const renderTrackItem = ({ item, index }: { item: Song; index: number }) => (
    <TouchableOpacity
      style={styles.trackItem}
      onPress={() => handleTrackPress(item, tracks)}
    >
      <Text style={styles.trackIndex}>{index + 1}</Text>

      {/* Thumbnail */}
      <Image
        source={{ uri: item.album?.coverUrl }}
        style={styles.trackThumbnail}
      />

      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.trackArtist} numberOfLines={1}>{item.artist.name}</Text>
      </View>
      <Text style={styles.trackDuration}>{formatDuration(item.duration)}</Text>
      <Ionicons name="ellipsis-vertical" size={20} color="#A9A9A9" />
    </TouchableOpacity>
  );

  if (!albumId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.errorText}>Không tìm thấy thông tin Album</Text>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#9747FF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
    <Stack.Screen options={{ title: albumTitle as string, headerShown: false }} />
    <View style={styles.albumHeader}>
    <ImageBackground
        source={{ uri: albumCover as string }}
        style={StyleSheet.absoluteFill} 
        blurRadius={10}
    />
    
    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#FFF" />
    </TouchableOpacity>

    <Image source={{ uri: albumCover as string }} style={styles.coverImage} />
    <Text style={styles.albumTitle}>{albumTitle}</Text>
    <Text style={styles.albumArtist}>Album của {albumArtist}</Text>
    <Text style={styles.albumStats}>{tracks.length} bài hát</Text>

    <TouchableOpacity style={styles.shuffleButton} onPress={handlePlayFirstTrack}>
        <Ionicons name="play" size={30} color="#000" />
    </TouchableOpacity>
    </View>

    {/* Danh sách bài hát cuộn */}
    <FlatList
        data={tracks}
        renderItem={renderTrackItem}
        keyExtractor={(item) => item.id}
        style={styles.tracksListContainer}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 50 }}
    />
    </SafeAreaView>
  );
};

export default AlbumDetailScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000' },
  container: { flex: 1, backgroundColor: '#000' },
  backButton: {
    position: 'absolute',
    top: 20, 
    left: 10,
    zIndex: 10,
    padding: 5,
  },
  albumHeader: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 20,
    backgroundColor: 'rgba(36,36,63,0.3)',
    overflow: 'hidden', 
  },
  coverImage: {
    width: 220,
    height: 220,
    borderRadius: 8,
    shadowColor: '#FFF',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    marginBottom: 20,
  },
  albumTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  albumArtist: {
    fontSize: 16,
    color: '#A9A9A9',
    marginTop: 5,
  },
  albumStats: {
    fontSize: 14,
    color: '#A9A9A9',
    marginTop: 5,
  },
  shuffleButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#9747FF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginRight: 20,
    marginTop: -30,
  },
  tracksListContainer: {
    paddingHorizontal: 15,
    marginTop: 10,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  trackIndex: {
    fontSize: 16,
    color: '#A9A9A9',
    width: 30,
    textAlign: 'center',
  },
  trackThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 10,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  trackArtist: {
    fontSize: 14,
    color: '#A9A9A9',
    marginTop: 2,
  },
  trackDuration: {
    fontSize: 14,
    color: '#A9A9A9',
    marginRight: 15,
  },
  errorText: {
    color: '#FFF',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
  }
});
