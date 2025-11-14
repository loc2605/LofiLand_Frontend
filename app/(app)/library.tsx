import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosInstance from "../../utils/axiosInstance";

type Song = {
  id: string;
  title: string;
  artist: { name: string; avatarUrl?: string };
  album: { title: string; coverUrl: string };
  audioUrl: string;
};

type Playlist = { id: string; name: string; cover: string; count: number };

const PLAYLISTS: Playlist[] = [
  { id: "p1", name: "Daily Mix 1", cover: "https://picsum.photos/seed/p1/300", count: 42 },
  { id: "p2", name: "Chill Vibes", cover: "https://picsum.photos/seed/p2/300", count: 27 },
  { id: "p3", name: "Workout Pump", cover: "https://picsum.photos/seed/p3/300", count: 35 },
  { id: "p4", name: "Focus Beats", cover: "https://picsum.photos/seed/p4/300", count: 18 },
];

export default function LibraryScreen() {
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [showCount, setShowCount] = useState(4); // hiển thị ban đầu 4 bài

  const fetchFavorites = async () => {
    try {
      const res = await axiosInstance.get("/api/favorites");
      if (res.data.success) {
        const songsData: Song[] = res.data.songs.map((fav: any) => ({
          id: fav.id,
          title: fav.title,
          artist: {
            name: fav.artist.name,
            avatarUrl: fav.artist.avatarUrl,
          },
          album: {
            title: fav.album.title,
            coverUrl: fav.album.coverUrl,
          },
          audioUrl: fav.audioUrl,
        }));
        setSongs(songsData);
      }
    } catch (err: any) {
      console.error("Lỗi tải danh sách yêu thích:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRemoveFavorite = (songId: string, title: string) => {
    Alert.alert(
      'Xóa bài hát',
      `Bạn có chắc muốn xóa "${title}" khỏi danh sách yêu thích?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await axiosInstance.delete(`/api/favorites/${songId}`);
              setSongs(prev => prev.filter(s => s.id !== songId));
            } catch (err: any) {
              console.error("Lỗi xóa bài hát:", err.message);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // lọc bài hát theo query
  const filteredLiked = useMemo(
    () =>
      songs.filter((s) =>
        (s.title + s.artist.name).toLowerCase().includes(query.toLowerCase())
      ),
    [songs, query]
  );

  const displayedFavorites = filteredLiked.slice(0, showCount);

  const handleShowMore = () => {
    if (showCount >= filteredLiked.length) {
      setShowCount(4);
    } else {
      setShowCount(prev => Math.min(prev + 4, filteredLiked.length));
    }
  };

  useEffect(() => {
    setShowCount(4); // reset khi query hoặc refresh
  }, [query, songs]);

  const handleSongPress = (song: Song) => {
    router.push({ pathname: '/playingscreen', params: { id: song.id, playlist: JSON.stringify(songs) } });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bộ Sưu Tập</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color="#A855F7" size="large" />
        </View>
      ) : (
        <FlatList
          data={[{ key: "liked" }, { key: "playlists" }]}
          keyExtractor={(i) => i.key}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchFavorites();
              }}
              tintColor="#A855F7"
            />
          }
          renderItem={({ item }) => {
            if (item.key === "liked") {
              return (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="heart" size={20} color="#A855F7" />
                    <Text style={styles.sectionTitle}>Bài hát yêu thích</Text>
                  </View>

                  {filteredLiked.length === 0 ? (
                    <Text style={{ color: "#9CA3AF", marginLeft: 28 }}>
                      Chưa có bài hát yêu thích nào
                    </Text>
                  ) : (
                    <>
                      <FlatList
                        data={displayedFavorites}
                        keyExtractor={(s) => s.id}
                        ItemSeparatorComponent={() => (
                          <View style={{ height: 1, backgroundColor: "#1f1f1f", marginVertical: 6 }} />
                        )}
                        renderItem={({ item: s }) => (
                          <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => handleSongPress(s)}
                            style={styles.songItem}
                          >
                            <Image source={{ uri: s.album.coverUrl }} style={styles.songImage} />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.songTitle} numberOfLines={1}>{s.title}</Text>
                              <Text style={styles.songArtist} numberOfLines={1}>{s.artist.name}</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleRemoveFavorite(s.id, s.title)} style={{ padding: 8 }}>
                              <Ionicons name="heart" size={18} color="#A855F7" />
                            </TouchableOpacity>
                          </TouchableOpacity>
                        )}
                      />

                      {filteredLiked.length > 4 && (
                        <TouchableOpacity
                          style={{ marginTop: 10, alignSelf: "center", padding: 10 }}
                          onPress={handleShowMore}
                        >
                          <Text style={{ color: "#A855F7", fontWeight: "600" }}>
                            {showCount >= filteredLiked.length ? "Thu gọn" : "Xem thêm"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
              );
            }

            // --- Playlist section ---
            return (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="albums-outline" size={20} color="#60A5FA" />
                  <Text style={styles.sectionTitle}>Playlist của bạn</Text>
                </View>

                <FlatList
                  data={PLAYLISTS}
                  numColumns={2}
                  keyExtractor={(p) => p.id}
                  columnWrapperStyle={{ justifyContent: "space-between" }}
                  contentContainerStyle={{ paddingTop: 4 }}
                  renderItem={({ item: p }) => (
                    <TouchableOpacity activeOpacity={0.85} style={styles.playlistCard}>
                      <Image source={{ uri: p.cover }} style={styles.playlistImage} />
                      <View style={{ padding: 10 }}>
                        <Text style={styles.playlistTitle} numberOfLines={1}>{p.name}</Text>
                        <Text style={styles.playlistCount}>{p.count} bài hát</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#121212" },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "#121212",
    borderBottomColor: "#1F1F1F",
    borderBottomWidth: 0.5,
  },
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  sectionTitle: { marginLeft: 8, color: "#FFFFFF", fontSize: 20, fontWeight: "bold" },
  songItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  songImage: { width: 60, height: 60, borderRadius: 6, marginRight: 12 },
  songTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  songArtist: { color: "#9CA3AF", marginTop: 2, fontSize: 14 },
  playlistCard: {
    width: "48%",
    marginBottom: 14,
    backgroundColor: "#1B1B1B",
    borderRadius: 12,
    overflow: "hidden",
  },
  playlistImage: { width: "100%", height: 140 },
  playlistTitle: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  playlistCount: { color: "#9CA3AF", marginTop: 3, fontSize: 13 },
});
