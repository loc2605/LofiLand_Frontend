import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Audio,
  AVPlaybackStatus,
  AVPlaybackStatusSuccess,
  InterruptionModeIOS,
  InterruptionModeAndroid,
} from 'expo-av';
import Slider from '@react-native-community/slider';

const { width, height } = Dimensions.get('window');

type Song = {
  id: string;
  title: string;
  artist: { name: string };
  album: { coverUrl: string };
  audioUrl: string;
  duration?: number;
};

const getFormattedTime = (ms: number) => {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};

const Playingscreen: React.FC = () => {
  const { id, playlist } = useLocalSearchParams<{ id: string; playlist?: string }>();
  const parsedPlaylist: Song[] = playlist ? JSON.parse(playlist) : [];
  const router = useRouter();

  const [songIndex, setSongIndex] = useState(parsedPlaylist.findIndex(s => s.id === id));
  const [song, setSong] = useState<Song | null>(parsedPlaylist[songIndex] || null);

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isShuffle, setIsShuffle] = useState(false);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          playThroughEarpieceAndroid: false,
        });
      } catch (err) {
        console.log('Error setting audio mode:', err);
      }
    };
    setupAudio();
  }, []);

  useEffect(() => {
    if (!song) return;
    const loadAudio = async () => {
      setLoading(true);
      if (soundRef.current) {
        try {
          await soundRef.current.unloadAsync();
        } catch {}
      }
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: song.audioUrl },
          { shouldPlay: true },
          (s) => setStatus(s)
        );
        soundRef.current = sound;
      } catch (err) {
        console.log('Error loading audio:', err);
      }
      setLoading(false);
    };
    loadAudio();
  }, [song]);

  const isLoaded = status && (status as AVPlaybackStatusSuccess).isLoaded;
  const isPlaying = isLoaded ? (status as AVPlaybackStatusSuccess).isPlaying : false;
  const position = isLoaded ? (status as AVPlaybackStatusSuccess).positionMillis : 0;
  const duration = isLoaded
    ? (status as AVPlaybackStatusSuccess).durationMillis || song?.duration || 180000
    : 180000;

  const handlePlayPause = async () => {
    if (!soundRef.current) return;
    const s = await soundRef.current.getStatusAsync();
    if (!s.isLoaded) return;
    if (s.isPlaying) await soundRef.current.pauseAsync();
    else await soundRef.current.playAsync();
  };

  const handleSliderChange = async (val: number) => {
    if (soundRef.current && isLoaded) {
      try {
        await soundRef.current.setPositionAsync(val);
      } catch (error) {
        console.log('Seeking error:', error);
      }
    }
  };

  const handlePrev = () => {
    if (songIndex > 0) {
      setSongIndex(prev => prev - 1);
      setSong(parsedPlaylist[songIndex - 1]);
    }
  };

const handleNext = () => {
  if (parsedPlaylist.length <= 1) return; // chỉ 1 bài thì không chuyển

  if (isShuffle) {
    let randomIndex = songIndex;
    while (randomIndex === songIndex && parsedPlaylist.length > 1) {
      randomIndex = Math.floor(Math.random() * parsedPlaylist.length);
    }
    setSongIndex(randomIndex);
    setSong(parsedPlaylist[randomIndex]);
  } else {
    if (songIndex < parsedPlaylist.length - 1) {
      setSongIndex(prev => prev + 1);
      setSong(parsedPlaylist[songIndex + 1]);
    }
  }
};

  const handleBack = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.pauseAsync();
      } catch (err) {
        console.log('Error pausing audio:', err);
      }
    }
    router.back();
  };

  if (loading || !song)
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#FFF" />
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Image source={{ uri: song.album.coverUrl }} style={styles.coverBackground} blurRadius={5} />
      <View style={styles.overlay} />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={{ color: '#FFF', fontSize: 16 }}>{isPlaying ? 'Đang phát' : 'Tạm dừng'}</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Image source={{ uri: song.album.coverUrl }} style={styles.cover} />
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{song.title}</Text>
          <Text style={styles.artist}>{song.artist.name}</Text>
        </View>

        <View style={styles.sliderContainer}>
          <Text style={styles.time}>{getFormattedTime(position)}</Text>
          <Slider
            style={{ flex: 1 }}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            minimumTrackTintColor="#FFF"
            maximumTrackTintColor="#888"
            thumbTintColor="#FFF"
            onSlidingComplete={handleSliderChange}
          />
          <Text style={styles.time}>{getFormattedTime(duration)}</Text>
        </View>

        <View style={styles.controls}>
        <TouchableOpacity
          style={styles.smallButton}
          onPress={() => setIsShuffle(prev => !prev)}
        >
          <Ionicons
            name="shuffle-outline"
            size={28}
            color={isShuffle ? "#9747FF" : "#FFF"}
          />
        </TouchableOpacity>
          <TouchableOpacity style={styles.smallButton} onPress={handlePrev}>
            <Ionicons name="play-skip-back" size={42} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.playPauseButton} onPress={handlePlayPause}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={50} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallButton} onPress={handleNext}>
            <Ionicons name="play-skip-forward" size={42} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallButton}>
            <Ionicons name="repeat-outline" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Playingscreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  coverBackground: {
    position: 'absolute',
    width: width,
    height: height,
    resizeMode: 'cover',
    opacity: 0.6,
  },
  overlay: {
    position: 'absolute',
    width: width,
    height: height,
    backgroundColor: 'rgba(36,36,63,0.3)',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: 'center',
    zIndex: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 30,
    zIndex: 2,
  },
  cover: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 15,
    marginBottom: 10,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  artist: {
    color: '#D3D3D3',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 5,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    paddingHorizontal: 10,
  },
  time: {
    color: '#AAA',
    fontSize: 14,
    width: 45,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '90%',
    marginBottom: 20,
  },
  smallButton: {
    padding: 10,
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
