import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, StatusBar, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess , InterruptionModeIOS, InterruptionModeAndroid} from 'expo-av';
import Slider from '@react-native-community/slider';
import axiosInstance from '../../utils/axiosInstance';

const { width, height } = Dimensions.get('window');

type Song = {
  _id: string;
  title: string;
  artist: { name: string };
  coverUrl: string;
  audioUrl: string;
  duration: number;
};

const getFormattedTime = (ms: number) => {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
};

const Playingscreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

    useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
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

  // Fetch song
  useEffect(() => {
    if (!id) return;
    const fetchSong = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/api/songs/${id}`);
        setSong(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSong();
  }, [id]);

  // Load audio
    useEffect(() => {
        if (!song) return;
        const loadAudio = async () => {
            if (soundRef.current) {
            await soundRef.current.unloadAsync().catch(() => {});
            }
            const { sound } = await Audio.Sound.createAsync(
            { uri: song.audioUrl },
            { shouldPlay: true },
            (s) => setStatus(s)
            );
            soundRef.current = sound;
        };
    loadAudio();
    }, [song]);

  // Play / Pause
  const isLoaded = status && (status as AVPlaybackStatusSuccess).isLoaded;
  const isPlaying = isLoaded ? (status as AVPlaybackStatusSuccess).isPlaying : false;
  const position = isLoaded ? (status as AVPlaybackStatusSuccess).positionMillis : 0;
  const duration = isLoaded ? (status as AVPlaybackStatusSuccess).durationMillis || 1 : 1;

    const handlePlayPause = async () => {
    if (!soundRef.current) return;
    const s = await soundRef.current.getStatusAsync();
    if (!s.isLoaded) return;
    if (s.isPlaying) await soundRef.current.pauseAsync();
    else await soundRef.current.playAsync();
    setStatus(s);
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

  if (loading)
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#FFF" />
      </SafeAreaView>
    );

  if (!song)
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: '#FFF' }}>Không tìm thấy bài hát</Text>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background */}
      <Image source={{ uri: song.coverUrl }} style={styles.coverBackground} blurRadius={5} />
      <View style={styles.overlay} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#FFF" />
        </TouchableOpacity>
            <Text style={{ color: '#FFF', fontSize: 16 }}>
                {isPlaying ? 'Đang phát' : 'Tạm dừng'}
            </Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Main Content Full Screen */}
      <View style={styles.content}>
        <Image source={{ uri: song.coverUrl }} style={styles.cover} />
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{song.title}</Text>
          <Text style={styles.artist}>{song.artist.name}</Text>
        </View>

        {/* Slider */}
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

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.smallButton}>
            <Ionicons name="shuffle-outline" size={28} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallButton}>
            <Ionicons name="play-skip-back" size={42} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.playPauseButton} onPress={handlePlayPause}>
            <Ionicons name={isPlaying ? "pause" : "play"} size={50} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallButton}>
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