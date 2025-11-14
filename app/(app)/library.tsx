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
  Alert,
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

type Playlist = {
  id: string;
  name: string;
  cover: string;
  count: number;
};

const DEFAULT_PLAYLIST_COVER =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMTc3M3wwfDF8c2VhcmNofDF8fG11c2ljfGVufDB8fHx8MTY5OTU1Mjk0OQ&ixlib=rb-4.0.3&q=80&w=400";

export default function LibraryScreen() {
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");

  const [showCount, setShowCount] = useState(4);
  const [showPlaylistCount, setShowPlaylistCount] = useState(4);

  // --- Fetch favorites ---
  const fetchFavorites = async () => {
    try {
      const res = await axiosInstance.get("/api/favorites");
      if (res.data.success) {
        const songsData: Song[] = res.data.songs.map((fav: any) => ({
          id: fav.id,
          title: fav.title,
          artist: { name: fav.artist.name, avatarUrl: fav.artist.avatarUrl },
          album: { title: fav.album.title, coverUrl: fav.album.coverUrl },
          audioUrl: fav.audioUrl,
        }));
        setSongs(songsData);
      }
    } catch (err: any) {
      console.error("Lỗi tải danh sách yêu thích:", err.message);
    }
  };

  const handleRemoveFavorite = (songId: string, title: string) => {
    Alert.alert(
      "Xóa bài hát",
      `Bạn có chắc muốn xóa "${title}" khỏi danh sách yêu thích?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await axiosInstance.delete(`/api/favorites/${songId}`);
              setSongs((prev) => prev.filter((s) => s.id !== songId));
            } catch (err: any) {
              console.error("Lỗi xóa bài hát:", err.message);
            }
          },
        },
      ]
    );
  };

  // --- Fetch playlists ---
  const fetchPlaylists = async () => {
    try {
      const res = await axiosInstance.get("/api/playlists");
      if (res.data.success) {
        const playlistsData: Playlist[] = await Promise.all(
          res.data.playlists.map(async (p: any) => {
            let cover = DEFAULT_PLAYLIST_COVER;
            try {
              if (p._id) {
                const songsRes = await axiosInstance.get(`/api/playlists/${p._id}/songs`);
                if (songsRes.data.success && songsRes.data.songs.length > 0) {
                  cover = songsRes.data.songs[0].album.coverUrl || DEFAULT_PLAYLIST_COVER;
                }
              }
            } catch (err) {
              console.log("Không lấy được cover bài hát đầu tiên:", err);
            }
            return {
              id: p._id,
              name: p.title || "Playlist",
              cover,
              count: p.count || 0,
            };
          })
        );
        const uniquePlaylists = Array.from(new Map(playlistsData.map(p => [p.id, p])).values());
        setPlaylists(uniquePlaylists);
      }
    } catch (err: any) {
      console.error("Lỗi tải playlist:", err.message);
      Alert.alert("Lỗi", err.message || "Không thể tải playlist");
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchFavorites(), fetchPlaylists()]);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // --- Favorites filter & show more ---
  const filteredLiked = useMemo(
    () => songs.filter((s) => (s.title + s.artist.name).toLowerCase().includes(query.toLowerCase())),
    [songs, query]
  );
  const displayedFavorites = filteredLiked.slice(0, showCount);

  const handleShowMore = () => {
    if (showCount >= filteredLiked.length) setShowCount(4);
    else setShowCount(Math.min(filteredLiked.length, showCount + 4));
  };

  // --- Playlist show more ---
  const displayedPlaylists = playlists.slice(0, showPlaylistCount);
  const handleShowMorePlaylist = () => {
    if (showPlaylistCount >= playlists.length) setShowPlaylistCount(4);
    else setShowPlaylistCount(playlists.length);
  };

  useEffect(() => {
    setShowCount(4);
    setShowPlaylistCount(4);
  }, [query, songs, playlists]);

  // --- Navigation ---
  const handleSongPress = (song: Song) => {
    router.push({ pathname: "/playingscreen", params: { id: song.id, playlist: JSON.stringify(songs) } });
  };
  const handlePlaylistPress = (playlist: Playlist) => {
    router.push({ pathname: "/playlistdetail", params: { id: playlist.id } });
  };

  // --- Delete playlist ---
  const handleDeletePlaylist = (playlist: Playlist) => {
    Alert.alert(
      "Xóa playlist",
      `Bạn có chắc muốn xóa playlist "${playlist.name}" không?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await axiosInstance.delete(`/api/playlists/${playlist.id}`);
              if (res.data.success) {
                Alert.alert("Thành công", "Playlist đã được xóa");
                fetchPlaylists();
              } else {
                Alert.alert("Lỗi", res.data.message || "Không thể xóa playlist");
              }
            } catch (err: any) {
              console.error("Lỗi xóa playlist:", err.message);
              Alert.alert("Lỗi", err.message || "Không thể xóa playlist");
            }
          },
        },
      ]
    );
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
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 10 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchAll(); }}
              tintColor="#A855F7"
            />
          }
          ListFooterComponent={() => <View style={{ height: 80 }} />}
          renderItem={({ item }) => {
            if (item.key === "liked") {
              return (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="heart-outline" size={20} color="#A855F7" />
                    <Text style={styles.sectionTitle}>Bài hát yêu thích</Text>
                  </View>
                  {filteredLiked.length === 0 ? (
                    <Text style={{ color: "#9CA3AF", marginLeft: 28 }}>Chưa có bài hát yêu thích nào</Text>
                  ) : (
                    <FlatList
                      data={displayedFavorites}
                      keyExtractor={(s, index) => `${s.id}-${index}`}
                      nestedScrollEnabled={true}
                      ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "#1f1f1f", marginVertical: 6 }} />}
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
                      ListFooterComponent={() =>
                        filteredLiked.length > 4 ? (
                          <TouchableOpacity style={{ marginTop: 10, alignSelf: "center", padding: 10 }} onPress={handleShowMore}>
                            <Text style={{ color: "#A855F7", fontWeight: "600" }}>
                              {showCount >= filteredLiked.length ? "Thu gọn" : "Xem thêm"}
                            </Text>
                          </TouchableOpacity>
                        ) : null
                      }
                    />
                  )}
                </View>
              );
            }

            // --- Playlist section with delete icon ---
            return (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="albums-outline" size={20} color="#A855F7" />
                  <Text style={styles.sectionTitle}>Playlist của bạn</Text>
                </View>
                <FlatList
                  data={displayedPlaylists}
                  numColumns={2}
                  keyExtractor={(p, index) => `${p.id}-${index}`}
                  columnWrapperStyle={{ justifyContent: "space-between" }}
                  nestedScrollEnabled={true}
                  contentContainerStyle={{ paddingTop: 4 }}
                  renderItem={({ item: p }) => (
                    <View style={styles.playlistCard}>
                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={{ flex: 1 }}
                        onPress={() => handlePlaylistPress(p)}
                      >
                        <Image source={{ uri: p.cover }} style={styles.playlistImage} />
                        <View style={{ padding: 10 }}>
                          <Text style={styles.playlistTitle} numberOfLines={1}>{p.name}</Text>
                          <Text style={styles.playlistCount}>{p.count} bài hát</Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeletePlaylist(p)}
                        style={styles.deleteIcon}
                      >
                        <Ionicons name="trash-outline" size={20} color="#F87171" />
                      </TouchableOpacity>
                    </View>
                  )}
                  ListFooterComponent={() =>
                    playlists.length > 4 ? (
                      <TouchableOpacity
                        style={{ marginTop: 10, alignSelf: "center", padding: 10 }}
                        onPress={handleShowMorePlaylist}
                      >
                        <Text style={{ color: "#A855F7", fontWeight: "600" }}>
                          {showPlaylistCount >= playlists.length ? "Thu gọn" : "Xem thêm"}
                        </Text>
                      </TouchableOpacity>
                    ) : null
                  }
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
  header: { alignItems: "center", justifyContent: "center", paddingVertical: 10, backgroundColor: "#121212", borderBottomColor: "#1F1F1F", borderBottomWidth: 0.5 },
  headerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  sectionTitle: { marginLeft: 8, color: "#FFFFFF", fontSize: 20, fontWeight: "bold" },
  songItem: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  songImage: { width: 60, height: 60, borderRadius: 6, marginRight: 12 },
  songTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  songArtist: { color: "#9CA3AF", marginTop: 2, fontSize: 14 },
  playlistCard: { width: "48%", marginBottom: 14, backgroundColor: "#1B1B1B", borderRadius: 12, overflow: "hidden" },
  playlistImage: { width: "100%", height: 140 },
  playlistTitle: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  playlistCount: { color: "#9CA3AF", marginTop: 3, fontSize: 13 },
  deleteIcon: {
    position: "absolute",
    right: 8,
    bottom: 8,
    backgroundColor: "#1B1B1B",
    padding: 6,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
