import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axiosInstance from '../../utils/axiosInstance';

import Header from '../../components/Header';
import SearchBar from '../../components/SearchBar';
import SuggestionItem from '../../components/SuggestionItem';
import AlbumItem from '../../components/AlbumItem';
import ArtistItem from '../../components/ArtistItem';
import BottomTabBar from '../../components/BottomTabBar';

type Song = { _id: string; title: string; artist: { name: string }; coverUrl: string };
type Album = { _id: string; title: string; artist: { name: string }; coverUrl: string };
type Artist = { _id: string; name: string; avatarUrl: string };

const HomeScreen: React.FC = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  const userProfileImage = require('../../assets/images/background.png');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [songsRes, albumsRes, artistsRes] = await Promise.all([
          axiosInstance.get('/api/songs'),
          axiosInstance.get('/api/albums'),
          axiosInstance.get('/api/artists'),
        ]);

        setSongs(songsRes.data);
        setAlbums(albumsRes.data);
        setArtists(artistsRes.data);
      } catch (error) {
        console.log('Fetch API error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#9747FF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Header name="Ashley Scott" profileImage={userProfileImage} />
        <SearchBar />

        {/* Gợi ý cho bạn */}
        <Text style={styles.sectionTitle}>Gợi ý cho bạn</Text>
        <FlatList
          horizontal
          data={songs}
          renderItem={({ item }) => (
            <SuggestionItem
              title={item.title}
              artist={item.artist?.name || 'Unknown'}
              image={item.coverUrl || 'https://picsum.photos/300'}
            />
          )}
          keyExtractor={(item) => item._id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listPadding}
        />

        {/* Album thịnh hành */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Album thịnh hành</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={albums}
          renderItem={({ item }) => (
            <AlbumItem
              title={item.title}
              artist={item.artist?.name || 'Unknown'}
              image={item.coverUrl || 'https://picsum.photos/200'}
            />
          )}
          keyExtractor={(item) => item._id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listPadding}
        />

        {/* Nghệ sĩ nổi bật */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nghệ sĩ nổi bật</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={artists}
          renderItem={({ item }) => (
            <ArtistItem
              name={item.name}
              image={item.avatarUrl || 'https://picsum.photos/200'}
            />
          )}
          keyExtractor={(item) => item._id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listPadding}
        />

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomTabBar />
    </SafeAreaView>
  );
};

export default HomeScreen;

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 20,
  },
  listPadding: {
    paddingRight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 15,
    paddingRight: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    color: '#A9A9A9',
    fontWeight: '500',
  },
});
