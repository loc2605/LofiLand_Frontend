import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState, useCallback } from "react";
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
import ArtistItem from "../../components/ArtistItem";

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

interface FollowedArtist {
  artist: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

const DEFAULT_PLAYLIST_COVER =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxMTc3M3wwfDF8c2VhcmNofDF8fG11c2ljfGVufDB8fHx8MTY5OTU1Mjk0OQ&ixlib=rb-4.0.3&q=80&w=400";

// ======= Item Components =======
const SongItem = React.memo(
  ({ song, onPress, onRemove }: { song: Song; onPress: (s: Song) => void; onRemove: () => void }) => (
    <TouchableOpacity activeOpacity={0.85} onPress={() => onPress(song)} style={styles.songItem}>
      <Image source={{ uri: song.album.coverUrl }} style={styles.songImage} />
      <View style={{ flex: 1 }}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {song.artist.name}
        </Text>
      </View>
      <TouchableOpacity onPress={onRemove} style={{ padding: 8 }}>
        <Ionicons name="heart" size={18} color="#A855F7" />
      </TouchableOpacity>
    </TouchableOpacity>
  )
);
SongItem.displayName = "SongItem";
const PlaylistCard = React.memo(
  ({
    playlist,
    onPress,
    onDelete,
  }: {
    playlist: Playlist;
    onPress: (p: Playlist) => void;
    onDelete: (p: Playlist) => void;
  }) => (
    <View style={styles.playlistCard}>
      <TouchableOpacity activeOpacity={0.85} style={{ flex: 1 }} onPress={() => onPress(playlist)}>
        <Image source={{ uri: playlist.cover }} style={styles.playlistImage} />
        <View style={{ padding: 10 }}>
          <Text style={styles.playlistTitle} numberOfLines={1}>
            {playlist.name}
          </Text>
          <Text style={styles.playlistCount}>{playlist.count} bài hát</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(playlist)} style={styles.deleteIcon}>
        <Ionicons name="trash-outline" size={20} color="#F87171" />
      </TouchableOpacity>
    </View>
  )
);
PlaylistCard.displayName = "PlaylistCard";

// ======= Main Screen =======
export default function LibraryScreen() {
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");

  const [showCount, setShowCount] = useState(4);
  const [showPlaylistCount, setShowPlaylistCount] = useState(4);

  // --- Fetch Functions ---
  const fetchFavorites = useCallback(async () => {
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
  }, []);

  const fetchPlaylists = useCallback(async () => {
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
            return { id: p._id, name: p.title || "Playlist", cover, count: p.count || 0 };
          })
        );
        setPlaylists(Array.from(new Map(playlistsData.map(p => [p.id, p])).values()));
      }
    } catch (err: any) {
      console.error("Lỗi tải playlist:", err.message);
      Alert.alert("Lỗi", err.message || "Không thể tải playlist");
    }
  }, []);

  const fetchFollowedArtists = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/api/follows/user/me");
      if (res.data.success) {
        const artistList = (res.data.data as FollowedArtist[] || []).map((f: FollowedArtist) => ({
          _id: f.artist.id,
          name: f.artist.name,
          avatarUrl: f.artist.avatarUrl,
        }));
        setArtists(artistList);
      }
    } catch (err: any) {
      console.error("Lỗi tải nghệ sĩ đang theo dõi:", err.message);
      setArtists([]);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchFavorites(), fetchPlaylists(), fetchFollowedArtists()]);
    setLoading(false);
    setRefreshing(false);
  }, [fetchFavorites, fetchPlaylists, fetchFollowedArtists]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // --- Event Handlers ---
  const handleRemoveFavorite = useCallback(
    async (songId: string, title: string) => {
      // cập nhật trước trong UI
      setSongs(prev => prev.filter(s => s.id !== songId));

      try {
        await axiosInstance.delete(`/api/favorites/${songId}`);
        fetchFavorites(); // gọi lại server để sync
      } catch (err) {
        console.error("Lỗi xóa favorite:", err);
        fetchFavorites(); // nếu lỗi vẫn sync lại
      }
    },
    [fetchFavorites]
  );

  const handleSongPress = useCallback(
    (song: Song) => router.push({ pathname: "/playingscreen", params: { id: song.id, playlist: JSON.stringify(songs) } }),
    [router, songs]
  );

  const handlePlaylistPress = useCallback((playlist: Playlist) => router.push({ pathname: "/playlistdetail", params: { id: playlist.id } }), [router]);

  const handleDeletePlaylist = useCallback((playlist: Playlist) => {
    Alert.alert(
      "Xóa playlist",
      `Bạn có chắc muốn xóa playlist "${playlist.name}" không?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => setPlaylists(prev => prev.filter(p => p.id !== playlist.id)),
        },
      ]
    );
  }, []);

  // --- Filter & Show more ---
  const filteredLiked = useMemo(() => songs.filter((s) => (s.title + s.artist.name).toLowerCase().includes(query.toLowerCase())), [songs, query]);
  const displayedFavorites = filteredLiked.slice(0, showCount);
  const displayedPlaylists = playlists.slice(0, showPlaylistCount);

  const handleShowMore = useCallback(() => {
    setShowCount(prev => (prev >= filteredLiked.length ? 4 : Math.min(filteredLiked.length, prev + 4)));
  }, [filteredLiked.length]);

  const handleShowMorePlaylist = useCallback(() => {
    setShowPlaylistCount(prev => (prev >= playlists.length ? 4 : playlists.length));
  }, [playlists.length]);

  useEffect(() => {
    setShowCount(4);
    setShowPlaylistCount(4);
  }, [query, songs, playlists]);

  // ======= Render =======
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#A855F7" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bộ Sưu Tập</Text>
      </View>

      <FlatList
        data={[{ key: "liked" }, { key: "playlists" }, { key: "artists" }]}
        keyExtractor={(i) => i.key}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} tintColor="#A855F7" />}
        ListFooterComponent={<View style={{ height: 80 }} />}
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
                    keyExtractor={(s) => s.id}
                    extraData={displayedFavorites}
                    nestedScrollEnabled
                    ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "#1f1f1f", marginVertical: 6 }} />}
                    renderItem={({ item: s }) => <SongItem song={s} onPress={handleSongPress} onRemove={() => handleRemoveFavorite(s.id, s.title)} />}
                    ListFooterComponent={() =>
                      filteredLiked.length > 4 ? (
                        <TouchableOpacity style={{ alignSelf: "center"}} onPress={handleShowMore}>
                          <Text style={{ color: "#A855F7", fontWeight: "600" }}>{showCount >= filteredLiked.length ? "Thu gọn" : "Xem thêm"}</Text>
                        </TouchableOpacity>
                      ) : null
                    }
                  />
                )}
              </View>
            );
          }

          if (item.key === "playlists") {
            return (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="albums-outline" size={20} color="#A855F7" />
                  <Text style={styles.sectionTitle}>Playlist của bạn</Text>
                </View>
                <FlatList
                  data={displayedPlaylists}
                  extraData={displayedPlaylists}
                  numColumns={2}
                  keyExtractor={(p) => p.id}
                  columnWrapperStyle={{ justifyContent: "space-between" }}
                  nestedScrollEnabled
                  contentContainerStyle={{ paddingTop: 4 }}
                  renderItem={({ item: p }) => <PlaylistCard playlist={p} onPress={handlePlaylistPress} onDelete={handleDeletePlaylist} />}
                  ListFooterComponent={() =>
                    playlists.length > 4 ? (
                      <TouchableOpacity style={{ alignSelf: "center", padding: 10 }} onPress={handleShowMorePlaylist}>
                        <Text style={{ color: "#A855F7", fontWeight: "600" }}>{showPlaylistCount >= playlists.length ? "Thu gọn" : "Xem thêm"}</Text>
                      </TouchableOpacity>
                    ) : null
                  }
                />
              </View>
            );
          }

          // Artists
          return (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person-circle-outline" size={22} color="#A855F7" />
                <Text style={styles.sectionTitle}>Nghệ sĩ đang theo dõi</Text>
              </View>
              {artists.length === 0 ? (
                <Text style={{ color: "#9CA3AF", marginLeft: 28 }}>Bạn chưa theo dõi nghệ sĩ nào</Text>
              ) : (
                <FlatList
                  data={artists}
                  keyExtractor={(a) => a._id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item: a }) => (
                    <View style={{ alignItems: "center", marginRight: 16 }}>
                      <ArtistItem
                        id={a._id}
                        name={a.name}
                        image={a.avatarUrl || DEFAULT_PLAYLIST_COVER}
                        onPress={() =>
                          router.push({
                            pathname: '/artistdetail',
                            params: {
                              artistId: a._id,
                              artistName: a.name,
                              artistImage: a.avatarUrl || DEFAULT_PLAYLIST_COVER,
                            },
                          })
                        }
                        onUnfollow={() => setArtists(prev => prev.filter(artist => artist._id !== a._id))}
                      />
                    </View>
                  )}
                />
              )}
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "#121212",
    borderBottomColor: "#1F1F1F",
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    marginLeft: 8,
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  songImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 12,
  },
  songTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  songArtist: {
    color: "#9CA3AF",
    marginTop: 2,
    fontSize: 14,
  },
  playlistCard: {
    width: "48%",
    marginBottom: 14,
    backgroundColor: "#1B1B1B",
    borderRadius: 12,
    overflow: "hidden",
  },
  playlistImage: {
    width: "100%",
    height: 140,
  },
  playlistTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  playlistCount: {
    color: "#9CA3AF",
    marginTop: 3,
    fontSize: 13,
  },
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
