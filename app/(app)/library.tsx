// app/(app)/library.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Song = { id: string; title: string; artist: string; cover: string; liked?: boolean };
type Playlist = { id: string; name: string; cover: string; count: number };

const { width } = Dimensions.get("window");

const LIKED_SONGS: Song[] = [
  { id: "s1", title: "Levitating", artist: "Dua Lipa", cover: "https://picsum.photos/seed/s1/200", liked: true },
  { id: "s2", title: "As It Was", artist: "Harry Styles", cover: "https://picsum.photos/seed/s2/200", liked: true },
  { id: "s3", title: "Flowers", artist: "Miley Cyrus", cover: "https://picsum.photos/seed/s3/200", liked: true },
  { id: "s4", title: "Someone You Loved", artist: "Lewis Capaldi", cover: "https://picsum.photos/seed/s4/200", liked: true },
];

const PLAYLISTS: Playlist[] = [
  { id: "p1", name: "Daily Mix 1", cover: "https://picsum.photos/seed/p1/300", count: 42 },
  { id: "p2", name: "Chill Vibes", cover: "https://picsum.photos/seed/p2/300", count: 27 },
  { id: "p3", name: "Workout Pump", cover: "https://picsum.photos/seed/p3/300", count: 35 },
  { id: "p4", name: "Focus Beats", cover: "https://picsum.photos/seed/p4/300", count: 18 },
];

export default function LibraryScreen() {
  const router = useRouter();
  const [query] = useState("");

  const filteredLiked = useMemo(
    () =>
      LIKED_SONGS.filter(
        (s) =>
          (s.title + s.artist).toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bộ Sưu Tập</Text>
      </View>

      <FlatList
        data={[{ key: "liked" }, { key: "playlists" }]}
        keyExtractor={(i) => i.key}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          if (item.key === "liked") {
            return (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="heart" size={20} color="#A855F7" />
                  <Text style={styles.sectionTitle}>Bài hát yêu thích</Text>
                </View>

                <FlatList
                  data={filteredLiked}
                  keyExtractor={(s) => s.id}
                  ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: "#1f1f1f", marginVertical: 6 }} />}
                  renderItem={({ item: s }) => (
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => router.push({ pathname: "/(app)/playingscreen", params: { id: s.id } })}
                      style={styles.songItem}
                    >
                      <Image source={{ uri: s.cover }} style={styles.songImage} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.songTitle} numberOfLines={1}>{s.title}</Text>
                        <Text style={styles.songArtist} numberOfLines={1}>{s.artist}</Text>
                      </View>
                      <Ionicons name="heart" size={18} color="#A855F7" />
                    </TouchableOpacity>
                  )}
                />
              </View>
            );
          }

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
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.playlistCard}
                  >
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
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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
});

