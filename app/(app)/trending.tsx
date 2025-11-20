import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosInstance from "../../utils/axiosInstance";

type Artist = {
  id: string;
  name: string;
  avatarUrl: string;
  rank: number;
};

type Song = {
  id: string;
  title: string;
  artist: { name: string };
  album: { coverUrl: string };
  audioUrl: string;
  rank: number;
};

const { width } = Dimensions.get("window");

export default function TrendingScreen() {
  const router = useRouter();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get('/api/deezer/trending');
        if (res.data.success) {
          // Gán rank khi map artists
          const mappedArtists: Artist[] = (res.data.artists || []).map((a: any, index: number) => ({
            id: a.id,
            name: a.name,
            avatarUrl: a.avatarUrl,
            rank: index + 1,
          }));
          setArtists(mappedArtists);

          // map tracks to Song[]
          const mappedTracks: Song[] = (res.data.tracks || []).map((t: any, i: number) => ({
            id: t.id,
            title: t.title,
            artist: { name: t.artist?.name || 'Unknown Artist' },
            album: { coverUrl: t.album?.coverUrl || t.coverUrl || 'https://placehold.co/300x300' },
            audioUrl: t.audioUrl,
            rank: i + 1,
          }));
          setSongs(mappedTracks);
        }
      } catch (err) {
        console.log('Trending fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);


  const handleSongPress = (song: Song) => {
    router.push({
      pathname: "/playingscreen",
      params: { id: song.id, playlist: JSON.stringify(songs) },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#7C3AED" style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thịnh hành</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Top Artists */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nghệ sĩ hàng đầu</Text>

          <FlatList
            horizontal
            data={artists}
            keyExtractor={(i) => i.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.artistList}
            ItemSeparatorComponent={() => <View style={{ width: 14 }} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() =>
                  router.push({
                    pathname: "/(app)/artistdetail",
                    params: {
                      artistId: item.id,
                      artistName: item.name,
                      artistImage: item.avatarUrl,
                    },
                  })
                }
                style={styles.artistCard}
              >
                <View style={styles.artistAvatarWrapper}>
                  <Image source={{ uri: item.avatarUrl }} style={styles.artistAvatar} />
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>{item.rank}</Text>
                  </View>
                </View>
                <Text numberOfLines={1} style={styles.artistName}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Top Songs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Các bài hát hàng đầu</Text>
          <View style={styles.songGrid}>
            {chunk(songs, 2).map((row) => (
              <View key={row[0].id} style={styles.songRow}>
                {row.map((song) => (
                  <TouchableOpacity
                    key={song.id}
                    style={styles.songCard}
                    onPress={() => handleSongPress(song)}
                  >
                    <View>
                      <Image source={{ uri: song.album.coverUrl }} style={styles.songImage} />
                      <View style={styles.rankCorner}>
                        <Ionicons name="trophy-outline" size={14} color="#FBBF24" />
                        <Text style={styles.rankCornerText}>{song.rank}</Text>
                      </View>
                    </View>
                    <View style={styles.songInfo}>
                      <Text numberOfLines={1} style={styles.songTitle}>
                        {song.title}
                      </Text>
                      <Text numberOfLines={1} style={styles.songArtist}>
                        {song.artist.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {row.length === 1 && <View style={{ flex: 1 }} />}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#121212" },
  header: { alignItems: "center", justifyContent: "center", paddingVertical: 10, borderBottomColor: "#1F1F1F", borderBottomWidth: 0.5 },
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
  section: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 30 },
  sectionTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold" },
  artistList: { paddingVertical: 16, paddingRight: 8 },
  artistCard: { alignItems: "center", width: 110 },
  artistAvatarWrapper: { width: 96, height: 96 },
  artistAvatar: { width: 96, height: 96, borderRadius: 48 },
  rankBadge: {
    position: "absolute",
    right: -6,
    bottom: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#121212",
  },
  rankText: { color: "#FFFFFF", fontWeight: "800", fontSize: 12 },
  artistName: { color: "#FFFFFF", marginTop: 8, fontWeight: "700", width: 100, textAlign: "center", fontSize: 14 },
  songGrid: { marginTop: 12, rowGap: 14 },
  songRow: { flexDirection: "row", columnGap: 14 },
  songCard: { flex: 1, backgroundColor: "#1B1B1B", borderRadius: 12, overflow: "hidden" },
  songImage: { width: "100%", height: (width - 16 * 2 - 14) / 2 },
  rankCorner: { position: "absolute", top: 8, left: 8, backgroundColor: "rgba(0,0,0,0.7)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, flexDirection: "row", alignItems: "center", gap: 4 },
  rankCornerText: { color: "#FBBF24", fontWeight: "800", fontSize: 12 },
  songInfo: { padding: 10 },
  songTitle: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  songArtist: { color: "#9CA3AF", marginTop: 2, fontSize: 14 },
});
