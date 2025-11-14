import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import axiosInstance from "../../utils/axiosInstance";
import { Ionicons } from "@expo/vector-icons";

type Song = {
  id: string;
  title: string;
  artist: { name: string; avatarUrl?: string };
  album: { title: string; coverUrl: string };
  audioUrl: string;
};

export default function PlaylistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [playlistName, setPlaylistName] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]); // chứa id bài hát yêu thích

  // Lấy danh sách yêu thích ban đầu
  useEffect(() => {
    fetchFavorites();
  }, []);

  useEffect(() => {
    if (!id) {
      Alert.alert("Lỗi", "Không tìm thấy playlistId");
      setLoading(false);
      return;
    }

    const fetchPlaylistSongs = async () => {
      try {
        const res = await axiosInstance.get(`/api/playlists/${id}/songs`);
        if (res.data.success) {
          setSongs(res.data.songs || []);
          setPlaylistName(res.data.playlist?.title || "Playlist");
        } else {
          Alert.alert("Lỗi", res.data.message || "Không thể tải playlist");
        }
      } catch (err: any) {
        console.error("Lỗi tải playlist:", err.message);
        Alert.alert("Lỗi", "Không thể tải playlist, thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylistSongs();
  }, [id]);

  const fetchFavorites = async () => {
    try {
      const res = await axiosInstance.get("/api/favorites");
      if (res.data.success) {
        setFavorites(res.data.songs.map((s: any) => s.id));
      }
    } catch (err) {
      console.log("Lỗi tải favorites", err);
    }
  };

    const handleToggleFavorite = async (song: Song) => {
    try {
        if (favorites.includes(song.id)) {
        // Xóa
        await axiosInstance.delete(`/api/favorites/${song.id}`);
        setFavorites((prev) => prev.filter((id) => id !== song.id));
        Alert.alert("Đã xóa", `"${song.title}" đã được xóa khỏi yêu thích`);
        } else {
        // Thêm
        await axiosInstance.post("/api/favorites", { songId: song.id });
        setFavorites((prev) => [...prev, song.id]);
        Alert.alert("Đã thêm", `"${song.title}" đã được thêm vào yêu thích`);
        }
    } catch (err: any) {
        console.error("Lỗi thêm/xóa favorites", err.response?.data || err.message);
        Alert.alert("Lỗi", "Không thể cập nhật yêu thích, thử lại sau.");
    }
    };



  const handleSongPress = (song: Song) => {
    router.push({
      pathname: "/playingscreen",
      params: { id: song.id, playlist: JSON.stringify(songs) },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A855F7" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
    <View style={styles.headerContainer}>
    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
    </TouchableOpacity>
    <Text style={styles.header}>{playlistName}</Text>
    </View>

      <FlatList
        data={songs}
        keyExtractor={(s) => s.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.songItem}
            onPress={() => handleSongPress(item)}
          >
            <Image source={{ uri: item.album.coverUrl }} style={styles.songImage} />
            <View style={{ flex: 1 }}>
              <Text style={styles.songTitle}>{item.title}</Text>
              <Text style={styles.songArtist}>{item.artist.name}</Text>
            </View>
            <TouchableOpacity
              onPress={() => handleToggleFavorite(item)}
              style={{ padding: 8 }}
            >
              <Ionicons
                name={favorites.includes(item.id) ? "heart" : "heart-outline"}
                size={22}
                color="#A855F7"
              />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>Playlist này chưa có bài hát nào</Text>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 16,
  },
  headerContainer: {
    height: 50,
    justifyContent: "center",
    marginBottom: 10,
  },
  backButton: {
    position: "absolute",
    left: 0,
    zIndex: 1,
    padding: 4,
  },
  header: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  songImage: { width: 70, height: 70, borderRadius: 8, marginRight: 14 },
  songTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  songArtist: { color: "#9CA3AF", marginTop: 4, fontSize: 14 },
  separator: { height: 1, backgroundColor: "#1f1f1f", marginVertical: 8 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  emptyText: { color: "#9CA3AF", textAlign: "center", marginTop: 40, fontSize: 16 },
});


